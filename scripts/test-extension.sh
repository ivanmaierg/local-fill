#!/bin/bash

# Local-Fill Extension Testing Script
# This script helps set up and run Playwright tests for the Chrome extension

set -e

echo "🧪 Local-Fill Extension Testing Setup"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Build the extension
echo "🔨 Building extension..."
pnpm build

# Install Playwright browsers if needed
echo "🎭 Installing Playwright browsers..."
pnpm exec playwright install --with-deps

# Start fixtures server in background
echo "🚀 Starting fixtures server..."
pnpm test:fixtures &
FIXTURES_PID=$!

# Wait for server to start
echo "⏳ Waiting for fixtures server to start..."
sleep 3

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    kill $FIXTURES_PID 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Run tests
echo "🧪 Running Playwright tests..."
echo "================================"

# Check if specific test file was provided
if [ $# -eq 1 ]; then
    echo "Running specific test: $1"
    pnpm e2e "$1"
else
    echo "Running all tests..."
    pnpm e2e
fi

echo "✅ Tests completed!"
echo ""
echo "📊 Test results available at:"
echo "   - HTML Report: apps/extension/playwright-report/index.html"
echo "   - Screenshots: apps/extension/test-results/screenshots/"
echo "   - Videos: apps/extension/test-results/videos/"
echo ""
echo "🔧 Additional commands:"
echo "   - Run with UI: pnpm e2e:ui"
echo "   - Run headed: pnpm e2e --headed"
echo "   - Run specific test: pnpm e2e tests/autofill.spec.ts"
