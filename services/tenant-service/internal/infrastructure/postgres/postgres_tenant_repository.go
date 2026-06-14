package postgres

import (
	"context"
	"database/sql"

	"github.com/indalyadav56/logify/services/tenant-service/internal/domain/entity"
)

type postgresTenantRepository struct {
	db *sql.DB
}

func NewPostgresTenantRepository(db *sql.DB) *postgresTenantRepository {
	return &postgresTenantRepository{db: db}
}

func (r *postgresTenantRepository) InsertTenant(t *entity.Tenant) error {
	query := `INSERT INTO tenants (name, slug, plan)
		VALUES ($1, $2, $3) RETURNING id, created_at, updated_at`

	return r.db.QueryRowContext(context.Background(), query, t.Name, t.Slug, t.Plan).
		Scan(&t.ID, &t.CreatedAt, &t.UpdatedAt)
}

func (r *postgresTenantRepository) FindByID(id string) (*entity.Tenant, error) {
	query := `SELECT id, name, slug, plan, created_at, updated_at FROM tenants WHERE id = $1 AND deleted_at IS NULL`
	var t entity.Tenant
	err := r.db.QueryRow(query, id).Scan(&t.ID, &t.Name, &t.Slug, &t.Plan, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *postgresTenantRepository) FindBySlug(slug string) (*entity.Tenant, error) {
	query := `SELECT id, name, slug, plan, created_at, updated_at FROM tenants WHERE slug = $1 AND deleted_at IS NULL`
	var t entity.Tenant
	err := r.db.QueryRow(query, slug).Scan(&t.ID, &t.Name, &t.Slug, &t.Plan, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *postgresTenantRepository) ListTenants(limit, offset int) ([]*entity.Tenant, error) {
	query := `SELECT id, name, slug, plan, created_at, updated_at FROM tenants
		WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2`
	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*entity.Tenant
	for rows.Next() {
		var t entity.Tenant
		if err := rows.Scan(&t.ID, &t.Name, &t.Slug, &t.Plan, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, &t)
	}
	return out, nil
}
