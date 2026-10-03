//go:build integration

package application_test

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	keyApp "github.com/indalyadav56/logify/apps/backend/internal/apikey/application"
	keyPG "github.com/indalyadav56/logify/apps/backend/internal/apikey/infrastructure/postgres"
	keyHTTP "github.com/indalyadav56/logify/apps/backend/internal/apikey/transport/http"
	ingestApp "github.com/indalyadav56/logify/apps/backend/internal/ingest/application"
	ingestDomain "github.com/indalyadav56/logify/apps/backend/internal/ingest/domain"
	ingestHTTP "github.com/indalyadav56/logify/apps/backend/internal/ingest/transport/http"
	projectApp "github.com/indalyadav56/logify/apps/backend/internal/project/application"
	projectDomain "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	projectPG "github.com/indalyadav56/logify/apps/backend/internal/project/infrastructure/postgres"
	projectHTTP "github.com/indalyadav56/logify/apps/backend/internal/project/transport/http"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	"github.com/indalyadav56/logify/apps/backend/pkg/jwt"
)

func TestProjectAPIKeysIntegration(t *testing.T) {
	pool := apiKeyDatabase(t)
	ctx := context.Background()
	projects := projectPG.NewProjectRepository(pool)
	service := keyApp.NewService(keyPG.NewRepository(pool), projects)
	tokens := jwt.New(jwt.JWTConfig{SecretKey: []byte("api-key-integration-test"), TokenDuration: time.Hour})
	producer := &captureProducer{}
	gin.SetMode(gin.TestMode)
	router := gin.New()
	secured := router.Group("", middleware.AuthMiddleware(tokens))
	keyHTTP.RegisterRoutes(secured, keyHTTP.NewHandler(service))
	projectHTTP.RegisterRoutes(secured, projectHTTP.NewProjectHandler(projectApp.NewProjectService(projects, zap.NewNop())))
	secured.POST("/v1/logs/search", func(c *gin.Context) { c.Status(http.StatusNoContent) })
	ingest := router.Group("", middleware.IngestAuthMiddleware(tokens, service))
	ingestHTTP.RegisterRoutes(ingest, ingestHTTP.NewIngestHandler(ingestApp.NewIngestService(producer, projects)))

	newProject := func(user uuid.UUID, name string) *projectDomain.Project {
		p := &projectDomain.Project{TenantID: user, CreatedBy: user, Name: name}
		require.NoError(t, projects.Create(ctx, p))
		return p
	}
	newUser := func() (uuid.UUID, string) {
		var user uuid.UUID
		require.NoError(t, pool.QueryRow(ctx, `INSERT INTO auth.users (email, full_name, password_hash)
			VALUES ($1, 'API key test', 'unused') RETURNING id`, uuid.NewString()+"@example.test").Scan(&user))
		token, err := tokens.GenerateToken(map[string]interface{}{"sub": user.String(), "tenant_id": user.String()})
		require.NoError(t, err)
		return user, token
	}
	owner, ownerToken := newUser()
	other, otherToken := newUser()
	project := newProject(owner, "default-project")
	second := newProject(owner, "second-project")
	foreign := newProject(other, "foreign-project")
	path := "/v1/projects/" + project.ID.String() + "/api-keys"
	bearer := func(token string) map[string]string { return map[string]string{"Authorization": "Bearer " + token} }
	create := func(t *testing.T, projectID uuid.UUID, token, name string) keyApp.CreatedKey {
		t.Helper()
		response := keyRequest(router, http.MethodPost, "/v1/projects/"+projectID.String()+"/api-keys", bearer(token), map[string]string{"name": name})
		require.Equal(t, http.StatusCreated, response.Code)
		require.Equal(t, "no-store", response.Header().Get("Cache-Control"))
		var envelope struct{ Data keyApp.CreatedKey }
		require.NoError(t, json.Unmarshal(response.Body.Bytes(), &envelope))
		require.NotEmpty(t, envelope.Data.Secret)
		return envelope.Data
	}
	key := create(t, project.ID, ownerToken, "  my-app  ")
	keyHeader := map[string]string{"X-API-Key": key.Secret}
	log := map[string]string{"level": "info", "message": "API key test", "tenant_id": other.String()}

	t.Run("secrets are shown once and only hashes are persisted", func(t *testing.T) {
		require.Equal(t, "my-app", key.Name)
		require.Equal(t, 48, len(key.Secret))
		require.True(t, strings.HasPrefix(key.Secret, "lgfy_"))
		var storedHash, prefix string
		require.NoError(t, pool.QueryRow(ctx, "SELECT key_hash, key_prefix FROM project_api_keys WHERE id=$1", key.ID).Scan(&storedHash, &prefix))
		digest := sha256.Sum256([]byte(key.Secret))
		require.Equal(t, hex.EncodeToString(digest[:]), storedHash)
		require.Equal(t, key.Secret[:13], prefix)
		listed := keyRequest(router, http.MethodGet, path, bearer(ownerToken), nil)
		require.Equal(t, http.StatusOK, listed.Code)
		require.NotContains(t, listed.Body.String(), key.Secret)
		require.NotContains(t, listed.Body.String(), storedHash)
		require.NotContains(t, listed.Body.String(), `"key":`)
		require.NotContains(t, listed.Body.String(), `"key_hash":`)
	})

	t.Run("keys infer their project and cannot change it", func(t *testing.T) {
		for _, headers := range []map[string]string{keyHeader, bearer(key.Secret)} {
			response := keyRequest(router, http.MethodPost, "/v1/logs", headers, log)
			require.Equal(t, http.StatusAccepted, response.Code)
			sent := producer.last()
			require.Equal(t, project.ID.String(), sent.ProjectID)
			require.Equal(t, owner.String(), sent.TenantID)
		}
		payload := map[string]string{"level": "info", "project_id": strings.ToUpper(project.ID.String())}
		require.Equal(t, http.StatusAccepted, keyRequest(router, http.MethodPost, "/v1/logs", keyHeader, payload).Code)
		before := producer.count()
		for _, id := range []uuid.UUID{second.ID, foreign.ID} {
			payload["project_id"] = id.String()
			require.Equal(t, http.StatusForbidden, keyRequest(router, http.MethodPost, "/v1/logs", keyHeader, payload).Code)
		}
		payload["project_id"] = "invalid"
		require.Equal(t, http.StatusBadRequest, keyRequest(router, http.MethodPost, "/v1/logs", keyHeader, payload).Code)
		require.Equal(t, before, producer.count())
	})

	t.Run("login tokens still ingest only into owned projects", func(t *testing.T) {
		payload := map[string]string{"level": "info", "project_id": project.ID.String()}
		require.Equal(t, http.StatusAccepted, keyRequest(router, http.MethodPost, "/v1/logs", bearer(ownerToken), payload).Code)
		payload["project_id"] = foreign.ID.String()
		require.Equal(t, http.StatusNotFound, keyRequest(router, http.MethodPost, "/v1/logs", bearer(ownerToken), payload).Code)
		require.Equal(t, http.StatusBadRequest, keyRequest(router, http.MethodPost, "/v1/logs", bearer(ownerToken), log).Code)
	})

	t.Run("invalid missing and ambiguous credentials never publish", func(t *testing.T) {
		before := producer.count()
		for _, headers := range []map[string]string{nil, {"X-API-Key": ""}, {"X-API-Key": "invalid"}, {"X-API-Key": "lgfy_" + strings.Repeat("x", 43)}} {
			require.Equal(t, http.StatusUnauthorized, keyRequest(router, http.MethodPost, "/v1/logs", headers, log).Code)
		}
		expired := jwt.New(jwt.JWTConfig{SecretKey: []byte("api-key-integration-test"), TokenDuration: -time.Minute})
		expiredToken, err := expired.GenerateToken(map[string]interface{}{"sub": owner.String(), "tenant_id": owner.String()})
		require.NoError(t, err)
		require.Equal(t, http.StatusUnauthorized, keyRequest(router, http.MethodPost, "/v1/logs", bearer(expiredToken), log).Code)
		require.Equal(t, http.StatusBadRequest, keyRequest(router, http.MethodPost, "/v1/logs", map[string]string{"X-API-Key": key.Secret, "Authorization": "Bearer " + ownerToken}, log).Code)
		require.Equal(t, before, producer.count())
	})

	t.Run("API keys cannot read logs or manage accounts projects or keys", func(t *testing.T) {
		for _, headers := range []map[string]string{keyHeader, bearer(key.Secret)} {
			for _, route := range []struct{ method, path string }{
				{http.MethodGet, "/v1/projects"}, {http.MethodDelete, "/v1/projects/" + project.ID.String()},
				{http.MethodGet, path}, {http.MethodPost, path}, {http.MethodDelete, path + "/" + key.ID.String()},
				{http.MethodPost, "/v1/logs/search"},
			} {
				require.Equal(t, http.StatusUnauthorized, keyRequest(router, route.method, route.path, headers, map[string]string{"name": "forbidden"}).Code)
			}
		}
	})

	t.Run("another account cannot inspect create revoke or delete project keys", func(t *testing.T) {
		for _, route := range []struct{ method, path string }{
			{http.MethodGet, path}, {http.MethodPost, path}, {http.MethodDelete, path + "/" + key.ID.String()},
			{http.MethodGet, "/v1/projects/" + project.ID.String()}, {http.MethodPut, "/v1/projects/" + project.ID.String()},
			{http.MethodDelete, "/v1/projects/" + project.ID.String()},
		} {
			require.Equal(t, http.StatusNotFound, keyRequest(router, route.method, route.path, bearer(otherToken), map[string]string{"name": "forbidden"}).Code)
		}
		wrongPath := "/v1/projects/" + second.ID.String() + "/api-keys/" + key.ID.String()
		require.Equal(t, http.StatusNotFound, keyRequest(router, http.MethodDelete, wrongPath, bearer(ownerToken), nil).Code)
		require.Equal(t, http.StatusAccepted, keyRequest(router, http.MethodPost, "/v1/logs", keyHeader, log).Code)
	})

	t.Run("names and UUIDs are validated", func(t *testing.T) {
		for _, name := range []string{"", "   ", strings.Repeat("x", 65)} {
			require.Equal(t, http.StatusBadRequest, keyRequest(router, http.MethodPost, path, bearer(ownerToken), map[string]string{"name": name}).Code)
		}
		require.Equal(t, http.StatusBadRequest, keyRequest(router, http.MethodGet, "/v1/projects/invalid/api-keys", bearer(ownerToken), nil).Code)
	})

	t.Run("revocation is immediate and idempotent and a replacement works", func(t *testing.T) {
		require.Equal(t, http.StatusNoContent, keyRequest(router, http.MethodDelete, path+"/"+key.ID.String(), bearer(ownerToken), nil).Code)
		require.Equal(t, http.StatusNoContent, keyRequest(router, http.MethodDelete, path+"/"+key.ID.String(), bearer(ownerToken), nil).Code)
		for _, headers := range []map[string]string{keyHeader, bearer(key.Secret)} {
			require.Equal(t, http.StatusUnauthorized, keyRequest(router, http.MethodPost, "/v1/logs", headers, log).Code)
		}
		var revoked *time.Time
		require.NoError(t, pool.QueryRow(ctx, "SELECT revoked_at FROM project_api_keys WHERE id=$1", key.ID).Scan(&revoked))
		require.NotNil(t, revoked)
		replacement := create(t, project.ID, ownerToken, "replacement")
		require.NotEqual(t, key.Secret, replacement.Secret)
		require.Equal(t, http.StatusAccepted, keyRequest(router, http.MethodPost, "/v1/logs", map[string]string{"X-API-Key": replacement.Secret}, log).Code)
	})

	t.Run("suspended projects disabled users and deleted projects invalidate keys", func(t *testing.T) {
		p := newProject(owner, "lifecycle")
		issued := create(t, p.ID, ownerToken, "lifecycle")
		headers := map[string]string{"X-API-Key": issued.Secret}
		_, err := pool.Exec(ctx, "UPDATE projects SET status='suspended' WHERE id=$1", p.ID)
		require.NoError(t, err)
		require.Equal(t, http.StatusUnauthorized, keyRequest(router, http.MethodPost, "/v1/logs", headers, log).Code)
		_, err = pool.Exec(ctx, "UPDATE projects SET status='active' WHERE id=$1", p.ID)
		require.NoError(t, err)
		_, err = pool.Exec(ctx, "UPDATE auth.users SET is_active=false WHERE id=$1", owner)
		require.NoError(t, err)
		require.Equal(t, http.StatusUnauthorized, keyRequest(router, http.MethodPost, "/v1/logs", headers, log).Code)
		_, err = pool.Exec(ctx, "UPDATE auth.users SET is_active=true WHERE id=$1", owner)
		require.NoError(t, err)
		require.Equal(t, http.StatusNoContent, keyRequest(router, http.MethodDelete, "/v1/projects/"+p.ID.String(), bearer(ownerToken), nil).Code)
		require.Equal(t, http.StatusUnauthorized, keyRequest(router, http.MethodPost, "/v1/logs", headers, log).Code)
		var remaining int
		require.NoError(t, pool.QueryRow(ctx, "SELECT count(*) FROM project_api_keys WHERE project_id=$1", p.ID).Scan(&remaining))
		require.Zero(t, remaining)
	})

	t.Run("database failures never authorize or publish", func(t *testing.T) {
		before := producer.count()
		pool.Close()
		require.Equal(t, http.StatusInternalServerError, keyRequest(router, http.MethodPost, "/v1/logs", keyHeader, log).Code)
		require.Equal(t, before, producer.count())
	})
}

