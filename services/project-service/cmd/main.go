package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/indalyadav56/logify/services/project-service/config"
	"github.com/indalyadav56/logify/services/project-service/internal/application/services"
	"github.com/indalyadav56/logify/services/project-service/internal/infrastructure/opensearch"
	"github.com/indalyadav56/logify/services/project-service/internal/infrastructure/postgres"
	grpcHandlers "github.com/indalyadav56/logify/services/project-service/internal/transport/grpc"
	pb "github.com/indalyadav56/logify/services/project-service/internal/transport/grpc/proto"
	"github.com/indalyadav56/logify/services/project-service/internal/transport/http/middlewares"
	"github.com/indalyadav56/logify/services/project-service/internal/transport/http/v1/handlers"
	"github.com/indalyadav56/logify/services/project-service/internal/transport/http/v1/routes"
	"github.com/indalyadav56/logify/services/project-service/pkg/db"
	"github.com/indalyadav56/logify/services/project-service/pkg/jwt"
	"github.com/indalyadav56/logify/services/project-service/pkg/logger"
	"github.com/twmb/franz-go/pkg/kadm"
	"github.com/twmb/franz-go/pkg/kgo"
	"google.golang.org/grpc"
	"google.golang.org/grpc/status"
)

func main() {
	cfg, err := config.InitConfig()
	if err != nil {
		panic(err)
	}

	// init db
	dbConn, err := db.InitDB(cfg.PostgresURL())
	if err != nil {
		panic(err)
	}
	defer dbConn.Close()

	// migrations
	migrationPath := "./internal/infrastructure/postgres/migrations"
	err = db.ApplyMigrations(context.Background(), migrationPath, dbConn)
	if err != nil {
		panic(err)
	}

	// init logger
	logger.InitLogger()

	// jwt
	jwtConfig := jwt.JWTConfig{
		SecretKey:     []byte(cfg.JwtSecret),
		TokenDuration: 7 * 24 * time.Hour,
	}
	jwt := jwt.New(jwtConfig)

	// init router
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(cors.AllowAll().Handler)
	r.Use(middlewares.AuthMiddleware(jwt))

	// kafka client
	kafkaClient, err := kgo.NewClient(kgo.SeedBrokers(cfg.KafkaBrokers...))
	if err != nil {
		panic(err)
	}

	// kafka admin
	kafkaAdmin := kadm.NewClient(kafkaClient)

	// opensearch
	openSearchClient, err := opensearch.NewOpensearchClient(cfg.OpenSearchUrl)
	if err != nil {
		log.Fatalf("Error creating the client: %s", err)
	}

	// repo
	repo := postgres.NewPostgresRepository(dbConn)
	apiKeyRepo := postgres.NewPostgresApiKeyRepository(dbConn)

	// services
	s := services.NewProjectService(repo, kafkaAdmin, openSearchClient)
	apiKeyService := services.NewApiKeyService(apiKeyRepo)

	// init handlers
	h := handlers.NewProjectHandler(s)
	apiKeyHandler := handlers.NewApiKeyHandler(apiKeyService)

	// register routes
	routes.RegisterRoutes(r, h, apiKeyHandler)

	// grpc
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)
	maxMsgSize := 10 * 1024 * 1024 // 50 MB (adjust as needed)
	grpcServer := grpc.NewServer(
		grpc.MaxRecvMsgSize(maxMsgSize),
		grpc.MaxSendMsgSize(maxMsgSize),
		grpc.UnaryInterceptor(UnaryServerInterceptor(logger)),
	)
	pb.RegisterProjectAPIKeyServiceServer(grpcServer, grpcHandlers.NewProjectApiKeyGrpcHandler(apiKeyService))
	pb.RegisterProjectServiceServer(grpcServer, grpcHandlers.NewProjectGrpcHandler(s))

	lis, err := net.Listen("tcp", ":50052")
	if err != nil {
		fmt.Printf("failed to listen: %v \n", err)
	}

	go func() {
		fmt.Println("gRPC server started on :50052")
		if err := grpcServer.Serve(lis); err != nil {
			fmt.Printf("failed to serve: %v \n", err)
		}
	}()

	// start server
	fmt.Printf("Server is running on :%s \n", cfg.Port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", cfg.Port), r); err != nil {
		panic(err)
	}
}

// UnaryServerInterceptor logs incoming unary RPC calls using slog.
func UnaryServerInterceptor(logger *slog.Logger) grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req any,
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (any, error) {
		start := time.Now()

		// Call the handler to complete the normal execution
		resp, err := handler(ctx, req)

		// After request
		code := status.Code(err)
		logger.Info("gRPC request",
			slog.String("method", info.FullMethod),
			slog.String("code", code.String()),
			slog.Duration("duration", time.Since(start)),
			slog.Any("error", err),
		)

		return resp, err
	}
}
