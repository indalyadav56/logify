package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	project "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/team/domain"
	pg "github.com/indalyadav56/logify/apps/backend/pkg/postgres"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct{ db *pgxpool.Pool }

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db} }
func (r *Repository) executor(ctx context.Context) pg.Executor {
	return pg.ExecutorFromContext(ctx, r.db)
}
func (r *Repository) LockProject(ctx context.Context, id uuid.UUID) error {
	var locked uuid.UUID
	err := r.executor(ctx).QueryRow(ctx, `SELECT id FROM projects WHERE id=$1 AND status='active' AND deleted_at IS NULL FOR UPDATE`, id).Scan(&locked)
	if errors.Is(err, pgx.ErrNoRows) {
		return project.ErrProjectNotFound
	}
	return err
}
func (r *Repository) Members(ctx context.Context, id uuid.UUID) ([]domain.Member, error) {
	rows, err := r.executor(ctx).Query(ctx, `
 SELECT u.id AS user_id, u.full_name, u.email, 'owner' AS role, p.created_at AS joined_at FROM projects p JOIN auth.users u ON u.id=p.created_by WHERE p.id=$1
 UNION ALL
 SELECT u.id, u.full_name, u.email, m.role, m.joined_at FROM project_team_members m JOIN auth.users u ON u.id=m.user_id
 WHERE m.project_id=$1 AND u.deleted_at IS NULL
 ORDER BY joined_at, user_id`, id)
	// UNION column names follow the first SELECT.
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]domain.Member, 0)
	for rows.Next() {
		var m domain.Member
		if err := rows.Scan(&m.UserID, &m.FullName, &m.Email, &m.Role, &m.JoinedAt); err != nil {
			return nil, err
		}
		result = append(result, m)
	}
	return result, rows.Err()
}

const invitationColumns = `i.id, i.project_id, p.name, i.email, i.role, i.created_at, i.expires_at, i.accepted_at, i.accepted_by, i.revoked_at, i.invited_by`

