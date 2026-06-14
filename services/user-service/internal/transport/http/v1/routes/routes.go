package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/indalyadav56/logify/services/user-service/internal/transport/http/v1/handlers"
)

func RegisterRoutes(r chi.Router, h handlers.UserHandler) {
	r.Route("/v1/users", func(r chi.Router) {
		r.Get("/{id}", h.GetUserHandler)
		r.Post("/", h.CreateUserHandler)
	})
}
