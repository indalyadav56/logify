package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"logify/utils"
	"net/http"
	"os"
	"path/filepath"
)

// API URL & Auth Token
const apiURL = "http://localhost:8080/v1/logs"
const authToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0X2lkIjoiYTdjMDI4MjYtMDA1YS00Y2MxLWE0ZWYtYmMxNjJjY2ZjYWFhIiwidGVuYW50X2lkIjoiZDliZGZjMDYtYWMxYi00MTU5LTg1ZWEtMTNmODVhNjJiNzQ0IiwidXNlcl9pZCI6ImRjZmYxNjFjLWI4YmUtNGRiNS1iYjMzLWFjNjBlMTVmNDM4MiJ9.zlrqHhCe0KErS_-8QOQgla3WWP528G2YjooeU2jIsYk"

// SendLog sends a single log entry to the API
func SendLog(logEntry utils.LogInput) error {
	structuredLog := utils.NormalizeLog(logEntry)

	jsonData, err := json.Marshal(structuredLog)
	if err != nil {
		return fmt.Errorf("❌ Error marshaling log entry: %v", err)
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("❌ Error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", authToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("❌ Error sending request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("❌ API Error %d: %s", resp.StatusCode, string(body))
	}

	log.Println("✅ Log successfully sent:", logEntry.Message)
	return nil
}

// ProcessLogFile reads the first line, sends it to API, and deletes it if successful
func ProcessLogFile(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("❌ Error opening file %s: %v", filePath, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	// Read the first line
	var firstLine string
	if scanner.Scan() {
		firstLine = scanner.Text()
	} else {
		return fmt.Errorf("❌ No log entries found in %s", filePath)
	}

	// Convert first line into structured LogEntry
	var logEntry utils.LogInput
	err = json.Unmarshal([]byte(firstLine), &logEntry)
	if err != nil {
		return fmt.Errorf("❌ Invalid log format: %v", err)
	}

	// Call API
	err = SendLog(logEntry)
	if err != nil {
		return err // API failed, don't delete line
	}

	// API success, delete first line
	tempFile := filePath + ".tmp"
	outputFile, err := os.Create(tempFile)
	if err != nil {
		return fmt.Errorf("❌ Error creating temp file for %s: %v", filePath, err)
	}

	// Write remaining lines to temp file
	hasRemainingLines := false
	for scanner.Scan() {
		hasRemainingLines = true
		_, err := outputFile.WriteString(scanner.Text() + "\n")
		if err != nil {
			return fmt.Errorf("❌ Error writing to temp file: %v", err)
		}
	}

	// Close the output file before further operations
	outputFile.Close()

	if !hasRemainingLines {
		// If no remaining lines, delete both temp and original files
		os.Remove(tempFile)
		err = os.Remove(filePath)
		if err != nil {
			return fmt.Errorf("❌ Error deleting empty file %s: %v", filePath, err)
		}
		log.Printf("✅ Deleted empty log file: %s", filePath)
		return nil
	}

	// Replace original file with temp file if there are remaining lines
	err = os.Rename(tempFile, filePath)
	if err != nil {
		return fmt.Errorf("❌ Error replacing file %s: %v", filePath, err)
	}

	log.Printf("✅ Successfully processed and deleted first line in %s", filePath)
	return nil
}

// GetLatestLogFile finds the most recently modified `.log` file in the logs folder
func GetLatestLogFile(logsFolder string) (string, error) {
	var latestFile string
	var latestModTime int64

	files, err := filepath.Glob(filepath.Join(logsFolder, "*.log"))
	if err != nil {
		return "", fmt.Errorf("❌ Error scanning log folder: %v", err)
	}

	if len(files) == 0 {
		return "", fmt.Errorf("❌ No log files found in %s", logsFolder)
	}

	for _, file := range files {
		info, err := os.Stat(file)
		if err != nil {
			log.Printf("⚠️ Skipping file %s: %v", file, err)
			continue
		}

		if info.ModTime().Unix() > latestModTime {
			latestFile = file
			latestModTime = info.ModTime().Unix()
		}
	}

	if latestFile == "" {
		return "", fmt.Errorf("❌ No valid log files found in %s", logsFolder)
	}

	log.Printf("✅ Latest log file: %s", latestFile)
	return latestFile, nil
}

func main() {
	for {
		logsFolder := "log-new"

		// Step 1: Get latest log file
		latestLogFile, err := GetLatestLogFile(logsFolder)
		if err != nil {
			log.Printf("❌ %v", err)
		}

		fmt.Println("latestLogFile", latestLogFile)

		// Step 2: Process the first log line (send to API and delete if success)
		err = ProcessLogFile(latestLogFile)
		if err != nil {
			log.Fatalf("❌ %v", err)
		}
	}
}
