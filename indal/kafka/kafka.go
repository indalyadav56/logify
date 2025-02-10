package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

// func main() {

// 	config := sarama.NewConfig()
// 	config.Producer.RequiredAcks = sarama.WaitForAll
// 	config.Producer.Return.Successes = true

// 	fmt.Println("Test")

// 	producer, err := sarama.NewSyncProducer([]string{"localhost:9092"}, config)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	defer producer.Close()

// 	wg := sync.WaitGroup{}
// 	wg.Add(1)
// 	go Consumer()
// 	wg.Wait()

// 	for i := 0; i < 1000; i++ {
// 		msg := &sarama.ProducerMessage{
// 			Topic: "logify",
// 			Value: sarama.StringEncoder("{\"action\":\"MIDDLEWARE_END\",\"device_ip\":\"test\",\"end_time\":\"2025-01-16T15:56:21.741508+05:30\",\"file\":\"/Users/indal/Desktop/Workspace/paydoh/deployment/bank-api/paydoh-commons/services/logger_service.go\",\"func_name\":\"bitbucket.org/paydoh/paydoh-commons/services.(*LoggerService).LogInfo\",\"lat_long\":\"test.test\",\"latency\":0.012599917,\"level\":\"info\",\"line\":246,\"msg\":\"middleware end log\",\"request_host\":\"localhost:4100\",\"request_id\":\"ec0429df-ada0-4405-8aca-8c79056d3c2a\",\"request_method\":\"POST\",\"request_uri\":\"/api/authentication/logout\",\"request_user_agent\":\"curl/8.7.1\",\"response_body\":\"{\\\"error\\\":{\\\"errors\\\":{\\\"body\\\":\\\"generate new token to continue\\\"}},\\\"message\\\":\\\"Unauthorized\\\",\\\"status\\\":401}\",\"response_size\":100,\"start_time\":\"2025-01-16T15:56:21.741508+05:30\",\"time\":\"2025-01-16T15:56:21+05:30\",\"user_id\":\";5x8b008-e017-4\"}"),
// 		}

// 		partition, offset, err := producer.SendMessage(msg)
// 		if err != nil {
// 			log.Fatal(err)
// 		}

// 		log.Printf("Message sent to partition %d at offset %d\n", partition, offset)
// 		time.Sleep(1 * time.Second)
// 	}

// }

func main() {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{"localhost:9092"},
		Topic:   "test-topic",
		GroupID: "test-group",
	})

	defer reader.Close()

	for {
		msg, err := reader.ReadMessage(context.Background())
		if err != nil {
			log.Fatal("could not read message " + err.Error())
		}
		fmt.Printf("Consumed message: %s\n", msg.Value)
		time.Sleep(1 * time.Second)
	}
}
