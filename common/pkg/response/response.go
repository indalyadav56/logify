package response

import (
	"net/http"
	"time"
)

type APIResponse struct {
	Data       interface{} `json:"data,omitempty"`
	Message    string      `json:"message,omitempty"`
	StatusCode int         `json:"status_code,omitempty"`
	Errors     interface{} `json:"errors,omitempty"`
	Meta       *Metadata   `json:"meta,omitempty"`
	Pagination *Pagination `json:"pagination,omitempty"`
}

// Metadata contains additional information about the response.
type Metadata struct {
	Timestamp  time.Time `json:"timestamp"`
	APIVersion string    `json:"api_version,omitempty"`
	RequestID  string    `json:"request_id,omitempty"`
}

// Pagination contains pagination details for list responses.
type Pagination struct {
	Total       int `json:"total"`
	PerPage     int `json:"per_page"`
	CurrentPage int `json:"current_page"`
	TotalPages  int `json:"total_pages"`
}

func Success(message string, data interface{}, pagination *Pagination) APIResponse {
	return APIResponse{
		Data:       data,
		Message:    message,
		StatusCode: http.StatusOK,
		// Meta: &Metadata{
		// 	Timestamp: time.Now(),
		// },
		// Pagination: pagination,
	}
}

func Error(statusCode int, message string, err interface{}) APIResponse {
	return APIResponse{
		Data:       nil,
		StatusCode: statusCode,
		Message:    message,
		Errors:     err,
	}
}

// BadRequest returns a 400 Bad Request response.
func BadRequest(message string) APIResponse {
	return Error(http.StatusBadRequest, message, nil)
}

// NotFound returns a 404 Not Found response.
func NotFound(message string) APIResponse {
	return Error(http.StatusNotFound, message, nil)
}

// Unauthorized returns a 401 Unauthorized response.
func Unauthorized(message string) APIResponse {
	return Error(http.StatusUnauthorized, message, nil)
}

// Forbidden returns a 403 Forbidden response.
func Forbidden(message string) APIResponse {
	return Error(http.StatusForbidden, message, nil)
}

// InternalServerError returns a 500 Internal Server Error response.
func InternalServerError(message string) APIResponse {
	return Error(http.StatusInternalServerError, message, nil)
}

func Created(message string, data interface{}) APIResponse {
	return APIResponse{
		Data:       data,
		Message:    message,
		StatusCode: http.StatusCreated,
	}
}

func NoContent() APIResponse {
	return APIResponse{
		Data:       nil,
		Message:    "",
		StatusCode: http.StatusNoContent,
	}
}

// RateLimited returns a 429 Too Many Requests response.
func RateLimited(message string, retryAfter int) APIResponse {
	resp := Error(http.StatusTooManyRequests, message, nil)
	resp.Meta = &Metadata{
		Timestamp: time.Now(),
	}
	// Optionally, you can set a custom header for retry-after.
	// This would require modifying the http.ResponseWriter in your handler.
	return resp
}

// WithMetadata adds metadata to the response.
func (r APIResponse) WithMetadata(apiVersion, requestID string) APIResponse {
	r.Meta = &Metadata{
		Timestamp:  time.Now(),
		APIVersion: apiVersion,
		RequestID:  requestID,
	}
	return r
}

// WithPagination adds pagination details to the response.
func (r APIResponse) WithPagination(total, perPage, currentPage int) APIResponse {
	r.Pagination = &Pagination{
		Total:       total,
		PerPage:     perPage,
		CurrentPage: currentPage,
		TotalPages:  (total + perPage - 1) / perPage,
	}
	return r
}
