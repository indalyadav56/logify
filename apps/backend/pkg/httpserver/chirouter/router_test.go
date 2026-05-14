package chirouter_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap/zaptest"

	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/chirouter"
)

func TestNew_DefaultsAddRequestIDAndCORS(t *testing.T) {
	r := chirouter.New(chirouter.Options{Logger: zaptest.NewLogger(t)})
	r.Get("/ping", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("pong"))
	})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	req.Header.Set("Origin", "https://example.com")
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.NotEmpty(t, rec.Header().Get("X-Request-ID"))
	assert.Equal(t, "*", rec.Header().Get("Access-Control-Allow-Origin"))
}

func TestNew_PreflightHandled(t *testing.T) {
	r := chirouter.New(chirouter.Options{Logger: zaptest.NewLogger(t)})
	r.Get("/api", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodOptions, "/api", nil)
	req.Header.Set("Origin", "https://example.com")
	req.Header.Set("Access-Control-Request-Method", "GET")
	r.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNoContent, rec.Code)
	assert.Equal(t, "*", rec.Header().Get("Access-Control-Allow-Origin"))
}

func TestNew_RecoversFromPanic(t *testing.T) {
	r := chirouter.New(chirouter.Options{Logger: zaptest.NewLogger(t)})
	r.Get("/boom", func(http.ResponseWriter, *http.Request) { panic("oops") })

	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/boom", nil))

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "INTERNAL_ERROR")
}

func TestNew_AllowedOriginsRestrictsCORS(t *testing.T) {
	r := chirouter.New(chirouter.Options{
		Logger:             zaptest.NewLogger(t),
		AllowedCORSOrigins: []string{"https://allowed.example"},
	})
	r.Get("/ping", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("pong"))
	})

	// Allowed origin echoes back.
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	req.Header.Set("Origin", "https://allowed.example")
	r.ServeHTTP(rec, req)
	assert.Equal(t, "https://allowed.example", rec.Header().Get("Access-Control-Allow-Origin"))

	// Disallowed origin gets no Allow-Origin header.
	rec = httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodGet, "/ping", nil)
	req.Header.Set("Origin", "https://evil.example")
	r.ServeHTTP(rec, req)
	assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
}

func TestNew_TimeoutEnforced(t *testing.T) {
	r := chirouter.New(chirouter.Options{
		Logger:  zaptest.NewLogger(t),
		Timeout: 10 * time.Millisecond,
	})
	r.Get("/slow", func(w http.ResponseWriter, req *http.Request) {
		select {
		case <-req.Context().Done():
			// chi's Timeout middleware already wrote a 503; just return.
			return
		case <-time.After(100 * time.Millisecond):
			w.WriteHeader(http.StatusOK)
		}
	})

	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/slow", nil))
	// chi's Timeout middleware writes 504 on deadline exceeded.
	assert.Equal(t, http.StatusGatewayTimeout, rec.Code)
}
