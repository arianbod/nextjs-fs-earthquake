#!/bin/bash

# QuakeWise External API Setup Script
# Automates the initial setup process

echo "🚀 QuakeWise External API - Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
echo ""
npm install jose better-sqlite3 zod

# Optional: Swagger UI
read -p "Install Swagger UI for interactive documentation? (y/n) [y]: " install_swagger
install_swagger=${install_swagger:-y}

if [ "$install_swagger" = "y" ]; then
    npm install swagger-ui-react
fi

echo ""
echo "✅ Dependencies installed"
echo ""

# Step 2: Setup environment variables
echo "🔐 Step 2: Setting up environment variables..."
echo ""

if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists"
    read -p "Overwrite? (y/n) [n]: " overwrite
    overwrite=${overwrite:-n}

    if [ "$overwrite" != "y" ]; then
        echo "Skipping environment setup"
    else
        cp .env.local.example .env.local
    fi
else
    cp .env.local.example .env.local
    echo "✅ Created .env.local from template"
fi

echo ""
echo "🔑 Generating secure tokens..."
echo ""

# Generate platform secret
PLATFORM_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Platform Secret: $PLATFORM_SECRET"

# Generate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT Secret: $JWT_SECRET"

echo ""
echo "📝 Please add these to your .env.local file:"
echo ""
echo "API_PLATFORM_SECRET=$PLATFORM_SECRET"
echo "JWT_SECRET=$JWT_SECRET"
echo ""

read -p "Press Enter to continue..."

# Step 3: Initialize database
echo ""
echo "💾 Step 3: Database will be automatically created on first run"
echo "   Default location: ./data/api_usage.db"
echo ""

# Step 4: Register first app
echo "📱 Step 4: Register your first platform app"
echo ""
read -p "Register an app now? (y/n) [y]: " register_app
register_app=${register_app:-y}

if [ "$register_app" = "y" ]; then
    node scripts/register-app.js
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Next Steps:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Update .env.local with the generated tokens"
echo "2. Start the dev server:"
echo "   npm run dev"
echo ""
echo "3. Visit the API documentation:"
echo "   http://localhost:3000/api-docs"
echo ""
echo "4. Test the API:"
echo "   node scripts/test-api.js <your-platform-token>"
echo ""
echo "5. Read the documentation:"
echo "   - API_README.md - Complete developer guide"
echo "   - API_IMPLEMENTATION_SUMMARY.md - Implementation details"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
