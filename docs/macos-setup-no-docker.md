# AMROIS - Configuración para Desarrollo Local en macOS (Sin Docker)

## 🎯 Visión General

Configuración optimizada para desarrollo local en macOS **sin usar Docker**:
- **PostgreSQL** instalado localmente
- **Redis** instalado localmente  
- **SQLite** como alternativa ligera
- **n8n** para workflows y automatización
- **Ollama** ejecutándose nativamente en macOS
- **API Principal** en puerto 4123
- **API Agents** en puerto 12000

## 📋 Requisitos Previos

```bash
# macOS Monterey (12+) o superior
# 8GB+ RAM recomendado
# 20GB+ espacio en disco
```

## 🚀 Instalación Automática

Ejecuta el script de instalación sin Docker:

```bash
./install-macos-no-docker.sh
```

Este script instala:
- ✅ Homebrew (si no está presente)
- ✅ Node.js 18+
- ✅ PostgreSQL local
- ✅ Redis local
- ✅ Ollama + modelo Llama3
- ✅ n8n globalmente
- ✅ Dependencias del proyecto
- ✅ Construye el dashboard

## 🛠️ Inicio Manual

### 1. Instalar Dependencias

```bash
# Con Homebrew
brew install node postgresql@16 redis ollama

# Iniciar servicios del sistema
brew services start postgresql@16
brew services start redis

# Descargar modelo Llama3
ollama pull llama3

# Instalar n8n globalmente
npm install -g n8n

# Instalar dependencias del proyecto
npm install

# Dashboard
cd dashboard && npm install && npm run build && cd ..

# Crear directorios
mkdir -p data/{logs,uploads,books}
```

### 2. Configurar Base de Datos PostgreSQL

```bash
# Crear usuario y base de datos
createuser -s amrois
createdb -O amrois amrois_local
```

### 3. Iniciar Servicios

```bash
# Inicio completo
./start-macos-no-docker.sh

# O inicio rápido con opciones
./quick-start.sh
```

## 🌐 Accesos Locales

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Dashboard | http://localhost:346721 | Interfaz principal React |
| API Principal | http://localhost:4123 | Backend Node.js |
| API Agents | http://localhost:12000 | API de gestión de agentes |
| n8n | http://localhost:5678 | Workflow automation |
| Ollama API | http://localhost:11434 | LLM local |
| PostgreSQL | localhost:5432 | Base de datos |
| Redis | localhost:6379 | Cache y colas |

## 📁 Estructura de Archivos

```
AMR/
├── install-macos-no-docker.sh   # Script instalación sin Docker
├── start-macos-no-docker.sh     # Script inicio completo
├── quick-start.sh               # Script inicio rápido con opciones
├── stop-macos-no-docker.sh      # Script detención
├── .env.local                   # Variables de entorno local
├── package.json                 # Scripts adicionales para agents
├── data/                        # Datos locales
│   ├── amrois.db               # SQLite DB (opcional)
│   ├── logs/                   # Logs
│   └── uploads/                # Archivos subidos
├── books/                       # Biblioteca local
├── src/                         # Código fuente
│   ├── agents/                  # API de Agents (puerto 12000)
│   └── config/                 # Configuración
└── dashboard/                   # Frontend React
```

## ⚙️ Configuración

### Base de Datos

**PostgreSQL (recomendado sin Docker):**
```bash
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amrois_local
DB_USER=amrois
DB_PASSWORD=local_password
```

**SQLite (alternativa):**
```bash
DB_TYPE=sqlite
DB_PATH=./data/amrois.db
```

### LLM Configuration

```bash
# Ollama local (recomendado)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3

# OpenAI (opcional)
OPENAI_API_KEY=sk-your-key

# Anthropic (opcional)
ANTHROPIC_API_KEY=sk-ant-your-key
```

## 🔧 Desarrollo

### Scripts Disponibles

