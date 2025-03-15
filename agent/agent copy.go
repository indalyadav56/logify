package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"
)

func main() {
	// Set up logging
	execPath, err := os.Executable()
	if err != nil {
		fmt.Printf("Error getting executable path: %v\n", err)
		os.Exit(1)
	}

	execDir := filepath.Dir(execPath)
	logDir := filepath.Join(execDir, "logs")

	// Create logs directory if it doesn't exist
	err = os.MkdirAll(logDir, 0755)
	if err != nil {
		fmt.Printf("Error creating log directory: %v\n", err)
		os.Exit(1)
	}

	// Set up log file
	logFile := filepath.Join(logDir, "agent.log")
	f, err := os.OpenFile(logFile, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		fmt.Printf("Error opening log file: %v\n", err)
		os.Exit(1)
	}
	defer f.Close()

	// Configure logger to write to both file and console
	log.SetOutput(f)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	log.Println("Background agent started")

	// Main loop - replace this with your actual agent functionality
	counter := 0
	for {
		counter++
		currentTime := time.Now().Format("2006-01-02 15:04:05")
		log.Printf("Agent running... Count: %d, Time: %s\n", counter, currentTime)

		// Also print to stdout for debugging during development
		fmt.Printf("Agent running... Count: %d, Time: %s\n", counter, currentTime)

		time.Sleep(5 * time.Second)
	}
}
