package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"

	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/internal/config"
	"github.com/indalyadav56/logify/apps/backend/internal/di"
)

// Server wires the configured Gin router into the generic httpserver.Server.
type Server struct {
	cfg    *config.Config
	log    *zap.Logger
	Router *gin.Engine
	srv    *http.Server
}

func NewServer(ctx context.Context, cfg *config.Config, log *zap.Logger, container *di.ServerContainer) (*Server, error) {
	router := gin.Default()

	httpRouter := NewRouter(container)
	if err := httpRouter.Setup(router); err != nil {
		return nil, fmt.Errorf("failed to setup routes: %w", err)
	}

	return &Server{
		cfg:    cfg,
		log:    log,
		Router: router,
		srv: &http.Server{
			Addr: ":8080",
			// Addr:         cfg.Server.Port,
			Handler:      router,
			ReadTimeout:  30 * time.Second,
			WriteTimeout: 60 * time.Second,
			IdleTimeout:  120 * time.Second,
		},
	}, nil
}

func (s *Server) Run(ctx context.Context) error {
	// Channel to listen for interrupt signals
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)

	// Start server in a goroutine
	go func() {
		s.log.Info("HTTP server starting", zap.String("addr", s.srv.Addr))
		if err := s.srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			s.log.Error("HTTP server failed", zap.Error(err))
		}
	}()

	// Wait for shutdown signal
	select {
	case sig := <-quit:
		s.log.Info("Received shutdown signal", zap.String("signal", sig.String()))
	case <-ctx.Done():
		s.log.Info("Context cancelled, shutting down")
	}

	// Graceful shutdown with timeout
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	s.log.Info("Shutting down HTTP server...")

	if err := s.srv.Shutdown(shutdownCtx); err != nil {
		s.log.Error("Server forced to shutdown", zap.Error(err))
		return fmt.Errorf("server shutdown: %w", err)
	}

	s.log.Info("HTTP server exited gracefully")
	return nil
}
