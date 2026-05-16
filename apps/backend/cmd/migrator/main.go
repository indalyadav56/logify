// Migrator is a small migration CLI built on goose.
//
// Supports both PostgreSQL (default) and ClickHouse via the -driver flag.
//
// Usage:
//
//	go run ./cmd/migrator [flags] <command> [args]
//
// Commands:
//
//	up                    Apply all pending migrations
//	up-by-one             Apply the next pending migration
//	up-to <version>       Migrate up to (and including) the given version
//	down                  Roll back the last migration
//	down-to <version>     Roll back to the given version
//	redo                  Roll back the last migration, then re-apply it
//	reset                 Roll back ALL migrations
//	status                Print migration status
//	version               Print the current database version
//	create <name> [type]  Create a new migration file (type: sql | go, default: sql)
//
// Flags:
//
//	-driver  postgres | clickhouse (default "postgres")
//	-dir     path to the migrations directory
//	         (default ./migrations/postgres or ./migrations/clickhouse per -driver)
//	-dsn     override DSN; takes precedence over env / config
//	-env     APP_ENV to load (default "local")
//
// DSN resolution order:
//  1. -dsn flag
//  2. APP_DATABASE_URL env var (applies regardless of -driver)
//  3. configs/<env>.yaml — Postgres via PostgresPoolConfig,
//     ClickHouse via databases.clickhouse (Config.ClickHouseNativeDSN).
package main

import (
	"context"
	"database/sql"
	"errors"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	// SQL drivers registered via blank import.
	_ "github.com/ClickHouse/clickhouse-go/v2"
	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/pressly/goose/v3"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
)

const (
	defaultEnv = "local"

	driverPostgres   = "postgres"
	driverClickHouse = "clickhouse"

	defaultDirPostgres   = "./migrations/postgres"
	defaultDirClickHouse = "./migrations/clickhouse"
)

// driverProfile describes the per-driver wiring the migrator needs to plug
// into goose and database/sql.
type driverProfile struct {
	// name is the user-facing driver name (matches the -driver flag value).
	name string
	// sqlDriver is the database/sql driver name to pass to sql.Open.
	sqlDriver string
	// gooseDialect is the dialect string for goose.SetDialect.
	gooseDialect string
	// defaultDir is the migrations directory used when -dir is empty.
	defaultDir string
}

func profileFor(driver string) (driverProfile, error) {
	switch strings.ToLower(strings.TrimSpace(driver)) {
	case driverPostgres, "pg":
		return driverProfile{
			name:         driverPostgres,
			sqlDriver:    "pgx",
			gooseDialect: "postgres",
			defaultDir:   defaultDirPostgres,
		}, nil
	case driverClickHouse, "ch":
		return driverProfile{
			name:         driverClickHouse,
			sqlDriver:    "clickhouse",
			gooseDialect: "clickhouse",
			defaultDir:   defaultDirClickHouse,
		}, nil
	default:
		return driverProfile{}, fmt.Errorf("unknown -driver %q (want %q or %q)", driver, driverPostgres, driverClickHouse)
	}
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "migrator: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	fs := flag.NewFlagSet("migrator", flag.ContinueOnError)
	driverFlag := fs.String("driver", driverPostgres, "database driver: postgres | clickhouse")
	dir := fs.String("dir", "", "migrations directory (defaults to ./migrations/<driver>)")
	dsnFlag := fs.String("dsn", "", "DSN (overrides env / config)")
	envFlag := fs.String("env", defaultEnv, "APP_ENV used to load configs/<env>.yaml")
	fs.Usage = func() { printUsage(fs) }

	if err := fs.Parse(os.Args[1:]); err != nil {
		return err
	}
	args := fs.Args()
	if len(args) == 0 {
		fs.Usage()
		return errors.New("missing command")
	}
	cmd, args := args[0], args[1:]

	profile, err := profileFor(*driverFlag)
	if err != nil {
		return err
	}
	if strings.TrimSpace(*dir) == "" {
		*dir = profile.defaultDir
	}

	// `create` doesn't need a DB connection.
	if cmd == "create" {
		return runCreate(*dir, args)
	}

	dsn, err := resolveDSN(profile, *dsnFlag, *envFlag)
	if err != nil {
		return err
	}

	db, err := sql.Open(profile.sqlDriver, dsn)
	if err != nil {
		return fmt.Errorf("open %s db: %w", profile.name, err)
	}
	defer db.Close()

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	pingCtx, pingCancel := context.WithTimeout(ctx, 5*time.Second)
	defer pingCancel()
	if err := db.PingContext(pingCtx); err != nil {
		return fmt.Errorf("ping %s db: %w", profile.name, err)
	}

	if err := goose.SetDialect(profile.gooseDialect); err != nil {
		return fmt.Errorf("set dialect %q: %w", profile.gooseDialect, err)
	}

	return dispatch(ctx, db, *dir, cmd, args)
}

