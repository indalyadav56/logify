package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/indalyadav56/logify/apps/agent/internal/agent"
	"github.com/indalyadav56/logify/apps/agent/internal/config"
)

func cmdRun(args []string) error {
	fs := flag.NewFlagSet("run", flag.ExitOnError)
	var (
		configPath = fs.String("config", "", "path to config file (default: "+config.DefaultConfigPath()+")")
		url        = fs.String("url", "", "backend base URL override")
		apiKey     = fs.String("api-key", "", "X-API-Key override (or env LOGIFY_API_KEY)")
		service    = fs.String("service", "", "default service name override")
		env        = fs.String("env", "", "default environment override")
		source     = fs.String("source", "", "default source override")
		logLevel   = fs.String("log-level", "", "agent log level: debug|info|warn|error")
		stdin      = fs.Bool("stdin", false, "ignore config inputs and read from stdin")
	)
	fs.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage: logify-agent run [flags]\n\nReads %s unless --config or --stdin is given.\n\nFlags:\n", config.DefaultConfigPath())
		fs.PrintDefaults()
	}
	if err := fs.Parse(args); err != nil {
		return err
	}

	cfg, err := resolveConfig(*configPath, *stdin)
	if err != nil {
		return err
	}

	// Flag and env overrides win over the file.
	if *url != "" {
		cfg.Backend.URL = *url
	}
	if k := firstNonEmpty(*apiKey, os.Getenv("LOGIFY_API_KEY")); k != "" {
		cfg.Backend.APIKey = k
	}
	if *service != "" {
		cfg.Defaults.Service = *service
	}
	if *env != "" {
		cfg.Defaults.Environment = *env
	}
	if *source != "" {
		cfg.Defaults.Source = *source
	}
	if *logLevel != "" {
		cfg.LogLevel = *logLevel
	}
	if err := cfg.Validate(); err != nil {
		return err
	}

	log := newLogger(cfg.LogLevel)
	ag, err := agent.New(cfg, log)
	if err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	log.Info("logify-agent starting", "version", version, "backend", cfg.Backend.URL, "inputs", len(cfg.Inputs))
	if err := ag.Run(ctx); err != nil {
		return err
	}
	log.Info("logify-agent stopped")
	return nil
}

// resolveConfig loads the config file, or synthesizes a minimal stdin-only
// config when none is requested/found — so `prog | logify-agent run` works
// out of the box.
func resolveConfig(path string, forceStdin bool) (*config.Config, error) {
	if forceStdin {
		return stdinConfig(), nil
	}
	if path != "" {
		return config.Load(path) // explicit path must exist
	}
	def := config.DefaultConfigPath()
	if _, err := os.Stat(def); err == nil {
		return config.Load(def)
	}
	// No config anywhere: fall back to reading stdin.
	return stdinConfig(), nil
}

func stdinConfig() *config.Config {
	cfg := &config.Config{
		Inputs: []config.InputConfig{{Type: "stdin", Name: "stdin"}},
	}
	cfg.ApplyDefaults()
	return cfg
}

func cmdValidate(args []string) error {
	fs := flag.NewFlagSet("validate", flag.ExitOnError)
	configPath := fs.String("config", config.DefaultConfigPath(), "path to config file")
	if err := fs.Parse(args); err != nil {
		return err
	}
	cfg, err := config.Load(*configPath)
	if err != nil {
		return err
	}
	fmt.Printf("ok: %s is valid (%d input(s), backend %s)\n", *configPath, len(cfg.Inputs), cfg.Backend.URL)
	return nil
}

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if v != "" {
			return v
		}
	}
	return ""
}
