package application

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"strings"
	"unicode/utf8"

	"github.com/google/uuid"

	"github.com/indalyadav56/logify/apps/backend/internal/apikey/domain"
	projectApp "github.com/indalyadav56/logify/apps/backend/internal/project/application"
	projectDomain "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
)

type ProjectLookup interface {
	projectDomain.AccessRepository
}

type Service struct {
	repo     domain.Repository
	projects ProjectLookup
}

func NewService(repo domain.Repository, projects ProjectLookup) *Service {
	return &Service{repo: repo, projects: projects}
}

type CreatedKey struct {
	*domain.Key
	Secret string `json:"key"`
}

func (s *Service) ownedProject(ctx context.Context, id uuid.UUID) error {
	_, err := projectApp.RequireAccess(ctx, s.projects, id, projectDomain.RoleOwner, projectDomain.RoleAdmin)
	return err
}

func (s *Service) Create(ctx context.Context, projectID uuid.UUID, name string) (*CreatedKey, error) {
	if err := s.ownedProject(ctx, projectID); err != nil {
		return nil, err
	}
	user, ok := middleware.UserUUIDFromContext(ctx)
	if !ok {
		return nil, projectDomain.ErrProjectNotFound
	}
	name = strings.TrimSpace(name)
	if n := utf8.RuneCountInString(name); n < 1 || n > 64 {
		return nil, domain.ErrInvalidName
	}
	random := make([]byte, 32)
	if _, err := rand.Read(random); err != nil {
		return nil, err
	}
	secret := domain.Prefix + base64.RawURLEncoding.EncodeToString(random)
	key := &domain.Key{ProjectID: projectID, CreatedBy: user, Name: name, KeyPrefix: secret[:13], KeyHash: hashKey(secret)}
	if err := s.repo.Create(ctx, key); err != nil {
		return nil, err
	}
	return &CreatedKey{Key: key, Secret: secret}, nil
}

func (s *Service) List(ctx context.Context, projectID uuid.UUID) ([]*domain.Key, error) {
	if err := s.ownedProject(ctx, projectID); err != nil {
		return nil, err
	}
	return s.repo.List(ctx, projectID)
}

func (s *Service) Revoke(ctx context.Context, projectID, keyID uuid.UUID) error {
	if err := s.ownedProject(ctx, projectID); err != nil {
		return err
	}
	return s.repo.Revoke(ctx, projectID, keyID)
}

func (s *Service) Resolve(ctx context.Context, secret string) (*domain.Identity, error) {
	if !strings.HasPrefix(secret, domain.Prefix) || len(secret) != len(domain.Prefix)+43 {
		return nil, domain.ErrInvalidKey
	}
	return s.repo.Resolve(ctx, hashKey(secret))
}

func hashKey(secret string) string {
	hash := sha256.Sum256([]byte(secret))
	return hex.EncodeToString(hash[:])
}
