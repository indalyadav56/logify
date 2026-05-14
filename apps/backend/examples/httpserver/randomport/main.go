// Randomport uses Port 0 so the OS picks a free port; httpserver.Server.Addr()
// reports the actual listener address after Run starts listening.
//
// Because Run blocks until shutdown, this example starts the server in a
// goroutine, prints the URL, waits briefly, then cancels the context.
//
// Run from the module root (apps/backend):
//
//	go run ./examples/httpserver/randomport
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver"
	"go.uber.org/zap"
)

func main() {
	log := zap.NewNop()

	cfg := httpserver.DefaultConfig()
	cfg.Host = "127.0.0.1"
	cfg.Port = 0
	cfg.ShutdownTimeout = 5 * time.Second

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "ok")
	})

	srv := httpserver.New(cfg, handler, log)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	errCh := make(chan error, 1)
	go func() { errCh <- srv.Run(ctx) }()

	// Run binds the listener before blocking on ctx; give it a moment to start.
	time.Sleep(50 * time.Millisecond)

	base := "http://" + srv.Addr()
	fmt.Fprintf(os.Stdout, "picked address: %s\nGET %s/ → ", base, base)

	resp, err := http.Get(base + "/")
	if err != nil {
		cancel()
		fmt.Fprintf(os.Stderr, "request failed: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()
	fmt.Fprintf(os.Stdout, "%s\n", resp.Status)

	cancel()
	if err := <-errCh; err != nil {
		fmt.Fprintf(os.Stderr, "server: %v\n", err)
		os.Exit(1)
	}
}
