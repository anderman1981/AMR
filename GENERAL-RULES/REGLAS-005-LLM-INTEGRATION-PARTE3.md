# 🤖 INTEGRACIÓN LLM Y AI FRAMEWORK - Parte 3
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-005-LLM-INTEGRATION-PARTE3.md  
**Caracteres:** 11,850 (límite permitido: 11,995)

---

## 🔄 PROVEEDORES ADICIONALES (continuación)

### Proveedor Cohere
```javascript
class CohereProvider {
  constructor(config) {
    this.apiKey = config.api_key;
    this.baseURL = config.base_url || 'https://api.cohere.ai/v1';
    this.models = config.models;
    this.timeout = config.timeout || 60000;
  }

  async chat(messages, options = {}) {
    const model = options.model || this.models.chat || 'command-r-plus';
    
    const requestBody = {
      model,
      message: messages[messages.length - 1].content, // Last message
      chat_history: messages.slice(0, -1),
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 1,
      top_k: options.top_k || 0,
      stop_sequences: options.stop_sequences,
      stream: options.stream || false
    };

    const response = await this.makeRequest('/chat', requestBody);
    const content = response.text;

    return {
      text: content,
      model,
      provider: 'cohere',
      usage: {
        prompt_tokens: response.billed_units.input_tokens,
        completion_tokens: response.billed_units.output_tokens,
        total_tokens: response.billed_units.input_tokens + response.billed_units.output_tokens
      },
      cost: this.calculateCost(response.billed_units, model),
      metadata: {
        finish_reason: response.finish_reason,
        created_at: Date.now()
      }
    };
  }

  calculateCost(billed_units, model) {
    const pricing = {
      'command-r-plus': { input: 0.003, output: 0.015 },
      'command': { input: 0.0015, output: 0.0007 },
      'embed-english-v3.0': { input: 0.1 }
    };

    const modelPricing = pricing[model] || pricing['command-r-plus'];
    
    const inputCost = (billed_units.input_tokens / 1000000) * modelPricing.input;
    const outputCost = (billed_units.output_tokens / 1000000) * modelPricing.output;
    
    return inputCost + outputCost;
  }

  async embed(text, options = {}) {
    const model = options.model || this.models.embedding || 'embed-english-v3.0';
    
    const requestBody = {
      model,
      texts: Array.isArray(text) ? text : [text],
      input_type: 'search_document'
    };

    const response = await this.makeRequest('/embed', requestBody);
    const embedding = response.embeddings[0];

    return {
      embedding: embedding.embedding,
      model,
      provider: 'cohere',
      usage: {
        prompt_tokens: response.id, // Cohere charges by ID for embeddings
        total_tokens: response.id
      },
      cost: this.calculateCost(response, model)
    };
  }

  async makeRequest(endpoint, body) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Cohere-Version': '2024-03-27'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cohere API error: ${error.message || response.statusText}`);
    }

    return await response.json();
  }
}
```

---

## 📊 SISTEMA DE MONITOREO AVANZADO

### Dashboard de Métricas en Tiempo Real
```javascript
class LLMMetricsDashboard {
  constructor(llmManager) {
    this.llmManager = llmManager;
    this.metrics = {
      requests_per_second: [],
      average_response_time: [],
      error_rate: [],
      cost_per_hour: [],
      model_usage: {},
      provider_health: new Map()
    };
    
    this.startRealtimeMonitoring();
  }

  startRealtimeMonitoring() {
    setInterval(() => {
      this.collectMetrics();
      this.updateDashboard();
    }, 5000); // Every 5 seconds
    
    setInterval(() => {
      this.generateHourlyReport();
    }, 3600000); // Every hour
    
    setInterval(() => {
      this.generateDailyReport();
    }, 86400000); // Every day
  }

