#!/bin/bash
echo "📊 ESTADO DE SERVICIOS AMROIS"
echo "=================================="

API_PID=$(ps aux | grep "npm start" | grep -v grep | awk '{print $2}')
AGENTES_PID=$(ps aux | grep "agents/index.js" | grep -v grep | awk '{print $2}')

if [ -n "$API_PID" ]; then
    echo "✅ API Principal: ACTIVO (PID: $API_PID)"
    if curl -s -f http://localhost:3467/health > /dev/null; then
        echo "📡 Endpoint: http://localhost:3467/health ✅"
    else
        echo "❌ Endpoint: No responde"
    fi
else
    echo "❌ API Principal: INACTIVO"
fi

if [ -n "$AGENTES_PID" ]; then
    echo "✅ API Agentes: ACTIVO (PID: $AGENTES_PID)"
    if curl -s -f http://localhost:12000/api/health > /dev/null; then
        echo "🤖 Endpoint: http://localhost:12000/api/health ✅"
    else
        echo "❌ Endpoint: No responde"
    fi
else
    echo "❌ API Agentes: INACTIVO"
fi

echo ""
echo "📊 DASHBOARD: http://localhost:12000/dashboard"
echo "📈 LOGS: logs/"
