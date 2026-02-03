# 🏛️ ARQUITECTURA Y ESTRUCTURA DEL SISTEMA
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-001-ARQUITECTURA.md

---

## 🎯 MISIÓN Y VISIÓN

### Misión
Mantener un sistema profesional de orquestación distribuida para 50+ dispositivos Windows con integración LLM, procesamiento de libros y automatización de contenido.

### Visión
Ser el estándar de referencia para sistemas de agentes inteligentes en producción, con código mantenible, documentado y auditado.

---

## 🌍 ENTORNOS DEFINIDOS

| Entorno | Rol | Dashboard | API | Ruta Local |
|---------|-----|-----------|-----|------------|
| **MAIN** | Producción | `http://localhost:3466` | `http://localhost:3467` | `/Users/andersonmartinezrestrepo/AMR/` |
| **DEV** | Desarrollo | `http://localhost:3465` | `http://localhost:3464` | `/Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/` |
| **ADMIN** | Gestión Local | `http://localhost:3463` | - | Solo Local |

### Reglas de Entornos
- **MAIN**: Solo código production-ready,严禁 commits directos
- **DEV**: Integración continua, puede tener inestabilidades controladas
- **ADMIN**: Solo para gestión local, nunca expuesto públicamente

---

## 🔧 PUERTOS DEL SISTEMA (INMUTABLES)

| Servicio | Puerto | Descripción | Reglas |
|----------|--------|-------------|--------|
| Dashboard Prod | **3466** | Interfaz producción estable | No cambiar, nunca usar puerto 0 |
| Dashboard Dev | **3465** | Interfaz desarrollo y pruebas | Auto-assign está prohibido |
| API Backend | **3467** | API central para Books y Tasks | Protegido con JWT |
| Agent Server | **12000** | Servicio AI Agents (Ollama/LLM) | Solo tráfico interno |
| Agent Worker | **12001** | Proceso worker en background | Sin exposición externa |

### Reglas de Puertos
1. **Nunca random**: No usar port 0 o dejar que OS asigne puertos aleatorios
2. **No conflicts**: Si un puerto está ocupado, matar el proceso que lo usa
3. **Hardcoded Defaults**: Config files deben default a estos valores

---

## 📁 ESTRUCTURA DE DIRECTORIOS

```
AMR/
├── src/                           # Backend Node.js
│   ├── agents/                   # Clases de agentes inteligentes
│   │   ├── BaseAgent.js          # Clase base común
│   │   ├── ManagerAgent.js       # Orquestador principal
│   │   ├── DetectorAgent.js      # Scanner de mercado
│   │   ├── ContentAgent.js       # Generador creativo
│   │   ├── InstagramAgent.js      # Publicador
│   │   └── LearningAgent.js      # Inteligencia
│   ├── api/                      # Rutas REST
│   │   ├── index.js              # Router principal
│   │   ├── agents.routes.js      # Endpoints de agentes
│   │   ├── books.routes.js       # Gestión de libros
│   │   ├── llm.routes.js         # LLM integration
│   │   └── tasks.routes.js       # Gestión de tareas
│   ├── services/                 # Lógica de negocio
│   │   ├── LLMManager.js         # Abstracción LLM
│   │   ├── AgentOrchestrator.js  # Coordinación
│   │   ├── BookService.js        # Procesamiento libros
│   │   └── DeviceService.js      # Gestión dispositivos
│   ├── models/                   # Modelos de datos
│   │   ├── Agent.js              # Modelo de agente
│   │   ├── Book.js               # Modelo de libro
│   │   ├── Task.js               # Modelo de tarea
│   │   └── Device.js             # Modelo de dispositivo
│   ├── middleware/               # Middlewares Express
│   │   ├── auth.js               # Autenticación JWT
│   │   ├── hmac.js               # Verificación HMAC
│   │   ├── rateLimit.js          # Rate limiting
│   │   └── validation.js         # Validación de input
│   ├── config/                   # Configuración
│   │   ├── database.js           # Config DB
│   │   ├── redis.js              # Config Redis
│   │   ├── llm-providers.yml     # Config LLM
│   │   └── environment.js        # Variables de entorno
│   └── utils/                    # Utilidades
│       ├── logger.js             # Logging
│       ├── crypto.js             # Criptografía
│       └── helpers.js            # Helper functions
├── dashboard/                    # Frontend React
│   ├── src/
│   │   ├── components/           # Componentes UI
│   │   ├── pages/                # Páginas
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API calls
│   │   └── utils/                # Utilidades
│   ├── public/
│   └── package.json
├── books/                        # Directorio libros físicos
│   ├── pdf/                      # Libros PDF
│   ├── epub/                     # Libros EPUB
│   ├── mobi/                     # Libros MOBI
│   └── txt/                      # Libros TXT
├── data/                         # Datos persistentes
│   ├── logs/                     # Logs del sistema
│   ├── uploads/                  # Archivos subidos
│   ├── agents/                   # Estado de agentes
│   └── cache/                    # Cache local
├── scripts/                      # Scripts utilidad
│   ├── setup/                    # Scripts de setup
│   ├── deploy/                   # Scripts de deployment
│   ├── migrate/                  # Migraciones DB
│   └── seed/                     # Seed data
├── config/                       # Archivos de configuración
│   ├── development.yml
│   ├── staging.yml
│   ├── production.yml
│   └── test.yml
├── logs/AI_HISTORY/              # Archivos historial AI
│   ├── TASK/                     # Checklist historial
│   ├── PLAN/                     # Planes aprobados
│   ├── DOCS/                     # Documentación versionada
│   ├── FEAT/                     # Feature descriptions
│   ├── FIX/                      # Bug fix logs
│   └── GIT/                      # Git operation logs
├── docs/                         # Documentación
│   ├── adr/                      # Architecture Decision Records
│   ├── api/                      # API documentation
│   ├── diagrams/                 # UML y otros diagramas
│   ├── guides/                   # User guides
│   └── schemas/                  # Database schemas
└── tests/                        # Tests
    ├── unit/                     # Unit tests
    ├── integration/              # Integration tests
    ├── e2e/                      # End-to-end tests
    ├── fixtures/                 # Test data
    └── mocks/                    # Mock objects
```

