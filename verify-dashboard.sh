#!/bin/bash

# 🎯 AMROIS DASHBOARD VERIFIER
# Verifica el dashboard y los libros en el puerto 4123

echo "🎯 AMROIS - DASHBOARD VERIFIER"
echo "=================================================="

# Configuración
API_PRINCIPAL="http://localhost:3467"
DASHBOARD_4123="http://localhost:4123"
API_AGENTES="http://localhost:12000"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar API Principal
check_api_principal() {
    log "Verificando API Principal en puerto 3467..."
    
    if curl -s -f "$API_PRINCIPAL/health" > /dev/null 2>&1; then
        health_data=$(curl -s "$API_PRINCIPAL/health" 2>/dev/null)
        log "✅ API Principal: FUNCIONANDO"
        echo "   📡 Health: $health_data"
        return 0
    else
        log "❌ API Principal: NO RESPONDE"
        return 1
    fi
}

# Verificar API Agentes
check_api_agentes() {
    log "Verificando API Agentes en puerto 12000..."
    
    if curl -s -f "$API_AGENTES/api/health" > /dev/null 2>&1; then
        health_data=$(curl -s "$API_AGENTES/api/health" 2>/dev/null)
        agents_data=$(curl -s "$API_AGENTES/api/agents" 2>/dev/null)
        log "✅ API Agentes: FUNCIONANDO"
        echo "   🤖 Health: $health_data"
        
        if echo "$agents_data" | jq -e '.data.agents' 2>/dev/null > /dev/null; then
            active_agents=$(echo "$agents_data" | jq -r '.data.agents | length')
            echo "   📊 Agentes Activos: $active_agents"
        fi
        return 0
    else
        log "❌ API Agentes: NO RESPONDE"
        return 1
    fi
}

# Verificar Dashboard en puerto 4123
check_dashboard_4123() {
    log "Verificando Dashboard en puerto 4123..."
    
    if curl -s -f "$DASHBOARD_4123" > /dev/null 2>&1; then
        log "✅ Dashboard 4123: FUNCIONANDO"
        
        # Verificar contenido del dashboard
        dashboard_content=$(curl -s "$DASHBOARD_4123" 2>/dev/null)
        
        # Buscar indicadores de funcionalidad
        if echo "$dashboard_content" | grep -q "AMROIS" 2>/dev/null; then
            log "🎯 Contenido AMROIS detectado"
        fi
        
        if echo "$dashboard_content" | grep -q "dashboard\|Dashboard" 2>/dev/null; then
            log "📊 Interfaz de dashboard encontrada"
        fi
        
        return 0
    else
        log "❌ Dashboard 4123: NO RESPONDE"
        
        # Verificar si hay algo en otros puertos
        log "🔍 Buscando dashboard en otros puertos..."
        for port in 3000 3001 4124 4125 8080 8081; do
            if curl -s -f "http://localhost:$port" 2>/dev/null; then
                content=$(curl -s "http://localhost:$port" 2>/dev/null)
                if echo "$content" | grep -q -i "AMROIS\|dashboard\|books" 2>/dev/null; then
                    log "📍 Dashboard encontrado en puerto $port"
                fi
            fi
        done
        
        return 1
    fi
}

# Verificar libros catalogados
check_books_catalog() {
    log "Verificando catálogo de libros..."
    
    # Verificar desde API Principal
    if curl -s -f "$API_PRINCIPAL/api/books" > /dev/null 2>&1; then
        books_data=$(curl -s "$API_PRINCIPAL/api/books" 2>/dev/null)
        
        if echo "$books_data" | jq -e 'length' 2>/dev/null > /dev/null; then
            book_count=$(echo "$books_data" | jq -r 'length')
            log "✅ Libros API Principal: $book_count libros encontrados"
        else
            log "⚠️ Libros API Principal: Formato inesperado"
        fi
    else
        log "⚠️ Libros API Principal: Endpoint no disponible"
    fi
    
    # Verificar catálogo JSON local
    if [ -f "data/metadata/books-catalog.json" ]; then
        local_books=$(jq -r '.books | length' data/metadata/books-catalog.json 2>/dev/null || echo "N/A")
        log "📚 Libros locales: $local_books libros catalogados"
    fi
    
    # Verificar desde agentes si está disponible
    if curl -s -f "$API_AGENTES/api/health" > /dev/null 2>&1; then
        book_scan=$(curl -s -X POST "$API_AGENTES/api/agents/book-scanner/execute" \
            -H "Content-Type: application/json" \
            -d '{"task": "scan", "context": {"directory": "./data/books"}}' 2>/dev/null)
        
        if echo "$book_scan" | jq -e '.success' 2>/dev/null > /dev/null; then
            scan_result=$(echo "$book_scan" | jq -r '.data.result.data.found // 0')
            log "📚 Libros escaneados: $scan_result encontrados"
        fi
    fi
}

