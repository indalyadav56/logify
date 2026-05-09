package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/indalyadav56/logify/apps/backend/internal/user/domain"
)

// userRepository is the PostgreSQL implementation of domain.UserRepository.
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new PostgreSQL-backed user repository.
func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	result := r.db.WithContext(ctx).Create(user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
			return domain.ErrUserAlreadyExists
		}
		return result.Error
	}
	return nil
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	var user domain.User
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, result.Error
	}
	return &user, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	result := r.db.WithContext(ctx).Where("email = ?", email).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, result.Error
	}
	return &user, nil
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	result := r.db.WithContext(ctx).Save(user)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrUserNotFound
	}
	return nil
}

func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Where("id = ?", id).Delete(&domain.User{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrUserNotFound
	}
	return nil
}

func (r *userRepository) List(ctx context.Context, params domain.ListParams) ([]*domain.User, int64, error) {
	var users []*domain.User
	var total int64

	query := r.db.WithContext(ctx).Model(&domain.User{})

	// Apply filters.
	if params.Search != "" {
		search := "%" + params.Search + "%"
		query = query.Where("email ILIKE ? OR full_name ILIKE ?", search, search)
	}

	if params.Role != "" {
		query = query.Where("role = ?", params.Role)
	}

	if params.IsActive != nil {
		query = query.Where("is_active = ?", *params.IsActive)
	}

	// Count total matching records.
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting.
	sortBy := params.SortBy
	if sortBy == "" {
		sortBy = "created_at"
	}
	sortDir := params.SortDir
	if sortDir == "" {
		sortDir = "desc"
	}
	query = query.Order(sortBy + " " + sortDir)

	// Apply pagination.
	offset := (params.Page - 1) * params.PerPage
	query = query.Offset(offset).Limit(params.PerPage)

	if err := query.Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}
