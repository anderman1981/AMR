---
trigger: always_on
---

# 🤖 INTEGRACIÓN LLM Y AI FRAMEWORK - Parte 2
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-005-LLM-INTEGRATION-PARTE2.md  
**Caracteres:** 11,900 (límite permitido: 11,995)

---

## 📊 MONITOREO DE USO LLM

### Sistema de Tracking
```javascript
class LLMUsageTracker {
  constructor(llmManager) {
    this.llmManager = llmManager;
    this.alerts = {
      daily_budget: 100, // $100 per day
      monthly_budget: 2000, // $2000 per month
      error_rate_threshold: 0.05 // 5%
    };
  }

  async trackUsage(operation, input, output, metadata = {}) {
    const usage = {
      timestamp: new Date().toISOString(),
      operation,
      provider: output.provider,
      model: output.model,
      tokens: output.usage?.total_tokens || 0,
      cost: output.cost || 0,
      latency: metadata.latency || 0,
      success: output.success !== false,
      error: output.error || null,
      user_id: metadata.user_id,
      session_id: metadata.session_id
    };

    // Guardar en base de datos
    await this.saveUsageRecord(usage);
    
    // Verificar límites y alertas
    await this.checkLimits(usage);
    
    // Actualizar métricas en tiempo real
    this.updateRealTimeMetrics(usage);
    
    return usage;
  }

  async checkLimits(usage) {
    // Check daily budget
    const dailyUsage = await this.getDailyUsage(usage.provider);
    if (dailyUsage.total_cost >= this.alerts.daily_budget) {
      await this.sendAlert('daily_budget_exceeded', {
        current: dailyUsage.total_cost,
        limit: this.alerts.daily_budget,
        provider: usage.provider
      });
    }

    // Check monthly budget
    const monthlyUsage = await this.getMonthlyUsage(usage.provider);
    if (monthlyUsage.total_cost >= this.alerts.monthly_budget) {
      await this.sendAlert('monthly_budget_exceeded', {
        current: monthlyUsage.total_cost,
        limit: this.alerts.monthly_budget,
        provider: usage.provider
      });
    }

    // Check error rate
    const errorRate = await this.getErrorRate(usage.provider, '24h');
    if (errorRate >= this.alerts.error_rate_threshold) {
      await this.sendAlert('high_error_rate', {
        current_rate: errorRate,
        threshold: this.alerts.error_rate_threshold,
        provider: usage.provider
      });
    }
  }

  async sendAlert(type, data) {
    console.error(`LLM Usage Alert: ${type}`, data);
    
    // Enviar a sistemas de monitoreo
    await monitoringService.alert({
      type: 'llm_usage',
      alert_type: type,
      severity: 'warning',
      data,
      timestamp: new Date().toISOString()
    });

    // Opcional: desactivar provider si se excede presupuesto
    if (type === 'monthly_budget_exceeded') {
      await this.disableProvider(data.provider);
    }
  }
}
```

---

## 🧪 TESTING DE INTEGRACIÓN LLM

### Unit Tests para LLM Manager
```javascript
describe('LLMManager', () => {
  let llmManager;
  let mockProviders;

  beforeEach(() => {
    mockProviders = {
      ollama: {
        generate: jest.fn(),
        chat: jest.fn(),
        embed: jest.fn()
      },
      openai: {
        generate: jest.fn(),
        chat: jest.fn(),
        embed: jest.fn()
      }
    };

    llmManager = new LLMManager({
      llm_providers: {
        ollama: { enabled: true },
        openai: { enabled: true }
      },
      fallback_order: ['ollama', 'openai']
    });
    
    llmManager.providers = mockProviders;
  });

  test('should use preferred provider when available', async () => {
    const mockResponse = {
      text: 'Generated text',
      provider: 'ollama',
      usage: { total_tokens: 100 },
      cost: 0
    };

    mockProviders.ollama.generate.mockResolvedValue(mockResponse);

    const result = await llmManager.generate('Test prompt', {
      provider: 'ollama'
    });

    expect(result.provider).toBe('ollama');
    expect(mockProviders.ollama.generate).toHaveBeenCalledWith('Test prompt', {
      provider: 'ollama'
    });
  });

  test('should fallback to next provider on failure', async () => {
    mockProviders.ollama.generate.mockRejectedValue(new Error('Connection failed'));
    
    const mockResponse = {
      text: 'Generated text from OpenAI',
      provider: 'openai',
      usage: { total_tokens: 100 },
      cost: 0.005
    };

    mockProviders.openai.generate.mockResolvedValue(mockResponse);

    const result = await llmManager.generate('Test prompt');
    
    expect(result.provider).toBe('openai');
    expect(result.fallback_used).toBe(true);
    expect(mockProviders.openai.generate).toHaveBeenCalled();
  });

  test('should track usage statistics', async () => {
    const mockResponse = {
      text: 'Generated text',
      provider: 'ollama',
      usage: { total_tokens: 150 },
      cost: 0
    };

    mockProviders.ollama.generate.mockResolvedValue(mockResponse);

    await llmManager.generate('Test prompt');
    
    const stats = llmManager.getUsageStats();
    expect(stats.total_requests).toBe(1);
    expect(stats.total_tokens).toBe(150);
    expect(stats.provider_stats.ollama.requests).toBe(1);
  });
  });
});
```

