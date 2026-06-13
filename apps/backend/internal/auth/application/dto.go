package application

import (
	"github.com/google/uuid"
)

type RegisterInput struct {
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
	Email    string `json:"email"     validate:"required,email"`
	Password string `json:"password"  validate:"required,min=8,max=72"`
}

type LoginInput struct {
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type CreateUserInput struct {
	FullName string
	Email    string
	Password string
}

type UserOutput struct {
	ID       uuid.UUID
	Email    string
	FullName string
	Role     string
}

type TokenOutput struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
}

type AuthUserView struct {
	ID       uuid.UUID `json:"id"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
	Role     string    `json:"role"`
}
