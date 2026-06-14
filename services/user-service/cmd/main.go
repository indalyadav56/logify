package main

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/indalyadav56/logify/services/user-service/config"
	"github.com/indalyadav56/logify/services/user-service/internal/application/services"
	"github.com/indalyadav56/logify/services/user-service/internal/infrastructure/postgres"
	userGrpc "github.com/indalyadav56/logify/services/user-service/internal/transport/grpc"
	userpb "github.com/indalyadav56/logify/services/user-service/internal/transport/grpc/proto"
	"github.com/indalyadav56/logify/services/user-service/internal/transport/http/v1/handlers"
	"github.com/indalyadav56/logify/services/user-service/internal/transport/http/v1/routes"
	"github.com/indalyadav56/logify/services/user-service/pkg/db"
	"google.golang.org/grpc"
)

func main() {
	cfg, err := config.InitConfig()
	if err != nil {
		panic(err)
	}

	dbConn, err := db.InitDB(cfg.PostgresURL())
	if err != nil {
		panic(err)
	}

	// migrations
	migrationPath := "./internal/infrastructure/postgres/migrations"
	err = db.ApplyMigrations(context.Background(), migrationPath, dbConn)
	if err != nil {
		slog.Error(err.Error())
	}

	// repo
	repo := postgres.NewPostgresUserRepository(dbConn)

	// services
	userSrv := services.NewUserService(repo)
	
	
	// grpc
	grpcServer := grpc.NewServer()
	userpb.RegisterUserServiceServer(grpcServer, userGrpc.NewUserGrpcHandler(userSrv))

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		fmt.Printf("failed to listen: %v \n", err)
	}

	go func(){
		fmt.Println("gRPC server started on :50051")
		if err := grpcServer.Serve(lis); err != nil {
			fmt.Printf("failed to serve: %v \n", err)
		}
	}()

	r := chi.NewRouter()

	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(cors.AllowAll().Handler)


	// handlers
	h := handlers.NewUserHandler(userSrv)

	// routes
	routes.RegisterRoutes(r, h)

	fmt.Printf("server running on port :%s \n", cfg.Port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", cfg.Port), r); err != nil {
		panic(err)
	}
}
