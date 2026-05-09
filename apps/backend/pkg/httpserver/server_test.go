package httpserver

// import (
// 	"context"
// 	"fmt"
// 	"io"
// 	"net/http"
// 	"testing"
// 	"time"

// 	"github.com/stretchr/testify/assert"
// 	"github.com/stretchr/testify/require"
// 	"go.uber.org/zap/zaptest"

// 	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver"
// )

// func TestServer_StartsAndServesRequests(t *testing.T) {
// 	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		w.WriteHeader(http.StatusOK)
// 		fmt.Fprintln(w, "hello")
// 	})

// 	srv := httpserver.New(testConfig(), handler, zaptest.NewLogger(t))

// 	ctx, cancel := context.WithCancel(context.Background())
// 	errCh := make(chan error, 1)
// 	go func() { errCh <- srv.Run(ctx) }()

// 	// Wait for server to be ready
// 	time.Sleep(50 * time.Millisecond)

// 	resp, err := http.Get("http://" + srv.Addr())
// 	require.NoError(t, err)
// 	defer resp.Body.Close()

// 	body, _ := io.ReadAll(resp.Body)
// 	assert.Equal(t, http.StatusOK, resp.StatusCode)
// 	assert.Equal(t, "hello\n", string(body))

// 	cancel()
// 	require.NoError(t, <-errCh)
// }

// func TestServer_GracefulShutdown(t *testing.T) {
// 	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		time.Sleep(100 * time.Millisecond)
// 		w.WriteHeader(http.StatusOK)
// 	})

// 	srv := httpserver.New(testConfig(), handler, zaptest.NewLogger(t))

// 	ctx, cancel := context.WithCancel(context.Background())
// 	errCh := make(chan error, 1)
// 	go func() { errCh <- srv.Run(ctx) }()

// 	time.Sleep(50 * time.Millisecond)

// 	// Trigger shutdown while request is in flight
// 	go func() {
// 		time.Sleep(20 * time.Millisecond)
// 		cancel()
// 	}()

// 	// In-flight request should still complete
// 	resp, err := http.Get("http://" + srv.Addr())
// 	require.NoError(t, err)
// 	resp.Body.Close()
// 	assert.Equal(t, http.StatusOK, resp.StatusCode)

// 	require.NoError(t, <-errCh)
// }

// func TestServer_RunTwice(t *testing.T) {
// 	srv := httpserver.New(testConfig(), http.NotFoundHandler(), zaptest.NewLogger(t))

// 	ctx, cancel := context.WithCancel(context.Background())
// 	errCh := make(chan error, 1)
// 	go func() { errCh <- srv.Run(ctx) }()

// 	time.Sleep(50 * time.Millisecond)

// 	// Second call should fail
// 	err := srv.Run(context.Background())
// 	assert.ErrorContains(t, err, "already started")

// 	cancel()
// 	<-errCh
// }

// func testConfig() httpserver.Config {
// 	cfg := httpserver.DefaultConfig()
// 	cfg.Port = 0 // random port
// 	cfg.ShutdownTimeout = 2 * time.Second
// 	return cfg
// }
