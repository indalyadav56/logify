package dto

type CreateUserRequest struct {
	FirstName  string `json:"first_name" validate:"required"`
	MiddleName string `json:"middle_name" validate:"required"`
	LastName   string `json:"last_name" validate:"required"`
	Email      string `json:"email" validate:"required,email"`
	Password   string `json:"password" validate:"required,min=6"`
}
