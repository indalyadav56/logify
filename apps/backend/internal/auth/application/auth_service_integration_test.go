//go:build integration

package application_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strings"
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

	authApp "github.com/indalyadav56/logify/apps/backend/internal/auth/application"
	authDomain "github.com/indalyadav56/logify/apps/backend/internal/auth/domain"
	authPG "github.com/indalyadav56/logify/apps/backend/internal/auth/infrastructure/postgres"
	authHTTP "github.com/indalyadav56/logify/apps/backend/internal/auth/transport/http"
	projectApp "github.com/indalyadav56/logify/apps/backend/internal/project/application"
	projectDomain "github.com/indalyadav56/logify/apps/backend/internal/project/domain"
	projectPG "github.com/indalyadav56/logify/apps/backend/internal/project/infrastructure/postgres"
	projectHTTP "github.com/indalyadav56/logify/apps/backend/internal/project/transport/http"
	"github.com/indalyadav56/logify/apps/backend/internal/server/http/middleware"
	userApp "github.com/indalyadav56/logify/apps/backend/internal/user/application"
	userPG "github.com/indalyadav56/logify/apps/backend/internal/user/infrastructure/postgres"
	"github.com/indalyadav56/logify/apps/backend/pkg/jwt"
	pg "github.com/indalyadav56/logify/apps/backend/pkg/postgres"
)

