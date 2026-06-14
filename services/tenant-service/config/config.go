package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	Port             string `mapstructure:"PORT"`
	GrpcPort         string `mapstructure:"GRPC_PORT"`
	DatabaseName     string `mapstructure:"DATABASE_NAME"`
	DatabaseUser     string `mapstructure:"DATABASE_USER"`
	DatabasePassword string `mapstructure:"DATABASE_PASSWORD"`
	DatabaseHost     string `mapstructure:"DATABASE_HOST"`
	DatabasePort     string `mapstructure:"DATABASE_PORT"`
}

func InitConfig() (*Config, error) {
	v := viper.New()

	v.SetConfigFile(".env")
	v.SetConfigType("env")

	v.AutomaticEnv()

	v.BindEnv("DATABASE_NAME")
	v.BindEnv("DATABASE_USER")
	v.BindEnv("DATABASE_PASSWORD")
	v.BindEnv("DATABASE_HOST")
	v.BindEnv("DATABASE_PORT")

	if err := v.ReadInConfig(); err != nil {
		fmt.Println("Error reading .env file:", err)
	}

	v.SetDefault("PORT", "8083")
	v.SetDefault("GRPC_PORT", "50053")

	cfg := &Config{}
	if err := v.Unmarshal(cfg); err != nil {
		return nil, fmt.Errorf("error unmarshaling config: %w", err)
	}

	return cfg, nil
}

func (c *Config) PostgresURL() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.DatabaseUser,
		c.DatabasePassword,
		c.DatabaseHost,
		c.DatabasePort,
		c.DatabaseName,
	)
}
