---
trigger: always_on
---

# 🤖 SISTEMA DE AGENTES INTELIGENTES - Parte 1
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-002-AGENTES-PARTE1.md
---
## 🎯 OVERVIEW DEL SISTEMA DE AGENTES
El sistema AMROIS utiliza una arquitectura multi-agente donde cada agente tiene una responsabilidad específica y especializada. Todos los agentes están diseñados para trabajar en conjunto pero de manera independiente.
### Principios Fundamentales
1. **Agent Specialization**: Cada agente tiene UNA responsabilidad clara
2. **LLM-First**: La integración con IA no es opcional, es arquitectónica
3. **API-Driven**: Todo expuesto vía REST/GraphQL
4. **Event-Driven**: Agentes comunican vía eventos/mensajes
5. **Persistence**: Todo estado almacenado en base de datos para recovery
6. **Hybrid Stacks**: Usar la herramienta correcta para cada trabajo
---
## 🎭 AGENTES PRINCIPALES
### 1. ManagerAgent - ORQUESTADOR
```javascript
{
  "name": "ManagerAgent",
  "type": "ORCHESTRATOR",
  "priority": "CRITICAL",
  "language": "Node.js",
  "port": 12000,
  "responsibilities": [
    "Coordinar todos los agentes",
    "Gestionar cola de tareas",
    "Monitoreo de salud del sistema",
    "Knowledge summarization",
    "Toma de decisiones estratégicas",
    "Balance de carga entre agentes"
  ],
  "llm_usage": {
    "provider": "ollama",
    "model": "llama3:latest",
    "temperature": 0.7,
    "use_cases": [
      "Analyze knowledge base",
      "Strategic decisions",
      "Agent coordination",
      "Resource optimization"
    ]
  },
  "api_endpoints": [
    "POST /api/agents/manager/start",
    "POST /api/agents/manager/stop", 
    "GET /api/agents/manager/summarize",
    "POST /api/agents/manager/decision",
    "GET /api/agents/manager/status"
  ],
  "metrics": [
    "tasks_completed_per_hour",
    "agent_uptime_percentage",
    "decision_accuracy_rate",
    "resource_utilization"
  ]
}
```
### 2. DetectorAgent - SCANNER DE MERCADO
```javascript
{
  "name": "DetectorAgent",
  "type": "SCRAPER",
  "priority": "HIGH",
  "language": "Node.js + Puppeteer",
  "dependencies": ["puppeteer", "cheerio", "axios"],
  "responsibilities": [
    "Escanear marketplace (Hotmart)",
    "Extraer datos de productos",
    "Scoring Bayesiano de productos",
    "Detección de tendencias",
    "Análisis de competencia",
    "Validación de datos"
  ],
  "llm_usage": {
    "provider": "ollama",
    "model": "llama3:latest",
    "temperature": 0.5,
    "use_cases": [
      "Analyze product descriptions",
      "Sentiment analysis",
      "Niche classification",
      "Trend prediction"
    ]
  },
  "database_schema": {
    "table": "products",
    "indexes": ["niche", "score", "created_at"],
    "columns": [
      "id", "hotmart_id", "name", "description", "niche",
      "price", "commission", "score", "status", "llm_analysis",
      "performance_data", "created_at", "updated_at"
    ]
  },
  "schedule": "*/30 * * * *", // Cada 30 minutos
  "rate_limiting": {
    "requests_per_minute": 60,
    "concurrent_scrapers": 3
  }
}
```
### 3. ContentAgent - GENERADOR CREATIVO
```javascript
{
  "name": "ContentAgent",
  "type": "GENERATOR",
  "priority": "HIGH",
  "language": "Node.js",
  "responsibilities": [
    "Generar copy marketing",
    "Crear posts para social media",
    "Personalizar contenido por plataforma",
    "Optimizar para engagement",
    "A/B testing de contenido",
    "Content calendar management"
  ],
  "llm_usage": {
    "provider": "ollama",
    "model": "llama3:latest",
    "temperature": 0.8,
    "use_cases": [
      "Instagram captions",
      "TikTok scripts",
      "Email sequences",
      "Landing page copy",
      "Blog posts",
      "Ad copy"
    ]
  },
  "templates": {
    "instagram": {
      "max_length": 2200,
      "hashtags_max": 30,
      "structure": ["hook", "body", "cta", "hashtags"]
    },
    "tiktok": {
      "max_duration": 60,
      "structure": ["hook", "value", "cta"]
    },
    "email": {
      "subject_max": 50,
      "structure": ["subject", "greeting", "body", "cta", "signature"]
    }
  },
  "quality_metrics": [
    "engagement_score",
    "conversion_rate",
    "sentiment_analysis",
    "brand_alignment"
  ]
}
```
### 4. InstagramAgent - PUBLICADOR
```javascript
{
  "name": "InstagramAgent",
  "type": "PUBLISHER",
  "priority": "MEDIUM",
  "language": "Node.js + Instagram API",
  "dependencies": ["instagram-private-api", "sharp"],
  "responsibilities": [
    "Publicar en Instagram",
    "Programar posts",
    "Trackear engagement",
    "Gestionar comentarios",
    "Stories management",
    "Hashtag optimization"
  ],
  "dependencies": [
    "ContentAgent (para contenido)",
    "AssetsAgent (para imágenes/videos)"
  ],
  "rate_limits": {
    "posts_per_day": 5,
    "stories_per_day": 10,
    "comments_per_hour": 30
  },
  "content_validation": {
    "image_formats": ["jpg", "png", "webp"],
    "video_formats": ["mp4", "mov"],
    "max_image_size": "8MB",
    "max_video_size": "100MB"
  },
  "scheduling": {
    "timezone": "America/New_York",
    "optimal_times": ["09:00", "12:00", "18:00", "21:00"],
    "frequency_analysis": true
  }
}
```
### 5. LearningAgent - INTELIGENCIA
```javascript
{
  "name": "LearningAgent",
  "type": "ANALYZER",
  "priority": "HIGH",
  "language": "Node.js/Python",
  "dependencies": ["tensorflow", "scikit-learn", "pandas"],
  "responsibilities": [
    "Analizar patrones de performance",
    "A/B testing de resultados",
    "Mejorar decisiones de agentes",
    "Actualización de knowledge base",
    "Predictive analytics",
    "Anomaly detection"
  ],
  "llm_usage": {
    "provider": "ollama",
    "model": "llama3:latest",
    "temperature": 0.3,
    "use_cases": [
      "Pattern recognition",
      "Insight generation",
      "Predictive modeling",
      "Post-mortem analysis",
      "Recommendation systems"
    ]
  },
  "database_schema": {
    "tables": [
      "learning_patterns",
      "agent_performance", 
      "content_metrics",
      "knowledge_base",
      "experiments"
    ]
  },
  "ml_models": {
    "engagement_predictor": "random_forest",
    "trend_detector": "lstm",
    "sentiment_analyzer": "bert",
    "recommendation_engine": "collaborative_filtering"
  },
  "experimentation": {
    "framework": "bandit",
    "success_metric": "conversion_rate",
    "min_sample_size": 1000
  }
}
```
---
## 🏗️ ARQUITECTURA DE AGENTES

