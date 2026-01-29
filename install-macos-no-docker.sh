#!/bin/bash

# Script de instalación para macOS - AMROIS sin Docker
echo "🚀 Instalando AMROIS para desarrollo local en macOS (sin Docker)..."

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

# Instalar PostgreSQL localmente (en lugar de Docker)
if ! command -v psql &> /dev/null; then
    echo "🗄️ Instalando PostgreSQL local..."
    brew install postgresql@16
    brew services start postgresql@16
    
    # Crear usuario y base de datos
    echo "🔧 Configurando PostgreSQL..."
    createuser -s amrois 2>/dev/null || true
    createdb -O amrois amrois_local 2>/dev/null || true
fi

# Instalar Redis localmente (en lugar de Docker)
if ! command -v redis-cli &> /dev/null; then
    echo "🔄 Instalando Redis local..."
    brew install redis
    brew services start redis
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

# Instalar Python para SQLite (evitar problemas de compilación)
if ! command -v python3 &> /dev/null; then
    echo "🐍 Instalando Python..."
    brew install python@3.12
fi

# Instalar dependencias del proyecto con SQLite simplificado
echo "📚 Instalando dependencias del proyecto..."

# Usar versión más simple de SQLite para Node 24
npm install sqlite3@5.1.6 --build-from-source || npm install sqlite3@5.1.6

# Instalar resto de dependencias
npm install --sqlite=./node_modules/sqlite3

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

# Copiar configuración local sin Docker
cp .env.local .env

# Instalar servidor simple para servir el frontend
npm install -g serve

echo "✅ Instalación completada!"
echo ""
echo "🎯 Para iniciar el sistema:"
echo "1. Ejecuta: ./start-macos-no-docker.sh"
echo ""
echo "🌐 Accesos disponibles:"
echo "- Dashboard: http://localhost:3467"
echo "- API: http://localhost:4123"
echo "- n8n: http://localhost:5678"
echo "- Ollama API: http://localhost:11434"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"