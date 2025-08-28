#!/bin/bash

echo "🚀 Preparing for Vercel deployment..."

# Clean up old files
echo "📦 Cleaning up old files..."
rm -rf .next
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -f yarn.lock

# Clean install
echo "📥 Installing dependencies..."
npm install

# Test build
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Commit all changes: git add . && git commit -m 'Prepare for deployment'"
    echo "2. Push to GitHub: git push origin main"
    echo "3. Deploy to Vercel:"
    echo "   - Go to https://vercel.com/dashboard"
    echo "   - Import your repository"
    echo "   - Set root directory to 'frontend'"
    echo "   - Add environment variables"
    echo ""
    echo "📖 See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
