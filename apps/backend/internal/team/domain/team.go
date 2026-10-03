package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
	project "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
)

var (
	ErrInvalidInput   = errors.New("enter a valid email address and an Admin, Member, or Viewer role")
	ErrAlreadyMember  = errors.New("this person is already a project member")
	ErrPendingInvite  = errors.New("a pending invitation already exists for this email; cancel it before creating a new link")
	ErrInvalidInvite  = errors.New("this invitation is invalid, expired, or canceled")
	ErrWrongEmail     = errors.New("sign in with the email address this invitation was sent to")
	ErrOwnerProtected = errors.New("the project owner cannot be removed or have their role changed")
	ErrMemberNotFound = errors.New("team member not found")
)

type Member struct {
	UserID   uuid.UUID    `json:"user_id"`
	FullName string       `json:"full_name"`
	Email    string       `json:"email"`
	Role     project.Role `json:"role"`
	JoinedAt time.Time    `json:"joined_at"`
}

type Invitation struct {
	ID          uuid.UUID    `json:"id"`
	ProjectID   uuid.UUID    `json:"project_id"`
	ProjectName string       `json:"project_name,omitempty"`
	Email       string       `json:"email"`
	Role        project.Role `json:"role"`
	TokenHash   string       `json:"-"`
	InvitedBy   *uuid.UUID   `json:"-"`
	CreatedAt   time.Time    `json:"created_at"`
	ExpiresAt   time.Time    `json:"expires_at"`
	AcceptedAt  *time.Time   `json:"accepted_at"`
	AcceptedBy  *uuid.UUID   `json:"-"`
	RevokedAt   *time.Time   `json:"revoked_at"`
	Status      string       `json:"status"`
}

func (i *Invitation) SetStatus() {
	switch {
	case i.RevokedAt != nil:
		i.Status = "canceled"
	case i.AcceptedAt != nil:
		i.Status = "accepted"
	case !i.ExpiresAt.After(time.Now()):
		i.Status = "expired"
	default:
		i.Status = "pending"
	}
}
