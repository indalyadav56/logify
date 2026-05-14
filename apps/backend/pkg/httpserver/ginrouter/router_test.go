package ginrouter_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap/zaptest"

	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/ginrouter"
)

func TestNew_DefaultsAddRequestID(t *testing.T) {
	r := ginrouter.New(ginrouter.Options{Logger: zaptest.NewLogger(t)})
	r.GET("/ping", func(c *gin.Context) { c.String(http.StatusOK, "pong") })

	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/ping", nil))

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.NotEmpty(t, rec.Header().Get("X-Request-ID"))
}

func TestNew_CORSPreflight(t *testing.T) {
	r := ginrouter.New(ginrouter.Options{Logger: zaptest.NewLogger(t)})
	// gin-contrib/cors only short-circuits OPTIONS when the OPTIONS route is
	// registered (upstream cors tests do the same).
	r.GET("/api", func(c *gin.Context) { c.String(http.StatusOK, "ok") })
	r.OPTIONS("/api", func(c *gin.Context) {})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodOptions, "/api", nil)
	// Origin must differ from req.Host (httptest defaults Host to "example.com"),
	// otherwise gin-contrib/cors treats this as a same-origin request and skips.
	req.Header.Set("Origin", "https://client.example")
	req.Header.Set("Access-Control-Request-Method", "GET")
	r.ServeHTTP(rec, req)

	assert.Equal(t, "*", rec.Header().Get("Access-Control-Allow-Origin"))
}

func TestNew_RecoversFromPanic(t *testing.T) {
	r := ginrouter.New(ginrouter.Options{Logger: zaptest.NewLogger(t)})
	r.GET("/boom", func(c *gin.Context) { panic("oops") })

	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/boom", nil))

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Contains(t, rec.Body.String(), "INTERNAL_ERROR")
}

func TestNew_DisableFlagsTurnMiddlewareOff(t *testing.T) {
	r := ginrouter.New(ginrouter.Options{
		Logger:           zaptest.NewLogger(t),
		DisableRequestID: true,
		DisableCORS:      true,
	})
	r.GET("/api", func(c *gin.Context) { c.String(http.StatusOK, "ok") })
	r.OPTIONS("/api", func(c *gin.Context) {})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodOptions, "/api", nil)
	req.Header.Set("Origin", "https://client.example")
	req.Header.Set("Access-Control-Request-Method", "GET")
	r.ServeHTTP(rec, req)

	assert.Empty(t, rec.Header().Get("X-Request-ID"))
	assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
}
