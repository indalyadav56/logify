package logify

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// captureServer records the decoded request bodies it receives.
func captureServer(t *testing.T, status int) (*httptest.Server, *[]map[string]any) {
	t.Helper()
	var (
		mu   sync.Mutex
		body []map[string]any
	)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != defaultIngestPath {
			t.Errorf("unexpected path %q", r.URL.Path)
		}
		if r.Method != http.MethodPost {
			t.Errorf("unexpected method %q", r.Method)
		}
		var m map[string]any
		_ = json.NewDecoder(r.Body).Decode(&m)
		mu.Lock()
		body = append(body, m)
		mu.Unlock()
		w.WriteHeader(status)
		_, _ = w.Write([]byte(`{"message":"log received"}`))
	}))
	t.Cleanup(srv.Close)
	return srv, &body
}

func TestSendSync(t *testing.T) {
	srv, got := captureServer(t, http.StatusAccepted)

	c, err := New(
		WithBaseURL(srv.URL),
		WithService("payment-api"),
		WithEnvironment("production"),
		WithDefaultTags(map[string]string{"region": "ap-south-1"}),
	)
	if err != nil {
		t.Fatal(err)
	}

	err = c.Error(context.Background(), "payment failed",
		WithEntryTrace("trace-1", "span-1"),
		WithEntryMetadataValue("order.id", "order_998877"),
		WithEntryTag("cluster", "eks-prod"),
	)
	if err != nil {
		t.Fatalf("Error returned: %v", err)
	}

	if len(*got) != 1 {
		t.Fatalf("expected 1 request, got %d", len(*got))
	}
	rec := (*got)[0]
	if rec["level"] != "ERROR" {
		t.Errorf("level = %v, want ERROR", rec["level"])
	}
	if rec["service"] != "payment-api" {
		t.Errorf("service = %v, want payment-api (default)", rec["service"])
	}
	if rec["environment"] != "production" {
		t.Errorf("environment = %v, want production", rec["environment"])
	}
	if rec["trace_id"] != "trace-1" {
		t.Errorf("trace_id = %v, want trace-1", rec["trace_id"])
	}
	tags, _ := rec["tags"].(map[string]any)
	if tags["region"] != "ap-south-1" || tags["cluster"] != "eks-prod" {
		t.Errorf("tags = %v, want merged default + entry tags", tags)
	}
	meta, _ := rec["metadata"].(map[string]any)
	if meta["order.id"] != "order_998877" {
		t.Errorf("metadata = %v, want order.id set", meta)
	}
	if _, ok := rec["timestamp"]; !ok {
		t.Errorf("timestamp should be auto-populated")
	}
}

func TestSendRequiresLevel(t *testing.T) {
	srv, _ := captureServer(t, http.StatusAccepted)
	c, _ := New(WithBaseURL(srv.URL))
	if err := c.Send(context.Background(), Entry{Message: "no level"}); err == nil {
		t.Fatal("expected error for missing level")
	}
}

func TestAPIError(t *testing.T) {
	srv, _ := captureServer(t, http.StatusInternalServerError)
	c, _ := New(WithBaseURL(srv.URL))
	err := c.Info(context.Background(), "boom")
	apiErr, ok := err.(*APIError)
	if !ok {
		t.Fatalf("expected *APIError, got %T (%v)", err, err)
	}
	if apiErr.StatusCode != http.StatusInternalServerError {
		t.Errorf("status = %d, want 500", apiErr.StatusCode)
	}
}

func TestAsyncDeliveryAndClose(t *testing.T) {
	var count int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt32(&count, 1)
		w.WriteHeader(http.StatusAccepted)
	}))
	defer srv.Close()

	c, err := New(
		WithBaseURL(srv.URL),
		WithAsync(true),
		WithWorkers(2),
		WithBufferSize(100),
	)
	if err != nil {
		t.Fatal(err)
	}

	const n = 50
	for i := 0; i < n; i++ {
		if err := c.Info(context.Background(), "msg"); err != nil {
			t.Fatalf("Info[%d]: %v", i, err)
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := c.Close(ctx); err != nil {
		t.Fatalf("Close: %v", err)
	}

	if got := atomic.LoadInt32(&count); got != n {
		t.Errorf("delivered %d logs, want %d", got, n)
	}

	// Sending after close must fail rather than panic on the closed channel.
	if err := c.Send(context.Background(), Entry{Level: LevelInfo}); err != ErrClosed {
		t.Errorf("after close: err = %v, want ErrClosed", err)
	}
}

func TestTrySendBufferFull(t *testing.T) {
	block := make(chan struct{})
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		<-block
		w.WriteHeader(http.StatusAccepted)
	}))
	defer srv.Close()
	defer close(block)

	c, _ := New(
		WithBaseURL(srv.URL),
		WithAsync(true),
		WithWorkers(1),
		WithBufferSize(1),
	)

	// Fill the single worker and the single buffer slot, then overflow.
	var full bool
	for i := 0; i < 20; i++ {
		if err := c.TrySend(Entry{Level: LevelInfo, Message: "x"}); err == ErrBufferFull {
			full = true
			break
		}
	}
	if !full {
		t.Fatal("expected ErrBufferFull once buffer saturated")
	}
}

func TestNewRequiresBaseURL(t *testing.T) {
	if _, err := New(); err == nil {
		t.Fatal("expected error when base URL is missing")
	}
}
