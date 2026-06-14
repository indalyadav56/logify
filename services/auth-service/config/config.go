package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	Port string `mapstructure:"PORT"`

	JwtSecret          string `mapstructure:"JWT_SECRET"`
	UserServiceGrpcUrl string `mapstructure:"USER_SERVICE_GRPC_URL"`
}

func InitConfig() (*Config, error) {
	v := viper.New()

	v.SetConfigFile(".env")
	v.SetConfigType("env")

	v.AutomaticEnv()

	v.BindEnv("USER_SERVICE_GRPC_URL")
	v.BindEnv("JWT_SECRET")

	if err := v.ReadInConfig(); err != nil {
		fmt.Println("Error reading .env file:", err)
	}

	v.SetDefault("PORT", "8080")
	v.SetDefault("USER_SERVICE_GRPC_URL", "localhost:50051")

	// Unmarshal environment variables into Config struct
	cfg := &Config{}
	if err := v.Unmarshal(cfg); err != nil {
		return nil, fmt.Errorf("error unmarshaling config: %w", err)
	}

	return cfg, nil
}
