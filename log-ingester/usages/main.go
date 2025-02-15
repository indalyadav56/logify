package main

// import (
// 	"encoding/json"
// 	"fmt"
// 	"os"
// 	"time"
// )

// // Example 1: Basic Apache Log Processing
// func apacheLogConfig() LogConfig {
// 	return LogConfig{
// 		InputPaths:     []string{"/var/log/apache2/*.log"},
// 		OutputPath:     "/var/log/processed",
// 		BatchSize:      1000,
// 		FlushInterval:  5 * time.Second,
// 		MaxConcurrency: 4,
// 		Patterns: []PatternConfig{
// 			{
// 				Name:       "apache_access",
// 				Regex:      `^(?P<ip>\S+) \S+ \S+ \[(?P<timestamp>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) HTTP/\d\.\d" (?P<status>\d+) (?P<bytes>\d+)`,
// 				TimeFormat: "02/Jan/2006:15:04:05 -0700",
// 				Fields: map[string]string{
// 					"ip":        "ip",
// 					"timestamp": "timestamp",
// 					"method":    "method",
// 					"path":      "path",
// 					"status":    "status",
// 					"bytes":     "bytes",
// 				},
// 			},
// 		},
// 		Transformers: []TransformerConfig{
// 			{
// 				Type: "convert",
// 				Parameters: map[string]interface{}{
// 					"field": "bytes",
// 					"type":  "int",
// 				},
// 			},
// 			{
// 				Type: "convert",
// 				Parameters: map[string]interface{}{
// 					"field": "status",
// 					"type":  "int",
// 				},
// 			},
// 		},
// 	}
// }

// // Example 2: Nginx Log Processing with Custom Fields
// func nginxLogConfig() LogConfig {
// 	return LogConfig{
// 		InputPaths:     []string{"/var/log/nginx/access.log*"},
// 		OutputPath:     "/var/log/processed/nginx",
// 		BatchSize:      500,
// 		FlushInterval:  3 * time.Second,
// 		MaxConcurrency: 2,
// 		Patterns: []PatternConfig{
// 			{
// 				Name:       "nginx_access",
// 				Regex:      `(?P<remote_addr>\S+) \S+ \S+ \[(?P<timestamp>[^\]]+)\] "(?P<request>[^"]*)" (?P<status>\d+) (?P<bytes_sent>\d+) "(?P<http_referer>[^"]*)" "(?P<http_user_agent>[^"]*)" "(?P<http_x_forwarded_for>[^"]*)"`,
// 				TimeFormat: "02/Jan/2006:15:04:05 -0700",
// 				Fields: map[string]string{
// 					"remote_addr":          "remote_addr",
// 					"timestamp":            "timestamp",
// 					"request":              "request",
// 					"status":               "status",
// 					"bytes_sent":           "bytes_sent",
// 					"http_referer":         "http_referer",
// 					"http_user_agent":      "http_user_agent",
// 					"http_x_forwarded_for": "http_x_forwarded_for",
// 				},
// 			},
// 		},
// 		Transformers: []TransformerConfig{
// 			{
// 				Type: "convert",
// 				Parameters: map[string]interface{}{
// 					"field": "bytes_sent",
// 					"type":  "int",
// 				},
// 			},
// 			{
// 				Type: "rename",
// 				Parameters: map[string]interface{}{
// 					"from": "remote_addr",
// 					"to":   "client_ip",
// 				},
// 			},
// 		},
// 	}
// }

// // Example 3: Multi-format Application Logs
// func appLogConfig() LogConfig {
// 	return LogConfig{
// 		InputPaths:     []string{"/var/log/myapp/*.log"},
// 		OutputPath:     "/var/log/processed/myapp",
// 		BatchSize:      200,
// 		FlushInterval:  1 * time.Second,
// 		MaxConcurrency: 3,
// 		Patterns: []PatternConfig{
// 			{
// 				Name:       "app_error",
// 				Regex:      `(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(?P<level>ERROR)\] (?P<message>.*) \((?P<file>[^:]+):(?P<line>\d+)\)`,
// 				TimeFormat: "2006-01-02 15:04:05",
// 				Fields: map[string]string{
// 					"timestamp": "timestamp",
// 					"level":     "level",
// 					"message":   "message",
// 					"file":      "file",
// 					"line":      "line",
// 				},
// 			},
// 			{
// 				Name:       "app_info",
// 				Regex:      `(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(?P<level>INFO)\] (?P<message>.*) \[(?P<component>[^\]]+)\]`,
// 				TimeFormat: "2006-01-02 15:04:05",
// 				Fields: map[string]string{
// 					"timestamp": "timestamp",
// 					"level":     "level",
// 					"message":   "message",
// 					"component": "component",
// 				},
// 			},
// 		},
// 		Transformers: []TransformerConfig{
// 			{
// 				Type: "convert",
// 				Parameters: map[string]interface{}{
// 					"field": "line",
// 					"type":  "int",
// 				},
// 			},
// 		},
// 	}
// }

// func main() {
// 	// Example usage 1: Process Apache logs
// 	apacheConfig := apacheLogConfig()
// 	apacheIngester, err := NewLogIngester(apacheConfig)
// 	if err != nil {
// 		fmt.Printf("Error creating Apache ingester: %v\n", err)
// 		os.Exit(1)
// 	}

// 	// Start processing in a goroutine
// 	go func() {
// 		if err := apacheIngester.Start(); err != nil {
// 			fmt.Printf("Error processing Apache logs: %v\n", err)
// 		}
// 	}()

// 	// Example usage 2: Process Nginx logs
// 	nginxConfig := nginxLogConfig()
// 	nginxIngester, err := NewLogIngester(nginxConfig)
// 	if err != nil {
// 		fmt.Printf("Error creating Nginx ingester: %v\n", err)
// 		os.Exit(1)
// 	}

// 	go func() {
// 		if err := nginxIngester.Start(); err != nil {
// 			fmt.Printf("Error processing Nginx logs: %v\n", err)
// 		}
// 	}()

// 	// Example usage 3: Process application logs
// 	appConfig := appLogConfig()

// 	// Save configuration to file for later use
// 	configFile, err := os.Create("app_config.json")
// 	if err != nil {
// 		fmt.Printf("Error creating config file: %v\n", err)
// 		os.Exit(1)
// 	}
// 	defer configFile.Close()

// 	encoder := json.NewEncoder(configFile)
// 	encoder.SetIndent("", "    ")
// 	if err := encoder.Encode(appConfig); err != nil {
// 		fmt.Printf("Error saving config: %v\n", err)
// 		os.Exit(1)
// 	}

// 	// Load configuration from file
// 	loadedConfig := LogConfig{}
// 	if configData, err := os.ReadFile("app_config.json"); err == nil {
// 		if err := json.Unmarshal(configData, &loadedConfig); err != nil {
// 			fmt.Printf("Error loading config: %v\n", err)
// 			os.Exit(1)
// 		}
// 	}

// 	appIngester, err := NewLogIngester(loadedConfig)
// 	if err != nil {
// 		fmt.Printf("Error creating application ingester: %v\n", err)
// 		os.Exit(1)
// 	}

// 	if err := appIngester.Start(); err != nil {
// 		fmt.Printf("Error processing application logs: %v\n", err)
// 		os.Exit(1)
// 	}

// 	// Keep the main program running
// 	select {}
// }
