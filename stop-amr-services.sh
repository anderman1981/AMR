#!/bin/bash

# AMR Project Stop Script
# This script stops all AMR services

echo "🛑 Stopping AMR Services..."

# Read PIDs from temp files
API_PID=$(cat /tmp/amr_api.pid 2>/dev/null)
WORKER_PID=$(cat /tmp/amr_worker.pid 2>/dev/null)
DASHBOARD_PID=$(cat /tmp/amr_dashboard.pid 2>/dev/null)

# Kill processes if they exist
if [ ! -z "$API_PID" ]; then
    echo "   🛑 Stopping API (PID: $API_PID)..."
    kill $API_PID 2>/dev/null || true
fi

if [ ! -z "$WORKER_PID" ]; then
    echo "   🛑 Stopping Worker (PID: $WORKER_PID)..."
    kill $WORKER_PID 2>/dev/null || true
fi

if [ ! -z "$DASHBOARD_PID" ]; then
    echo "   🛑 Stopping Dashboard (PID: $DASHBOARD_PID)..."
    kill $DASHBOARD_PID 2>/dev/null || true
fi

# Also kill any processes on the ports
echo "   🔄 Cleaning up any remaining processes..."
lsof -ti:5467 | xargs kill -9 2>/dev/null || true
lsof -ti:3465 | xargs kill -9 2>/dev/null || true  
lsof -ti:12001 | xargs kill -9 2>/dev/null || true

# Clean up PID files
rm -f /tmp/amr_api.pid /tmp/amr_worker.pid /tmp/amr_dashboard.pid

echo ""
echo "✅ All AMR services have been stopped!"
echo "🧹 Ports 5467, 3465, and 12001 are now free"