package config

import (
	"fmt"
	"strings"
	"time"

	"github.com/indalyadav56/logify/apps/backend/pkg/postgres"
)

// Well-known connection names used across the app.
const (
	DefaultPostgresConn   = "postgres"
	DefaultClickHouseConn = "clickhouse"
	DefaultMySQLConn      = "mysql"
	DefaultMongoDBConn    = "mongodb"
)

// Database drivers supported in configuration (wiring may exist only for some).
const (
	DriverPostgres   = "postgres"
	DriverMySQL      = "mysql"
	DriverClickHouse = "clickhouse"
	DriverMongoDB    = "mongodb"
)

// DatabasePool groups pool tuning for SQL-style clients.
type DatabasePool struct {
	MaxOpenConns int           `mapstructure:"max_open_conns"`
	MaxIdleConns int           `mapstructure:"max_idle_conns"`
	MaxLifetime  time.Duration `mapstructure:"max_lifetime"`
	MaxIdleTime  time.Duration `mapstructure:"max_idle_time"`
}

// DatabaseSpec is one named logical database (OLTP, analytics, documents, etc.).
type DatabaseSpec struct {
	Driver   string       `mapstructure:"driver"`
	Enabled  *bool        `mapstructure:"enabled"` // nil means true
	DSN      string       `mapstructure:"dsn"`     // clickhouse native, optional postgres/mysql
	URL      string       `mapstructure:"url"`     // libpq / other URL-style strings
	Host     string       `mapstructure:"host"`
	Port     int          `mapstructure:"port"`
	User     string       `mapstructure:"user"`
	Password string       `mapstructure:"password"`
	Database string       `mapstructure:"database"`
	SSLMode  string       `mapstructure:"ssl_mode"`
	URI      string       `mapstructure:"uri"` // e.g. MongoDB connection string
	Pool     DatabasePool `mapstructure:"pool"`
}

func (s *DatabaseSpec) IsEnabled() bool {
	if s.Enabled == nil {
		return true
	}
	return *s.Enabled
}

func (c *Config) databaseSpec(name string) (DatabaseSpec, error) {
	if c.Databases == nil {
		return DatabaseSpec{}, fmt.Errorf("config: databases: not configured")
	}
	spec, ok := c.Databases[name]
	if !ok {
		return DatabaseSpec{}, fmt.Errorf("config: databases.%s: not defined", name)
	}
	if !spec.IsEnabled() {
		return DatabaseSpec{}, fmt.Errorf("config: databases.%s: disabled", name)
	}
	return spec, nil
}

func normalizeDriver(d string) string {
	return strings.ToLower(strings.TrimSpace(d))
}

// PostgresPoolConfig builds a pgx pool config from a named databases.* entry.
func (c *Config) PostgresPoolConfig(connName string) (postgres.Config, error) {
	if connName == "" {
		connName = DefaultPostgresConn
	}
	spec, err := c.databaseSpec(connName)
	if err != nil {
		// Backward compatibility for configs using postgres.primary.
		return c.postgresPoolConfigFromLegacy(connName)
	}
	if d := normalizeDriver(spec.Driver); d != "" && d != DriverPostgres {
		return postgres.Config{}, fmt.Errorf("config: databases.%s: driver %q is not postgres", connName, spec.Driver)
	}

	connStr := strings.TrimSpace(spec.URL)
	if connStr == "" {
		connStr = strings.TrimSpace(spec.DSN)
	}

	ssl := spec.SSLMode
	if ssl == "" {
		ssl = "disable"
	}
	port := spec.Port
	if port == 0 && connStr == "" {
		port = 5432
	}

	p := spec.Pool
	maxOpen := int32(p.MaxOpenConns)
	if maxOpen == 0 {
		maxOpen = 25
	}
	maxIdle := int32(p.MaxIdleConns)
	if maxIdle == 0 {
		maxIdle = 5
	}
	maxLife := p.MaxLifetime
	if maxLife == 0 {
		maxLife = 5 * time.Minute
	}
	maxIdleTime := p.MaxIdleTime
	if maxIdleTime == 0 {
		maxIdleTime = time.Minute
	}

	cfg := postgres.Config{
		ConnString:   connStr,
		Host:         spec.Host,
		Port:         port,
		User:         spec.User,
		Password:     spec.Password,
		Database:     spec.Database,
		SSLMode:      ssl,
		MaxOpenConns: maxOpen,
		MaxIdleConns: maxIdle,
		MaxLifetime:  maxLife,
		MaxIdleTime:  maxIdleTime,
	}
	if connStr == "" {
		if spec.Host == "" || spec.Database == "" {
			return postgres.Config{}, fmt.Errorf("config: databases.%s: postgres requires host and database, or url/dsn", connName)
		}
	}
	return cfg, nil
}

