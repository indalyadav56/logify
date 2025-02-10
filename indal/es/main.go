package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/elastic/go-elasticsearch/v8"
)

type LogEntry struct {
	Timestamp    time.Time `json:"@timestamp"`
	Action       string    `json:"action"`
	Level        string    `json:"level"`
	Message      string    `json:"msg"`
	RequestID    string    `json:"request_id"`
	RequestURI   string    `json:"request_uri"`
	ResponseSize int       `json:"response_size"`
}

func main() {
	// Elasticsearch Configuration
	cfg := elasticsearch.Config{
		Addresses: []string{"http://localhost:9200"}, // Change if needed
	}
	es, err := elasticsearch.NewClient(cfg)
	if err != nil {
		log.Fatalf("Error creating Elasticsearch client: %s", err)
	}

	// Sample log data
	logEntry := map[string]interface{}{
		"@timestamp": time.Now(),
		"log":        "{\"service\":\"USER_SERVICE\",\"level\":\"INFO\",\"message\":\"User logged in\",\"metadata\":{\"user_id\":\"123\"},\"timestamp\":\"2025-02-08T11:32:57.869754Z\"}",
	}
	// Convert struct to JSON
	data, err := json.Marshal(logEntry)
	if err != nil {
		log.Fatalf("Error marshalling document: %s", err)
	}

	// Insert document into Elasticsearch
	indexName := "my_logs_09_02_2025" // Change to your index name
	res, err := es.Index(
		indexName,             // Index name
		bytes.NewReader(data), // Document body
	)
	if err != nil {
		log.Fatalf("Error inserting document: %s", err)
	}
	defer res.Body.Close()

	// Print response status
	fmt.Printf("Response Status: %s\n", res.Status())
}
