package application

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	jwtpkg "github.com/indalyadav56/logify/apps/backend/pkg/jwt"
)

// TokenIssuer mints JWT access tokens (via pkg/jwt) and opaque refresh tokens.
//
// Access tokens are signed JWTs (HS256) carrying the user id, email, and role.
// Refresh tokens are opaque random strings — only their SHA-256 hash is
// persisted (see domain.NewRefreshToken).
type TokenIssuer struct {
	jwt             *jwtpkg.JWT
	issuer          string
	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
	now             func() time.Time
}

// TokenIssuerConfig holds the parameters required to construct a TokenIssuer.
//
// JWT is the shared signing helper. Its TokenDuration should equal
// AccessTokenTTL (the same value should be passed for both); the issuer uses
// AccessTokenTTL only to compute the response's ExpiresAt timestamp.
type TokenIssuerConfig struct {
	JWT             *jwtpkg.JWT
	Issuer          string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
}

// NewTokenIssuer validates the config and returns a TokenIssuer ready to use.
func NewTokenIssuer(cfg TokenIssuerConfig) (*TokenIssuer, error) {
	if cfg.JWT == nil {
		return nil, errors.New("auth: jwt helper is required")
	}
	if cfg.Issuer == "" {
		cfg.Issuer = "logify-backend"
	}
	if cfg.AccessTokenTTL <= 0 {
		cfg.AccessTokenTTL = 15 * time.Minute
	}
	if cfg.RefreshTokenTTL <= 0 {
		cfg.RefreshTokenTTL = 30 * 24 * time.Hour
	}
	return &TokenIssuer{
		jwt:             cfg.JWT,
		issuer:          cfg.Issuer,
		accessTokenTTL:  cfg.AccessTokenTTL,
		refreshTokenTTL: cfg.RefreshTokenTTL,
		now:             time.Now,
	}, nil
}

// RefreshTokenTTL exposes the configured refresh-token lifetime.
func (t *TokenIssuer) RefreshTokenTTL() time.Duration { return t.refreshTokenTTL }

// Issue mints a new access/refresh token pair for the given user.
// The returned plainRefresh value is the raw refresh token that should be
// returned to the client; the caller is responsible for persisting only its
// hash via domain.NewRefreshToken.
func (t *TokenIssuer) Issue(userID uuid.UUID, email, role string) (out *TokenOutput, plainRefresh string, err error) {
	now := t.now().UTC()
	accessExp := now.Add(t.accessTokenTTL)

	// Note: pkg/jwt.GenerateToken sets "exp" itself based on its configured
	// TokenDuration; we don't pass it in the map.
	claims := map[string]interface{}{
		"user_id": userID.String(),
		"email":   email,
		"role":    role,
		"iss":     t.issuer,
		"sub":     userID.String(),
		"iat":     now.Unix(),
		"jti":     uuid.NewString(),
	}

	accessToken, err := t.jwt.GenerateToken(claims)
	if err != nil {
		return nil, "", fmt.Errorf("sign access token: %w", err)
	}

	plainRefresh, err = randomToken(32)
	if err != nil {
		return nil, "", fmt.Errorf("generate refresh token: %w", err)
	}

	return &TokenOutput{
		AccessToken:  accessToken,
		RefreshToken: plainRefresh,
		TokenType:    "Bearer",
		ExpiresAt:    accessExp,
	}, plainRefresh, nil
}

func randomToken(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
