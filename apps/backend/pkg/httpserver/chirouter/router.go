// Package chirouter constructs a *chi.Mux pre-wired with the common
// middleware stack: recovery, request ID, CORS, and a zap access logger.
//
// The returned *chi.Mux satisfies http.Handler, so it plugs directly into
// pkg/httpserver:
//
//	mux := chirouter.New(chirouter.Options{Logger: log})
//	srv := httpserver.New(httpserver.DefaultConfig(), mux, log)
//	_ = srv.Run(ctx)
package chirouter

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

// Options configures the Chi mux. The zero value is "batteries included":
// recovery, request ID, CORS, and access logger are all enabled.
//
// Use the Disable* flags to opt out of individual middleware.
type Options struct {
	// Logger is used by the access logger and panic recovery. Required when
	// either is enabled. If nil, a no-op logger is used.
	Logger *zap.Logger

	// Timeout applies a per-request deadline. Zero disables the timeout
	// middleware.
	Timeout time.Duration

	// AllowedCORSOrigins overrides the default "*" allowlist.
	// Has no effect when DisableCORS is true.
	AllowedCORSOrigins []string

	DisableRecovery  bool
	DisableRequestID bool
	DisableCORS      bool
	DisableLogger    bool
	DisableRealIP    bool
}

// New returns a chi mux wired with the selected middleware.
func New(opts Options) *chi.Mux {
	log := opts.Logger
	if log == nil {
		log = zap.NewNop()
	}

	r := chi.NewRouter()

	if !opts.DisableRequestID {
		r.Use(chimw.RequestID)
		r.Use(exposeRequestID)
	}
	if !opts.DisableRealIP {
		r.Use(chimw.RealIP)
	}
	if !opts.DisableLogger {
		r.Use(accessLogger(log))
	}
	if !opts.DisableRecovery {
		r.Use(recovery(log))
	}
	if !opts.DisableCORS {
		r.Use(cors(opts.AllowedCORSOrigins))
	}
	if opts.Timeout > 0 {
		r.Use(chimw.Timeout(opts.Timeout))
	}

	return r
}

// exposeRequestID copies the chi-generated request id from the context to the
// X-Request-ID response header so clients see it. chi's RequestID middleware
// only writes the value to the request context.
func exposeRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if rid := chimw.GetReqID(r.Context()); rid != "" {
			w.Header().Set("X-Request-ID", rid)
		}
		next.ServeHTTP(w, r)
	})
}

// statusRecorder captures the response status for logging.
type statusRecorder struct {
	http.ResponseWriter
	status int
	bytes  int
}

func (s *statusRecorder) WriteHeader(status int) {
	s.status = status
	s.ResponseWriter.WriteHeader(status)
}
func (s *statusRecorder) Write(b []byte) (int, error) {
	if s.status == 0 {
		s.status = http.StatusOK
	}
	n, err := s.ResponseWriter.Write(b)
	s.bytes += n
	return n, err
}

func accessLogger(log *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rec := &statusRecorder{ResponseWriter: w}
			next.ServeHTTP(rec, r)

			path := r.URL.Path
			if r.URL.RawQuery != "" {
				path = path + "?" + r.URL.RawQuery
			}

			fields := []zap.Field{
				zap.Int("status", rec.status),
				zap.String("method", r.Method),
				zap.String("path", path),
				zap.String("client_ip", r.RemoteAddr),
				zap.Duration("latency", time.Since(start)),
				zap.Int("bytes", rec.bytes),
			}
			if rid := chimw.GetReqID(r.Context()); rid != "" {
				fields = append(fields, zap.String("request_id", rid))
			}

			switch {
			case rec.status >= 500:
				log.Error("http request", fields...)
			case rec.status >= 400:
				log.Warn("http request", fields...)
			default:
				log.Info("http request", fields...)
			}
		})
	}
}

func recovery(log *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if rec := recover(); rec != nil {
					if rec == http.ErrAbortHandler {
						// Re-panic per stdlib convention.
						panic(rec)
					}
					log.Error("panic recovered",
						zap.Any("error", rec),
						zap.String("path", r.URL.Path),
						zap.String("method", r.Method),
						zap.String("request_id", chimw.GetReqID(r.Context())),
					)
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusInternalServerError)
					_, _ = w.Write([]byte(`{"success":false,"error":{"code":"INTERNAL_ERROR","message":"An unexpected error occurred"}}`))
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// cors is a minimal CORS implementation that handles preflight (OPTIONS) and
// emits the standard Access-Control-* headers. Passing nil/empty origins is
// treated as "*".
func cors(allowed []string) func(http.Handler) http.Handler {
	allowedMap := map[string]struct{}{}
	allowAny := false
	if len(allowed) == 0 {
		allowAny = true
	} else {
		for _, o := range allowed {
			if o == "*" {
				allowAny = true
				break
			}
			allowedMap[o] = struct{}{}
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin != "" {
				if allowAny {
					w.Header().Set("Access-Control-Allow-Origin", "*")
				} else if _, ok := allowedMap[origin]; ok {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					w.Header().Add("Vary", "Origin")
				}
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Request-ID")
				w.Header().Set("Access-Control-Expose-Headers", "Content-Length, X-Request-ID")
				w.Header().Set("Access-Control-Max-Age", "43200")
			}
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
