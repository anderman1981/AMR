# 🎭 AGENTES INTELIGENTES - PATRONES Y ARQUITECTURA
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-006-AGENT-PATTERNS.md

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
    this.taskTimeout = config.task_timeout || 300000; // 5 minutes
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

  async cleanupResources() {
    // Stop intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.taskProcessorInterval) {
      clearInterval(this.taskProcessorInterval);
    }
    
    // Clear event handlers
    this.eventHandlers.clear();
  }
}

module.exports = BaseAgent;
```

---

## 🎭 PATRONES DE AGENTES ESPECIALIZADOS

### Patrón 1: ContentGeneratorAgent
```javascript
class ContentGeneratorAgent extends BaseAgent {
  constructor(config, llmManager, database, redis) {
    super('ContentGeneratorAgent', config, llmManager, database, redis);
    this.templates = config.templates || {};
    this.qualityThreshold = config.quality_threshold || 0.7;
  }

  async validateConfig() {
    if (!this.templates) {
      throw new Error('Content templates are required');
    }
    
    const requiredPlatforms = ['instagram', 'tiktok', 'email'];
    for (const platform of requiredPlatforms) {
      if (!this.templates[platform]) {
        throw new Error(`Template for ${platform} is required`);
      }
    }
  }

  async doExecute(task, context) {
    switch (task.type) {
      case 'generate_post':
        return await this.generatePost(task.data, context);
      
      case 'optimize_content':
        return await this.optimizeContent(task.data, context);
      
      case 'personalize_content':
        return await this.personalizeContent(task.data, context);
      
      case 'create_content_calendar':
        return await this.createContentCalendar(task.data, context);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async generatePost(data, context) {
    const { product, platform, tone, target_audience } = data;
    const template = this.templates[platform];
    
    if (!template) {
      throw new Error(`No template found for platform: ${platform}`);
    }

    const prompt = this.buildContentPrompt(product, platform, tone, target_audience, template);
    
    const response = await this.think(prompt, {
      temperature: 0.8, // Higher temperature for creativity
      max_tokens: 2000
    });

    // Parse and validate response
    const content = this.parseContentResponse(response.text, platform);
    const quality = await this.assessContentQuality(content, platform);
    
    if (quality.score < this.qualityThreshold) {
      throw new Error(`Generated content quality ${quality.score} below threshold ${this.qualityThreshold}`);
    }

    // Save generated content
    await this.saveContent(content, {
      product_id: product.id,
      platform,
      tone,
      target_audience,
      quality_score: quality.score,
      generated_by: this.name
    });

    return {
      content,
      quality,
      platform,
      metadata: {
        generation_time: Date.now(),
        llm_provider: response.provider,
        template_used: template.name
      }
    };
  }

  buildContentPrompt(product, platform, tone, target_audience, template) {
    return `
You are an expert social media content creator for ${platform}.

PRODUCT INFORMATION:
- Name: ${product.name}
- Description: ${product.description}
- Benefits: ${product.benefits.join(', ')}
- Target Price: ${product.price}
- Commission: ${product.commission}%

TARGET AUDIENCE:
${target_audience}

DESIRED TONE:
${tone}

PLATFORM REQUIREMENTS:
${template.requirements}

CONTENT STRUCTURE:
${template.structure}

EXAMPLES:
${template.examples || 'None provided'}

Please generate engaging ${platform} content that:
1. Grabs attention in the first 3 seconds
2. Clearly communicates value proposition
3. Includes a compelling call-to-action
4. Follows platform-specific best practices
5. Is authentic and conversational

Return the response in this JSON format:
${template.output_format}

Focus on creating content that drives engagement and conversions.
`.trim();
  }

  parseContentResponse(text, platform) {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const content = JSON.parse(jsonStr);
      
      // Validate required fields based on platform
      this.validateContentStructure(content, platform);
      
      return content;
      
    } catch (error) {
      throw new Error(`Failed to parse content response: ${error.message}`);
    }
  }

  validateContentStructure(content, platform) {
    const requiredFields = {
      instagram: ['hook', 'body', 'cta', 'hashtags'],
      tiktok: ['hook', 'script', 'cta'],
      email: ['subject', 'greeting', 'body', 'cta', 'signature']
    };

    const fields = requiredFields[platform];
    if (!fields) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    for (const field of fields) {
      if (!content[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  async assessContentQuality(content, platform) {
    const prompt = `
Assess the quality of this ${platform} content on a scale of 0-1:

${JSON.stringify(content, null, 2)}

Evaluate based on:
1. Engagement potential (0-1)
2. Clarity and readability (0-1)
3. Call-to-action effectiveness (0-1)
4. Platform appropriateness (0-1)
5. Overall quality (0-1)

Return JSON with:
{
  "engagement_score": 0.8,
  "clarity_score": 0.9,
  "cta_effectiveness": 0.7,
  "platform_fit": 0.8,
  "overall_score": 0.8,
  "suggestions": ["suggestion 1", "suggestion 2"]
}
`.trim();

    const response = await this.think(prompt, {
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 500
    });

    try {
      const assessment = JSON.parse(response.text);
      return {
        score: assessment.overall_score || 0,
        details: assessment,
        assessed_at: Date.now()
      };
    } catch (error) {
      // Fallback to default score
      return {
        score: 0.7,
        details: { error: 'Failed to parse assessment' },
        assessed_at: Date.now()
      };
    }
  }

  async saveContent(content, metadata) {
    const contentRecord = {
      ...content,
      metadata,
      created_at: new Date(),
      agent: this.name
    };

    await this.database.collection('generated_content').insertOne(contentRecord);
    
    // Cache for quick retrieval
    await this.redis.setex(
      `content:${metadata.product_id}:${metadata.platform}`,
      3600, // 1 hour
      JSON.stringify(contentRecord)
    );
  }
}

module.exports = ContentGeneratorAgent;
```

### Patrón 2: DataAnalysisAgent
```javascript
class DataAnalysisAgent extends BaseAgent {
  constructor(config, llmManager, database, redis) {
    super('DataAnalysisAgent', config, llmManager, database, redis);
    this.analysisModels = config.analysis_models || {};
    this.confidenceThreshold = config.confidence_threshold || 0.8;
  }

  async doExecute(task, context) {
    switch (task.type) {
      case 'analyze_performance':
        return await this.analyzePerformance(task.data, context);
      
      case 'detect_patterns':
        return await this.detectPatterns(task.data, context);
      
      case 'predict_trends':
        return await this.predictTrends(task.data, context);
      
      case 'generate_insights':
        return await this.generateInsights(task.data, context);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async analyzePerformance(data, context) {
    const { time_period, metrics, filters } = data;
    
    // Collect data from database
    const performanceData = await this.collectPerformanceData(time_period, metrics, filters);
    
    // Generate statistical analysis
    const statistics = this.calculateStatistics(performanceData);
    
    // Use LLM for pattern recognition and insights
    const insights = await this.generatePerformanceInsights(performanceData, statistics);
    
    // Create recommendations
    const recommendations = await this.generateRecommendations(insights, statistics);
    
    return {
      period: time_period,
      metrics: statistics,
      insights,
      recommendations,
      confidence: this.calculateConfidence(insights),
      analyzed_at: Date.now()
    };
  }

  async collectPerformanceData(timePeriod, metrics, filters = {}) {
    const collection = this.database.collection('performance_metrics');
    
    const query = {
      timestamp: {
        $gte: new Date(Date.now() - this.parseTimePeriod(timePeriod)),
        $lte: new Date()
      },
      ...filters
    };

    const pipeline = [
      { $match: query },
      { $group: {
        _id: null,
        ...metrics.reduce((acc, metric) => {
          acc[metric] = { $avg: `$${metric}` };
          acc[`${metric}_max`] = { $max: `$${metric}` };
          acc[`${metric}_min`] = { $min: `$${metric}` };
          return acc;
        }, {})
      }}
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || {};
  }

  calculateStatistics(data) {
    const stats = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number') {
        stats[key] = {
          value,
          trend: this.calculateTrend(key),
          variance: this.calculateVariance(key),
          percentile_95: this.calculatePercentile(key, 95)
        };
      }
    }
    
    return stats;
  }

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
      return {
        key_insights: [],
        trends: [],
        recommendations: [],
        error: 'Failed to generate insights'
      };
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

## 📊 MONITORING Y HEALTH CHECKS

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

**ESTE DOCUMENTO DEFINE LOS PATRONES DE AGENTES**  
Todos los agentes deben seguir esta arquitectura base sin excepción.

**Archivo:** REGLAS-006-AGENT-PATTERNS.md  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-02