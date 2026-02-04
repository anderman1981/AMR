# 🎭 AGENTES INTELIGENTES - PATRONES Y ARQUITECTURA - Parte 2
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-006-AGENT-PATTERNS-PARTE2.md

---

## 🎭 PATRONES DE AGENTES ESPECIALIZADOS (continuación)

### Patrón 2: DataAnalysisAgent (completo)
```javascript
  async generatePerformanceInsights(data, statistics) {
    const prompt = `
You are a data analyst expert. Analyze this performance data and provide actionable insights:

DATA: ${JSON.stringify(data, null, 2)}

STATISTICS: ${JSON.stringify(statistics, null, 2)}

Please provide insights on:
1. Key performance trends
2. Areas of improvement
3. Success factors
4. Potential risks or issues

Return insights in this JSON format:
{
  "key_insights": [
    {
      "area": "engagement",
      "finding": "Engagement increased by 25%",
      "impact": "high",
      "confidence": 0.9
    }
  ],
  "trends": [
    {
      "metric": "conversion_rate",
      "direction": "increasing",
      "rate": 0.15,
      "significance": "high"
    }
  ],
  "recommendations": [
    {
      "action": "Increase content frequency",
      "expected_impact": "+15% engagement",
      "priority": "high"
    }
  ]
}
`.trim();

    const response = await this.think(prompt, {
      temperature: 0.4,
      max_tokens: 1000
    });

    try {
      return JSON.parse(response.text);
    } catch (error) {
      console.error('Failed to parse insights:', error);
      return { key_insights: [], trends: [], recommendations: [] };
    }
  }

  async detectPatterns(data, context) {
    const { dataset, pattern_types } = data;
    
    const patterns = [];
    
    for (const patternType of pattern_types) {
      switch (patternType) {
        case 'seasonal':
          patterns.push(...this.detectSeasonalPatterns(dataset));
          break;
        case 'correlation':
          patterns.push(...this.detectCorrelations(dataset));
          break;
        case 'anomaly':
          patterns.push(...this.detectAnomalies(dataset));
          break;
      }
    }
    
    // Use LLM to validate and enhance patterns
    const validatedPatterns = await this.validatePatterns(patterns);
    
    return {
      patterns: validatedPatterns,
      dataset_size: dataset.length,
      analysis_method: 'statistical + llm_validation',
      confidence: this.calculateAverageConfidence(validatedPatterns)
    };
  }

  detectSeasonalPatterns(dataset) {
    // Implementation of seasonal pattern detection
    const patterns = [];
    
    // Group data by time periods
    const monthlyData = this.groupByMonth(dataset);
    
    // Calculate seasonal indices
    const seasonalIndices = {};
    for (const [month, data] of Object.entries(monthlyData)) {
      const avgValue = data.reduce((sum, item) => sum + item.value, 0) / data.length;
      seasonalIndices[month] = avgValue;
    }
    
    // Identify seasonal patterns
    const overallAvg = Object.values(seasonalIndices).reduce((a, b) => a + b) / 12;
    
    for (const [month, value] of Object.entries(seasonalIndices)) {
      const seasonalIndex = value / overallAvg;
      
      if (seasonalIndex > 1.2) {
        patterns.push({
          type: 'seasonal_peak',
          period: month,
          intensity: seasonalIndex,
          description: `Seasonal peak in ${month} with ${((seasonalIndex - 1) * 100).toFixed(1)}% above average`
        });
      } else if (seasonalIndex < 0.8) {
        patterns.push({
          type: 'seasonal_low',
          period: month,
          intensity: seasonalIndex,
          description: `Seasonal low in ${month} with ${((1 - seasonalIndex) * 100).toFixed(1)}% below average`
        });
      }
    }
    
    return patterns;
  }

  async validatePatterns(patterns) {
    const prompt = `
You are a data validation expert. Review these detected patterns for validity:

PATTERNS: ${JSON.stringify(patterns, null, 2)}

For each pattern, assess:
1. Statistical significance
2. Business relevance
3. Reliability (1-10)
4. Actionability (1-10)

