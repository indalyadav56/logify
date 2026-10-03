//go:build integration

package di

import (
	"context"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
	"github.com/stretchr/testify/require"
)

func TestEnsureKafkaTopicsIntegration(t *testing.T) {
	configured := os.Getenv("LOGIFY_TEST_KAFKA_BROKERS")
	if configured == "" {
		t.Skip("set LOGIFY_TEST_KAFKA_BROKERS to a development Kafka broker")
	}
	brokers := strings.Split(configured, ",")
	topic := "logify-ingest-test-" + uuid.NewString()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	client := &kafka.Client{Addr: kafka.TCP(brokers...), Timeout: 10 * time.Second}
	t.Cleanup(func() {
		cleanupCtx, cleanupCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cleanupCancel()
		response, err := client.DeleteTopics(cleanupCtx, &kafka.DeleteTopicsRequest{Topics: []string{topic}})
		if err != nil {
			t.Errorf("remove test topic: %v", err)
			return
		}
		if err := response.Errors[topic]; err != nil {
			t.Errorf("remove test topic: %v", err)
		}
	})

	// This starts with a unique, missing topic. Both first startup and repeat
	// startup must allow a publish without relying on broker auto-creation.
	require.NoError(t, ensureKafkaTopics(ctx, brokers, topic))
	require.NoError(t, ensureKafkaTopics(ctx, brokers, topic))
	writer := &kafka.Writer{Addr: kafka.TCP(brokers...), Topic: topic, RequiredAcks: kafka.RequireAll}
	defer writer.Close()
	require.NoError(t, writer.WriteMessages(ctx, kafka.Message{Key: []byte("project"), Value: []byte("hello")}))

	reader := kafka.NewReader(kafka.ReaderConfig{Brokers: brokers, Topic: topic, Partition: 0, MinBytes: 1, MaxBytes: 1e6})
	defer reader.Close()
	message, err := reader.ReadMessage(ctx)
	require.NoError(t, err)
	require.Equal(t, "project", string(message.Key))
	require.Equal(t, "hello", string(message.Value))
}
