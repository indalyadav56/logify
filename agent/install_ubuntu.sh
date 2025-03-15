#!/bin/bash

# Exit on any error
set -e

echo "Installing Go background agent for Ubuntu..."

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root. Please use sudo."
    exit 1
fi

# Create installation directory
INSTALL_DIR="/opt/background-agent-go"
echo "Creating installation directory at $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR/logs"

# Build the Go binary
echo "Building Go agent..."
cd "$(dirname "$0")"
go build -o agent

# Copy files
echo "Copying agent files..."
cp "$(dirname "$0")/agent" "$INSTALL_DIR/"

# Install systemd service
echo "Installing systemd service..."
cp "$(dirname "$0")/background-agent.service" /etc/systemd/system/

# Reload systemd, enable and start service
systemctl daemon-reload
systemctl enable background-agent.service
systemctl start background-agent.service

echo "Go background agent has been installed and started."
echo "Check status with: systemctl status background-agent.service"
echo "View logs with: journalctl -u background-agent.service"
echo "Or check the log file at: $INSTALL_DIR/logs/agent.log"
