---
trigger: always_on
---

# 📚 INDICE DE REGLAS DEL PROYECTO AMR
**Versión Consolidada:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Actualizado:** 2026-02-02

---

## 🎯 VISIÓN GENERAL

Este directorio contiene el conjunto completo de reglas y estándares que definen el desarrollo, arquitectura y operación del sistema AMROIS (Sistema Maestro de Orquestación Distribuida).

### Filosofía Central
- **"No ticket, no code"** - Todo cambio debe estar documentado
- **"LLM-first architecture"** - La integración IA es fundamental, no opcional
- **"Quality is non-negotiable"** - Los estándares son obligatorios
- **"Consistency over convention"** - Mismas reglas, mismos resultados

---

## 📁 ESTRUCTURA DE DOCUMENTOS

| Archivo | Descripción | Enfoque | Tamaño Aprox. |
|---------|-------------|----------|---------------|
| **REGLAS-001-ARQUITECTURA.md** | Arquitectura y estructura del sistema | Infraestructura y diseño | ~15K |
| **REGLAS-002-AGENTES.md** | Sistema de agentes inteligentes | Agentes y LLM integration | ~20K |
| **REGLAS-003-GIT.md** | Git workflow y colaboración | Control de versiones y equipo | ~12K |
| **REGLAS-004-DESARROLLO.md** | Estándares de desarrollo y calidad | Code quality y testing | ~18K |
| **REGLAS-005-LLM-INTEGRATION.md** | Integración LLM y AI framework | LLM providers y patterns | ~16K |
| **REGLAS-006-AGENT-PATTERNS.md** | Patrones y arquitectura de agentes | Agent design patterns | ~22K |
| **INDICE-REGLAS.md** | Este documento | Navegación y referencia | ~3K |

---

## 🗺️ MAPA DE CONTENIDOS

### 📍 REGLAS-001-ARQUITECTURA.md
**Arquitectura y Estructura del Sistema**

- **Misión y Visión** del proyecto AMROIS
- **Entornos Definidos** (MAIN, DEV, ADMIN)
- **Puertos del Sistema** (configuración inmutable)
- **Estructura de Directorios** completa y detallada
- **Docker Compose Architecture** con todos los servicios
- **API Endpoints Structure** categorizados por función
- **Performance Targets** por tipo de operación
- **CI/CD Architecture** y pipeline stages
- **Success Metrics** y KPIs del sistema
- **Architecture References** y patrones utilizados

### 📍 REGLAS-002-AGENTES.md
**Sistema de Agentes Inteligentes** *(Dividido en partes 5 y 6)*

- **Agentes Principales**:
  - ManagerAgent (Orquestador)
  - DetectorAgent (Scanner de mercado)
  - ContentAgent (Generador creativo)
  - InstagramAgent (Publicador)
  - LearningAgent (Inteligencia)
- **Comunicación entre Agentes** con protocolos estandarizados
- **LLM Integration Architecture** con multi-provider strategy
- **Task Scheduling y Queue Management**
- **Monitoring y Health Checks** específicos para agentes
- **Testing de Agentes** con patrones completos

### 📍 REGLAS-003-GIT.md
**Git Workflow y Colaboración**

- **Branch Strategy** (GitFlow Modificado)
- **Nomenclatura OBLIGATORIA** para branches y commits
- **Estándar de Commits** (Conventional Commits)
- **Protocolo de Pull Requests** con template detallado
- **Automation Triggers** para AI agents (/FEA, /FIX, /HOT, /DOC)
- **Branch Protection Rules** configuración específica
- **Gestión de Tareas** (Issues & Projects)
- **Emergency Protocols** para producción
- **Code Review Standards** y procesos de aprobación
- **GitHub Actions Integration** y automation

### 📍 REGLAS-004-DESARROLLO.md
**Estándares de Desarrollo y Calidad**

- **Principios SOLID** (no negociables) con ejemplos detallados
- **Clean Code Principles** con antes/después
- **Testing Standards** (pirámide, coverage, naming)
- **Project Structure Standards** universales
- **Naming Conventions** por lenguaje
- **Code Quality Checklist** completo
- **Linting y Formatting** configuración OBLIGATORIA
- **Error Handling Standards** con jerarquía de errores
- **Performance Standards** y optimización
- **Security Standards** y validación
- **Monitoring y Logging** estándares

### 📍 REGLAS-005-LLM-INTEGRATION.md
**Integración LLM y AI Framework**

