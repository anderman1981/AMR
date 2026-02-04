---
trigger: always_on
---

# 🎭 AGENTES INTELIGENTES - PATRONES Y ARQUITECTURA - Parte 1
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-006-AGENT-PATTERNS-PARTE1.md

---

## 🎯 FILOSOFÍA DE AGENTES

> **"Cada agente es un experto en UNA cosa, y trabaja en conjunto con otros expertos"**

El sistema está diseñado alrededor de agentes especializados que colaboran para lograr objetivos complejos. Cada agente tiene una responsabilidad clara y definida.

---

## 🏗️ ARQUITECTURA BASE DE AGENTES

### Estructura de Herencia
```javascript
// BaseAgent.js - Clase fundamental OBLIGATORIA
class BaseAgent {
  constructor(name, config, llmManager, database, redis) {
    this.name = name;
    this.config = config;
    this.llm = llmManager;
    this.database = database;
    this.redis = redis;
    
    // Estado del agente
    this.status = 'idle'; // idle, initializing, running, error, stopped
    this.lastHeartbeat = Date.now();
    
    // Métricas del agente
    this.metrics = {
      tasks_completed: 0,
      tasks_failed: 0,
      avg_execution_time: 0,
      uptime_percentage: 0,
      memory_usage: 0,
      error_rate: 0
    };
    
    // Configuración del agente
    this.maxConcurrentTasks = config.max_concurrent_tasks || 1;
    this.taskTimeout = config.task_timeout ||300000; // 5 minutes
    this.retryAttempts = config.retry_attempts || 3;
    
    // Cola de tareas
    this.taskQueue = [];
    this.activeTasks = new Map();
    
    // Handlers de eventos
    this.eventHandlers = new Map();
  }

  // === LIFECYCLE METHODS ===
  
  async initialize() {
    console.log(`[${this.name}] Initializing...`);
    this.status = 'initializing';
    
    try {
      // Validar configuración
      await this.validateConfig();
      
      // Inicializar recursos
      await this.initializeResources();
      
      // Registrar handlers de eventos
      await this.registerEventHandlers();
      
      // Iniciar heartbeat
      this.startHeartbeat();
      
      this.status = 'ready';
      console.log(`[${this.name}] Initialized successfully`);
      
    } catch (error) {
      this.status = 'error';
      console.error(`[${this.name}] Initialization failed:`, error);
      throw error;
    }
  }

  async start() {
    console.log(`[${this.name}] Starting...`);
    
    if (this.status !== 'ready') {
      throw new Error(`Agent ${this.name} not ready. Current status: ${this.status}`);
    }
    
    this.status = 'running';
    this.startTime = Date.now();
    
    // Iniciar procesamiento de tareas
    this.startTaskProcessor();
    
    // Emitir evento de inicio
    await this.emitEvent('agent_started', {
      agent: this.name,
      timestamp: Date.now()
    });
    
    console.log(`[${this.name}] Started successfully`);
  }

  async stop() {
    console.log(`[${this.name}] Stopping...`);
    
    this.status = 'stopping';
    
    // Detener procesamiento de nuevas tareas
    this.stopTaskProcessor();
    
    // Esperar que las tareas activas terminen
    await this.waitForActiveTasks();
    
    // Limpiar recursos
    await this.cleanupResources();
    
    this.status = 'stopped';
    
    // Emitir evento de detención
    await this.emitEvent('agent_stopped', {
      agent: this.name,
      timestamp: Date.now(),
      final_metrics: this.metrics
    });
    
    console.log(`[${this.name}] Stopped successfully`);
  }

  // === TASK EXECUTION ===
  
  async execute(task, context = {}) {
    const taskId = this.generateTaskId();
    const startTime = Date.now();
    
    try {
      console.log(`[${this.name}] Executing task ${taskId}: ${task.type}`);
      
      // Validar tarea
      this.validateTask(task);
      
      // Verificar límites de concurrencia
      if (this.activeTasks.size >= this.maxConcurrentTasks) {
        throw new Error(`Agent ${this.name} at maximum concurrent tasks`);
      }
      
      // Crear registro de tarea
      const taskRecord = {
        id: taskId,
        type: task.type,
        data: task.data,
        context,
        status: 'running',
        startTime,
        agent: this.name
      };
      
      this.activeTasks.set(taskId, taskRecord);
      
      // Pre-execution hook
      await this.beforeExecute(task, context);
      
      // Ejecución principal
      const result = await Promise.race([
        this.doExecute(task, context),
        this.createTimeoutPromise(taskId)
      ]);
      
      // Post-execution hook
      await this.afterExecute(task, context, result);
      
      // Actualizar métricas
      this.metrics.tasks_completed++;
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);
      
      // Limpiar tarea activa
      this.activeTasks.delete(taskId);
      
      const response = {
        success: true,
        result,
        execution_time: executionTime,
        agent: this.name,
        task_id: taskId
      };
      
      // Emitir evento de éxito
      await this.emitEvent('task_completed', response);
      
      return response;
      
    } catch (error) {
      this.metrics.tasks_failed++;
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, false);
      
      console.error(`[${this.name}] Task ${taskId} failed:`, error);
      
      // Limpiar tarea activa
      this.activeTasks.delete(taskId);
      
      const response = {
        success: false,
        error: error.message,
        stack: error.stack,
        execution_time: executionTime,
        agent: this.name,
        task_id: taskId
      };
      
      // Emitir evento de error
      await this.emitEvent('task_failed', response);
      
      return response;
    }
  }

  // === ABSTRACT METHODS (must implement) ===
  
  async validateConfig() {
    throw new Error('validateConfig must be implemented by subclass');
  }

  async initializeResources() {
    // Override to add specific resource initialization
  }

  async registerEventHandlers() {
    // Override to add specific event handlers
  }

  async doExecute(task, context) {
    throw new Error('doExecute must be implemented by subclass');
  }

  async validateTask(task) {
    if (!task.type) {
      throw new Error('Task type is required');
    }
    if (!task.data) {
      throw new Error('Task data is required');
    }
  }

  // === HOOK METHODS (optional overrides) ===
  
  async beforeExecute(task, context) {
    // Override to add pre-execution logic
  }

  async afterExecute(task, context, result) {
    // Override to add post-execution logic
  }

  // === LLM INTEGRATION ===
  
  async think(prompt, options = {}) {
    const llmOptions = {
      model: this.config.llm_model || 'llama3:latest',
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.max_tokens || 2000,
      ...options
    };

    try {
      const result = await this.llm.generate(prompt, llmOptions);
      
      // Track LLM usage
      await this.trackLLMUsage('think', prompt, result);
      
      return result;
    } catch (error) {
      console.error(`[${this.name}] LLM call failed:`, error);
      throw new Error(`LLM generation failed: ${error.message}`);
    }
  }

  async chat(messages, options = {}) {
    const llmOptions = {
      model: this.config.llm_model || 'llama3:latest',
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.max_tokens || 2000,
      ...options
    };

    try {
      const result = await this.llm.chat(messages, llmOptions);
      
      // Track LLM usage
      await this.trackLLMUsage('chat', messages, result);
      
      return result;
    } catch (error) {
      console.error(`[${this.name}] LLM chat failed:`, error);
      throw new Error(`LLM chat failed: ${error.message}`);
    }
  }

  // === METRICS AND MONITORING ===
  
  updateMetrics(executionTime, success) {
    const n = this.metrics.tasks_completed;
    const prevAvg = this.metrics.avg_execution_time;
    this.metrics.avg_execution_time = (prevAvg * (n - 1) + executionTime) / n;
    
    // Update uptime percentage
    if (this.startTime) {
      const uptime = Date.now() - this.startTime;
      this.metrics.uptime_percentage = (uptime / (Date.now() - this.startTime)) * 100;
    }
    
    // Update error rate
    const totalTasks = this.metrics.tasks_completed + this.metrics.tasks_failed;
    this.metrics.error_rate = totalTasks > 0 ? this.metrics.tasks_failed / totalTasks : 0;
  }

  getMetrics() {
    return {
      ...this.metrics,
      status: this.status,
      active_tasks: this.activeTasks.size,
      queued_tasks: this.taskQueue.length,
      last_heartbeat: this.last_heartbeat,
      uptime_seconds: this.startTime ? (Date.now() - this.startTime) / 1000 : 0
    };
  }

  heartbeat() {
    this.lastHeartbeat = Date.now();
    
    return {
      agent: this.name,
      status: this.status,
      metrics: this.getMetrics(),
      timestamp: this.lastHeartbeat
    };
  }

  // === EVENT HANDLING ===
  
  async emitEvent(eventType, data) {
    const event = {
      type: eventType,
      agent: this.name,
      timestamp: Date.now(),
      data
    };

    // Emit to Redis for other agents
    await this.redis.publish('agent_events', JSON.stringify(event));
    
    // Emit to local handlers
    const handlers = this.eventHandlers.get(eventType) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[${this.name}] Event handler failed for ${eventType}:`, error);
      }
    }
  }

  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  // === UTILITY METHODS ===
  
  generateTaskId() {
    return `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createTimeoutPromise(taskId) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Task ${taskId} timed out after ${this.taskTimeout}ms`));
      }, this.taskTimeout);
    });
  }

  async trackLLMUsage(operation, input, result) {
    const usage = {
      agent: this.name,
      operation,
      provider: result.provider,
      model: result.model,
      tokens: result.usage?.total_tokens || 0,
      cost: result.cost || 0,
      timestamp: Date.now()
    };

    // Save to database
    await this.database.collection('llm_usage').insertOne(usage);
  }

  // === TASK PROCESSING ===
  
  startTaskProcessor() {
    this.taskProcessorInterval = setInterval(async () => {
      if (this.status === 'running' && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        
        // Execute task in background
        this.execute(task.task, task.context).catch(error => {
          console.error(`[${this.name}] Background task failed:`, error);
        });
      }
    }, 1000); // Check every second
  }

  stopTaskProcessor() {
    if (this.taskProcessorInterval) {
      clearInterval(this.taskProcessorInterval);
      this.taskProcessorInterval = null;
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      const heartbeat = this.heartbeat();
      
      // Save to Redis for monitoring
      await this.redis.setex(
        `agent:${this.name}:heartbeat`,
        60, // 1 minute TTL
        JSON.stringify(heartbeat)
      );
    }, 30000); // Every 30 seconds
  }

  async waitForActiveTasks(timeout = 60000) {
    const startTime = Date.now();
    
    while (this.activeTasks.size > 0 && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (this.activeTasks.size > 0) {
      console.warn(`[${this.name}] ${this.activeTasks.size} tasks still active after stop`);
    }
  }
