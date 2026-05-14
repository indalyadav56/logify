// Package ginrouter constructs a *gin.Engine pre-wired with the common
// middleware stack used across the app: recovery, request ID, CORS, and a zap
// access logger.
//
// The returned *gin.Engine satisfies http.Handler, so it plugs directly into
// pkg/httpserver:
//
//	engine := ginrouter.New(ginrouter.Options{Logger: log})
//	srv := httpserver.New(httpserver.DefaultConfig(), engine, log)
//	_ = srv.Run(ctx)
package ginrouter

import (
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/middleware"
)

// Options configures the Gin engine. The zero value is "batteries included":
// recovery, request ID, CORS, and access logger are all enabled.
//
// Use the Disable* flags to opt out of individual middleware.
type Options struct {
	// Logger is used by the access logger and panic recovery. Required when
	// either is enabled. If nil, a no-op logger is used.
	Logger *zap.Logger

	// Mode selects gin.DebugMode, gin.ReleaseMode, or gin.TestMode.
	// Empty defaults to gin.ReleaseMode.
	Mode string

	DisableRecovery  bool
	DisableRequestID bool
	DisableCORS      bool
	DisableLogger    bool
}

// New returns a Gin engine wired with the selected middleware.
func New(opts Options) *gin.Engine {
	if opts.Mode == "" {
		opts.Mode = gin.ReleaseMode
	}
	gin.SetMode(opts.Mode)

	log := opts.Logger
	if log == nil {
		log = zap.NewNop()
	}

	engine := gin.New()

	if !opts.DisableRecovery {
		engine.Use(middleware.RecoveryMiddleware(log))
	}
	if !opts.DisableRequestID {
		engine.Use(middleware.RequestIDMiddleware())
	}
	if !opts.DisableCORS {
		engine.Use(middleware.CORSMiddleware())
	}
	if !opts.DisableLogger {
		engine.Use(accessLogger(log))
	}

	return engine
}

// accessLogger emits a single structured zap entry per request.
func accessLogger(log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		if raw != "" {
			path = path + "?" + raw
		}

		fields := []zap.Field{
			zap.Int("status", c.Writer.Status()),
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.String("client_ip", c.ClientIP()),
			zap.Duration("latency", time.Since(start)),
			zap.Int("bytes", c.Writer.Size()),
		}
		if rid, ok := c.Get("request_id"); ok {
			if s, ok := rid.(string); ok && s != "" {
				fields = append(fields, zap.String("request_id", s))
			}
		}

		switch {
		case c.Writer.Status() >= 500:
			log.Error("http request", fields...)
		case c.Writer.Status() >= 400:
			log.Warn("http request", fields...)
		default:
			log.Info("http request", fields...)
		}
	}
}