# Mostrar resumen visual
show_visual_summary() {
    echo ""
    echo "📊 RESUMEN VISUAL DEL SISTEMA AMROIS"
    echo "=================================================="
    
    # API Principal
    if curl -s -f "$API_PRINCIPAL/health" > /dev/null 2>&1; then
        echo "🟢 API Principal:  ✅ FUNCIONANDO"
        echo "   📡 Endpoint: $API_PRINCIPAL/health"
        echo "   🔗 URL: $API_PRINCIPAL"
    else
        echo "🔴 API Principal: ❌ INACTIVO"
    fi
    
    # API Agentes
    if curl -s -f "$API_AGENTES/api/health" > /dev/null 2>&1; then
        echo "🟢 API Agentes: ✅ FUNCIONANDO"
        echo "   🤖 Health: $API_AGENTES/api/health"
        echo "   🔗 URL: $API_AGENTES"
    else
        echo "🔴 API Agentes: ❌ INACTIVO"
    fi
    
    # Dashboard
    if curl -s -f "$DASHBOARD_4123" > /dev/null 2>&1; then
        echo "🟢 Dashboard 4123: ✅ FUNCIONANDO"
        echo "   📊 URL: $DASHBOARD_4123"
    else
        echo "🔴 Dashboard 4123: ❌ INACTIVO"
        
        # Buscar en otros puertos
        found_dashboard=false
        for port in 3000 3001 4124 4125 8080 8081; do
            if curl -s -f "http://localhost:$port" 2>/dev/null; then
                content=$(curl -s "http://localhost:$port" 2>/dev/null)
                if echo "$content" | grep -q -i "AMROIS\|dashboard\|books" 2>/dev/null; then
                    echo "🟢 Dashboard encontrado: ✅ PUERTO $port"
                    found_dashboard=true
                    break
                fi
            fi
        done
        
        if [ "$found_dashboard" = false ]; then
            echo "🔴 Dashboard: ❌ NO ENCONTRADO EN NINGÚN PUERTO"
        fi
    fi
    
    # Libros
    if [ -f "data/metadata/books-catalog.json" ]; then
        book_count=$(jq -r '.books | length' data/metadata/books-catalog.json 2>/dev/null || echo "0")
        echo "📚 Catálogo de Libros: ✅ $book_count libros"
    else
        echo "🔴 Catálogo de Libros: ❌ NO DISPONIBLE"
    fi
    
    echo ""
    echo "🔗 ENDPOINTS DE ACCESO:"
    echo "- API Principal: $API_PRINCIPAL"
    echo "- API Agentes: $API_AGENTES"
    echo "- Dashboard: $DASHBOARD_4123"
    echo ""
    echo "📊 MÉTRICAS:"
    echo "- Total libros catalogados: $(jq -r '.books | length' data/metadata/books-catalog.json 2>/dev/null || echo "N/A")"
    echo "- APIs funcionando: $(curl -s "$API_PRINCIPAL/health" > /dev/null && curl -s "$API_AGENTES/api/health" > /dev/null && echo "2/2" || echo "0/2")"
    echo "- Dashboard activo: $(curl -s "$DASHBOARD_4123" > /dev/null && echo "1/1" || echo "0/1")"
}

