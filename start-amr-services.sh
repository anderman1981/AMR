#!/bin/bash

# AMR Project Docker Service Manager - DEV Environment
# This script ensures all AMR DEV services are running and configured for auto-restart

echo "🚀 Starting AMR Project DEV Docker Services..."

# Start core services if not running
echo "📦 Checking core DEV services..."
docker-compose up -d postgres redis ollama

# Wait for core services to be ready
echo "⏳ Waiting for core services..."
sleep 10

# Start application services
echo "🔧 Starting application services..."
docker-compose up -d amrois-api-dev amrois-dashboard-dev

# Wait for application services
echo "⏳ Waiting for application services..."
sleep 5

# Start nginx proxy
echo "🌐 Starting nginx proxy..."
docker-compose up -d nginx

echo ""
echo "🎯 DEV Service Status:"
docker ps | grep amrois

echo ""
echo "🌐 DEV Access Points:"
echo "   API: http://localhost:5467"
echo "   Dashboard: http://localhost:5468" 
echo "   PostgreSQL: localhost:5532"
echo "   Redis: localhost:6380"
echo "   Ollama: http://localhost:11435"
echo "   ChromaDB: http://localhost:8001"
echo "   Nginx Proxy: http://localhost:8080"

echo ""
echo "🔍 DEV Environment:"
echo "   Database: amrois_dev_system"
echo "   Node Environment: development"
echo "   API Port: 5467 (internal 4123)"
echo "   Dashboard Port: 5468 (internal 80)"

echo ""
echo "✅ All AMR DEV services are configured to restart automatically!"
echo "📝 Use 'docker logs <container-name-dev>' to check service logs"
echo "📋 Services: amrois-api-dev, amrois-dashboard-dev, amrois-postgres-dev, amrois-redis-dev, amrois-ollama-dev, amrois-nginx-dev"