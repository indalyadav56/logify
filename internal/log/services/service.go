package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"common/pkg/logger"
	"logify/internal/log/repository"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v3/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/elastic/go-elasticsearch/v7"
)

type LogService interface {
	PublishLog(log string) error
	Search(query string) (interface{}, error)
	LogConsumer() error
}

type logService struct {
	logRepo repository.LogRepository
	log     logger.Logger
	// esClient *elasticsearch.Client
}

func NewLogService(repo repository.LogRepository, log logger.Logger) *logService {
	return &logService{
		logRepo: repo,
		log:     log,
		// esClient: esClient,
	}
}

func (s *logService) PublishLog(log string) error {
	// config := sarama.NewConfig()
	// config.Producer.RequiredAcks = sarama.WaitForAll
	// config.Producer.Return.Successes = true

	// producer, err := sarama.NewSyncProducer([]string{"localhost:9092"}, config)
	// if err != nil {
	// 	fmt.Println(err)
	// }
	// defer producer.Close()

	// msg := &sarama.ProducerMessage{
	// 	Topic: "logify",
	// 	Value: sarama.StringEncoder(log),
	// }

	// _, _, err = producer.SendMessage(msg)
	// if err != nil {
	// 	fmt.Println(err)
	// }

	// Create Kafka publisher
	publisher, err := kafka.NewPublisher(
		kafka.PublisherConfig{
			Brokers:   []string{"localhost:9092"},
			Marshaler: kafka.DefaultMarshaler{},
		},
		watermill.NewStdLogger(false, false),
	)
	if err != nil {
		fmt.Println(err)
	}

	// Topic to publish logs
	topic := "logify"

	msg := message.NewMessage(watermill.NewUUID(), []byte(log))

	// Publish message
	if err := publisher.Publish(topic, msg); err != nil {
		fmt.Println("error publishing message: %v", err)
	} else {
		fmt.Printf("Published log: %s\n", log)
	}

	return nil
}

func (s *logService) Search(search string) (interface{}, error) {
	query := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must": []map[string]interface{}{
					{
						"match": map[string]interface{}{
							"log": "info",
						},
					},
				},
			},
		},
	}

	// Initialize Elasticsearch client
	cfg := elasticsearch.Config{
		Addresses: []string{"http://localhost:9200"},
	}

	es, err := elasticsearch.NewClient(cfg)
	if err != nil {
		fmt.Println("Error creating client: %s", err)
	}

	jsonQuery, err := json.Marshal(query)
	if err != nil {
		fmt.Println("Error marshaling query: %s", err)
	}

	searchRes, err := es.Search(
		es.Search.WithContext(context.Background()),
		es.Search.WithIndex("my_logs*"),
		es.Search.WithBody(bytes.NewReader(jsonQuery)),
	)
	if err != nil {
		fmt.Println("Error searching documents: %s", err)
	}
	defer searchRes.Body.Close()

	// Parse search results
	var result map[string]interface{}
	if err := json.NewDecoder(searchRes.Body).Decode(&result); err != nil {
		fmt.Println("Error parsing search response: %s", err)
	}

	logs := []map[string]interface{}{}
	// Print search results
	hits := result["hits"].(map[string]interface{})["hits"].([]interface{})
	for _, hit := range hits {
		source := hit.(map[string]interface{})["_source"].(map[string]interface{})
		logs = append(logs, source)
		fmt.Printf("Found document: %v\n", source)
	}

	return logs, nil

}

func (s *logService) LogConsumer() error {
	subscriber, err := kafka.NewSubscriber(
		kafka.SubscriberConfig{
			Brokers:       []string{"localhost:9092"},
			Unmarshaler:   kafka.DefaultMarshaler{},
			ConsumerGroup: "log-consumer-group",
		},
		watermill.NewStdLogger(false, false),
	)
	if err != nil {
		log.Fatal(err)
	}

	// Subscribe to the "logs" topic
	messages, err := subscriber.Subscribe(context.Background(), "logify")
	if err != nil {
		log.Fatal(err)
	}

	es, err := elasticsearch.NewDefaultClient()
	if err != nil {
		log.Fatalf("Error creating Elasticsearch client: %v", err)
	}

	// Process messages
	go func() {
		for msg := range messages {
			type LogEntry struct {
				Timestamp time.Time `json:"@timestamp"`
				Log       string    `json:"log"`
			}

			data, err := json.Marshal(LogEntry{
				Timestamp: time.Now(),
				Log:       string(msg.Payload),
			})
			if err != nil {
				log.Fatalf("Error marshaling log entry: %v", err)
			}

			// Insert document
			index := fmt.Sprintf("%s-logify-%s", "project-1", time.Now().Format("2006-01-02"))
			_, err = es.Index(index, bytes.NewReader(data))
			if err != nil {
				log.Fatalf("Error inserting document: %v", err)
			}

			msg.Ack()
		}
	}()

	return nil
}
