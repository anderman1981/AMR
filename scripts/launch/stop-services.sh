#!/bin/bash
echo "🛑 Deteniendo servicios AMROIS..."

PID_FILE="amrois-production.pid"

if [ -f "$PID_FILE" ]; then
    PIDS=$(cat "$PID_FILE")
    for pid in $PIDS; do
        if ps -p "$pid" > /dev/null 2>&1; then
            kill -TERM "$pid"
            sleep 2
            if ps -p "$pid" > /dev/null 2>&1; then
                kill -KILL "$pid"
            fi
        fi
    done
    rm -f "$PID_FILE"
fi

# Liberar puertos
lsof -ti:3467 | xargs kill -9 2>/dev/null || true
lsof -ti:12000 | xargs kill -9 2>/dev/null || true

echo "✅ Servicios AMROIS detenidos"
