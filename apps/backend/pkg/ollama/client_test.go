package ollama

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestEmbed_success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/embeddings" {
			t.Fatalf("path: %s", r.URL.Path)
		}
		var req embeddingsRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Fatal(err)
		}
		if req.Model != "test-model" || req.Prompt != "hello" {
			t.Fatalf("unexpected request: %+v", req)
		}
		_ = json.NewEncoder(w).Encode(embeddingsResponse{Embedding: []float32{0.1, 0.2, 0.3}})
	}))
	defer srv.Close()

	c := NewClient(Config{BaseURL: srv.URL, Model: "test-model"})
	vec, err := c.Embed(context.Background(), "hello")
	if err != nil {
		t.Fatal(err)
	}
	if len(vec) != 3 {
		t.Fatalf("want 3 dims, got %d", len(vec))
	}
}
