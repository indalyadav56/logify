package routes

import (
	"github.com/go-chi/chi/v5"

	"github.com/indalyadav56/logify/services/tenant-service/internal/transport/http/v1/handlers"
)

func RegisterRoutes(r chi.Router, h handlers.TenantHandler) {
	r.Route("/v1/tenants", func(r chi.Router) {
		r.Get("/", h.ListTenantsHandler)
		r.Get("/{id}", h.GetTenantHandler)
		r.Post("/", h.CreateTenantHandler)
	})
}
