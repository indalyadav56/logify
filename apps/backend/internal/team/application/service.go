package application

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"net/mail"
	"strings"
	"time"

	"github.com/google/uuid"
	projectApp "github.com/indalyadav56/logify/apps/backend/internal/project/application"
	project "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	"github.com/indalyadav56/logify/apps/backend/internal/team/domain"
)

type TransactionRunner interface {
	WithinTransaction(context.Context, func(context.Context) error) error
}
type Service struct {
	repo     domain.Repository
	projects project.AccessRepository
	tx       TransactionRunner
}

func NewService(repo domain.Repository, projects project.AccessRepository, tx TransactionRunner) *Service {
	return &Service{repo, projects, tx}
}

type Team struct {
	Members     []domain.Member     `json:"members"`
	Invitations []domain.Invitation `json:"invitations"`
	Role        project.Role        `json:"role"`
}
type CreatedInvitation struct {
	*domain.Invitation
	Token string `json:"token"`
}

func validRole(role project.Role) bool {
	return role == project.RoleAdmin || role == project.RoleMember || role == project.RoleViewer
}
func tokenHash(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
func checkToken(token string) error {
	if !strings.HasPrefix(token, "lgi_") || len(token) != 47 {
		return domain.ErrInvalidInvite
	}
	return nil
}

func (s *Service) View(ctx context.Context, id uuid.UUID) (*Team, error) {
	p, err := projectApp.RequireAccess(ctx, s.projects, id)
	if err != nil {
		return nil, err
	}
	members, err := s.repo.Members(ctx, id)
	if err != nil {
		return nil, err
	}
	team := &Team{Members: members, Invitations: make([]domain.Invitation, 0), Role: p.Role}
	if p.Role.CanManage() {
		team.Invitations, err = s.repo.Invitations(ctx, id)
	}
	return team, err
}
func (s *Service) CreateInvitation(ctx context.Context, id uuid.UUID, email string, role project.Role) (*CreatedInvitation, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	address, err := mail.ParseAddress(email)
	if err != nil || address.Address != email || len(email) > 254 || !validRole(role) {
		return nil, domain.ErrInvalidInput
	}
	user, ok := middleware.UserUUIDFromContext(ctx)
	if !ok {
		return nil, project.ErrProjectNotFound
	}
	random := make([]byte, 32)
	if _, err := rand.Read(random); err != nil {
		return nil, err
	}
	token := "lgi_" + base64.RawURLEncoding.EncodeToString(random)
	invite := &domain.Invitation{ProjectID: id, Email: email, Role: role, TokenHash: tokenHash(token), InvitedBy: &user, ExpiresAt: time.Now().UTC().Add(7 * 24 * time.Hour)}
	err = s.tx.WithinTransaction(ctx, func(ctx context.Context) error {
		if err := s.repo.LockProject(ctx, id); err != nil {
			return err
		}
		p, err := projectApp.RequireAccess(ctx, s.projects, id, project.RoleOwner, project.RoleAdmin)
		if err != nil {
			return err
		}
		exists, err := s.repo.AlreadyMember(ctx, id, email)
		if err != nil {
			return err
		}
		if exists {
			return domain.ErrAlreadyMember
		}
		invite.ProjectName = p.Name
		return s.repo.CreateInvitation(ctx, invite)
	})
	if err != nil {
		return nil, err
	}
	return &CreatedInvitation{invite, token}, nil
}
func (s *Service) preview(ctx context.Context, token string, lock bool) (*domain.Invitation, uuid.UUID, error) {
	if err := checkToken(token); err != nil {
		return nil, uuid.Nil, err
	}
	user, ok := middleware.UserUUIDFromContext(ctx)
	if !ok {
		return nil, uuid.Nil, project.ErrProjectNotFound
	}
	email, err := s.repo.UserEmail(ctx, user)
	if err != nil {
		return nil, uuid.Nil, err
	}
	invite, err := s.repo.InvitationByHash(ctx, tokenHash(token), lock)
	if err != nil {
		return nil, uuid.Nil, err
	}
	if invite.Email != email {
		return nil, uuid.Nil, domain.ErrWrongEmail
	}
	if invite.RevokedAt != nil || (invite.AcceptedAt == nil && !invite.ExpiresAt.After(time.Now())) {
		return nil, uuid.Nil, domain.ErrInvalidInvite
	}
	if invite.AcceptedAt != nil && (invite.AcceptedBy == nil || *invite.AcceptedBy != user) {
		return nil, uuid.Nil, domain.ErrInvalidInvite
	}
	return invite, user, nil
}
func (s *Service) Preview(ctx context.Context, token string) (*domain.Invitation, error) {
	invite, _, err := s.preview(ctx, token, false)
	return invite, err
}
func (s *Service) Accept(ctx context.Context, token string) (*project.Project, error) {
	invite, _, err := s.preview(ctx, token, false)
	if err != nil {
		return nil, err
	}
	var joined *project.Project
	err = s.tx.WithinTransaction(ctx, func(ctx context.Context) error {
		if err := s.repo.LockProject(ctx, invite.ProjectID); err != nil {
			return err
		}
		current, user, err := s.preview(ctx, token, true)
		if err != nil {
			return err
		}
		if current.AcceptedAt == nil {
			if err := s.repo.Join(ctx, current, user); err != nil {
				return err
			}
			if err := s.repo.Accept(ctx, current.ID, user); err != nil {
				return err
			}
		}
		joined, err = s.projects.GetForUser(ctx, current.ProjectID, user)
		return err
	})
	return joined, err
}
func (s *Service) Cancel(ctx context.Context, id, invite uuid.UUID) error {
	return s.tx.WithinTransaction(ctx, func(ctx context.Context) error {
		if err := s.repo.LockProject(ctx, id); err != nil {
			return err
		}
		if _, err := projectApp.RequireAccess(ctx, s.projects, id, project.RoleOwner, project.RoleAdmin); err != nil {
			return err
		}
		return s.repo.Cancel(ctx, id, invite)
	})
}
func (s *Service) ChangeRole(ctx context.Context, id, user uuid.UUID, role project.Role) error {
	if !validRole(role) {
		return domain.ErrInvalidInput
	}
	return s.tx.WithinTransaction(ctx, func(ctx context.Context) error {
		if err := s.repo.LockProject(ctx, id); err != nil {
			return err
		}
		p, err := projectApp.RequireAccess(ctx, s.projects, id, project.RoleOwner, project.RoleAdmin)
		if err != nil {
			return err
		}
		if p.CreatedBy == user {
			return domain.ErrOwnerProtected
		}
		if err := s.repo.ChangeRole(ctx, id, user, role); err != nil {
			return err
		}
		if !role.CanManage() {
			return s.repo.RevokeMemberKeys(ctx, id, user)
		}
		return nil
	})
}
func (s *Service) Remove(ctx context.Context, id, user uuid.UUID) error {
	return s.tx.WithinTransaction(ctx, func(ctx context.Context) error {
		if err := s.repo.LockProject(ctx, id); err != nil {
			return err
		}
		p, err := projectApp.RequireAccess(ctx, s.projects, id)
		if err != nil {
			return err
		}
		actor, _ := middleware.UserUUIDFromContext(ctx)
		if p.CreatedBy == user {
			return domain.ErrOwnerProtected
		}
		if actor != user && !p.Role.CanManage() {
			return project.ErrForbidden
		}
		if err := s.repo.Remove(ctx, id, user); err != nil {
			return err
		}
		return s.repo.RevokeMemberKeys(ctx, id, user)
	})
}
