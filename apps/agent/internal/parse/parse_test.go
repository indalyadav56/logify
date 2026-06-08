package parse

import (
	"testing"

	logify "github.com/indalyadav56/logify/sdks/go"

	"github.com/indalyadav56/logify/apps/agent/internal/input"
)

func TestPlainTextLevelDetection(t *testing.T) {
	cases := map[string]logify.Level{
		"2026-06-08 12:00:00 ERROR database down": logify.LevelError,
		"[WARN] disk almost full":                 logify.LevelWarn,
		"a routine info line":                      logify.LevelInfo, // no token -> fallback
		"panic: nil pointer dereference":           logify.LevelFatal,
		"DEBUG cache miss for key=42":              logify.LevelDebug,
	}
	for line, want := range cases {
		e := ToEntry(input.Event{Line: line})
		if e.Level != want {
			t.Errorf("line %q: level = %q, want %q", line, e.Level, want)
		}
		if e.Message != line {
			t.Errorf("line %q: message not preserved, got %q", line, e.Message)
		}
	}
}

func TestPlainTextFallbackLevel(t *testing.T) {
	e := ToEntry(input.Event{
		Line:       "no level word here",
		Decoration: input.Decoration{DefaultLevel: "WARN"},
	})
	if e.Level != logify.LevelWarn {
		t.Fatalf("level = %q, want WARN", e.Level)
	}
}

func TestJSONLineExtraction(t *testing.T) {
	ev := input.Event{
		Line:       `{"level":"error","msg":"boom","user_id":"u-1","latency_ms":42}`,
		Decoration: input.Decoration{JSON: true, Service: "api"},
	}
	e := ToEntry(ev)

	if e.Level != logify.LevelError {
		t.Errorf("level = %q, want ERROR", e.Level)
	}
	if e.Message != "boom" {
		t.Errorf("message = %q, want boom", e.Message)
	}
	if e.Service != "api" {
		t.Errorf("service = %q, want api", e.Service)
	}
	// Non-canonical fields land in metadata; canonical ones do not.
	if e.Metadata["user_id"] != "u-1" {
		t.Errorf("metadata.user_id = %v, want u-1", e.Metadata["user_id"])
	}
	if e.Metadata["latency_ms"] != float64(42) {
		t.Errorf("metadata.latency_ms = %v, want 42", e.Metadata["latency_ms"])
	}
	if _, ok := e.Metadata["msg"]; ok {
		t.Errorf("canonical key 'msg' should not be in metadata")
	}
	if _, ok := e.Metadata["level"]; ok {
		t.Errorf("canonical key 'level' should not be in metadata")
	}
}

func TestJSONTimestampParsed(t *testing.T) {
	ev := input.Event{
		Line:       `{"level":"info","message":"hi","timestamp":"2026-06-08T12:15:30Z"}`,
		Decoration: input.Decoration{JSON: true},
	}
	e := ToEntry(ev)
	if e.Timestamp.IsZero() {
		t.Fatal("timestamp not parsed from JSON line")
	}
	if got := e.Timestamp.UTC().Format("2006-01-02T15:04:05Z"); got != "2026-06-08T12:15:30Z" {
		t.Errorf("timestamp = %s", got)
	}
}

func TestNonJSONWithJSONFlagFallsBackToPlain(t *testing.T) {
	ev := input.Event{
		Line:       "not json at all ERROR",
		Decoration: input.Decoration{JSON: true},
	}
	e := ToEntry(ev)
	if e.Level != logify.LevelError {
		t.Errorf("level = %q, want ERROR", e.Level)
	}
	if e.Message != "not json at all ERROR" {
		t.Errorf("message = %q", e.Message)
	}
}
