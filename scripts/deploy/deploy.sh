#!/bin/bash

# Deployment script for AMROIS environments
# Usage: ./deploy.sh [main|dev|feature] [branch-name]

set -e

ENVIRONMENT=$1
BRANCH_NAME=${2:-$(git branch --show-current)}

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 [main|dev|feature] [branch-name]"
    echo "  main   - Deploy main branch to port 3467 (production-like)"
    echo "  dev    - Deploy dev branch to port 3468 (development)"
    echo "  feature - Deploy feature branch to port 3469 (testing)"
    exit 1
fi

# Set ports and databases based on environment
case $ENVIRONMENT in
    main)
        PORT=3467
        DB_PATH="./data/main/amrois_main.db"
        ENV_FILE=".env.main"
        ;;
    dev)
        PORT=3468
        DB_PATH="./data/dev/amrois_dev.db"
        ENV_FILE=".env.dev"
        ;;
    feature)
        PORT=3469
        DB_PATH="./data/features/amrois_${BRANCH_NAME}.db"
        ENV_FILE=".env.feature"
        ;;
    *)
        echo "Invalid environment: $ENVIRONMENT"
        exit 1
        ;;
esac

echo "🚀 Deploying to $ENVIRONMENT environment..."
echo "📍 Branch: $BRANCH_NAME"
echo "🔌 Port: $PORT"
echo "💾 Database: $DB_PATH"

# Kill existing process on the port
echo "🔄 Stopping existing service on port $PORT..."
lsof -ti :$PORT | xargs kill -9 2>/dev/null || true

# Create data directories
mkdir -p "$(dirname "$DB_PATH")"

# Switch to target branch (if not current)
if [ "$BRANCH_NAME" != "$(git branch --show-current)" ]; then
    echo "🔄 Switching to branch $BRANCH_NAME..."
    git checkout $BRANCH_NAME
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin $BRANCH_NAME

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create environment-specific config
echo "⚙️ Creating environment config..."
cat > $ENV_FILE << EOF
# Configuración para entorno $ENVIRONMENT
NODE_ENV=$ENVIRONMENT
PORT=$PORT
DB_TYPE=sqlite
DB_PATH=$DB_PATH

# LLM (Ollama local en macOS)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3

# Security
JWT_SECRET=${ENVIRONMENT}_jwt_secret_change_in_production_$(date +%s)
DEVICE_TOKEN_SECRET=${ENVIRONMENT}_device_secret_change_in_production_$(date +%s)

# Books
BOOKS_PATH=./books
BOOKS_SCAN_INTERVAL=3600

# File Upload
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./data/uploads

# Logs
LOG_LEVEL=info
LOG_PATH=./data/logs
EOF

# Copy environment file
cp $ENV_FILE .env

echo "🔄 Starting service..."
# Start the service in background
NODE_ENV=$ENVIRONMENT PORT=$PORT DB_PATH=$DB_PATH npm run dev > logs/${ENVIRONMENT}.log 2>&1 &
SERVICE_PID=$!

echo $SERVICE_PID > pids/${ENVIRONMENT}.pid

echo "✅ Service started!"
echo "📊 API: http://localhost:$PORT"
echo "📖 Dashboard: http://localhost:$[PORT-1]"
echo "🏥 Health: http://localhost:$PORT/health"
echo "📝 Logs: tail -f logs/${ENVIRONMENT}.log"
echo "🔄 PID: $SERVICE_PID (saved to pids/${ENVIRONMENT}.pid)"

# Wait a moment and check if service started
sleep 3
if curl -s http://localhost:$PORT/health > /dev/null; then
    echo "✅ Service is healthy!"
else
    echo "❌ Service failed to start. Check logs/${ENVIRONMENT}.log"
    exit 1
fi