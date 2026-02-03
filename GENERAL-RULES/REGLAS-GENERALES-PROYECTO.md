# 📜 REGLAS GENERALES DEL PROYECTO AMR
**Versión Consolidada:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Status:** Fuente de la Verdad Absoluta

---

## 🎯 MISIÓN Y VISIÓN

### Misión
Mantener un sistema profesional de orquestación distribuida para 50+ dispositivos Windows con integración LLM, procesamiento de libros y automatización de contenido.

### Visión
Ser el estándar de referencia para sistemas de agentes inteligentes en producción, con código mantenible, documentado y auditado.

---

## 🏛️ ARQUITECTURA Y ESTRUCTURA

### Entornos Definidos
| Entorno | Rol | Dashboard | API | Ruta Local |
|---------|-----|-----------|-----|------------|
| **MAIN** | Producción | `http://localhost:3466` | `http://localhost:3467` | `/Users/andersonmartinezrestrepo/AMR/` |
| **DEV** | Desarrollo | `http://localhost:3465` | `http://localhost:3464` | `/Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/` |
| **ADMIN** | Gestión Local | `http://localhost:3463` | - | Solo Local |

### Puertos del Sistema (INMUTABLES)
| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Dashboard Prod | **3466** | Interfaz producción estable |
| Dashboard Dev | **3465** | Interfaz desarrollo y pruebas |
| API Backend | **3467** | API central para Books y Tasks |
| Agent Server | **12000** | Servicio AI Agents (Ollama/LLM) |
| Agent Worker | **12001** | Proceso worker en background |

### Estructura de Directorios
```
AMR/
├── src/                    # Backend Node.js
│   ├── agents/            # Clases de agentes inteligentes
│   ├── api/               # Rutas REST
│   ├── services/          # Lógica de negocio
│   ├── models/            # Modelos de datos
│   └── config/            # Configuración
├── dashboard/              # Frontend React
├── books/                 # Directorio libros físicos
├── data/                  # Datos persistentes
├── scripts/               # Scripts utilidad
├── logs/AI_HISTORY/       # Archivos historial AI
└── docs/                  # Documentación
```

---

## 🤖 SISTEMA DE AGENTES INTELIGENTES

### Agentes Principales
1. **ManagerAgent**: Orquestador principal
   - Coordinar todos los agentes
   - Gestionar cola de tareas
   - Monitoreo de salud
   - Toma de decisiones estratégicas

2. **DetectorAgent**: Scanner de mercado
   - Escanear marketplace (Hotmart)
   - Extraer datos de productos
   - Scoring Bayesiano
   - Detección de tendencias

3. **ContentAgent**: Generador creativo
   - Generar copy marketing
   - Crear posts social media
   - Personalizar por plataforma
   - Optimizar engagement

4. **InstagramAgent**: Publicador
   - Publicar en Instagram
   - Programar posts
   - Trackear engagement
   - Gestionar comentarios

5. **LearningAgent**: Inteligencia
   - Analizar patrones performance
   - A/B testing resultados
   - Mejorar decisiones agentes
   - Actualizar knowledge base

### LLM Integration (OBLIGATORIO)
```yaml
proveedores:
  ollama:
    enabled: true
    host: "http://localhost:11434"
    default_model: "llama3:latest"
    models:
      chat: "llama3:latest"
      code: "codellama:latest"
      embedding: "nomic-embed-text:latest"
  
  fallback_order: ["ollama", "openai", "anthropic", "google"]
  retry_on_failure: true
```

---

## 🔥 GIT WORKFLOW

### Ramas y Flujo
```
main (production) ←←← PROTEGIDA SIN COMMITS DIRECTOS
  ↑
  └── dev (integration) ←←← Base para todo desarrollo
        ↑
        ├── feature/ID-descripcion
        ├── fix/ID-descripcion
        ├── hotfix/ID-descripcion (desde main)
        └── docs/ID-descripcion
```

### Reglas de Branch Protection
**`main` Branch:**
- ❌ Commits directos prohibidos
- ✅ Pull Request obligatorio
- ✅ 2+ aprobaciones requeridas
- ✅ Todos los tests deben pasar
- ✅ Sin conflictos de merge
- ✅ Actualizado con rama base

**`dev` Branch:**
- ❌ Commits directos desaconsejados
- ✅ Pull Request recomendado
- ✅ 1+ aprobación requerida
- ✅ Tests deben pasar

