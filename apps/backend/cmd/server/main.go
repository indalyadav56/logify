package main

import (
	"context"
	"fmt"
	"os"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
	"github.com/indalyadav56/logify/apps/backend/internal/di"
	server "github.com/indalyadav56/logify/apps/backend/internal/server/http"
	"github.com/indalyadav56/logify/apps/backend/pkg/logger"
)

// @title           Logify API
// @version         1.0
// @description     This is the Logify backend API server.
// @host            localhost:8080
// @BasePath        /

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "failed to start server: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	// config
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	// logging
	// log, err := logger.New(cfg.Logger)
	// if err != nil {
	// 	return fmt.Errorf("init logger: %w", err)
	// }
	log, err := logger.New(logger.Config{
		Service:     "auth-service",
		Environment: "dev",
		Level:       "debug",

		FileEnabled: true,
		FilePath:    "logs/app.log",
		MaxSize:     100,
		MaxBackups:  5,
		MaxAge:      30,
		Compress:    true,
	})
	if err != nil {
		return fmt.Errorf("init logger: %w", err)
	}
	defer log.Sync()

	ctx := context.Background()

	// container
	container, err := di.NewServerContainer(ctx, cfg, log)
	if err != nil {
		return fmt.Errorf("init container: %w", err)
	}
	defer container.Close()

	// http server
	server, err := server.NewServer(ctx, cfg, log, container)
	if err != nil {
		return fmt.Errorf("initialize http server failed: %w", err)
	}

	return server.Run(ctx)
}
