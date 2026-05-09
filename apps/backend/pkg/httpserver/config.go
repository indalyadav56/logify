package httpserver

import (
	"net"
	"strconv"
	"time"
)

// Config holds HTTP server lifecycle settings.
// This struct is intentionally generic — it has no app-specific fields.
type Config struct {
	// Host and Port specify where the server listens.
	Host string
	Port int

	// ReadTimeout is the maximum duration for reading the entire request,
	// including the body. Zero or negative means no timeout.
	ReadTimeout time.Duration

	// WriteTimeout is the maximum duration before timing out writes
	// of the response. Zero or negative means no timeout.
	WriteTimeout time.Duration

	// IdleTimeout is the maximum amount of time to wait for the next
	// request when keep-alives are enabled. If zero, ReadTimeout is used.
	IdleTimeout time.Duration

	// ReadHeaderTimeout is the amount of time allowed to read request headers.
	// Important for slowloris protection. Set explicitly even if ReadTimeout is set.
	ReadHeaderTimeout time.Duration

	// ShutdownTimeout is how long graceful shutdown waits before forcing exit.
	ShutdownTimeout time.Duration

	// MaxHeaderBytes controls the maximum number of bytes the server will
	// read parsing the request header. Zero uses http.DefaultMaxHeaderBytes (1 MB).
	MaxHeaderBytes int
}

// Address returns the host:port string suitable for net.Listen.
func (c Config) Address() string {
	return net.JoinHostPort(c.Host, strconv.Itoa(c.Port))
}

// DefaultConfig returns sensible defaults.
// Override fields as needed.
func DefaultConfig() Config {
	return Config{
		Host:              "0.0.0.0",
		Port:              8080,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		ShutdownTimeout:   30 * time.Second,
		MaxHeaderBytes:    1 << 20, // 1 MB
	}
}
