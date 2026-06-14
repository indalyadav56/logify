package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/indalyadav56/logify/services/auth-service/config"
	"github.com/indalyadav56/logify/services/auth-service/internal/application/services"
	pb "github.com/indalyadav56/logify/services/auth-service/internal/transport/grpc/proto"
	"github.com/indalyadav56/logify/services/auth-service/internal/transport/http/v1/handlers"
	"github.com/indalyadav56/logify/services/auth-service/internal/transport/http/v1/routes"
	"github.com/indalyadav56/logify/services/auth-service/pkg/jwt"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	cfg, err := config.InitConfig()
	if err != nil {
		panic(err)
	}

	r := chi.NewRouter()

	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(cors.AllowAll().Handler)

	jwtConfig := jwt.JWTConfig{
		SecretKey:     []byte(cfg.JwtSecret),
		TokenDuration: 7 * 24 * time.Hour,
	}
	jwt := jwt.New(jwtConfig)

	// grpc client
	conn, err := grpc.NewClient(cfg.UserServiceGrpcUrl, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	client := pb.NewUserServiceClient(conn)

	// services
	authSrv := services.NewAuthService(jwt, cfg, client)

	// handlers
	h := handlers.NewAuthHandler(authSrv)

	routes.RegisterRoutes(r, h)

	fmt.Printf("server running on port :%s \n", cfg.Port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", cfg.Port), r); err != nil {
		panic(err)
	}
}
