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
	"github.com/elastic/go-elasticsearch/v8"
)

type LogService interface {
	PublishLog(log string) error
	Search(query string) (interface{}, error)
	GetAllServices() (interface{}, error)
	LogConsumer() error
}

type logService struct {
	logRepo  repository.LogRepository
	log      logger.Logger
	esClient *elasticsearch.Client
}

func NewLogService(repo repository.LogRepository, log logger.Logger, esClient *elasticsearch.Client) *logService {
	return &logService{
		logRepo:  repo,
		log:      log,
		esClient: esClient,
	}
}

func (s *logService) PublishLog(log string) error {
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
		fmt.Printf("error publishing message: %v", err)
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
					// {
					// 	"match": map[string]interface{}{
					// 		"log": "info",
					// 	},
					// },
				},
			},
		},
	}

	jsonQuery, err := json.Marshal(query)
	if err != nil {
		log.Fatalf("Error marshaling query: %s", err)
	}

	searchRes, err := s.esClient.Search(
		s.esClient.Search.WithContext(context.Background()),
		s.esClient.Search.WithIndex("indal"),
		// s.esClient.Search.WithIndex("project-1-logify-*"),
		s.esClient.Search.WithBody(bytes.NewReader(jsonQuery)),
	)
	if err != nil {
		log.Fatalf("Error searching documents: %s", err)
	}
	defer searchRes.Body.Close()

	// Parse search results
	var result map[string]interface{}
	if err := json.NewDecoder(searchRes.Body).Decode(&result); err != nil {
		log.Fatalf("Error parsing search response: %s", err)
	}

	logs := []map[string]interface{}{}
	hits := result["hits"].(map[string]interface{})["hits"].([]interface{})
	for _, hit := range hits {
		source := hit.(map[string]interface{})["_source"].(map[string]interface{})
		logs = append(logs, source)
	}

	return logs, nil

}

func (s *logService) GetAllServices() (interface{}, error) {
	esQuery := map[string]interface{}{
		"size": 0,
		"aggs": map[string]interface{}{
			"unique_services": map[string]interface{}{
				"terms": map[string]interface{}{
					"field": "service.keyword",
					"size":  1000,
				},
			},
		},
	}

	jsonQuery, err := json.Marshal(esQuery)
	if err != nil {
		log.Fatalf("Error marshaling query: %s", err)
	}

	searchRes, err := s.esClient.Search(
		s.esClient.Search.WithContext(context.Background()),
		s.esClient.Search.WithIndex("indal"),
		s.esClient.Search.WithBody(bytes.NewReader(jsonQuery)),
	)
	if err != nil {
		log.Fatalf("Error searching documents: %s", err)
	}
	defer searchRes.Body.Close()

	// Parse search results
	var result map[string]interface{}
	if err := json.NewDecoder(searchRes.Body).Decode(&result); err != nil {
		log.Fatalf("Error parsing search response: %s", err)
	}

	services := []string{}
	for _, service := range result["aggregations"].(map[string]interface{})["unique_services"].(map[string]interface{})["buckets"].([]interface{}) {
		services = append(services, service.(map[string]interface{})["key"].(string))
	}

	return services, nil
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

			// testing insert
			_, err = es.Index("indal", bytes.NewReader(msg.Payload))
			if err != nil {
				log.Fatalf("Error inserting document: %v", err)
			}

			msg.Ack()
		}
	}()

	return nil
}
