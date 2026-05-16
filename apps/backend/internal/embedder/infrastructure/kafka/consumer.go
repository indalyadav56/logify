package kafka

import (
	"context"

	segmentio "github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

// LogConsumer reads log messages from Kafka and invokes a handler per message.
type LogConsumer struct {
	reader *segmentio.Reader
	logger *zap.Logger
}

func NewLogConsumer(reader *segmentio.Reader, logger *zap.Logger) *LogConsumer {
	return &LogConsumer{
		reader: reader,
		logger: logger.Named("embedder_kafka_consumer"),
	}
}

func (c *LogConsumer) Consume(ctx context.Context, handler func(ctx context.Context, msg []byte) error) error {
	c.logger.Info("consuming log messages for embedding",
		zap.String("topic", c.reader.Config().Topic),
		zap.String("group_id", c.reader.Config().GroupID),
	)

	for {
		msg, err := c.reader.FetchMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return ctx.Err()
			}
			c.logger.Error("fetch message failed", zap.Error(err))
			continue
		}

		if err := handler(ctx, msg.Value); err != nil {
			c.logger.Error("handle message failed", zap.Error(err))
			continue
		}

		if err := c.reader.CommitMessages(ctx, msg); err != nil {
			c.logger.Error("commit message failed", zap.Error(err))
		}
	}
}