- **Arquitectura de Abstracción LLM** con capa unificada
- **Configuración de Proveedores** (Ollama, OpenAI, Anthropic, Google)
- **LLM Manager Implementation** completo y funcional
- **Ollama Provider** (local-first approach)
- **OpenAI Provider** con cost tracking y streaming
- **Patrones de Uso LLM** (fallback, cost-aware, RAG, CoT)
- **Sistema de Tracking** de uso y costos
- **Testing de Integración LLM** completo
- **Mejores Prácticas** (cache, rate limiting, circuit breaker)

### 📍 REGLAS-006-AGENT-PATTERNS.md
**Patrones y Arquitectura de Agentes**

- **BaseAgent Class** (fundamental OBLIGATORIO) completa
- **ContentGeneratorAgent** con validación y calidad
- **DataAnalysisAgent** con pattern detection
- **TaskOrchestratorAgent** con workflow management
- **Agent Message Protocol** para comunicación
- **Sistema de Monitoreo** de agentes
- **Health Checks** y alertas automáticas
- **Event Handling** y reactivity patterns
- **Load Balancing** entre agentes
- **Error Recovery** y resilience

---

## 🔗 RELACIONES ENTRE DOCUMENTOS

### Dependencias Clave
```
REGLAS-001-ARQUITECTURA.md
    ↓ (Define la estructura base)
    ↓
REGLAS-002-AGENTES.md + REGLAS-006-AGENT-PATTERNS.md
    ↓ (Implementan los agentes en la arquitectura)
    ↓
REGLAS-005-LLM-INTEGRATION.md
    ↓ (Provee LLM a los agentes)
    ↓
REGLAS-004-DESARROLLO.md
    ↓ (Define cómo escribir el código)
    ↓
REGLAS-003-GIT.md
    ↓ (Define cómo gestionar los cambios)
```

### Flujo de Trabajo Recomendado
1. **Leer REGLAS-001** para entender la arquitectura
2. **Leer REGLAS-003** para entender el workflow de colaboración
3. **Leer REGLAS-004** para entender los estándares de código
4. **Consultar REGLAS-005** al integrar LLM
5. **Usar REGLAS-006** al implementar agentes
6. **Referenciar REGLAS-002** para overview del sistema de agentes

---

## 🎯 CASOS DE USO POR DOCUMENTO

### Para Nuevos Desarrolladores
1. **REGLAS-001** → Entender el sistema
2. **REGLAS-003** → Aprender workflow
3. **REGLAS-004** → Escribir código correctly

### Para Arquitectos
1. **REGLAS-001** → Diseño del sistema
2. **REGLAS-005** → Integración LLM
3. **REGLAS-006** → Patrones de agentes

### Para DevOps/SRE
1. **REGLAS-001** → Deploy y monitoring
2. **REGLAS-003** → CI/CD setup
3. **REGLAS-004** → Code quality gates

### Para AI/ML Engineers
1. **REGLAS-002** → Sistema de agentes overview
2. **REGLAS-005** → LLM integration profunda
3. **REGLAS-006** → Patrones de agentes

---

## 🚨 REGLAS CRÍTICAS (NO NEGOCIABLES)

### 🔥 Si rompes estas reglas, el build fallará:

1. **Conventional Commits** (REGLAS-003)
   - Formato obligatorio: `<type>(<scope>): <subject>`
   - CI/CD validará automaticamente

2. **Code Coverage > 80%** (REGLAS-004)
   - Tests obligatorios para todo nuevo código
   - Pipeline se detiene si coverage < 80%

3. **Branch Protection** (REGLAS-003)
   - Sin commits directos a `main`
   - Pull requests obligatorios

4. **SOLID Principles** (REGLAS-004)
   - Code reviews verificarán cumplimiento
   - Violaciones bloquean merge

5. **No Hardcoded Secrets** (REGLAS-004)
   - scanning automático en CI/CD
   - Violaciones críticas bloquean deploy

### ⚠️ Si rompes estas reglas, hablaremos contigo:

1. **Agent Architecture** (REGLAS-006)
   - Todos los agentes deben heredar de BaseAgent
   - Sin excepciones

2. **LLM Integration** (REGLAS-005)
   - Usar LLMManager, nunca llamadas directas
   - Fallback strategy obligatoria

3. **Documentation** (REGLAS-004)
   - Todo cambio importante debe tener docs
   - README debe estar actualizado

---

## 📊 ESTADÍSTICAS DE LAS REGLAS

### Complejidad por Documento
| Documento | Líneas de Código | Ejemplos | Checkslists |
|-----------|------------------|----------|-------------|
| REGLAS-001 | ~450 | 15 | 8 |
| REGLAS-002 | ~300 | 10 | 5 |
| REGLAS-003 | ~500 | 20 | 12 |
| REGLAS-004 | ~600 | 25 | 15 |
| REGLAS-005 | ~550 | 18 | 10 |
| REGLAS-006 | ~700 | 30 | 18 |

