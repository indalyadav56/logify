package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sync"
	"time"
)

// LogConfig represents the configuration for log processing
type LogConfig struct {
	InputPaths     []string            `json:"input_paths"`
	OutputPath     string              `json:"output_path"`
	Patterns       []PatternConfig     `json:"patterns"`
	BatchSize      int                 `json:"batch_size"`
	FlushInterval  time.Duration       `json:"flush_interval"`
	MaxConcurrency int                 `json:"max_concurrency"`
	Transformers   []TransformerConfig `json:"transformers"`
}

// PatternConfig defines how to match and extract data from logs
type PatternConfig struct {
	Name       string            `json:"name"`
	Regex      string            `json:"regex"`
	Fields     map[string]string `json:"fields"`
	TimeFormat string            `json:"time_format"`
}

// TransformerConfig defines how to transform log data
type TransformerConfig struct {
	Type       string                 `json:"type"`
	Parameters map[string]interface{} `json:"parameters"`
}

// LogEntry represents a processed log entry
type LogEntry struct {
	Timestamp time.Time              `json:"timestamp"`
	Source    string                 `json:"source"`
	Pattern   string                 `json:"pattern"`
	Fields    map[string]interface{} `json:"fields"`
	RawLog    string                 `json:"raw_log"`
}

// LogIngester handles the log ingestion process
type LogIngester struct {
	config     LogConfig
	patterns   []*regexp.Regexp
	outputChan chan LogEntry
	wg         sync.WaitGroup
	writers    map[string]*bufio.Writer
	writerMu   sync.Mutex
}

// NewLogIngester creates a new log ingester with the given configuration
func NewLogIngester(config LogConfig) (*LogIngester, error) {
	patterns := make([]*regexp.Regexp, len(config.Patterns))
	for i, p := range config.Patterns {
		regex, err := regexp.Compile(p.Regex)
		if err != nil {
			return nil, fmt.Errorf("invalid regex pattern %s: %v", p.Name, err)
		}
		patterns[i] = regex
	}

	return &LogIngester{
		config:     config,
		patterns:   patterns,
		outputChan: make(chan LogEntry, config.BatchSize),
		writers:    make(map[string]*bufio.Writer),
	}, nil
}

// Start begins the log ingestion process
func (li *LogIngester) Start() error {
	// Start output processor
	li.wg.Add(1)
	go li.processOutput()

	// Process each input path
	for _, path := range li.config.InputPaths {
		matches, err := filepath.Glob(path)
		if err != nil {
			return fmt.Errorf("error globbing path %s: %v", path, err)
		}

		for _, match := range matches {
			li.wg.Add(1)
			go li.processFile(match)
		}
	}

	li.wg.Wait()
	close(li.outputChan)
	return nil
}

// processFile handles processing of individual log files
func (li *LogIngester) processFile(path string) {
	defer li.wg.Done()

	file, err := os.Open(path)
	if err != nil {
		fmt.Printf("Error opening file %s: %v\n", path, err)
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		entry := li.parseLine(line, path)
		if entry != nil {
			li.outputChan <- *entry
		}
	}
}

// parseLine processes a single log line
func (li *LogIngester) parseLine(line, source string) *LogEntry {
	for i, pattern := range li.patterns {
		matches := pattern.FindStringSubmatch(line)
		if matches == nil {
			continue
		}

		fields := make(map[string]interface{})
		config := li.config.Patterns[i]

		// Extract fields based on configuration
		for name, index := range config.Fields {
			if idx := pattern.SubexpIndex(index); idx >= 0 && idx < len(matches) {
				fields[name] = matches[idx]
			}
		}

		// Parse timestamp if configured
		var timestamp time.Time
		if timeStr, ok := fields["timestamp"].(string); ok && config.TimeFormat != "" {
			if t, err := time.Parse(config.TimeFormat, timeStr); err == nil {
				timestamp = t
			}
		}

		// Apply transformers
		for _, transformer := range li.config.Transformers {
			li.applyTransformer(&fields, transformer)
		}

		return &LogEntry{
			Timestamp: timestamp,
			Source:    source,
			Pattern:   config.Name,
			Fields:    fields,
			RawLog:    line,
		}
	}

	return nil
}

