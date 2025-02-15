package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"common/pkg/logger"
	"logify/internal/log/dto"
	"logify/internal/log/repository"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v3/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/elastic/go-elasticsearch/v8"
	"github.com/google/uuid"
)

type LogService interface {
	PublishLog(log *dto.LogRequest) error
	Search(req *dto.LogSearchRequest) (interface{}, error)
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

func (s *logService) PublishLog(log *dto.LogRequest) error {
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

	log.ID = uuid.New().String()
	byteData, err := json.Marshal(log)
	if err != nil {
		fmt.Println(err)
	}

	msg := message.NewMessage(watermill.NewUUID(), byteData)

	if err := publisher.Publish("logify", msg); err != nil {
		fmt.Printf("error publishing message: %v", err)
	} else {
		fmt.Printf("Published log: %s\n", log)
	}

	return nil
}

// BuildElasticsearchQuery constructs the Elasticsearch query from LogSearchRequest
func BuildElasticsearchQuery(req *dto.LogSearchRequest) (map[string]interface{}, error) {
	mustClauses := []map[string]interface{}{}

	// Add case-insensitive wildcard search for messages
	if len(req.MessageContains) > 0 {
		for _, msg := range req.MessageContains {
			mustClauses = append(mustClauses, map[string]interface{}{
				"multi_match": map[string]interface{}{
					"query":    msg,
					"type":     "best_fields",
					"operator": "AND",
				},
			})
		}
	}

	// **Case-insensitive match for `service` field (multiple values)**
	if len(req.Services) > 0 {
		serviceClauses := []map[string]interface{}{}
		for _, service := range req.Services {
			serviceClauses = append(serviceClauses, map[string]interface{}{
				"match": map[string]interface{}{
					"service": service,
				},
			})
		}
		mustClauses = append(mustClauses, map[string]interface{}{
			"bool": map[string]interface{}{
				"should":               serviceClauses,
				"minimum_should_match": 100, // At least one service must match
			},
		})
	}

	// **Case-insensitive match for `level` field (multiple values)**
	if len(req.Levels) > 0 {
		levelClauses := []map[string]interface{}{}
		for _, level := range req.Levels {
			levelClauses = append(levelClauses, map[string]interface{}{
				"match": map[string]interface{}{
					"level": level,
				},
			})
		}
		mustClauses = append(mustClauses, map[string]interface{}{
			"bool": map[string]interface{}{
				"should":               levelClauses,
				"minimum_should_match": 1, // At least one level must match
			},
		})
	}

	// Add timestamp range filter
	if req.TimestampRange.From != "" && req.TimestampRange.To != "" {
		mustClauses = append(mustClauses, map[string]interface{}{
			"range": map[string]interface{}{
				"timestamp": map[string]interface{}{
					"gte":    req.TimestampRange.From, // Greater than or equal to `from`
					"lte":    req.TimestampRange.To,   // Less than or equal to `to`
					"format": "strict_date_optional_time",
				},
			},
		})
	}

	// Add metadata filters (key-value pairs)
	for key, value := range req.Metadata {
		mustClauses = append(mustClauses, map[string]interface{}{
			"match": map[string]interface{}{
				fmt.Sprintf("metadata.%s.keyword", key): value, // Using keyword for exact match
			},
		})
	}

	// **Add required project_id filter** (Using .keyword for exact match)
	if req.ProjectID != "" {
		mustClauses = append(mustClauses, map[string]interface{}{
			"term": map[string]interface{}{
				"project_id.keyword": req.ProjectID,
			},
		})
	}

	// **Add required tenant_id filter** (Using .keyword for exact match)
	if req.TenantID != "" {
		mustClauses = append(mustClauses, map[string]interface{}{
			"term": map[string]interface{}{
				"tenant_id.keyword": req.TenantID,
			},
		})
	}

	// Set default sorting field & order
	sortBy := "timestamp"
	if req.Sort != "" {
		sortBy = req.Sort // Use user-defined field
	}

	sortOrder := "desc" // Default order
	if req.Order == "asc" {
		sortOrder = "asc"
	}

	// Set default pagination values
	page := req.Page
	if page < 1 {
		page = 1
	}
	size := req.Limit
	if size <= 0 {
		size = 10 // Default to 10 results per page
	}
	from := (page - 1) * size // Calculate "from" for pagination

	// Construct the final Elasticsearch query
	query := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must": mustClauses,
			},
		},
		"sort": []map[string]interface{}{
			{
				sortBy: map[string]interface{}{
					"order": sortOrder,
				},
			},
		},
		"from": from, // Pagination start index
		"size": size, // Number of results per page
	}

	return query, nil
}

func (s *logService) Search(req *dto.LogSearchRequest) (interface{}, error) {
	query, err := BuildElasticsearchQuery(req)
	if err != nil {
		return nil, err
	}

	jsonQuery, err := json.Marshal(query)
	if err != nil {
		log.Fatalf("Error marshaling query: %s", err)
	}

	fmt.Println("jsonQuery", string(jsonQuery))

	index := fmt.Sprintf("tenant-%s-project-%s-date-*", req.TenantID, req.ProjectID)
	searchRes, err := s.esClient.Search(
		s.esClient.Search.WithContext(context.Background()),
		s.esClient.Search.WithIndex(index),
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

	messages, err := subscriber.Subscribe(context.Background(), "logify")
	if err != nil {
		log.Fatal(err)
	}

	es, err := elasticsearch.NewDefaultClient()
	if err != nil {
		log.Fatalf("Error creating Elasticsearch client: %v", err)
	}

	go func() {
		for msg := range messages {
			var logDto dto.LogRequest
			if err := json.Unmarshal(msg.Payload, &logDto); err != nil {
				log.Printf("Error unmarshaling message: %v", err)
			}

			index := fmt.Sprintf("tenant-%s-project-%s-date-%s", logDto.TenantID, logDto.ProjectID, time.Now().Format("2006-01-02"))
			_, err = es.Index(index, bytes.NewReader(msg.Payload))
			if err != nil {
				log.Fatalf("Error inserting document: %v", err)
			}

			msg.Ack()
		}
	}()

	return nil
}

// // IndexLog indexes a single log entry into Elasticsearch
// func (e *logService) IndexLog(ctx context.Context, logEntry dto.Log) error {
// 	// Define the index format
// 	index := fmt.Sprintf("tenant-%s-project-%s-date-%s",
// 		logEntry.TenantID,
// 		logEntry.ProjectID,
// 		logEntry.Timestamp.Format("2006-01-02"),
// 	)

// 	// Marshal logEntry to JSON
// 	data, err := json.Marshal(logEntry)
// 	if err != nil {
// 		log.Printf("Error marshaling log entry: %v", err)
// 		return err
// 	}

// 	// Index document in Elasticsearch
// 	req := bytes.NewReader(data)
// 	res, err := e.client.Index(index, req)
// 	if err != nil {
// 		log.Printf("Error inserting document into Elasticsearch: %v", err)
// 		return err
// 	}
// 	defer res.Body.Close()

// 	// Log success response
// 	log.Printf("Document indexed successfully in %s", index)
// 	return nil
// }
