package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
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
	gin.SetMode(gin.ReleaseMode)

	log, err := zap.NewDevelopment()
	if err != nil {
		return fmt.Errorf("logger: %w", err)
	}
	defer log.Sync()

	cfg := httpserver.DefaultConfig()
	cfg.Host = "127.0.0.1"
	cfg.Port = 18081

	r := gin.New()
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "httpserver + gin example\n")
	})
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
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
