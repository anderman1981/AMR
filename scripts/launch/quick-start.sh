#!/bin/bash

# Script de inicio rápido para macOS - AMROIS sin Docker
echo "🚀 Iniciando AMROIS (Modo Rápido)..."

# Función para verificar si un servicio está activo
check_service() {
    local name=$1
    local port=$2
    local url=$3
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        echo "✅ $name activa en puerto $port"
        return 0
    else
        echo "❌ $name inactiva en puerto $port"
        return 1
    fi
}

# Mostrar estado actual
echo ""
echo "📊 Estado Actual:"
echo "==============="
check_service "API Principal" "4123" "http://localhost:4123/health"
check_service "API Agents" "12000" "http://localhost:12000/api/health"
check_service "Dashboard" "3467" "http://localhost:3467"
echo "==============="

# Preguntar qué servicios iniciar
echo ""
echo "¿Qué servicios deseas iniciar?"
echo "1) Todo el stack completo"
echo "2) Solo APIs (Principal + Agents)"
echo "3) Solo Dashboard"
echo "4) Verificar estado de todo"
echo "5) Salir"
echo ""

read -p "Selecciona una opción (1-5): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "🚀 Iniciando todo el stack completo..."
        exec ./start-macos-no-docker.sh
        ;;
    2)
        echo "🔧 Iniciando solo APIs..."
        
        # API Principal
        npm run dev &
        API_PID=$!
        
        # API Agents si existe
        if [ -f "src/agents/index.js" ]; then
            npm run dev:agents &
            AGENTS_PID=$!
            sleep 3
        fi
        
        echo "✅ APIs iniciadas"
        echo "- API Principal: http://localhost:4123"
        echo "- API Agents: http://localhost:12000"
        echo ""
        echo "Para detener: pkill -f 'npm run dev'"
        ;;
    3)
        echo "🖥️ Iniciando solo Dashboard..."
        cd dashboard && serve -s dist -l 3467 &
        DASHBOARD_PID=$!
        echo "✅ Dashboard iniciado en http://localhost:3467"
        echo "Para detener: pkill -f 'serve -s dist'"
        ;;
    4)
        echo "📊 Verificando estado completo..."
        
        echo ""
        echo "🔹 APIs:"
        check_service "API Principal" "4123" "http://localhost:4123/health"
        check_service "API Agents" "12000" "http://localhost:12000/api/health"
        
        echo ""
        echo "🔹 Frontend:"
check_service "Dashboard" "3467" "http://localhost:3467"
        check_service "n8n" "5678" "http://localhost:5678"
        
        echo ""
        echo "🔹 Backend Services:"
        check_service "Ollama" "11434" "http://localhost:11434/api/tags"
        
        if pg_isready -h localhost -p 5432 -U amrois > /dev/null 2>&1; then
            echo "✅ PostgreSQL activo en puerto 5432"
        else
            echo "❌ PostgreSQL inactivo en puerto 5432"
        fi
        
        if redis-cli ping 2>/dev/null | grep -q "PONG"; then
            echo "✅ Redis activo en puerto 6379"
        else
            echo "❌ Redis inactivo en puerto 6379"
        fi
        ;;
    5)
        echo "👋 Saliendo..."
        exit 0
        ;;
    *)
        echo "❌ Opción no válida"
        exit 1
        ;;
esac