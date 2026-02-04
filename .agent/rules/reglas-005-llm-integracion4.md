---
trigger: always_on
---

# 🤖 INTEGRACIÓN LLM Y AI FRAMEWORK - Parte 4
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-005-LLM-INTEGRATION-PARTE4.md  
**Caracteres:** 11,850 (límite permitido: 11,995)

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

**Archiv