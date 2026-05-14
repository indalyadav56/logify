package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/indalyadav56/logify/apps/backend/internal/user/domain"
)

// userRepository is the PostgreSQL implementation of domain.UserRepository.
type userRepository struct {
	db *pgxpool.Pool
}

// NewUserRepository creates a new PostgreSQL-backed user repository.
func NewUserRepository(db *pgxpool.Pool) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (email, full_name, password_hash)
		VALUES ($1, $2, $3)
	`
	_, err := r.db.Exec(
		ctx,
		query,
		user.Email,
		user.FullName,
		user.PasswordHash,
	)
	if err != nil {
		return err
	}
	return nil
}

// func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
// 	var user domain.User
// 	err := r.db.WithContext(ctx).Where("id = ?", id).Take(&user).Error
// 	if err != nil {
// 		if errors.Is(err, gorm.ErrRecordNotFound) {
// 			return nil, domain.ErrUserNotFound
// 		}
// 		return nil, err
// 	}
// 	return &user, nil
// }

// func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
// 	var user domain.User
// 	result := r.db.WithContext(ctx).Where("email = ?", email).First(&user)
// 	if result.Error != nil {
// 		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
// 			return nil, domain.ErrUserNotFound
// 		}
// 		return nil, result.Error
// 	}
// 	return &user, nil
// }

// func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
// 	result := r.db.WithContext(ctx).Save(user)
// 	if result.Error != nil {
// 		return result.Error
// 	}
// 	if result.RowsAffected == 0 {
// 		return domain.ErrUserNotFound
// 	}
// 	return nil
// }

// func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
// 	result := r.db.WithContext(ctx).Where("id = ?", id).Delete(&domain.User{})
// 	if result.Error != nil {
// 		return result.Error
// 	}
// 	if result.RowsAffected == 0 {
// 		return domain.ErrUserNotFound
// 	}
// 	return nil
// }

// // allowedUserSort maps API sort keys to real column names (SQL injection safe).
// var allowedUserSort = map[string]string{
// 	"created_at": "created_at",
// 	"updated_at": "updated_at",
// 	"email":      "email",
// 	"full_name":  "full_name",
// 	"role":       "role",
// 	"is_active":  "is_active",
// }

// func normalizeListParams(p domain.ListParams) (page, perPage int, sortCol, sortDir string) {
// 	page = p.Page
// 	if page < 1 {
// 		page = 1
// 	}
// 	perPage = p.PerPage
// 	if perPage < 1 {
// 		perPage = 20
// 	}
// 	if perPage > 100 {
// 		perPage = 100
// 	}

// 	sortCol = allowedUserSort[strings.ToLower(strings.TrimSpace(p.SortBy))]
// 	if sortCol == "" {
// 		sortCol = "created_at"
// 	}
// 	sortDir = strings.ToLower(strings.TrimSpace(p.SortDir))
// 	if sortDir != "asc" && sortDir != "desc" {
// 		sortDir = "desc"
// 	}
// 	return page, perPage, sortCol, sortDir
// }

// func (r *userRepository) List(ctx context.Context, params domain.ListParams) ([]*domain.User, int64, error) {
// 	page, perPage, sortCol, sortDir := normalizeListParams(params)
// 	offset := (page - 1) * perPage

// 	q := r.db.WithContext(ctx).Model(&domain.User{})

// 	if s := strings.TrimSpace(params.Search); s != "" {
// 		pat := "%" + strings.ToLower(s) + "%"
// 		q = q.Where("LOWER(email) LIKE ? OR LOWER(full_name) LIKE ?", pat, pat)
// 	}

// 	if role := strings.TrimSpace(params.Role); role != "" {
// 		q = q.Where("role = ?", role)
// 	}

// 	if params.IsActive != nil {
// 		q = q.Where("is_active = ?", *params.IsActive)
// 	}

// 	var total int64
// 	if err := q.Session(&gorm.Session{}).Count(&total).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	var users []*domain.User
// 	err := q.Order(sortCol + " " + sortDir).Offset(offset).Limit(perPage).Find(&users).Error
// 	if err != nil {
// 		return nil, 0, err
// 	}

// 	return users, total, nil
// }