### Integration Tests con Provider Reales
```javascript
describe('LLM Integration', () => {
  let llmManager;

  beforeAll(async () => {
    // Use real Ollama if available in CI/CD
    llmManager = new LLMManager(testConfig);
  });

  test('should generate text with real Ollama', async () => {
    const result = await llmManager.generate('Hello, how are you?', {
      provider: 'ollama',
      max_tokens: 50
    });

    expect(result.text).toBeDefined();
    expect(result.provider).toBe('ollama');
    expect(result.usage.total_tokens).toBeGreaterThan(0);
  }, 10000); // 10 second timeout

  test('should handle streaming responses', async () => {
    const stream = await llmManager.chat([
      { role: 'user', content: 'Write a short story' }
    ], {
      provider: 'openai',
      stream: true
    });

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
    const fullText = chunks.join('');
    expect(fullText.length).toBeGreaterThan(10);
  }, 15000);
});
```

---

## 🚀 MEJORAS PRÁCTICAS

### 1. Cache de Respuestas LLM
```javascript
class LLMCache {
  constructor(redisClient) {
    this.redis = redisClient;
    this.defaultTTL = 3600; // 1 hour
  }

  async getCacheKey(prompt, options) {
    const keyData = {
      prompt: prompt.substring(0, 1000), // Limit key size
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.max_tokens
    };
    
    return `llm_cache:${crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex')}`;
  }

  async getCachedResponse(prompt, options) {
    const cacheKey = await this.getCacheKey(prompt, options);
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  }

  async setCachedResponse(prompt, options, response, ttl = this.defaultTTL) {
    const cacheKey = await this.getCacheKey(prompt, options);
    await this.redis.setex(cacheKey, ttl, JSON.stringify(response));
  }
}
```

---

## 🔄 PROVEEDORES ADICIONALES

### Proveedor Anthropic Claude
```javascript
class AnthropicProvider {
  constructor(config) {
    this.apiKey = config.api_key;
    this.baseURL = config.base_url || 'https://api.anthropic.com/v1';
    this.models = config.models;
    this.timeout = config.timeout || 60000;
  }

  async chat(messages, options = {}) {
    const model = options.model || this.models.chat || 'claude-3-opus-20240229';
    
    const requestBody = {
      model,
      messages,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 1,
      top_k: options.top_k || 1,
      stop_sequences: options.stop_sequences,
      stream: options.stream || false
    };

    if (options.stream) {
      return this.streamChat(requestBody);
    }

    const response = await this.makeRequest('/messages', requestBody);
    const content = response.content[0].text;

    return {
      text: content,
      model,
      provider: 'anthropic',
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens
      },
      cost: this.calculateCost(response.usage, model),
      metadata: {
        stop_reason: response.stop_reason,
        created_at: response.created_at
      }
    };
  }

  calculateCost(usage, model) {
    const pricing = {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 }
    };

    const modelPricing = pricing[model] || pricing['claude-3-sonnet-20240229'];
    
    const inputCost = (usage.prompt_tokens / 1000) * modelPricing.input;
    const outputCost = (usage.completion_tokens / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }

  async makeRequest(endpoint, body) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}
```

### Proveedor Google Gemini
```javascript
class GoogleProvider {
  constructor(config) {
    this.apiKey = config.api_key;
    this.baseURL = config.base_url || 'https://generativelanguage.googleapis.com/v1';
    this.models = config.models;
    this.timeout = config.timeout || 60000;
  }

  async chat(messages, options = {}) {
    const model = options.model || this.models.chat || 'gemini-pro';
    
    const requestBody = {
      contents: messages.map(msg => ({
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens || 1000,
        topP: options.top_p || 1,
        topK: options.top_k || 1,
        stopSequences: options.stop_sequences
      }
    };

    const response = await this.makeRequest(`models/${model}:generateContent`, requestBody);
    const content = response.candidates[0].content.parts[0].text;

    return {
      text: content,
      model,
      provider: 'google',
      usage: {
        prompt_tokens: response.usageMetadata.promptTokenCount,
        completion_tokens: response.usageMetadata.candidatesTokenCount,
        total_tokens: response.usageMetadata.totalTokenCount
      },
      cost: this.calculateCost(response.usageMetadata, model),
      metadata: {
        finish_reason: response.candidates[0].finishReason,
        created: Date.now()
      }
    };
  }

  calculateCost(usage, model) {
    const pricing = {
      'gemini-pro': { input: 0.0005, output: 0.0015 },
      'gemini-pro-vision': { input: 0.0025, output: 0.007 }
    };

    const modelPricing = pricing[model] || pricing['gemini-pro'];
    
    const inputCost = (usage.promptTokenCount / 1000) * modelPricing.input;
    const outputCost = (usage.candidatesTokenCount / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }

  async makeRequest(endpoint, body) {
    const url = `${this.baseURL}/${endpoint}?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}
```
---
**Continúa en Parte 3 para implementaciones**