package domain

import (
	"net"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	RefreshToken string    `json:"refresh_token"`
	IPAddress    net.IP    `json:"ip_address"`
	UserAgent    string    `json:"user_agent"`
	RefreshAt    time.Time `json:"refresh_at"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
