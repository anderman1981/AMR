# AMROIS - Configuración para Desarrollo Local en macOS

## 🎯 Visión General

Configuración optimizada para desarrollo local en macOS usando:
- **SQLite** como base de datos ligera (o PostgreSQL opcional)
- **Nginx** como reverse proxy
- **n8n** para workflows y automatización
- **Ollama** ejecutándose nativamente en macOS
- **Docker** solo para servicios auxiliares

## 📋 Requisitos Previos

```bash
# macOS Monterey (12+) o superior
# 8GB+ RAM recomendado
# 20GB+ espacio en disco
```

## 🚀 Instalación Automática

### Opción 1: Con Docker (recomendado para producción)
```bash
./install-macos.sh
```

### Opción 2: Sin Docker (recomendado para desarrollo)
```bash
./install-macos-no-docker.sh
```

Este script instala:
- ✅ Homebrew (si no está presente)
- ✅ Node.js 18+
- ✅ Docker Desktop
- ✅ Ollama + modelo Llama3
- ✅ n8n globalmente
- ✅ Dependencias del proyecto
- ✅ Construye el dashboard

## 🛠️ Inicio Manual

### 1. Instalar Dependencias

```bash
# Con Homebrew
brew install node docker ollama

# Descargar modelo Llama3
ollama pull llama3

# Instalar n8n globalmente
npm install -g n8n
```

### 2. Preparar Proyecto

```bash
# Instalar dependencias
npm install

# Dashboard
cd dashboard && npm install && npm run build && cd ..

# Crear directorios
mkdir -p data/{logs,uploads,books}

# Copiar configuración local
cp .env.local .env
```

### 3. Iniciar Servicios

#### Con Docker:
```bash
./start-macos.sh
```

#### Sin Docker:
```bash
./start-macos-no-docker.sh
```

#### Inicio Rápido (con opciones):
```bash
./quick-start.sh
```

O iniciar manualmente:

```bash
# 1. Iniciar Ollama (en terminal separada)
ollama serve

# 2. Iniciar Docker services (nginx + redis)
docker-compose -f docker-compose.macos.yml up -d

# 3. Iniciar n8n (en terminal separada)
n8n start --port 5678

# 4. Iniciar API de AMROIS
npm run dev
```

## 🌐 Accesos Locales

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Dashboard | http://localhost:3467 | Interfaz principal React (sin Docker) |
| Dashboard | http://localhost:80 | Interfaz principal React (con Docker) |
| API Principal | http://localhost:4123 | Backend Node.js |
| API Agents | http://localhost:12000 | API de gestión de agentes |
| n8n | http://localhost:5678 | Workflow automation |
| Ollama API | http://localhost:11434 | LLM local |
| PostgreSQL | localhost:5432 | Base de datos |
| Redis | localhost:6379 | Cache y colas |

## 📁 Estructura de Archivos

```
AMR/
├── docker-compose.macos.yml    # Config Docker para macOS
├── nginx-local.conf            # Config Nginx local
├── .env.local                  # Variables de entorno local
├── install-macos.sh            # Script instalación
├── start-macos.sh              # Script inicio
├── stop-macos.sh               # Script detención
├── data/                       # Datos locales
│   ├── amrois.db              # SQLite DB
│   ├── logs/                  # Logs
│   └── uploads/               # Archivos subidos
└── books/                      # Biblioteca local
```

## ⚙️ Configuración

### Base de Datos

**SQLite (recomendado para desarrollo):**
```bash
DB_TYPE=sqlite
DB_PATH=./data/amrois.db
```

**PostgreSQL (opcional):**
```bash
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amrois_local
DB_USER=amrois
DB_PASSWORD=local_password
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

#### Con Docker:
```bash
# Iniciar todo
./start-macos.sh

# Detener todo
./stop-macos.sh
```

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

1. **Desarrollo de API**: `npm run dev`
2. **Desarrollo Frontend**: `cd dashboard && npm run dev`
3. **Workflows n8n**: http://localhost:5678
4. **Testing LLM**: `curl http://localhost:11434/api/generate`

## 🐛 Troubleshooting

### Docker Desktop no inicia
```bash
# Reiniciar Docker Desktop
sudo pkill -f Docker && open /Applications/Docker.app
```

### Puerto 80 ocupado
```bash
# Ver qué usa el puerto
sudo lsof -i :80

# Cambiar puerto en nginx-local.conf
listen 8080;
```

### Ollama no responde
```bash
# Verificar Ollama
ollama list
ollama serve
```

### n8n no inicia
```bash
# Reinstalar n8n
npm uninstall -g n8n
npm install -g n8n
```

### Base de datos SQLite corrupta
```bash
# Eliminar y recrear
rm data/amrois.db
mkdir -p data
```

## 📊 Monitorización

### Health Checks

```bash
# API Health
curl http://localhost:4123/health

# Nginx Status
curl http://localhost/health

# Ollama Status
curl http://localhost:11434/api/tags
```

### Logs

```bash
# API logs
tail -f data/logs/app.log

# Docker logs
docker-compose -f docker-compose.macos.yml logs -f

# n8n logs (están en la terminal donde se inició)
```

## 🚀 Deploy a Producción

Para pasar de desarrollo local a producción:

1. Cambiar `DB_TYPE=postgres` en `.env`
2. Usar `docker-compose.yml` (producción)
3. Configurar dominios y HTTPS
4. Ajustar límites de recursos
5. Configurar backups automatizados

## 🤝 Contribuir

1. Crear feature branch desde `feature/macos-local-stack`
2. Hacer cambios y probar con `./start-macos.sh`
3. Asegurar que todos los servicios inicien correctamente
4. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

---

**AMROIS macOS Local Stack** - Desarrollo optimizado para macOS