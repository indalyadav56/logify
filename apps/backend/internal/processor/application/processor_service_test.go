package application

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	ingestDomain "github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
	"github.com/indalyadav56/logify/apps/backend/internal/processor/domain"
)

func TestLogProcessorPreservesEventTimeAndSetsIngestionTime(t *testing.T) {
	repo := &capturingLogRepository{}
	service := NewProcessorService(nil, repo, zap.NewNop())
	eventTime := time.Date(2026, 10, 1, 12, 0, 0, 0, time.UTC)
	payload, err := json.Marshal(ingestDomain.Log{
		TenantID: "tenant", ProjectID: "project", Timestamp: eventTime.Unix(),
		Level: "info", Service: "my-app", Message: "Hello from my application",
	})
	require.NoError(t, err)
	before := time.Now().UTC().Truncate(time.Second)
	require.NoError(t, service.handleMessage(context.Background(), payload))
	require.Len(t, repo.logs, 1)
	stored := repo.logs[0]
	require.Equal(t, eventTime, stored.Timestamp, "event timestamp must preserve the sender's time")
	require.False(t, stored.IngestionTime.Before(before), "ingestion time must be the current processing time, not the Unix epoch")
	require.False(t, stored.IngestionTime.After(time.Now().UTC()))
	require.Equal(t, "tenant", stored.TenantID)
	require.Equal(t, "project", stored.ProjectID)
	require.Equal(t, "Hello from my application", stored.Message)
}

type capturingLogRepository struct{ logs []*domain.Log }

func (r *capturingLogRepository) InsertBatch(_ context.Context, logs []*domain.Log) error {
	r.logs = append(r.logs, logs...)
	return nil
}

func (*capturingLogRepository) Query(context.Context, domain.LogFilter) ([]*domain.Log, error) {
	panic("unexpected query during ingestion")
}

func (*capturingLogRepository) Count(context.Context, domain.LogFilter) (uint64, error) {
	panic("unexpected count during ingestion")
}
