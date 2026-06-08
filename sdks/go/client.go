package logify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

// Client sends logs to a Logify backend. It is safe for concurrent use.
//
// Construct one with New, reuse it for the lifetime of your application, and
// call Close on shutdown (required when async delivery is enabled).
type Client struct {
	cfg      config
	endpoint string

	// async machinery (nil/zero when async is disabled)
	queue chan Entry
	wg    sync.WaitGroup

	// mu guards closed and serialises enqueue against Close so we never send
	// on a closed queue. Senders take RLock; Close takes the write lock.
	mu     sync.RWMutex
	closed bool
}

// New creates a Client. WithBaseURL is required.
func New(opts ...Option) (*Client, error) {
	cfg := config{
		ingestPath:    defaultIngestPath,
		bufferSize:    defaultBufferSize,
		workers:       defaultWorkers,
		flushInterval: defaultFlushInterval,
		userAgent:     "logify-go",
		defaults:      Entry{Source: defaultSource},
	}
	for _, opt := range opts {
		opt(&cfg)
	}

	if strings.TrimSpace(cfg.baseURL) == "" {
		return nil, fmt.Errorf("logify: base URL is required (use WithBaseURL)")
	}
	if cfg.httpClient == nil {
		cfg.httpClient = &http.Client{Timeout: defaultTimeout}
	}
	if cfg.defaults.Hostname == "" {
		if h, err := os.Hostname(); err == nil {
			cfg.defaults.Hostname = h
		}
	}
	if cfg.bufferSize <= 0 {
		cfg.bufferSize = defaultBufferSize
	}
	if cfg.workers <= 0 {
		cfg.workers = defaultWorkers
	}

	c := &Client{
		cfg:      cfg,
		endpoint: strings.TrimRight(cfg.baseURL, "/") + "/" + strings.TrimLeft(cfg.ingestPath, "/"),
	}

	if cfg.async {
		c.queue = make(chan Entry, cfg.bufferSize)
		for i := 0; i < cfg.workers; i++ {
			c.wg.Add(1)
			go c.worker()
		}
	}

	return c, nil
}

// Send delivers a single entry.
//
// In synchronous mode it performs the HTTP request and returns its result.
// In async mode it blocks until the entry is buffered (or ctx is done) and
// returns nil; delivery happens in the background.
func (c *Client) Send(ctx context.Context, entry Entry) error {
	entry = c.applyDefaults(entry)
	if entry.Level == "" {
		return fmt.Errorf("logify: entry level is required")
	}

	if !c.cfg.async {
		return c.send(ctx, entry)
	}

	c.mu.RLock()
	defer c.mu.RUnlock()
	if c.closed {
		return ErrClosed
	}
	select {
	case c.queue <- entry:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// TrySend buffers an entry without blocking (async mode only). It returns
// ErrBufferFull if there is no free slot, or ErrClosed if the client is closed.
// In synchronous mode it behaves like Send with a background context.
func (c *Client) TrySend(entry Entry) error {
	entry = c.applyDefaults(entry)
	if entry.Level == "" {
		return fmt.Errorf("logify: entry level is required")
	}
	if !c.cfg.async {
		return c.send(context.Background(), entry)
	}
	c.mu.RLock()
	defer c.mu.RUnlock()
	if c.closed {
		return ErrClosed
	}
	select {
	case c.queue <- entry:
		return nil
	default:
		return ErrBufferFull
	}
}

// Log builds an entry from a level, message and options, then sends it.
func (c *Client) Log(ctx context.Context, level Level, message string, opts ...EntryOption) error {
	entry := Entry{Level: level, Message: message}
	for _, opt := range opts {
		opt(&entry)
	}
	return c.Send(ctx, entry)
}

// Trace logs at TRACE level.
func (c *Client) Trace(ctx context.Context, message string, opts ...EntryOption) error {
	return c.Log(ctx, LevelTrace, message, opts...)
}

// Debug logs at DEBUG level.
func (c *Client) Debug(ctx context.Context, message string, opts ...EntryOption) error {
	return c.Log(ctx, LevelDebug, message, opts...)
}

// Info logs at INFO level.
func (c *Client) Info(ctx context.Context, message string, opts ...EntryOption) error {
	return c.Log(ctx, LevelInfo, message, opts...)
}

// Warn logs at WARN level.
func (c *Client) Warn(ctx context.Context, message string, opts ...EntryOption) error {
	return c.Log(ctx, LevelWarn, message, opts...)
}

// Error logs at ERROR level.
func (c *Client) Error(ctx context.Context, message string, opts ...EntryOption) error {
	return c.Log(ctx, LevelError, message, opts...)
}

// Fatal logs at FATAL level.
func (c *Client) Fatal(ctx context.Context, message string, opts ...EntryOption) error {
	return c.Log(ctx, LevelFatal, message, opts...)
}

// Close stops async workers and drains buffered logs. It returns when the
// buffer is empty or ctx is done. Safe to call multiple times; a no-op in
// synchronous mode.
func (c *Client) Close(ctx context.Context) error {
	if !c.cfg.async {
		return nil
	}

	c.mu.Lock()
	if c.closed {
		c.mu.Unlock()
		return nil
	}
	c.closed = true
	close(c.queue)
	c.mu.Unlock()

	done := make(chan struct{})
	go func() {
		c.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// applyDefaults fills empty entry fields from the client's configured defaults.
func (c *Client) applyDefaults(e Entry) Entry {
	d := c.cfg.defaults
	if e.ProjectID == "" {
		e.ProjectID = d.ProjectID
	}
	if e.Service == "" {
		e.Service = d.Service
	}
	if e.Namespace == "" {
		e.Namespace = d.Namespace
	}
	if e.Environment == "" {
		e.Environment = d.Environment
	}
	if e.Hostname == "" {
		e.Hostname = d.Hostname
	}
	if e.Source == "" {
		e.Source = d.Source
	}
	if e.Timestamp.IsZero() {
		e.Timestamp = time.Now()
	}
	if len(d.Tags) > 0 {
		merged := make(map[string]string, len(d.Tags)+len(e.Tags))
		for k, v := range d.Tags {
			merged[k] = v
		}
		for k, v := range e.Tags { // entry tags win
			merged[k] = v
		}
		e.Tags = merged
	}
	return e
}

// worker consumes buffered entries until the queue is closed and drained.
func (c *Client) worker() {
	defer c.wg.Done()
	for entry := range c.queue {
		// Per-send timeout independent of any request context, since the
		// original caller has long returned.
		ctx, cancel := context.WithTimeout(context.Background(), c.cfg.httpClient.Timeout)
		err := c.send(ctx, entry)
		cancel()
		if err != nil && c.cfg.onError != nil {
			c.cfg.onError(entry, err)
		}
	}
}

// send performs the actual HTTP POST for a fully-resolved entry.
func (c *Client) send(ctx context.Context, entry Entry) error {
	body, err := json.Marshal(entry.toWire())
	if err != nil {
		return fmt.Errorf("logify: marshal entry: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("logify: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if c.cfg.userAgent != "" {
		req.Header.Set("User-Agent", c.cfg.userAgent)
	}
	if c.cfg.apiKey != "" {
		req.Header.Set("X-API-Key", c.cfg.apiKey)
	}

	resp, err := c.cfg.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("logify: send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		// Read a bounded amount of the body for diagnostics.
		snippet, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return &APIError{StatusCode: resp.StatusCode, Body: strings.TrimSpace(string(snippet))}
	}

	// Drain so the connection can be reused.
	_, _ = io.Copy(io.Discard, resp.Body)
	return nil
}
