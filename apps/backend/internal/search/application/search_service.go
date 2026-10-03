package application

import (
	"context"
	"time"

	"github.com/google/uuid"
	projectApp "github.com/indalyadav56/logify/apps/backend/internal/project/application"
	project "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/search/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	"go.uber.org/zap"
)

const defaultSearchWindow = time.Hour

type SearchService struct {
	repo     domain.Repository
	projects project.AccessRepository
	log      *zap.Logger
}

func NewSearchService(repo domain.Repository, projects project.AccessRepository, log *zap.Logger) *SearchService {
	return &SearchService{repo, projects, log}
}
func (s *SearchService) scope(ctx context.Context, q *domain.Query) error {
	id, err := uuid.Parse(q.ProjectID)
	if err != nil {
		return domain.ErrProjectIDRequired
	}
	p, err := projectApp.RequireAccess(ctx, s.projects, id)
	if err != nil {
		return err
	}
	q.ProjectID = p.ID.String()
	q.TenantID = p.TenantID.String()
	return nil
}
func (s *SearchService) Search(ctx context.Context, q domain.Query) (*domain.SearchResult, error) {
	if err := s.scope(ctx, &q); err != nil {
		return nil, err
	}
	q.ApplyTimeRangeDefaults(defaultSearchWindow)
	if err := q.Validate(); err != nil {
		return nil, err
	}
	return s.repo.Search(ctx, q)
}
func (s *SearchService) GetByID(ctx context.Context, projectID, logID string) (*domain.LogEntry, error) {
	q := domain.Query{ProjectID: projectID}
	if projectID != "" {
		if err := s.scope(ctx, &q); err != nil {
			return nil, err
		}
	} else {
		// Compatibility for existing callers: without project_id, only search the
		// user's own tenant. The returned event still gets a project access check.
		tenant, ok := middleware.TenantIDFromContext(ctx)
		if !ok {
			return nil, domain.ErrTenantIDRequired
		}
		q.TenantID = tenant
	}
	entry, err := s.repo.GetByID(ctx, q.TenantID, logID)
	if err != nil {
		return nil, err
	}
	if projectID != "" && entry.ProjectID != q.ProjectID {
		return nil, domain.ErrLogNotFound
	}
	entryScope := domain.Query{ProjectID: entry.ProjectID}
	if err := s.scope(ctx, &entryScope); err != nil {
		return nil, err
	}
	if entry.TenantID != entryScope.TenantID {
		return nil, domain.ErrLogNotFound
	}
	return entry, nil
}
func (s *SearchService) Aggregate(ctx context.Context, req domain.AggregationRequest) (*domain.AggregationResult, error) {
	if err := s.scope(ctx, &req.Query); err != nil {
		return nil, err
	}
	if err := req.Query.Validate(); err != nil {
		return nil, err
	}
	return s.repo.Aggregate(ctx, req)
}
