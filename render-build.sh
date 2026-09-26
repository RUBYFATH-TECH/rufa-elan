#!/usr/bin/env bash
# Render build script for backend

set -o errexit

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Build completed successfully!"
