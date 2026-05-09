package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// User domain errors.
var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user with this email already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
)

// Role represents a user's role in the system.
type Role string

const (
	RoleAdmin  Role = "admin"
	RoleMember Role = "member"
	RoleViewer Role = "viewer"
)

// User is the core domain entity representing a platform user.
type User struct {
	ID           uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Email        string     `json:"email" gorm:"uniqueIndex;not null;size:255"`
	FullName     string     `json:"full_name" gorm:"not null;size:255"`
	PasswordHash string     `json:"-" gorm:"not null"`
	Role         Role       `json:"role" gorm:"type:varchar(20);not null;default:'member'"`
	IsActive     bool       `json:"is_active" gorm:"not null;default:true"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName overrides the default GORM table name.
func (User) TableName() string {
	return "users"
}

// NewUser creates a new User with a generated UUID and default values.
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
