package httpserver

import (
	"errors"
	"fmt"
	"net"
	"strconv"
	"time"
)

// Config holds HTTP server lifecycle settings.
// The struct is intentionally framework-agnostic — it has no app-specific fields.
//
// Use DefaultConfig() as a starting point and override only what you need.
type Config struct {
	// Host is the bind address. Empty means "all interfaces" (0.0.0.0).
	Host string
	// Port is the TCP port. 0 lets the OS choose a free port (useful for tests).
	Port int

	// ReadTimeout is the maximum duration for reading the entire request,
	// including the body. Zero means no timeout (not recommended for public servers).
	ReadTimeout time.Duration

	// WriteTimeout is the maximum duration before timing out writes
	// of the response. Zero means no timeout.
	WriteTimeout time.Duration

	// IdleTimeout is the maximum amount of time to wait for the next
	// request when keep-alives are enabled. If zero, ReadTimeout is used.
	IdleTimeout time.Duration

	// ReadHeaderTimeout is the amount of time allowed to read request headers.
	// Important for slowloris protection. Set explicitly even if ReadTimeout is set.
	ReadHeaderTimeout time.Duration

	// ShutdownTimeout is how long graceful shutdown waits before forcing exit.
	// Zero falls back to a sensible internal default.
	ShutdownTimeout time.Duration

	// MaxHeaderBytes controls the maximum number of bytes the server will
	// read parsing the request header. Zero uses http.DefaultMaxHeaderBytes (1 MB).
	MaxHeaderBytes int

	// TLS, when non-nil, switches the server to HTTPS using ServeTLS.
	TLS *TLSConfig
}

// TLSConfig holds the certificate paths used by ServeTLS.
type TLSConfig struct {
	CertFile string
	KeyFile  string
}

// Address returns the host:port string suitable for net.Listen.
func (c Config) Address() string {
	return net.JoinHostPort(c.Host, strconv.Itoa(c.Port))
}

// Validate returns an error if the configuration is obviously wrong.
// Run calls Validate before binding the listener.
func (c Config) Validate() error {
	if c.Port < 0 || c.Port > 65535 {
		return fmt.Errorf("httpserver: invalid port %d (must be 0–65535)", c.Port)
	}
	if c.ReadTimeout < 0 {
		return errors.New("httpserver: ReadTimeout must not be negative")
	}
	if c.WriteTimeout < 0 {
		return errors.New("httpserver: WriteTimeout must not be negative")
	}
	if c.IdleTimeout < 0 {
		return errors.New("httpserver: IdleTimeout must not be negative")
	}
	if c.ReadHeaderTimeout < 0 {
		return errors.New("httpserver: ReadHeaderTimeout must not be negative")
	}
	if c.ShutdownTimeout < 0 {
		return errors.New("httpserver: ShutdownTimeout must not be negative")
	}
	if c.MaxHeaderBytes < 0 {
		return errors.New("httpserver: MaxHeaderBytes must not be negative")
	}
	if c.TLS != nil {
		if c.TLS.CertFile == "" || c.TLS.KeyFile == "" {
			return errors.New("httpserver: TLS requires both CertFile and KeyFile")
		}
	}
	return nil
}

// DefaultConfig returns production-leaning defaults.
// Override fields as needed before passing to New.
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