func dispatch(ctx context.Context, db *sql.DB, dir, cmd string, args []string) error {
	switch cmd {
	case "up":
		return goose.UpContext(ctx, db, dir)
	case "up-by-one":
		return goose.UpByOneContext(ctx, db, dir)
	case "up-to":
		v, err := requireVersion(cmd, args)
		if err != nil {
			return err
		}
		return goose.UpToContext(ctx, db, dir, v)
	case "down":
		return goose.DownContext(ctx, db, dir)
	case "down-to":
		v, err := requireVersion(cmd, args)
		if err != nil {
			return err
		}
		return goose.DownToContext(ctx, db, dir, v)
	case "redo":
		return goose.RedoContext(ctx, db, dir)
	case "reset":
		return goose.ResetContext(ctx, db, dir)
	case "status":
		return goose.StatusContext(ctx, db, dir)
	case "version":
		return goose.VersionContext(ctx, db, dir)
	default:
		return fmt.Errorf("unknown command %q (run with -h for usage)", cmd)
	}
}

func runCreate(dir string, args []string) error {
	if len(args) < 1 {
		return errors.New(`usage: migrator create <name> [type]   (type: "sql" | "go", default "sql")`)
	}
	name := args[0]
	migrationType := "sql"
	if len(args) >= 2 {
		migrationType = args[1]
	}
	if migrationType != "sql" && migrationType != "go" {
		return fmt.Errorf("invalid migration type %q (want sql or go)", migrationType)
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return fmt.Errorf("create dir: %w", err)
	}
	return goose.Create(nil, dir, name, migrationType)
}

func requireVersion(cmd string, args []string) (int64, error) {
	if len(args) < 1 {
		return 0, fmt.Errorf("usage: migrator %s <version>", cmd)
	}
	v, err := strconv.ParseInt(args[0], 10, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid version %q: %w", args[0], err)
	}
	return v, nil
}

// resolveDSN follows the precedence: explicit flag → APP_DATABASE_URL env →
// driver-specific config lookup.
func resolveDSN(profile driverProfile, dsnFlag, env string) (string, error) {
	if dsn := strings.TrimSpace(dsnFlag); dsn != "" {
		return dsn, nil
	}
	if dsn := strings.TrimSpace(os.Getenv("APP_DATABASE_URL")); dsn != "" {
		return dsn, nil
	}

	if err := os.Setenv("APP_ENV", env); err != nil {
		return "", fmt.Errorf("set APP_ENV: %w", err)
	}
	cfg, err := config.Load()
	if err != nil {
		return "", fmt.Errorf("load config: %w", err)
	}

	switch profile.name {
	case driverPostgres:
		pcfg, err := cfg.PostgresPoolConfig(config.DefaultPostgresConn)
		if err != nil {
			return "", fmt.Errorf("postgres config: %w", err)
		}
		dsn := pcfg.DSN()
		if dsn == "" {
			return "", errors.New("could not build Postgres DSN from config")
		}
		return dsn, nil
	case driverClickHouse:
		dsn, err := cfg.ClickHouseNativeDSN(config.DefaultClickHouseConn)
		if err != nil {
			return "", fmt.Errorf("clickhouse config: %w", err)
		}
		return dsn, nil
	default:
		return "", fmt.Errorf("no DSN resolver for driver %q", profile.name)
	}
}

func printUsage(fs *flag.FlagSet) {
	fmt.Fprintln(os.Stderr, "usage: migrator [flags] <command> [args]")
	fmt.Fprintln(os.Stderr)
	fmt.Fprintln(os.Stderr, "Commands:")
	for _, line := range []string{
		"  up                    Apply all pending migrations",
		"  up-by-one             Apply the next pending migration",
		"  up-to <version>       Migrate up to the given version",
		"  down                  Roll back the last migration",
		"  down-to <version>     Roll back to the given version",
		"  redo                  Roll back then re-apply the last migration",
		"  reset                 Roll back ALL migrations",
		"  status                Print migration status",
		"  version               Print the current database version",
		"  create <name> [type]  Create a new migration file (type: sql | go)",
	} {
		fmt.Fprintln(os.Stderr, line)
	}
	fmt.Fprintln(os.Stderr)
	fmt.Fprintln(os.Stderr, "Flags:")
	fs.PrintDefaults()
}
