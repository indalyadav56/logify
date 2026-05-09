package main

import (
	"context"
	"errors"
	"fmt"
	"os/signal"
	"syscall"
	"time"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
	"github.com/indalyadav56/logify/apps/backend/internal/di"
	"github.com/indalyadav56/logify/apps/backend/internal/server"
	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver"
	"go.uber.org/zap"
)

func main() {
	if err := run(); err != nil {
		fmt.Println("failed to start server")
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	log, err := zap.NewDevelopment()
	if err != nil {
		return fmt.Errorf("init logger: %w", err)
	}
	defer log.Sync()

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	// Build container
	container, err := di.NewServerContainer(ctx, cfg, log)
	if err != nil {
		return fmt.Errorf("init container: %w", err)
	}
	defer container.Close()

	// handler
	handler := server.NewRouter(container, log)

	// server
	srv := httpserver.New(httpserver.Config{
		Host:              "0.0.0.0",
		Port:              8080,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		ShutdownTimeout:   30 * time.Second,
		MaxHeaderBytes:    1 << 20, // 1 MB
	}, handler, log)

	// Run and block until shutdown signal
	if err := srv.Run(ctx); err != nil && !errors.Is(err, context.Canceled) {
		return fmt.Errorf("server: %w", err)
	}

	log.Info("server exited cleanly")
	return nil
}
