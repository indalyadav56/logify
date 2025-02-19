package models

import (
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	UserID      uuid.UUID  `json:"user_id"`
	TenantID    uuid.UUID  `json:"tenant_id"`
	Environment string     `json:"environment"`
	ApiKey      string     `json:"api_key"`
	CreatedAt   time.Time  `json:"-"`
	UpdatedAt   time.Time  `json:"-"`
	DeletedAt   *time.Time `json:"-"`
}

type ProjectMember struct {
	ID        uuid.UUID  `json:"id"`
	ProjectID uuid.UUID  `json:"project_id"`
	UserID    uuid.UUID  `json:"user_id"`
	CreatedAt time.Time  `json:"-"`
	UpdatedAt time.Time  `json:"-"`
	DeletedAt *time.Time `json:"-"`
}
