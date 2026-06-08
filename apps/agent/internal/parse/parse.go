// Package parse converts a raw input.Event into a logify.Entry: it understands
// JSON log lines, detects severity from plain text, and routes leftover fields
// into structured metadata.
package parse

import (
	"encoding/json"
	"regexp"
	"strings"
	"time"

	logify "github.com/indalyadav56/logify/sdks/go"

	"github.com/indalyadav56/logify/apps/agent/internal/input"
)

// Common keys used by structured loggers for the canonical fields.
var (
	messageKeys   = []string{"message", "msg", "log", "text"}
	levelKeys     = []string{"level", "severity", "lvl", "loglevel", "log_level"}
	timestampKeys = []string{"timestamp", "time", "ts", "@timestamp", "eventTime"}
)

// levelWord matches a severity token anywhere in a plain-text line, e.g.
// "[ERROR]" or " warn:". Word boundaries avoid matching inside other words.
var levelWord = regexp.MustCompile(`(?i)\b(trace|debug|info|notice|warn(?:ing)?|err(?:or)?|fatal|crit(?:ical)?|panic|emerg(?:ency)?|alert)\b`)

// ToEntry builds a logify.Entry from an event. The returned entry has only the
// fields the agent knows; the SDK fills the rest (hostname, env, source,
// timestamp) from its client-level defaults at send time.
func ToEntry(ev input.Event) logify.Entry {
	d := ev.Decoration
	e := logify.Entry{
		Service:     d.Service,
		Namespace:   d.Namespace,
		Environment: d.Environment,
		Source:      d.Source,
		ProjectID:   d.ProjectID,
		Timestamp:   ev.Time,
		Tags:        d.Tags,
		Message:     ev.Line,
	}

	// Resolve structured fields: pre-parsed (journald) or JSON-on-the-line.
	fields := ev.Fields
	if fields == nil && d.JSON {
		if m, ok := decodeJSONObject(ev.Line); ok {
			fields = m
		}
	}

	if fields != nil {
		applyFields(&e, fields)
	}

	if e.Level == "" {
		e.Level = detectLevel(ev.Line, d.DefaultLevel)
	}
	if strings.TrimSpace(string(e.Message)) == "" {
		e.Message = ev.Line
	}
	return e
}

// applyFields pulls canonical fields out of a structured record and stows the
// remainder in Metadata.
func applyFields(e *logify.Entry, fields map[string]any) {
	consumed := map[string]bool{}

	if v, k := firstString(fields, messageKeys); k != "" {
		e.Message = v
		consumed[k] = true
	}
	if v, k := firstString(fields, levelKeys); k != "" {
		e.Level = normalizeLevel(v)
		consumed[k] = true
	}
	if e.Timestamp.IsZero() {
		if v, k := firstString(fields, timestampKeys); k != "" {
			if t, ok := parseTime(v); ok {
				e.Timestamp = t
				consumed[k] = true
			}
		}
	}

	meta := make(map[string]any, len(fields))
	for k, v := range fields {
		if consumed[k] {
			continue
		}
		meta[k] = v
	}
	if len(meta) > 0 {
		if e.Metadata == nil {
			e.Metadata = meta
		} else {
			for k, v := range meta {
				e.Metadata[k] = v
			}
		}
	}
}

func decodeJSONObject(line string) (map[string]any, bool) {
	line = strings.TrimSpace(line)
	if len(line) == 0 || line[0] != '{' {
		return nil, false
	}
	var m map[string]any
	if err := json.Unmarshal([]byte(line), &m); err != nil {
		return nil, false
	}
	return m, true
}

// firstString returns the first key present whose value is a non-empty string,
// along with the key that matched.
func firstString(fields map[string]any, keys []string) (string, string) {
	for _, k := range keys {
		if v, ok := fields[k]; ok {
			if s, ok := v.(string); ok && strings.TrimSpace(s) != "" {
				return s, k
			}
		}
	}
	return "", ""
}

// detectLevel scans a plain-text line for a severity word, falling back to the
// input's configured default (or INFO).
func detectLevel(line, fallback string) logify.Level {
	if m := levelWord.FindString(line); m != "" {
		return normalizeLevel(m)
	}
	if fallback != "" {
		return normalizeLevel(fallback)
	}
	return logify.LevelInfo
}

// normalizeLevel maps the many spellings of a severity onto the SDK's levels.
func normalizeLevel(s string) logify.Level {
	switch strings.ToUpper(strings.TrimSpace(s)) {
	case "TRACE":
		return logify.LevelTrace
	case "DEBUG":
		return logify.LevelDebug
	case "INFO", "INFORMATION", "NOTICE":
		return logify.LevelInfo
	case "WARN", "WARNING":
		return logify.LevelWarn
	case "ERR", "ERROR":
		return logify.LevelError
	case "FATAL", "CRIT", "CRITICAL", "PANIC", "EMERG", "EMERGENCY", "ALERT":
		return logify.LevelFatal
	default:
		// Preserve unknown levels verbatim; the backend stores any string.
		return logify.Level(strings.ToUpper(strings.TrimSpace(s)))
	}
}

// timeLayouts covers the formats structured loggers commonly emit.
var timeLayouts = []string{
	time.RFC3339Nano,
	time.RFC3339,
	"2006-01-02T15:04:05.000Z0700",
	"2006-01-02 15:04:05.000",
	"2006-01-02 15:04:05",
	"2006/01/02 15:04:05",
}

func parseTime(s string) (time.Time, bool) {
	s = strings.TrimSpace(s)
	for _, layout := range timeLayouts {
		if t, err := time.Parse(layout, s); err == nil {
			return t, true
		}
	}
	return time.Time{}, false
}
