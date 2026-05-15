// Migrator is a small Postgres migration CLI built on goose.
//
// Usage:
//
//	go run ./cmd/migrator <command> [args]
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
//	-dir   path to the migrations directory (default ./migrations/postgres)
//	-dsn   override DSN; takes precedence over env / config
//	-env   APP_ENV to load (default "local")
//
// DSN resolution order:
//  1. -dsn flag
//  2. APP_DATABASE_URL env var
//  3. config (loaded from configs/<env>.yaml) — same as the API server.
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

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"

	"github.com/indalyadav56/logify/apps/backend/internal/config"
)

const (
	defaultDir = "./migrations/postgres"
	defaultEnv = "local"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "migrator: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	fs := flag.NewFlagSet("migrator", flag.ContinueOnError)
	dir := fs.String("dir", defaultDir, "migrations directory")
	dsnFlag := fs.String("dsn", "", "Postgres DSN (overrides env / config)")
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

	// `create` doesn't need a DB connection.
	if cmd == "create" {
		return runCreate(*dir, args)
	}

	dsn, err := resolveDSN(*dsnFlag, *envFlag)
	if err != nil {
		return err
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return fmt.Errorf("open db: %w", err)
	}
	defer db.Close()

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	pingCtx, pingCancel := context.WithTimeout(ctx, 5*time.Second)
	defer pingCancel()
	if err := db.PingContext(pingCtx); err != nil {
		return fmt.Errorf("ping db: %w", err)
	}

	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("set dialect: %w", err)
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

// resolveDSN follows the precedence: explicit flag → APP_DATABASE_URL env → config file.
func resolveDSN(dsnFlag, env string) (string, error) {
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
	pcfg, err := cfg.PostgresPoolConfig(config.DefaultPostgresConn)
	if err != nil {
		return "", fmt.Errorf("postgres config: %w", err)
	}
	dsn := pcfg.DSN()
	if dsn == "" {
		return "", errors.New("could not build Postgres DSN from config")
	}
	return dsn, nil
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
