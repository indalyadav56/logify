package handlers

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/indalyadav56/logify/services/user-service/internal/application/services"
	"github.com/indalyadav56/logify/services/user-service/internal/transport/http/v1/dto"
	"github.com/indalyadav56/logify/services/user-service/pkg/response"
	"github.com/indalyadav56/logify/services/user-service/pkg/utils"
	"github.com/indalyadav56/logify/services/user-service/pkg/validator"
)

type UserHandler interface {
	CreateUserHandler(w http.ResponseWriter, r *http.Request)
	GetUserHandler(w http.ResponseWriter, r *http.Request)
}

type userHandler struct {
	service services.UserService
}

func NewUserHandler(srv services.UserService) UserHandler {
	return &userHandler{
		service: srv,
	}
}

func (u *userHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "application/json")

	var req dto.CreateUserRequest

	if err := utils.DecodeJSON(r, &req); err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.BadRequest(err.Error()))
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

	res, err := u.service.CreateUser(&req)
	if err != nil {
		slog.Error(err.Error())
		utils.WriteJSON(w, http.StatusBadRequest, response.InternalError(err.Error(), nil))
		return
	}

	utils.WriteJSON(w, http.StatusOK, response.Success("success", res))
}

func (u *userHandler) GetUserHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	w.Write([]byte(id))
}
