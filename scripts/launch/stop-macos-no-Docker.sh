#!/bin/bash

# Script de detención para macOS - AMROIS sin Docker
echo "🛑 Deteniendo AMROIS Local Stack..."

# Detener servicios de la aplicación
echo "🔧 Deteniendo API Principal de AMROIS..."
pkill -f "npm run dev" 2>/dev/null

echo "🤖 Deteniendo API de Agents..."
pkill -f "src/agents/index.js" 2>/dev/null

echo "🔄 Deteniendo n8n..."
pkill -f "n8n start" 2>/dev/null

echo "🖥️ Deteniendo Dashboard..."
pkill -f "serve -s dist" 2>/dev/null

# Detener Ollama (opcional - comentar si quieres mantenerlo corriendo)
echo "🤖 Deteniendo Ollama..."
pkill -f "ollama serve" 2>/dev/null

# Opcional: Detener también PostgreSQL y Redis
read -p "¿Detener también PostgreSQL y Redis? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️ Deteniendo PostgreSQL..."
    brew services stop postgresql@16 2>/dev/null
    
    echo "🔄 Deteniendo Redis..."
    brew services stop redis 2>/dev/null
else
    echo "💡 PostgreSQL y Redis siguen corriendo para下次 inicio rápido"
fi

echo "✅ Sistema detenido"