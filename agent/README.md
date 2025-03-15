# Go Background Agent for Mac and Ubuntu

This project provides a simple background agent written in Go that runs as a system service on both Mac and Ubuntu systems. The agent runs continuously in the background, similar to how nginx operates.

## Features

- Written in Go for high performance and low resource usage
- Runs as a background service
- Automatically starts on system boot
- Logs activity to a log file
- Easy installation and uninstallation

## Requirements

- Go 1.16 or higher (for building)
- Ubuntu: systemd (standard on modern Ubuntu systems)
- Mac: launchd (standard on macOS)

## Installation

### Ubuntu

```bash
# Make the installation script executable
chmod +x install_ubuntu.sh

# Run the installation script with sudo
sudo ./install_ubuntu.sh
```

### Mac

```bash
# Make the installation script executable
chmod +x install_mac.sh

# Run the installation script with sudo
sudo ./install_mac.sh
```

## Checking Service Status

### Ubuntu

```bash
# Check if the service is running
systemctl status background-agent.service

# View logs
journalctl -u background-agent.service
# or
cat /opt/background-agent-go/logs/agent.log
```

### Mac

```bash
# Check if the service is running
launchctl list | grep com.background.agent.go

# View logs
cat /opt/background-agent-go/logs/agent.log
```

## Uninstallation

### Ubuntu

```bash
# Make the uninstallation script executable
chmod +x uninstall_ubuntu.sh

# Run the uninstallation script with sudo
sudo ./uninstall_ubuntu.sh
```

### Mac

```bash
# Make the uninstallation script executable
chmod +x uninstall_mac.sh

# Run the uninstallation script with sudo
sudo ./uninstall_mac.sh
```

## Customizing the Agent

To customize what the agent does, modify the `agent.go` file. The main functionality is in the main loop. After modifying, rebuild and reinstall the agent using the installation script.

## Security Considerations

This agent runs as root by default for system-wide access. For production use, consider:

1. Creating a dedicated user with minimal permissions
2. Restricting file permissions
3. Implementing proper error handling and logging
4. Adding authentication if the agent exposes any network services

## License

MIT
