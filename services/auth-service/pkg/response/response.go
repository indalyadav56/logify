package response

import (
	"net/http"
)

type APIResponse struct {
	Data    interface{} `json:"data"`
	Message string      `json:"message"`
	Status  int         `json:"status"`
	Errors  interface{} `json:"errors,omitempty"`
}

func Success(message string, data interface{}) APIResponse {
	return APIResponse{
		Data:    data,
		Message: message,
		Status:  http.StatusOK,
	}
}

func ValidationError(message string, err interface{}) APIResponse {
	return APIResponse{
		Data:    nil,
		Status:  http.StatusBadRequest,
		Message: message,
		Errors:  err,
	}
}

func InternalError(message string, err interface{}) APIResponse {
	return APIResponse{
		Data:    nil,
		Status:  http.StatusInternalServerError,
		Message: message,
		Errors:  err,
	}
}

func Error(statusCode int, message string, err interface{}) APIResponse {
	return APIResponse{
		Data:    nil,
		Status:  statusCode,
		Message: message,
		Errors:  err,
	}
}

func BadRequest(message string) APIResponse {
	return APIResponse{
		Data:    nil,
		Message: message,
		Status:  http.StatusBadRequest,
	}
}

func NotFound(message string) APIResponse {
	return APIResponse{
		Data:    nil,
		Message: message,
		Status:  http.StatusNotFound,
	}
}

func Unauthorized(message string) APIResponse {
	return APIResponse{
		Data:    nil,
		Message: message,
		Status:  http.StatusUnauthorized,
	}
}

func Forbidden(message string) APIResponse {
	return APIResponse{
		Data:    nil,
		Message: message,
		Status:  http.StatusForbidden,
	}
}

func Created(message string, data interface{}) APIResponse {
	return APIResponse{
		Data:    data,
		Message: message,
		Status:  http.StatusCreated,
	}
}

func NoContent() APIResponse {
	return APIResponse{
		Data:    nil,
		Message: "",
		Status:  http.StatusNoContent,
	}
}