### Base Agent Class (OBLIGATORIO)
```javascript
class BaseAgent {
  constructor(name, config, llmManager) {
    this.name = name;
    this.config = config;
    this.llm = llmManager;
    this.status = 'idle'; // idle, running, error, stopped
    this.metrics = {
      tasks_completed: 0,
      tasks_failed: 0,
      avg_execution_time: 0,
      uptime_percentage: 0
    };
    this.last_heartbeat = Date.now();
  }
  // Lifecycle methods
  async initialize() {
    console.log(`[${this.name}] Initializing...`);
    this.status = 'initializing';
    // Load configuration, connect to services, etc.
    this.status = 'ready';
  }
  async start() {
    console.log(`[${this.name}] Starting...`);
    this.status = 'running';
  }
  async stop() {
    console.log(`[${this.name}] Stopping...`);
    this.status = 'stopped';
  }
  async execute(task, context = {}) {
    const startTime = Date.now();
    try {
      console.log(`[${this.name}] Executing task: ${task.type}`);
      // Pre-execution
      await this.beforeExecute(task, context);
      // Main execution
      const result = await this.doExecute(task, context);
      // Post-execution
      await this.afterExecute(task, context, result);
      // Update metrics
      this.metrics.tasks_completed++;
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime);
      return {
        success: true,
        result,
        execution_time: executionTime,
        agent: this.name
      };
    } catch (error) {
      this.metrics.tasks_failed++;
      console.error(`[${this.name}] Task failed:`, error);
      return {
        success: false,
        error: error.message,
        execution_time: Date.now() - startTime,
        agent: this.name
      };
    }
  }
  // Abstract method (must implement)
  async doExecute(task, context) {
    throw new Error('doExecute must be implemented by subclass');
  }
  // Hook methods (optional overrides)
  async beforeExecute(task, context) {
    // Override to add pre-execution logic
  }
  async afterExecute(task, context, result) {
    // Override to add post-execution logic
  }
  // LLM integration helper
  async think(prompt, options = {}) {
    return await this.llm.generate(prompt, {
      model: this.config.model || 'llama3:latest',
      temperature: this.config.temperature || 0.7,
      ...options
    });
  }
  // Heartbeat for health monitoring
  heartbeat() {
    this.last_heartbeat = Date.now();
    return {
      agent: this.name,
      status: this.status,
      metrics: this.metrics,
      timestamp: this.last_heartbeat
    };
  }
}
```
---
## 🔄 COMUNICACIÓN ENTRE AGENTES
### Message Protocol
```javascript
{
  "id": "uuid-v4",
  "from_agent": "ManagerAgent",
  "to_agent": "ContentAgent",
  "timestamp": "2026-02-02T10:30:00Z",
  "message_type": "task_assignment",
  "priority": "high|medium|low",
  "payload": {
    "task": {
      "type": "generate_post",
      "data": {
        "product_id": 123,
        "platform": "instagram",
        "tone": "professional"
      }
    },
    "context": {
      "campaign_id": 456,
      "deadline": "2026-02-02T18:00:00Z"
    }
  },
  "response_required": true,
  "timeout_ms": 30000
}
```
### Event Types
- **task_assignment**: Nuevo trabajo asignado
- **task_completed**: Trabajo finalizado
- **task_failed**: Error en ejecución
- **status_update**: Cambio de estado
- **resource_request**: Solicitud de recursos
- **health_check**: Verificación de salud
- **emergency_alert**: Alerta crítica
---
## 🧠 LLM INTEGRATION ARCHITECTURE
### Multi-Provider Strategy
```yaml
llm_providers:
  # Local-first (privacidad优先)
  ollama:
    enabled: true
    host: "http://localhost:11434"
    default_model: "llama3:latest"
    models:
      code_generation: "codellama:latest"
      chat: "llama3:latest"
      vision: "llava:latest"
      embedding: "nomic-embed-text:latest"
    timeout: 300
    max_retries: 3
    cost_per_token: 0 # Free
  # Cloud providers (scale)
  openai:
    enabled: true
    api_key: "${OPENAI_API_KEY}"
    default_model: "gpt-4-turbo"
    models:
      chat: "gpt-4-turbo"
      completion: "gpt-3.5-turbo"
      embedding: "text-embedding-3-large"
    max_tokens: 4096
    temperature: 0.7
    cost_per_1k_tokens: 0.03
  anthropic:
    enabled: false
    api_key: "${ANTHROPIC_API_KEY}"
    default_model: "claude-3-opus-20240229"
    cost_per_1k_tokens: 0.075
  google:
    enabled: false
    api_key: "${GOOGLE_API_KEY}"
    default_model: "gemini-pro"
    cost_per_1k_tokens: 0.001
# Fallback strategy
fallback_order: ["ollama", "openai", "anthropic", "google"]
retry_on_failure: true
cost_optimization: true
privacy_mode: "high" # high, medium, low
```
---
## 📊 MONITORING Y HEALTH CHECKS

### Agent Health Metrics
```javascript
{
  "agent_name": "ContentAgent",
  "status": "healthy|degraded|unhealthy",
  "uptime_seconds": 86400,
  "last_heartbeat": "2026-02-02T10:30:00Z",
  "metrics": {
    "tasks_completed": 1250,
    "tasks_failed": 12,
    "success_rate": 0.99,
    "avg_execution_time_ms": 2500,
    "memory_usage_mb": 256,
    "cpu_usage_percent": 15
  },
  "dependencies": {
    "llm_service": "healthy",
    "database": "healthy",
    "redis": "healthy"
  },
  "errors_last_hour": [
    {
      "timestamp": "2026-02-02T09:45:00Z",
      "error": "LLM timeout",
      "task_id": "abc-123"
    }
  ]
}
```
### System Dashboard Requirements
- Real-time agent status
- Task queue visualization
- Performance metrics
- Error rate monitoring
- Resource utilization
- Cost tracking (LLM usage)
---
**CONTINÚA EN REGLAS-002-AGENTES-PARTE2.md**
**Archivo:** REGLAS-002-AGENTES-PARTE1.md  
**V.1