// applyTransformer applies a transformer to the log entry fields
func (li *LogIngester) applyTransformer(fields *map[string]interface{}, config TransformerConfig) {
	switch config.Type {
	case "rename":
		if from, ok := config.Parameters["from"].(string); ok {
			if to, ok := config.Parameters["to"].(string); ok {
				if value, exists := (*fields)[from]; exists {
					(*fields)[to] = value
					delete(*fields, from)
				}
			}
		}
	case "convert":
		if field, ok := config.Parameters["field"].(string); ok {
			if typ, ok := config.Parameters["type"].(string); ok {
				if value, exists := (*fields)[field]; exists {
					switch typ {
					case "int":
						if strVal, ok := value.(string); ok {
							if intVal, err := parseInt(strVal); err == nil {
								(*fields)[field] = intVal
							}
						}
						// Add more type conversions as needed
					}
				}
			}
		}
	}
}

// processOutput handles writing processed logs to output files
func (li *LogIngester) processOutput() {
	defer li.wg.Done()

	batch := make([]LogEntry, 0, li.config.BatchSize)
	ticker := time.NewTicker(li.config.FlushInterval)
	defer ticker.Stop()

	for {
		select {
		case entry, ok := <-li.outputChan:
			if !ok {
				li.writeBatch(batch)
				return
			}
			batch = append(batch, entry)
			if len(batch) >= li.config.BatchSize {
				li.writeBatch(batch)
				batch = make([]LogEntry, 0, li.config.BatchSize)
			}
		case <-ticker.C:
			if len(batch) > 0 {
				li.writeBatch(batch)
				batch = make([]LogEntry, 0, li.config.BatchSize)
			}
		}
	}
}

// writeBatch writes a batch of log entries to the appropriate output files
func (li *LogIngester) writeBatch(batch []LogEntry) {
	li.writerMu.Lock()
	defer li.writerMu.Unlock()

	for _, entry := range batch {
		output, err := json.Marshal(entry)
		if err != nil {
			fmt.Printf("Error marshaling log entry: %v\n", err)
			continue
		}

		writer, ok := li.writers[entry.Pattern]
		if !ok {
			file, err := os.OpenFile(
				filepath.Join(li.config.OutputPath, entry.Pattern+".log"),
				os.O_APPEND|os.O_CREATE|os.O_WRONLY,
				0644,
			)
			if err != nil {
				fmt.Printf("Error opening output file: %v\n", err)
				continue
			}
			writer = bufio.NewWriter(file)
			li.writers[entry.Pattern] = writer
		}

		writer.Write(output)
		writer.WriteString("\n")
		writer.Flush()
	}
}

// Helper function to parse integers
func parseInt(s string) (int64, error) {
	var result int64
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, fmt.Errorf("invalid integer: %s", s)
		}
		result = result*10 + int64(c-'0')
	}
	return result, nil
}

func main() {
	// Example configuration
	config := LogConfig{
		InputPaths:     []string{"/var/log/*.log"},
		OutputPath:     "/var/log/processed",
		BatchSize:      1000,
		FlushInterval:  5 * time.Second,
		MaxConcurrency: 4,
		Patterns: []PatternConfig{
			{
				Name:       "apache_access",
				Regex:      `^(?P<ip>\S+) \S+ \S+ \[(?P<timestamp>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) HTTP/\d\.\d" (?P<status>\d+) (?P<bytes>\d+)`,
				TimeFormat: "02/Jan/2006:15:04:05 -0700",
				Fields: map[string]string{
					"ip":        "ip",
					"timestamp": "timestamp",
					"method":    "method",
					"path":      "path",
					"status":    "status",
					"bytes":     "bytes",
				},
			},
		},
		Transformers: []TransformerConfig{
			{
				Type: "convert",
				Parameters: map[string]interface{}{
					"field": "bytes",
					"type":  "int",
				},
			},
		},
	}

	ingester, err := NewLogIngester(config)
	if err != nil {
		fmt.Printf("Error creating ingester: %v\n", err)
		os.Exit(1)
	}

	if err := ingester.Start(); err != nil {
		fmt.Printf("Error starting ingester: %v\n", err)
		os.Exit(1)
	}
}
