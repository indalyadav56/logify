package ollama

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const defaultBaseURL = "http://localhost:11434"

// Config configures the Ollama HTTP client.
type Config struct {
	BaseURL string
	Model   string
	Timeout time.Duration
}

// Client calls Ollama's REST API.
type Client struct {
	baseURL    string
	model      string
	httpClient *http.Client
}

// NewClient returns a client with sane defaults.
func NewClient(cfg Config) *Client {
	baseURL := strings.TrimRight(strings.TrimSpace(cfg.BaseURL), "/")
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	model := strings.TrimSpace(cfg.Model)
	if model == "" {
		model = "qwen3-embedding:8b"
	}
	timeout := cfg.Timeout
	if timeout <= 0 {
		timeout = 60 * time.Second
	}
	return &Client{
		baseURL: baseURL,
		model:   model,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

type embeddingsRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
}

type embeddingsResponse struct {
	Embedding []float32 `json:"embedding"`
}

// Embed returns a vector for the given text via POST /api/embeddings.
func (c *Client) Embed(ctx context.Context, prompt string) ([]float32, error) {
	body, err := json.Marshal(embeddingsRequest{
		Model:  c.model,
		Prompt: prompt,
	})
	if err != nil {
		return nil, fmt.Errorf("ollama: marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/api/embeddings", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("ollama: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ollama: request failed: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("ollama: read body: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ollama: status %d: %s", resp.StatusCode, strings.TrimSpace(string(raw)))
	}

	var out embeddingsResponse
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, fmt.Errorf("ollama: decode response: %w", err)
	}
	if len(out.Embedding) == 0 {
		return nil, fmt.Errorf("ollama: empty embedding in response")
	}
	return out.Embedding, nil
}
