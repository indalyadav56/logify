package input

import (
	"bufio"
	"context"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"syscall"
	"time"

	"github.com/indalyadav56/logify/apps/agent/internal/config"
	"github.com/indalyadav56/logify/apps/agent/internal/registry"
)

const (
	filePollInterval = 1 * time.Second
	fileScanInterval = 10 * time.Second
	multilineFlushAfter = 2 * time.Second
)

// FileInput tails one or more glob patterns, following appends and surviving
// log rotation. Offsets are checkpointed in the shared registry so restarts
// resume in place.
type FileInput struct {
	name       string
	patterns   []string
	fromBeginning bool
	dec        Decoration
	ml         *config.Multiline
	reg        *registry.Registry
	log        *slog.Logger

	active map[string]*tailedFile
}

// NewFileInput builds a file tailer from its config.
func NewFileInput(in config.InputConfig, dec Decoration, reg *registry.Registry, log *slog.Logger) *FileInput {
	return &FileInput{
		name:          in.Name,
		patterns:      in.Paths,
		fromBeginning: in.FromBeginning,
		dec:           dec,
		ml:            in.Multiline,
		reg:           reg,
		log:           log.With("input", in.Name),
		active:        map[string]*tailedFile{},
	}
}

func (f *FileInput) Name() string { return f.name }

func (f *FileInput) Run(ctx context.Context, out chan<- Event) error {
	f.scan(ctx, out) // initial discovery + catch-up read

	poll := time.NewTicker(filePollInterval)
	defer poll.Stop()
	scan := time.NewTicker(fileScanInterval)
	defer scan.Stop()

	for {
		select {
		case <-ctx.Done():
			f.closeAll()
			return ctx.Err()
		case <-scan.C:
			f.discover()
		case <-poll.C:
			for path, tf := range f.active {
				if err := f.read(ctx, tf, out); err != nil {
					if ctx.Err() != nil {
						f.closeAll()
						return ctx.Err()
					}
					f.log.Warn("read error, dropping file until rediscovered", "path", path, "err", err)
					tf.close()
					delete(f.active, path)
				}
			}
			f.flushIdleMultiline(ctx, out)
		}
	}
}

// scan discovers files then immediately reads any backlog.
func (f *FileInput) scan(ctx context.Context, out chan<- Event) {
	f.discover()
	for _, tf := range f.active {
		_ = f.read(ctx, tf, out)
	}
}

// discover expands the globs and starts tailing any newly-matched files.
func (f *FileInput) discover() {
	for _, pattern := range f.patterns {
		matches, err := filepath.Glob(pattern)
		if err != nil {
			f.log.Warn("bad glob pattern", "pattern", pattern, "err", err)
			continue
		}
		for _, path := range matches {
			if _, ok := f.active[path]; ok {
				continue
			}
			info, err := os.Stat(path)
			if err != nil || info.IsDir() {
				continue
			}
			tf, err := f.open(path, info)
			if err != nil {
				f.log.Warn("cannot open file", "path", path, "err", err)
				continue
			}
			f.active[path] = tf
			f.log.Info("tailing file", "path", path, "offset", tf.offset)
		}
	}
}

// open opens a file and seeks to its resume point: the saved offset if the
// inode still matches, otherwise the start (new file we've seen before is
// treated as rotated) or end (brand-new file, unless from_beginning is set).
func (f *FileInput) open(path string, info os.FileInfo) (*tailedFile, error) {
	fh, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	ino, dev := fileID(info)

	var offset int64
	if st, ok := f.reg.Get(path); ok && st.Inode == ino && st.Device == dev && st.Offset <= info.Size() {
		offset = st.Offset // resume in place
	} else if !f.fromBeginning {
		offset = info.Size() // new file: skip existing content, follow appends
	}

	if _, err := fh.Seek(offset, io.SeekStart); err != nil {
		fh.Close()
		return nil, err
	}
	tf := &tailedFile{
		path:   path,
		fh:     fh,
		reader: bufio.NewReader(fh),
		offset: offset,
		inode:  ino,
		device: dev,
	}
	if f.ml != nil {
		tf.ml = newMultiline(f.ml)
	}
	f.reg.Set(path, registry.State{Offset: offset, Inode: ino, Device: dev})
	return tf, nil
}

