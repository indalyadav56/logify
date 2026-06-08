package logify

import (
	"errors"
	"fmt"
)

// ErrClosed is returned when sending on a client that has been closed.
var ErrClosed = errors.New("logify: client is closed")

// ErrBufferFull is returned by TrySend when the async buffer has no free slot.
var ErrBufferFull = errors.New("logify: async buffer is full")

// APIError describes a non-2xx response from the ingest endpoint.
type APIError struct {
	// StatusCode is the HTTP status returned by the backend.
	StatusCode int
	// Body is the raw response body (truncated by the client).
	Body string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("logify: ingest failed with status %d: %s", e.StatusCode, e.Body)
}
