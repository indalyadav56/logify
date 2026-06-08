package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"

	"github.com/indalyadav56/logify/apps/agent/internal/config"
	"github.com/indalyadav56/logify/apps/agent/internal/service"
)

func cmdService(args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: logify-agent service <install|uninstall|status> [flags]")
	}
	sub, rest := args[0], args[1:]
	switch sub {
	case "install":
		return serviceInstall(rest)
	case "uninstall":
		return service.Uninstall()
	case "status":
		return serviceStatus()
	default:
		return fmt.Errorf("unknown service subcommand %q (want install|uninstall|status)", sub)
	}
}

func serviceInstall(args []string) error {
	fs := flag.NewFlagSet("service install", flag.ExitOnError)
	configPath := fs.String("config", config.DefaultConfigPath(), "config file the service should run")
	if err := fs.Parse(args); err != nil {
		return err
	}
	if os.Geteuid() != 0 {
		return fmt.Errorf("service install must be run as root (try: sudo logify-agent service install)")
	}

	absConfig, err := filepath.Abs(*configPath)
	if err != nil {
		return err
	}
	if _, err := os.Stat(absConfig); err != nil {
		return fmt.Errorf("config %s not found — create it before installing the service", absConfig)
	}
	exe, err := service.ResolveExecPath()
	if err != nil {
		return err
	}

	if err := service.Install(service.Params{ExecPath: exe, ConfigPath: absConfig}); err != nil {
		return err
	}
	fmt.Printf("installed logify-agent service (binary=%s, config=%s)\n", exe, absConfig)
	return nil
}

// serviceStatus shells out to the platform service manager for a quick view.
func serviceStatus() error {
	switch runtime.GOOS {
	case "linux":
		return passthrough("systemctl", "status", "logify-agent", "--no-pager")
	case "darwin":
		return passthrough("launchctl", "list", "com.logify.agent")
	default:
		return fmt.Errorf("service status is not supported on %s", runtime.GOOS)
	}
}

func passthrough(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}
