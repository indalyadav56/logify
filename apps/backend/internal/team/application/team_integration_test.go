//go:build integration

package application_test

import (
	"bytes"
	"context"
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
	searchApp "github.com/indalyadav56/logify/apps/backend/internal/search/application"
	searchDomain "github.com/indalyadav56/logify/apps/backend/internal/search/domain"
	searchHTTP "github.com/indalyadav56/logify/apps/backend/internal/search/transport/http"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	teamApp "github.com/indalyadav56/logify/apps/backend/internal/team/application"
	teamPG "github.com/indalyadav56/logify/apps/backend/internal/team/infrastructure/postgres"
	teamHTTP "github.com/indalyadav56/logify/apps/backend/internal/team/transport/http"
	"github.com/indalyadav56/logify/apps/backend/pkg/jwt"
	pg "github.com/indalyadav56/logify/apps/backend/pkg/postgres"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

func request(router http.Handler, method, path, token string, body any) *httptest.ResponseRecorder {
	encoded, _ := json.Marshal(body)
	r := httptest.NewRequest(method, path, bytes.NewReader(encoded))
	r.Header.Set("Content-Type", "application/json")
	if token != "" {
		r.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	router.ServeHTTP(w, r)
	return w
}
func data[T any](t *testing.T, w *httptest.ResponseRecorder) T {
	t.Helper()
	var result struct{ Data T }
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &result))
	return result.Data
}
func TestProjectTeamsIntegration(t *testing.T) {
	pool := teamDatabase(t)
	ctx := context.Background()
	projects := projectPG.NewProjectRepository(pool)
	team := teamApp.NewService(teamPG.NewRepository(pool), projects, pg.NewTransactor(pool))
	tokens := jwt.New(jwt.JWTConfig{SecretKey: []byte("team-integration-test"), TokenDuration: time.Hour})
	keys := keyApp.NewService(keyPG.NewRepository(pool), projects)
	producer := &captureProducer{}
	search := &captureSearch{}
	gin.SetMode(gin.TestMode)
	router := gin.New()
	secured := router.Group("", middleware.AuthMiddleware(tokens))
	teamHTTP.RegisterRoutes(secured, teamHTTP.NewHandler(team))
	projectHTTP.RegisterRoutes(secured, projectHTTP.NewProjectHandler(projectApp.NewProjectService(projects, zap.NewNop())))
	keyHTTP.RegisterRoutes(secured, keyHTTP.NewHandler(keys))
	searchHTTP.RegisterRoutes(secured, searchHTTP.NewHandler(searchApp.NewSearchService(search, projects, zap.NewNop()), zap.NewNop()))
	ingestHTTP.RegisterRoutes(router.Group("", middleware.IngestAuthMiddleware(tokens, keys)), ingestHTTP.NewIngestHandler(ingestApp.NewIngestService(producer, projects)))
	newUser := func() (uuid.UUID, string, string) {
		var id uuid.UUID
		email := uuid.NewString() + "@example.test"
		require.NoError(t, pool.QueryRow(ctx, `INSERT INTO auth.users(email,full_name,password_hash) VALUES($1,'Team test','unused') RETURNING id`, email).Scan(&id))
		token, err := tokens.GenerateToken(map[string]interface{}{"sub": id.String(), "tenant_id": id.String(), "role": "owner"})
		require.NoError(t, err)
		return id, email, token
	}
	owner, _, ownerToken := newUser()
	admin, adminEmail, adminToken := newUser()
	member, memberEmail, memberToken := newUser()
	viewer, viewerEmail, viewerToken := newUser()
	outsider, outsiderEmail, outsiderToken := newUser()
	p := &projectDomain.Project{Name: "Shared project", TenantID: owner, CreatedBy: owner}
	require.NoError(t, projects.Create(ctx, p))
	own := &projectDomain.Project{Name: "Private project", TenantID: member, CreatedBy: member}
	require.NoError(t, projects.Create(ctx, own))
	path := "/v1/projects/" + p.ID.String()
	search.entry = searchDomain.LogEntry{LogID: "sample", TenantID: owner.String(), ProjectID: p.ID.String()}
	invite := func(t *testing.T, email, role, token string) teamApp.CreatedInvitation {
		t.Helper()
		w := request(router, "POST", path+"/invitations", token, map[string]string{"email": email, "role": role})
		require.Equal(t, 201, w.Code, w.Body.String())
		return data[teamApp.CreatedInvitation](t, w)
	}
	accept := func(t *testing.T, i teamApp.CreatedInvitation, token string) {
		t.Helper()
		w := request(router, "POST", "/v1/invitations/accept", token, map[string]string{"token": i.Token})
		require.Equal(t, 200, w.Code, w.Body.String())
		joined := data[projectDomain.Project](t, w)
		require.Equal(t, p.ID, joined.ID)
		require.Equal(t, owner, joined.TenantID)
	}
	adminInvite := invite(t, strings.ToUpper(adminEmail), "admin", ownerToken)
	t.Run("owner and invitation lifecycle", func(t *testing.T) {
		initial := request(router, "GET", path+"/team", ownerToken, nil)
		require.Equal(t, 200, initial.Code, initial.Body.String())
		v := data[teamApp.Team](t, initial)
		require.Len(t, v.Members, 1)
		require.Equal(t, owner, v.Members[0].UserID)
		require.Equal(t, projectDomain.RoleOwner, v.Role)
		require.Equal(t, adminEmail, adminInvite.Email)
		require.Len(t, adminInvite.Token, 47)
		require.Equal(t, "no-store", initial.Header().Get("Cache-Control"))
		require.NotContains(t, initial.Body.String(), adminInvite.Token)
		require.NotContains(t, initial.Body.String(), "token_hash")
		require.Equal(t, 409, request(router, "POST", path+"/invitations", ownerToken, map[string]string{"email": adminEmail, "role": "viewer"}).Code)
		require.Equal(t, 403, request(router, "POST", "/v1/invitations/preview", outsiderToken, map[string]string{"token": adminInvite.Token}).Code)
		require.Equal(t, 403, request(router, "POST", "/v1/invitations/accept", outsiderToken, map[string]string{"token": adminInvite.Token}).Code)
		require.Equal(t, 200, request(router, "POST", "/v1/invitations/preview", adminToken, map[string]string{"token": adminInvite.Token}).Code)
		accept(t, adminInvite, adminToken)
		accept(t, adminInvite, adminToken)
		require.Equal(t, 409, request(router, "POST", path+"/invitations", ownerToken, map[string]string{"email": adminEmail, "role": "admin"}).Code)
		var count int
		require.NoError(t, pool.QueryRow(ctx, `SELECT count(*) FROM project_team_members WHERE project_id=$1 AND user_id=$2`, p.ID, admin).Scan(&count))
		require.Equal(t, 1, count)
		var hash string
		require.NoError(t, pool.QueryRow(ctx, `SELECT token_hash FROM project_invitations WHERE id=$1`, adminInvite.ID).Scan(&hash))
		require.NotEqual(t, adminInvite.Token, hash)
		require.Len(t, hash, 64)
	})
	memberInvite := invite(t, memberEmail, "member", adminToken)
	accept(t, memberInvite, memberToken)
	viewerInvite := invite(t, viewerEmail, "viewer", ownerToken)
	accept(t, viewerInvite, viewerToken)
	t.Run("shared projects and all data access use the owner's tenant", func(t *testing.T) {
		w := request(router, "GET", "/v1/projects", memberToken, nil)
		require.Equal(t, 200, w.Code, w.Body.String())
		list := data[[]projectApp.ProjectOutput](t, w)
		require.Len(t, list, 2)
		for _, token := range []string{ownerToken, adminToken, memberToken, viewerToken} {
			w = request(router, "POST", "/v1/logs/search", token, map[string]string{"project_id": p.ID.String(), "tenant_id": outsider.String()})
			require.Equal(t, 200, w.Code, w.Body.String())
			require.Equal(t, owner.String(), search.lastQuery().TenantID)
			w = request(router, "GET", "/v1/logs/sample?project_id="+p.ID.String(), token, nil)
			require.Equal(t, 200, w.Code, w.Body.String())
			w = request(router, "POST", "/v1/logs/aggregate", token, map[string]any{"project_id": p.ID.String(), "tenant_id": outsider.String(), "from": time.Now().Add(-time.Hour), "to": time.Now()})
			require.Equal(t, 200, w.Code, w.Body.String())
			require.Equal(t, owner.String(), search.lastQuery().TenantID)
		}
		w = request(router, "POST", "/v1/logs/aggregate", viewerToken, map[string]any{"project_id": p.ID.String(), "from": time.Now().Add(-time.Hour), "to": time.Now()})
		require.Equal(t, 200, w.Code, w.Body.String())
		require.Equal(t, 400, request(router, "GET", "/v1/logs/sample?project_id=invalid", ownerToken, nil).Code)
		for _, token := range []string{ownerToken, adminToken, memberToken} {
			w = request(router, "POST", "/v1/logs", token, map[string]string{"project_id": p.ID.String(), "tenant_id": outsider.String(), "level": "info"})
			require.Equal(t, 202, w.Code, w.Body.String())
			require.Equal(t, owner.String(), producer.last().TenantID)
		}
		require.Equal(t, 403, request(router, "POST", "/v1/logs", viewerToken, map[string]string{"project_id": p.ID.String(), "level": "info"}).Code)
	})
	t.Run("role checks cannot be bypassed by claims or request bodies", func(t *testing.T) {
		for _, token := range []string{memberToken, viewerToken} {
			require.Equal(t, 403, request(router, "PUT", path, token, map[string]string{"name": "unauthorized"}).Code)
			require.Equal(t, 403, request(router, "POST", path+"/api-keys", token, map[string]string{"name": "bad"}).Code)
			require.Equal(t, 403, request(router, "GET", path+"/api-keys", token, nil).Code)
			require.Equal(t, 403, request(router, "POST", path+"/invitations", token, map[string]string{"email": outsiderEmail, "role": "admin"}).Code)
			require.Equal(t, 403, request(router, "PATCH", path+"/members/"+admin.String(), token, map[string]string{"role": "viewer"}).Code)
			require.Equal(t, 403, request(router, "DELETE", path+"/members/"+admin.String(), token, nil).Code)
			v := data[teamApp.Team](t, request(router, "GET", path+"/team", token, nil))
			require.Empty(t, v.Invitations)
		}
		require.Equal(t, 403, request(router, "DELETE", path, adminToken, nil).Code)
		require.Equal(t, 200, request(router, "PUT", path, adminToken, map[string]string{"description": "Admin edit"}).Code)
		require.Equal(t, 403, request(router, "PATCH", path+"/members/"+owner.String(), adminToken, map[string]string{"role": "viewer"}).Code)
		require.Equal(t, 403, request(router, "DELETE", path+"/members/"+owner.String(), ownerToken, nil).Code)
		before := search.calls()
		require.Equal(t, 404, request(router, "POST", "/v1/logs/search", outsiderToken, map[string]string{"project_id": p.ID.String()}).Code)
		require.Equal(t, before, search.calls())
		require.Equal(t, 404, request(router, "GET", path+"/team", outsiderToken, nil).Code)
	})
	t.Run("canceled expired and malformed links never grant membership", func(t *testing.T) {
		canceled := invite(t, outsiderEmail, "member", ownerToken)
		require.Equal(t, 204, request(router, "DELETE", path+"/invitations/"+canceled.ID.String(), ownerToken, nil).Code)
		require.Equal(t, 410, request(router, "POST", "/v1/invitations/accept", outsiderToken, map[string]string{"token": canceled.Token}).Code)
		expired := invite(t, outsiderEmail, "viewer", ownerToken)
		_, err := pool.Exec(ctx, `UPDATE project_invitations SET expires_at=now()-interval '1 minute' WHERE id=$1`, expired.ID)
		require.NoError(t, err)
		require.Equal(t, 410, request(router, "POST", "/v1/invitations/accept", outsiderToken, map[string]string{"token": expired.Token}).Code)
		renewed := invite(t, outsiderEmail, "member", ownerToken)
		require.NotEqual(t, expired.ID, renewed.ID)
		for _, role := range []string{"owner", "super_admin", "unknown"} {
			require.Equal(t, 400, request(router, "POST", path+"/invitations", ownerToken, map[string]string{"email": "valid@example.test", "role": role}).Code)
		}
		require.Equal(t, 400, request(router, "POST", path+"/invitations", ownerToken, map[string]string{"email": "invalid", "role": "member"}).Code)
		require.Equal(t, 410, request(router, "POST", "/v1/invitations/accept", outsiderToken, map[string]string{"token": "wrong"}).Code)
	})
	t.Run("demotion and removal immediately revoke keys and pending invitations", func(t *testing.T) {
		w := request(router, "POST", path+"/api-keys", adminToken, map[string]string{"name": "Admin source"})
		require.Equal(t, 201, w.Code, w.Body.String())
		key := data[keyApp.CreatedKey](t, w)
		pending := invite(t, "pending@example.test", "admin", adminToken)
		require.Equal(t, 204, request(router, "PATCH", path+"/members/"+admin.String(), ownerToken, map[string]string{"role": "viewer"}).Code)
		require.Equal(t, 403, request(router, "POST", path+"/api-keys", adminToken, map[string]string{"name": "bad"}).Code)
		require.Equal(t, 401, request(router, "POST", "/v1/logs", key.Secret, map[string]string{"level": "info"}).Code)
		var revoked bool
		require.NoError(t, pool.QueryRow(ctx, `SELECT revoked_at IS NOT NULL FROM project_invitations WHERE id=$1`, pending.ID).Scan(&revoked))
		require.True(t, revoked)
		// Replaying a consumed invite must never restore the old Admin role.
		accept(t, adminInvite, adminToken)
		v := data[teamApp.Team](t, request(router, "GET", path+"/team", adminToken, nil))
		require.Equal(t, projectDomain.RoleViewer, v.Role)
		require.Equal(t, 204, request(router, "DELETE", path+"/members/"+member.String(), ownerToken, nil).Code)
		require.Equal(t, 404, request(router, "GET", path, memberToken, nil).Code)
		require.Equal(t, 404, request(router, "POST", "/v1/logs/search", memberToken, map[string]string{"project_id": p.ID.String()}).Code)
		require.Equal(t, 410, request(router, "POST", "/v1/invitations/accept", memberToken, map[string]string{"token": memberInvite.Token}).Code)
		require.Equal(t, 204, request(router, "DELETE", path+"/members/"+viewer.String(), viewerToken, nil).Code)
		require.Equal(t, 404, request(router, "GET", path+"/team", viewerToken, nil).Code)
	})
	t.Run("concurrent invitation creation and acceptance remain single use", func(t *testing.T) {
		joinedUser, email, token := newUser()
		const attempts = 6
		responses := make(chan *httptest.ResponseRecorder, attempts)
		for n := 0; n < attempts; n++ {
			go func() {
				responses <- request(router, "POST", path+"/invitations", ownerToken, map[string]string{"email": email, "role": "member"})
			}()
		}
		var created teamApp.CreatedInvitation
		createdCount := 0
		for n := 0; n < attempts; n++ {
			w := <-responses
			if w.Code == 201 {
				created = data[teamApp.CreatedInvitation](t, w)
				createdCount++
			} else {
				require.Equal(t, 409, w.Code, w.Body.String())
			}
		}
		require.Equal(t, 1, createdCount)
		for n := 0; n < attempts; n++ {
			go func() {
				responses <- request(router, "POST", "/v1/invitations/accept", token, map[string]string{"token": created.Token})
			}()
		}
		for n := 0; n < attempts; n++ {
			w := <-responses
			require.Equal(t, 200, w.Code, w.Body.String())
		}
		var count int
		require.NoError(t, pool.QueryRow(ctx, `SELECT count(*) FROM project_team_members WHERE project_id=$1 AND user_id=$2`, p.ID, joinedUser).Scan(&count))
		require.Equal(t, 1, count)
	})
	t.Run("failed acceptance rolls back membership and leaves the link usable", func(t *testing.T) {
		failedUser, email, token := newUser()
		i := invite(t, email, "member", ownerToken)
		_, err := pool.Exec(ctx, `CREATE FUNCTION fail_team_accept() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test acceptance failure'; END $$;
		 CREATE TRIGGER fail_team_accept BEFORE UPDATE ON project_invitations FOR EACH ROW EXECUTE FUNCTION fail_team_accept();`)
		require.NoError(t, err)
		w := request(router, "POST", "/v1/invitations/accept", token, map[string]string{"token": i.Token})
		require.Equal(t, 500, w.Code, w.Body.String())
		var count int
		var accepted bool
		require.NoError(t, pool.QueryRow(ctx, `SELECT count(*) FROM project_team_members WHERE project_id=$1 AND user_id=$2`, p.ID, failedUser).Scan(&count))
		require.Zero(t, count)
		require.NoError(t, pool.QueryRow(ctx, `SELECT accepted_at IS NOT NULL FROM project_invitations WHERE id=$1`, i.ID).Scan(&accepted))
		require.False(t, accepted)
		_, err = pool.Exec(ctx, `DROP TRIGGER fail_team_accept ON project_invitations; DROP FUNCTION fail_team_accept();`)
		require.NoError(t, err)
		accept(t, i, token)
	})
	t.Run("authentication and deletion are enforced", func(t *testing.T) {
		require.Equal(t, 401, request(router, "GET", path+"/team", "", nil).Code)
		require.Equal(t, 401, request(router, "POST", "/v1/invitations/accept", "", map[string]string{"token": adminInvite.Token}).Code)
		require.Equal(t, 204, request(router, "DELETE", path, ownerToken, nil).Code)
		require.Equal(t, 404, request(router, "GET", path, adminToken, nil).Code)
		require.Equal(t, 410, request(router, "POST", "/v1/invitations/accept", adminToken, map[string]string{"token": adminInvite.Token}).Code)
		var members, invites int
		require.NoError(t, pool.QueryRow(ctx, `SELECT (SELECT count(*) FROM project_team_members WHERE project_id=$1),(SELECT count(*) FROM project_invitations WHERE project_id=$1)`, p.ID).Scan(&members, &invites))
		require.Zero(t, members)
		require.Zero(t, invites)
	})
}

