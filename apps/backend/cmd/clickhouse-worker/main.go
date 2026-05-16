package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
	"github.com/indalyadav56/logify/apps/backend/internal/di"
	"github.com/indalyadav56/logify/apps/backend/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "failed to start clickhouse worker: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	log, err := logger.New(cfg.Logger)
	if err != nil {
		return fmt.Errorf("init logger: %w", err)
	}
	defer log.Sync()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigCh
		log.Info("received shutdown signal", zap.String("signal", sig.String()))
		cancel()
	}()

	container, err := di.NewClickHouseWorkerContainer(ctx, cfg, log)
	if err != nil {
		return fmt.Errorf("init container: %w", err)
	}
	defer container.Close()

	svc := container.ProcessorService
	if svc == nil {
		return errors.New("log processor service not initialized")
	}

	workerCount := 1
	errCh := make(chan error, workerCount)
	var wg sync.WaitGroup
	wg.Add(workerCount)

	for i := 0; i < workerCount; i++ {
		go func(id int) {
			defer wg.Done()
			log.Info("clickhouse worker started", zap.Int("worker_id", id))
			if err := svc.Start(ctx); err != nil && !errors.Is(err, context.Canceled) {
				errCh <- err
			}
			log.Info("clickhouse worker stopped", zap.Int("worker_id", id))
		}(i)
	}

	log.Info("clickhouse worker running", zap.Int("worker_count", workerCount))

	select {
	case err := <-errCh:
		cancel()
		wg.Wait()
		return fmt.Errorf("clickhouse worker failed: %w", err)
	case <-ctx.Done():
		wg.Wait()
	}

	log.Info("clickhouse worker exited cleanly")
	return nil
}
