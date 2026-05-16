package http

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/indalyadav56/logify/apps/backend/internal/user/application"
	"github.com/indalyadav56/logify/apps/backend/internal/user/domain"
	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/middleware"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

type UserHandler struct {
	service application.UserService
}

func NewUserHandler(service application.UserService) *UserHandler {
	return &UserHandler{service: service}
}

// // CreateUser handles POST /api/v1/users
// func (h *UserHandler) CreateUser(c *gin.Context) {
// 	var input application.CreateUserInput
// 	if !validator.ValidateRequest(c, &input) {
// 		return
// 	}

// 	user, err := h.service.CreateUser(c.Request.Context(), input)
// 	if err != nil {
// 		if errors.Is(err, domain.ErrUserAlreadyExists) {
// 			response.Conflict(c, "A user with this email already exists")
// 			return
// 		}
// 		response.InternalServerError(c, "Failed to create user")
// 		return
// 	}

// 	response.Created(c, "User created successfully", user)
// }

// // GetUser handles GET /api/v1/users/:id
// func (h *userHandler) GetUser(c *gin.Context) {
// 	id, err := uuid.Parse(c.Param("id"))
// 	if err != nil {
// 		response.BadRequest(c, "Invalid user ID format")
// 		return
// 	}

// 	user, err := h.service.GetUser(c.Request.Context(), id)
// 	if err != nil {
// 		if errors.Is(err, domain.ErrUserNotFound) {
// 			response.NotFound(c, "User not found")
// 			return
// 		}
// 		response.InternalServerError(c, "Failed to retrieve user")
// 		return
// 	}

// 	response.OK(c, "User retrieved successfully", user)
// }

// // UpdateUser handles PUT /api/v1/users/:id
// func (h *userHandler) UpdateUser(c *gin.Context) {
// 	id, err := uuid.Parse(c.Param("id"))
// 	if err != nil {
// 		response.BadRequest(c, "Invalid user ID format")
// 		return
// 	}

// 	var input application.UpdateUserInput
// 	if !validator.ValidateRequest(c, &input) {
// 		return
// 	}

// 	user, err := h.service.UpdateUser(c.Request.Context(), id, input)
// 	if err != nil {
// 		if errors.Is(err, domain.ErrUserNotFound) {
// 			response.NotFound(c, "User not found")
// 			return
// 		}
// 		response.InternalServerError(c, "Failed to update user")
// 		return
// 	}

// 	response.OK(c, "User updated successfully", user)
// }

// // DeleteUser handles DELETE /api/v1/users/:id
// func (h *userHandler) DeleteUser(c *gin.Context) {
// 	id, err := uuid.Parse(c.Param("id"))
// 	if err != nil {
// 		response.BadRequest(c, "Invalid user ID format")
// 		return
// 	}

// 	if err := h.service.DeleteUser(c.Request.Context(), id); err != nil {
// 		if errors.Is(err, domain.ErrUserNotFound) {
// 			response.NotFound(c, "User not found")
// 			return
// 		}
// 		response.InternalServerError(c, "Failed to delete user")
// 		return
// 	}

// 	response.NoContent(c)
// }

// // ListUsers handles GET /api/v1/users
// func (h *userHandler) ListUsers(c *gin.Context) {
// 	params := domain.DefaultListParams()

// 	if page := c.Query("page"); page != "" {
// 		if p, err := strconv.Atoi(page); err == nil && p > 0 {
// 			params.Page = p
// 		}
// 	}

// 	if perPage := c.Query("per_page"); perPage != "" {
// 		if pp, err := strconv.Atoi(perPage); err == nil && pp > 0 && pp <= 100 {
// 			params.PerPage = pp
// 		}
// 	}

// 	if search := c.Query("search"); search != "" {
// 		params.Search = search
// 	}

// 	if role := c.Query("role"); role != "" {
// 		params.Role = role
// 	}

// 	if sortBy := c.Query("sort_by"); sortBy != "" {
// 		params.SortBy = sortBy
// 	}

// 	if sortDir := c.Query("sort_dir"); sortDir != "" {
// 		params.SortDir = sortDir
// 	}

// 	users, total, err := h.service.ListUsers(c.Request.Context(), params)
// 	if err != nil {
// 		response.InternalServerError(c, "Failed to list users")
// 		return
// 	}

// 	response.Paginated(c, users, params.Page, params.PerPage, total)
// }

// GetCurrentUser handles GET /api/v1/users/me
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	userIDStr, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	id, err := uuid.Parse(userIDStr)
	if err != nil {
		response.InternalServerError(c, "Invalid user ID in token")
		return
	}

	user, err := h.service.GetUser(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			response.NotFound(c, "User not found")
			return
		}
		response.InternalServerError(c, "Failed to retrieve user")
		return
	}

	response.OK(c, "Current user retrieved successfully", user)
}