func TestRegistrationIntegration(t *testing.T) {
	pool := registrationDatabase(t)
	logger := zap.NewNop()
	tokens := jwt.New(jwt.JWTConfig{SecretKey: []byte("registration-integration-test"), TokenDuration: time.Hour})
	users := userApp.NewUserService(userPG.NewUserRepository(pool), logger)
	projects := projectPG.NewProjectRepository(pool)
	auth := authApp.NewAuthService(logger, tokens,
		authPG.NewRefreshTokenRepository(pool), authPG.NewSessionRepository(pool),
		users, projects, pg.NewTransactor(pool))

	gin.SetMode(gin.TestMode)
	router := gin.New()
	authHTTP.RegisterRoutes(&router.RouterGroup, authHTTP.NewAuthHandler(auth))
	secured := router.Group("", middleware.AuthMiddleware(tokens))
	projectHTTP.RegisterRoutes(secured, projectHTTP.NewProjectHandler(projectApp.NewProjectService(projects, logger)))

	const password = "Registration-test-42!"
	registration := func(email string) *httptest.ResponseRecorder {
		return registrationRequest(router, http.MethodPost, "/v1/auth/register", "", map[string]string{
			"full_name": "Signup Test", "email": email, "password": password,
		})
	}
	decodeTokens := func(t *testing.T, response *httptest.ResponseRecorder) authApp.TokenOutput {
		t.Helper()
		var envelope struct{ Data authApp.TokenOutput }
		require.NoError(t, json.Unmarshal(response.Body.Bytes(), &envelope))
		require.NotEmpty(t, envelope.Data.AccessToken)
		require.NotEmpty(t, envelope.Data.RefreshToken)
		return envelope.Data
	}
	listProjects := func(t *testing.T, accessToken string) []*projectApp.ProjectOutput {
		t.Helper()
		response := registrationRequest(router, http.MethodGet, "/v1/projects", accessToken, nil)
		require.Equal(t, http.StatusOK, response.Code, response.Body.String())
		var envelope struct{ Data []*projectApp.ProjectOutput }
		require.NoError(t, json.Unmarshal(response.Body.Bytes(), &envelope))
		return envelope.Data
	}

	t.Run("signup immediately exposes an owned default project", func(t *testing.T) {
		response := registration("first@example.test")
		require.Equal(t, http.StatusCreated, response.Code, response.Body.String())
		issued := decodeTokens(t, response)
		items := listProjects(t, issued.AccessToken)
		require.Len(t, items, 1)
		project := items[0]
		require.Equal(t, projectDomain.DefaultProjectName, project.Name)
		require.NotEqual(t, uuid.Nil, project.ID)

		token, err := tokens.ValidateToken(issued.AccessToken)
		require.NoError(t, err)
		claims, err := tokens.GetClaims(token)
		require.NoError(t, err)
		require.Equal(t, claims["sub"], project.TenantID.String())
		require.Equal(t, claims["tenant_id"], project.TenantID.String())
		var owner uuid.UUID
		require.NoError(t, pool.QueryRow(context.Background(), "SELECT created_by FROM projects WHERE id = $1", project.ID).Scan(&owner))
		require.Equal(t, project.TenantID, owner)

		var storedToken string
		var sessionID, sessionUser uuid.UUID
		require.NoError(t, pool.QueryRow(context.Background(), `
			SELECT rt.token, s.id, s.user_id FROM auth.refresh_tokens rt
			JOIN auth.sessions s ON s.id = rt.session_id WHERE rt.user_id = $1`, owner).
			Scan(&storedToken, &sessionID, &sessionUser))
		require.Equal(t, authDomain.HashRefreshToken(issued.RefreshToken), storedToken)
		require.NotEqual(t, uuid.Nil, sessionID)
		require.Equal(t, owner, sessionUser)

		before := registrationCounts(t, pool)
		duplicate := registration("first@example.test")
		require.Equal(t, http.StatusConflict, duplicate.Code)
		require.Equal(t, before, registrationCounts(t, pool), "duplicate signup must not create any rows")

		for range 2 {
			login := registrationRequest(router, http.MethodPost, "/v1/auth/login", "", map[string]string{
				"email": "first@example.test", "password": password,
			})
			require.Equal(t, http.StatusOK, login.Code, login.Body.String())
			listed := listProjects(t, decodeTokens(t, login).AccessToken)
			require.Len(t, listed, 1)
			require.Equal(t, project.ID, listed[0].ID, "signing in must preserve the existing project")
		}
		require.Equal(t, before, registrationCounts(t, pool))
	})

	t.Run("each account gets its own default project", func(t *testing.T) {
		firstLogin := registrationRequest(router, http.MethodPost, "/v1/auth/login", "", map[string]string{
			"email": "first@example.test", "password": password,
		})
		require.Equal(t, http.StatusOK, firstLogin.Code)
		first := listProjects(t, decodeTokens(t, firstLogin).AccessToken)
		secondResponse := registration("second@example.test")
		require.Equal(t, http.StatusCreated, secondResponse.Code)
		second := listProjects(t, decodeTokens(t, secondResponse).AccessToken)
		require.Len(t, second, 1)
		require.Equal(t, projectDomain.DefaultProjectName, second[0].Name)
		require.NotEqual(t, first[0].ID, second[0].ID)
		require.NotEqual(t, first[0].TenantID, second[0].TenantID)
	})

	t.Run("concurrent retries create only one account and project", func(t *testing.T) {
		before := registrationCounts(t, pool)
		responses := make(chan *httptest.ResponseRecorder, 5)
		start := make(chan struct{})
		for range 5 {
			go func() {
				<-start
				responses <- registration("concurrent@example.test")
			}()
		}
		close(start)
		created, conflicts := 0, 0
		for range 5 {
			response := <-responses
			switch response.Code {
			case http.StatusCreated:
				created++
				require.Len(t, listProjects(t, decodeTokens(t, response).AccessToken), 1)
			case http.StatusConflict:
				conflicts++
			default:
				t.Fatalf("unexpected signup status %d: %s", response.Code, response.Body.String())
			}
		}
		require.Equal(t, 1, created)
		require.Equal(t, 4, conflicts)
		after := registrationCounts(t, pool)
		for i := range before {
			require.Equal(t, before[i]+1, after[i])
		}
	})

	for _, table := range []string{"projects", "auth.sessions", "auth.refresh_tokens"} {
		t.Run("failure in "+table+" rolls back signup and permits retry", func(t *testing.T) {
			ctx := context.Background()
			_, err := pool.Exec(ctx, `CREATE OR REPLACE FUNCTION public.reject_registration_write()
				RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected signup failure'; END $$`)
			require.NoError(t, err)
			_, err = pool.Exec(ctx, "CREATE TRIGGER reject_registration BEFORE INSERT ON "+table+
				" FOR EACH ROW EXECUTE FUNCTION public.reject_registration_write()")
			require.NoError(t, err)
			before := registrationCounts(t, pool)
			email := strings.ReplaceAll(table, ".", "-") + "@example.test"
			failed := registration(email)
			require.Equal(t, http.StatusInternalServerError, failed.Code)
			require.Equal(t, before, registrationCounts(t, pool), "all registration writes must roll back")
			_, err = pool.Exec(ctx, "DROP TRIGGER reject_registration ON "+table)
			require.NoError(t, err)
			retry := registration(email)
			require.Equal(t, http.StatusCreated, retry.Code, retry.Body.String())
			require.Len(t, listProjects(t, decodeTokens(t, retry).AccessToken), 1)
		})
	}

	t.Run("invalid signup never provisions a project", func(t *testing.T) {
		before := registrationCounts(t, pool)
		response := registrationRequest(router, http.MethodPost, "/v1/auth/register", "", map[string]string{
			"full_name": "Test", "email": "invalid", "password": "short",
		})
		require.Equal(t, http.StatusBadRequest, response.Code)
		require.Equal(t, before, registrationCounts(t, pool))
	})
}

