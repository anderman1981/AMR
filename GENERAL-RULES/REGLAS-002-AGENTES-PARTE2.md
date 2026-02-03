# 🔄 TASK SCHEDULING Y TESTING DE AGENTES
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-002-AGENTES-PARTE2.md

---

## 🔄 TASK SCHEDULING Y QUEUE MANAGEMENT

### Task Queue Schema
```sql
CREATE TABLE agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    task_data JSONB NOT NULL,
    context JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    result JSONB,
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_agent_tasks_status (status),
    INDEX idx_agent_tasks_agent (agent_name),
    INDEX idx_agent_tasks_priority (priority DESC),
    INDEX idx_agent_tasks_scheduled (scheduled_at)
);
```

### Task Prioritization Rules
1. **Critical**: System health, security issues
2. **High**: User-facing tasks, time-sensitive
3. **Medium**: Regular processing, maintenance
4. **Low**: Analytics, batch jobs

---

## 🧪 TESTING DE AGENTES

### Unit Testing Pattern
```javascript
describe('ContentAgent', () => {
  let agent;
  let mockLLM;
  let mockDatabase;

  beforeEach(() => {
    mockLLM = new MockLLMManager();
    mockDatabase = new MockDatabase();
    agent = new ContentAgent(mockLLM, mockDatabase);
  });

  test('should generate Instagram post successfully', async () => {
    // Arrange
    const task = {
      type: 'generate_post',
      data: {
        product: {
          name: 'Test Course',
          niche: 'Personal Development'
        },
        platform: 'instagram'
      }
    };

    mockLLM.setResponse(JSON.stringify({
      hook: "Transform your life today!",
      body: "Discover the secrets...",
      cta: "Click link in bio",
      hashtags: ["#transformation", "#success"]
    }));

    // Act
    const result = await agent.execute(task);

    // Assert
    expect(result.success).toBe(true);
    expect(result.result.hook).toBeDefined();
    expect(result.result.hashtags).toHaveLength(2);
    expect(mockLLM.generate).toHaveBeenCalled();
  });
});
```

### Integration Testing
```javascript
describe('Agent Orchestration', () => {
  test('should complete content generation workflow', async () => {
    // 1. Manager assigns task to ContentAgent
    const assignment = await managerAgent.assignTask({
      type: 'generate_content',
      agent: 'ContentAgent',
      data: { product: testProduct }
    });

    // 2. ContentAgent generates content
    const content = await contentAgent.execute(assignment.task);

    // 3. InstagramAgent receives content for publishing
    const publishTask = await managerAgent.assignTask({
      type: 'publish_content',
      agent: 'InstagramAgent',
      data: content.result
    });

    // 4. Verify complete workflow
    expect(publishTask.success).toBe(true);
    expect(content.success).toBe(true);
  });
});
```

### E2E Testing Scenarios
```javascript
describe('Agent System E2E', () => {
  test('should process product discovery to content publishing', async () => {
    // 1. DetectorAgent discovers new product
    const product = await detectorAgent.scanMarketplace();
    expect(product).toBeDefined();
    expect(product.score).toBeGreaterThan(0.7);

    // 2. ContentAgent generates promotional content
    const content = await contentAgent.execute({
      type: 'generate_post',
      data: {
        product,
        platforms: ['instagram', 'tiktok']
      }
    });
    expect(content.success).toBe(true);
    expect(content.result.length).toBe(2); // One for each platform

    // 3. InstagramAgent publishes content
    const publishResult = await instagramAgent.execute({
      type: 'publish_post',
      data: {
        content: content.result[0],
        schedule: 'immediate'
      }
    });
    expect(publishResult.success).toBe(true);

    // 4. LearningAgent analyzes performance
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for engagement
    const analysis = await learningAgent.execute({
      type: 'analyze_performance',
      data: {
        content_id: publishResult.result.post_id,
        timeframe: '24h'
      }
    });
    expect(analysis.success).toBe(true);
    expect(analysis.result.insights).toBeDefined();
  });
});
```

---

## 🚨 ERROR HANDLING Y RECOVERY

### Error Classification
1. **Transient Errors**: Retries con exponential backoff
2. **Permanent Errors**: Logging y notificación
3. **Catastrophic Errors**: Shutdown y recovery procedure

### Retry Strategy
```javascript
class RetryManager {
  static async executeWithRetry(fn, options = {}) {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
      retryCondition = (error) => true
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;
        }

        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );

        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}
```

