package domain

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID          uuid.UUID `json:"id"`
	TenantID    uuid.UUID `json:"tenant_id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func NewProject(tenantID uuid.UUID, name, description string) *Project {
	now := time.Now().UTC()
	return &Project{
		ID:          uuid.New(),
		TenantID:    tenantID,
		Name:        strings.TrimSpace(name),
		Description: strings.TrimSpace(description),
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}