// read pulls all newly-available complete lines from a file, handling rotation
// and truncation, and emits an Event per logical record.
func (f *FileInput) read(ctx context.Context, tf *tailedFile, out chan<- Event) error {
	info, err := os.Stat(tf.path)
	if err != nil {
		return err
	}

	ino, dev := fileID(info)
	if ino != tf.inode || dev != tf.device {
		// Rotated: a different file now occupies this path. Restart at 0.
		f.log.Info("file rotated, reopening", "path", tf.path)
		if err := tf.reopen(ino, dev); err != nil {
			return err
		}
	} else if info.Size() < tf.offset {
		// Truncated in place. Restart at 0.
		f.log.Info("file truncated, rewinding", "path", tf.path)
		if err := tf.rewind(); err != nil {
			return err
		}
	}

	for {
		chunk, err := tf.reader.ReadBytes('\n')
		if len(chunk) > 0 && err == io.EOF {
			// Partial line at EOF — stash it; do not advance the committed offset.
			tf.partial = append(tf.partial, chunk...)
			break
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		line := chunk
		if len(tf.partial) > 0 {
			line = append(tf.partial, chunk...)
			tf.partial = nil
		}
		// Advance by the full bytes of the completed line. Any partial that was
		// stashed on a previous pass was never committed, so it's counted here.
		tf.offset += int64(len(line))

		text := trimLineEnding(string(line))
		if tf.ml != nil {
			if joined, ok := tf.ml.push(text); ok {
				if err := f.emit(ctx, out, joined); err != nil {
					return err
				}
			}
		} else if err := f.emit(ctx, out, text); err != nil {
			return err
		}
	}

	f.reg.Set(tf.path, registry.State{Offset: tf.offset, Inode: tf.inode, Device: tf.device})
	return nil
}

// flushIdleMultiline emits any multiline buffer that has gone quiet so the last
// event of a file isn't held forever waiting for a terminator.
func (f *FileInput) flushIdleMultiline(ctx context.Context, out chan<- Event) {
	for _, tf := range f.active {
		if tf.ml == nil {
			continue
		}
		if joined, ok := tf.ml.flushIfIdle(multilineFlushAfter); ok {
			_ = f.emit(ctx, out, joined)
		}
	}
}

func (f *FileInput) emit(ctx context.Context, out chan<- Event, line string) error {
	ev := Event{Input: f.name, Line: line, Decoration: f.dec}
	select {
	case out <- ev:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (f *FileInput) closeAll() {
	for _, tf := range f.active {
		tf.close()
	}
	_ = f.reg.Flush()
}

// tailedFile is the live state of a single file being followed.
type tailedFile struct {
	path    string
	fh      *os.File
	reader  *bufio.Reader
	offset  int64
	inode   uint64
	device  uint64
	partial []byte
	ml      *multilineBuf
}

func (tf *tailedFile) reopen(ino, dev uint64) error {
	tf.close()
	fh, err := os.Open(tf.path)
	if err != nil {
		return err
	}
	tf.fh = fh
	tf.reader = bufio.NewReader(fh)
	tf.offset = 0
	tf.inode = ino
	tf.device = dev
	tf.partial = nil
	return nil
}

func (tf *tailedFile) rewind() error {
	if _, err := tf.fh.Seek(0, io.SeekStart); err != nil {
		return err
	}
	tf.reader.Reset(tf.fh)
	tf.offset = 0
	tf.partial = nil
	return nil
}

func (tf *tailedFile) close() {
	if tf.fh != nil {
		_ = tf.fh.Close()
		tf.fh = nil
	}
}

// fileID extracts the inode and device numbers from a FileInfo. Works on Linux
// and macOS (both expose *syscall.Stat_t); returns zeros elsewhere.
func fileID(info os.FileInfo) (ino, dev uint64) {
	if st, ok := info.Sys().(*syscall.Stat_t); ok {
		return uint64(st.Ino), uint64(st.Dev)
	}
	return 0, 0
}

func trimLineEnding(s string) string {
	s = trimSuffix(s, "\n")
	return trimSuffix(s, "\r")
}

func trimSuffix(s, suffix string) string {
	if len(s) >= len(suffix) && s[len(s)-len(suffix):] == suffix {
		return s[:len(s)-len(suffix)]
	}
	return s
}

// multilineBuf joins continuation lines into a single logical event.
type multilineBuf struct {
	re       *regexp.Regexp
	negate   bool
	after    bool // match == "after"
	maxLines int
	buf      []string
	lastAt   time.Time
	hasTime  bool
}

func newMultiline(m *config.Multiline) *multilineBuf {
	re, err := regexp.Compile(m.Pattern)
	if err != nil {
		// An invalid pattern degrades to line-per-event rather than failing.
		re = regexp.MustCompile(`$^`)
	}
	return &multilineBuf{re: re, negate: m.Negate, after: m.Match == "after", maxLines: m.MaxLines}
}

// push feeds a line and returns a joined event when one is complete.
func (m *multilineBuf) push(line string) (string, bool) {
	matches := m.re.MatchString(line) != m.negate
	var out string
	var ready bool

	if m.after {
		// Continuation lines (matching) attach to the previous line.
		if matches && len(m.buf) > 0 {
			m.buf = append(m.buf, line)
		} else {
			if len(m.buf) > 0 {
				out, ready = m.join(), true
			}
			m.buf = []string{line}
		}
	} else {
		// match == before: matching lines attach to the following line.
		m.buf = append(m.buf, line)
		if !matches {
			out, ready = m.join(), true
		}
	}

	m.lastAt = time.Now()
	m.hasTime = true
	if !ready && len(m.buf) >= m.maxLines {
		return m.join(), true
	}
	return out, ready
}

// flushIfIdle emits a pending buffer that has been quiet for at least d.
func (m *multilineBuf) flushIfIdle(d time.Duration) (string, bool) {
	if len(m.buf) == 0 || !m.hasTime {
		return "", false
	}
	if time.Since(m.lastAt) < d {
		return "", false
	}
	return m.join(), true
}

func (m *multilineBuf) join() string {
	out := joinLines(m.buf)
	m.buf = nil
	return out
}

func joinLines(lines []string) string {
	return strings.Join(lines, "\n")
}