Return validated patterns with confidence scores:
{
  "validated_patterns": [
    {
      "type": "seasonal_peak",
      "period": "December",
      "confidence": 0.85,
      "statistical_significance": "high",
      "business_relevance": "high",
      "recommendation": "Increase marketing spend in December"
    }
  ]
}
`.trim();

    const response = await this.think(prompt, {
      temperature: 0.3,
      max_tokens: 800
    });

    try {
      const result = JSON.parse(response.text);
      return result.validated_patterns || patterns;
    } catch (error) {
      return patterns;
    }
  }

  calculateConfidence(insights) {
    const insightsArray = insights.key_insights || [];
    if (insightsArray.length === 0) return 0;
    
    const totalConfidence = insightsArray.reduce((sum, insight) => sum + (insight.confidence || 0), 0);
    return totalConfidence / insightsArray.length;
  }

  parseTimePeriod(timePeriod) {
    const units = {
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000
    };
    
    return units[timePeriod] || units['1d'];
  }
}

module.exports = DataAnalysisAgent;
```

### Patrón 3: TaskOrchestratorAgent
```javascript
class TaskOrchestratorAgent extends BaseAgent {
  constructor(config, llmManager, database, redis) {
    super('TaskOrchestratorAgent', config, llmManager, database, redis);
    this.availableAgents = new Map();
    this.workflowTemplates = new Map();
    this.activeWorkflows = new Map();
  }

  async initializeResources() {
    // Load workflow templates
    await this.loadWorkflowTemplates();
    
    // Register available agents
    await this.registerAgents();
  }

  async registerEventHandlers() {
    // Handle agent registration
    this.on('agent_registered', async (event) => {
      const { agent_name, capabilities } = event.data;
      this.availableAgents.set(agent_name, capabilities);
      console.log(`Agent ${agent_name} registered with capabilities:`, capabilities);
    });

    // Handle workflow completion
    this.on('workflow_completed', async (event) => {
      const { workflow_id, result } = event.data;
      this.activeWorkflows.delete(workflow_id);
      
      // Log completion
      await this.logWorkflowCompletion(workflow_id, result);
    });

    // Handle agent failure
    this.on('agent_failed', async (event) => {
      const { agent_name, task_id, error } = event.data;
      await this.handleAgentFailure(agent_name, task_id, error);
    });
  }

  async doExecute(task, context) {
    switch (task.type) {
      case 'orchestrate_workflow':
        return await this.orchestrateWorkflow(task.data, context);
      
      case 'create_workflow':
        return await this.createWorkflow(task.data, context);
      
      case 'assign_task':
        return await this.assignTask(task.data, context);
      
      case 'monitor_workflow':
        return await this.monitorWorkflow(task.data, context);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async orchestrateWorkflow(data, context) {
    const { workflow_name, input_data, priority = 'normal' } = data;
    
    // Get workflow template
    const workflow = this.workflowTemplates.get(workflow_name);
    if (!workflow) {
      throw new Error(`Workflow template not found: ${workflow_name}`);
    }

    // Create workflow instance
    const workflowInstance = {
      id: this.generateWorkflowId(),
      name: workflow_name,
      status: 'initializing',
      steps: workflow.steps,
      current_step: 0,
      input_data,
      context,
      priority,
      created_at: Date.now(),
      results: [],
      errors: []
    };

    this.activeWorkflows.set(workflowInstance.id, workflowInstance);

    try {
      // Execute workflow steps
      const result = await this.executeWorkflow(workflowInstance);
      
      return {
        workflow_id: workflowInstance.id,
        status: 'completed',
        result,
        execution_time: Date.now() - workflowInstance.created_at,
        steps_executed: workflowInstance.current_step
      };
      
    } catch (error) {
      workflowInstance.status = 'failed';
      workflowInstance.errors.push({
        step: workflowInstance.current_step,
        error: error.message,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }

  async executeWorkflow(workflow) {
    workflow.status = 'running';
    
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      workflow.current_step = i;
      
      console.log(`[${this.name}] Executing workflow step ${i + 1}/${workflow.steps.length}: ${step.name}`);
      
      try {
        const stepResult = await this.executeWorkflowStep(step, workflow);
        
        workflow.results.push({
          step: step.name,
          result: stepResult,
          executed_at: Date.now()
        });
        
        // Update context with step result
        workflow.context[step.name] = stepResult;
        
        // Check if workflow should continue
        if (step.conditional && !this.evaluateCondition(step.conditional, workflow.context)) {
          console.log(`[${this.name}] Workflow condition failed, skipping remaining steps`);
          break;
        }
        
      } catch (error) {
        workflow.errors.push({
          step: step.name,
          error: error.message,
          timestamp: Date.now()
        });
        
        if (step.critical) {
          throw new Error(`Critical step failed: ${step.name} - ${error.message}`);
        } else {
          console.warn(`[${this.name}] Non-critical step failed: ${step.name} - ${error.message}`);
          continue;
        }
      }
    }
    
    workflow.status = 'completed';
    
    // Emit workflow completion event
    await this.emitEvent('workflow_completed', {
      workflow_id: workflow.id,
      result: workflow.results
    });
    
    return workflow.results;
  }

  async executeWorkflowStep(step, workflow) {
    const { agent, task_type, task_data, timeout = 300000 } = step;
    
    // Check if agent is available
    if (!this.availableAgents.has(agent)) {
      throw new Error(`Agent ${agent} not available`);
    }
    
    // Prepare task for agent
    const task = {
      type: task_type,
      data: {
        ...task_data,
        ...workflow.context // Pass workflow context
      }
    };
    
    // Send task to agent via Redis
    const taskMessage = {
      id: this.generateTaskId(),
      agent,
      task,
      context: workflow.context,
      workflow_id: workflow.id,
      timeout,
      timestamp: Date.now()
    };
    
    await this.redis.publish('agent_tasks', JSON.stringify(taskMessage));
    
    // Wait for result with timeout
    const result = await this.waitForTaskResult(taskMessage.id, timeout);
    
    return result;
  }

  async waitForTaskResult(taskId, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task ${taskId} timed out after ${timeout}ms`));
      }, timeout);
      
      // Subscribe to task results
      const subscriber = this.redis.duplicate();
      
      subscriber.subscribe('task_results', (message) => {
        const result = JSON.parse(message);
        
        if (result.task_id === taskId) {
          clearTimeout(timeoutId);
          subscriber.unsubscribe();
          subscriber.quit();
          
          if (result.success) {
            resolve(result.result);
          } else {
            reject(new Error(result.error));
          }
        }
      });
    });
  }

  async createWorkflow(data, context) {
    const { name, description, steps, metadata } = data;
    
    const workflow = {
      name,
      description,
      steps,
      metadata,
      created_at: Date.now(),
      created_by: this.name
    };
    
    // Save workflow template
    await this.database.collection('workflow_templates').insertOne(workflow);
    
    // Load into memory
    this.workflowTemplates.set(name, workflow);
    
    return {
      workflow_name: name,
      status: 'created',
      steps_count: steps.length
    };
  }

  async assignTask(data, context) {
    const { task_type, task_data, preferred_agent = null } = data;
    
    // Find suitable agent
    const agent = this.findBestAgent(task_type, preferred_agent);
    
    if (!agent) {
      throw new Error(`No suitable agent found for task type: ${task_type}`);
    }
    
    // Create task assignment
    const assignment = {
      id: this.generateTaskId(),
      task_type,
      task_data,
      assigned_to: agent,
      assigned_by: this.name,
      context,
      status: 'assigned',
      created_at: Date.now()
    };
    
    // Send task to agent
    await this.redis.publish('agent_tasks', JSON.stringify(assignment));
    
    return {
      task_id: assignment.id,
      assigned_agent: agent,
      status: 'assigned'
    };
  }

  findBestAgent(taskType, preferredAgent) {
    // If preferred agent is specified and available, use it
    if (preferredAgent && this.availableAgents.has(preferredAgent)) {
      const capabilities = this.availableAgents.get(preferredAgent);
      if (capabilities.task_types.includes(taskType)) {
        return preferredAgent;
      }
    }
    
    // Find best agent based on capabilities and load
    let bestAgent = null;
    let bestScore = -1;
    
    for (const [agentName, capabilities] of this.availableAgents) {
      if (!capabilities.task_types.includes(taskType)) {
        continue;
      }
      
      // Calculate score based on availability, performance, and specialization
      const score = this.calculateAgentScore(agentName, capabilities, taskType);
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agentName;
      }
    }
    
    return bestAgent;
  }

  calculateAgentScore(agentName, capabilities, taskType) {
    let score = 0;
    
    // Base score for capability match
    score += 50;
    
    // Bonus for specialization
    if (capabilities.specializations && capabilities.specializations.includes(taskType)) {
      score += 20;
    }
    
    // Performance bonus (lower error rate = higher score)
    const errorRate = capabilities.error_rate || 0.1;
    score += Math.max(0, 20 - (errorRate * 100));
    
    // Load penalty (fewer active tasks = higher score)
    const activeTasks = capabilities.active_tasks || 0;
    score += Math.max(0, 10 - activeTasks);
    
    return score;
  }

  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async loadWorkflowTemplates() {
    const templates = await this.database.collection('workflow_templates').find({}).toArray();
    
    for (const template of templates) {
      this.workflowTemplates.set(template.name, template);
    }
    
    console.log(`[${this.name}] Loaded ${templates.length} workflow templates`);
  }

  async registerAgents() {
    // Get registered agents from Redis
    const agents = await this.redis.keys('agent:*:heartbeat');
    
    for (const key of agents) {
      const agentName = key.split(':')[1];
      const heartbeat = await this.redis.get(key);
      
      if (heartbeat) {
        const data = JSON.parse(heartbeat);
        this.availableAgents.set(agentName, {
          status: data.status,
          last_seen: data.timestamp,
          active_tasks: data.active_tasks || 0,
          // Capabilities would be loaded from agent registry
        });
      }
    }
    
    console.log(`[${this.name}] Registered ${this.availableAgents.size} agents`);
  }
}

