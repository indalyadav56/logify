package domain

import (
	"context"

	"github.com/google/uuid"
	project "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
)

type Repository interface {
	LockProject(context.Context, uuid.UUID) error
	Members(context.Context, uuid.UUID) ([]Member, error)
	Invitations(context.Context, uuid.UUID) ([]Invitation, error)
	AlreadyMember(context.Context, uuid.UUID, string) (bool, error)
	CreateInvitation(context.Context, *Invitation) error
	InvitationByHash(context.Context, string, bool) (*Invitation, error)
	UserEmail(context.Context, uuid.UUID) (string, error)
	Join(context.Context, *Invitation, uuid.UUID) error
	Accept(context.Context, uuid.UUID, uuid.UUID) error
	ChangeRole(context.Context, uuid.UUID, uuid.UUID, project.Role) error
	Remove(context.Context, uuid.UUID, uuid.UUID) error
	Cancel(context.Context, uuid.UUID, uuid.UUID) error
	RevokeMemberKeys(context.Context, uuid.UUID, uuid.UUID) error
}