type captureProducer struct {
	mu   sync.Mutex
	logs []ingestDomain.Log
}

func (p *captureProducer) Produce(_ context.Context, l ingestDomain.Log) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.logs = append(p.logs, l)
	return nil
}
func (p *captureProducer) last() ingestDomain.Log {
	p.mu.Lock()
	defer p.mu.Unlock()
	return p.logs[len(p.logs)-1]
}

type captureSearch struct {
	mu      sync.Mutex
	queries []searchDomain.Query
	entry   searchDomain.LogEntry
}

func (s *captureSearch) Search(_ context.Context, q searchDomain.Query) (*searchDomain.SearchResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.queries = append(s.queries, q)
	return &searchDomain.SearchResult{Logs: []searchDomain.LogEntry{s.entry}, Total: 1}, nil
}
func (s *captureSearch) GetByID(_ context.Context, tenant, id string) (*searchDomain.LogEntry, error) {
	if tenant != s.entry.TenantID || id != s.entry.LogID {
		return nil, searchDomain.ErrLogNotFound
	}
	return &s.entry, nil
}
func (s *captureSearch) Aggregate(_ context.Context, q searchDomain.AggregationRequest) (*searchDomain.AggregationResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.queries = append(s.queries, q.Query)
	return &searchDomain.AggregationResult{}, nil
}
func (s *captureSearch) lastQuery() searchDomain.Query {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.queries[len(s.queries)-1]
}
func (s *captureSearch) calls() int { s.mu.Lock(); defer s.mu.Unlock(); return len(s.queries) }

func teamDatabase(t *testing.T) *pgxpool.Pool {
	t.Helper()
	dsn := os.Getenv("LOGIFY_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set LOGIFY_TEST_DATABASE_URL to PostgreSQL 18 with pgvector and CREATE DATABASE permission")
	}
	ctx := context.Background()
	admin, err := pgx.Connect(ctx, dsn)
	require.NoError(t, err)
	name := "logify_team_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
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
