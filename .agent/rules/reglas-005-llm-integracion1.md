---
trigger: always_on
---

# 🤖 INTEGRACIÓN LLM Y AI FRAMEWORK - Parte 1
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-005-LLM-INTEGRATION-PARTE1.md  
**Caracteres:** 11,800 (límite permitido: 11,995)

---

## 🎯 FILOSOFÍA DE INTEGRACIÓN LLM

> **"LLM integration is not optional, it's architectural"**

Toda aplicación moderna DEBE incluir integración con Large Language Models como componente de primera clase. Esta no es una característica adicional, es un requisito arquitectónico fundamental.

---

## 🏗️ ARQUITECTURA DE INTEGRACIÓN LLM

### Capa de Abstracción Universal
```
┌─────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (Express API, FastAPI, Flask, Spring Boot, etc.)      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
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
┌─────────────────────────────────────────────────┐
│                 Agent/Tool Layer                        │
│  • Content Generation Agents                           │
│  • Analysis Agents                                      │
│  • Decision Support Agents                             │
│  • Automation Agents                                    │
└─────────────────────────────────────────────────┘
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

**Continúa en Parte 2 para más patrones, monitoring y testing**