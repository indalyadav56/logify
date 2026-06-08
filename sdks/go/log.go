package logify

import "time"

// Level is the severity of a log entry. The backend stores it verbatim, so any
// string is accepted; the constants below cover the common cases.
type Level string

const (
	LevelTrace Level = "TRACE"
	LevelDebug Level = "DEBUG"
	LevelInfo  Level = "INFO"
	LevelWarn  Level = "WARN"
	LevelError Level = "ERROR"
	LevelFatal Level = "FATAL"
)

// Entry is a single log record to be ingested.
//
// Level is the only field the backend requires. Fields left at their zero value
// are filled in from the client's defaults (see WithService, WithEnvironment,
// ...) when the entry is sent. If Timestamp is the zero time, the current time
// is used.
type Entry struct {
	// ProjectID associates the log with a project. Optional.
	ProjectID string
	// Level is the severity (required).
	Level Level
	// Timestamp is when the event occurred. Defaults to time.Now().
	Timestamp time.Time
	// Message is the human-readable log message.
	Message string
	// Service is the name of the emitting service.
	Service string
	// Namespace is a logical grouping within a service (wire: service_namespace).
	Namespace string
	// Hostname is the host the log originated from.
	Hostname string
	// Environment is the deployment environment, e.g. "production".
	Environment string
	// TraceID / SpanID tie the log to a distributed trace.
	TraceID string
	SpanID  string
	// RequestID correlates logs belonging to the same request.
	RequestID string
	// UserID is the end user associated with the event.
	UserID string
	// Source identifies the log producer, e.g. "golang".
	Source string
	// Tags are low-cardinality string labels.
	Tags map[string]string
	// Metadata is arbitrary structured context.
	Metadata map[string]any
}

// wireEntry is the JSON shape expected by POST /v1/logs. It mirrors the
// backend's CreateLogRequest exactly.
type wireEntry struct {
	ProjectID   string            `json:"project_id,omitempty"`
	Level       string            `json:"level"`
	Timestamp   string            `json:"timestamp,omitempty"`
	Service     string            `json:"service,omitempty"`
	Namespace   string            `json:"service_namespace,omitempty"`
	Hostname    string            `json:"hostname,omitempty"`
	Environment string            `json:"environment,omitempty"`
	Message     string            `json:"message,omitempty"`
	TraceID     string            `json:"trace_id,omitempty"`
	SpanID      string            `json:"span_id,omitempty"`
	RequestID   string            `json:"request_id,omitempty"`
	UserID      string            `json:"user_id,omitempty"`
	Source      string            `json:"source,omitempty"`
	Tags        map[string]string `json:"tags,omitempty"`
	Metadata    map[string]any    `json:"metadata,omitempty"`
}

func (e Entry) toWire() wireEntry {
	w := wireEntry{
		ProjectID:   e.ProjectID,
		Level:       string(e.Level),
		Service:     e.Service,
		Namespace:   e.Namespace,
		Hostname:    e.Hostname,
		Environment: e.Environment,
		Message:     e.Message,
		TraceID:     e.TraceID,
		SpanID:      e.SpanID,
		RequestID:   e.RequestID,
		UserID:      e.UserID,
		Source:      e.Source,
		Tags:        e.Tags,
		Metadata:    e.Metadata,
	}
	if !e.Timestamp.IsZero() {
		w.Timestamp = e.Timestamp.UTC().Format(time.RFC3339Nano)
	}
	return w
}

// EntryOption customises a single Entry built by the convenience helpers
// (Log, Debug, Info, Warn, Error, ...).
type EntryOption func(*Entry)

// WithEntryProjectID sets the entry's project ID.
func WithEntryProjectID(id string) EntryOption {
	return func(e *Entry) { e.ProjectID = id }
}

// WithEntryTimestamp sets the entry's timestamp.
func WithEntryTimestamp(t time.Time) EntryOption {
	return func(e *Entry) { e.Timestamp = t }
}

// WithEntryService overrides the service name for this entry.
func WithEntryService(s string) EntryOption {
	return func(e *Entry) { e.Service = s }
}

// WithEntryNamespace sets the entry's namespace (service_namespace).
func WithEntryNamespace(ns string) EntryOption {
	return func(e *Entry) { e.Namespace = ns }
}

// WithEntryEnvironment overrides the environment for this entry.
func WithEntryEnvironment(env string) EntryOption {
	return func(e *Entry) { e.Environment = env }
}

// WithEntryHostname sets the entry's hostname.
func WithEntryHostname(h string) EntryOption {
	return func(e *Entry) { e.Hostname = h }
}

// WithEntryTrace sets the trace and span IDs for this entry.
func WithEntryTrace(traceID, spanID string) EntryOption {
	return func(e *Entry) {
		e.TraceID = traceID
		e.SpanID = spanID
	}
}

// WithEntryRequestID sets the request correlation ID.
func WithEntryRequestID(id string) EntryOption {
	return func(e *Entry) { e.RequestID = id }
}

// WithEntryUserID sets the associated end-user ID.
func WithEntryUserID(id string) EntryOption {
	return func(e *Entry) { e.UserID = id }
}

// WithEntrySource overrides the source for this entry.
func WithEntrySource(s string) EntryOption {
	return func(e *Entry) { e.Source = s }
}

// WithEntryTag adds a single tag, allocating the map if needed.
func WithEntryTag(key, value string) EntryOption {
	return func(e *Entry) {
		if e.Tags == nil {
			e.Tags = make(map[string]string)
		}
		e.Tags[key] = value
	}
}

// WithEntryTags merges the given tags into the entry.
func WithEntryTags(tags map[string]string) EntryOption {
	return func(e *Entry) {
		if e.Tags == nil {
			e.Tags = make(map[string]string, len(tags))
		}
		for k, v := range tags {
			e.Tags[k] = v
		}
	}
}

// WithEntryMetadataValue adds a single metadata key/value.
func WithEntryMetadataValue(key string, value any) EntryOption {
	return func(e *Entry) {
		if e.Metadata == nil {
			e.Metadata = make(map[string]any)
		}
		e.Metadata[key] = value
	}
}

// WithEntryMetadata merges the given metadata into the entry.
func WithEntryMetadata(meta map[string]any) EntryOption {
	return func(e *Entry) {
		if e.Metadata == nil {
			e.Metadata = make(map[string]any, len(meta))
		}
		for k, v := range meta {
			e.Metadata[k] = v
		}
	}
}
