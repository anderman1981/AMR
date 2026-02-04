# 🤖 INTEGRACIÓN LLM Y AI FRAMEWORK
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-005-LLM-INTEGRATION.md

---

## 🎯 FILOSOFÍA DE INTEGRACIÓN LLM

> **"LLM integration is not optional, it's architectural"**

Toda aplicación moderna DEBE incluir integración con Large Language Models como componente de primera clase. Esta no es una característica adicional, es un requisito arquitectónico fundamental.

---

## 🏗️ ARQUITECTURA DE INTEGRACIÓN LLM

### Capa de Abstracción Universal
```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (Express API, FastAPI, Flask, Spring Boot, etc.)      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              LLM Abstraction Layer                      │
│  (Unified interface for multiple LLM providers)        │
│  • Ollama (local, privacy-first)                       │
│  • OpenAI API (GPT-4, GPT-3.5)                         │
│  • Anthropic Claude API                                 │
│  • Google Gemini API                                    │
│  • Cohere API                                           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 Agent/Tool Layer                        │
│  • Content Generation Agents                           │
│  • Analysis Agents                                      │
│  • Decision Support Agents                             │
│  • Automation Agents                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 CONFIGURACIÓN DE PROVEEDORES LLM

### Archivo de Configuración Principal
```yaml
# config/llm-providers.yml
llm_providers:
  # Local-first (recommended for development and privacy)
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
    cost_per_token: 0.0 # Free
    privacy_level: "high"
    
  # Cloud providers (for production scale)
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
    privacy_level: "medium"
    
  anthropic:
    enabled: false
    api_key: "${ANTHROPIC_API_KEY}"
    default_model: "claude-3-opus-20240229"
    models:
      chat: "claude-3-opus-20240229"
      code: "claude-3-sonnet-20240229"
    max_tokens: 4096
    cost_per_1k_tokens: 0.075
    privacy_level: "medium"
    
  google:
    enabled: false
    api_key: "${GOOGLE_API_KEY}"
    default_model: "gemini-pro"
    models:
      chat: "gemini-pro"
      vision: "gemini-pro-vision"
    cost_per_1k_tokens: 0.001
    privacy_level: "low"
    
  cohere:
    enabled: false
    api_key: "${COHERE_API_KEY}"
    default_model: "command-r-plus"
    models:
      chat: "command-r-plus"
      embedding: "embed-english-v3.0"
    cost_per_1k_tokens: 0.015
    privacy_level: "medium"

# Estrategia de fallback
fallback_order: ["ollama", "openai", "anthropic", "google", "cohere"]
retry_on_failure: true
cost_optimization: true
privacy_mode: "high" # high, medium, low
usage_tracking: true
```

---

## 🧠 LLM MANAGER IMPLEMENTATION

### Clase Principal Node.js
```javascript
class LLMManager {
  constructor(config) {
    this.config = config;
    this.providers = new Map();
    this.usageStats = {
      total_requests: 0,
      total_tokens: 0,
      total_cost: 0,
      provider_stats: new Map(),
      model_stats: new Map()
    };
    
    this.initializeProviders();
  }

  initializeProviders() {
    // Initialize all enabled providers
    for (const [name, config] of Object.entries(this.config.llm_providers)) {
      if (config.enabled) {
        switch (name) {
          case 'ollama':
            this.providers.set(name, new OllamaProvider(config));
            break;
          case 'openai':
            this.providers.set(name, new OpenAIProvider(config));
            break;
          case 'anthropic':
            this.providers.set(name, new AnthropicProvider(config));
            break;
          case 'google':
            this.providers.set(name, new GoogleProvider(config));
            break;
          case 'cohere':
            this.providers.set(name, new CohereProvider(config));
            break;
        }
      }
    }
  }

  async generate(prompt, options = {}) {
    const startTime = Date.now();
    
    try {
      const result = await this.executeWithFallback('generate', prompt, options);
      this.updateStats(result, Date.now() - startTime);
      return result;
    } catch (error) {
      this.logError('generate', error, prompt, options);
      throw new LLMError('All LLM providers failed', error);
    }
  }

  async chat(messages, options = {}) {
    const startTime = Date.now();
    
    try {
      const result = await this.executeWithFallback('chat', messages, options);
      this.updateStats(result, Date.now() - startTime);
      return result;
    } catch (error) {
      this.logError('chat', error, messages, options);
      throw new LLMError('All LLM providers failed', error);
    }
  }

  async embed(text, options = {}) {
    const startTime = Date.now();
    
    try {
      const result = await this.executeWithFallback('embed', text, options);
      this.updateStats(result, Date.now() - startTime);
      return result;
    } catch (error) {
      this.logError('embed', error, text, options);
      throw new LLMError('All LLM providers failed', error);
    }
  }

