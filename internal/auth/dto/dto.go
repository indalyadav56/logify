package dto

type RegisterRequest struct {
	FirstName  string `json:"first_name" validate:"required,not_blank"`
	MiddleName string `json:"middle_name" validate:"required,not_blank"`
	LastName   string `json:"last_name" validate:"required,not_blank"`
	Email      string `json:"email" validate:"required,email"`
	Password   string `json:"password" validate:"required,min=6,not_blank"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,not_blank"`
}

type RegisterResponse struct {
	UserID     string `json:"user_id"`
	FirstName  string `json:"first_name"`
	MiddleName string `json:"middle_name"`
	LastName   string `json:"last_name"`
	Email      string `json:"email"`
	Token      Token  `json:"token"`
}

type LoginResponse struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Token  Token  `json:"token"`
}

type Token struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type RefreshTokenResponse struct {
	Token string `json:"token"`
}
