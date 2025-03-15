package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HandleResponse is a generic function to handle all types of responses.
func HandleResponse(ctx *gin.Context, statusCode int, message string, dataOrErrors interface{}, pagination ...*Pagination) {
	var resp APIResponse

	switch {
	case statusCode >= http.StatusOK && statusCode < http.StatusMultipleChoices: // 2xx range
		resp = Success(message, dataOrErrors, pagination...)
	case statusCode >= http.StatusBadRequest: // 4xx and 5xx range
		resp = Error(statusCode, message, dataOrErrors)
		ctx.Abort()
	default:
		resp = Error(http.StatusInternalServerError, "Unknown response type", nil)
		ctx.Abort()
	}

	ctx.JSON(statusCode, resp)
}

// SendSuccess is a helper function for success responses.
func SendSuccess(ctx *gin.Context, message string, data interface{}, pagination ...*Pagination) {
	HandleResponse(ctx, http.StatusOK, message, data, pagination...)
}

// SendError is a helper function for error responses.
func SendError(ctx *gin.Context, statusCode int, message string, err interface{}) {
	HandleResponse(ctx, statusCode, message, err, nil)
}

// SendBadRequest is a helper function for 400 Bad Request responses.
func SendBadRequest(ctx *gin.Context, message string, err interface{}) {
	SendError(ctx, http.StatusBadRequest, message, err)
}

// SendInternalServerError is a helper function for 500 Internal Server Error responses.
func SendInternalServerError(ctx *gin.Context, message string, err interface{}) {
	SendError(ctx, http.StatusInternalServerError, message, err)
}
