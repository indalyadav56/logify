package services

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"

	"github.com/indalyadav56/logify/services/project-service/internal/domain/entity"
	"github.com/indalyadav56/logify/services/project-service/internal/domain/repository"
	"github.com/indalyadav56/logify/services/project-service/internal/transport/http/v1/dto"
	"github.com/indalyadav56/logify/services/project-service/pkg/types"

	"github.com/google/uuid"
)

type ApiKeyService interface {
	CreateApiKey(req *dto.CreateApiKeyRequest, projectId string) (*entity.ApiKey, error)
	ListApiKeys(projectID string) ([]entity.ApiKey, error)
	GetApiKeyDataByKey(apiKeyId string) (*entity.ApiKey, error)
}

type apiKeyService struct {
	repo repository.ApiKeyRepository
}

func NewApiKeyService(repo repository.ApiKeyRepository) ApiKeyService {
	return &apiKeyService{
		repo: repo,
	}
}

func (s *apiKeyService) CreateApiKey(req *dto.CreateApiKeyRequest, projectId string) (*entity.ApiKey, error) {
	hashApiKey := s.generateAPIKey()

	apiKey := &entity.ApiKey{
		ProjectID:   uuid.MustParse(projectId),
		ApiKey:      hashApiKey,
		Name:        types.FromString(req.Name),
		Description: types.FromString(req.Description),
		UserID:      req.UserID,
		TenantID:    req.TenantID,
	}

	_, err := s.repo.Insert(context.Background(), apiKey)
	if err != nil {
		return nil, err
	}

	return apiKey, nil
}

func (s *apiKeyService) ListApiKeys(projectID string) ([]entity.ApiKey, error) {
	return s.repo.ListByProjectID(context.Background(), projectID)
}

func (s *apiKeyService) GetApiKeyDataByKey(apiKeyId string) (*entity.ApiKey, error) {
	apiKey, err := s.repo.GetById(context.Background(), apiKeyId)
	if err != nil {
		return nil, err
	}

	return apiKey, nil
}

func (s *apiKeyService) generateAPIKey() string {
	randomBytes := make([]byte, 32) // 256 bits of entropy
	rand.Read(randomBytes)
	h := hmac.New(sha256.New, randomBytes)
	return hex.EncodeToString(h.Sum(nil))
}
