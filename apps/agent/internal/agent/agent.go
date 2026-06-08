// Package agent wires the configured inputs to the Logify SDK: it fans events
// from every source into a parse-and-ship pipeline and manages graceful
// startup/shutdown and offset checkpointing.
package agent

import (
	"context"
	"fmt"
	"log/slog"
	"path/filepath"
	"sync"
	"time"

	logify "github.com/indalyadav56/logify/sdks/go"

	"github.com/indalyadav56/logify/apps/agent/internal/config"
	"github.com/indalyadav56/logify/apps/agent/internal/input"
	"github.com/indalyadav56/logify/apps/agent/internal/parse"
	"github.com/indalyadav56/logify/apps/agent/internal/registry"
)

const (
	registryFlushInterval = 5 * time.Second
	shutdownDrainTimeout  = 15 * time.Second
	perSendTimeout        = 5 * time.Second
)

// Agent owns the running pipeline for one configuration.
type Agent struct {
	cfg    *config.Config
	client *logify.Client
	reg    *registry.Registry
	inputs []input.Input
	log    *slog.Logger
}

// New constructs an Agent from a validated config: it builds the SDK client,
// opens the offset registry, and instantiates every configured input.
func New(cfg *config.Config, log *slog.Logger) (*Agent, error) {
	reg, err := registry.Open(cfg.Registry)
	if err != nil {
		return nil, fmt.Errorf("open registry: %w", err)
	}

	client, err := newClient(cfg, log)
	if err != nil {
		return nil, err
	}

	a := &Agent{cfg: cfg, client: client, reg: reg, log: log}
	if err := a.buildInputs(); err != nil {
		return nil, err
	}
	return a, nil
}

func newClient(cfg *config.Config, log *slog.Logger) (*logify.Client, error) {
	opts := []logify.Option{
		logify.WithBaseURL(cfg.Backend.URL),
		logify.WithIngestPath(cfg.Backend.IngestPath),
		logify.WithTimeout(cfg.Backend.Timeout.Std()),
		logify.WithUserAgent("logify-agent"),
		logify.WithSource(cfg.Defaults.Source),
		logify.WithAsync(cfg.Delivery.Async),
		logify.WithBufferSize(cfg.Delivery.BufferSize),
		logify.WithWorkers(cfg.Delivery.Workers),
		logify.WithErrorHandler(func(e logify.Entry, err error) {
			log.Warn("delivery failed", "level", string(e.Level), "err", err)
		}),
	}
	if cfg.Backend.APIKey != "" {
		opts = append(opts, logify.WithAPIKey(cfg.Backend.APIKey))
	}
	if cfg.Defaults.ProjectID != "" {
		opts = append(opts, logify.WithProjectID(cfg.Defaults.ProjectID))
	}
	if cfg.Defaults.Service != "" {
		opts = append(opts, logify.WithService(cfg.Defaults.Service))
	}
	if cfg.Defaults.Namespace != "" {
		opts = append(opts, logify.WithNamespace(cfg.Defaults.Namespace))
	}
	if cfg.Defaults.Environment != "" {
		opts = append(opts, logify.WithEnvironment(cfg.Defaults.Environment))
	}
	if len(cfg.Defaults.Tags) > 0 {
		opts = append(opts, logify.WithDefaultTags(cfg.Defaults.Tags))
	}
	return logify.New(opts...)
}

func (a *Agent) buildInputs() error {
	cursorDir := filepath.Dir(a.cfg.Registry)
	for _, in := range a.cfg.Inputs {
		dec := input.DecorationFromInput(in, a.cfg.Defaults)
		switch in.Type {
		case "file":
			a.inputs = append(a.inputs, input.NewFileInput(in, dec, a.reg, a.log))
		case "stdin":
			a.inputs = append(a.inputs, input.NewStdinInput(in.Name, dec, nil))
		case "journald":
			a.inputs = append(a.inputs, input.NewJournaldInput(in.Name, in.Units, dec, cursorDir, a.log))
		default:
			return fmt.Errorf("unsupported input type %q", in.Type)
		}
	}
	return nil
}

// Run starts every input and the shipping pipeline, blocking until ctx is
// cancelled, then drains buffered logs and flushes offsets before returning.
func (a *Agent) Run(ctx context.Context) error {
	events := make(chan input.Event, a.cfg.Delivery.BufferSize)

	// Pipeline consumers: parse each event and hand it to the SDK.
	var consumers sync.WaitGroup
	workers := a.cfg.Delivery.Workers
	if workers < 2 {
		workers = 2
	}
	for i := 0; i < workers; i++ {
		consumers.Add(1)
		go func() {
			defer consumers.Done()
			a.consume(events)
		}()
	}

	// Periodic offset checkpointing.
	flushStop := make(chan struct{})
	var flushWg sync.WaitGroup
	flushWg.Add(1)
	go func() {
		defer flushWg.Done()
		a.flushLoop(flushStop)
	}()

	// Start inputs.
	var inputs sync.WaitGroup
	for _, in := range a.inputs {
		inputs.Add(1)
		go func(in input.Input) {
			defer inputs.Done()
			a.log.Info("starting input", "input", in.Name())
			if err := in.Run(ctx, events); err != nil && ctx.Err() == nil {
				a.log.Error("input stopped unexpectedly", "input", in.Name(), "err", err)
			}
		}(in)
	}

	inputs.Wait() // returns once ctx is cancelled and every input has exited
	close(events) // no more events will be produced
	consumers.Wait()

	close(flushStop)
	flushWg.Wait()

	a.log.Info("draining buffered logs")
	drainCtx, cancel := context.WithTimeout(context.Background(), shutdownDrainTimeout)
	defer cancel()
	if err := a.client.Close(drainCtx); err != nil {
		a.log.Warn("drain incomplete", "err", err)
	}
	if err := a.reg.Flush(); err != nil {
		a.log.Warn("final registry flush failed", "err", err)
	}
	return nil
}

func (a *Agent) consume(events <-chan input.Event) {
	for ev := range events {
		entry := parse.ToEntry(ev)
		// Detached, bounded context so events still buffer into the SDK during
		// shutdown without blocking forever on a full queue.
		ctx, cancel := context.WithTimeout(context.Background(), perSendTimeout)
		if err := a.client.Send(ctx, entry); err != nil {
			a.log.Debug("dropped event", "input", ev.Input, "err", err)
		}
		cancel()
	}
}

func (a *Agent) flushLoop(stop <-chan struct{}) {
	t := time.NewTicker(registryFlushInterval)
	defer t.Stop()
	for {
		select {
		case <-stop:
			return
		case <-t.C:
			if err := a.reg.Flush(); err != nil {
				a.log.Warn("registry flush failed", "err", err)
			}
		}
	}
}
