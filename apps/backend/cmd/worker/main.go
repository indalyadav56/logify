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
	"go.uber.org/zap"
)

func main() {
	if err := run(); err != nil {
		fmt.Printf("failed to start worker: %v\n", err)
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

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigCh
		log.Info("received shutdown signal", zap.String("signal", sig.String()))
		cancel()
	}()

	// Build container
	container, err := di.NewWorkerContainer(ctx, cfg, log)
	if err != nil {
		return fmt.Errorf("init container: %w", err)
	}
	defer container.Close()

	// Fetch worker service
	processorService := container.ProcessorService
	if processorService == nil {
		return errors.New("processor service not initialized in container")
	}

	workerCount := 1
	errCh := make(chan error, workerCount)
	var wg sync.WaitGroup
	wg.Add(workerCount)

	for i := 0; i < workerCount; i++ {
		go func(id int) {
			defer wg.Done()
			log.Info("processor worker started", zap.Int("worker_id", id))
			if err := processorService.Start(ctx); err != nil && !errors.Is(err, context.Canceled) {
				errCh <- err
			}
			log.Info("processor worker stopped", zap.Int("worker_id", id))
		}(i)
	}

	log.Info("worker started successfully", zap.Int("worker_count", workerCount))

	select {
	case err := <-errCh:
		cancel()
		wg.Wait()
		return fmt.Errorf("processor worker failed: %w", err)
	case <-ctx.Done():
		wg.Wait()
	}

	log.Info("worker exited cleanly")
	return nil
}
