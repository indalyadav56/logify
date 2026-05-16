package application

import (
	"time"

	"github.com/google/uuid"
)

// RegisterInput is the validated input for AuthService.Register.
type RegisterInput struct {
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
	Email    string `json:"email"     validate:"required,email"`
	Password string `json:"password"  validate:"required,min=8,max=72"`
}

// LoginInput is the validated input for AuthService.Login.
type LoginInput struct {
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type CreateUserInput struct {
	FullName string
	Email    string
	Password string
}

// UserOutput is a minimal view of a user used by the auth service.
type UserOutput struct {
	ID       uuid.UUID
	Email    string
	FullName string
	Role     string
}

// TokenOutput is the response returned by Register and Login.
type TokenOutput struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	TokenType    string       `json:"token_type"`
	ExpiresAt    time.Time    `json:"expires_at"`
	User         AuthUserView `json:"user"`
}

// AuthUserView is the safe-to-expose user representation embedded in TokenOutput.
type AuthUserView struct {
	ID       uuid.UUID `json:"id"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
	Role     string    `json:"role"`
}
