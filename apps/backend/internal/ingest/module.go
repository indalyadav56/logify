package ingest

// import (
// 	"github.com/segmentio/kafka-go"
// 	"go.uber.org/zap"

// 	"github.com/indalyadav56/logify/apps/backend/internal/ingest/application"
// 	ingestKafka "github.com/indalyadav56/logify/apps/backend/internal/ingest/infrastructure/kafka"
// 	ingestHTTP "github.com/indalyadav56/logify/apps/backend/internal/ingest/transport/http"
// )

// // Module bundles all dependencies for the ingest bounded context.
// type Module struct {
// 	Service application.IngestService
// 	Handler ingestHTTP.IngestHandler
// }

// // NewModule wires up the ingest bounded context.
// // It uses shared infrastructure passed from the DI container.
// func NewModule(kafkaWriter *kafka.Writer, log *zap.Logger) *Module {
// 	// Infrastructure adapter — uses Kafka writer
// 	producer := ingestKafka.NewLogProducer(kafkaWriter)

// 	// Application service — uses the producer (port)
// 	service := application.NewIngestService(producer)

// 	// Transport handler — uses the service
// 	handler := ingestHTTP.NewIngestHandler(service)

// 	return &Module{
// 		Service: service,
// 		Handler: handler,
// 	}
// }
