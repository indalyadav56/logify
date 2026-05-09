package kafka

import (
	"context"

	segmentio "github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

type LogConsumer struct {
	reader *segmentio.Reader
	logger *zap.Logger
}

func NewLogConsumer(reader *segmentio.Reader, logger *zap.Logger) *LogConsumer {
	return &LogConsumer{
		reader: reader,
		logger: logger.Named("log_consumer"),
	}
}

func (c *LogConsumer) Consume(ctx context.Context, handler func(ctx context.Context, msg []byte) error) error {
	c.logger.Info("starting to consume messages from topic", zap.String("topic", c.reader.Config().Topic))
	
	for {
		msg, err := c.reader.FetchMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return ctx.Err()
			}
			c.logger.Error("failed to fetch message", zap.Error(err))
			continue
		}

		if err := handler(ctx, msg.Value); err != nil {
			c.logger.Error("failed to process message", zap.Error(err), zap.ByteString("msg", msg.Value))
			continue
		}

		if err := c.reader.CommitMessages(ctx, msg); err != nil {
			c.logger.Error("failed to commit message", zap.Error(err))
		}
	}
}
