package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Port string `json:"port" mapstructure:"PORT"`

	DatabaseName     string `mapstructure:"DATABASE_NAME"`
	DatabaseUser     string `mapstructure:"DATABASE_USER"`
	DatabasePassword string `mapstructure:"DATABASE_PASSWORD"`
	DatabaseHost     string `mapstructure:"DATABASE_HOST"`
	DatabasePort     string `mapstructure:"DATABASE_PORT"`

	KafkaBrokers []string

	OpenSearchUrl string `mapstructure:"OPENSEARCH_URL"`

	JwtSecret string `mapstructure:"JWT_SECRET"`
}

func InitConfig() (*Config, error) {
	v := viper.New()

	v.SetConfigFile(".env")
	v.SetConfigType("env")

	fmt.Printf("reading from system environment variables \n")
	v.AutomaticEnv()

	v.BindEnv("DATABASE_NAME")
	v.BindEnv("DATABASE_USER")
	v.BindEnv("DATABASE_PASSWORD")
	v.BindEnv("DATABASE_HOST")
	v.BindEnv("DATABASE_PORT")
	v.BindEnv("OPENSEARCH_URL")
	v.BindEnv("JWT_SECRET")

	if err := v.ReadInConfig(); err != nil {
		fmt.Println("Error reading .env file:", err)
	}

	v.SetDefault("PORT", "8083")
	v.SetDefault("OPENSEARCH_URL", "http://localhost:9200")

	// Unmarshal environment variables into Config struct
	cfg := &Config{}
	if err := v.Unmarshal(cfg); err != nil {
		return nil, fmt.Errorf("error unmarshaling config: %w", err)
	}

	// Parse KAFKA_BROKERS comma-separated string
	brokers := v.GetString("KAFKA_BROKERS")
	cfg.KafkaBrokers = parseCommaSeparatedString(brokers)

	return cfg, nil
}

func (c *Config) PostgresURL() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", c.DatabaseUser, c.DatabasePassword, c.DatabaseHost, c.DatabasePort, c.DatabaseName)
}

func parseCommaSeparatedString(input string) []string {
	values := strings.Split(input, ",")
	for i, v := range values {
		values[i] = strings.TrimSpace(v)
	}
	return values
}
