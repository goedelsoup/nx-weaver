#!/bin/bash

echo "Installing Nx Weaver Plugin dependencies..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
pnpm install

# Install additional dev dependencies if needed
pnpm add -D js-yaml @types/js-yaml vitest @nx/vite @biomejs/biome

echo "Dependencies installed successfully!"

echo "Building the plugin..."
pnpm run build

echo "Running tests..."
pnpm test

echo "Installation complete!"
echo ""
echo "You can now use the plugin with:"
echo "  nx generate @nx-weaver/plugin:init"
echo "  nx generate @nx-weaver/plugin:setup-project my-project" 