func (c *Config) postgresPoolConfigFromLegacy(connName string) (postgres.Config, error) {
	// Legacy yaml shape supports one primary connection.
	if connName != DefaultPostgresConn && connName != "primary" {
		return postgres.Config{}, fmt.Errorf("config: postgres legacy supports only %q or %q connection", DefaultPostgresConn, "primary")
	}

	p := c.Postgres.Primary
	if p.Host == "" || p.Database == "" {
		return postgres.Config{}, fmt.Errorf("config: postgres.primary requires host and database")
	}

	port := p.Port
	if port == 0 {
		port = 5432
	}
	ssl := p.SSLMode
	if ssl == "" {
		ssl = "disable"
	}
	maxOpen := int32(p.MaxOpenConns)
	if maxOpen == 0 {
		maxOpen = 25
	}
	maxIdle := int32(p.MaxIdleConns)
	if maxIdle == 0 {
		maxIdle = 5
	}
	maxLife := p.ConnMaxLifetime
	if maxLife == 0 {
		maxLife = 5 * time.Minute
	}
	maxIdleTime := p.ConnMaxIdleTime
	if maxIdleTime == 0 {
		maxIdleTime = time.Minute
	}

	return postgres.Config{
		Host:         p.Host,
		Port:         port,
		User:         p.User,
		Password:     p.Password,
		Database:     p.Database,
		SSLMode:      ssl,
		MaxOpenConns: maxOpen,
		MaxIdleConns: maxIdle,
		MaxLifetime:  maxLife,
		MaxIdleTime:  maxIdleTime,
	}, nil
}

// ClickHouseNativeDSN returns the DSN for github.com/ClickHouse/clickhouse-go/v2.
func (c *Config) ClickHouseNativeDSN(connName string) (string, error) {
	if connName == "" {
		connName = DefaultClickHouseConn
	}
	spec, err := c.databaseSpec(connName)
	if err != nil {
		return "", err
	}
	if d := normalizeDriver(spec.Driver); d != DriverClickHouse {
		return "", fmt.Errorf("config: databases.%s: driver %q is not clickhouse", connName, spec.Driver)
	}
	dsn := strings.TrimSpace(spec.DSN)
	if dsn == "" {
		dsn = strings.TrimSpace(spec.URL)
	}
	if dsn == "" {
		return "", fmt.Errorf("config: databases.%s: clickhouse requires dsn (or url)", connName)
	}
	return dsn, nil
}

// MySQLSpec returns the spec for a future mysql client (validated driver only).
func (c *Config) MySQLSpec(connName string) (DatabaseSpec, error) {
	if connName == "" {
		connName = DefaultMySQLConn
	}
	spec, err := c.databaseSpec(connName)
	if err != nil {
		return DatabaseSpec{}, err
	}
	if d := normalizeDriver(spec.Driver); d != DriverMySQL {
		return DatabaseSpec{}, fmt.Errorf("config: databases.%s: driver %q is not mysql", connName, spec.Driver)
	}
	return spec, nil
}

// MongoDBSpec returns the spec for a future mongo client (validated driver only).
func (c *Config) MongoDBSpec(connName string) (DatabaseSpec, error) {
	if connName == "" {
		connName = DefaultMongoDBConn
	}
	spec, err := c.databaseSpec(connName)
	if err != nil {
		return DatabaseSpec{}, err
	}
	if d := normalizeDriver(spec.Driver); d != DriverMongoDB {
		return DatabaseSpec{}, fmt.Errorf("config: databases.%s: driver %q is not mongodb", connName, spec.Driver)
	}
	if strings.TrimSpace(spec.URI) == "" && strings.TrimSpace(spec.DSN) == "" {
		return DatabaseSpec{}, fmt.Errorf("config: databases.%s: mongodb requires uri or dsn", connName)
	}
	return spec, nil
}
