package application

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/indalyadav56/logify/apps/backend/pkg/httpserver/middleware"
)

// TokenIssuer mints JWT access tokens and opaque refresh tokens.
//
// Access tokens are signed JWTs (HS256) that carry the user id, email, and
// role. Refresh tokens are opaque random strings — the server only stores
// their SHA-256 hash (see domain.NewRefreshToken).
type TokenIssuer struct {
	secret          []byte
	issuer          string
	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
	now             func() time.Time
}

// TokenIssuerConfig holds the parameters required to construct a TokenIssuer.
type TokenIssuerConfig struct {
	Secret          string
	Issuer          string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
}

// NewTokenIssuer validates the config and returns a TokenIssuer ready to use.
func NewTokenIssuer(cfg TokenIssuerConfig) (*TokenIssuer, error) {
	if cfg.Secret == "" {
		return nil, errors.New("auth: jwt secret is required")
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
		secret:          []byte(cfg.Secret),
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

	claims := &middleware.Claims{
		UserID: userID.String(),
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    t.issuer,
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(accessExp),
			ID:        uuid.NewString(),
		},
	}

	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(t.secret)
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
