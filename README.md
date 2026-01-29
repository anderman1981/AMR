# AMROIS - Sistema Maestro de Orquestación

Sistema distribuido para orquestación de agentes inteligentes con procesamiento de libros y dispositivos Windows.

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (puede usar el contenedor Docker)
- Redis (puede usar el contenedor Docker)
- Ollama (opcional, puede usar el contenedor Docker)

### Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd AMR

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar base de datos y crear tablas
npm run migrate

# 5. Iniciar con Docker
npm run docker:run

# O iniciar en modo desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
AMR/
├── src/                    # Código fuente del backend
│   ├── config/            # Configuración (base de datos, etc.)
│   ├── middleware/        # Middlewares de Express
│   ├── routes/           # Rutas de la API
│   ├── services/         # Lógica de negocio
│   └── utils/            # Utilidades
├── dashboard/            # Frontend React
├── books/               # Directorio para libros físicos
├── data/                # Datos persistentes
├── scripts/             # Scripts de utilidad
├── config/              # Archivos de configuración
└── docs/               # Documentación
```

## 🐳 Docker

### Servicios Incluidos

- **amrois-api**: Backend API (Node.js)
- **amrois-dashboard**: Frontend (React)
- **postgres**: Base de datos PostgreSQL
- **redis**: Cache y cola de mensajes
- **ollama**: Servicio LLM local
- **nginx**: Reverse proxy (opcional)

### Volumenes Importantes

```yaml
# Libros físicos (solo lectura)
- ./books:/app/books:ro

# Logs y datos
- ./data/logs:/app/logs
- ./data/uploads:/app/uploads
```

## 📚 Gestión de Libros

### Rutas de Libros Físicas

Edita `docker-compose.yml` para apuntar a tu colección de libros:

```yaml
volumes:
  - /ruta/absoluta/a/tus/libros:/app/books:ro
# O usar variable de entorno
  - ${BOOKS_HOST_PATH:-./books}:/app/books:ro
```

### Formatos Soportados

- PDF (.pdf)
- EPUB (.epub)
- MOBI (.mobi)
- TXT (.txt)
- DOCX (.docx)

### Escaneo Automático

El sistema escaneará el directorio de libros cada 3600 segundos (1 hora).

## 🔌 API Endpoints

### Dispositivos
- `POST /api/devices/register` - Registrar nuevo dispositivo
- `POST /api/devices/:id/heartbeat` - Actualizar estado
- `GET /api/devices/:id/tasks` - Obtener tareas asignadas
- `POST /api/devices/:id/report` - Reportar resultados

### Libros
- `GET /api/books` - Listar libros
- `POST /api/books/upload` - Subir libros
- `POST /api/books/scan` - Escanear directorio
- `PUT /api/books/config` - Configurar ruta

### LLM
- `POST /api/llm/generate` - Generar texto
- `POST /api/llm/chat` - Chat con LLM
- `POST /api/llm/embed` - Generar embeddings
- `GET /api/llm/providers` - Listar proveedores

### Tareas
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `POST /api/tasks/batch` - Crear batch de tareas

## 🖥️ Dashboard

Acceso: http://localhost:4124

### Funcionalidades

- **Dashboard Principal**: Estadísticas en tiempo real
- **Gestión de Libros**: Subir, escanear, procesar
- **Dispositivos**: Monitorear fleet de dispositivos
- **Tareas**: Crear y gestionar tareas
- **Configuración**: Ajustes del sistema

## 🔐 Seguridad

### HMAC Verification

Todos los dispositivos deben firmar sus peticiones con HMAC-SHA256:

```javascript
const signature = crypto
  .createHmac('sha256', deviceToken)
  .update(JSON.stringify(payload) + timestamp)
  .digest('hex')
```

Headers requeridos:
- `X-AMROIS-Signature`: Firma HMAC
- `X-AMROIS-Timestamp`: Timestamp UNIX
- `X-AMROIS-Device-ID`: ID del dispositivo

### Rate Limiting

- 100 solicitudes por minuto por dispositivo
- Protección contra replay attacks (5 minutos)

## 🤖 Agentes Inteligentes

### Tipos de Agentes

- **ContentAgent**: Generación de contenido
- **DetectorAgent**: Análisis y detección
- **LearningAgent**: Procesamiento y aprendizaje
- **ManagerAgent**: Orquestación y coordinación

### Configuración

Los agentes se configuran automáticamente desde el backend y pueden ser actualizados dinámicamente.

## 📊 Monitorización

### Métricas Disponibles

- Estado de dispositivos (online/offline/maintenance)
- Progreso de procesamiento de libros
- Rendimiento de agentes
- Uso de LLMs
- Estadísticas de tareas

### Logs

Los logs se guardan en `./data/logs` y se pueden consultar vía API.

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
npm run dev          # Modo desarrollo
npm run test         # Ejecutar pruebas
npm run lint         # Linting de código
npm run build        # Build para producción
npm run docker:build # Build Docker image
npm run migrate      # Inicializar base de datos
```

### Variables de Entorno

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amrois_system
DB_USER=amrois_user
DB_PASSWORD=secure_password

# LLM
OLLAMA_HOST=http://localhost:11434
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Books
BOOKS_PATH=/app/books
BOOKS_SCAN_INTERVAL=3600

# Security
JWT_SECRET=your_jwt_secret
DEVICE_TOKEN_SECRET=your_device_secret
```

## 🚀 Deploy en Producción

### 1. Preparar Entorno

```bash
# Crear directorios necesarios
mkdir -p books data/{logs,uploads,agents}

# Configurar permisos
chmod 755 books data
```

### 2. Configurar Variables

Editar `.env` con valores de producción.

### 3. Iniciar Servicios

```bash
docker-compose -f docker-compose.yml up -d
```

### 4. Verificar Funcionamiento

```bash
# Health check
curl http://localhost:4123/health

# Dashboard
http://localhost:4124
```

## 🤝 Contribuir

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit de cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- Documentación: `/docs`
- Issues: GitHub Issues
- Logs: `./data/logs`
- Health: `http://localhost:4123/health`

---

**AMROIS** - Sistema Maestro de Orquestación Distribuida
Versión 1.0.0