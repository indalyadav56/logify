package domain

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

const Prefix = "lgfy_"

var (
	ErrInvalidKey  = errors.New("invalid or revoked API key")
	ErrKeyNotFound = errors.New("API key not found")
	ErrInvalidName = errors.New("key name must contain between 1 and 64 characters")
)

// Key contains public metadata; the secret is never stored or listed.
type Key struct {
	ID        uuid.UUID  `json:"id"`
	ProjectID uuid.UUID  `json:"project_id"`
	CreatedBy uuid.UUID  `json:"-"`
	Name      string     `json:"name"`
	KeyPrefix string     `json:"key_prefix"`
	KeyHash   string     `json:"-"`
	CreatedAt time.Time  `json:"created_at"`
	RevokedAt *time.Time `json:"revoked_at"`
}

type Identity struct {
	UserID    uuid.UUID
	TenantID  uuid.UUID
	ProjectID uuid.UUID
}

type Repository interface {
	Create(context.Context, *Key) error
	List(context.Context, uuid.UUID) ([]*Key, error)
	Revoke(context.Context, uuid.UUID, uuid.UUID) error
	Resolve(context.Context, string) (*Identity, error)
}
