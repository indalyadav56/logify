package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/indalyadav56/logify/services/auth-service/internal/application/services"
	"github.com/indalyadav56/logify/services/auth-service/internal/transport/http/v1/dto"
	"github.com/indalyadav56/logify/services/auth-service/pkg/response"
	"github.com/indalyadav56/logify/services/auth-service/pkg/utils"
	"github.com/indalyadav56/logify/services/auth-service/pkg/validator"
)

var validate = validator.New()

type AuthHandler interface {
	RegisterHandler(w http.ResponseWriter, r *http.Request)
	LoginHandler(w http.ResponseWriter, r *http.Request)
}

type authuthHandler struct {
	service services.AuthService
}

func NewAuthHandler(srv services.AuthService) *authuthHandler {
	return &authuthHandler{service: srv}
}

func (a *authuthHandler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	slog.Info("RegisterHandler called")
	w.Header().Set("Content-Type", "application/json")

	var req dto.RegisterRequest
	json.NewDecoder(r.Body).Decode(&req)

	res, err := a.service.Register(r.Context(), &req)
	if err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.InternalError(err.Error(), nil))
		return
	}

	utils.WriteJSON(w, http.StatusOK, response.Success("success", res))
}

func (a *authuthHandler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	slog.Info("LoginHandler called")
	w.Header().Set("Content-Type", "application/json")

	var req dto.LoginRequest

	if err := utils.DecodeJSON(r, &req); err != nil {
		slog.Error("Failed to decode JSON", slog.Any("error", err))
		utils.WriteJSON(w, http.StatusBadRequest, response.InternalError("Invalid request body", nil))
		return
	}

	// request validation
	if err := validate.ValidateStruct(req); err != nil {
		slog.Error(err.Error())

		var ve validator.ValidationErrors

		if errors.As(err, &ve) {
			utils.WriteJSON(w, http.StatusBadRequest, response.ValidationError("validation failed", ve))
			return
		}

		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest("Validation failed"))
		return
	}

	res, err := a.service.Login(r.Context(), &req)
	if err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.InternalError(err.Error(), nil))
		return
	}

	utils.WriteJSON(w, http.StatusOK, response.Success("login success", res))
}
