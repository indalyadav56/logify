package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"regexp"
	"sync"
	"time"

	"common/pkg/logger"
	"logify/internal/log/dto"
	"logify/internal/log/repository"

	"github.com/opensearch-project/opensearch-go"
	"github.com/twmb/franz-go/pkg/kadm"
	"github.com/twmb/franz-go/pkg/kerr"
	"github.com/twmb/franz-go/pkg/kgo"
)

type LogService interface {
	PublishLog(log *dto.LogRequest) error
	Search(req *dto.LogSearchRequest) (interface{}, error)
	GetAllServices() (interface{}, error)
	LogConsumer() error

	AddBookmark(logID, tenantID, projectID string) (interface{}, error)
}

type logService struct {
	logRepo          repository.LogRepository
	log              logger.Logger
	openSearchClient *opensearch.Client
	kafkaClient      *kgo.Client
	kafkaAdmin       *kadm.Client
}

func NewLogService(repo repository.LogRepository, log logger.Logger, openSearch *opensearch.Client, kafkaClient *kgo.Client, kafkaAdmin *kadm.Client) *logService {
	return &logService{
		logRepo:          repo,
		log:              log,
		openSearchClient: openSearch,
		kafkaClient:      kafkaClient,
		kafkaAdmin:       kafkaAdmin,
	}
}

func (s *logService) PublishLog(log *dto.LogRequest) error {
	byteData, err := json.Marshal(log)
	if err != nil {
		fmt.Println(err)
	}

	var wg sync.WaitGroup
	wg.Add(1)

	topic := fmt.Sprintf("logify-%s", log.ProjectID)

	record := &kgo.Record{
		Topic: topic,
		Value: byteData,
	}

	s.kafkaClient.Produce(context.Background(), record, func(_ *kgo.Record, err error) {
		defer wg.Done()
		if err != nil {
			if errors.Is(err, kerr.UnknownTopicOrPartition) {
				s.log.Info("record had a produce error: %v\n", err)

				numPartitions := int32(3)     // Explicitly convert to int32
				replicationFactor := int16(1) // Explicitly convert to int16

				// Custom topic configurations
				topicConfigs := map[string]*string{
					"cleanup.policy":    kadm.StringPtr("delete"),    // Options: delete, compact
					"retention.ms":      kadm.StringPtr("604800000"), // 7 days retention
					"segment.bytes":     kadm.StringPtr("104857600"), // 100 MB segment size
					"max.message.bytes": kadm.StringPtr("1048576"),   // 1 MB max message size
				}

				_, err = s.kafkaAdmin.CreateTopics(context.Background(), numPartitions, replicationFactor, topicConfigs, topic)
				if err != nil {
					s.log.Info("Failed to create topic: %v", err)
				}

				record := &kgo.Record{
					Topic: topic,
					Value: byteData,
				}

				s.kafkaClient.Produce(context.Background(), record, func(_ *kgo.Record, err error) {
					defer wg.Done()
					if err != nil {
						fmt.Printf("record had a produce error: %v\n", err)
					}
				})

			}

			s.log.Info("record had a produce error: %v\n", err)
		}
	})

	wg.Wait()

	return nil
}

func (s *logService) ProduceLog(log *dto.LogRequest) error {
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
	searchRes, err := s.openSearchClient.Search(
		s.openSearchClient.Search.WithContext(context.Background()),
		s.openSearchClient.Search.WithIndex(index),
		s.openSearchClient.Search.WithBody(bytes.NewReader(jsonQuery)),
	)
	if err != nil {
		log.Fatalf("Error searching documents: %s", err)
		return nil, err
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

		delete(source, "project_id")
		delete(source, "tenant_id")
		delete(source, "user_id")

		source["id"] = hit.(map[string]interface{})["_id"].(string)
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

	searchRes, err := s.openSearchClient.Search(
		s.openSearchClient.Search.WithContext(context.Background()),
		s.openSearchClient.Search.WithIndex("indal"),
		s.openSearchClient.Search.WithBody(bytes.NewReader(jsonQuery)),
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
	admin := kadm.NewClient(s.kafkaClient)

	topicList, err := admin.ListTopics(context.Background())
	if err != nil {
		log.Fatalf("Failed to list topics: %v", err)
	}

	topicRegex := regexp.MustCompile(`^logify-.*`)
	var matchedTopics []string

	for topic := range topicList {
		if topicRegex.MatchString(topic) {
			matchedTopics = append(matchedTopics, topic)
		}
	}

	if len(matchedTopics) == 0 {
		log.Println("No topics matched the pattern ^logify-.*")
	}

	fmt.Println("Consuming topics:", matchedTopics)

	brokers := []string{"localhost:9092"}

	// Create Kafka consumer with matched topics
	consumer, err := kgo.NewClient(
		kgo.SeedBrokers(brokers...),
		kgo.ConsumeTopics(matchedTopics...),
		kgo.ConsumeResetOffset(kgo.NewOffset().AtEnd()), // Start from the latest unread messages
	)
	if err != nil {
		log.Fatalf("Failed to create Kafka consumer: %v", err)
	}
	defer consumer.Close()

	fmt.Println("Consumer started. Listening for messages...")

	// Consume messages
	for {
		fetches := consumer.PollFetches(context.Background())

		iter := fetches.RecordIter()
		for !iter.Done() {
			record := iter.Next()
			fmt.Printf("Received message: Topic=%s, Partition=%d, Offset=%d, Value=%s\n",
				record.Topic, record.Partition, record.Offset, string(record.Value))

			var logDto dto.LogRequest
			if err := json.Unmarshal(record.Value, &logDto); err != nil {
				log.Printf("Error unmarshaling message: %v", err)
			}

			index := fmt.Sprintf("tenant-%s-project-%s-date-%s", logDto.TenantID, logDto.ProjectID, time.Now().Format("2006-01-02"))
			_, err = s.openSearchClient.Index(index, bytes.NewReader(record.Value))
			if err != nil {
				log.Fatalf("Error inserting document: %v", err)
			}

		}

		// Handle errors
		if err := fetches.Err(); err != nil {
			fmt.Printf("Error while consuming messages: %v\n", err)
		}
	}
}

func (s *logService) IndexLog(log *dto.LogRequest) error {
	return nil
}

func (s *logService) AddBookmark(logID, tenantID, projectID string) (interface{}, error) {
	updateQuery := map[string]interface{}{
		"doc": map[string]interface{}{
			"is_bookmarked": true,
		},
	}

	jsonUpdateQuery, err := json.Marshal(updateQuery)
	if err != nil {
		log.Fatalf("Error marshaling update query: %s", err)
	}
	fmt.Println("Update Query:", string(jsonUpdateQuery))

	index := fmt.Sprintf("tenant-%s-project-%s-date-*", tenantID, projectID)

	updateRes, err := s.openSearchClient.Update(
		index, logID,
		bytes.NewReader(jsonUpdateQuery), // Update payload
		s.openSearchClient.Update.WithContext(context.Background()),
	)
	if err != nil {
		log.Printf("Error updating document: %s", err)
		return nil, err
	}
	defer updateRes.Body.Close()

	return "Bookmark added successfully", nil
}
