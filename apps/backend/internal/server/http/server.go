package server

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/internal/config"
	"github.com/indalyadav56/logify/apps/backend/internal/di"
	"go.uber.org/zap"
)

type Server struct {
	cfg        *config.Config
	log        *zap.Logger
	httpServer *gin.Engine
}

func NewServer(ctx context.Context, cfg *config.Config, log *zap.Logger, container *di.ServerContainer) (*Server, error) {
	r := gin.New()

	container.RegisterAllRoutes(r)

	server := &Server{
		cfg:        cfg,
		log:        log,
		httpServer: r,
	}

	return server, nil
}

func (s *Server) Run(ctx context.Context) error {
	return s.httpServer.Run(":8080")
}
