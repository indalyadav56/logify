package config

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server       ServerConfig            `mapstructure:"server"`
	Databases    map[string]DatabaseSpec `mapstructure:"databases"`
	Postgres     PostgresConfig          `mapstructure:"postgres"`
	Logger       LoggerConfig            `mapstructure:"logger"`
	Admin        AdminConfig             `mapstructure:"admin"`
	Notification NotificationConfig      `mapstructure:"notification"`
	Kafka        KafkaConfig             `mapstructure:"kafka"`
	Auth         AuthConfig              `mapstructure:"auth"`
	AppEnv       string                  `mapstructure:"app_env"`
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

type LoggerConfig struct {
	Level string `mapstructure:"level"`
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

	// Load .env file if present
	v.SetConfigFile(".env")
	v.SetConfigType("env")
	if err := v.MergeInConfig(); err != nil {
		// It's fine if .env doesn't exist
		if !os.IsNotExist(err) {
			log.Printf("Info: Could not load .env file: %v", err)
		}
	}

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

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unable to unmarshal config: %w", err)
	}

	cfg.AppEnv = env
	return &cfg, nil
}

// GetDatabaseURL returns the default postgres connection string (pgx/libpq), or empty if misconfigured.
func (c *Config) GetDatabaseURL() string {
	pc, err := c.PostgresPoolConfig(DefaultPostgresConn)
	if err != nil {
		return ""
	}
	return pc.DSN()
}
