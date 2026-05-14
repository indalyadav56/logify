package httpserver_test

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap/zaptest"

	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver"
)

func testConfig() httpserver.Config {
	cfg := httpserver.DefaultConfig()
	cfg.Host = "127.0.0.1"
	cfg.Port = 0
	cfg.ShutdownTimeout = 2 * time.Second
	return cfg
}

// runServer starts srv in a goroutine and returns a channel receiving the Run
// error plus a cancel func to trigger graceful shutdown. It waits until the
// listener is bound so callers can safely use srv.Addr().
func runServer(t *testing.T, srv *httpserver.Server) (<-chan error, context.CancelFunc) {
	t.Helper()
	ctx, cancel := context.WithCancel(context.Background())
	errCh := make(chan error, 1)
	go func() { errCh <- srv.Run(ctx) }()

	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		addr := srv.Addr()
		_, portStr, err := net.SplitHostPort(addr)
		if err == nil && portStr != "0" {
			return errCh, cancel
		}
		time.Sleep(5 * time.Millisecond)
	}
	cancel()
	t.Fatalf("server did not bind in time; last addr=%q", srv.Addr())
	return errCh, cancel
}

func TestServer_StartsAndServesRequests(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "hello")
	})
	srv := httpserver.New(testConfig(), handler, zaptest.NewLogger(t))

	errCh, cancel := runServer(t, srv)
	defer cancel()

	resp, err := http.Get("http://" + srv.Addr())
	require.NoError(t, err)
	t.Cleanup(func() { _ = resp.Body.Close() })

	body, _ := io.ReadAll(resp.Body)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, "hello\n", string(body))

	cancel()
	assert.NoError(t, <-errCh)
}

func TestServer_GracefulShutdownDrainsInflight(t *testing.T) {
	released := make(chan struct{})
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		<-released
		w.WriteHeader(http.StatusOK)
	})
	srv := httpserver.New(testConfig(), handler, zaptest.NewLogger(t))

	errCh, cancel := runServer(t, srv)
	defer cancel()

	respCh := make(chan *http.Response, 1)
	errReqCh := make(chan error, 1)
	go func() {
		resp, err := http.Get("http://" + srv.Addr())
		if err != nil {
			errReqCh <- err
			return
		}
		respCh <- resp
	}()

	time.Sleep(50 * time.Millisecond)
	cancel()
	close(released)

	select {
	case resp := <-respCh:
		t.Cleanup(func() { _ = resp.Body.Close() })
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	case err := <-errReqCh:
		t.Fatalf("in-flight request failed: %v", err)
	case <-time.After(3 * time.Second):
		t.Fatal("in-flight request did not return")
	}

	assert.NoError(t, <-errCh)
}

func TestServer_RunTwiceReturnsError(t *testing.T) {
	srv := httpserver.New(testConfig(), http.NotFoundHandler(), zaptest.NewLogger(t))

	errCh, cancel := runServer(t, srv)
	defer cancel()

	err := srv.Run(context.Background())
	assert.ErrorContains(t, err, "already started")

	cancel()
	<-errCh
}

func TestServer_InvalidConfigFailsFast(t *testing.T) {
	cfg := testConfig()
	cfg.Port = -1
	srv := httpserver.New(cfg, http.NotFoundHandler(), zaptest.NewLogger(t))

	err := srv.Run(context.Background())
	assert.ErrorContains(t, err, "invalid port")
}

func TestServer_ListenErrorIsReturned(t *testing.T) {
	first := httpserver.New(testConfig(), http.NotFoundHandler(), zaptest.NewLogger(t))
	firstErrCh, firstCancel := runServer(t, first)
	defer firstCancel()

	host, portStr, err := net.SplitHostPort(first.Addr())
	require.NoError(t, err)
	port, err := strconv.Atoi(portStr)
	require.NoError(t, err)

	conflicting := testConfig()
	conflicting.Host = host
	conflicting.Port = port

	second := httpserver.New(conflicting, http.NotFoundHandler(), zaptest.NewLogger(t))
	err = second.Run(context.Background())
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "listen")

	firstCancel()
	<-firstErrCh
}

func TestConfig_Validate(t *testing.T) {
	t.Parallel()

	cases := map[string]struct {
		mutate func(c *httpserver.Config)
		errSub string
	}{
		"default ok": {
			mutate: func(c *httpserver.Config) {},
			errSub: "",
		},
		"port too high": {
			mutate: func(c *httpserver.Config) { c.Port = 70000 },
			errSub: "invalid port",
		},
		"negative read timeout": {
			mutate: func(c *httpserver.Config) { c.ReadTimeout = -1 },
			errSub: "ReadTimeout",
		},
		"tls missing files": {
			mutate: func(c *httpserver.Config) { c.TLS = &httpserver.TLSConfig{} },
			errSub: "TLS requires",
		},
	}

	for name, tc := range cases {
		t.Run(name, func(t *testing.T) {
			cfg := httpserver.DefaultConfig()
			tc.mutate(&cfg)
			err := cfg.Validate()
			if tc.errSub == "" {
				assert.NoError(t, err)
				return
			}
			require.Error(t, err)
			assert.Contains(t, err.Error(), tc.errSub)
		})
	}
}
