package logify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"
)

type LogLevel string

const (
	LevelTrace   LogLevel = "TRACE"
	LevelDebug   LogLevel = "DEBUG"
	LevelInfo    LogLevel = "INFO"
	LevelWarning LogLevel = "WARNING"
	LevelError   LogLevel = "ERROR"
)

type ErrorHandler func(error)

type Config struct {
	BaseURL      string
	ServiceName  string
	HTTPTimeout  time.Duration
	ErrorHandler ErrorHandler
}

type Client struct {
	config     Config
	httpClient *http.Client
	mu         sync.RWMutex
}

type LogEntry struct {
	Service   string                 `json:"service"`
	Level     LogLevel               `json:"level"`
	Message   string                 `json:"message"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
}

func defaultErrorHandler(err error) {
	log.Printf("logify error: %v", err)
}

func NewClient(cfg Config) *Client {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "http://localhost:8080"
	}
	if cfg.ServiceName == "" {
		cfg.ServiceName = "unknown-service"
	}
	if cfg.HTTPTimeout == 0 {
		cfg.HTTPTimeout = 5 * time.Second
	}
	if cfg.ErrorHandler == nil {
		cfg.ErrorHandler = defaultErrorHandler
	}

	return &Client{
		config: cfg,
		httpClient: &http.Client{
			Timeout: cfg.HTTPTimeout,
		},
	}
}

func (c *Client) log(ctx context.Context, level LogLevel, message string, metadata map[string]interface{}) {
	entry := LogEntry{
		Service:   c.config.ServiceName,
		Level:     level,
		Message:   message,
		Metadata:  metadata,
		Timestamp: time.Now().UTC(),
	}

	payload, err := json.Marshal(entry)
	if err != nil {
		c.handleError(fmt.Errorf("failed to marshal log entry: %w", err))
		return
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/v1/logs", c.config.BaseURL), bytes.NewBuffer(payload))
	if err != nil {
		c.handleError(fmt.Errorf("failed to create request: %w", err))
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		c.handleError(fmt.Errorf("failed to send log: %w", err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		c.handleError(fmt.Errorf("logging server returned error status %d: %s", resp.StatusCode, string(body)))
		return
	}
}

// handleError processes errors using the configured error handler
func (c *Client) handleError(err error) {
	c.mu.RLock()
	handler := c.config.ErrorHandler
	c.mu.RUnlock()
	handler(err)
}

// SetErrorHandler allows changing the error handler at runtime
func (c *Client) SetErrorHandler(handler ErrorHandler) {
	c.mu.Lock()
	c.config.ErrorHandler = handler
	c.mu.Unlock()
}

// Info logs a message with INFO level
func (c *Client) Info(ctx context.Context, message string, metadata map[string]interface{}) {
	c.log(ctx, LevelInfo, message, metadata)
}

// Error logs a message with ERROR level
func (c *Client) Error(ctx context.Context, message string, metadata map[string]interface{}) {
	c.log(ctx, LevelError, message, metadata)
}

// Warning logs a message with WARNING level
func (c *Client) Warning(ctx context.Context, message string, metadata map[string]interface{}) {
	c.log(ctx, LevelWarning, message, metadata)
}

// Debug logs a message with DEBUG level
func (c *Client) Debug(ctx context.Context, message string, metadata map[string]interface{}) {
	c.log(ctx, LevelDebug, message, metadata)
}

// Trace logs a message with TRACE level
func (c *Client) Trace(ctx context.Context, message string, metadata map[string]interface{}) {
	c.log(ctx, LevelTrace, message, metadata)
}
