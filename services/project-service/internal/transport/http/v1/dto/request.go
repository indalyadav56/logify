package dto

type CreateProjectRequest struct {
	TenantID string `json:"-"`
	UserID   string `json:"-"`
	Title    string `json:"title"`
}

type CreateApiKeyRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	UserID      string `json:"-"`
	TenantID    string `json:"-"`
}
