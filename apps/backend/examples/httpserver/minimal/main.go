// Minimal shows the smallest useful wiring of pkg/httpserver: stdlib handler,
// zap logger, and signal-driven graceful shutdown.
//
// Run from the module root (apps/backend):
//
//	go run ./examples/httpserver/minimal
package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver"
	"go.uber.org/zap"
)

func main() {
	if err := run(); err != nil && !errors.Is(err, context.Canceled) {
		fmt.Fprintf(os.Stderr, "example: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	log, err := zap.NewDevelopment()
	if err != nil {
		return fmt.Errorf("logger: %w", err)
	}
	defer log.Sync()

	cfg := httpserver.DefaultConfig()
	cfg.Host = "127.0.0.1"
	cfg.Port = 18080

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = fmt.Fprintf(w, "httpserver minimal example — try GET %s/\n", "http://"+cfg.Address())
	})

	srv := httpserver.New(cfg, handler, log)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	log.Info("listening", zap.String("url", "http://"+cfg.Address()))

	if err := srv.Run(ctx); err != nil && !errors.Is(err, context.Canceled) {
		return err
	}
	return nil
}
