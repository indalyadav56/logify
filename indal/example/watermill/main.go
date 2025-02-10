package main

import (
	"fmt"
	"log"
	"time"

	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v3/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
)

func main() {
	// Create Kafka publisher
	publisher, err := kafka.NewPublisher(
		kafka.PublisherConfig{
			Brokers:   []string{"localhost:9092"},
			Marshaler: kafka.DefaultMarshaler{},
		},
		watermill.NewStdLogger(false, false),
	)
	if err != nil {
		log.Fatal(err)
	}

	// Topic to publish logs
	topic := "logs"

	// Publish log messages every second
	for i := 1; i <= 5; i++ {
		logMessage := fmt.Sprintf("Log entry %d at %s", i, time.Now().Format(time.RFC3339))
		msg := message.NewMessage(watermill.NewUUID(), []byte(logMessage))

		// Publish message
		if err := publisher.Publish(topic, msg); err != nil {
			log.Printf("Error publishing message: %v", err)
		} else {
			fmt.Printf("Published log: %s\n", logMessage)
		}

		time.Sleep(1 * time.Second) // Simulate log generation
	}

	fmt.Println("All messages published. Exiting...")
}
