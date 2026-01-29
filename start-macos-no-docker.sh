#!/bin/bash

# Script de inicio para macOS - AMROIS sin Docker
echo "🚀 Iniciando AMROIS Local Stack en macOS (sin Docker)..."

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

# Función para mostrar estado de los servicios
show_status() {
    echo ""
    echo "📊 Estado de los Servicios:"
    echo "========================"
    
    # Verificar API principal (puerto 4123)
    check_service "API Principal" "4123" "http://localhost:4123/health"
    
    # Verificar API de Agents (puerto 12000)
    check_service "API Agents" "12000" "http://localhost:12000/api/health"
    
    # Verificar Dashboard (puerto 346721)
    check_service "Dashboard" "346721" "http://localhost:346721"
    
    # Verificar n8n (puerto 5678)
    check_service "n8n" "5678" "http://localhost:5678"
    
    # Verificar Ollama (puerto 11434)
    check_service "Ollama" "11434" "http://localhost:11434/api/tags"
    
    # Verificar PostgreSQL (puerto 5432)
    if pg_isready -h localhost -p 5432 -U amrois > /dev/null 2>&1; then
        echo "✅ PostgreSQL activo en puerto 5432"
    else
        echo "❌ PostgreSQL inactivo en puerto 5432"
    fi
    
    # Verificar Redis (puerto 6379)
    if redis-cli ping 2>/dev/null | grep -q "PONG"; then
        echo "✅ Redis activo en puerto 6379"
    else
        echo "❌ Redis inactivo en puerto 6379"
    fi
    echo "========================"
}

# Verificar que PostgreSQL está corriendo
if ! pgrep -f "postgres" > /dev/null; then
    echo "🗄️ Iniciando PostgreSQL..."
    brew services start postgresql@16
fi

# Verificar que Redis está corriendo
if ! pgrep -f "redis-server" > /dev/null; then
    echo "🔄 Iniciando Redis..."
    brew services start redis
fi

# Iniciar Ollama si no está corriendo
if ! pgrep -f "ollama serve" > /dev/null; then
    echo "🤖 Iniciando Ollama..."
    ollama serve &
    sleep 5
fi

# Esperar a que los servicios de base de datos estén listos
echo "⏳ Esperando a que los servicios de base de datos estén listos..."
sleep 5

# Verificar conexión a PostgreSQL
echo "🔍 Verificando conexión a PostgreSQL..."
until pg_isready -h localhost -p 5432 -U amrois; do
    echo "Esperando a PostgreSQL..."
    sleep 2
done

# Crear base de datos si no existe
echo "🗄️ Asegurando que la base de datos existe..."
createdb -O amrois amrois_local 2>/dev/null || echo "Base de datos ya existe"

# Iniciar n8n en segundo plano
echo "🔄 Iniciando n8n..."
n8n start --port 5678 &
N8N_PID=$!

# Esperar a que n8n esté listo
echo "⏳ Esperando a n8n..."
sleep 10

# Iniciar API de AMROIS principal
echo "🔧 Iniciando API Principal de AMROIS..."
npm run dev &
API_PID=$!

# Esperar a que la API principal esté lista
echo "⏳ Esperando a la API Principal..."
sleep 5

# Iniciar API de Agents si existe
if [ -f "src/agents/index.js" ]; then
    echo "🤖 Iniciando API de Agents..."
    npm run dev:agents &
    AGENTS_PID=$!
    sleep 3
else
    echo "⚠️  API de Agents no encontrada en src/agents/index.js"
    AGENTS_PID=""
fi

# Esperar a que las APIs estén listas
echo "⏳ Esperando a las APIs..."
sleep 5

# Iniciar frontend con serve
echo "🖥️ Iniciando Dashboard..."
cd dashboard && serve -s dist -l 346721 &
DASHBOARD_PID=$!
cd ..

echo ""
echo "✅ Sistema iniciado!"
show_status
echo ""
echo "🌐 URLs de acceso:"
echo "- Dashboard Principal: http://localhost:346721"
echo "- API Principal: http://localhost:4123"
echo "- API Agents: http://localhost:12000"
echo "- n8n: http://localhost:5678"
echo "- Ollama API: http://localhost:11434"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo ""
echo "🔄 Para verificar estado en cualquier momento:"
echo "npm run check-api  # Verificar API de Agents"
echo "curl http://localhost:4123/health  # Verificar API Principal"
echo ""
echo "🛑 Para detener el sistema:"
echo "- Presiona Ctrl+C o ejecuta: ./stop-macos-no-docker.sh"

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $API_PID 2>/dev/null
    [ ! -z "$AGENTS_PID" ] && kill $AGENTS_PID 2>/dev/null
    kill $N8N_PID 2>/dev/null
    kill $DASHBOARD_PID 2>/dev/null
    echo "✅ Servicios de aplicación detenidos"
    echo "💡 PostgreSQL y Redis siguen corriendo en segundo plano"
    exit 0
}

# Capturar señales para limpieza
trap cleanup SIGINT SIGTERM

# Mantener el script corriendo
wait