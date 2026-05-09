package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds all configuration for the application.
type Config struct {
	Server        ServerConfig
	Database      DatabaseConfig
	Redis         RedisConfig
	Elasticsearch ElasticsearchConfig
	ClickHouse    ClickHouseConfig
	Kafka         KafkaConfig
	JWT           JWTConfig
	Logger        LoggerConfig
}

// ServerConfig holds HTTP server settings.
type ServerConfig struct {
	Host         string
	Port         int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

// DatabaseConfig holds PostgreSQL connection settings.
type DatabaseConfig struct {
	Host         string
	Port         int
	User         string
	Password     string
	DBName       string
	SSLMode      string
	MaxOpenConns int
	MaxIdleConns int
	MaxLifetime  time.Duration
}

// DSN returns the PostgreSQL connection string.
func (c DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

// RedisConfig holds Redis connection settings.
type RedisConfig struct {
	Host     string
	Port     int
	Password string
	DB       int
}

// Addr returns the Redis address string.
func (c RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

// ElasticsearchConfig holds Elasticsearch connection settings.
type ElasticsearchConfig struct {
	Addresses []string
	Username  string
	Password  string
}

// ClickHouseConfig holds ClickHouse connection settings.
type ClickHouseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

// DSN returns the ClickHouse connection string.
func (c ClickHouseConfig) DSN() string {
	return fmt.Sprintf("clickhouse://%s:%d/%s?username=%s&password=%s",
		c.Host, c.Port, c.DBName, c.User, c.Password,
	)
}

// KafkaConfig holds Kafka connection settings.
type KafkaConfig struct {
	Brokers []string
	GroupID string
}

// JWTConfig holds JWT authentication settings.
type JWTConfig struct {
	Secret          string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
	Issuer          string
}

// LoggerConfig holds logging settings.
type LoggerConfig struct {
	Level  string
	Format string // "json" or "console"
}

// Load reads configuration from environment variables with sensible defaults.
func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Host:         getEnv("SERVER_HOST", "0.0.0.0"),
			Port:         getEnvAsInt("SERVER_PORT", 8081),
			ReadTimeout:  time.Duration(getEnvAsInt("SERVER_READ_TIMEOUT", 15)) * time.Second,
			WriteTimeout: time.Duration(getEnvAsInt("SERVER_WRITE_TIMEOUT", 15)) * time.Second,
			IdleTimeout:  time.Duration(getEnvAsInt("SERVER_IDLE_TIMEOUT", 60)) * time.Second,
		},
		Database: DatabaseConfig{
			Host:         getEnv("DB_HOST", "localhost"),
			Port:         getEnvAsInt("DB_PORT", 5432),
			User:         getEnv("DB_USER", "postgres"),
			Password:     getEnv("DB_PASSWORD", "postgres"),
			DBName:       getEnv("DB_NAME", "logify"),
			SSLMode:      getEnv("DB_SSL_MODE", "disable"),
			MaxOpenConns: getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns: getEnvAsInt("DB_MAX_IDLE_CONNS", 10),
			MaxLifetime:  time.Duration(getEnvAsInt("DB_MAX_LIFETIME", 300)) * time.Second,
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnvAsInt("REDIS_PORT", 6379),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		Elasticsearch: ElasticsearchConfig{
			Addresses: strings.Split(getEnv("ELASTICSEARCH_ADDRESSES", "http://localhost:9200"), ","),
			Username:  getEnv("ELASTICSEARCH_USERNAME", ""),
			Password:  getEnv("ELASTICSEARCH_PASSWORD", ""),
		},
		ClickHouse: ClickHouseConfig{
			Host:     getEnv("CLICKHOUSE_HOST", "localhost"),
			Port:     getEnvAsInt("CLICKHOUSE_PORT", 9000),
			User:     getEnv("CLICKHOUSE_USER", "default"),
			Password: getEnv("CLICKHOUSE_PASSWORD", ""),
			DBName:   getEnv("CLICKHOUSE_DB", "logify"),
		},
		Kafka: KafkaConfig{
			Brokers: strings.Split(getEnv("KAFKA_BROKERS", "localhost:9092"), ","),
			GroupID: getEnv("KAFKA_GROUP_ID", "logify-backend"),
		},
		JWT: JWTConfig{
			Secret:          getEnv("JWT_SECRET", "change-me-in-production"),
			AccessTokenTTL:  time.Duration(getEnvAsInt("JWT_ACCESS_TOKEN_TTL", 15)) * time.Minute,
			RefreshTokenTTL: time.Duration(getEnvAsInt("JWT_REFRESH_TOKEN_TTL", 168)) * time.Hour,
			Issuer:          getEnv("JWT_ISSUER", "logify"),
		},
		Logger: LoggerConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
	}
}

// getEnv returns the value of an environment variable or a fallback default.
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// getEnvAsInt returns the value of an environment variable as an int or a fallback default.
func getEnvAsInt(key string, fallback int) int {
	strValue := getEnv(key, "")
	if strValue == "" {
		return fallback
	}
	value, err := strconv.Atoi(strValue)
	if err != nil {
		return fallback
	}
	return value
}
