package messaging

import (
	"context"
	"fmt"
	"time"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
	"github.com/segmentio/kafka-go"
)

// Producer wraps a kafka.Writer for publishing messages.
type Producer struct {
	writer *kafka.Writer
}

// NewProducer creates a new Kafka producer for the given topic.
func NewProducer(cfg config.KafkaConfig, topic string) *Producer {
	writer := &kafka.Writer{
		Addr:         kafka.TCP(cfg.Brokers...),
		Topic:        topic,
		Balancer:     &kafka.LeastBytes{},
		BatchTimeout: 10 * time.Millisecond,
		RequiredAcks: kafka.RequireAll,
		Compression:  kafka.Snappy,
		MaxAttempts:  5,
	}

	return &Producer{writer: writer}
}

// Publish sends a message to the Kafka topic.
func (p *Producer) Publish(ctx context.Context, key, value []byte) error {
	msg := kafka.Message{
		Key:   key,
		Value: value,
	}

	if err := p.writer.WriteMessages(ctx, msg); err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}

	return nil
}

// Close shuts down the producer.
func (p *Producer) Close() error {
	return p.writer.Close()
}

// Consumer wraps a kafka.Reader for consuming messages.
type Consumer struct {
	reader *kafka.Reader
}

// NewConsumer creates a new Kafka consumer for the given topic.
func NewConsumer(cfg config.KafkaConfig, topic string) *Consumer {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: cfg.Brokers,
		Topic:   topic,
		// GroupID:  cfg.GroupID,
		MinBytes: 10e3, // 10KB
		MaxBytes: 10e6, // 10MB
	})

	return &Consumer{reader: reader}
}

// Consume reads the next message from the Kafka topic.
func (c *Consumer) Consume(ctx context.Context) (kafka.Message, error) {
	msg, err := c.reader.ReadMessage(ctx)
	if err != nil {
		return kafka.Message{}, fmt.Errorf("failed to consume message: %w", err)
	}
	return msg, nil
}

// Close shuts down the consumer.
func (c *Consumer) Close() error {
	return c.reader.Close()
}
