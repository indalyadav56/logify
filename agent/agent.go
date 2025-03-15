package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/hpcloud/tail"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Logs              []LogConfig `yaml:"logs"`
	IngestionEndpoint string      `yaml:"ingestion_endpoint"`
	AuthToken         string      `yaml:"auth_token"`
	BufferSize        int         `yaml:"buffer_size"`
}

type LogConfig struct {
	Path string `yaml:"path"`
	Tag  string `yaml:"tag"`
}

type LogMessage struct {
	Timestamp time.Time `json:"timestamp"`
	Tag       string    `json:"tag"`
	Message   string    `json:"message"`
}

func main() {
	// Load config
	configData, err := ioutil.ReadFile("agent-config.yaml")
	if err != nil {
		log.Fatal("Failed to read config:", err)
	}

	var config Config
	if err := yaml.Unmarshal(configData, &config); err != nil {
		log.Fatal("Failed to parse config:", err)
	}

	// Buffer for logs
	logChan := make(chan LogMessage, config.BufferSize)

	// Start tailing each log file
	for _, logConfig := range config.Logs {
		go tailLog(logConfig, logChan)
	}

	// Process and send logs
	go sendLogs(config, logChan)

	// Keep the program running
	select {}
}

func tailLog(logConfig LogConfig, logChan chan LogMessage) {
	t, err := tail.TailFile(logConfig.Path, tail.Config{Follow: true, ReOpen: true})
	if err != nil {
		log.Printf("Failed to tail %s: %v", logConfig.Path, err)
		return
	}

	for line := range t.Lines {
		logChan <- LogMessage{
			Timestamp: time.Now(),
			Tag:       logConfig.Tag,
			Message:   line.Text,
		}
	}
}

func sendLogs(config Config, logChan chan LogMessage) {
	client := &http.Client{Timeout: 10 * time.Second}
	batch := make([]LogMessage, 0, 100)

	for msg := range logChan {
		batch = append(batch, msg)
		if len(batch) >= 100 { // Batch size
			sendBatch(client, config, batch)
			batch = batch[:0]
		}
	}
}

func sendBatch(client *http.Client, config Config, batch []LogMessage) {
	data, err := json.Marshal(batch)
	if err != nil {
		log.Printf("Failed to marshal batch: %v", err)
		return
	}

	req, err := http.NewRequest("POST", config.IngestionEndpoint, bytes.NewBuffer(data))
	if err != nil {
		log.Printf("Failed to create request: %v", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.AuthToken)

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to send batch: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Unexpected status: %s", resp.Status)
	}
}
