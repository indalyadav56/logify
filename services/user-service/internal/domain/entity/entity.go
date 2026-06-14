package entity

import (
	"time"

	"github.com/google/uuid"

	"github.com/indalyadav56/logify/services/user-service/pkg/types"
)

type User struct {
	ID         uuid.UUID            `json:"id"`
	TenantID   uuid.UUID            `json:"tenant_id"`
	FirstName  types.NullableString `json:"first_name"`
	MiddleName types.NullableString `json:"middle_name"`
	LastName   types.NullableString `json:"last_name"`
	Email      string               `json:"email"`
	Password   string               `json:"-"`
	CreatedAt  time.Time            `json:"-"`
	UpdatedAt  time.Time            `json:"-"`
	DeletedAt  *time.Time           `json:"-"`
}