---

## 🐳 DOCKER COMPOSE ARCHITECTURE

### Servicios Definidos
```yaml
version: '3.8'

services:
  # Backend API
  amrois-api:
    build: .
    ports:
      - "3467:3467"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - OLLAMA_HOST=http://ollama:11434
    depends_on:
      - postgres
      - redis
      - ollama
    volumes:
      - ./books:/app/books:ro
      - ./data/logs:/app/logs
      - ./data/uploads:/app/uploads
    restart: unless-stopped

  # Frontend Dashboard
  amrois-dashboard:
    build: ./dashboard
    ports:
      - "3466:3466"
    environment:
      - VITE_API_URL=http://localhost:3467
    restart: unless-stopped

  # Database
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=amrois_system
      - POSTGRES_USER=amrois_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Cache y Message Queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # LLM Service
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  # Reverse Proxy (opcional)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - amrois-api
      - amrois-dashboard
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  ollama_data:
```

---

## 🔌 API ENDPOINTS STRUCTURE

### System Management
```
GET    /health                          # Health check
POST   /api/system/start                # Start system
POST   /api/system/stop                 # Stop system
GET    /api/system/stats                # System statistics
```

### Agent Management
```
GET    /api/agents                      # List all agents
GET    /api/agents/:name/status         # Get agent status
POST   /api/agents/:name/execute        # Execute agent task
POST   /api/agents/:name/train          # Train agent
```

### LLM Operations
```
POST   /api/llm/generate                # Generate text
POST   /api/llm/chat                    # Chat with LLM
POST   /api/llm/embed                   # Generate embeddings
GET    /api/llm/providers               # List providers
GET    /api/llm/health                  # Check LLM health
```

### Book Management
```
GET    /api/books                       # List books
POST   /api/books/upload                # Upload books
POST   /api/books/scan                  # Scan directory
PUT    /api/books/config                # Configure path
```

### Device Management
```
POST   /api/devices/register            # Register device
POST   /api/devices/:id/heartbeat       # Update status
GET    /api/devices/:id/tasks           # Get tasks
POST   /api/devices/:id/report           # Report results
```

---

## 📊 PERFORMANCE TARGETS

### Response Time Targets
| Endpoint | Target 95th | Target 99th | Maximum |
|----------|-------------|-------------|---------|
| Health Check | < 50ms | < 100ms | 200ms |
| Agent Execute | < 5s | < 10s | 30s |
| LLM Generate | < 10s | < 20s | 60s |
| Book Scan | < 2s | < 5s | 10s |
| Device Status | < 100ms | < 200ms | 500ms |

### Resource Limits
| Container | CPU Limit | Memory Limit | Storage |
|-----------|-----------|--------------|---------|
| API Backend | 2 cores | 512MB | 10GB |
| Dashboard | 1 core | 256MB | 5GB |
| PostgreSQL | 2 cores | 1GB | 50GB |
| Redis | 1 core | 256MB | 5GB |
| Ollama | 4 cores | 4GB | 20GB |

---

## 🔄 CI/CD ARCHITECTURE

### Pipeline Stages
1. **Lint & Format**: ESLint, Prettier, type checking
2. **Unit Tests**: Jest con coverage > 80%
3. **Integration Tests**: API endpoints y database
4. **Security Scan**: npm audit, SAST analysis
5. **Build**: Docker images y frontend bundle
6. **Deploy**: Staging → Production

### Environment Promotion
```
dev (PR) → staging (auto-deploy) → main (production)
```

---

## 🎯 SUCCESS METRICS

### System Health
- **Uptime**: 99.9% ( < 43min downtime/mes)
- **Response Time**: < 200ms average
- **Error Rate**: < 0.1% ( < 1 error/1000 requests)
- **Throughput**: 1000+ requests/second

### Business Metrics
- **Active Devices**: 50+ connected
- **Books Processed**: 1000+/day
- **Tasks Completed**: 10,000+/week
- **User Engagement**: > 85% daily active

---

## 🔗 ARCHITECTURE REFERENCES

### Design Patterns Used
- **Repository Pattern**: Database access abstraction
- **Factory Pattern**: Agent creation
- **Observer Pattern**: Event-driven communication
- **Strategy Pattern**: LLM provider selection
- **Command Pattern**: Task execution

### External Dependencies
- **Node.js 20+**: Runtime
- **Express.js**: Web framework
- **PostgreSQL**: Primary database
- **Redis**: Cache y message broker
- **Ollama**: LLM provider
- **React**: Frontend framework
- **Docker**: Containerization

---

**ESTE DOCUMENTO DEFINE LA ARQUITECTURA BASE**  
Cualquier cambio requiere ADR aprobado.

**Archivo:** REGLAS-001-ARQUITECTURA.md  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-02