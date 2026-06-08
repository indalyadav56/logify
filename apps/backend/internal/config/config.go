package config

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/spf13/viper"

	"github.com/indalyadav56/logify/apps/backend/pkg/logger"
)

type Config struct {
	Server       ServerConfig            `mapstructure:"server"`
	Databases    map[string]DatabaseSpec `mapstructure:"databases"`
	Postgres     PostgresConfig          `mapstructure:"postgres"`
	Logger       logger.Config           `mapstructure:"logger"`
	Admin        AdminConfig             `mapstructure:"admin"`
	Notification NotificationConfig      `mapstructure:"notification"`
	Kafka            KafkaConfig            `mapstructure:"kafka"`
	Auth             AuthConfig             `mapstructure:"auth"`
	Ollama           OllamaConfig           `mapstructure:"ollama"`
	ClickHouseWorker ClickHouseWorkerConfig `mapstructure:"clickhouse_worker"`
	EmbeddingWorker  EmbeddingWorkerConfig  `mapstructure:"embedding_worker"`
	AppEnv           string                 `mapstructure:"app_env"`
}

// ClickHouseWorkerConfig configures the Kafka → ClickHouse log ingestion worker.
type ClickHouseWorkerConfig struct {
	KafkaTopic   string `mapstructure:"kafka_topic"`
	KafkaGroupID string `mapstructure:"kafka_group_id"`
}

// OllamaConfig configures the local Ollama embedding API.
type OllamaConfig struct {
	BaseURL string        `mapstructure:"base_url"`
	Model   string        `mapstructure:"model"`
	Timeout time.Duration `mapstructure:"timeout"`
}

// EmbeddingWorkerConfig configures the Kafka log-embedding consumer.
type EmbeddingWorkerConfig struct {
	KafkaTopic   string `mapstructure:"kafka_topic"`
	KafkaGroupID string `mapstructure:"kafka_group_id"`
}

type AuthConfig struct {
	JWT JWTConfig `mapstructure:"jwt"`
}

type JWTConfig struct {
	Secret          string        `mapstructure:"secret"`
	Issuer          string        `mapstructure:"issuer"`
	AccessTokenTTL  time.Duration `mapstructure:"access_token_ttl"`
	RefreshTokenTTL time.Duration `mapstructure:"refresh_token_ttl"`
}

type AdminConfig struct {
	Email    string `mapstructure:"email"`
	Password string `mapstructure:"password"`
}

type ServerConfig struct {
	Port         string        `mapstructure:"port"`
	ReadTimeout  time.Duration `mapstructure:"read_timeout"`
	WriteTimeout time.Duration `mapstructure:"write_timeout"`
	IdleTimeout  time.Duration `mapstructure:"idle_timeout"`
}

type NotificationConfig struct {
	EmailProvider string     `mapstructure:"email_provider"`
	SMTP          SMTPConfig `mapstructure:"smtp"`
}

type SMTPConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	From     string `mapstructure:"from"`
}

type KafkaConfig struct {
	Brokers []string `mapstructure:"brokers"`
}

type PostgresConfig struct {
	Primary PostgresConnConfig `mapstructure:"primary"`
}

type PostgresConnConfig struct {
	Host            string        `mapstructure:"host"`
	Port            int           `mapstructure:"port"`
	User            string        `mapstructure:"user"`
	Password        string        `mapstructure:"password"`
	Database        string        `mapstructure:"database"`
	SSLMode         string        `mapstructure:"ssl_mode"`
	MaxOpenConns    int           `mapstructure:"max_open_conns"`
	MaxIdleConns    int           `mapstructure:"max_idle_conns"`
	ConnMaxLifetime time.Duration `mapstructure:"conn_max_lifetime"`
	ConnMaxIdleTime time.Duration `mapstructure:"conn_max_idle_time"`
}

// Load initializes the configuration based on the environment.
func Load() (*Config, error) {
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "dev"
	}

	v := viper.New()
	v.SetConfigType("yaml")
	v.AddConfigPath("configs")
	v.AddConfigPath(".") // Look in current directory as well

	// Shared defaults (server tuning, legacy postgres block, kafka defaults, etc.)
	v.SetConfigName("base")
	if err := v.MergeInConfig(); err != nil {
		log.Printf("Info: Could not load base config: %v", err)
	}

	// Environment overlay (local, dev, stage, prod)
	v.SetConfigName(env)
	if err := v.MergeInConfig(); err != nil {
		log.Printf("Info: Could not load %s config: %v", env, err)
	}

	// Load .env (if present) into the process environment so the bindings below
	// can read it. Real environment variables take precedence over the file.
	loadDotEnv(".env")

	// 4. Override with environment variables
	v.SetEnvPrefix("APP") // e.g. APP_SERVER_PORT
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// AutomaticEnv doesn't apply during Unmarshal without explicit BindEnv.
	// Iterate all known keys (populated from config files above) and bind each one.
	for _, key := range v.AllKeys() {
		envKey := "APP_" + strings.ToUpper(strings.ReplaceAll(key, ".", "_"))
		v.BindEnv(key, envKey)
	}

	// Convenience aliases: let a conventional flat .env configure the primary
	// Postgres connection without the APP_POSTGRES_PRIMARY_ prefix. The APP_*
	// name is listed first so it wins if both happen to be set.
	v.BindEnv("postgres.primary.host", "APP_POSTGRES_PRIMARY_HOST", "POSTGRES_HOST")
	v.BindEnv("postgres.primary.port", "APP_POSTGRES_PRIMARY_PORT", "POSTGRES_PORT")
	v.BindEnv("postgres.primary.user", "APP_POSTGRES_PRIMARY_USER", "POSTGRES_USER", "POSTGRES_USERNAME")
	v.BindEnv("postgres.primary.password", "APP_POSTGRES_PRIMARY_PASSWORD", "POSTGRES_PASSWORD")
	v.BindEnv("postgres.primary.database", "APP_POSTGRES_PRIMARY_DATABASE", "POSTGRES_DATABASE", "POSTGRES_DB")
	v.BindEnv("postgres.primary.ssl_mode", "APP_POSTGRES_PRIMARY_SSL_MODE", "POSTGRES_SSL_MODE", "POSTGRES_SSLMODE")

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unable to unmarshal config: %w", err)
	}

	cfg.AppEnv = env
	return &cfg, nil
}

// loadDotEnv reads KEY=VALUE pairs from a .env file (if present) into the process
// environment. Existing environment variables are left untouched, so real env vars
// always take precedence over the file. Blank lines and # comments are skipped, an
// optional leading "export " and surrounding single/double quotes are stripped.
func loadDotEnv(path string) {
	f, err := os.Open(path)
	if err != nil {
		return // a missing .env is fine
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		line = strings.TrimPrefix(line, "export ")

		key, val, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		if key == "" {
			continue
		}
		val = strings.TrimSpace(val)
		if len(val) >= 2 {
			if c := val[0]; (c == '"' || c == '\'') && val[len(val)-1] == c {
				val = val[1 : len(val)-1]
			}
		}
		if _, exists := os.LookupEnv(key); !exists {
			os.Setenv(key, val)
		}
	}
}

// GetDatabaseURL returns the default postgres connection string (pgx/libpq), or empty if misconfigured.
func (c *Config) GetDatabaseURL() string {
	pc, err := c.PostgresPoolConfig(DefaultPostgresConn)
	if err != nil {
		return ""
	}
	return pc.DSN()
}