#### Sin Docker:
```bash
# Inicio completo
./start-macos-no-docker.sh

# Inicio rápido con opciones
./quick-start.sh

# Detener todo
./stop-macos-no-docker.sh

# Verificar API Agents
npm run check-api

# Ver logs
tail -f data/logs/app.log
```

#### Comunes:
```bash
# Reconstruir dashboard
cd dashboard && npm run build

# Resetear base de datos
dropdb amrois_local && createdb -O amrois amrois_local
```

### Flujo de Trabajo

1. **Desarrollo de API Principal**: `npm run dev` (puerto 4123)
2. **Desarrollo de API Agents**: `npm run dev:agents` (puerto 12000)
3. **Desarrollo Frontend**: `cd dashboard && npm run dev`
4. **Workflows n8n**: http://localhost:5678
5. **Testing LLM**: `curl http://localhost:11434/api/generate`

### Verificación de Servicios

El script de inicio muestra en tiempo real:

```bash
📊 Estado de los Servicios:
========================
✅ API Principal activa en puerto 4123
✅ API Agents activa en puerto 12000
✅ Dashboard activo en puerto 3000
✅ n8n activo en puerto 5678
✅ Ollama activo en puerto 11434
✅ PostgreSQL activo en puerto 5432
✅ Redis activo en puerto 6379
========================
```

### Verificación Rápida

```bash
# Verificar API Principal
curl http://localhost:4123/health

# Verificar API Agents
npm run check-api
# O manualmente:
curl http://localhost:12000/api/health

# Verificar Ollama
curl http://localhost:11434/api/tags

# Verificar PostgreSQL
psql -h localhost -U amrois -d amrois_local

# Verificar Redis
redis-cli ping
```

## 🐛 Troubleshooting

### Puerto 4123 ocupado
```bash
# Ver qué usa el puerto
lsof -i :4123

# Matar proceso
kill -9 <PID>
```

### Puerto 12000 ocupado
```bash
# Ver qué usa el puerto
lsof -i :12000

# Matar proceso
kill -9 <PID>
```

### PostgreSQL no inicia
```bash
# Reiniciar PostgreSQL
brew services restart postgresql@16

# Verificar logs
tail -f /opt/homebrew/var/log/postgres.log
```

### Redis no inicia
```bash
# Reiniciar Redis
brew services restart redis

# Verificar configuración
redis-cli ping
```

### n8n no inicia
```bash
# Reinstalar n8n
npm uninstall -g n8n
npm install -g n8n

# Limpiar configuración
rm -rf ~/.n8n
```

### Base de datos corrupta
```bash
# Resetear PostgreSQL
dropdb amrois_local && createdb -O amrois amrois_local

# Resetear SQLite
rm data/amrois.db
```

## 📊 Monitorización

### Health Checks

```bash
# API Principal
curl http://localhost:4123/health

# API Agents
curl http://localhost:12000/api/health

# n8n
curl http://localhost:5678

# Ollama
curl http://localhost:11434/api/tags

# PostgreSQL
pg_isready -h localhost -p 5432 -U amrois

# Redis
redis-cli ping
```

### Logs

```bash
# API logs
tail -f data/logs/app.log

# PostgreSQL logs
tail -f /opt/homebrew/var/log/postgres.log

# Redis logs (no guarda logs por defecto)

# n8n logs (están en la terminal donde se inició)
```

## 🚀 Deploy a Producción

Para pasar de desarrollo local a producción:

1. Cambiar variables de entorno en `.env`
2. Usar `docker-compose.yml` (producción con Docker)
3. Configurar dominios y HTTPS
4. Ajustar límites de recursos
5. Configurar backups automatizados

## 🤝 Contribuir

1. Crear feature branch desde `feature/macos-local-stack`
2. Hacer cambios y probar con `./quick-start.sh`
3. Asegurar que todas las APIs inicien correctamente
4. Verificar con `npm run check-api`
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

---

**AMROIS macOS Local Stack (Sin Docker)** - Desarrollo optimizado sin contenedores