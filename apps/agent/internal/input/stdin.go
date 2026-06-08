package input

import (
	"bufio"
	"context"
	"io"
	"os"
)

// StdinInput reads newline-delimited records from standard input. It's the
// natural fit for piping another program's output: `myapp | logify-agent run`.
type StdinInput struct {
	name string
	dec  Decoration
	r    io.Reader
}

// NewStdinInput builds a stdin reader. r defaults to os.Stdin when nil.
func NewStdinInput(name string, dec Decoration, r io.Reader) *StdinInput {
	if r == nil {
		r = os.Stdin
	}
	return &StdinInput{name: name, dec: dec, r: r}
}

func (s *StdinInput) Name() string { return s.name }

func (s *StdinInput) Run(ctx context.Context, out chan<- Event) error {
	lines := make(chan string)
	errc := make(chan error, 1)

	// Scan in a goroutine so we can still observe ctx cancellation, since a
	// blocking Read on stdin can't itself be cancelled.
	go func() {
		sc := bufio.NewScanner(s.r)
		sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
		for sc.Scan() {
			select {
			case lines <- sc.Text():
			case <-ctx.Done():
				return
			}
		}
		errc <- sc.Err()
	}()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case err := <-errc:
			return err // nil on clean EOF
		case line := <-lines:
			select {
			case out <- Event{Input: s.name, Line: line, Decoration: s.dec}:
			case <-ctx.Done():
				return ctx.Err()
			}
		}
	}
}
