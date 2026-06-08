// Package service installs and removes logify-agent as a managed background
// service: systemd on Linux, launchd on macOS.
package service

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

const (
	serviceName  = "logify-agent"
	systemdUnit  = "/etc/systemd/system/logify-agent.service"
	launchdPlist = "/Library/LaunchDaemons/com.logify.agent.plist"
)

// Params describe how the installed service should invoke the agent.
type Params struct {
	ExecPath   string // absolute path to the logify-agent binary
	ConfigPath string // absolute path to the config file
}

// Install writes the platform service definition and enables/starts it.
func Install(p Params) error {
	switch runtime.GOOS {
	case "linux":
		return installSystemd(p)
	case "darwin":
		return installLaunchd(p)
	default:
		return fmt.Errorf("service install is not supported on %s", runtime.GOOS)
	}
}

// Uninstall stops and removes the platform service definition.
func Uninstall() error {
	switch runtime.GOOS {
	case "linux":
		return uninstallSystemd()
	case "darwin":
		return uninstallLaunchd()
	default:
		return fmt.Errorf("service uninstall is not supported on %s", runtime.GOOS)
	}
}

// ---- systemd (Linux) ----

func installSystemd(p Params) error {
	unit := fmt.Sprintf(`[Unit]
Description=Logify log shipping agent
Documentation=https://github.com/indalyadav56/logify
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=%s run --config %s
Restart=on-failure
RestartSec=5
# Hardening
NoNewPrivileges=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
`, p.ExecPath, p.ConfigPath)

	if err := os.WriteFile(systemdUnit, []byte(unit), 0o644); err != nil {
		return fmt.Errorf("write unit: %w", err)
	}
	if err := run("systemctl", "daemon-reload"); err != nil {
		return err
	}
	if err := run("systemctl", "enable", serviceName); err != nil {
		return err
	}
	if err := run("systemctl", "restart", serviceName); err != nil {
		return err
	}
	return nil
}

func uninstallSystemd() error {
	_ = run("systemctl", "stop", serviceName)
	_ = run("systemctl", "disable", serviceName)
	if err := os.Remove(systemdUnit); err != nil && !os.IsNotExist(err) {
		return err
	}
	return run("systemctl", "daemon-reload")
}

// ---- launchd (macOS) ----

func installLaunchd(p Params) error {
	plist := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.logify.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>%s</string>
        <string>run</string>
        <string>--config</string>
        <string>%s</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/usr/local/var/log/logify-agent.log</string>
    <key>StandardErrorPath</key>
    <string>/usr/local/var/log/logify-agent.err.log</string>
</dict>
</plist>
`, p.ExecPath, p.ConfigPath)

	if err := os.MkdirAll("/usr/local/var/log", 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(launchdPlist, []byte(plist), 0o644); err != nil {
		return fmt.Errorf("write plist: %w", err)
	}
	// Reload: unload first (ignore error if not loaded), then load.
	_ = run("launchctl", "unload", launchdPlist)
	return run("launchctl", "load", "-w", launchdPlist)
}

func uninstallLaunchd() error {
	_ = run("launchctl", "unload", launchdPlist)
	if err := os.Remove(launchdPlist); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func run(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("%s %s: %w: %s", name, strings.Join(args, " "), err, strings.TrimSpace(string(out)))
	}
	return nil
}

// ResolveExecPath returns the absolute path of the currently running binary,
// used to point the service definition at the installed agent.
func ResolveExecPath() (string, error) {
	exe, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.Abs(exe)
}
