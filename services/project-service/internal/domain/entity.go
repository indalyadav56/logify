package entity

import (
	"time"

	"github.com/google/uuid"
	"github.com/indalyadav56/logify/services/project-service/pkg/types"
)

type Project struct {
	ID          uuid.UUID            `json:"id"`
	Title       string               `json:"title"`
	Description types.NullableString `json:"description"`
	UserID      uuid.UUID            `json:"user_id"`
	TenantID    uuid.UUID            `json:"tenant_id"`
	Environment types.NullableString `json:"environment"`
	CreatedAt   time.Time            `json:"-"`
	UpdatedAt   time.Time            `json:"-"`
	DeletedAt   *time.Time           `json:"-"`
}

type ProjectMember struct {
	ID        uuid.UUID  `json:"id"`
	ProjectID uuid.UUID  `json:"project_id"`
	UserID    uuid.UUID  `json:"user_id"`
	CreatedAt time.Time  `json:"-"`
	UpdatedAt time.Time  `json:"-"`
	DeletedAt *time.Time `json:"-"`
}

type ApiKey struct {
	ID          uuid.UUID            `json:"id"`
	ProjectID   uuid.UUID            `json:"project_id"`
	ApiKey      string               `json:"api_key"`
	Name        types.NullableString `json:"name"`
	Description types.NullableString `json:"description"`
	CreatedAt   time.Time            `json:"-"`
	UpdatedAt   time.Time            `json:"-"`
	DeletedAt   *time.Time           `json:"-"`
	UserID      string               `json:"user_id"`
	TenantID    string               `json:"tenant_id"`
}
