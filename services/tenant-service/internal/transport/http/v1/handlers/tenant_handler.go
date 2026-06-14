package handlers

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/indalyadav56/logify/services/tenant-service/internal/application/services"
	"github.com/indalyadav56/logify/services/tenant-service/internal/transport/http/v1/dto"
	"github.com/indalyadav56/logify/services/tenant-service/pkg/response"
	"github.com/indalyadav56/logify/services/tenant-service/pkg/utils"
)

type TenantHandler interface {
	CreateTenantHandler(w http.ResponseWriter, r *http.Request)
	GetTenantHandler(w http.ResponseWriter, r *http.Request)
	ListTenantsHandler(w http.ResponseWriter, r *http.Request)
}

type tenantHandler struct {
	service services.TenantService
}

func NewTenantHandler(svc services.TenantService) TenantHandler {
	return &tenantHandler{service: svc}
}

func (h *tenantHandler) CreateTenantHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "application/json")

	var req dto.CreateTenantRequest
	if err := utils.DecodeJSON(r, &req); err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest(err.Error()))
		return
	}

	t, err := h.service.CreateTenant(&req)
	if err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusInternalServerError, response.InternalError(err.Error(), nil))
		return
	}
	utils.WriteJSON(w, http.StatusCreated, response.Created("tenant created", t))
}

func (h *tenantHandler) GetTenantHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	t, err := h.service.GetTenantByID(id)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, response.NotFound(err.Error()))
		return
	}
	utils.WriteJSON(w, http.StatusOK, response.Success("ok", t))
}

func (h *tenantHandler) ListTenantsHandler(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit <= 0 {
		limit = 20
	}
	tenants, err := h.service.ListTenants(limit, offset)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, response.InternalError(err.Error(), nil))
		return
	}
	utils.WriteJSON(w, http.StatusOK, response.Success("ok", tenants))
}
