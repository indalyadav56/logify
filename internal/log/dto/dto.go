package dto

type LogResponse struct {
	ID string `json:"id"`
}

type LogRequest struct {
	ID string `json:"id"`
}

type Log struct {
	Level     string                 `json:"level"`
	Message   string                 `json:"message"`
	Service   string                 `json:"service"`
	TenantID  string                 `json:"tenant_id"`
	ProjectID string                 `json:"project_id"`
	Metadata  map[string]interface{} `json:"metadata"`
}
