#!/bin/bash

# Script de inicio para macOS - AMROIS Local Stack
echo "🚀 Iniciando AMROIS Local Stack en macOS..."

# Verificar que Docker Desktop está corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker Desktop no está corriendo. Por favor inícialo primero."
    exit 1
fi

# Iniciar Ollama si no está corriendo
if ! pgrep -f "ollama serve" > /dev/null; then
    echo "🤖 Iniciando Ollama..."
    ollama serve &
    sleep 5
fi

# Iniciar servicios Docker
echo "🐳 Iniciando servicios Docker..."
docker-compose -f docker-compose.macos.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Iniciar n8n en segundo plano
echo "🔄 Iniciando n8n..."
n8n start --port 5678 &
N8N_PID=$!

# Iniciar API de AMROIS
echo "🔧 Iniciando API de AMROIS..."
npm run dev &
API_PID=$!

echo "✅ Sistema iniciado!"
echo ""
echo "🌐 Servicios disponibles:"
echo "- Dashboard: http://localhost:80"
echo "- API: http://localhost:4123"
echo "- n8n: http://localhost:5678"
echo "- Ollama API: http://localhost:11434"
echo "- Redis: localhost:6379"
echo ""
echo "📊 Para ver logs:"
echo "- API: npm run logs"
echo "- Docker: docker-compose -f docker-compose.macos.yml logs -f"
echo ""
echo "🛑 Para detener el sistema:"
echo "- Presiona Ctrl+C o ejecuta: ./stop-macos.sh"

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $API_PID 2>/dev/null
    kill $N8N_PID 2>/dev/null
    docker-compose -f docker-compose.macos.yml down
    echo "✅ Sistema detenido"
    exit 0
}

# Capturar señales para limpieza
trap cleanup SIGINT SIGTERM

# Mantener el script corriendo
wait