module.exports = TaskOrchestratorAgent;
```

---

## 🔄 COMUNICACIÓN ENTRE AGENTES

### Protocolo de Mensajería
```javascript
class AgentMessageProtocol {
  constructor(redis) {
    this.redis = redis;
    this.channels = {
      tasks: 'agent_tasks',
      results: 'task_results',
      events: 'agent_events',
      heartbeat: 'agent_heartbeat'
    };
  }

  async sendMessage(fromAgent, toAgent, message) {
    const envelope = {
      id: this.generateMessageId(),
      from_agent: fromAgent,
      to_agent: toAgent,
      timestamp: Date.now(),
      message_type: message.type,
      priority: message.priority || 'normal',
      payload: message.payload,
      response_required: message.response_required || false,
      timeout_ms: message.timeout_ms || 30000,
      correlation_id: message.correlation_id || null
    };

    await this.redis.publish(this.channels.tasks, JSON.stringify(envelope));
    
    return envelope.id;
  }

  async sendResponse(originalMessage, response) {
    const envelope = {
      id: this.generateMessageId(),
      from_agent: response.from_agent,
      to_agent: originalMessage.from_agent,
      timestamp: Date.now(),
      message_type: 'response',
      priority: originalMessage.priority,
      payload: response.payload,
      correlation_id: originalMessage.id,
      response_to: originalMessage.id
    };

    await this.redis.publish(this.channels.results, JSON.stringify(envelope));
    
    return envelope.id;
  }

