#!/bin/bash

# Reset project script
# Simulates a fresh clone for a new developer

set -e

echo "Cleaning project..."

# Remove all node_modules
echo "  -> Removing node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true

# Remove all .next build folders
echo "  -> Removing .next folders..."
find . -name ".next" -type d -prune -exec rm -rf {} + 2>/dev/null || true

# Remove pnpm lockfile
echo "  -> Removing pnpm-lock.yaml..."
rm -f pnpm-lock.yaml

echo "Installing dependencies..."
pnpm install

echo "Project reset complete!"
echo ""
echo "You can now run: pnpm dev"