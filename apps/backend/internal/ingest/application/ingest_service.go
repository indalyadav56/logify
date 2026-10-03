package application

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
	projectDomain "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
)

type IngestService interface {
	Ingest(ctx context.Context, log domain.Log) error
}

type ingestService struct {
	logProducer domain.LogProducer
	projects    ProjectLookup
}

type ProjectLookup interface {
	GetByID(context.Context, uuid.UUID) (*projectDomain.Project, error)
}

func NewIngestService(logProducer domain.LogProducer, projects ProjectLookup) *ingestService {
	return &ingestService{
		logProducer: logProducer,
		projects:    projects,
	}
}

func (i *ingestService) Ingest(ctx context.Context, log domain.Log) error {
	tenant, ok := middleware.GetTenantUUIDFromContext(ctx)
	if !ok {
		return domain.ErrUnauthorized
	}
	if boundProject, isKey := middleware.APIKeyProjectIDFromContext(ctx); isKey {
		if log.ProjectID != "" {
			id, err := uuid.Parse(log.ProjectID)
			if err != nil {
				return domain.ErrInvalidProject
			}
			if id != boundProject {
				return domain.ErrProjectForbidden
			}
		}
		log.ProjectID = boundProject.String()
	} else {
		id, err := uuid.Parse(log.ProjectID)
		if err != nil {
			return domain.ErrInvalidProject
		}
		project, err := i.projects.GetByID(ctx, id)
		if err != nil {
			return err
		}
		if project.TenantID != tenant {
			return projectDomain.ErrProjectNotFound
		}
		log.ProjectID = id.String()
	}
	log.TenantID = tenant.String()
	if err := i.logProducer.Produce(ctx, log); err != nil {
		return fmt.Errorf("produce log: %w", err)
	}
	return nil
}
