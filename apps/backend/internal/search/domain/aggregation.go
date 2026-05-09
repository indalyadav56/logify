package domain

import "time"

// AggregationRequest describes what to aggregate over and how to group results.
type AggregationRequest struct {
	Query    Query
	GroupBy  string // column to group by: "level", "service", "environment", "host", "source", "namespace"
	Interval string // non-empty enables histogram mode: "1m", "5m", "1h", "1d"
}

// AggregationResult holds the computed buckets.
type AggregationResult struct {
	Buckets []AggBucket
}

// AggBucket is one cell in the result.
// Timestamp is set in histogram mode; Key holds the group value in both modes.
type AggBucket struct {
	Timestamp *time.Time
	Key       string
	Count     uint64
}