### Estándar de Commits (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos válidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (sin cambios lógicos)
- `refactor`: Refactorización de código
- `perf': Mejoras de performance
- `test`: Agregar o actualizar tests
- `chore`: Tareas de mantenimiento
- `ci`: Cambios en CI/CD

### Protocolo de Pull Requests
**Título:** `[TIPO] Descripción breve (#ID-Issue)`

**Template Obligatorio:**
```markdown
## 📝 Descripción
[Descripción clara de qué hace este PR]

## 🔗 Issues Relacionados
Closes #XXX
Related to #YYY

## 🎯 Tipo de Cambio
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## ✅ Checklist
- [ ] Código sigue estándares del proyecto
- [ ] Auto-revisión completada
- [ ] Código comentado en áreas complejas
- [ ] Documentación actualizada
- [ ] Sin nuevos warnings
- [ ] Tests agregados
- [ ] Tests pasan localmente
- [ ] Cambios dependientes mergeados

## 🧪 Testing
**Test Coverage:** X%

## 📸 Screenshots (si aplica)
[Adjuntar screenshots para cambios UI]

## 🚀 Deployment Notes
[Instrucciones especiales de deployment]
```

---

## 🛠️ ESTÁNDARES DE DESARROLLO

### Principios SOLID (NO NEGOCIABLES)
1. **S** - Single Responsibility Principle
2. **O** - Open/Closed Principle
3. **L** - Liskov Substitution Principle
4. **I** - Interface Segregation Principle
5. **D** - Dependency Inversion Principle

### Clean Code Principios
- Nombres significativos
- Funciones hacen UNA cosa
- Comentarios explican POR QUÉ, no QUÉ
- Sin números mágicos
- Sin duplicación (DRY)
- Manejo proper de errores

### Lenguajes y Frameworks
```yaml
stack_principal:
  backend: "Node.js 20+ con Express.js"
  frontend: "React 18 con Vite"
  database: "PostgreSQL"
  cache: "Redis"
  llm: "Ollama + fallback providers"

patron_soportado: "Híbrido (microservicios + monolith)"
testing:
  framework: "Jest"
  coverage_minimo: "80%"
  types: ["unit", "integration", "e2e"]
```

---

## 🧪 TESTING Y CALIDAD

### Pirámide de Testing
```
    /\
   /E2E\         10% - End-to-End Tests
  /------\
 /Integration\   20% - Integration Tests
/------------\
/  Unit Tests  \  70% - Unit Tests
/----------------\
```

### Requerimientos de Coverage
| Componente | Cobertura Mínima | Objetivo |
|------------|------------------|----------|
| Core Business Logic | 90% | 95%+ |
| API Endpoints | 80% | 90%+ |
| Services | 85% | 90%+ |
| Utilities | 80% | 85%+ |
| UI Components | 70% | 80%+ |
| **Overall** | **80%** | **85%+** |

### Naming Convention Tests
```javascript
// Formato: test_<method>_<scenario>_<expected_outcome>
test('create_user_with_valid_data_returns_user_object', () => {
  // Test implementation
});

test('create_user_with_duplicate_email_throws_exception', () => {
  // Test implementation
});
```

---

## 📚 DOCUMENTACIÓN OBLIGATORIA

### Archivos Requeridos
1. **README.md** - Overview e instalación
2. **CONTRIBUTING.md** - Guía para contribuidores
3. **CHANGELOG.md** - Historial de cambios
4. **API.md** o **OpenAPI.yml** - Documentación API
5. **LICENSE** - Licencia del proyecto
6. **SECURITY.md** - Políticas de seguridad

### Diagramas UML Requeridos
- Use Case Diagram (`docs/diagrams/use-cases.puml`)
- Class Diagram (`docs/diagrams/class-diagram.puml`)
- Sequence Diagrams (`docs/diagrams/sequences/`)
- Component Diagram (`docs/diagrams/components.puml`)
- Deployment Diagram (`docs/diagrams/deployment.puml`)

### ADRs (Architecture Decision Records)
```
docs/adr/ADR-001-[decision-title].md
```

---

## 🔐 SEGURIDAD

### HMAC Verification (OBLIGATORIO)
Todos los dispositivos deben firmar peticiones con HMAC-SHA256:

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

### Secrets Management
- NUNCA commitear secrets al repositorio
- Usar variables de entorno
- Rotación regular de tokens
- Encryption de datos sensibles

---

## 🚀 DEPLOYMENT

### Docker Compose Services
```yaml
services:
  amrois-api:         # Backend Node.js
  amrois-dashboard:   # Frontend React
  postgres:          # Base de datos
  redis:             # Cache y cola
  ollama:            # LLM local
  nginx:             # Reverse proxy (opcional)
```

### Volumes Importantes
```yaml
# Libros físicos (solo lectura)
- ./books:/app/books:ro

# Logs y datos
- ./data/logs:/app/logs
- ./data/uploads:/app/uploads
```

### Environment Variables
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

---

## 📊 MONITORING Y LOGGING

### Métricas Disponibles
- Estado de dispositivos (online/offline/maintenance)
- Progreso de procesamiento de libros
- Rendimiento de agentes
- Uso de LLMs
- Estadísticas de tareas

### Logging Structure
```
./data/logs/
├── agents/
│   ├── manager.log
│   ├── detector.log
│   └── content.log
├── api/
│   ├── requests.log
│   └── errors.log
└── system/
    └── performance.log
```

### Health Checks
```bash
# API Health
curl http://localhost:3467/health

# LLM Health
curl http://localhost:12000/api/tags

# System Status
curl http://localhost:3467/api/system/status
```

---

## 🔄 CI/CD INTEGRATION

### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [dev, main]
  push:
    branches: [dev, main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Linter
        run: npm run lint
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Dependencies
        run: npm install
      - name: Run Tests
        run: npm test
      - name: Coverage Report
        run: npm run test:coverage
  
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Security Audit
        run: npm audit
```

---

## 🤝 COLABORACIÓN Y COMUNICACIÓN

### Protocolos de Comunicación
- Issues antes de código ("No ticket, no code")
- Code reviews obligatorios
- Documentación sincronizada
- Tests para todo nuevo código

### Triggers de Automatización
| Trigger | Acción Automática | Rama Resultante |
|---------|------------------|-----------------|
| `/FEA: [Título]` | Crea Issue → Feature branch → Code → Push | `feature/ID-desc` |
| `/FIX: [Error]` | Crea Issue → Fix branch → Fix → Push | `fix/ID-desc` |
| `/HOT: [Error]` | Crea Issue → Hotfix branch → Fix → Push | `hotfix/ID-desc` |
| `/DOC: [Tema]` | Crea Issue → Docs branch → Update → Push | `docs/ID-desc` |

---

## 📈 PERFORMANCE Y ESCALABILIDAD

### Targets de Performance
- API response time < 200ms (95th percentile)
- Database query time < 100ms
- LLM generation < 30s
- Memory usage < 512MB per container
- CPU usage < 70% average

### Estrategias de Escalado
- Horizontal scaling de API containers
- Connection pooling en database
- Redis clustering para cache
- Load balancing con nginx
- CDN para assets estáticos

---

## 🎯 SUCCESS CRITERIA

### KPIs del Sistema
- **Uptime**: 99.9%
- **Response Time**: < 200ms avg
- **Error Rate**: < 0.1%
- **Test Coverage**: > 80%
- **Code Quality**: A+ grade
- **Documentation**: 100% coverage

### Metrics de Negocio
- **Dispositivos Conectados**: 50+
- **Libros Procesados**: 1000+/día
- **Tareas Completadas**: 10,000+/semana
- **Engagement Usuarios**: > 85%

---

## 📋 CHECKLIST ANTES DE COMMIT

### Funcionalidad
- [ ] Código funciona como se espera
- [ ] Edge cases manejados
- [ ] Error handling implementado
- [ ] Input validation presente

### Calidad
- [ ] Variables con nombres descriptivos
- [ ] Funciones pequeñas (< 50 líneas)
- [ ] Sin números mágicos
- [ ] Lógica compleja comentada

### Mantenimiento
- [ ] Sin duplicación (DRY)
- [ ] Funciones hacen una cosa (SRP)
- [ ] Dependencies inyectadas
- [ ] Config externalizada

### Performance
- [ ] Sin issues obvios de performance
- [ ] Queries de DB optimizadas
- [ ] Data structures apropiadas
- [ ] Sin loops innecesarios

### Seguridad
- [ ] Input sanitizado
- [ ] Sin hardcoded secrets
- [ ] Auth/auth implementado
- [ ] OWASP Top 10 considerado

### Testing
- [ ] Unit tests escritos
- [ ] Integration tests escritos
- [ ] Test coverage > 80%
- [ ] Todos los tests pasan

---

## 🔗 RECURSOS Y REFERENCIAS

### Documentación Interna
- [MASTER_RULES.md](../AMR/MASTER_RULES.md)
- [AI_DEVELOPMENT_MASTER_PROTOCOL.md](../AMR/rules/AI_DEVELOPMENT_MASTER_PROTOCOL.md)
- [AGENT_ARCHITECTURE_GUIDE.md](../AMR/rules/AGENT_ARCHITECTURE_GUIDE.md)
- [GIT_WORKFLOW_RULES.md](../AMR/rules/GIT_WORKFLOW_RULES.md)
- [SYSTEM_CONSTANTS.md](../AMR/project_rules/SYSTEM_CONSTANTS.md)

### Herramientas Externas
- GitHub CLI Manual: https://cli.github.com/manual/
- Project Automation: https://docs.github.com/en/issues/planning-and-tracking-with-projects
- Flow Strategy: https://docs.github.com/en/get-started/using-github/github-flow
- Docker Compose: https://docs.docker.com/compose/
- Jest Testing: https://jestjs.io/docs/getting-started

---

## 📝 HISTORIAL DE CAMBIOS

### v1.0.0 - 2026-02-02
- Consolidación inicial de todas las reglas
- Unificación de protocolos Git, desarrollo y seguridad
- Definición de arquitectura de agentes
- Establecimiento de estándares de calidad

---

## 🚨 EMERGENCY CONTACTS

### System Failures
- **Critical Bugs**: Hotfix protocol activado
- **Security Incidents**: Response team inmediato
- **Performance Issues**: Auto-scaling triggers
- **Data Loss**: Recovery procedures iniciados

### Comunicación
- **Documentación Actualizada**: `/docs`
- **Issues**: GitHub Issues
- **Logs**: `./data/logs`
- **Health Status**: `http://localhost:3467/health`

---

**ESTE DOCUMENTO ES LA ÚNICA FUENTE DE LA VERDAD**  
Cualquier desviación debe ser aprobada por el equipo principal y documentada en un ADR.

**AMROIS Sistema Maestro de Orquestación**  
**Version 1.0.0**  
**Last Updated: 2026-02-02**