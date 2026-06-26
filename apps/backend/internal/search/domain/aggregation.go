package domain

import "time"

type AggregationRequest struct {
	Query    Query
	GroupBy  string
	Interval string
}

type AggregationResult struct {
	Buckets []AggBucket
}

type AggBucket struct {
	Timestamp *time.Time
	Key       string
	Count     uint64
}
