package application

import "context"

// UserLookupPort is the contract the auth bounded context expects from the
// user bounded context. It owns user-record creation and lookup; auth never
// imports user/domain directly.
//
// CreateUser must:
//   - reject duplicate emails with domain.ErrUserAlreadyExists
//   - hash the plaintext password before persistence
//
// FindByEmail must:
//   - return domain.ErrInvalidCredentials when no user matches (so callers
//     can map both "no such user" and "wrong password" to the same response)
type UserLookupPort interface {
	CreateUser(ctx context.Context, input CreateUserInput) (*UserOutput, error)
	FindByEmail(ctx context.Context, email string) (*UserAuthRecord, error)
}