### Circuit Breaker Pattern
```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(provider, operation, ...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error(`Circuit breaker OPEN for ${provider}`);
      }
    }

    try {
      const result = await operation(...args);
      this.onSuccess(provider);
      return result;
    } catch (error) {
      this.onFailure(provider);
      throw error;
    }
  }

  onSuccess(provider) {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 2) { // Need 2 successes to close
        this.state = 'CLOSED';
      }
    }
  }

  onFailure(provider) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Caching Strategy
- **LLM Responses**: Cache común por 1 hora
- **Generated Content**: Cache por 24 horas
- **Agent Status**: Cache por 30 segundos
- **Database Queries**: Redis query cache

### Resource Management
```javascript
class ResourceManager {
  constructor() {
    this.pools = {
      llm: new LLMPool({ max: 10, idle: 2 }),
      database: new DBPool({ max: 20, idle: 5 }),
      http: new HTTPPool({ max: 50, idle: 10 })
    };
  }

  async executeWithResource(type, operation) {
    const resource = await this.pools[type].acquire();
    try {
      return await operation(resource);
    } finally {
      this.pools[type].release(resource);
    }
  }
}
```

---

## 🔗 CONFIGURACIÓN Y DEPLOYMENT

### Environment Configuration
```yaml
agents:
  manager:
    enabled: true
    concurrency: 1
    timeout_ms: 30000
    
  detector:
    enabled: true
    concurrency: 3
    schedule: "*/30 * * * *"
    
  content:
    enabled: true
    concurrency: 5
    timeout_ms: 60000
    
  instagram:
    enabled: false # Requires API keys
    concurrency: 2
    
  learning:
    enabled: true
    concurrency: 1
    schedule: "0 2 * * *" # 2 AM daily

monitoring:
  health_check_interval: 30 # seconds
  metrics_retention_days: 30
  alert_thresholds:
    error_rate: 0.05 # 5%
    response_time_ms: 5000
    memory_usage_percent: 80
```

---

## 🎯 SUCCESS METRICS

### Agent Performance Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Task Success Rate | > 95% | Database queries |
| Average Response Time | < 5s | Task execution logs |
| Agent Uptime | > 99% | Heartbeat monitoring |
| Error Rate | < 5% | Error tracking |
| Resource Utilization | < 80% | System monitoring |

### Business Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Content Generated | 100+/day | Content database |
| Engagement Rate | > 3% | Social media APIs |
| Conversion Rate | > 1% | Analytics tracking |
| Cost Per Content | <$0.10 | LLM usage tracking |

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Para Nuevos Agentes
- [ ] Heredar de BaseAgent
- [ ] Implementar métodos abstractos
- [ ] Configurar LLM integration
- [ ] Definir métricas específicas
- [ ] Crear tests unitarios
- [ ] Crear tests de integración
- [ ] Documentar API endpoints
- [ ] Configurar health checks

### Para Agentes Existentes
- [ ] Validar cumplimiento de SOLID
- [ ] Verificar manejo de errores
- [ ] Optimizar performance
- [ ] Actualizar tests
- [ ] Revisar documentación
- [ ] Verificar configuración
- [ ] Testear fallback mechanisms
- [ ] Validar métricas

---

## 🔗 REFERENCIAS Y DEPENDENCIAS

### Archivos Relacionados
- **REGLAS-005-LLM-INTEGRATION.md**: Integración con LLM providers
- **REGLAS-006-AGENT-PATTERNS.md**: Patrones avanzados de agentes
- **REGLAS-001-ARQUITECTURA.md**: Arquitectura general del sistema
- **REGLAS-004-DESARROLLO.md**: Estándares de código y testing

### Dependencias Externas
- **Node.js 20+**: Runtime principal
- **Redis**: Message broker y cache
- **PostgreSQL**: Base de datos persistente
- **Ollama**: LLM provider local
- **Docker**: Containerización y deployment

---

## 🚨 EMERGENCY PROCEDURES

### Agent Failure Response
1. **Detection**: Heartbeat timeout > 2 minutos
2. **Isolation**: Remover de task rotation
3. **Recovery**: Intentar reinicio automático
4. **Escalation**: Notificar si falla > 3 veces
5. **Manual Intervention**: Investigar logs y métricas

### System-Wide Failures
1. **Circuit Breakers**: Activar automáticamente
2. **Fallback Providers**: Cambiar a provider secundario
3. **Queue Management**: Pausar nuevas tareas
4. **Data Preservation**: Backup de estado actual
5. **Recovery Plan**: Procedimiento de restauración

---

**ESTE DOCUMENTO COMPLETA EL SISTEMA DE AGENTES**  
Ve a REGLAS-002-AGENTES-PARTE1.md para la primera parte.

**Archivo:** REGLAS-002-AGENTES-PARTE2.md  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-02