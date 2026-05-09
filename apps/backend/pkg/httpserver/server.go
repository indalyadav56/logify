package httpserver

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"sync"

	"go.uber.org/zap"
)

// Server is a thin lifecycle wrapper around net/http.Server.
// It handles graceful shutdown, error propagation, and listener lifecycle.
//
// Server is intentionally framework-agnostic — it accepts any http.Handler.
// Use it with Gin, Chi, Echo, or stdlib mux interchangeably.
type Server struct {
	cfg        Config
	httpServer *http.Server
	listener   net.Listener
	log        *zap.Logger

	mu      sync.Mutex
	started bool
}

// New constructs a Server. The handler is built externally; Server only manages lifecycle.
func New(cfg Config, handler http.Handler, log *zap.Logger) *Server {
	if log == nil {
		log = zap.NewNop()
	}

	return &Server{
		cfg: cfg,
		log: log,
		httpServer: &http.Server{
			Addr:              cfg.Address(),
			Handler:           handler,
			ReadTimeout:       cfg.ReadTimeout,
			WriteTimeout:      cfg.WriteTimeout,
			IdleTimeout:       cfg.IdleTimeout,
			ReadHeaderTimeout: cfg.ReadHeaderTimeout,
			MaxHeaderBytes:    cfg.MaxHeaderBytes,
			ErrorLog:          zap.NewStdLog(log),
		},
	}
}

// Addr returns the actual address the server is listening on.
// Useful when Port is 0 (random port) — call after Run starts.
func (s *Server) Addr() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.listener == nil {
		return s.cfg.Address()
	}
	return s.listener.Addr().String()
}

// Run starts the server and blocks until ctx is cancelled or an error occurs.
// On context cancellation, it performs graceful shutdown with the configured timeout.
//
// Run is safe to call once per Server instance. Calling it twice returns an error.
func (s *Server) Run(ctx context.Context) error {
	s.mu.Lock()
	if s.started {
		s.mu.Unlock()
		return errors.New("server already started")
	}
	s.started = true

	listener, err := net.Listen("tcp", s.cfg.Address())
	if err != nil {
		s.mu.Unlock()
		return fmt.Errorf("listen on %s: %w", s.cfg.Address(), err)
	}
	s.listener = listener
	s.mu.Unlock()

	serverErr := make(chan error, 1)

	go func() {
		s.log.Info("http server listening",
			zap.String("addr", listener.Addr().String()),
		)
		if err := s.httpServer.Serve(listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
			return
		}
		serverErr <- nil
	}()

	select {
	case err := <-serverErr:
		if err != nil {
			return fmt.Errorf("server error: %w", err)
		}
		return nil

	case <-ctx.Done():
		s.log.Info("shutdown signal received, draining connections")
		return s.shutdown()
	}
}

// shutdown performs graceful shutdown with the configured timeout.
func (s *Server) shutdown() error {
	shutdownCtx, cancel := context.WithTimeout(context.Background(), s.cfg.ShutdownTimeout)
	defer cancel()

	s.log.Info("graceful shutdown started",
		zap.Duration("timeout", s.cfg.ShutdownTimeout),
	)

	if err := s.httpServer.Shutdown(shutdownCtx); err != nil {
		s.log.Error("graceful shutdown failed, forcing close", zap.Error(err))
		// Best-effort force close
		if closeErr := s.httpServer.Close(); closeErr != nil {
			s.log.Error("force close failed", zap.Error(closeErr))
		}
		return fmt.Errorf("shutdown: %w", err)
	}

	s.log.Info("server stopped cleanly")
	return nil
}
