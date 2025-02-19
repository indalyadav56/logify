package dto

type LogResponse struct {
	ID string `json:"id"`
}

type LogRequest struct {
	ID         string                 `json:"id"`
	TenantID   string                 `json:"tenant_id"`
	ProjectID  string                 `json:"project_id"`
	Level      string                 `json:"level"`
	Message    string                 `json:"message"`
	Service    string                 `json:"service"`
	Metadata   map[string]interface{} `json:"metadata"`
	IsBookmark bool                   `json:"is_bookmark"`
	Timestamp  string                 `json:"timestamp"`
}

type LogSearchRequest struct {
	TenantID        string   `json:"tenant_id"`
	ProjectID       string   `json:"project_id"`
	Services        []string `json:"services"`
	Levels          []string `json:"levels"`
	MessageContains []string `json:"message_contains"`
	TimestampRange  struct {
		From string `json:"from"`
		To   string `json:"to"`
	} `json:"timestamp_range"`
	Metadata map[string]interface{} `json:"metadata"`
	Sort     string                 `json:"sort"`
	Order    string                 `json:"order"`
	Page     int                    `json:"page"`
	Limit    int                    `json:"limit"`
}
