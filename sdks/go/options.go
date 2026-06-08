package logify

import (
	"net/http"
	"time"
)

// defaults used when the corresponding option is not supplied.
const (
	defaultTimeout       = 10 * time.Second
	defaultIngestPath    = "/v1/logs"
	defaultSource        = "golang"
	defaultBufferSize    = 1024
	defaultWorkers       = 4
	defaultFlushInterval = 5 * time.Second
)

// config holds the resolved client configuration.
type config struct {
	baseURL    string
	ingestPath string
	apiKey     string
	httpClient *http.Client
	userAgent  string

	// defaults applied to every entry when its field is empty.
	defaults Entry

	// async settings
	async         bool
	bufferSize    int
	workers       int
	flushInterval time.Duration
	onError       func(Entry, error)
}

// Option configures a Client.
type Option func(*config)

// WithBaseURL sets the backend base URL, e.g. "http://localhost:8080".
// This is required.
func WithBaseURL(url string) Option {
	return func(c *config) { c.baseURL = url }
}

// WithIngestPath overrides the ingest path (default "/v1/logs").
func WithIngestPath(path string) Option {
	return func(c *config) { c.ingestPath = path }
}

// WithAPIKey sets the API key sent in the "X-API-Key" header on every request.
func WithAPIKey(key string) Option {
	return func(c *config) { c.apiKey = key }
}

// WithHTTPClient supplies a custom *http.Client. When set, WithTimeout is
// ignored — configure the timeout on the provided client instead.
func WithHTTPClient(client *http.Client) Option {
	return func(c *config) { c.httpClient = client }
}

// WithTimeout sets the per-request timeout for the default HTTP client.
func WithTimeout(d time.Duration) Option {
	return func(c *config) {
		if c.httpClient == nil {
			c.httpClient = &http.Client{}
		}
		c.httpClient.Timeout = d
	}
}

// WithUserAgent overrides the User-Agent header.
func WithUserAgent(ua string) Option {
	return func(c *config) { c.userAgent = ua }
}

// WithProjectID sets the default project ID applied to entries that don't set one.
func WithProjectID(id string) Option {
	return func(c *config) { c.defaults.ProjectID = id }
}

// WithService sets the default service name.
func WithService(s string) Option {
	return func(c *config) { c.defaults.Service = s }
}

// WithNamespace sets the default namespace (service_namespace).
func WithNamespace(ns string) Option {
	return func(c *config) { c.defaults.Namespace = ns }
}

// WithEnvironment sets the default environment, e.g. "production".
func WithEnvironment(env string) Option {
	return func(c *config) { c.defaults.Environment = env }
}

// WithHostname sets the default hostname. If never set, the client falls back
// to os.Hostname() at construction time.
func WithHostname(h string) Option {
	return func(c *config) { c.defaults.Hostname = h }
}

// WithSource sets the default source (default "golang").
func WithSource(s string) Option {
	return func(c *config) { c.defaults.Source = s }
}

// WithDefaultTags sets tags merged into every entry (entry tags take precedence).
func WithDefaultTags(tags map[string]string) Option {
	return func(c *config) {
		if c.defaults.Tags == nil {
			c.defaults.Tags = make(map[string]string, len(tags))
		}
		for k, v := range tags {
			c.defaults.Tags[k] = v
		}
	}
}

// WithAsync enables background, buffered delivery. Logs are enqueued and sent by
// a pool of workers. Call Close to drain the buffer on shutdown.
func WithAsync(enabled bool) Option {
	return func(c *config) { c.async = enabled }
}

// WithBufferSize sets the async buffer capacity (default 1024). When the buffer
// is full, Send/Enqueue behaviour depends on the calling method.
func WithBufferSize(n int) Option {
	return func(c *config) { c.bufferSize = n }
}

// WithWorkers sets the number of async sender goroutines (default 4).
func WithWorkers(n int) Option {
	return func(c *config) { c.workers = n }
}

// WithFlushInterval is accepted for forward compatibility with batched
// delivery. It currently has no effect because each log is sent individually.
func WithFlushInterval(d time.Duration) Option {
	return func(c *config) { c.flushInterval = d }
}

// WithErrorHandler registers a callback invoked when an async send fails.
// Without it, async errors are dropped silently.
func WithErrorHandler(fn func(Entry, error)) Option {
	return func(c *config) { c.onError = fn }
}
