package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrUserAlreadyExists  = errors.New("user with this email already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
)

// Role is the application role stored for a user.
type Role string

const (
	RoleAdmin  Role = "admin"
	RoleMember Role = "member"
	RoleViewer Role = "viewer"
)

// User is the domain entity for an account (GORM tags map to the users table).
type User struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	Email        string    `json:"email" gorm:"size:255;not null;uniqueIndex"`
	FullName     string    `json:"full_name" gorm:"size:255;not null"`
	PasswordHash string    `json:"-" gorm:"column:password_hash;type:text;not null"`
	Role         Role      `json:"role" gorm:"type:varchar(20);not null;default:member"`
	IsActive     bool      `json:"is_active" gorm:"not null;default:true"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName overrides the default GORM table name.
func (User) TableName() string {
	return "users"
}

func NewUser(email, fullName, passwordHash string) *User {
	return &User{
		ID:           uuid.New(),
		Email:        email,
		FullName:     fullName,
		PasswordHash: passwordHash,
		Role:         RoleMember,
		IsActive:     true,
	}
}