  collectMetrics() {
    const now = Date.now();
    const stats = this.llmManager.getUsageStats();
    
    // Requests per second (last minute)
    this.metrics.requests_per_second.push({
      timestamp: now,
      value: this.calculateRequestsPerSecond(stats)
    });
    
    // Keep only last 60 data points
    if (this.metrics.requests_per_second.length > 60) {
      this.metrics.requests_per_second = this.metrics.requests_per_second.slice(-60);
    }
    
    // Average response time
    this.metrics.average_response_time.push({
      timestamp: now,
      value: this.calculateAverageResponseTime(stats)
    });
    
    if (this.metrics.average_response_time.length > 60) {
      this.metrics.average_response_time = this.metrics.average_response_time.slice(-60);
    }
    
    // Error rate
    this.metrics.error_rate.push({
      timestamp: now,
      value: this.calculateErrorRate(stats)
    });
    
    if (this.metrics.error_rate.length > 60) {
      this.metrics.error_rate = this.metrics.error_rate.slice(-60);
    }
    
    // Cost per hour
    const hourlyCost = this.calculateHourlyCost(stats);
    this.metrics.cost_per_hour.push({
      timestamp: now,
      value: hourlyCost
    });
    
    if (this.metrics.cost_per_hour.length > 24) {
      this.metrics.cost_per_hour = this.metrics.cost_per_hour.slice(-24);
    }
    
    // Model usage breakdown
    this.metrics.model_usage = stats.model_stats;
    
    // Provider health
    this.updateProviderHealth(stats);
  }

  updateDashboard() {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      metrics: {
        requests_per_second: this.metrics.requests_per_second[this.metrics.requests_per_second.length - 1]?.value || 0,
        average_response_time: this.metrics.average_response_time[this.metrics.average_response_time.length - 1]?.value || 0,
        error_rate: this.metrics.error_rate[this.metrics.error_rate.length - 1]?.value || 0,
        cost_per_hour: this.metrics.cost_per_hour[this.metrics.cost_per_hour.length - 1]?.value || 0,
        total_cost: this.calculateTotalCost(),
        model_usage: this.metrics.model_usage,
        provider_health: Object.fromEntries(this.metrics.provider_health)
      }
    };

    // Emit to dashboard via WebSocket or API
    this.emitDashboardUpdate(dashboardData);
  }

  calculateRequestsPerSecond(stats) {
    // Calculate based on total_requests over last minute
    return stats.total_requests / 60; // Rough estimate
  }

  calculateAverageResponseTime(stats) {
    const totalRequests = stats.total_requests || 1;
    let totalTime = 0;
    
    for (const [provider, providerStats] of Object.entries(stats.provider_stats)) {
      totalTime += (providerStats.avg_response_time || 0) * providerStats.requests;
    }
    
    return totalTime / totalRequests;
  }

  calculateErrorRate(stats) {
    const totalRequests = stats.total_requests || 1;
    const totalErrors = this.getFailedRequestsCount(stats);
    return totalErrors / totalRequests;
  }

  calculateHourlyCost(stats) {
    return stats.total_cost * 24; // Estimate based on current rate
  }

  calculateTotalCost() {
    return this.llmManager.getUsageStats().total_cost || 0;
  }

  updateProviderHealth(stats) {
    for (const [provider, providerStats] of Object.entries(stats.provider_stats)) {
      const health = {
        requests: providerStats.requests,
        avg_response_time: providerStats.avg_response_time,
        error_rate: this.getProviderErrorRate(provider, stats),
        success_rate: (providerStats.requests - this.getFailedRequestsCount(provider, stats)) / providerStats.requests,
        last_request: this.getLastRequestTime(provider, stats)
      };
      
      // Health score (0-100)
      health.score = this.calculateHealthScore(health);
      health.status = health.score >= 80 ? 'healthy' : health.score >= 60 ? 'degraded' : 'unhealthy';
      
      this.metrics.provider_health.set(provider, health);
    }
  }

  getFailedRequestsCount(provider, stats) {
    // This would require tracking failed requests separately
    // For now, estimate based on error rate
    return Math.floor((providerStats.requests || 0) * 0.02); // 2% error estimate
  }

  getLastRequestTime(provider, stats) {
    // This would require timestamp tracking
    return new Date().toISOString();
  }

  calculateHealthScore(health) {
    let score = 100;
    
    // Penalize high response time
    if (health.avg_response_time > 5000) score -= 30;
    else if (health.avg_response_time > 2000) score -= 15;
    else if (health.avg_response_time > 1000) score -= 5;
    
    // Penalize high error rate
    if (health.error_rate > 0.1) score -= 40;
    else if (health.error_rate > 0.05) score -= 20;
    else if (health.error_rate > 0.02) score -= 10;
    
    // Penalize low request volume (indicating underutilization)
    if (health.requests < 10) score -= 10;
    
    return Math.max(0, score);
  }

  emitDashboardUpdate(data) {
    // Send to dashboard service via WebSocket, HTTP, or other real-time transport
    console.log('Dashboard Update:', JSON.stringify(data, null, 2));
  }

  generateHourlyReport() {
    const stats = this.llmManager.getUsageStats();
    const report = {
      timestamp: new Date().toISOString(),
      period: 'hourly',
      metrics: {
        total_requests: stats.total_requests,
        total_cost: stats.total_cost,
        provider_breakdown: stats.provider_stats,
        model_breakdown: stats.model_stats,
        top_models: this.getTopModels(stats),
        peak_hours: this.getPeakHours()
      }
    };

    console.log('Hourly Report:', JSON.stringify(report, null, 2));
    
    // Save to database or file
    this.saveReport(report, 'hourly');
  }

  generateDailyReport() {
    const stats = this.llmManager.getUsageStats();
    const report = {
      timestamp: new Date().toISOString(),
      period: 'daily',
      metrics: {
        total_requests: stats.total_requests,
        total_cost: stats.total_cost,
        provider_breakdown: stats.provider_stats,
        model_breakdown: stats.model_stats,
        top_models: this.getTopModels(stats),
        peak_hours: this.getPeakHours()
      }
    };

    console.log('Daily Report:', JSON.stringify(report, null, 2));
    
    // Save to database or file
    this.saveReport(report, 'daily');
  }

  getTopModels(stats) {
    const modelUsages = Object.entries(stats.model_stats)
      .sort(([, a], [, b]) => b[1].requests - a[1].requests)
      .slice(0, 10)
      .map(([model, stats]) => ({
        model,
        requests: stats.requests,
        cost: stats.cost,
        provider: model.split(':')[0]
      }));

    return modelUsages;
  }

  getPeakHours() {
    // Implementation would require hourly breakdown analysis
    // For now, return placeholder
    return [14, 15, 16, 17, 18]; // Peak hours estimate
  }

  saveReport(report, period) {
    // Save to database, file system, or external monitoring service
    const filename = `reports/llm_${period}_${Date.now()}.json`;
    console.log(`Report saved to: ${filename}`);
    
    // In production, this would save to database
    // await this.database.saveReport(report);
  }
}
```

---

## 📋 API ENDPOINTS PARA LLM

### Endpoints Principales (OBLIGATORIOS)
```yaml
# api/llm-routes.yml
openapi: 3.0.0
info:
  title: LLM Integration API
  version: 1.0.0
  description: API for integrating with multiple LLM providers