func scanInvitation(row pgx.Row) (*domain.Invitation, error) {
	var i domain.Invitation
	err := row.Scan(&i.ID, &i.ProjectID, &i.ProjectName, &i.Email, &i.Role, &i.CreatedAt, &i.ExpiresAt, &i.AcceptedAt, &i.AcceptedBy, &i.RevokedAt, &i.InvitedBy)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrInvalidInvite
	}
	if err != nil {
		return nil, err
	}
	i.SetStatus()
	return &i, nil
}
func (r *Repository) Invitations(ctx context.Context, id uuid.UUID) ([]domain.Invitation, error) {
	rows, err := r.executor(ctx).Query(ctx, `SELECT `+invitationColumns+` FROM project_invitations i JOIN projects p ON p.id=i.project_id WHERE i.project_id=$1 ORDER BY i.created_at DESC,i.id DESC`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := make([]domain.Invitation, 0)
	for rows.Next() {
		i, err := scanInvitation(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *i)
	}
	return result, rows.Err()
}
func (r *Repository) AlreadyMember(ctx context.Context, id uuid.UUID, email string) (bool, error) {
	var exists bool
	err := r.executor(ctx).QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM auth.users u JOIN projects p ON p.id=$1
 LEFT JOIN project_team_members m ON m.project_id=p.id AND m.user_id=u.id
 WHERE lower(u.email)=$2 AND (p.created_by=u.id OR m.user_id IS NOT NULL))`, id, email).Scan(&exists)
	return exists, err
}
func (r *Repository) CreateInvitation(ctx context.Context, i *domain.Invitation) error {
	if _, err := r.executor(ctx).Exec(ctx, `UPDATE project_invitations SET revoked_at=now() WHERE project_id=$1 AND email=$2 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at<=now()`, i.ProjectID, i.Email); err != nil {
		return err
	}
	err := r.executor(ctx).QueryRow(ctx, `INSERT INTO project_invitations(project_id,email,role,token_hash,invited_by,expires_at)
 VALUES($1,$2,$3,$4,$5,$6) RETURNING id,created_at`, i.ProjectID, i.Email, i.Role, i.TokenHash, i.InvitedBy, i.ExpiresAt).Scan(&i.ID, &i.CreatedAt)
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return domain.ErrPendingInvite
	}
	i.SetStatus()
	return err
}
func (r *Repository) InvitationByHash(ctx context.Context, hash string, lock bool) (*domain.Invitation, error) {
	sql := `SELECT ` + invitationColumns + ` FROM project_invitations i JOIN projects p ON p.id=i.project_id
 JOIN auth.users owner ON owner.id=p.created_by AND owner.is_active AND owner.deleted_at IS NULL
 JOIN auth.users inviter ON inviter.id=i.invited_by AND inviter.is_active AND inviter.deleted_at IS NULL
 WHERE (p.created_by=i.invited_by OR EXISTS(SELECT 1 FROM project_team_members m WHERE m.project_id=p.id AND m.user_id=i.invited_by AND m.role='admin')) AND i.token_hash=$1 AND p.status='active' AND p.deleted_at IS NULL`
	if lock {
		sql += ` FOR UPDATE OF i`
	}
	return scanInvitation(r.executor(ctx).QueryRow(ctx, sql, hash))
}
func (r *Repository) UserEmail(ctx context.Context, id uuid.UUID) (string, error) {
	var email string
	err := r.executor(ctx).QueryRow(ctx, `SELECT lower(email) FROM auth.users WHERE id=$1 AND is_active AND deleted_at IS NULL`, id).Scan(&email)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", project.ErrProjectNotFound
	}
	return email, err
}
func (r *Repository) Join(ctx context.Context, i *domain.Invitation, user uuid.UUID) error {
	tag, err := r.executor(ctx).Exec(ctx, `INSERT INTO project_team_members(project_id,user_id,role,invited_by)
 VALUES($1,$2,$3,$4) ON CONFLICT(project_id,user_id) DO NOTHING`, i.ProjectID, user, i.Role, i.InvitedBy)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrAlreadyMember
	}
	return nil
}
func (r *Repository) Accept(ctx context.Context, id, user uuid.UUID) error {
	_, err := r.executor(ctx).Exec(ctx, `UPDATE project_invitations SET accepted_at=now(),accepted_by=$2 WHERE id=$1`, id, user)
	return err
}
func (r *Repository) ChangeRole(ctx context.Context, id, user uuid.UUID, role project.Role) error {
	tag, err := r.executor(ctx).Exec(ctx, `UPDATE project_team_members SET role=$3 WHERE project_id=$1 AND user_id=$2`, id, user, role)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrMemberNotFound
	}
	return nil
}
func (r *Repository) Remove(ctx context.Context, id, user uuid.UUID) error {
	tag, err := r.executor(ctx).Exec(ctx, `DELETE FROM project_team_members WHERE project_id=$1 AND user_id=$2`, id, user)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrMemberNotFound
	}
	return nil
}
func (r *Repository) Cancel(ctx context.Context, id, invite uuid.UUID) error {
	tag, err := r.executor(ctx).Exec(ctx, `UPDATE project_invitations SET revoked_at=COALESCE(revoked_at,now()) WHERE project_id=$1 AND id=$2 AND accepted_at IS NULL`, id, invite)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrInvalidInvite
	}
	return nil
}
func (r *Repository) RevokeMemberKeys(ctx context.Context, id, user uuid.UUID) error {
	_, err := r.executor(ctx).Exec(ctx, `UPDATE project_api_keys SET revoked_at=COALESCE(revoked_at,now()) WHERE project_id=$1 AND created_by=$2`, id, user)
	if err != nil {
		return err
	}
	_, err = r.executor(ctx).Exec(ctx, `UPDATE project_invitations SET revoked_at=COALESCE(revoked_at,now()) WHERE project_id=$1 AND invited_by=$2 AND accepted_at IS NULL`, id, user)
	return err
}