  async executeWithFallback(method, input, options) {
    const providers = this.getProviderOrder(options.provider);
    
    for (const providerName of providers) {
      try {
        const provider = this.providers.get(providerName);
        if (!provider || !provider[method]) {
          continue;
        }

        console.log(`Trying provider: ${providerName} for ${method}`);
        const result = await provider[method](input, options);
        
        console.log(`Success with provider: ${providerName}`);
        return {
          ...result,
          provider: providerName,
          fallback_used: providerName !== options.provider
        };
        
      } catch (error) {
        console.error(`Provider ${providerName} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All LLM providers failed');
  }

  getProviderOrder(preferredProvider) {
    if (preferredProvider && this.providers.has(preferredProvider)) {
      return [preferredProvider, ...this.config.fallback_order.filter(p => p !== preferredProvider)];
    }
    return this.config.fallback_order;
  }

  updateStats(result, executionTime) {
    this.usageStats.total_requests++;
    this.usageStats.total_tokens += result.usage?.total_tokens || 0;
    this.usageStats.total_cost += result.cost || 0;
    
    // Provider stats
    if (!this.usageStats.provider_stats.has(result.provider)) {
      this.usageStats.provider_stats.set(result.provider, {
        requests: 0,
        tokens: 0,
        cost: 0,
        avg_response_time: 0
      });
    }
    
    const providerStats = this.usageStats.provider_stats.get(result.provider);
    providerStats.requests++;
    providerStats.tokens += result.usage?.total_tokens || 0;
    providerStats.cost += result.cost || 0;
    providerStats.avg_response_time = (providerStats.avg_response_time + executionTime) / 2;
    
    // Model stats
    const modelKey = `${result.provider}:${result.model}`;
    if (!this.usageStats.model_stats.has(modelKey)) {
      this.usageStats.model_stats.set(modelKey, {
        requests: 0,
        tokens: 0,
        cost: 0
      });
    }
    
    const modelStats = this.usageStats.model_stats.get(modelKey);
    modelStats.requests++;
    modelStats.tokens += result.usage?.total_tokens || 0;
    modelStats.cost += result.cost || 0;
  }

  getUsageStats() {
    return {
      ...this.usageStats,
      provider_stats: Object.fromEntries(this.usageStats.provider_stats),
      model_stats: Object.fromEntries(this.usageStats.model_stats)
    };
  }

  logError(method, error, input, options) {
    console.error(`LLM Error in ${method}:`, {
      error: error.message,
      stack: error.stack,
      input_length: typeof input === 'string' ? input.length : Array.isArray(input) ? input.length : 'object',
      options,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 🔌 PROVEEDOR OLLAMA (LOCAL-FIRST)

### Implementación Ollama Provider
```javascript
class OllamaProvider {
  constructor(config) {
    this.host = config.host;
    this.models = config.models;
    this.timeout = config.timeout || 30000;
  }

  async generate(prompt, options = {}) {
    const model = options.model || this.models.chat || 'llama3:latest';
    
    const requestBody = {
      model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        num_predict: options.max_tokens || 2000,
        stop: options.stop_sequences
      }
    };

    const response = await this.makeRequest('/api/generate', requestBody);
    
    return {
      text: response.response,
      model,
      provider: 'ollama',
      usage: {
        prompt_tokens: this.estimateTokens(prompt),
        completion_tokens: this.estimateTokens(response.response),
        total_tokens: this.estimateTokens(prompt + response.response)
      },
      cost: 0, // Free
      metadata: {
        done: response.done,
        context: response.context,
        created_at: response.created_at
      }
    };
  }

  async chat(messages, options = {}) {
    const model = options.model || this.models.chat || 'llama3:latest';
    
    // Convert messages to Ollama format
    const prompt = this.formatMessagesForOllama(messages);
    
    const requestBody = {
      model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        num_predict: options.max_tokens || 2000
      }
    };

    const response = await this.makeRequest('/api/generate', requestBody);
    
    return {
      text: response.response,
      model,
      provider: 'ollama',
      usage: {
        prompt_tokens: this.estimateTokens(prompt),
        completion_tokens: this.estimateTokens(response.response),
        total_tokens: this.estimateTokens(prompt + response.response)
      },
      cost: 0
    };
  }

  async embed(text, options = {}) {
    const model = options.model || this.models.embedding || 'nomic-embed-text:latest';
    
    const requestBody = {
      model,
      prompt: text
    };

    const response = await this.makeRequest('/api/embeddings', requestBody);
    
    return {
      embedding: response.embedding,
      model,
      provider: 'ollama',
      usage: {
        prompt_tokens: this.estimateTokens(text),
        total_tokens: this.estimateTokens(text)
      },
      cost: 0
    };
  }

  async listModels() {
    const response = await this.makeRequest('/api/tags');
    return response.models.map(model => ({
      name: model.name,
      size: model.size,
      modified_at: model.modified_at
    }));
  }

  async pullModel(modelName) {
    const requestBody = { name: modelName };
    const response = await this.makeStream('/api/pull', requestBody);
    
    return new Promise((resolve, reject) => {
      let finalStatus = null;
      
      response.on('data', (chunk) => {
        const data = JSON.parse(chunk.toString());
        if (data.status) {
          console.log(`Ollama pull status: ${data.status}`);
        }
        if (data.status === 'success') {
          finalStatus = 'success';
        }
      });
      
      response.on('end', () => {
        resolve({ status: finalStatus });
      });
      
      response.on('error', reject);
    });
  }

  async makeRequest(endpoint, body) {
    const url = `${this.host}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async makeStream(endpoint, body) {
    const url = `${this.host}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return response.body;
  }

  formatMessagesForOllama(messages) {
    return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}
```

---

## 🌐 PROVEEDOR OPENAI

### Implementación OpenAI Provider
```javascript
class OpenAIProvider {
  constructor(config) {
    this.apiKey = config.api_key;
    this.baseURL = config.base_url || 'https://api.openai.com/v1';
    this.models = config.models;
    this.timeout = config.timeout || 60000;
  }

  async generate(prompt, options = {}) {
    const model = options.model || this.models.completion || 'gpt-3.5-turbo-instruct';
    
    const requestBody = {
      model,
      prompt,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0,
      stop: options.stop_sequences
    };

    const response = await this.makeRequest('/completions', requestBody);
    const choice = response.choices[0];

    return {
      text: choice.text,
      model,
      provider: 'openai',
      usage: response.usage,
      cost: this.calculateCost(response.usage, model),
      metadata: {
        finish_reason: choice.finish_reason,
        created: response.created
      }
    };
  }

  async chat(messages, options = {}) {
    const model = options.model || this.models.chat || 'gpt-4-turbo';
    
    const requestBody = {
      model,
      messages,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0,
      stop: options.stop_sequences,
      stream: options.stream || false
    };

    if (options.stream) {
      return this.streamChat(requestBody);
    }

    const response = await this.makeRequest('/chat/completions', requestBody);
    const choice = response.choices[0];

    return {
      text: choice.message.content,
      model,
      provider: 'openai',
      usage: response.usage,
      cost: this.calculateCost(response.usage, model),
      metadata: {
        finish_reason: choice.finish_reason,
        created: response.created,
        role: choice.message.role
      }
    };
  }

  async embed(text, options = {}) {
    const model = options.model || this.models.embedding || 'text-embedding-3-large';
    
    const requestBody = {
      model,
      input: text,
      encoding_format: 'float'
    };

    const response = await this.makeRequest('/embeddings', requestBody);
    const embedding = response.data[0];

    return {
      embedding: embedding.embedding,
      model,
      provider: 'openai',
      usage: response.usage,
      cost: this.calculateCost(response.usage, model)
    };
  }

  async makeRequest(endpoint, body) {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  async streamChat(requestBody) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...requestBody, stream: true })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return {
      async *[Symbol.asyncIterator]() {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') return;
                
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices[0]?.delta;
                  
                  if (delta?.content) {
                    yield delta.content;
                  }
                } catch (e) {
                  // Ignore malformed JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    };
  }

  calculateCost(usage, model) {
    const pricing = {
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
      'gpt-3.5-turbo-instruct': { input: 0.0015, output: 0.002 },
      'text-embedding-3-large': { input: 0.00013, output: 0 },
      'text-embedding-3-small': { input: 0.00002, output: 0 }
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    
    const inputCost = (usage.prompt_tokens / 1000) * modelPricing.input;
    const outputCost = (usage.completion_tokens / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }
}
```

---

## 🎯 PATRONES DE USO LLM

### Patrón 1: Fallback Automático
```javascript
// Siempre usar fallback cuando el provider primario falla
async function generateWithFallback(prompt, options = {}) {
  const llmManager = new LLMManager(config);
  
  try {
    // Intentar con provider preferido primero
    return await llmManager.generate(prompt, {
      ...options,
      provider: options.provider || 'ollama'
    });
  } catch (error) {
    console.warn('Primary provider failed, using fallback');
    
    // Reintentar sin especificar provider (usará fallback_order)
    return await llmManager.generate(prompt, options);
  }
}
```

### Patrón 2: Selección Consciente de Costos
```javascript
function selectOptimalProvider(task) {
  if (task.quality === 'high' && task.budget_available) {
    return 'openai'; // GPT-4 para alta calidad
  }
  
  if (task.privacy === 'required') {
    return 'ollama'; // Local para privacidad
  }
  
  if (task.cost === 'sensitive') {
    return 'ollama'; // Gratis
  }
  
  if (task.speed === 'critical') {
    return 'openai'; // Generalmente más rápido
  }
  
  return 'ollama'; // Default local-first
}

// Ejemplo de uso
const provider = selectOptimalProvider({
  quality: 'high',
  privacy: 'medium',
  cost: 'sensitive',
  speed: 'normal'
});
```

### Patrón 3: RAG (Retrieval Augmented Generation)
```javascript
async function ragGenerate(query, vectorDB, llmManager) {
  // 1. Generar embedding para la query
  const queryEmbedding = await llmManager.embed(query, {
    model: 'nomic-embed-text:latest'
  });
  
  // 2. Buscar documentos relevantes en vector DB
  const relevantDocs = await vectorDB.search(queryEmbedding, {
    limit: 5,
    threshold: 0.7
  });
  
  // 3. Construir prompt con contexto
  const context = relevantDocs
    .map(doc => `Document: ${doc.content}\nSource: ${doc.metadata.source}`)
    .join('\n\n');
  
  const enhancedPrompt = `
Context from knowledge base:
${context}

User question: ${query}

Based on the context provided above, please answer the user's question. 
If the context doesn't contain enough information to answer the question, please say so.
  `.trim();
  
  // 4. Generar respuesta con contexto
  const result = await llmManager.generate(enhancedPrompt, {
    temperature: 0.3, // Lower temperature for factual responses
    max_tokens: 1000
  });
  
  return {
    answer: result.text,
    sources: relevantDocs.map(doc => ({
      content: doc.content.substring(0, 200) + '...',
      source: doc.metadata.source,
      score: doc.score
    })),
    provider: result.provider,
    cost: result.cost
  };
}
```

### Patrón 4: Chain of Thought para Tareas Complejas
```javascript
async function complexTaskWithCoT(task, llmManager) {
  const cotPrompt = `
You are an expert problem solver. Please break down this complex task step by step.

Task: ${task.description}

Please think through this step by step:
1. Analyze what needs to be done
2. Break it into smaller subtasks
3. Plan the approach
4. Execute each subtask mentally
5. Provide the final solution

Think step by step and show your reasoning.
  `.trim();

  const result = await llmManager.generate(cotPrompt, {
    temperature: 0.3,
    max_tokens: 2000
  });

  return result.text;
}
```

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

## 🚀 MEJORES PRÁCTICAS

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

### 2. Rate Limiting por Provider
```javascript
class LLMRateLimiter {
  constructor() {
    this.limits = {
      'openai': { requests_per_minute: 60, tokens_per_minute: 90000 },
      'anthropic': { requests_per_minute: 50, tokens_per_minute: 40000 },
      'google': { requests_per_minute: 60, tokens_per_minute: 32000 },
      'ollama': { requests_per_minute: 1000, tokens_per_minute: 1000000 } // Local
    };
    
    this.usage = new Map();
  }

  async checkLimit(provider, tokens = 0) {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    
    if (!this.usage.has(provider)) {
      this.usage.set(provider, new Map());
    }
    
    const providerUsage = this.usage.get(provider);
    
    if (!providerUsage.has(minute)) {
      providerUsage.set(minute, { requests: 0, tokens: 0 });
    }
    
    const currentUsage = providerUsage.get(minute);
    const limits = this.limits[provider];
    
    if (currentUsage.requests >= limits.requests_per_minute) {
      throw new Error(`Rate limit exceeded for ${provider}: ${currentUsage.requests}/${limits.requests_per_minute} requests`);
    }
    
    if (currentUsage.tokens + tokens > limits.tokens_per_minute) {
      throw new Error(`Token limit exceeded for ${provider}: ${currentUsage.tokens + tokens}/${limits.tokens_per_minute} tokens`);
    }
    
    currentUsage.requests++;
    currentUsage.tokens += tokens;
    
    // Cleanup old entries
    for (const [key] of providerUsage) {
      if (key < minute - 5) { // Keep last 5 minutes
        providerUsage.delete(key);
      }
    }
  }
}
```

### 3. Circuit Breaker Pattern
```javascript
class LLMCircuitBreaker {
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

**ESTE DOCUMENTO DEFINE LA INTEGRACIÓN LLM**  
Seguir estos patrones no es opcional, es arquitectónico.

**Archivo:** REGLAS-005-LLM-INTEGRATION.md  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-02