package dto

type CreateTenantRequest struct {
	Name string `json:"name" validate:"required,min=2,max=100"`
	Slug string `json:"slug" validate:"required,min=2,max=64"`
	Plan string `json:"plan" validate:"required,oneof=free pro enterprise"`
}

type TenantResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
	Plan string `json:"plan"`
}
