// Package input provides log sources (file tail, stdin, journald) that emit
// raw Events onto a shared channel for the agent pipeline to parse and ship.
package input

import (
	"context"
	"time"

	"github.com/indalyadav56/logify/apps/agent/internal/config"
)

// Decoration carries the per-input label overrides applied to every Event the
// input produces. Empty fields fall back to the client-level defaults in the SDK.
type Decoration struct {
	Service     string
	Namespace   string
	Environment string
	Source      string
	ProjectID   string
	DefaultLevel string // level to use when none can be parsed from the line
	Tags        map[string]string
	JSON        bool // parse each line as a JSON object
}

// DecorationFromInput resolves an InputConfig (with global defaults) into a
// Decoration. Per-input values win; empty ones fall back to defaults.
func DecorationFromInput(in config.InputConfig, def config.Defaults) Decoration {
	pick := func(a, b string) string {
		if a != "" {
			return a
		}
		return b
	}
	return Decoration{
		Service:      pick(in.Service, def.Service),
		Namespace:    pick(in.Namespace, def.Namespace),
		Environment:  pick(in.Environment, def.Environment),
		Source:       pick(in.Source, def.Source),
		ProjectID:    def.ProjectID,
		DefaultLevel: in.Level,
		Tags:         in.Tags,
		JSON:         in.JSON,
	}
}

// Event is a single raw record emitted by an input.
type Event struct {
	Input      string         // name of the producing input
	Line       string         // raw text (possibly multiple joined lines)
	Time       time.Time      // event time if the source knows it (else zero)
	Fields     map[string]any // pre-structured fields (e.g. journald); optional
	Decoration Decoration     // labels to apply to the resulting log
}

// Input is a long-running log source. Run blocks until ctx is cancelled,
// emitting Events on out. Implementations must return promptly on cancellation.
type Input interface {
	// Name identifies the input in logs and the offset registry.
	Name() string
	// Run streams events until ctx is done. It should return ctx.Err() (or nil)
	// on shutdown and only return a non-context error on unrecoverable failure.
	Run(ctx context.Context, out chan<- Event) error
}
