package domain

import "context"

type Repository interface {
	Search(ctx context.Context, q Query) (*SearchResult, error)
	GetByID(ctx context.Context, tenantID, logID string) (*LogEntry, error)
	Aggregate(ctx context.Context, agg AggregationRequest) (*AggregationResult, error)
}
