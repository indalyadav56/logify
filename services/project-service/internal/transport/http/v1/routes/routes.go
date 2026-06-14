package routes

import (
	"github.com/indalyadav56/logify/services/project-service/internal/transport/http/v1/handlers"

	"github.com/go-chi/chi/v5"
)

func RegisterRoutes(r chi.Router, h handlers.ProjectHandler, apikeyHandler handlers.ApiKeyHandler) {
	r.Route("/v1/projects", func(r chi.Router) {
		r.Get("/", h.ListProjects)
		r.Post("/", h.CreateProject)
		r.Put("/{id}", h.UpdateProject)
		r.Delete("/{id}", h.DeleteProject)
	})

	r.Route("/v1/projects/{projectId}/api-keys", func(r chi.Router) {
		r.Post("/", apikeyHandler.CreateApiKeyHandler)
		r.Get("/", apikeyHandler.ListApiKeyHandler)
	})

	// r.Route("/v1/projects/{projectId}/api-keys/{apiKeyId}", func(r chi.Router) {
	// 	r.Get("/", h.GetApiKey)       // Get details of a specific API key
	// 	r.Put("/", h.UpdateApiKey)    // Update an API key by ID
	// 	r.Delete("/", h.DeleteApiKey) // Delete an API key by ID
	// })
}
