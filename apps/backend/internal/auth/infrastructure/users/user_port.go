// Package users implements auth/application.UserLookupPort using the user
// bounded context's UserRepository. It is the *only* place in the auth tree
// allowed to import user/domain — everywhere else, auth talks to the port.
package users

import (
	"context"
	"errors"
	"fmt"

	"golang.org/x/crypto/bcrypt"

	authApp "github.com/indalyadav56/logify/apps/backend/internal/auth/application"
	authDomain "github.com/indalyadav56/logify/apps/backend/internal/auth/domain"
	userDomain "github.com/indalyadav56/logify/apps/backend/internal/user/domain"
)

// Adapter satisfies authApp.UserLookupPort. It hashes passwords with bcrypt,
// enforces email uniqueness, and translates user-domain errors into the
// auth-domain errors auth callers expect.
type Adapter struct {
	repo userDomain.UserRepository
	cost int
}

// NewAdapter builds an adapter with the given UserRepository.
// A bcrypt cost of 0 falls back to bcrypt.DefaultCost.
func NewAdapter(repo userDomain.UserRepository, bcryptCost int) *Adapter {
	if bcryptCost <= 0 {
		bcryptCost = bcrypt.DefaultCost
	}
	return &Adapter{repo: repo, cost: bcryptCost}
}

var _ authApp.UserLookupPort = (*Adapter)(nil)

func (a *Adapter) CreateUser(ctx context.Context, in authApp.CreateUserInput) (*authApp.UserOutput, error) {
	existing, err := a.repo.GetByEmail(ctx, in.Email)
	switch {
	case err == nil && existing != nil:
		return nil, authDomain.ErrUserAlreadyExists
	case err != nil && !errors.Is(err, userDomain.ErrUserNotFound):
		return nil, fmt.Errorf("user lookup: %w", err)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), a.cost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	u := userDomain.NewUser(in.Email, in.FullName, string(hash))
	if err := a.repo.Create(ctx, u); err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	return &authApp.UserOutput{
		ID:       u.ID,
		Email:    u.Email,
		FullName: u.FullName,
		Role:     string(u.Role),
	}, nil
}

func (a *Adapter) FindByEmail(ctx context.Context, email string) (*authApp.UserAuthRecord, error) {
	u, err := a.repo.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, userDomain.ErrUserNotFound) {
			return nil, authDomain.ErrInvalidCredentials
		}
		return nil, err
	}
	if !u.IsActive {
		return nil, authDomain.ErrInvalidCredentials
	}
	return &authApp.UserAuthRecord{
		UserOutput: authApp.UserOutput{
			ID:       u.ID,
			Email:    u.Email,
			FullName: u.FullName,
			Role:     string(u.Role),
		},
		PasswordHash: u.PasswordHash,
	}, nil
}
