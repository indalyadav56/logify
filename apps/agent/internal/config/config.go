// Package config defines the logify-agent configuration: the on-disk YAML
// schema, sane defaults, validation, and helpers to locate the config file.
package config

import (
	"fmt"
	"os"
	"runtime"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

// Duration is a time.Duration that (un)marshals from a human string like "10s".
type Duration time.Duration

func (d Duration) Std() time.Duration { return time.Duration(d) }

func (d *Duration) UnmarshalYAML(value *yaml.Node) error {
	var s string
	if err := value.Decode(&s); err != nil {
		return err
	}
	if strings.TrimSpace(s) == "" {
		return nil
	}
	parsed, err := time.ParseDuration(s)
	if err != nil {
		return fmt.Errorf("invalid duration %q: %w", s, err)
	}
	*d = Duration(parsed)
	return nil
}

// Config is the fully-parsed agent configuration.
type Config struct {
	Backend  Backend       `yaml:"backend"`
	Defaults Defaults      `yaml:"defaults"`
	Delivery Delivery      `yaml:"delivery"`
	Registry string        `yaml:"registry_file"`
	LogLevel string        `yaml:"log_level"`
	Inputs   []InputConfig `yaml:"inputs"`
}

// Backend describes how to reach the Logify ingest API.
type Backend struct {
	URL        string   `yaml:"url"`
	APIKey     string   `yaml:"api_key"`
	IngestPath string   `yaml:"ingest_path"`
	Timeout    Duration `yaml:"timeout"`
}

// Defaults are applied to every log unless an input or the line itself overrides.
type Defaults struct {
	ProjectID   string            `yaml:"project_id"`
	Service     string            `yaml:"service"`
	Namespace   string            `yaml:"namespace"`
	Environment string            `yaml:"environment"`
	Source      string            `yaml:"source"`
	Tags        map[string]string `yaml:"tags"`
}

// Delivery controls the SDK's async shipping behaviour.
type Delivery struct {
	Async      bool `yaml:"async"`
	BufferSize int  `yaml:"buffer_size"`
	Workers    int  `yaml:"workers"`
}

// InputConfig is one log source. Type selects the reader; the remaining fields
// are interpreted per-type (paths/json/multiline for "file", units for
// "journald", etc.).
type InputConfig struct {
	Type string `yaml:"type"` // file | stdin | journald
	Name string `yaml:"name"`

	// Per-input label overrides (fall back to Defaults when empty).
	Service     string            `yaml:"service"`
	Namespace   string            `yaml:"namespace"`
	Environment string            `yaml:"environment"`
	Source      string            `yaml:"source"`
	Level       string            `yaml:"level"` // default level when none is parsed
	Tags        map[string]string `yaml:"tags"`

	// file
	Paths       []string  `yaml:"paths"`
	JSON        bool      `yaml:"json"`          // parse each line as a JSON object
	FromBeginning bool    `yaml:"from_beginning"` // first-seen files: read from start vs end
	Multiline   *Multiline `yaml:"multiline"`

	// journald
	Units []string `yaml:"units"`
}

// Multiline joins continuation lines (e.g. stack traces) into one event,
// mirroring Filebeat's pattern/negate/match semantics.
type Multiline struct {
	Pattern string `yaml:"pattern"`         // regular expression
	Negate  bool   `yaml:"negate"`          // invert the pattern match
	Match   string `yaml:"match"`           // "after" or "before"
	MaxLines int   `yaml:"max_lines"`       // cap lines per event (default 500)
}

// Load reads, parses, defaults and validates a config file.
func Load(path string) (*Config, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read config %s: %w", path, err)
	}
	var cfg Config
	dec := yaml.NewDecoder(strings.NewReader(string(raw)))
	dec.KnownFields(true)
	if err := dec.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("parse config %s: %w", path, err)
	}
	cfg.ApplyDefaults()
	if err := cfg.Validate(); err != nil {
		return nil, err
	}
	return &cfg, nil
}

// ApplyDefaults fills unset fields with their conventional values. Load calls
// it automatically; callers that build a Config in code should call it too.
func (c *Config) ApplyDefaults() {
	if c.Backend.URL == "" {
		c.Backend.URL = "http://localhost:8080"
	}
	if c.Backend.IngestPath == "" {
		c.Backend.IngestPath = "/v1/logs"
	}
	if c.Backend.Timeout == 0 {
		c.Backend.Timeout = Duration(10 * time.Second)
	}
	if c.Defaults.Source == "" {
		c.Defaults.Source = "logify-agent"
	}
	if c.Delivery.BufferSize <= 0 {
		c.Delivery.BufferSize = 4096
	}
	if c.Delivery.Workers <= 0 {
		c.Delivery.Workers = 4
	}
	if c.Registry == "" {
		c.Registry = DefaultRegistryPath()
	}
	if c.LogLevel == "" {
		c.LogLevel = "info"
	}
	for i := range c.Inputs {
		in := &c.Inputs[i]
		if in.Name == "" {
			in.Name = fmt.Sprintf("%s-%d", in.Type, i)
		}
		if in.Multiline != nil {
			if in.Multiline.Match == "" {
				in.Multiline.Match = "after"
			}
			if in.Multiline.MaxLines <= 0 {
				in.Multiline.MaxLines = 500
			}
		}
	}
}

// Validate checks for misconfiguration that would prevent the agent from running.
func (c *Config) Validate() error {
	if c.Backend.URL == "" {
		return fmt.Errorf("backend.url is required")
	}
	if len(c.Inputs) == 0 {
		return fmt.Errorf("at least one input is required")
	}
	seen := map[string]bool{}
	for i, in := range c.Inputs {
		switch in.Type {
		case "file":
			if len(in.Paths) == 0 {
				return fmt.Errorf("input %q (#%d): type file requires at least one path", in.Name, i)
			}
		case "stdin", "journald":
			// no required fields
		case "":
			return fmt.Errorf("input #%d: type is required (file|stdin|journald)", i)
		default:
			return fmt.Errorf("input %q (#%d): unknown type %q", in.Name, i, in.Type)
		}
		if seen[in.Name] {
			return fmt.Errorf("duplicate input name %q", in.Name)
		}
		seen[in.Name] = true
		if in.Multiline != nil && in.Multiline.Match != "after" && in.Multiline.Match != "before" {
			return fmt.Errorf("input %q: multiline.match must be \"after\" or \"before\"", in.Name)
		}
	}
	return nil
}

// DefaultConfigPath is the conventional location of the agent config per-OS.
func DefaultConfigPath() string {
	if runtime.GOOS == "darwin" {
		return "/usr/local/etc/logify/agent.yaml"
	}
	return "/etc/logify/agent.yaml"
}

// DefaultRegistryPath is where file-tail offsets are persisted per-OS.
func DefaultRegistryPath() string {
	if runtime.GOOS == "darwin" {
		return "/usr/local/var/lib/logify-agent/registry.json"
	}
	return "/var/lib/logify-agent/registry.json"
}
