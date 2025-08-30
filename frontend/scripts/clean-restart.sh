#!/bin/bash

echo "🧹 Cleaning Next.js cache and build artifacts..."

# Kill any running Next.js processes
pkill -f "next dev" || true
pkill -f "next start" || true

# Clean Next.js cache
rm -rf .next
rm -rf node_modules/.cache

# Clean npm cache
npm cache clean --force

# Reinstall dependencies to ensure clean state
echo "📦 Reinstalling dependencies..."
npm install

# Clear browser cache hints
echo "🌐 Clearing browser cache hints..."
echo "Please clear your browser cache or open in incognito mode"

# Start development server
echo "🚀 Starting development server..."
npm run dev
