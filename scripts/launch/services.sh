#!/bin/bash

# Service management script for AMROIS
# Usage: ./services.sh [start|stop|restart|status|logs] [main|dev|feature]

set -e

COMMAND=$1
ENVIRONMENT=$2

if [ -z "$COMMAND" ]; then
    echo "Usage: $0 [start|stop|restart|status|logs] [main|dev|feature|all]"
    exit 1
fi

# Function to get port for environment
get_port() {
    case $1 in
        main) echo 3467 ;;
        dev) echo 3468 ;;
        feature) echo 3469 ;;
        *) echo "Unknown" ;;
    esac
}

# Function to stop a service
stop_service() {
    local env=$1
    local port=$(get_port $env)
    
    if [ "$port" != "Unknown" ]; then
        echo "🔄 Stopping $env service (port $port)..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        
        if [ -f "pids/$env.pid" ]; then
            kill -9 $(cat pids/$env.pid) 2>/dev/null || true
            rm pids/$env.pid
        fi
        echo "✅ $env service stopped"
    else
        echo "❌ Unknown environment: $env"
    fi
}

# Function to start a service
start_service() {
    local env=$1
    
    if [ "$env" = "all" ]; then
        start_service main
        start_service dev
        return
    fi
    
    if [ ! -f "pids/$env.pid" ] || ! kill -0 $(cat pids/$env.pid) 2>/dev/null; then
        echo "🚀 Starting $env service..."
        ./deploy.sh $env
    else
        echo "✅ $env service is already running"
    fi
}

# Function to restart a service
restart_service() {
    local env=$1
    
    if [ "$env" = "all" ]; then
        restart_service main
        restart_service dev
        return
    fi
    
    echo "🔄 Restarting $env service..."
    stop_service $env
    sleep 2
    start_service $env
}

# Function to check service status
status_service() {
    local env=$1
    
    if [ "$env" = "all" ]; then
        status_service main
        status_service dev
        status_service feature
        return
    fi
    
    local port=$(get_port $env)
    echo "=== $env Environment Status ==="
    echo "Port: $port"
    
    if [ -f "pids/$env.pid" ]; then
        local pid=$(cat pids/$env.pid)
        if kill -0 $pid 2>/dev/null; then
            echo "Status: ✅ Running (PID: $pid)"
        else
            echo "Status: ❌ Not running (stale PID file)"
            rm pids/$env.pid
        fi
    else
        echo "Status: ❌ Not running"
    fi
    
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        echo "Health: ✅ Healthy"
    else
        echo "Health: ❌ Unreachable"
    fi
    echo ""
}

# Function to show logs
logs_service() {
    local env=$1
    
    if [ "$env" = "all" ]; then
        echo "Showing logs for all environments (Ctrl+C to exit)..."
        tail -f logs/*.log
        return
    fi
    
    if [ -f "logs/$env.log" ]; then
        echo "Showing logs for $env environment (Ctrl+C to exit)..."
        tail -f logs/$env.log
    else
        echo "❌ No logs found for $env environment"
    fi
}

# Execute command
case $COMMAND in
    start)
        if [ -z "$ENVIRONMENT" ] || [ "$ENVIRONMENT" = "all" ]; then
            start_service all
        else
            start_service $ENVIRONMENT
        fi
        ;;
    stop)
        if [ -z "$ENVIRONMENT" ] || [ "$ENVIRONMENT" = "all" ]; then
            stop_service all
        else
            stop_service $ENVIRONMENT
        fi
        ;;
    restart)
        if [ -z "$ENVIRONMENT" ] || [ "$ENVIRONMENT" = "all" ]; then
            restart_service all
        else
            restart_service $ENVIRONMENT
        fi
        ;;
    status)
        if [ -z "$ENVIRONMENT" ] || [ "$ENVIRONMENT" = "all" ]; then
            status_service all
        else
            status_service $ENVIRONMENT
        fi
        ;;
    logs)
        if [ -z "$ENVIRONMENT" ]; then
            echo "Please specify an environment: main, dev, feature, or all"
            exit 1
        else
            logs_service $ENVIRONMENT
        fi
        ;;
    *)
        echo "Unknown command: $COMMAND"
        echo "Usage: $0 [start|stop|restart|status|logs] [main|dev|feature|all]"
        exit 1
        ;;
esac