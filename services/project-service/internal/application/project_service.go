package services

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/google/uuid"
	"github.com/indalyadav56/logify/services/project-service/internal/domain/entity"
	"github.com/indalyadav56/logify/services/project-service/internal/domain/repository"
	pb "github.com/indalyadav56/logify/services/project-service/internal/transport/grpc/proto"
	"github.com/indalyadav56/logify/services/project-service/internal/transport/http/v1/dto"
	"github.com/opensearch-project/opensearch-go"
	"github.com/twmb/franz-go/pkg/kadm"
)

type ProjectService interface {
	Create(req *dto.CreateProjectRequest) (*entity.Project, error)
	GetByID(id string) (*entity.Project, error)
	List(userID, tanentID string) ([]entity.Project, error)
	Update(id string, item *entity.Project) (*entity.Project, error)
	Delete(id string) error
	GetProjectIDs(ctx context.Context, userID string) (*pb.GetProjectIDsResponse, error)
}

type projectService struct {
	repo             repository.ProjectRepository
	kafkaAdmin       *kadm.Client
	openSearchClient *opensearch.Client
}

func NewProjectService(repo repository.ProjectRepository, kafkaAdmin *kadm.Client, openSearchClient *opensearch.Client) ProjectService {
	return &projectService{
		repo:             repo,
		kafkaAdmin:       kafkaAdmin,
		openSearchClient: openSearchClient,
	}
}

func (s *projectService) Create(req *dto.CreateProjectRequest) (*entity.Project, error) {
	p := &entity.Project{
		Title:    req.Title,
		TenantID: uuid.MustParse(req.TenantID),
		UserID:   uuid.MustParse(req.UserID),
	}

	err := s.repo.Insert(context.Background(), p)
	if err != nil {
		return nil, err
	}

	// create kafka topic
	if err := s.createKafkaTopic(p.ID.String()); err != nil {
		return nil, err
	}

	return p, nil
}

func (s *projectService) GetByID(id string) (*entity.Project, error) {
	return s.repo.FindByID(context.Background(), id)
}

func (s *projectService) List(userID, tanentID string) ([]entity.Project, error) {
	return s.repo.FindByUserID(context.Background(), userID)
}

func (s *projectService) Update(id string, item *entity.Project) (*entity.Project, error) {
	err := s.repo.Update(context.Background(), item)
	if err != nil {
		return nil, err
	}

	return item, nil
}

func (s *projectService) Delete(id string) error {
	return s.repo.Delete(context.Background(), id)
}

func (s *projectService) createKafkaTopic(projectID string) error {
	slog.Info("Creating Kafka topic for project", "projectID", projectID)
	topic := fmt.Sprintf("logify-%s", projectID)

	numPartitions := int32(1)
	replicationFactor := int16(1)

	// Custom topic configurations
	topicConfigs := map[string]*string{
		"cleanup.policy":    kadm.StringPtr("delete"),    // Options: delete, compact
		"retention.ms":      kadm.StringPtr("604800000"), // 7 days retention
		"segment.bytes":     kadm.StringPtr("104857600"), // 100 MB segment size
		"max.message.bytes": kadm.StringPtr("1048576"),   // 1 MB max message size
	}

	_, err := s.kafkaAdmin.CreateTopics(context.Background(), numPartitions, replicationFactor, topicConfigs, topic)
	if err != nil {
		return err
	}

	return nil
}

func (s *projectService) GetProjectIDs(ctx context.Context, userID string) (*pb.GetProjectIDsResponse, error) {
	projects, err := s.repo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	projectIDs := make([]string, len(projects))
	for i, project := range projects {
		projectIDs[i] = project.ID.String()
	}

	var res pb.GetProjectIDsResponse

	if len(projects) == 0 {
		slog.Warn("No projects found for user", "userID", userID)
		return &pb.GetProjectIDsResponse{
			ProjectIds: projectIDs,
			UserId:     userID,
			TenantId:   "",
		}, errors.New("No projects found for user")
	}

	res.ProjectIds = projectIDs
	res.UserId = userID
	res.TenantId = projects[0].TenantID.String()

	return &res, nil
}
