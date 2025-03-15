#!/bin/bash

# Exit on any error
set -e

echo "Uninstalling Go background agent for Mac..."

# Check if running as root/sudo
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run with sudo. Please use sudo."
    exit 1
fi

# Unload the service
echo "Unloading launchd service..."
launchctl unload -w /Library/LaunchDaemons/com.background.agent.go.plist || true

# Remove service file
echo "Removing launchd service file..."
rm -f /Library/LaunchDaemons/com.background.agent.go.plist

# Ask if user wants to remove installation directory
read -p "Do you want to remove the installation directory and all logs? (y/n): " REMOVE_DIR
if [[ "$REMOVE_DIR" =~ ^[Yy]$ ]]; then
    echo "Removing installation directory..."
    rm -rf /opt/background-agent-go
    echo "Installation directory removed."
else
    echo "Installation directory kept at /opt/background-agent-go"
fi

echo "Go background agent has been uninstalled."
