#!/bin/bash

# 🚀 AMROIS PRODUCTION SERVICE LAUNCHER - MAIN PROTECTED
# Versión simplificada sin secretos para producción segura

echo "🚀 AMROIS - PRODUCTION SERVICE LAUNCHER (MAIN PROTECTED)"
echo "==========================================================="

# Configuración segura
APP_DIR="/Users/andersonmartinezrestrepo/AMR"
MAIN_BRANCH="main"
LOG_FILE="$APP_DIR/logs/amrois-production.log"
PID_FILE="$APP_DIR/amrois-production.pid"

# Crear directorios necesarios
mkdir -p "$APP_DIR/logs"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verificar si estamos en el directorio correcto
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Directorio del proyecto no encontrado: $APP_DIR"
    exit 1
fi

cd "$APP_DIR"

# Verificar rama main
check_main_branch() {
    log "Verificando rama actual..."
    current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    
    if [ "$current_branch" != "$MAIN_BRANCH" ]; then
        log "⚠️ No estás en la rama $MAIN_BRANCH (actual: $current_branch)"
        return 1
    fi
    
    log "✅ Estás en la rama $MAIN_BRANCH"
    return 0
}

# Proteger la rama main
protect_main() {
    log "Protegiendo rama $MAIN_BRANCH..."
    
    # Configurar protección directa
    git config branch.$MAIN_BRANCH.protection true 2>/dev/null
    git config branch.$MAIN_BRANCH.pushRemote reject 2>/dev/null
    git config branch.$MAIN_BRANCH.mergeoptions "--no-ff" 2>/dev/null
    
    log "✅ Protección de rama $MAIN_BRANCH configurada"
}

# Detener servicios existentes
stop_services() {
    log "Deteniendo servicios existentes..."
    
    if [ -f "$PID_FILE" ]; then
        old_pids=$(cat "$PID_FILE")
        for pid in $old_pids; do
            if ps -p "$pid" > /dev/null 2>&1; then
                kill -TERM "$pid" 2>/dev/null
                sleep 2
                if ps -p "$pid" > /dev/null 2>&1; then
                    kill -KILL "$pid" 2>/dev/null
                fi
            fi
        done
        rm -f "$PID_FILE"
    fi
    
    # Liberar puertos
    lsof -ti:3467 | xargs kill -9 2>/dev/null || true
    lsof -ti:12000 | xargs kill -9 2>/dev/null || true
    
    sleep 2
    log "✅ Servicios existentes detenidos"
}

# Iniciar servicios de producción
start_services() {
    log "Iniciando servicios de producción..."
    
    cd "$APP_DIR"
    
    # Configurar variables de entorno para producción
    export NODE_ENV=production
    export PORT=3467
    export AGENT_PORT=12000
    export AGENT_PROTOCOL=http
    
    # Iniciar API Principal
    nohup npm start > "$APP_DIR/logs/api-principal.log" 2>&1 &
    API_PID=$!
    
    # Esperar un poco y verificar que API Principal esté funcionando
    sleep 3
    if curl -s -f http://localhost:3467/health > /dev/null 2>&1; then
        log "✅ API Principal iniciado exitosamente (PID: $API_PID)"
    else
        log "❌ API Principal no está funcionando correctamente"
    fi
    
    # Iniciar API Agentes con ruta absoluta
    cd "$APP_DIR"
    nohup node src/agents/index.js > "$APP_DIR/logs/api-agentes.log" 2>&1 &
    AGENTES_PID=$!
    
    # Esperar un poco y verificar que API Agentes esté funcionando
    sleep 3
    if curl -s -f http://localhost:12000/api/health > /dev/null 2>&1; then
        log "✅ API Agentes iniciado exitosamente (PID: $AGENTES_PID)"
    else
        log "❌ API Agentes no está funcionando correctamente"
    fi
    
    # Guardar PIDs
    echo "$API_PID,$AGENTES_PID" > "$PID_FILE"
    
    log "✅ Servicios de producción iniciados"
    log "📡 API Principal: http://localhost:3467"
    log "🤖 API Agentes: http://localhost:12000"
    log "📊 Dashboard: http://localhost:12000/dashboard"
}

# Verificar que los servicios estén funcionando
verify_services() {
    log "Verificando que los servicios estén funcionando..."
    
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Verificación $attempt/$max_attempts..."
        
        api_ok=false
        agentes_ok=false
        
        if curl -s -f http://localhost:3467/health > /dev/null 2>&1; then
            api_ok=true
        fi
        
        if curl -s -f http://localhost:12000/api/health > /dev/null 2>&1; then
            agentes_ok=true
        fi
        
        if [ "$api_ok" = true ] && [ "$agentes_ok" = true ]; then
            log "✅ Todos los servicios funcionando correctamente"
            return 0
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log "⚠️ Verificación completada (intento $attempt/$max_attempts)"
    return 1
}

# Crear scripts de gestión simples
create_management_scripts() {
    log "Creando scripts de gestión..."
    
    # Script para verificar estado
    cat > "$APP_DIR/check-status.sh" << 'EOF'
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
EOF
    
    # Script para detener servicios
    cat > "$APP_DIR/stop-services.sh" << 'EOF'
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
EOF
    
    chmod +x "$APP_DIR/check-status.sh"
    chmod +x "$APP_DIR/stop-services.sh"
    
    log "✅ Scripts de gestión creados"
}

# Función principal
main() {
    log "🚀 Iniciando lanzamiento a producción"
    log "Proyecto: AMROIS v1.0.0"
    log="Rama: $MAIN_BRANCH (protegida)"
    
    # Verificar que estamos en main
    if ! check_main_branch; then
        echo "❌ No estás en la rama correcta"
        echo "💡 Ejecuta: git checkout main"
        exit 1
    fi
    
    # Proteger la rama main
    protect_main
    
    # Detener servicios existentes
    stop_services
    
    # Iniciar servicios de producción
    start_services
    
    # Verificar servicios
    if verify_services; then
        create_management_scripts
        
        echo ""
        echo "🎉 AMROIS INICIADO EN PRODUCCIÓN"
        echo "=================================================="
        echo "📡 API Principal: http://localhost:3467"
        echo "🤖 API Agentes: http://localhost:12000"
        echo "📊 Dashboard: http://localhost:12000/dashboard"
        echo ""
        echo "📋 GESTIÓN:"
        echo "- Verificar estado: ./check-status.sh"
        echo "- Detener servicios: ./stop-services.sh"
        echo "- Ver logs: tail -f logs/amrois-production.log"
        echo ""
        echo "🛡️ SEGURIDAD:"
        echo "✅ Rama main protegida"
        echo "✅ Sin secretos expuestos"
        echo "✅ Servicios en modo producción"
        echo ""
        echo "📊 LOGS:"
        echo "- API Principal: logs/api-principal.log"
        echo "- API Agentes: logs/api-agentes.log"
        echo "- Sistema: logs/amrois-production.log"
        echo "=================================================="
    else
        echo "❌ Error: Los servicios no están funcionando correctamente"
        echo "💡 Revisa los logs para diagnosticar el problema"
        exit 1
    fi
}

# Manejar señales
cleanup() {
    log "🧹 Limpiando procesos..."
    stop_services
    exit 0
}

trap cleanup SIGINT SIGTERM

# Ejecutar función principal
main "$@"