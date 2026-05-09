package application

import "context"

type UserLookupPort interface {
	FindByEmail(ctx context.Context, email string) (*UserInfo, error)
}
type UserInfo struct {
	ID, Email, TenantID, Role, Status string
}