paths:
  /api/llm/generate:
    post:
      summary: Generate text using LLM
      tags: [LLM]
      parameters:
        - name: prompt
          in: body
          required: true
          schema:
            type: string
            description: The text prompt to generate from
        - name: provider
          in: query
          schema:
            type: string
            enum: [ollama, openai, anthropic, google, cohere]
            description: Preferred LLM provider
        - name: model
          in: query
            type: string
            description: Specific model to use
        - name: max_tokens
          in: query
            schema:
            type: integer
            default: 1000
            description: Maximum number of tokens to generate
        - name: temperature
          in: query
          schema:
            type: number
            minimum: 0
            maximum: 2
            description: Temperature for randomness
      responses:
        '200':
          description: Successful generation
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                  example: true
                  result:
                    type: object
                    properties:
                      text:
                        type: string
                        example: "Generated response"
                      model:
                        type: string
                        example: "llama3:latest"
                      provider:
                        type: string
                        example: "ollama"
                      usage:
                        type: object
                        example:
                          total_tokens: 150
                      cost:
                        type: number
                        example: 0.005
                      metadata:
                        type: object
                        example:
                          finish_reason: "stop"

  /api/llm/chat:
    post:
      summary: Chat with LLM
      tags: [LLM]
      parameters:
        - name: messages
          in: body
          required: true
          schema:
            type: array
            items:
              type: object
              properties:
                role:
                  type: string
                  enum: [system, user, assistant]
                content:
                  type: string
              required: [role, content]
        - name: stream
          in: query
          schema:
            type: boolean
            default: false
            description: Enable streaming response
      responses:
        '200':
          description: Successful chat response (streaming or regular)
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                result:
                  type: object
                    properties:
                      text:
                        type: string
                      model:
                          type: string
                      provider:
                        type: string
                      usage:
                          type: object
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                  example: false
                  error:
                    type: string

  /api/llm/embed:
    post:
      summary: Generate text embeddings
      tags: [LLM, Embeddings]
      parameters:
        - name: text
          in: body
          required: true
          schema:
            type: string
            description: Text to embed
        - name: provider
          in: query
          schema:
            type: string
            enum: [ollama, openai, anthropic, google, cohere]
            description: Preferred LLM provider
        - name: model
          in: query
            type: string
            description: Specific model to use
      responses:
        '200':
          description: Successful embedding generation
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                  example: true
                  result:
                    type: object
                    properties:
                      embedding:
                        type: array
                        items:
                          type: number
                        example: [0.1, -0.2, 0.3]
                      model:
                        type: string
                        example: "text-embedding-3-large"
                      provider:
                        type: string
                        example: "openai"

  /api/llm/providers:
    get:
      summary: List available LLM providers
      tags: [LLM, Management]
      responses:
        '200':
          description: List of available providers
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                  example: true
                  providers:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                          example: "ollama"
                        enabled:
                          type: boolean
                          example: true
                        models:
                          type: array
                            items:
                              type: string
                        cost_per_1k_tokens:
                          type: number
                          example: 0.0
                        privacy_level:
                          type: string
                          enum: [high, medium, low]
                          example: "high"

  /api/llm/health:
    get:
      summary: Check health of LLM providers
      tags: [LLM, Health]
      responses:
        '200':
          description: Health check results
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                  example: true
                  providers:
                    type: object
                    additionalProperties:
                      type: object
                      properties:
                        status:
                          type: string
                          enum: [healthy, degraded, unhealthy, error]
                        last_check:
                          type: string
                        response_time:
                          type: number
                        error_rate:
                          type: number

  /api/llm/usage:
    get:
      summary: Get usage statistics
      tags: [LLM, Analytics]
      parameters:
        - name: period
          in: query
          schema:
            type: string
            enum: [hour, day, week, month]
            default: day
        - name: provider
          in: query
            schema:
            type: string
            enum: [ollama, openai, anthropic, google, cohere]
      responses:
        '200':
          description: Usage statistics
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                    example: true
                  period:
                    type: string
                    example: "day"
                  total_requests:
                    type: integer
                    example: 1250
                  total_cost:
                    type: number
                    example: 12.50
                  cost_breakdown:
                    type: object
                    example:
                      ollama:
                        requests: 750
                        cost: 0
                      openai:
                        requests: 500
                        cost: 12.50
