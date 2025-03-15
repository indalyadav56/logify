#!/bin/bash

# Exit on any error
set -e

echo "Uninstalling Go background agent for Ubuntu..."

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root. Please use sudo."
    exit 1
fi

# Stop and disable the service
echo "Stopping and disabling service..."
systemctl stop background-agent.service || true
systemctl disable background-agent.service || true

# Remove service file
echo "Removing systemd service file..."
rm -f /etc/systemd/system/background-agent.service
systemctl daemon-reload

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
