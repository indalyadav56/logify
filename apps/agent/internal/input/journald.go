package input

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// JournaldInput streams the systemd journal by following `journalctl -o json`.
// It relies on journalctl's own --cursor-file to resume after a restart, so no
// offset bookkeeping is needed here. Linux/systemd only.
type JournaldInput struct {
	name       string
	units      []string
	dec        Decoration
	cursorFile string
	log        *slog.Logger
}

// NewJournaldInput builds a journald follower. cursorDir is where the resume
// cursor file is kept (typically alongside the registry).
func NewJournaldInput(name string, units []string, dec Decoration, cursorDir string, log *slog.Logger) *JournaldInput {
	return &JournaldInput{
		name:       name,
		units:      units,
		dec:        dec,
		cursorFile: filepath.Join(cursorDir, "journald-"+name+".cursor"),
		log:        log.With("input", name),
	}
}

func (j *JournaldInput) Name() string { return j.name }

func (j *JournaldInput) Run(ctx context.Context, out chan<- Event) error {
	if _, err := exec.LookPath("journalctl"); err != nil {
		return fmt.Errorf("journalctl not found (journald input requires systemd): %w", err)
	}

	args := []string{"--follow", "--output=json", "--no-pager", "--cursor-file=" + j.cursorFile}
	for _, u := range j.units {
		args = append(args, "--unit="+u)
	}

	cmd := exec.CommandContext(ctx, "journalctl", args...)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start journalctl: %w", err)
	}

	sc := bufio.NewScanner(stdout)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for sc.Scan() {
		ev, ok := j.toEvent(sc.Bytes())
		if !ok {
			continue
		}
		select {
		case out <- ev:
		case <-ctx.Done():
			_ = cmd.Wait()
			return ctx.Err()
		}
	}
	// Scanner stopped: either ctx cancelled the process or journalctl exited.
	waitErr := cmd.Wait()
	if ctx.Err() != nil {
		return ctx.Err()
	}
	if err := sc.Err(); err != nil {
		return err
	}
	return waitErr
}

// toEvent maps a journald JSON record onto an Event with canonical fields, and
// stows the remaining journal metadata in Fields for the parser.
func (j *JournaldInput) toEvent(raw []byte) (Event, bool) {
	var rec map[string]any
	if err := json.Unmarshal(raw, &rec); err != nil {
		return Event{}, false
	}

	fields := make(map[string]any, len(rec))
	for k, v := range rec {
		fields[k] = v
	}

	// MESSAGE -> message
	if msg, ok := journalString(rec["MESSAGE"]); ok {
		fields["message"] = msg
	}
	delete(fields, "MESSAGE")

	// PRIORITY (syslog severity 0-7) -> level word
	if p, ok := journalString(rec["PRIORITY"]); ok {
		if lvl := priorityToLevel(p); lvl != "" {
			fields["level"] = lvl
		}
	}

	ev := Event{Input: j.name, Fields: fields, Decoration: j.dec}
	if msg, ok := fields["message"].(string); ok {
		ev.Line = msg
	}
	// __REALTIME_TIMESTAMP is microseconds since the Unix epoch.
	if ts, ok := journalString(rec["__REALTIME_TIMESTAMP"]); ok {
		if usec, err := strconv.ParseInt(ts, 10, 64); err == nil {
			ev.Time = time.UnixMicro(usec)
		}
	}
	return ev, true
}

// journalString coerces a journal field (string, or array of bytes for binary
// fields) into a string.
func journalString(v any) (string, bool) {
	switch t := v.(type) {
	case string:
		return t, true
	case []any:
		var b strings.Builder
		for _, e := range t {
			if n, ok := e.(float64); ok {
				b.WriteByte(byte(int(n)))
			}
		}
		return b.String(), true
	default:
		return "", false
	}
}

func priorityToLevel(p string) string {
	switch strings.TrimSpace(p) {
	case "0", "1", "2":
		return "FATAL" // emerg, alert, crit
	case "3":
		return "ERROR"
	case "4":
		return "WARN"
	case "5", "6":
		return "INFO" // notice, info
	case "7":
		return "DEBUG"
	default:
		return ""
	}
}
