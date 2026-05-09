package domain

import "context"

type LogProducer interface {
	Produce(ctx context.Context, log Log) error
}
