// Chi shows pkg/httpserver wired with the pre-configured Chi mux from
// pkg/httpserver/chirouter (recovery, request ID, real IP, CORS, zap access logger).
//
// Run from the module root (apps/backend):
//
//	go run ./examples/httpserver/chi
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver"
	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/chirouter"
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
	cfg.Port = 18082

	r := chirouter.New(chirouter.Options{
		Logger:  log,
		Timeout: 10 * time.Second,
	})

	r.Get("/", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintln(w, "httpserver + chi example")
	})
	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	srv := httpserver.New(cfg, r, log)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	log.Info("listening", zap.String("url", "http://"+cfg.Address()))

	if err := srv.Run(ctx); err != nil && !errors.Is(err, context.Canceled) {
		return err
	}
	return nil
}
