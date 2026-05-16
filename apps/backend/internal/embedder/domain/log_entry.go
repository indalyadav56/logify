package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/pgvector/pgvector-go"
)

// EmbeddingDimensions matches qwen3-embedding:8b output size and the logs table.
const EmbeddingDimensions = 4096

// LogEntry is a log row stored with its vector embedding.
type LogEntry struct {
	ID        uuid.UUID
	Metadata  json.RawMessage
	Embedding pgvector.Vector
	CreatedAt time.Time
}
