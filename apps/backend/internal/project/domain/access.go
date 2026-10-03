package domain

import (
	"context"
	"github.com/google/uuid"
)

type Role string

const (
	RoleOwner  Role = "owner"
	RoleAdmin  Role = "admin"
	RoleMember Role = "member"
	RoleViewer Role = "viewer"
)

type AccessRepository interface {
	GetForUser(context.Context, uuid.UUID, uuid.UUID) (*Project, error)
}

func (r Role) CanManage() bool { return r == RoleOwner || r == RoleAdmin }
func (r Role) CanIngest() bool { return r.CanManage() || r == RoleMember }