# Generar informe HTML
generate_html_report() {
    local report_file="amrois-dashboard-report.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 AMROIS Dashboard Status Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 2.5em;
            margin: 0;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .status-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            border-left: 5px solid #ddd;
            transition: all 0.3s ease;
        }
        .status-card.active {
            border-left-color: #10b981;
            background: #f0fdf4;
        }
        .status-card.inactive {
            border-left-color: #ef4444;
            background: #fef2f2;
        }
        .status-icon {
            font-size: 3em;
            margin-bottom: 10px;
        }
        .status-title {
            font-size: 1.2em;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .status-url {
            color: #666;
            font-family: monospace;
            background: #f5f5f5;
            padding: 5px 10px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 10px;
        }
        .metrics {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .metric:last-child {
            border-bottom: none;
        }
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 AMROIS Dashboard Status</h1>
            <p>Sistema de Monitoreo de Componentes</p>
        </div>

        <div class="status-grid">
            <div class="status-card $(curl -s "$API_PRINCIPAL/health" > /dev/null && echo "active" || echo "inactive")">
                <div class="status-icon">🌐</div>
                <div class="status-title">API Principal</div>
                <div class="status-url">$API_PRINCIPAL</div>
            </div>
            
            <div class="status-card $(curl -s "$API_AGENTES/api/health" > /dev/null && echo "active" || echo "inactive")">
                <div class="status-icon">🤖</div>
                <div class="status-title">API Agentes</div>
                <div class="status-url">$API_AGENTES</div>
            </div>
            
            <div class="status-card $(curl -s "$DASHBOARD_4123" > /dev/null && echo "active" || echo "inactive")">
                <div class="status-icon">📊</div>
                <div class="status-title">Dashboard</div>
                <div class="status-url">$DASHBOARD_4123</div>
            </div>
            
            <div class="status-card active">
                <div class="status-icon">📚</div>
                <div class="status-title">Catálogo de Libros</div>
                <div class="status-url">$(jq -r '.books | length' data/metadata/books-catalog.json 2>/dev/null || echo "0") libros</div>
            </div>
        </div>

        <div class="metrics">
            <h3>📈 Métricas del Sistema</h3>
            <div class="metric">
                <span>Libros Catalogados:</span>
                <span>$(jq -r '.books | length' data/metadata/books-catalog.json 2>/dev/null || echo "0")</span>
            </div>
            <div class="metric">
                <span>APIs Funcionando:</span>
                <span>$(curl -s "$API_PRINCIPAL/health" > /dev/null && curl -s "$API_AGENTES/api/health" > /dev/null && echo "2/2" || echo "0/2")</span>
            </div>
            <div class="metric">
                <span>Componentes Activos:</span>
                <span>$(curl -s "$DASHBOARD_4123" > /dev/null && curl -s "$API_PRINCIPAL/health" > /dev/null && curl -s "$API_AGENTES/api/health" > /dev/null && echo "3/3" || echo "2/3")</span>
            </div>
        </div>

        <div class="timestamp">
            Última actualización: $(date '+%Y-%m-%d %H:%M:%S')
        </div>
    </div>
</body>
</html>
EOF
    
    log "✅ Reporte HTML generado: $report_file"
    log "📂 Abriendo reporte en navegador..."
    
    # Abrir en navegador
    if command -v open > /dev/null 2>&1; then
        open "$report_file"
    elif command -v xdg-open > /dev/null 2>&1; then
        xdg-open "$report_file"
    elif command -v start > /dev/null 2>&1; then
        start "$report_file"
    else
        log "📂 Para ver el reporte abre: $report_file"
    fi
}

# Función principal
main() {
    echo "🎯 AMROIS - DASHBOARD VERIFIER"
    echo "=================================================="
    
    # Verificar API Principal
    check_api_principal
    
    # Verificar API Agentes
    check_api_agentes
    
    # Verificar Dashboard
    check_dashboard_4123
    
    # Verificar catálogo de libros
    check_books_catalog
    
    # Mostrar resumen visual
    show_visual_summary
    
    # Generar informe HTML
    generate_html_report
}

# Ejecutar función principal
main "$@"