  async broadcastEvent(fromAgent, eventType, data) {
    const event = {
      id: this.generateMessageId(),
      from_agent: fromAgent,
      timestamp: Date.now(),
      event_type: eventType,
      payload: data
    };

    await this.redis.publish(this.channels.events, JSON.stringify(event));
    
    return event.id;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 📊 MONITOREO Y HEALTH CHECKS

### Sistema de Monitoreo de Agentes
```javascript
class AgentMonitor {
  constructor(redis, database) {
    this.redis = redis;
    this.database = database;
    this.agentStatus = new Map();
  }

  async startMonitoring() {
    // Check agent health every 30 seconds
    setInterval(async () => {
      await this.checkAllAgentsHealth();
    }, 30000);
    
    // Subscribe to agent events
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe('agent_events');
    
    subscriber.on('message', (channel, message) => {
      const event = JSON.parse(message);
      this.handleAgentEvent(event);
    });
  }

  async checkAllAgentsHealth() {
    const agents = await this.redis.keys('agent:*:heartbeat');
    
    for (const key of agents) {
      const agentName = key.split(':')[1];
      const heartbeat = await this.redis.get(key);
      
      if (heartbeat) {
        const data = JSON.parse(heartbeat);
        const health = this.assessAgentHealth(data);
        
        this.agentStatus.set(agentName, health);
        
        // Alert if agent is unhealthy
        if (health.status !== 'healthy') {
          await this.sendHealthAlert(agentName, health);
        }
      } else {
        // Agent not found, mark as missing
        this.agentStatus.set(agentName, {
          status: 'missing',
          last_seen: null,
          issue: 'No heartbeat received'
        });
      }
    }
  }

  assessAgentHealth(heartbeatData) {
    const now = Date.now();
    const lastSeen = heartbeatData.timestamp;
    const timeSinceLastSeen = now - lastSeen;
    
    const health = {
      agent: heartbeatData.agent,
      status: 'healthy',
      last_seen: lastSeen,
      metrics: heartbeatData.metrics,
      issues: []
    };

    // Check heartbeat age
    if (timeSinceLastSeen > 120000) { // 2 minutes
      health.status = 'unhealthy';
      health.issues.push(`No heartbeat for ${Math.round(timeSinceLastSeen / 1000)}s`);
    }

    // Check error rate
    const errorRate = heartbeatData.metrics?.error_rate || 0;
    if (errorRate > 0.1) { // 10% error rate
      health.status = 'degraded';
      health.issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }

    // Check active tasks
    const activeTasks = heartbeatData.metrics?.active_tasks || 0;
    const maxConcurrent = heartbeatData.metrics?.max_concurrent_tasks || 1;
    
    if (activeTasks >= maxConcurrent) {
      health.status = 'degraded';
      health.issues.push('Agent at maximum capacity');
    }

    // Check memory usage
    const memoryUsage = heartbeatData.metrics?.memory_usage || 0;
    if (memoryUsage > 512) { // 512MB
      health.status = 'degraded';
      health.issues.push(`High memory usage: ${memoryUsage}MB`);
    }

    return health;
  }

  async sendHealthAlert(agentName, health) {
    const alert = {
      type: 'agent_health',
      agent: agentName,
      status: health.status,
      issues: health.issues,
      timestamp: Date.now()
    };

    // Send to monitoring system
    await this.database.collection('alerts').insertOne(alert);
    
    // Publish alert event
    await this.redis.publish('system_alerts', JSON.stringify(alert));
    
    console.warn(`Agent health alert: ${agentName} - ${health.status}`, health.issues);
  }

  getSystemHealth() {
    const agents = Array.from(this.agentStatus.values());
    
    const healthy = agents.filter(a => a.status === 'healthy').length;
    const degraded = agents.filter(a => a.status === 'degraded').length;
    const unhealthy = agents.filter(a => a.status === 'unhealthy').length;
    const missing = agents.filter(a => a.status === 'missing').length;
    
    return {
      total_agents: agents.length,
      healthy,
      degraded,
      unhealthy,
      missing,
      overall_status: this.calculateOverallStatus(healthy, degraded, unhealthy, missing),
      timestamp: Date.now()
    };
  }

  calculateOverallStatus(healthy, degraded, unhealthy, missing) {
    const total = healthy + degraded + unhealthy + missing;
    
    if (unhealthy > 0 || missing > 0) {
      return 'critical';
    }
    
    if (degraded > 0) {
      return 'warning';
    }
    
    if (healthy === total && total > 0) {
      return 'healthy';
    }
    
    return 'unknown';
  }
}
```

---

## 🔧 CONFIGURACIÓN DE AGENTES

### Archivo de Configuración Central
```javascript
// config/agents.js
module.exports = {
  // Configuración global de agentes
  global: {
    max_concurrent_tasks_per_agent: 3,
    default_timeout_ms: 300000,
    heartbeat_interval_ms: 30000,
    health_check_interval_ms: 60000,
    redis_key_ttl: 3600
  },

  // Tipos de agentes y sus capacidades
  agent_types: {
    content_generator: {
      class: 'ContentGeneratorAgent',
      capabilities: [
        'generate_post',
        'optimize_content',
        'personalize_content',
        'create_content_calendar'
      ],
      specializations: ['social_media', 'email_marketing'],
      max_memory_mb: 256,
      required_models: ['llama3:latest', 'codellama:latest']
    },

    data_analyst: {
      class: 'DataAnalysisAgent',
      capabilities: [
        'analyze_performance',
        'detect_patterns',
        'predict_trends',
        'generate_insights'
      ],
      specializations: ['statistical_analysis', 'pattern_recognition'],
      max_memory_mb: 512,
      required_models: ['llama3:latest', 'codellama:latest']
    },

    task_orchestrator: {
      class: 'TaskOrchestratorAgent',
      capabilities: [
        'orchestrate_workflow',
        'create_workflow',
        'assign_task',
        'monitor_workflow'
      ],
      specializations: ['workflow_management', 'resource_allocation'],
      max_memory_mb: 128,
      required_models: ['llama3:latest']
    }
  },

  // Plantillas de flujo de trabajo
  workflows: {
    content_creation_pipeline: {
      name: 'content_creation_pipeline',
      description: 'Complete content creation and distribution',
      steps: [
        {
          name: 'generate_content',
          agent: 'content_generator',
          task_type: 'generate_post',
          critical: true
        },
        {
          name: 'optimize_content',
          agent: 'content_generator',
          task_type: 'optimize_content',
          conditional: 'content_generated'
        },
        {
          name: 'analyze_performance',
          agent: 'data_analyst',
          task_type: 'analyze_performance'
        }
      ]
    },

    analysis_workflow: {
      name: 'analysis_workflow',
      description: 'Data analysis and insight generation',
      steps: [
        {
          name: 'collect_data',
          agent: 'data_analyst',
          task_type: 'detect_patterns'
        },
        {
          name: 'generate_insights',
          agent: 'data_analyst',
          task_type: 'generate_insights'
        }
      ]
    }
  },

  // Configuración de modelos LLM
  llm_models: {
    'llama3:latest': {
      provider: 'ollama',
      capabilities: ['text_generation', 'chat', 'analysis'],
      max_tokens: 4096,
      cost_per_token: 0.0
    },
    'codellama:latest': {
      provider: 'ollama',
      capabilities: ['code_generation', 'text_generation'],
      max_tokens: 4096,
      cost_per_token: 0.0
    }
  }
};
```

---

## 📚 CONCLUSIONES Y MEJORAS

### Resumen de Patrones Implementados

1. **BaseAgent**: Clase fundamental obligatoria con ciclo de vida completo
2. **ContentGeneratorAgent**: Especializado en generación y optimización de contenido
3. **DataAnalysisAgent**: Foco en análisis estadístico y detección de patrones
4. **TaskOrchestratorAgent**: Coordinación de múltiples agentes y flujos de trabajo
5. **AgentMessageProtocol**: Protocolo estandarizado de comunicación
6. **AgentMonitor**: Sistema completo de monitoreo y health checks

### Mejoras Futuras Planificadas

```markdown
## Roadmap de Agentes v2.0

### v1.1 - Mejoras de Rendimiento
- [ ] Pool de conexiones a base de datos
- [ ] Cache inteligente de resultados LLM
- [ ] Compresión de mensajes Redis
- [ ] Balanceador de carga automático

### v1.2 - Nuevos Agentes
- [ ] LearningAgent - Aprendizaje automático
- [ ] SecurityAgent - Auditoría de seguridad
- [ ] IntegrationAgent - Conexión con APIs externas
- [ ] BackupAgent - Gestión de copias de seguridad

### v1.3 - Características Avanzadas
- [ ] Agentes auto-replicantes
- [ ] Sistema de prioridades dinámicas
- [ ] Machine Learning para optimización
- [ ] Interfaz web de administración
```

---

**ESTE DOCUMENTO DEFINE LOS PATRONES DE AGENTES**  
**Archivo:** REGLAS-006-AGENT-PATTERNS.md  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-02

*Los patrones aquí definidos deben seguirse estrictamente para garantizar consistencia en todo el sistema.*