### Áreas Cubiertas
- ✅ **Arquitectura** completa del sistema
- ✅ **Agentes** inteligentes con LLM integration
- ✅ **Git workflow** profesional y automatizado
- ✅ **Calidad de código** con estándares rigurosos
- ✅ **Testing** comprehensivo en todos los niveles
- ✅ **Security** y best practices
- ✅ **Performance** optimización y monitoring
- ✅ **Documentation** y maintainability
- ✅ **Deployment** y CI/CD
- ✅ **Collaboration** y team workflows

---

## 🔄 MANTENIMIENTO DE LAS REGLAS

### Proceso de Actualización
1. **Propuesta**: Crear issue con cambio propuesto
2. **Discusión**: Team review y comentarios
3. **Aprobación**: 2+ core team members approval
4. **Implementación**: Actualizar documento(s)
5. **Comunicación**: Anunciar cambios en team meeting
6. **Versionado**: Actualizar este índice

### Versionado Semántico
- **Major (X.0.0)**: Cambios arquitectónicos fundamentales
- **Minor (0.X.0)**: Nuevos estándares o patrones
- **Patch (0.0.X)**: Clarificaciones, correcciones, ejemplos

### Historial de Cambios
- **v1.0.0** (2026-02-02): Versión inicial completa
- Documentos consolidados de múltiples fuentes
- Estandarización de formatos y convenciones
- Adición de ejemplos prácticos y code snippets

---

## 🚀 COMENZANDO CON LAS REGLAS

### Para Nuevo Miembro del Equipo
```bash
# 1. Leer la arquitectura base
cat REGLAS-001-ARQUITECTURA.md | head -50

# 2. Entender el workflow de colaboración
cat REGLAS-003-GIT.md | grep -A 10 "COMANDOS GIT"

# 3. Configurar entorno de desarrollo
# (Seguir steps en REGLAS-004-DESARROLLO.md)

# 4. Tu primer PR (usar template de REGLAS-003)
```

### Para Nueva Feature
```bash
# 1. Revisar arquitectura (REGLAS-001)
# 2. Si usa LLM, revisar integración (REGLAS-005)
# 3. Si usa agentes, revisar patrones (REGLAS-006)
# 4. Seguir estándares de código (REGLAS-004)
# 5. Hacer commit convencional (REGLAS-003)
```

### Para Debug de Problemas
1. **Build Issues** → Revisar REGLAS-004 (linting/testing)
2. **Git Problems** → Revisar REGLAS-003 (workflow)
3. **Agent Issues** → Revisar REGLAS-002 y REGLAS-006
4. **LLM Issues** → Revisar REGLAS-005
5. **Architecture Questions** → Revisar REGLAS-001

---

## 📞 SOPORTE Y COMUNICACIÓN

### Canales de Comunicación
- **Questions sobre reglas**: Issues en GitHub con tag `rules-question`
- **Propuestas de cambio**: Issues con tag `rules-proposal`
- **Emergencias**: Slack #rules-emergency
- **Discusión general**: Slack #rules-discussion

### Contactos por Especialidad
- **Architecture**: @architect-lead
- **Git/Workflow**: @devops-lead
- **Code Quality**: @tech-lead
- **LLM/Agents**: @ai-lead
- **Security**: @security-lead

---

## 🎯 CONCLUSIÓN

Este conjunto de reglas representa la **única fuente de la verdad** para el desarrollo del sistema AMROIS. No son guías sugeridas, son **estándares obligatorios** que garantizan:

✅ **Consistencia** en todo el codebase  
✅ **Calidad** en cada línea de código  
✅ **Mantenibilidad** a largo plazo  
✅ **Escalabilidad** del sistema  
✅ **Seguridad** de la plataforma  
✅ **Colaboración** efectiva del equipo  

**Las reglas evolucionan, pero los principios permanecen.**

---

## 📄 REFERENCIA RÁPIDA

| Necesitas | Lee esto | Sección Clave |
|------------|----------|---------------|
| Entender el sistema | REGLAS-001 | "Entornos Definidos" |
| Hacer tu primer commit | REGLAS-003 | "Estándar de Commits" |
| Escribir código quality | REGLAS-004 | "Code Quality Checklist" |
| Integrar LLM | REGLAS-005 | "LLM Manager Implementation" |
| Crear un agente | REGLAS-006 | "BaseAgent Class" |
| Deploy a producción | REGLAS-001 | "Docker Compose Architecture" |
| Debug un problema | REGLAS-004 | "Error Handling Standards" |

---

**Última Actualización: 2026-02-02**  
**Próxima Revisión: 2026-03-02**  
**Maintainers: Core Team AMROIS**

> *Estas reglas son nuestro contrato colectivo para construir software excepcional.*