package di

import (
	"context"
	"fmt"
	"net"

	"github.com/segmentio/kafka-go"
)

// ensureKafkaTopics creates topics if they do not already exist.
func ensureKafkaTopics(ctx context.Context, brokers []string, topics ...string) error {
	if len(brokers) == 0 {
		return fmt.Errorf("no kafka brokers configured")
	}

	conn, err := kafka.DialContext(ctx, "tcp", brokers[0])
	if err != nil {
		return fmt.Errorf("kafka dial: %w", err)
	}
	defer conn.Close()

	controller, err := conn.Controller()
	if err != nil {
		return fmt.Errorf("kafka controller: %w", err)
	}

	ctrlConn, err := kafka.DialContext(ctx, "tcp", net.JoinHostPort(controller.Host, fmt.Sprintf("%d", controller.Port)))
	if err != nil {
		return fmt.Errorf("kafka dial controller: %w", err)
	}
	defer ctrlConn.Close()

	specs := make([]kafka.TopicConfig, len(topics))
	for i, t := range topics {
		specs[i] = kafka.TopicConfig{
			Topic:             t,
			NumPartitions:     1,
			ReplicationFactor: 1,
		}
	}

	if err := ctrlConn.CreateTopics(specs...); err != nil {
		return fmt.Errorf("kafka create topics: %w", err)
	}
	return nil
}
