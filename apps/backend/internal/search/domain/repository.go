package domain

import "context"

// Repository is the port for log search storage.
// Implemented by infrastructure adapters (ClickHouse, Elasticsearch, in-memory for tests).
// The application layer depends on this interface, not on any specific tech.
type Repository interface {
	Search(ctx context.Context, q Query) (*SearchResult, error)
	GetByID(ctx context.Context, tenantID, logID string) (*LogEntry, error)
	Aggregate(ctx context.Context, agg AggregationRequest) (*AggregationResult, error)
}