func registrationRequest(router http.Handler, method, path, accessToken string, body any) *httptest.ResponseRecorder {
	payload, _ := json.Marshal(body)
	request := httptest.NewRequest(method, path, bytes.NewReader(payload))
	request.Header.Set("Content-Type", "application/json")
	if accessToken != "" {
		request.Header.Set("Authorization", "Bearer "+accessToken)
	}
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	return response
}

func registrationCounts(t *testing.T, pool *pgxpool.Pool) [4]int {
	t.Helper()
	var counts [4]int
	err := pool.QueryRow(context.Background(), `SELECT
		(SELECT COUNT(*) FROM auth.users), (SELECT COUNT(*) FROM projects),
		(SELECT COUNT(*) FROM auth.sessions), (SELECT COUNT(*) FROM auth.refresh_tokens)`).
		Scan(&counts[0], &counts[1], &counts[2], &counts[3])
	require.NoError(t, err)
	return counts
}

// Only the temporary database created here is migrated or modified. The supplied
// DSN is an administrative connection; its existing application data is untouched.
func registrationDatabase(t *testing.T) *pgxpool.Pool {
	t.Helper()
	dsn := os.Getenv("LOGIFY_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set LOGIFY_TEST_DATABASE_URL to a Postgres 18 instance with pgvector and CREATE DATABASE permission")
	}
	ctx := context.Background()
	admin, err := pgx.Connect(ctx, dsn)
	require.NoError(t, err)
	name := "logify_registration_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	_, err = admin.Exec(ctx, "CREATE DATABASE "+pgx.Identifier{name}.Sanitize())
	if err != nil {
		_ = admin.Close(ctx)
		t.Fatalf("create test database: %v", err)
	}
	var pool *pgxpool.Pool
	t.Cleanup(func() {
		if pool != nil {
			pool.Close()
		}
		_, err := admin.Exec(ctx, "DROP DATABASE "+pgx.Identifier{name}.Sanitize())
		if err != nil {
			t.Errorf("drop isolated test database %s: %v", name, err)
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
	migrationDir := filepath.Join(filepath.Dir(source), "../../../migrations/postgres")
	require.NoError(t, goose.UpContext(ctx, migrationDB, migrationDir), fmt.Sprintf("migrate %s", name))
	return pool
}
