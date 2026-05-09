package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse is the standard JSON response envelope.
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

// APIError holds error details.
type APIError struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Details map[string]string `json:"details,omitempty"`
}

// Meta holds pagination metadata.
type Meta struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int64 `json:"total_pages"`
}

// Success sends a successful response with data.
func Success(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Created sends a 201 response with data.
func Created(c *gin.Context, message string, data interface{}) {
	Success(c, http.StatusCreated, message, data)
}

// OK sends a 200 response with data.
func OK(c *gin.Context, message string, data interface{}) {
	Success(c, http.StatusOK, message, data)
}

// NoContent sends a 204 response.
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// Paginated sends a successful paginated response.
func Paginated(c *gin.Context, data interface{}, page, perPage int, total int64) {
	totalPages := total / int64(perPage)
	if total%int64(perPage) > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    data,
		Meta: &Meta{
			Page:       page,
			PerPage:    perPage,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

// Error sends an error response.
func Error(c *gin.Context, statusCode int, code, message string) {
	c.AbortWithStatusJSON(statusCode, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
		},
	})
}

// ValidationError sends a 422 response with field-level validation details.
func ValidationError(c *gin.Context, details map[string]string) {
	c.AbortWithStatusJSON(http.StatusUnprocessableEntity, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Request validation failed",
			Details: details,
		},
	})
}

// BadRequest sends a 400 error response.
func BadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, "BAD_REQUEST", message)
}

// Unauthorized sends a 401 error response.
func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, "UNAUTHORIZED", message)
}

// Forbidden sends a 403 error response.
func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, "FORBIDDEN", message)
}

// NotFound sends a 404 error response.
func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, "NOT_FOUND", message)
}

// Conflict sends a 409 error response.
func Conflict(c *gin.Context, message string) {
	Error(c, http.StatusConflict, "CONFLICT", message)
}

// InternalServerError sends a 500 error response.
func InternalServerError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", message)
}
