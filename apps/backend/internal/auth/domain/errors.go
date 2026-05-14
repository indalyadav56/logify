package domain

import "errors"

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrAccountLocked      = errors.New("account locked due to too many failed attempts")
	ErrCredentialNotFound = errors.New("credential not found")
	ErrSessionNotFound    = errors.New("session not found")
	ErrSessionExpired     = errors.New("session expired")
	ErrSessionRevoked     = errors.New("session revoked")
	ErrTokenExpired       = errors.New("token expired")
	ErrTokenAlreadyUsed   = errors.New("refresh token already used")
	ErrTokenNotFound      = errors.New("refresh token not found")
	ErrPasswordTooShort   = errors.New("password must be at least 8 characters")
	ErrPasswordTooLong    = errors.New("password must be at most 72 characters")
	ErrMFAEnabled         = errors.New("MFA required")
	ErrInvalidMFACode     = errors.New("invalid MFA code")
)
