package kafka

import (
	"context"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	ingest "github.com/indalyadav56/logify/apps/backend/internal/ingest/application"
	"github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
	project "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	"github.com/indalyadav56/logify/apps/backend/pkg/jwt"
)

type recordingWriter struct {
	messages []kafka.Message
	err      error
}

func (w *recordingWriter) WriteMessages(_ context.Context, messages ...kafka.Message) error {
	w.messages = append(w.messages, messages...)
	return w.err
}
func (w *recordingWriter) Close() error { return nil }

type sharedProject struct{ project *project.Project }

func (p sharedProject) GetForUser(context.Context, uuid.UUID, uuid.UUID) (*project.Project, error) {
	return p.project, nil
}

func TestSharedProjectScopeSurvivesKafkaSerialization(t *testing.T) {
	gin.SetMode(gin.TestMode)
	writer := &recordingWriter{}
	producer := &logProducer{writer: writer, topic: "logs", logger: zap.NewNop()}
	owner, member := uuid.New(), uuid.New()
	p := &project.Project{ID: uuid.New(), TenantID: owner, CreatedBy: owner, Role: project.RoleMember}
	service := ingest.NewIngestService(producer, sharedProject{p})
	tokens := jwt.New(jwt.JWTConfig{SecretKey: []byte("producer-test"), TokenDuration: time.Hour})
	token, err := tokens.GenerateToken(map[string]interface{}{"sub": member.String(), "tenant_id": member.String()})
	require.NoError(t, err)
	router := gin.New()
	router.POST("/logs", middleware.AuthMiddleware(tokens), func(c *gin.Context) {
		err := service.Ingest(c.Request.Context(), domain.Log{ProjectID: p.ID.String(), TenantID: member.String(), Level: "info", Message: "shared event"})
		require.NoError(t, err)
		c.Status(202)
	})
	req := httptest.NewRequest("POST", "/logs", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, req)
	require.Equal(t, 202, response.Code)
	require.Len(t, writer.messages, 1)
	var event domain.Log
	require.NoError(t, json.Unmarshal(writer.messages[0].Value, &event))
	require.Equal(t, owner.String(), event.TenantID)
	require.Equal(t, p.ID.String(), event.ProjectID)
	require.Equal(t, p.ID.String(), string(writer.messages[0].Key))
}
func TestProducerRejectsMissingScopeAndSurfacesDeliveryFailure(t *testing.T) {
	writer := &recordingWriter{err: errors.New("broker unavailable")}
	producer := &logProducer{writer: writer, logger: zap.NewNop()}
	require.Error(t, producer.Produce(context.Background(), domain.Log{ProjectID: uuid.NewString()}))
	require.Empty(t, writer.messages)
	require.ErrorIs(t, producer.Produce(context.Background(), domain.Log{TenantID: uuid.NewString(), ProjectID: uuid.NewString()}), writer.err)
}
