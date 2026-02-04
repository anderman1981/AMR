#!/bin/bash

# start-tunnels.sh - Start complete ngrok tunnels for AMROIS

echo "🚀 Iniciando Túneles de AMROIS..."
echo "==================================="

# Check for npx
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx no está instalado. Instala Node.js primero."
    exit 1
fi

# Check for authtoken (optional but recommended for multiple tunnels)
echo "ℹ️  Nota: Para correr 3 túneles simultáneos, necesitas una cuenta gratuita de ngrok."
echo "    Si falla, ejecuta: npx ngrok config add-authtoken <TU_TOKEN>"
echo ""

# Start tunnels using the config file
echo "🌐 Exponiendo:"
echo "   - Dashboard: http://localhost:3465"
echo "   - API:       http://localhost:3464"
echo "   - Agentes:   http://localhost:12000"
echo ""
echo "⏳ Iniciando ngrok..."

# Run ngrok with the config file
npx ngrok start --all --config=ngrok.yml
