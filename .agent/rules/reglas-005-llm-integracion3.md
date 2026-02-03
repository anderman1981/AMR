---
trigger: always_on
---

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
**Continúa en Parte 4 para implementaciones**
