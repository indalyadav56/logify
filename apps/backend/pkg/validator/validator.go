package validator

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

// validate is the shared validator instance.
var validate = validator.New()

// ValidateRequest binds JSON body to the given struct and validates it.
// Returns true if validation passed, false otherwise (error response is sent automatically).
func ValidateRequest(c *gin.Context, req interface{}) bool {
	if err := c.ShouldBindJSON(req); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error())
		return false
	}

	if err := validate.Struct(req); err != nil {
		details := extractValidationErrors(err)
		response.ValidationError(c, details)
		return false
	}

	return true
}

// ValidateStruct validates a struct and returns field-level error details.
func ValidateStruct(s interface{}) map[string]string {
	if err := validate.Struct(s); err != nil {
		return extractValidationErrors(err)
	}
	return nil
}

// extractValidationErrors converts validator errors into a field->message map.
func extractValidationErrors(err error) map[string]string {
	details := make(map[string]string)

	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, fieldError := range validationErrors {
			field := strings.ToLower(fieldError.Field())
			details[field] = formatValidationError(fieldError)
		}
	}

	return details
}

// formatValidationError produces a human-readable message for a single field error.
func formatValidationError(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Invalid email address"
	case "min":
		return fmt.Sprintf("Must be at least %s characters", fe.Param())
	case "max":
		return fmt.Sprintf("Must be at most %s characters", fe.Param())
	case "uuid":
		return "Must be a valid UUID"
	case "oneof":
		return fmt.Sprintf("Must be one of: %s", fe.Param())
	default:
		return fmt.Sprintf("Failed validation: %s", fe.Tag())
	}
}
