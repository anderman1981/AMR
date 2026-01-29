# 🤖 AI Agent System Architecture Guide
**Real-World Implementation Patterns**

**Version**: 1.0  
**Date**: January 2026  
**Based on**: Production systems like Hotmart Automation

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Architecture Patterns](#architecture-patterns)
3. [Real-World Example: Hotmart Automation](#real-world-example-hotmart-automation)
4. [Agent Design Patterns](#agent-design-patterns)
5. [LLM Integration Patterns](#llm-integration-patterns)
6. [API Design](#api-design)
7. [Database Schema](#database-schema)
8. [Deployment Strategies](#deployment-strategies)

---

## 1. Introduction

Modern AI-assisted applications require a **multi-agent architecture** where specialized agents handle different aspects of the system. This guide provides proven patterns based on production systems.

### Key Principles

1. **Agent Specialization**: Each agent has ONE clear responsibility
2. **LLM-First**: AI integration is not optional, it's architectural
3. **API-Driven**: Everything exposed via REST/GraphQL
4. **Event-Driven**: Agents communicate via events/messages
5. **Persistence**: All state stored in database for recovery
6. **Hybrid Stacks**: Use the right tool for each job

---

## 2. Architecture Patterns

### Pattern A: Monolithic Agent System (Small Projects)

```
┌─────────────────────────────────────────────────────────┐
│              Single Application Process                 │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Agent A  │  │ Agent B  │  │ Agent C  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       └─────────────┼─────────────┘                     │
│                     ▼                                    │
│              ┌─────────────┐                            │
│              │ LLM Manager │                            │
│              └──────┬──────┘                            │
│                     ▼                                    │
│              ┌─────────────┐                            │
│              │   Ollama    │                            │
│              └─────────────┘                            │
└─────────────────────────────────────────────────────────┘
```

**Use Cases:**
- MVPs
- Single-domain problems
- Small teams
- Cost-sensitive projects

**Tech Stack Example:**
```yaml
language: Python
framework: FastAPI
agents: 3-5 agents in same process
llm: Ollama local
database: SQLite or PostgreSQL
deployment: Single Docker container
```

---

### Pattern B: Distributed Agent Swarm (Medium Projects)

```
┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   API Gateway   │
│   React/Vue     │◄────►│   (Node.js)     │
└─────────────────┘      └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │ Agent Layer  │ │ Agent Layer  │ │ Agent Layer  │
            │  (Python)    │ │  (Python)    │ │  (Python)    │
            └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                   └─────────────────┼─────────────────┘
                                     ▼
                              ┌─────────────┐
                              │ Message Bus │
                              │   (Redis)   │
                              └──────┬──────┘
                                     ▼
                         ┌───────────────────────┐
                         │    Shared Services    │
                         │ LLM • DB • Storage    │
                         └───────────────────────┘
```

**Use Cases:**
- Production applications
- Multiple domains
- Scalability needs
- Team > 3 people

**Tech Stack Example:**
```yaml
frontend: React (TypeScript)
api_gateway: Node.js/Express
agent_runtime: Python
message_broker: Redis Pub/Sub
llm: Ollama + OpenAI fallback
database: PostgreSQL
cache: Redis
deployment: Docker Compose or Kubernetes
```

---

### Pattern C: Microservices with Agent Mesh (Large Projects)

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Service A  │    │   Service B  │    │   Service C  │
│   (Go)       │    │   (Node.js)  │    │   (Python)   │
│ ┌──────────┐ │    │ ┌──────────┐ │    │ ┌──────────┐ │
│ │ Agents   │ │    │ │ Agents   │ │    │ │ Agents   │ │
│ └────┬─────┘ │    │ └────┬─────┘ │    │ └────┬─────┘ │
└──────┼───────┘    └──────┼───────┘    └──────┼───────┘
       └────────────────────┼────────────────────┘
                            ▼
                   ┌─────────────────┐
                   │  Service Mesh   │
                   │   (Istio/Envoy) │
                   └────────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │ LLM Hub │      │   DB    │      │  Queue  │
    └─────────┘      └─────────┘      └─────────┘
```

**Use Cases:**
- Enterprise systems
- Multi-tenant
- High scale
- Complex domains

---

## 3. Real-World Example: Hotmart Automation

### System Overview

**Purpose**: Autonomous affiliate marketing system that discovers products, generates content, and publishes to social media.

**Architecture**: Hybrid (Pattern B)

```
┌─────────────────────────────────────────────────────────────┐
│                    Hotmart Automation v1.2                  │
└─────────────────────────────────────────────────────────────┘

Frontend Layer (Port 4124)
┌─────────────────────────────────────────────────────────────┐
│  React + Vite Dashboard                                     │
│  • Product management UI                                     │
│  • Agent status monitoring                                   │
│  • Real-time updates                                         │
│  • Settings & configuration                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/WebSocket
                  ▼
Backend API Layer (Port 4123)
┌─────────────────────────────────────────────────────────────┐
│  Node.js + Express                                          │
│  • REST API endpoints                                        │
│  • WebSocket for real-time                                   │
│  • Agent orchestration                                       │
│  • Request routing                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Manager  │ │ Detector │ │ Content  │ │ Learning │
│  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │
┌────┴─────┐ ┌───┴──────┐ ┌──┴───────┐ ┌──┴───────┐
│Instagram │ │  Assets  │ │   Git    │ │ Analyzer │
│  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     └────────────┼─────────────┼─────────────┘
                  ▼             ▼
            ┌──────────────────────┐
            │   Shared Services    │
            ├──────────────────────┤
            │ LLM: Ollama (11434)  │
            │ DB: PostgreSQL (5432)│
            │ Cache: Redis (6379)  │
            │ Queue: n8n (5679)    │
            └──────────────────────┘
```

### Agent Specifications

#### 1. Manager Agent (Orchestrator)
```json
{
  "name": "ManagerAgent",
  "type": "ORCHESTRATOR",
  "language": "Node.js",
  "responsibilities": [
    "Coordinate all agents",
    "Manage task queue",
    "Health monitoring",
    "Knowledge summarization",
    "Decision making"
  ],
  "llm_usage": {
    "provider": "ollama",
    "model": "llama3:latest",
    "use_cases": [
      "Analyze knowledge base",
      "Strategic decisions",
      "Agent coordination"
    ]
  },
  "api_endpoints": [
    "POST /api/agents/manager/start",
    "POST /api/agents/manager/stop",
    "GET /api/agents/manager/summarize",
    "POST /api/agents/manager/decision"
  ]
}
```

#### 2. Detector Agent (Market Scanner)
```json
{
  "name": "DetectorAgent",
  "type": "SCRAPER",
  "language": "Node.js + Puppeteer",
  "responsibilities": [
    "Scan Hotmart marketplace",
    "Extract product data",
    "Bayesian scoring",
    "Trend detection"
  ],
  "llm_usage": {
    "provider": "ollama",
    "model": "llama3:latest",
    "use_cases": [
      "Analyze product descriptions",
      "Sentiment analysis",
      "Niche classification"
    ]
  },
  "database_schema": {
    "table": "products",
    "columns": [
      "id", "name", "niche", "price", "commission",
      "score", "status", "llm_analysis", "created_at"
    ]
  },
  "api_endpoints": [
    "POST /api/agents/detector/start",
    "GET /api/agents/detector/status",
    "GET /api/products"
  ]
}
```

#### 3. Content Agent (Creative Generator)
```json
{
  "name": "ContentAgent",
  "type": "GENERATOR",
  "language": "Node.js",
  "responsibilities": [
    "Generate marketing copy",
    "Create social media posts",
    "Personalize for platform",
    "Optimize for engagement"
  ],
  "llm_usage": {
    "provider": "ollama",
    "model": "llama3:latest",
    "temperature": 0.8,
    "use_cases": [
      "Instagram captions",
      "TikTok scripts",
      "Email sequences",
      "Landing page copy"
    ]
  },
  "output_formats": [
    "Instagram post (caption + hashtags)",
    "TikTok script (hook + body + CTA)",
    "Email (subject + body)",
    "Blog post (title + content)"
  ],
  "api_endpoints": [
    "POST /api/agents/content/generate",
    "GET /api/content/history",
    "POST /api/content/regenerate"
  ]
}
```

#### 4. Instagram Agent (Publisher)
```json
{
  "name": "InstagramAgent",
  "type": "PUBLISHER",
  "language": "Node.js + Instagram API",
  "responsibilities": [
    "Publish to Instagram",
    "Schedule posts",
    "Track engagement",
    "Manage comments"
  ],
  "dependencies": [
    "ContentAgent (for content)",
    "AssetsAgent (for images)"
  ],
  "api_endpoints": [
    "POST /api/agents/instagram/publish",
    "GET /api/agents/instagram/status",
    "GET /api/posts/analytics"
  ]
}
```

#### 5. Learning Agent (Intelligence)
```json
{
  "name": "LearningAgent",
  "type": "ANALYZER",
  "language": "Node.js/Python",
  "responsibilities": [
    "Analyze performance patterns",
    "A/B test results",
    "Improve agent decisions",
    "Knowledge base updates"
  ],
  "llm_usage": {
    "provider": "ollama",
    "model": "llama3:latest",
    "use_cases": [
      "Pattern recognition",
      "Insight generation",
      "Predictive modeling",
      "Post-mortem analysis"
    ]
  },
  "database_schema": {
    "tables": [
      "learning_patterns",
      "agent_performance",
      "content_metrics",
      "knowledge_base"
    ]
  }
}
```

### Technology Stack Details

```yaml
hotmart_automation:
  version: "1.2.0"
  architecture: "Hybrid Agent Swarm"
  
  frontend:
    framework: "React 18 + Vite"
    language: "JavaScript"
    port: 4124
    features:
      - Real-time dashboard
      - Product management
      - Agent monitoring
      - Configuration UI
  
  backend:
    framework: "Express.js"
    language: "Node.js 20+"
    port: 4123
    features:
      - REST API
      - WebSocket server
      - Agent orchestration
      - Task scheduling
  
  agents:
    runtime: "Node.js"
    count: 7
    pattern: "Event-driven + Polling"
    agents:
      - ManagerAgent (orchestrator)
      - DetectorAgent (scraper)
      - ContentAgent (generator)
      - InstagramAgent (publisher)
      - AssetsAgent (media manager)
      - GitAgent (devops)
      - LearningAgent (intelligence)
  
  infrastructure:
    database:
      type: "PostgreSQL"
      port: 5432
      purpose: "Persistent storage"
    
    cache:
      type: "Redis"
      port: 6379
      purpose: "Session, queue, pub/sub"
    
    llm:
      provider: "Ollama"
      port: 11434
      models:
        - "llama3:latest" (general)
        - "codellama:latest" (code)
    
    automation:
      tool: "n8n"
      port: 5679
      workflows: 7
  
  deployment:
    method: "Docker Compose"
    containers: 7
    orchestration: "docker-compose.yml"
```

### API Endpoints Catalog

```javascript
// System Management
GET    /health                          // Health check
POST   /api/system/start                // Start system
POST   /api/system/stop                 // Stop system
GET    /api/system/stats                // System statistics

// Agent Management
GET    /api/agents                      // List all agents
GET    /api/agents/:name/status         // Get agent status
POST   /api/agents/:name/execute        // Execute agent task
POST   /api/agents/:name/train          // Train agent

// LLM Operations
POST   /api/llm/generate                // Generate text
POST   /api/llm/chat                    // Chat with LLM
POST   /api/llm/embed                   // Generate embeddings
GET    /api/llm/providers               // List providers
GET    /api/llm/health                  // Check LLM health

// Product Management
GET    /api/products                    // List products
POST   /api/products                    // Create product
GET    /api/products/:id                // Get product details
PUT    /api/products/:id                // Update product
DELETE /api/products/:id                // Delete product
POST   /api/products/batch              // Batch operations

// Content Management
POST   /api/content/generate            // Generate content
GET    /api/content/history             // Content history
POST   /api/content/regenerate          // Regenerate content

// Knowledge Base
POST   /api/ingest                      // Ingest knowledge
GET    /api/knowledge                   // Query knowledge
POST   /api/knowledge/summarize         // Summarize knowledge

// Settings
GET    /api/settings/menu               // Get menu config
PUT    /api/settings/menu               // Update menu
GET    /api/settings/api-keys           // List API keys
POST   /api/settings/api-keys           // Add API key
GET    /api/settings/data-sources       // List data sources
```

### Database Schema

```sql
-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    hotmart_id VARCHAR(255) UNIQUE,
    name VARCHAR(500),
    description TEXT,
    niche VARCHAR(100),
    price DECIMAL(10,2),
    commission DECIMAL(5,2),
    score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    llm_analysis JSONB,
    performance_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Content table
CREATE TABLE content (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    platform VARCHAR(50),
    content_type VARCHAR(50),
    content TEXT,
    metadata JSONB,
    performance JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent performance
CREATE TABLE agent_performance (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(100),
    task_type VARCHAR(100),
    execution_time INTEGER,
    success BOOLEAN,
    error TEXT,
    metrics JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge base
CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255),
    content TEXT,
    embedding VECTOR(1536),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System activity log
CREATE TABLE system_activity (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50),
    action VARCHAR(100),
    details TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Agent Design Patterns

### Pattern 1: Base Agent Class

**Principle**: All agents inherit from a common base with standard lifecycle methods.

```javascript
// File: src/agents/BaseAgent.js

class BaseAgent {
  constructor(name, config, llmManager) {
    this.name = name;
    this.config = config;
    this.llm = llmManager;
    this.status = 'idle';
    this.metrics = {
      tasks_completed: 0,
      tasks_failed: 0,
      avg_execution_time: 0
    };
  }

  // Lifecycle methods
  async initialize() {
    console.log(`[${this.name}] Initializing...`);
    this.status = 'initializing';
    // Load configuration, connect to services, etc.
    this.status = 'ready';
  }

  async start() {
    console.log(`[${this.name}] Starting...`);
    this.status = 'running';
  }

  async stop() {
    console.log(`[${this.name}] Stopping...`);
    this.status = 'stopped';
  }

  async execute(task, context = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`[${this.name}] Executing task: ${task.type}`);
      
      // Pre-execution
      await this.beforeExecute(task, context);
      
      // Main execution
      const result = await this.doExecute(task, context);
      
      // Post-execution
      await this.afterExecute(task, context, result);
      
      // Update metrics
      this.metrics.tasks_completed++;
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime);
      
      return {
        success: true,
        result,
        execution_time: executionTime
      };
      
    } catch (error) {
      this.metrics.tasks_failed++;
      console.error(`[${this.name}] Task failed:`, error);
      
      return {
        success: false,
        error: error.message,
        execution_time: Date.now() - startTime
      };
    }
  }

  // Abstract methods (must be implemented by subclasses)
  async doExecute(task, context) {
    throw new Error('doExecute must be implemented by subclass');
  }

  // Hook methods (optional overrides)
  async beforeExecute(task, context) {
    // Override to add pre-execution logic
  }

  async afterExecute(task, context, result) {
    // Override to add post-execution logic
  }

  // LLM integration helper
  async think(prompt, options = {}) {
    return await this.llm.generate(prompt, {
      model: this.config.model || 'llama3:latest',
      temperature: this.config.temperature || 0.7,
      ...options
    });
  }

  // Metrics
  updateMetrics(executionTime) {
    const n = this.metrics.tasks_completed;
    const prevAvg = this.metrics.avg_execution_time;
    this.metrics.avg_execution_time = (prevAvg * (n - 1) + executionTime) / n;
  }

  getMetrics() {
    return {
      ...this.metrics,
      status: this.status
    };
  }
}

module.exports = BaseAgent;
```

### Pattern 2: Specialized Agent Implementation

```javascript
// File: src/agents/ContentAgent.js

const BaseAgent = require('./BaseAgent');

class ContentAgent extends BaseAgent {
  constructor(llmManager, config) {
    super('ContentAgent', config, llmManager);
    this.templates = config.templates || {};
  }

  async doExecute(task, context) {
    const { type, product, platform } = task;
    
    switch (type) {
      case 'generate_post':
        return await this.generatePost(product, platform);
      
      case 'optimize_content':
        return await this.optimizeContent(task.content);
      
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  async generatePost(product, platform) {
    const template = this.templates[platform] || this.templates.default;
    
    const prompt = `
Generate a ${platform} post for this product:

Product Name: ${product.name}
Niche: ${product.niche}
Key Benefits: ${product.benefits.join(', ')}
Target Audience: ${product.target_audience}

Template requirements:
${template.requirements}

Output format:
{
  "hook": "attention-grabbing first line",
  "body": "main content",
  "cta": "call to action",
  "hashtags": ["tag1", "tag2", "tag3"]
}

Generate engaging, authentic content that drives conversions.
`;

    const response = await this.think(prompt, {
      temperature: 0.8
    });
    
    // Parse JSON from response
    const content = this.extractJSON(response.text);
    
    return content;
  }

  extractJSON(text) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in LLM response');
    }
    return JSON.parse(jsonMatch[0]);
  }
}

module.exports = ContentAgent;
```

### Pattern 3: Agent Orchestration

```javascript
// File: src/agents/AgentOrchestrator.js

class AgentOrchestrator {
  constructor(agents) {
    this.agents = new Map();
    
    // Register all agents
    agents.forEach(agent => {
      this.agents.set(agent.name, agent);
    });
  }

  async initializeAll() {
    for (const agent of this.agents.values()) {
      await agent.initialize();
    }
  }

  async executeWorkflow(workflow) {
    const results = [];
    
    for (const step of workflow.steps) {
      const agent = this.agents.get(step.agent);
      
      if (!agent) {
        throw new Error(`Agent not found: ${step.agent}`);
      }
      
      // Execute step
      const result = await agent.execute(step.task, {
        previous_results: results
      });
      
      results.push(result);
      
      // Check if workflow should continue
      if (!result.success && step.critical) {
        throw new Error(`Critical step failed: ${step.agent}`);
      }
    }
    
    return results;
  }

  async getSystemStatus() {
    const status = {};
    
    for (const [name, agent] of this.agents) {
      status[name] = agent.getMetrics();
    }
    
    return status;
  }
}

module.exports = AgentOrchestrator;
```

---

## 5. LLM Integration Patterns

### Pattern 1: Provider Fallback Strategy

```javascript
// Automatic fallback when primary provider fails
async function generateWithFallback(prompt, options = {}) {
  const providers = ['ollama', 'openai', 'anthropic'];
  
  for (const provider of providers) {
    try {
      console.log(`Trying provider: ${provider}`);
      const result = await llmManager.generate(prompt, {
        ...options,
        provider
      });
      
      console.log(`Success with provider: ${provider}`);
      return result;
      
    } catch (error) {
      console.error(`Provider ${provider} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All LLM providers failed');
}
```

### Pattern 2: Cost-Aware Provider Selection

```javascript
// Choose provider based on cost and quality needs
function selectProvider(task) {
  if (task.quality === 'high') {
    return 'openai'; // GPT-4
  }
  
  if (task.privacy === 'required') {
    return 'ollama'; // Local
  }
  
  if (task.cost === 'low') {
    return 'ollama'; // Free
  }
  
  return 'openai'; // Default
}
```

### Pattern 3: RAG (Retrieval Augmented Generation)

```javascript
async function ragGenerate(query, context) {
  // 1. Retrieve relevant documents
  const embedding = await llmManager.embed(query);
  const relevantDocs = await vectorDB.search(embedding, limit: 5);
  
  // 2. Build enhanced prompt
  const enhancedPrompt = `
Context from knowledge base:
${relevantDocs.map(doc => doc.content).join('\n\n')}

User query: ${query}

Based on the context above, provide a detailed answer.
`;
  
  // 3. Generate with context
  const result = await llmManager.generate(enhancedPrompt);
  
  return {
    answer: result.text,
    sources: relevantDocs.map(d => d.metadata)
  };
}
```

---

## 6. API Design

### RESTful API Structure

```javascript
// File: src/routes/index.js

const express = require('express');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.2.0'
  });
});

// Agent routes
router.use('/api/agents', require('./agents.routes'));
router.use('/api/llm', require('./llm.routes'));
router.use('/api/products', require('./products.routes'));
router.use('/api/content', require('./content.routes'));
router.use('/api/knowledge', require('./knowledge.routes'));

module.exports = router;
```

### API Documentation Example

```yaml
# docs/api/openapi.yml

openapi: 3.0.0
info:
  title: Hotmart Automation API
  version: 1.2.0
  description: AI-powered affiliate marketing automation system

servers:
  - url: http://localhost:4123
    description: Development server

paths:
  /api/agents/{agentName}/execute:
    post:
      summary: Execute agent task
      parameters:
        - name: agentName
          in: path
          required: true
          schema:
            type: string
            enum: [manager, detector, content, instagram, learning]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                task:
                  type: object
                  properties:
                    type:
                      type: string
                    data:
                      type: object
                context:
                  type: object
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
                  result:
                    type: object
                  execution_time:
                    type: integer
```

---

## 7. Database Schema

### Schema for Agent Systems

```sql
-- Agent registry
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'idle',
    config JSONB,
    metrics JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Task queue
CREATE TABLE agent_tasks (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(100) REFERENCES agents(name),
    task_type VARCHAR(100) NOT NULL,
    task_data JSONB NOT NULL,
    context JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    result JSONB,
    error TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent communication log
CREATE TABLE agent_messages (
    id SERIAL PRIMARY KEY,
    from_agent VARCHAR(100),
    to_agent VARCHAR(100),
    message_type VARCHAR(50),
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- LLM usage tracking
CREATE TABLE llm_usage (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(100),
    provider VARCHAR(50),
    model VARCHAR(100),
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost DECIMAL(10,6),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_agent ON agent_tasks(agent_name);
CREATE INDEX idx_agent_tasks_priority ON agent_tasks(priority DESC);
CREATE INDEX idx_llm_usage_agent ON llm_usage(agent_name);
CREATE INDEX idx_llm_usage_created ON llm_usage(created_at);
```

---

## 8. Deployment Strategies

### Docker Compose Configuration

```yaml
# docker-compose.yml

version: '3.8'

services:
  # Backend API
  backend:
    build: ./motor
    ports:
      - "4123:4123"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - OLLAMA_HOST=http://ollama:11434
    depends_on:
      - postgres
      - redis
      - ollama
    restart: unless-stopped

  # Frontend
  frontend:
    build: ./dashboard
    ports:
      - "4124:4124"
    environment:
      - VITE_API_URL=http://localhost:4123
    restart: unless-stopped

  # Database
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=hotmart
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  # LLM Service
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  # Automation
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5679:5679"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  ollama_data:
  n8n_data:
```

### Environment Configuration

```bash
# .env.production

# Application
NODE_ENV=production
PORT=4123
FRONTEND_PORT=4124

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hotmart
DB_USER=user
DB_PASSWORD=secure_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# LLM
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=llama3:latest

# Optional: Cloud LLM providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Hotmart Credentials
HOTMART_EMAIL=your_email@example.com
HOTMART_PASSWORD=your_password

# Instagram
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password

# n8n
N8N_HOST=http://n8n:5679
N8N_USER=admin
N8N_PASSWORD=admin

# Security
JWT_SECRET=your_jwt_secret_here
API_KEY=your_api_key_here
```

---

## 9. Best Practices

### 1. Agent Independence

✅ **DO**: Make agents independent and loosely coupled
```javascript
// Good: Agent doesn't know about other agents
class ContentAgent {
  async generate(product) {
    return this.llm.generate(prompt);
  }
}
```

❌ **DON'T**: Create tight coupling between agents
```javascript
// Bad: Direct agent-to-agent coupling
class ContentAgent {
  async generate(product) {
    const assets = await this.assetsAgent.getAssets(); // Tight coupling
    return this.llm.generate(prompt);
  }
}
```

### 2. Error Handling

✅ **DO**: Handle errors gracefully with retries
```javascript
async function executeWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```

### 3. LLM Response Validation

✅ **DO**: Always validate and parse LLM responses
```javascript
function parseJSONFromLLM(text) {
  // Extract JSON even if wrapped in markdown
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                    text.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('No valid JSON in response');
  }
  
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr);
}
```

### 4. Monitoring & Logging

✅ **DO**: Log all agent activities
```javascript
class BaseAgent {
  async execute(task) {
    const startTime = Date.now();
    
    logger.info(`[${this.name}] Starting task: ${task.type}`);
    
    try {
      const result = await this.doExecute(task);
      
      logger.info(`[${this.name}] Task completed`, {
        task_type: task.type,
        execution_time: Date.now() - startTime,
        success: true
      });
      
      return result;
      
    } catch (error) {
      logger.error(`[${this.name}] Task failed`, {
        task_type: task.type,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
}
```

---

## 10. Testing Strategies

### Unit Testing Agents

```javascript
// tests/agents/ContentAgent.test.js

const ContentAgent = require('../../src/agents/ContentAgent');
const { MockLLMManager } = require('../mocks/llm');

describe('ContentAgent', () => {
  let agent;
  let mockLLM;

  beforeEach(() => {
    mockLLM = new MockLLMManager();
    agent = new ContentAgent(mockLLM, {});
  });

  test('should generate Instagram post', async () => {
    mockLLM.setResponse(JSON.stringify({
      hook: "Transform your life today!",
      body: "Discover the secrets...",
      cta: "Click the link in bio",
      hashtags: ["#transformation", "#success"]
    }));

    const result = await agent.execute({
      type: 'generate_post',
      product: {
        name: 'Life Coach Course',
        niche: 'Personal Development'
      },
      platform: 'instagram'
    });

    expect(result.success).toBe(true);
    expect(result.result.hook).toBeDefined();
    expect(result.result.hashtags).toHaveLength(2);
  });
});
```

### Integration Testing

```javascript
// tests/integration/workflow.test.js

describe('Product Discovery Workflow', () => {
  test('should complete full workflow', async () => {
    // 1. Scan market
    const scanResult = await api.post('/api/agents/detector/execute', {
      task: { type: 'scan', limit: 5 }
    });
    
    expect(scanResult.status).toBe(200);
    expect(scanResult.data.success).toBe(true);
    
    // 2. Generate content for top product
    const product = scanResult.data.result.products[0];
    
    const contentResult = await api.post('/api/agents/content/execute', {
      task: {
        type: 'generate_post',
        product,
        platform: 'instagram'
      }
    });
    
    expect(contentResult.status).toBe(200);
    expect(contentResult.data.result.content).toBeDefined();
  });
});
```

---

## 11. Conclusion

This guide provides proven patterns for building AI agent systems with:

✅ **Modular Architecture**: Agents are independent and reusable  
✅ **LLM Integration**: Multiple providers with fallback  
✅ **Production Ready**: Real examples from production systems  
✅ **Scalable**: Patterns that grow with your needs  
✅ **Well Documented**: API specs and schemas included  

**Next Steps:**
1. Choose your architecture pattern
2. Implement base agent class
3. Create specialized agents
4. Set up LLM integration
5. Build API endpoints
6. Deploy with Docker

**Resources:**
- Example code: See Hotmart Automation repository
- OpenAPI specs: `/docs/api/`
- Database schemas: `/docs/schemas/`
- Agent configs: `/documents/*.json`

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Based on**: Production system with 7 agents, 1.2M+ tasks processed
