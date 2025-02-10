package config

import (
	"fmt"
	"log"

	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	ServerPort string `mapstructure:"SERVER_PORT" validate:"required"`

	// database
	DBHost     string `mapstructure:"DB_HOST" validate:"required"`
	DBPort     string `mapstructure:"DB_PORT"`
	DBUser     string `mapstructure:"DB_USER"`
	DBPassword string `mapstructure:"DB_PASSWORD"`
	DBName     string `mapstructure:"DB_NAME"`

	// redis
	RedisAddr     string `mapstructure:"REDIS_ADDR"`
	RedisUsername string `mapstructure:"REDIS_USERNAME"`
	RedisPassword string `mapstructure:"REDIS_PASSWORD"`
	RedisDB       int    `mapstructure:"REDIS_DB"`

	// jwt
	JWTSecret         string `mapstructure:"JWT_SECRET" validate:"required"`
	JWTExpirationDays int    `mapstructure:"JWT_EXPIRATION_DAYS" validate:"required,gt=0"`

	// log
	LogFilePath string `mapstructure:"LOG_FILE_PATH"`
}

func New(path ...string) (*Config, error) {
	if len(path) == 0 {
		path = []string{".env"}
	}
	cfg := &Config{}
	if err := cfg.load(path[0]); err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}
	return cfg, nil
}

// load reads configuration from file and environment
func (c *Config) load(path string) error {
	if err := c.loadEnv(path); err != nil {
		log.Printf("Warning: error loading .env file: %v", err)
	}

	if err := c.loadViper(path); err != nil {
		return fmt.Errorf("error loading configuration: %w", err)
	}

	if err := c.validate(); err != nil {
		return fmt.Errorf("invalid configuration: %w", err)
	}

	return nil
}

func (c *Config) loadEnv(path string) error {
	return godotenv.Load(path)
}

// loadViper configures and loads configuration using Viper
func (c *Config) loadViper(path string) error {
	v := viper.New()

	c.setDefaults(v)

	v.SetConfigFile(path)
	v.SetConfigType("env")
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		log.Printf("Warning: error reading config file: %v", err)
	}

	if err := v.Unmarshal(c); err != nil {
		return fmt.Errorf("error unmarshaling config: %w", err)
	}

	return nil
}

func (c *Config) setDefaults(v *viper.Viper) {
	v.SetDefault("JWT_EXPIRATION_DAYS", 7)
	v.SetDefault("JWT_SECRET", "test")

	v.SetDefault("SERVER_PORT", "8080")

	// database
	v.SetDefault("DB_HOST", "localhost")
	v.SetDefault("DB_PORT", "5432")
	v.SetDefault("DB_USER", "postgres")
	v.SetDefault("DB_PASSWORD", "postgres")
	v.SetDefault("DB_NAME", "postgres")
}

func (c *Config) validate() error {
	validate := validator.New()
	if err := validate.Struct(c); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}
	return nil
}
