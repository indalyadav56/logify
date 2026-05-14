// Package httpserver provides a thin, framework-agnostic lifecycle wrapper
// around net/http.Server: bind, serve, propagate errors, and shut down gracefully.
//
// Server accepts any http.Handler, so it composes with Gin, Chi, Echo, or the
// stdlib mux interchangeably.
package httpserver

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"

	"go.uber.org/zap"
)

// defaultShutdownTimeout is used when Config.ShutdownTimeout is zero.
const defaultShutdownTimeout = 15 * time.Second

// Server is a single-use HTTP server.
//
// The lifecycle is: New -> Run -> (ctx cancel | Shutdown) -> done.
// A Server instance must not be reused after Run returns.
type Server struct {
	cfg        Config
	httpServer *http.Server
	log        *zap.Logger

	mu       sync.Mutex
	started  bool
	listener net.Listener
}

// New constructs a Server. The handler is built externally; Server only manages lifecycle.
// If log is nil, a no-op logger is used.
func New(cfg Config, handler http.Handler, log *zap.Logger) *Server {
	if log == nil {
		log = zap.NewNop()
	}
	log = log.Named("httpserver")

	srv := &http.Server{
		Addr:              cfg.Address(),
		Handler:           handler,
		ReadTimeout:       cfg.ReadTimeout,
		WriteTimeout:      cfg.WriteTimeout,
		IdleTimeout:       cfg.IdleTimeout,
		ReadHeaderTimeout: cfg.ReadHeaderTimeout,
		MaxHeaderBytes:    cfg.MaxHeaderBytes,
		ErrorLog:          zap.NewStdLog(log),
	}

	return &Server{
		cfg:        cfg,
		httpServer: srv,
		log:        log,
	}
}

// Addr returns the address the server is bound to. Before Run has bound the
// listener it returns the configured address; after binding it returns the
// resolved address (useful when Port is 0).
func (s *Server) Addr() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.listener != nil {
		return s.listener.Addr().String()
	}
	return s.cfg.Address()
}

// Run validates the config, binds the listener, starts serving, and blocks
// until ctx is cancelled or the server returns an error. On cancellation it
// performs graceful shutdown bounded by Config.ShutdownTimeout.
//
// Run may be called at most once per Server instance.
func (s *Server) Run(ctx context.Context) error {
	if err := s.cfg.Validate(); err != nil {
		return err
	}

	s.mu.Lock()
	if s.started {
		s.mu.Unlock()
		return errors.New("httpserver: server already started")
	}
	s.started = true

	listener, err := net.Listen("tcp", s.cfg.Address())
	if err != nil {
		s.mu.Unlock()
		return fmt.Errorf("httpserver: listen on %s: %w", s.cfg.Address(), err)
	}
	s.listener = listener

	// Propagate the run ctx to handlers so they can observe shutdown.
	s.httpServer.BaseContext = func(_ net.Listener) context.Context { return ctx }
	s.mu.Unlock()

	serveErr := make(chan error, 1)
	go func() {
		s.log.Info("listening",
			zap.String("addr", listener.Addr().String()),
			zap.Bool("tls", s.cfg.TLS != nil),
		)
		var err error
		if s.cfg.TLS != nil {
			err = s.httpServer.ServeTLS(listener, s.cfg.TLS.CertFile, s.cfg.TLS.KeyFile)
		} else {
			err = s.httpServer.Serve(listener)
		}
		if errors.Is(err, http.ErrServerClosed) {
			err = nil
		}
		serveErr <- err
	}()

	select {
	case err := <-serveErr:
		if err != nil {
			return fmt.Errorf("httpserver: serve: %w", err)
		}
		return nil

	case <-ctx.Done():
		s.log.Info("shutdown signal received, draining connections")
		shutdownErr := s.Shutdown(context.Background())
		// Drain Serve's return so the goroutine doesn't leak.
		if err := <-serveErr; err != nil && shutdownErr == nil {
			return fmt.Errorf("httpserver: serve: %w", err)
		}
		return shutdownErr
	}
}

// Shutdown attempts a graceful shutdown bounded by Config.ShutdownTimeout.
// If the supplied parent ctx is already cancelled, the timeout still applies.
// On timeout it best-effort force-closes the server.
//
// Shutdown is safe to call once Run is in flight; the typical caller is Run
// itself when its context is cancelled.
func (s *Server) Shutdown(parent context.Context) error {
	timeout := s.cfg.ShutdownTimeout
	if timeout <= 0 {
		timeout = defaultShutdownTimeout
	}

	// Detach from parent so a cancelled parent (e.g. SIGINT propagated from Run's
	// ctx) doesn't immediately abort the drain. Tie cancellation to timeout only.
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	_ = parent // reserved for future use (e.g. honoring an explicit deadline)

	s.log.Info("graceful shutdown started", zap.Duration("timeout", timeout))

	if err := s.httpServer.Shutdown(ctx); err != nil {
		s.log.Error("graceful shutdown failed, forcing close", zap.Error(err))
		if closeErr := s.httpServer.Close(); closeErr != nil {
			s.log.Error("force close failed", zap.Error(closeErr))
		}
		return fmt.Errorf("httpserver: shutdown: %w", err)
	}

	s.log.Info("server stopped cleanly")
	return nil
}
