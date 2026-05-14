package domain

import "context"

type RefreshTokenRepository interface {
	Create(ctx context.Context, refreshToken *RefreshToken) error
	GetByToken(ctx context.Context, token string) (*RefreshToken, error)
}
