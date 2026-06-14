package services

import (
	"log/slog"

	"github.com/indalyadav56/logify/services/user-service/internal/domain/entity"
	"github.com/indalyadav56/logify/services/user-service/internal/domain/repository"
	"github.com/indalyadav56/logify/services/user-service/internal/transport/http/v1/dto"
	"github.com/indalyadav56/logify/services/user-service/pkg/types"
)

type UserService interface {
	CreateUser(req *dto.CreateUserRequest) (*entity.User, error)
	GetUserByEmail(email string) (*entity.User, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (u *userService) CreateUser(req *dto.CreateUserRequest) (*entity.User, error) {
	user := &entity.User{
		FirstName:  types.FromString(req.FirstName),
		MiddleName: types.FromString(req.MiddleName),
		LastName:   types.FromString(req.LastName),
		Email:      req.Email,
		Password:   req.Password,
	}

	err := u.repo.InsertUser(user)
	if err != nil {
		slog.Error(err.Error())
		return nil, err
	}

	return user, nil
}

func (s *userService) GetUserByEmail(email string) (*entity.User, error) {
	existingUser, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, err
	}

	return existingUser, nil
}
