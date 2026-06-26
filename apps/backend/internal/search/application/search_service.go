package application

import (
	"context"
	"time"

	"go.uber.org/zap"

	"github.com/indalyadav56/logify/apps/backend/internal/search/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
)

const defaultSearchWindow = time.Hour

type SearchService struct {
	repo domain.Repository
	log  *zap.Logger
}

func NewSearchService(repo domain.Repository, log *zap.Logger) *SearchService {
	return &SearchService{repo: repo, log: log}
}

func (s *SearchService) Search(ctx context.Context, q domain.Query) (*domain.SearchResult, error) {
	tenantID, ok := middleware.TenantIDFromContext(ctx)
	if !ok {
		return nil, domain.ErrTenantIDRequired
	}
	q.TenantID = tenantID
	q.ApplyTimeRangeDefaults(defaultSearchWindow)

	if err := q.Validate(); err != nil {
		return nil, err
	}
	return s.repo.Search(ctx, q)
}

func (s *SearchService) GetByID(ctx context.Context, tenantID, logID string) (*domain.LogEntry, error) {
	return s.repo.GetByID(ctx, tenantID, logID)
}

func (s *SearchService) Aggregate(ctx context.Context, req domain.AggregationRequest) (*domain.AggregationResult, error) {
	if err := req.Query.Validate(); err != nil {
		return nil, err
	}
	return s.repo.Aggregate(ctx, req)
}