type captureProducer struct {
	mu   sync.Mutex
	logs []ingestDomain.Log
}

func (p *captureProducer) Produce(_ context.Context, log ingestDomain.Log) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.logs = append(p.logs, log)
	return nil
}
func (p *captureProducer) last() ingestDomain.Log {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.logs[len(p.logs)-1]
}
func (p *captureProducer) count() int { p.mu.Lock(); defer p.mu.Unlock(); return len(p.logs) }

func keyRequest(router http.Handler, method, path string, headers map[string]string, body interface{}) *httptest.ResponseRecorder {
	encoded, _ := json.Marshal(body)
	request := httptest.NewRequest(method, path, bytes.NewReader(encoded))
	request.Header.Set("Content-Type", "application/json")
	for name, value := range headers {
		request.Header.Set(name, value)
	}
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	return response
}

func apiKeyDatabase(t *testing.T) *pgxpool.Pool {
	t.Helper()
	dsn := os.Getenv("LOGIFY_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set LOGIFY_TEST_DATABASE_URL to PostgreSQL 18 with pgvector and CREATE DATABASE permission")
	}
	ctx := context.Background()
	admin, err := pgx.Connect(ctx, dsn)
	require.NoError(t, err)
	name := "logify_api_key_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	_, err = admin.Exec(ctx, "CREATE DATABASE "+pgx.Identifier{name}.Sanitize())
	if err != nil {
		_ = admin.Close(ctx)
		t.Fatalf("create isolated database: %v", err)
	}
	var pool *pgxpool.Pool
	t.Cleanup(func() {
		if pool != nil {
			pool.Close()
		}
		_, err := admin.Exec(ctx, "DROP DATABASE "+pgx.Identifier{name}.Sanitize())
		if err != nil {
			t.Errorf("drop isolated database: %v", err)
		}
		_ = admin.Close(ctx)
	})
	cfg, err := pgxpool.ParseConfig(dsn)
	require.NoError(t, err)
	cfg.ConnConfig.Database = name
	pool, err = pgxpool.NewWithConfig(ctx, cfg)
	require.NoError(t, err)
	migrationDB := stdlib.OpenDB(*cfg.ConnConfig)
	defer migrationDB.Close()
	require.NoError(t, goose.SetDialect("postgres"))
	_, source, _, ok := runtime.Caller(0)
	require.True(t, ok)
	require.NoError(t, goose.UpContext(ctx, migrationDB, filepath.Join(filepath.Dir(source), "../../../migrations/postgres")))
	return pool
}
