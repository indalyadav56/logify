package repository

import "github.com/indalyadav56/logify/services/user-service/internal/domain/entity"

type UserRepository interface {
	InsertUser(u *entity.User) error
	FindByEmail(email string) (*entity.User, error)
	FindByID(id string) (*entity.User, error)
}
