package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/indalyadav56/logify/services/auth-service/internal/transport/http/v1/handlers"
)

func RegisterRoutes(r chi.Router, h handlers.AuthHandler) {
	r.Route("/v1/auth", func(r chi.Router) {
		r.Post("/login", h.LoginHandler)
		r.Post("/register", h.RegisterHandler)
	})
}
