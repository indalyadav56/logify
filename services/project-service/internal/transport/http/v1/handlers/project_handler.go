package handlers

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/indalyadav56/logify/services/project-service/internal/application/services"
	"github.com/indalyadav56/logify/services/project-service/internal/transport/http/v1/dto"
	"github.com/indalyadav56/logify/services/project-service/pkg/response"
	"github.com/indalyadav56/logify/services/project-service/pkg/utils"
	"github.com/indalyadav56/logify/services/project-service/pkg/validator"
)

type ProjectHandler interface {
	CreateProject(w http.ResponseWriter, r *http.Request)
	GetProject(w http.ResponseWriter, r *http.Request)
	UpdateProject(w http.ResponseWriter, r *http.Request)
	DeleteProject(w http.ResponseWriter, r *http.Request)
	ListProjects(w http.ResponseWriter, r *http.Request)
}

type projectHandler struct {
	service services.ProjectService
}

func NewProjectHandler(service services.ProjectService) ProjectHandler {
	return &projectHandler{
		service: service,
	}
}

func (h *projectHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "application/json")

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

	var req dto.CreateProjectRequest

	if err := utils.DecodeJSON(r, &req); err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest(err.Error()))
		return
	}

	req.UserID = userID.(string)
	req.TenantID = tenantID.(string)

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

	result, err := h.service.Create(&req)
	if err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.InternalError(err.Error(), nil))
		return
	}

	utils.WriteJSON(w, http.StatusOK, response.Success("success", result))

}

func (h *projectHandler) GetProject(w http.ResponseWriter, r *http.Request) {

}

func (h *projectHandler) UpdateProject(w http.ResponseWriter, r *http.Request) {

}

func (h *projectHandler) DeleteProject(w http.ResponseWriter, r *http.Request) {

}

func (h *projectHandler) ListProjects(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id")
	fmt.Println("User ID from context:", userID)
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

	result, err := h.service.List(userID.(string), tenantID.(string))
	if err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.InternalError(err.Error(), nil))
		return
	}

	utils.WriteJSON(w, http.StatusOK, response.Success("success", result))
}
