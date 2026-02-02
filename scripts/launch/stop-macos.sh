#!/bin/bash

# Script de detención para macOS - AMROIS Local Stack
echo "🛑 Deteniendo AMROIS Local Stack..."

# Detener servicios Docker
echo "🐳 Deteniendo servicios Docker..."
docker-compose -f docker-compose.macos.yml down

# Detener n8n
echo "🔄 Deteniendo n8n..."
pkill -f "n8n start" 2>/dev/null

# Detener API de AMROIS
echo "🔧 Deteniendo API de AMROIS..."
pkill -f "npm run dev" 2>/dev/null

# Detener Ollama (opcional - comentar si quieres mantenerlo corriendo)
echo "🤖 Deteniendo Ollama..."
pkill -f "ollama serve" 2>/dev/null

echo "✅ Sistema detenido completamente"