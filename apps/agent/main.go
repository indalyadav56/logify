// Command logify-agent is a log shipping agent for the Logify platform. It
// tails files, reads stdin, or follows the systemd journal and forwards each
// record to the Logify ingest API.
//
// Usage:
//
//	logify-agent run [flags]               run the agent (foreground)
//	logify-agent send [flags]              send one or more logs and exit
//	logify-agent service install|uninstall|status
//	logify-agent validate [--config PATH]  check a config file
//	logify-agent version
package main

import (
	"fmt"
	"log/slog"
	"os"
	"strings"
)

// version is overridable at build time with -ldflags "-X main.version=...".
var version = "0.1.0"

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(2)
	}

	cmd, args := os.Args[1], os.Args[2:]
	var err error
	switch cmd {
	case "run":
		err = cmdRun(args)
	case "send":
		err = cmdSend(args)
	case "service":
		err = cmdService(args)
	case "validate":
		err = cmdValidate(args)
	case "version", "--version", "-v":
		fmt.Printf("logify-agent %s\n", version)
	case "help", "--help", "-h":
		usage()
	default:
		fmt.Fprintf(os.Stderr, "unknown command %q\n\n", cmd)
		usage()
		os.Exit(2)
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "logify-agent: %v\n", err)
		os.Exit(1)
	}
}

func usage() {
	fmt.Fprint(os.Stderr, `logify-agent — ship logs to Logify

Usage:
  logify-agent run [flags]                 Run the agent in the foreground
  logify-agent send [flags]                Send one or more logs, then exit
  logify-agent service <install|uninstall|status> [flags]
                                           Manage the background service
  logify-agent validate [--config PATH]    Validate a config file
  logify-agent version                     Print the version

Run "logify-agent <command> -h" for command-specific flags.
`)
}

// newLogger builds the agent's own structured logger at the given level.
func newLogger(level string) *slog.Logger {
	var lv slog.Level
	switch strings.ToLower(level) {
	case "debug":
		lv = slog.LevelDebug
	case "warn", "warning":
		lv = slog.LevelWarn
	case "error":
		lv = slog.LevelError
	default:
		lv = slog.LevelInfo
	}
	return slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: lv}))
}

// kvFlag is a repeatable --flag key=value option collected into a map.
type kvFlag map[string]string

func (k kvFlag) String() string { return "" }

func (k kvFlag) Set(v string) error {
	i := strings.IndexByte(v, '=')
	if i <= 0 {
		return fmt.Errorf("expected key=value, got %q", v)
	}
	k[v[:i]] = v[i+1:]
	return nil
}
