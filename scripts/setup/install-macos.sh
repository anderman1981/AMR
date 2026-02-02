#!/bin/bash

# Script de instalación para macOS - AMROIS Local Stack
echo "🚀 Instalando AMROIS para desarrollo local en macOS..."

# Verificar que estamos en macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Este script es solo para macOS"
    exit 1
fi

# Verificar Homebrew
if ! command -v brew &> /dev/null; then
    echo "📦 Instalando Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Instalando Node.js..."
    brew install node
fi

# Verificar Docker Desktop
if ! command -v docker &> /dev/null; then
    echo "📦 Instalando Docker Desktop..."
    brew install --cask docker
    echo "⚠️  Por favor inicia Docker Desktop manualmente"
fi

# Instalar Ollama
if ! command -v ollama &> /dev/null; then
    echo "🤖 Instalando Ollama..."
    brew install ollama
fi

# Instalar n8n globalmente
if ! command -v n8n &> /dev/null; then
    echo "🔄 Instalando n8n..."
    npm install -g n8n
fi

# Instalar dependencias del proyecto
echo "📚 Instalando dependencias del proyecto..."
npm install

# Instalar dependencias del dashboard
echo "📚 Instalando dependencias del dashboard..."
cd dashboard && npm install && cd ..

# Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p data/{logs,uploads,books}
mkdir -p books

# Descargar modelo Llama3 para Ollama
echo "🤖 Descargando modelo Llama3..."
ollama pull llama3

# Construir dashboard
echo "🏗️ Construyendo dashboard..."
cd dashboard && npm run build && cd ..

# Copiar configuración local
cp .env.local .env

echo "✅ Instalación completada!"
echo ""
echo "🎯 Para iniciar el sistema:"
echo "1. Inicia Docker Desktop"
echo "2. Ejecuta: ./start-macos.sh"
echo ""
echo "🌐 Accesos disponibles:"
echo "- Dashboard: http://localhost:80"
echo "- API: http://localhost:4123"
echo "- n8n: http://localhost:5678"
echo "- Ollama API: http://localhost:11434"