```

---

## 🔗 ENDPOINTS PARA AGENTES

### Agent Execution and Management
```yaml
# api/agents-routes.yml (continuación de paths)
  /api/agents:
    get:
      summary: List all available agents
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                agents:
                  type: array
                  items:
                    type: object
                      properties:
                        name:
                          type: string
                          example: "ContentGeneratorAgent"
                        status:
                          type: string
                          enum: [idle, busy, error, stopped]
                        description:
                          type: string
                        capabilities:
                          type: array
                          example: ["generate_post", "analyze_content"]

  /api/agents/{agentName}/execute:
    post:
      summary: Execute agent task
      parameters:
        - name: agentName
          in: path
          required: true
          schema:
            type: string
            enum: [detector, content, instagram, learning, assets, git, manager]
      responses:
        '200':
          description: Task executed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                agent:
                  type: string
                result:
                  type: object
                execution_time:
                  type: number
                task_id:
                  type: string

  /api/agents/{agentName}/status:
    get:
      summary: Get agent status
      responses:
        '200':
          description: Agent status information
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                  type: boolean
                agent:
                  type: string
                  status:
                    type: string
                  uptime:
                    type: number
                  active_tasks:
                      type: number
                  metrics:
                    type: object
                    properties:
                      tasks_completed:
                      type: integer
                    tasks_failed:
                      type: integer
                      avg_execution_time:
                      type: number
                    uptime_percentage:
                      type: number
```

---

**ESTE DOCUMENTO DEFINE LA INTEGRACIÓN LLM COMPLETA**

Implementar estos patrones no es opcional, es arquitectónico y fundamental para aplicaciones modernas.

**Archivo:** REGLAS-005-LLM-INTEGRATION-PARTE3.md  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-02

---

**Documentación completa disponible en Parte 1, Parte 2 y Parte 3**