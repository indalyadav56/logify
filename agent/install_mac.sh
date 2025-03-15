#!/bin/bash

# Exit on any error
set -e

echo "Installing Go background agent for Mac..."

# Check if running as root/sudo
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run with sudo. Please use sudo."
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

# Install launchd service
echo "Installing launchd service..."
cp "$(dirname "$0")/com.background.agent.plist" /Library/LaunchDaemons/com.background.agent.go.plist

# Set proper permissions
chown root:wheel /Library/LaunchDaemons/com.background.agent.go.plist
chmod 644 /Library/LaunchDaemons/com.background.agent.go.plist

# Load and start the service
launchctl load -w /Library/LaunchDaemons/com.background.agent.go.plist

echo "Go background agent has been installed and started."
echo "Check status with: launchctl list | grep com.background.agent.go"
echo "View logs at: $INSTALL_DIR/logs/agent.log"
