#!/bin/bash
set -e

TOKEN="70bca6bb-0a5f-4d4b-b090-0764bd3dfc7d"
echo "AutoMatch Deploy Script"
echo "========================"

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
  echo "Installing Railway CLI..."
  npm install -g @railway/cli
fi

export RAILWAY_TOKEN=$TOKEN

echo ""
echo "Step 1: Linking project..."
railway link --environment production 2>/dev/null || railway init

echo ""
echo "Step 2: Adding Postgres (if not exists)..."
railway add --plugin postgresql 2>/dev/null || echo "  Postgres already exists"

echo ""
echo "Step 3: Adding Redis (if not exists)..."
railway add --plugin redis 2>/dev/null || echo "  Redis already exists"

echo ""
echo "Step 4: Setting env vars..."
railway variables set \
  ADMIN_SECRET="automatch-$(openssl rand -hex 8)" \
  NODE_ENV="production" \
  PORT="3000"

echo ""
echo "Step 5: Deploying all services..."
railway up --detach

echo ""
echo "========================"
echo "Deploy triggered!"
echo ""
echo "IMPORTANT — set these manually in Railway dashboard:"
echo "  APIFY_TOKEN = <your token from console.apify.com>"
echo "  FIREBASE_PROJECT_ID = <if you want push notifications>"
echo ""
echo "After deploy, trigger first scrape:"
echo "  API_URL=\$(railway domain)"
echo "  curl -X POST \$API_URL/api/v1/admin/scrape -H 'x-admin-secret: <your ADMIN_SECRET>'"
