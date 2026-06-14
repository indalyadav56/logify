package handlers

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/indalyadav56/logify/services/project-service/internal/application/services"
	"github.com/indalyadav56/logify/services/project-service/internal/domain/entity"
	"github.com/indalyadav56/logify/services/project-service/internal/transport/http/v1/dto"
	"github.com/indalyadav56/logify/services/project-service/pkg/response"
	"github.com/indalyadav56/logify/services/project-service/pkg/utils"
	"github.com/indalyadav56/logify/services/project-service/pkg/validator"

	"github.com/go-chi/chi/v5"
)

type ApiKeyHandler interface {
	CreateApiKeyHandler(w http.ResponseWriter, r *http.Request)
	ListApiKeyHandler(w http.ResponseWriter, r *http.Request)
}

type apiKeyHandler struct {
	service services.ApiKeyService
}

func NewApiKeyHandler(service services.ApiKeyService) ApiKeyHandler {
	return &apiKeyHandler{
		service: service,
	}
}

func (h *apiKeyHandler) CreateApiKeyHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "application/json")

	projectId := chi.URLParam(r, "projectId")
	if projectId == "" {
		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest("Project ID is required"))
		return
	}

	var req dto.CreateApiKeyRequest

	if err := utils.DecodeJSON(r, &req); err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest(err.Error()))
		return
	}

	userID := r.Context().Value("user_id")
	if userID == "" {
		slog.Error("user_id not found in context")
		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest("user_id not found in context"))
		return
	}

	tenantID := r.Context().Value("tenant_id")
	if tenantID == nil {
		slog.Error("tenant_id not found in context")
		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest("tenant_id not found in context"))
		return
	}

	// request validation
	if err := validator.New().ValidateStruct(req); err != nil {
		slog.Error(err.Error())

		var ve validator.ValidationErrors

		if errors.As(err, &ve) {
			utils.WriteJSON(w, http.StatusBadRequest, response.ValidationError("validation failed", ve))
			return
		}

		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest("Validation failed"))
		return
	}

	req.UserID = userID.(string)
	req.TenantID = tenantID.(string)

	apiKeys, err := h.service.CreateApiKey(&req, projectId)
	if err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.InternalError(err.Error(), nil))
		return
	}

	utils.WriteJSON(w, http.StatusOK, response.Success("success", apiKeys))
}

func (h *apiKeyHandler) ListApiKeyHandler(w http.ResponseWriter, r *http.Request) {
	projectId := chi.URLParam(r, "projectId")
	if projectId == "" {
		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest("Project ID is required"))
		return
	}

	apiKeys, err := h.service.ListApiKeys(projectId)
	if err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.InternalError(err.Error(), nil))
		return
	}

	if len(apiKeys) == 0 {
		apiKeys = make([]entity.ApiKey, 0)
	}

	utils.WriteJSON(w, http.StatusOK, response.Success("success", apiKeys))
}
