# 🎯 AI Development Master Protocol (ADMP)
**Version**: 2.0  
**Last Updated**: January 2026  
**Purpose**: Universal Development Standard for AI-Assisted Software Engineering  
**Compliance**: ISO/IEC 25010, IEEE 829, PMBOK, SWEBOK, UML 2.5

---

## 📋 Table of Contents

1. [Protocol Overview](#1-protocol-overview)
2. [Pre-Development Phase](#2-pre-development-phase)
3. [Project Structure Standards](#3-project-structure-standards)
4. [Git Workflow Rules](#4-git-workflow-rules)
5. [Development Standards](#5-development-standards)
6. [Agent System Architecture](#6-agent-system-architecture)
7. [Testing & Quality Assurance](#7-testing--quality-assurance)
8. [Documentation Standards](#8-documentation-standards)
9. [Delivery & Deployment](#9-delivery--deployment)
10. [Agent Training Data](#10-agent-training-data)

---

## 1. Protocol Overview

### 1.1 Mission Statement
> "Every AI agent must follow this protocol to ensure consistent, professional, and maintainable software delivery across all projects."

### 1.2 Core Principles (The 5 Cs)

```yaml
consistency: "Same rules, same results, every time"
completeness: "Nothing is done until it's tested, documented, and deployed"
clarity: "Code should read like well-written prose"
compliance: "All standards are non-negotiable"
continuous_improvement: "Every iteration makes the system better"
```

### 1.3 AI Agent Responsibilities

**BEFORE writing ANY code, the AI must:**

1. ✅ Read and acknowledge this entire protocol
2. ✅ Request missing information if specifications are incomplete
3. ✅ Create project structure following standards
4. ✅ Initialize Git repository with proper branches
5. ✅ Set up testing framework
6. ✅ Create documentation templates
7. ✅ Establish success criteria and KPIs

**THEN and ONLY THEN can development begin.**

---

## 2. Pre-Development Phase

### 2.1 Requirements Gathering Checklist

```markdown
## Project Initialization Questionnaire

### Business Context
- [ ] What problem does this solve? (Jobs to Be Done)
- [ ] Who are the users? (Personas)
- [ ] What is the success metric? (KPI)
- [ ] What is the timeline? (Roadmap)
- [ ] What is the budget constraint?

### Technical Context
- [ ] Technology stack preferences?
- [ ] Integration requirements?
- [ ] Performance requirements? (SLA)
- [ ] Security requirements? (Compliance)
- [ ] Scalability expectations?

### Quality Context
- [ ] Test coverage target? (Minimum: 80%)
- [ ] Documentation level? (Minimum: API + README)
- [ ] Code review process?
- [ ] CI/CD requirements?
```

### 2.2 Project Charter Template

```markdown
# Project Charter: [Project Name]

## Executive Summary
**Project Name**: [Name]
**Project Code**: [ABC-2026-001]
**Start Date**: [Date]
**Expected Duration**: [X weeks]
**Project Manager**: [Name]
**Technical Lead**: [Name]

## Objectives
1. [Primary objective with measurable outcome]
2. [Secondary objective]
3. [Tertiary objective]

## Scope
**In Scope:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Out of Scope:**
- [Explicitly not included]
- [Future consideration]

## Stakeholders
| Role | Name | Responsibility |
|------|------|----------------|
| Sponsor | [Name] | Budget approval |
| Product Owner | [Name] | Requirements |
| Tech Lead | [Name] | Architecture |
| QA Lead | [Name] | Testing strategy |

## Success Criteria
- [ ] Criterion 1: [Measurable outcome]
- [ ] Criterion 2: [Measurable outcome]
- [ ] Criterion 3: [Measurable outcome]

## Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Strategy] |

## Approval
- [ ] Sponsor Sign-off
- [ ] Tech Lead Sign-off
- [ ] Budget Allocated
```

### 2.3 Architecture Decision Records (ADR)

**Template: `docs/adr/ADR-001-[decision-title].md`**

```markdown
# ADR-001: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded
**Deciders**: [Names]
**Technical Story**: [Issue #XXX]

## Context
[Describe the forces at play, including technological, political, social, and project local]

## Decision
[Describe the response to these forces]

## Consequences
**Positive:**
- [Benefit 1]
- [Benefit 2]

**Negative:**
- [Trade-off 1]
- [Trade-off 2]

**Neutral:**
- [Impact 1]

## Alternatives Considered
1. **Alternative A**: [Why rejected]
2. **Alternative B**: [Why rejected]
```

### 2.4 UML Diagrams Required

**Before coding, create these diagrams:**

1. **Use Case Diagram** (`docs/diagrams/use-cases.puml`)
2. **Class Diagram** (`docs/diagrams/class-diagram.puml`)
3. **Sequence Diagram** (`docs/diagrams/sequences/`)
4. **Component Diagram** (`docs/diagrams/components.puml`)
5. **Deployment Diagram** (`docs/diagrams/deployment.puml`)
6. **State Machine Diagram** (if applicable)
7. **Activity Diagram** (for complex workflows)

**Example Use Case Diagram:**

```plantuml
@startuml
left to right direction
actor User
actor Admin

rectangle System {
  User --> (Login)
  User --> (View Dashboard)
  User --> (Create Report)
  Admin --> (Manage Users)
  Admin --> (View Analytics)
  (Manage Users) .> (Login) : includes
}
@enduml
```

---

## 3. Project Structure Standards

### 3.1 Universal Directory Structure

```
project-root/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   └── tests.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── documentation.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/
│   ├── adr/                          # Architecture Decision Records
│   ├── api/                          # API documentation
│   ├── diagrams/                     # UML and other diagrams
│   ├── guides/                       # User guides
│   ├── PROJECT_CHARTER.md
│   ├── ARCHITECTURE.md
│   └── CHANGELOG.md
│
├── src/                              # Source code
│   ├── core/                         # Core business logic
│   ├── api/                          # API layer
│   ├── services/                     # Service layer
│   ├── models/                       # Data models
│   ├── utils/                        # Utilities
│   └── config/                       # Configuration
│
├── tests/
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   ├── e2e/                          # End-to-end tests
│   ├── fixtures/                     # Test data
│   └── mocks/                        # Mock objects
│
├── scripts/
│   ├── setup/                        # Setup scripts
│   ├── deploy/                       # Deployment scripts
│   ├── migrate/                      # Migration scripts
│   └── seed/                         # Seed data scripts
│
├── config/
│   ├── development.yml
│   ├── staging.yml
│   ├── production.yml
│   └── test.yml
│
├── .gitignore
├── .editorconfig
├── .eslintrc (or equivalent linter config)
├── .prettierrc (or equivalent formatter config)
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
└── package.json (or equivalent dependency file)
```

### 3.2 Naming Conventions

**Files & Directories:**
```yaml
python:
  files: "snake_case.py"
  classes: "PascalCase"
  functions: "snake_case"
  constants: "UPPER_SNAKE_CASE"
  
javascript:
  files: "camelCase.js or kebab-case.js"
  classes: "PascalCase"
  functions: "camelCase"
  constants: "UPPER_SNAKE_CASE"
  
general:
  configs: "kebab-case.yml"
  docs: "UPPER_CASE.md or kebab-case.md"
  tests: "test_file_name.py or fileName.test.js"
```

**Git Branches:**
```
feature/ABC-123-short-description
fix/ABC-124-bug-description
hotfix/ABC-125-critical-fix
docs/ABC-126-documentation-update
refactor/ABC-127-code-improvement
chore/ABC-128-maintenance-task
```

---

## 4. Git Workflow Rules

### 4.1 Branch Strategy (GitFlow Modified)

```
main (production)
  ↑
  └── release/v1.x.x (release candidates)
        ↑
        └── dev (integration branch)
              ↑
              ├── feature/ABC-xxx (new features)
              ├── fix/ABC-xxx (bug fixes)
              └── docs/ABC-xxx (documentation)
```

### 4.2 Branch Protection Rules

**`main` Branch:**
- ❌ Direct commits prohibited
- ✅ Requires Pull Request
- ✅ Requires 2+ approvals
- ✅ All tests must pass
- ✅ No merge conflicts
- ✅ Up-to-date with base branch

**`dev` Branch:**
- ❌ Direct commits discouraged
- ✅ Requires Pull Request
- ✅ Requires 1+ approval
- ✅ All tests must pass

### 4.3 Commit Message Standard (Conventional Commits)

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**
```
feat(auth): add JWT token validation

Implement JWT token validation middleware that checks:
- Token expiration
- Token signature
- User permissions

Closes #123
```

```
fix(api): resolve race condition in user creation

Previously, concurrent requests could create duplicate users.
Added transaction lock to ensure atomicity.

Fixes #456
Related to #457
```

### 4.4 Pull Request Protocol

**PR Title Format:**
```
[TYPE] Brief description (#Issue-Number)
```

**PR Template:**

```markdown
## 📝 Description
[Clear description of what this PR does]

## 🔗 Related Issues
Closes #XXX
Related to #YYY

## 🎯 Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## ✅ Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## 🧪 Testing
**Test Coverage:** X%

**Test Cases:**
- [x] Test case 1: Description
- [x] Test case 2: Description
- [ ] Test case 3: Description (if applicable)

**Manual Testing:**
- [x] Tested on local environment
- [ ] Tested on staging environment (if applicable)

## 📸 Screenshots (if applicable)
[Add screenshots for UI changes]

## 🚀 Deployment Notes
[Any special deployment instructions]

## 📚 Additional Context
[Any additional information reviewers should know]
```

### 4.5 AI Agent Git Commands Sequence

**When creating a new feature:**

```bash
# 1. Ensure dev is up to date
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/ABC-123-description

# 3. Implement feature
# [Development happens here]

# 4. Stage and commit
git add .
git commit -m "feat(module): description

Detailed explanation of changes.

Closes #123"

# 5. Push to remote
git push origin feature/ABC-123-description

# 6. Create PR using GitHub CLI
gh pr create --base dev --title "[FEAT] Description (#123)" --body-file .github/pr-template.md

# 7. After approval, merge and delete branch
gh pr merge --squash --delete-branch
```

---

## 5. Development Standards

### 5.0 Language Flexibility & Hybrid Architectures

**The protocol supports:**
- **Single-language projects**: Python-only, Node.js-only, Java-only, etc.
- **Hybrid architectures**: Common patterns include:
  - Backend: Node.js/Express + Frontend: React/Vite
  - Backend: Python/FastAPI + Frontend: Vue.js
  - Backend: Go + Frontend: Svelte
  - Microservices: Mix of languages per service
  - Agent systems: Python for AI/ML + Node.js for APIs

**Architecture Decision Requirements:**
- Document language choices in ADR
- Justify hybrid approach if used
- Define inter-service communication (REST, GraphQL, gRPC, Message Queue)
- Specify deployment strategy per component

**Example Hybrid Stack Documentation:**
```yaml
project_architecture:
  backend:
    language: "Node.js 20+"
    framework: "Express.js"
    port: 4123
    responsibilities: ["API Gateway", "Business Logic", "Agent Orchestration"]
  
  frontend:
    language: "JavaScript/React"
    framework: "Vite"
    port: 4124
    responsibilities: ["UI/UX", "Real-time updates", "Dashboard"]
  
  ai_agents:
    language: "Python 3.11+"
    framework: "Custom classes"
    responsibilities: ["LLM Integration", "Scraping", "Content Generation"]
  
  database:
    type: "PostgreSQL"
    port: 5432
    
  cache:
    type: "Redis"
    port: 6379
  
  llm_service:
    type: "Ollama"
    port: 11434
    models: ["llama3:latest", "codellama:latest"]
```

### 5.1 SOLID Principles (Non-Negotiable)

**S - Single Responsibility Principle**
```python
# ❌ BAD: Class doing too much
class UserManager:
    def create_user(self, data):
        # Creates user
        # Sends email
        # Logs activity
        # Updates analytics
        pass

# ✅ GOOD: Single responsibility
class UserRepository:
    def create(self, user): pass

class EmailService:
    def send_welcome_email(self, user): pass

class AuditLogger:
    def log_user_creation(self, user): pass

class AnalyticsService:
    def track_user_signup(self, user): pass
```

**O - Open/Closed Principle**
```python
# ❌ BAD: Must modify class to add new payment method
class PaymentProcessor:
    def process(self, payment_type):
        if payment_type == "credit_card":
            # Process credit card
        elif payment_type == "paypal":
            # Process PayPal
        # Adding new method requires modifying this class

# ✅ GOOD: Open for extension, closed for modification
class PaymentMethod:
    def process(self): raise NotImplementedError

class CreditCardPayment(PaymentMethod):
    def process(self): pass

class PayPalPayment(PaymentMethod):
    def process(self): pass

class PaymentProcessor:
    def process(self, payment_method: PaymentMethod):
        payment_method.process()
```

**L - Liskov Substitution Principle**
```python
# ❌ BAD: Subclass changes expected behavior
class Bird:
    def fly(self): pass

class Penguin(Bird):
    def fly(self):
        raise Exception("Penguins can't fly!")  # Violates LSP

# ✅ GOOD: Proper abstraction
class Bird:
    def move(self): pass

class FlyingBird(Bird):
    def fly(self): pass

class Penguin(Bird):
    def swim(self): pass
```

**I - Interface Segregation Principle**
```python
# ❌ BAD: Fat interface
class Worker:
    def work(self): pass
    def eat(self): pass
    def sleep(self): pass

# Robots shouldn't need to implement eat() and sleep()

# ✅ GOOD: Segregated interfaces
class Workable:
    def work(self): pass

class Eatable:
    def eat(self): pass

class Sleepable:
    def sleep(self): pass

class Human(Workable, Eatable, Sleepable):
    pass

class Robot(Workable):
    pass
```

**D - Dependency Inversion Principle**
```python
# ❌ BAD: High-level module depends on low-level module
class MySQLDatabase:
    def connect(self): pass

class UserService:
    def __init__(self):
        self.db = MySQLDatabase()  # Tight coupling

# ✅ GOOD: Both depend on abstraction
class Database:
    def connect(self): raise NotImplementedError

class MySQLDatabase(Database):
    def connect(self): pass

class PostgreSQLDatabase(Database):
    def connect(self): pass

class UserService:
    def __init__(self, database: Database):
        self.db = database  # Loose coupling
```

### 5.2 Clean Code Principles

**Meaningful Names:**
```python
# ❌ BAD
d = 86400  # What is this?
def calc(x, y):
    return x * y

# ✅ GOOD
SECONDS_PER_DAY = 86400
def calculate_rectangle_area(width: float, height: float) -> float:
    return width * height
```

**Functions Should Do One Thing:**
```python
# ❌ BAD
def process_order(order):
    # Validates order
    # Calculates total
    # Charges payment
    # Sends email
    # Updates inventory
    pass

# ✅ GOOD
def process_order(order):
    validated_order = validate_order(order)
    total = calculate_total(validated_order)
    payment = charge_payment(total)
    send_confirmation_email(order.customer, payment)
    update_inventory(order.items)
```

**Comments Explain Why, Not What:**
```python
# ❌ BAD
# Increment counter by 1
counter += 1

# ✅ GOOD
# We use exponential backoff to avoid overwhelming the API
retry_delay = base_delay * (2 ** attempt_count)
```

### 5.3 Code Quality Checklist

```markdown
## Before Committing Code

### Functionality
- [ ] Code works as intended
- [ ] All edge cases handled
- [ ] Error handling implemented
- [ ] Input validation present

### Readability
- [ ] Variable names are descriptive
- [ ] Functions are small (<50 lines)
- [ ] No magic numbers
- [ ] Complex logic is commented

### Maintainability
- [ ] No code duplication (DRY)
- [ ] Functions do one thing (SRP)
- [ ] Dependencies are injected
- [ ] Configuration is externalized

### Performance
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] Appropriate data structures used
- [ ] No unnecessary loops

### Security
- [ ] Input is sanitized
- [ ] No hardcoded secrets
- [ ] Authentication/authorization implemented
- [ ] OWASP Top 10 considered

### Testing
- [ ] Unit tests written
- [ ] Integration tests written (if applicable)
- [ ] Test coverage >80%
- [ ] All tests pass
```

---

## 5.5 Mandatory LLM/AI Integration

**CRITICAL**: Every modern AI-assisted project MUST include LLM integration as a first-class component.

### 5.5.1 LLM Integration Architecture

**Standard Pattern:**
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

### 5.5.2 LLM Provider Configuration

**File: `config/llm-providers.yml`**

```yaml
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
  
  anthropic:
    enabled: false
    api_key: "${ANTHROPIC_API_KEY}"
    default_model: "claude-3-opus-20240229"
    models:
      chat: "claude-3-opus-20240229"
      code: "claude-3-sonnet-20240229"
    max_tokens: 4096
  
  google:
    enabled: false
    api_key: "${GOOGLE_API_KEY}"
    default_model: "gemini-pro"
    models:
      chat: "gemini-pro"
      vision: "gemini-pro-vision"
  
  # Fallback strategy
  fallback_order: ["ollama", "openai", "anthropic", "google"]
  retry_on_failure: true
```

### 5.5.3 LLM Abstraction Layer Implementation

**File: `src/llm/LLMManager.js` (Node.js example)**

```javascript
class LLMManager {
  constructor(config) {
    this.providers = {
      ollama: new OllamaProvider(config.ollama),
      openai: new OpenAIProvider(config.openai),
      anthropic: new AnthropicProvider(config.anthropic),
      google: new GoogleProvider(config.google)
    };
    this.fallbackOrder = config.fallback_order;
  }

  async generate(prompt, options = {}) {
    const provider = options.provider || this.fallbackOrder[0];
    
    try {
      return await this.providers[provider].generate(prompt, options);
    } catch (error) {
      console.error(`Provider ${provider} failed:`, error.message);
      
      // Try fallback providers
      for (const fallbackProvider of this.fallbackOrder.slice(1)) {
        try {
          console.log(`Trying fallback provider: ${fallbackProvider}`);
          return await this.providers[fallbackProvider].generate(prompt, options);
        } catch (fallbackError) {
          continue;
        }
      }
      
      throw new Error('All LLM providers failed');
    }
  }

  async embed(text, options = {}) {
    const provider = options.provider || this.fallbackOrder[0];
    return await this.providers[provider].embed(text, options);
  }

  async chat(messages, options = {}) {
    const provider = options.provider || this.fallbackOrder[0];
    return await this.providers[provider].chat(messages, options);
  }
}

// Provider implementations
class OllamaProvider {
  constructor(config) {
    this.host = config.host;
    this.models = config.models;
  }

  async generate(prompt, options = {}) {
    const model = options.model || this.models.chat;
    const response = await fetch(`${this.host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 2000
        }
      })
    });
    
    const data = await response.json();
    return {
      text: data.response,
      model,
      provider: 'ollama',
      usage: { total_tokens: data.eval_count || 0 }
    };
  }

  async chat(messages, options = {}) {
    // Convert messages to Ollama format
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    return this.generate(prompt, options);
  }

  async embed(text, options = {}) {
    const model = options.model || this.models.embedding;
    const response = await fetch(`${this.host}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text })
    });
    
    const data = await response.json();
    return { embedding: data.embedding, model, provider: 'ollama' };
  }
}

module.exports = { LLMManager, OllamaProvider };
```

**File: `src/llm/LLMManager.py` (Python example)**

```python
from typing import List, Dict, Optional
import requests
from abc import ABC, abstractmethod

class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, options: Dict) -> Dict:
        pass
    
    @abstractmethod
    async def chat(self, messages: List[Dict], options: Dict) -> Dict:
        pass
    
    @abstractmethod
    async def embed(self, text: str, options: Dict) -> Dict:
        pass

class OllamaProvider(LLMProvider):
    def __init__(self, config: Dict):
        self.host = config['host']
        self.models = config['models']
    
    async def generate(self, prompt: str, options: Dict = {}) -> Dict:
        model = options.get('model', self.models['chat'])
        response = requests.post(
            f"{self.host}/api/generate",
            json={
                'model': model,
                'prompt': prompt,
                'stream': False,
                'options': {
                    'temperature': options.get('temperature', 0.7),
                    'num_predict': options.get('max_tokens', 2000)
                }
            }
        )
        
        data = response.json()
        return {
            'text': data['response'],
            'model': model,
            'provider': 'ollama',
            'usage': {'total_tokens': data.get('eval_count', 0)}
        }
    
    async def chat(self, messages: List[Dict], options: Dict = {}) -> Dict:
        prompt = '\n'.join([f"{m['role']}: {m['content']}" for m in messages])
        return await self.generate(prompt, options)
    
    async def embed(self, text: str, options: Dict = {}) -> Dict:
        model = options.get('model', self.models['embedding'])
        response = requests.post(
            f"{self.host}/api/embeddings",
            json={'model': model, 'prompt': text}
        )
        
        data = response.json()
        return {
            'embedding': data['embedding'],
            'model': model,
            'provider': 'ollama'
        }

class LLMManager:
    def __init__(self, config: Dict):
        self.providers = {
            'ollama': OllamaProvider(config['ollama']),
            # Add other providers
        }
        self.fallback_order = config['fallback_order']
    
    async def generate(self, prompt: str, options: Dict = {}) -> Dict:
        provider_name = options.get('provider', self.fallback_order[0])
        
        for provider_name in self.fallback_order:
            try:
                provider = self.providers[provider_name]
                return await provider.generate(prompt, options)
            except Exception as e:
                print(f"Provider {provider_name} failed: {e}")
                continue
        
        raise Exception('All LLM providers failed')
```

### 5.5.4 Agent Integration Pattern

**File: `src/agents/BaseAgent.js`**

```javascript
class BaseAgent {
  constructor(name, llmManager, config) {
    this.name = name;
    this.llm = llmManager;
    this.config = config;
  }

  async think(context) {
    // Use LLM for decision-making
    const prompt = this.buildPrompt(context);
    const response = await this.llm.generate(prompt, {
      model: this.config.model,
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.max_tokens || 2000
    });
    
    return this.parseResponse(response.text);
  }

  buildPrompt(context) {
    return `
You are ${this.name}, a specialized AI agent.

Your role: ${this.config.role}
Your responsibilities: ${this.config.responsibilities.join(', ')}

Current context:
${JSON.stringify(context, null, 2)}

Based on this context, provide your analysis and recommendations.
`;
  }

  parseResponse(text) {
    // Parse LLM response into structured data
    // Can include JSON extraction, regex patterns, etc.
    return text;
  }
}

class ContentAgent extends BaseAgent {
  constructor(llmManager, config) {
    super('ContentAgent', llmManager, config);
  }

  async generateContent(productName, niche, platform) {
    const prompt = `
Generate a ${platform} post for promoting:
Product: ${productName}
Niche: ${niche}

Requirements:
- Hook in first 3 seconds
- Value proposition clear
- Call to action
- Platform-specific format
- Engaging and authentic tone

Provide the content in JSON format:
{
  "hook": "...",
  "body": "...",
  "cta": "...",
  "hashtags": ["...", "..."]
}
`;
    
    const response = await this.llm.generate(prompt, {
      model: 'llama3:latest',
      temperature: 0.8
    });
    
    return JSON.parse(response.text);
  }
}

module.exports = { BaseAgent, ContentAgent };
```

### 5.5.5 API Endpoints for LLM Integration

**Required API Endpoints:**

```javascript
// File: src/routes/llm.routes.js

const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/llm/generate
 * @desc    Generate text using LLM
 * @access  Private
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, provider, model, options } = req.body;
    
    const result = await llmManager.generate(prompt, {
      provider,
      model,
      ...options
    });
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/llm/chat
 * @desc    Chat with LLM
 * @access  Private
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages, provider, model, options } = req.body;
    
    const result = await llmManager.chat(messages, {
      provider,
      model,
      ...options
    });
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/llm/embed
 * @desc    Generate embeddings
 * @access  Private
 */
router.post('/embed', async (req, res) => {
  try {
    const { text, provider, model } = req.body;
    
    const result = await llmManager.embed(text, {
      provider,
      model
    });
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/llm/providers
 * @desc    List available LLM providers and models
 * @access  Private
 */
router.get('/providers', async (req, res) => {
  try {
    const providers = await llmManager.getAvailableProviders();
    
    res.json({
      success: true,
      providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/llm/health
 * @desc    Check health of LLM providers
 * @access  Private
 */
router.get('/health', async (req, res) => {
  try {
    const health = await llmManager.checkHealth();
    
    res.json({
      success: true,
      health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

### 5.5.6 Agent API Endpoints

**File: `src/routes/agents.routes.js`**

```javascript
/**
 * @route   POST /api/agents/:agentName/execute
 * @desc    Execute agent task
 * @access  Private
 */
router.post('/:agentName/execute', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { task, context, options } = req.body;
    
    const agent = agentManager.getAgent(agentName);
    const result = await agent.execute(task, context, options);
    
    res.json({
      success: true,
      agent: agentName,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/agents/:agentName/status
 * @desc    Get agent status
 * @access  Private
 */
router.get('/:agentName/status', async (req, res) => {
  try {
    const { agentName } = req.params;
    const agent = agentManager.getAgent(agentName);
    const status = await agent.getStatus();
    
    res.json({
      success: true,
      agent: agentName,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/agents/:agentName/train
 * @desc    Train agent with feedback
 * @access  Private
 */
router.post('/:agentName/train', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { input, expected_output, actual_output, feedback } = req.body;
    
    const agent = agentManager.getAgent(agentName);
    const result = await agent.train({
      input,
      expected_output,
      actual_output,
      feedback
    });
    
    res.json({
      success: true,
      agent: agentName,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 5.5.7 OpenAPI Specification for LLM APIs

**File: `docs/api/llm-openapi.yml`**

```yaml
openapi: 3.0.0
info:
  title: LLM Integration API
  version: 1.0.0
  description: API for interacting with multiple LLM providers

servers:
  - url: http://localhost:4123/api
    description: Development server

paths:
  /llm/generate:
    post:
      summary: Generate text using LLM
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - prompt
              properties:
                prompt:
                  type: string
                  example: "Write a marketing post for a fitness app"
                provider:
                  type: string
                  enum: [ollama, openai, anthropic, google]
                  default: ollama
                model:
                  type: string
                  example: "llama3:latest"
                options:
                  type: object
                  properties:
                    temperature:
                      type: number
                      minimum: 0
                      maximum: 2
                      default: 0.7
                    max_tokens:
                      type: integer
                      default: 2000
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

  /llm/chat:
    post:
      summary: Chat with LLM
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - messages
              properties:
                messages:
                  type: array
                  items:
                    type: object
                    properties:
                      role:
                        type: string
                        enum: [user, assistant, system]
                      content:
                        type: string
                provider:
                  type: string
                model:
                  type: string
      responses:
        '200':
          description: Chat response

  /agents/{agentName}/execute:
    post:
      summary: Execute agent task
      parameters:
        - name: agentName
          in: path
          required: true
          schema:
            type: string
            enum: [detector, content, instagram, learning, assets, git, manager]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                task:
                  type: string
                context:
                  type: object
                options:
                  type: object
      responses:
        '200':
          description: Task executed successfully

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

### 5.5.8 Environment Configuration

**File: `.env.example`**

```bash
# LLM Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3:latest

# OpenAI (optional)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo

# Anthropic (optional)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229

# Google (optional)
GOOGLE_API_KEY=...
GOOGLE_MODEL=gemini-pro

# Fallback strategy
LLM_FALLBACK_ORDER=ollama,openai,anthropic,google
LLM_RETRY_ON_FAILURE=true

# Agent Configuration
AGENT_TIMEOUT=300000
AGENT_MAX_RETRIES=3
```

### 5.5.9 Testing LLM Integration

**File: `tests/integration/llm.test.js`**

```javascript
const { LLMManager } = require('../../src/llm/LLMManager');
const config = require('../../config/llm-providers');

describe('LLM Integration Tests', () => {
  let llmManager;

  beforeAll(() => {
    llmManager = new LLMManager(config);
  });

  test('should generate text with Ollama', async () => {
    const result = await llmManager.generate('Hello, how are you?', {
      provider: 'ollama'
    });
    
    expect(result.text).toBeDefined();
    expect(result.provider).toBe('ollama');
  });

  test('should fallback to next provider on failure', async () => {
    // Simulate Ollama failure
    jest.spyOn(llmManager.providers.ollama, 'generate')
      .mockRejectedValueOnce(new Error('Connection failed'));
    
    const result = await llmManager.generate('Test prompt');
    
    expect(result.provider).not.toBe('ollama');
  });

  test('should generate embeddings', async () => {
    const result = await llmManager.embed('Test text for embedding');
    
    expect(result.embedding).toBeDefined();
    expect(Array.isArray(result.embedding)).toBe(true);
  });
});
```

### 5.5.10 Documentation Requirements

**Every LLM-integrated project MUST include:**

1. **LLM Architecture Diagram** in `docs/diagrams/llm-architecture.puml`
2. **Provider Configuration Guide** in `docs/LLM_SETUP.md`
3. **API Documentation** in `docs/api/llm-api.md` or OpenAPI spec
4. **Agent Catalog** in `docs/AGENTS.md` listing all agents and their purposes
5. **Prompt Library** in `docs/prompts/` with version-controlled prompts
6. **Model Cards** in `docs/models/` documenting each LLM model used

---

## 5.6 Language-Specific Standards

**Python:**
```python
# Use type hints
def calculate_discount(price: float, discount_rate: float) -> float:
    return price * (1 - discount_rate)

# Use dataclasses for data containers
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    email: str

# Use context managers
with open('file.txt', 'r') as f:
    content = f.read()

# Use list comprehensions (when readable)
squares = [x**2 for x in range(10)]

# Follow PEP 8
# - 4 spaces for indentation
# - Max line length: 88 (Black formatter)
# - Two blank lines between top-level functions
```

**JavaScript/TypeScript:**
```typescript
// Use TypeScript for type safety
interface User {
  id: number;
  name: string;
  email: string;
}

function calculateDiscount(price: number, discountRate: number): number {
  return price * (1 - discountRate);
}

// Use async/await over callbacks
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Use destructuring
const { name, email } = user;

// Use const/let, never var
const API_URL = 'https://api.example.com';
let counter = 0;

// Use arrow functions for callbacks
users.map(user => user.name);
```

---

## 6. Agent System Architecture

### 6.1 Agent Roles & Responsibilities

```yaml
agents:
  project_manager:
    role: "Strategic planning and coordination"
    responsibilities:
      - Create project charter
      - Define success criteria
      - Manage timeline
      - Coordinate other agents
    
  architect:
    role: "System design and technical decisions"
    responsibilities:
      - Create UML diagrams
      - Write ADRs
      - Design database schema
      - Define API contracts
    
  code_generator:
    role: "Implement features"
    responsibilities:
      - Write production code
      - Follow SOLID principles
      - Implement error handling
      - Create modular components
    
  test_engineer:
    role: "Quality assurance"
    responsibilities:
      - Write unit tests
      - Write integration tests
      - Achieve >80% coverage
      - Create test plans
    
  documentation_writer:
    role: "Create and maintain docs"
    responsibilities:
      - Write API documentation
      - Create user guides
      - Update README
      - Maintain changelog
    
  devops_engineer:
    role: "CI/CD and infrastructure"
    responsibilities:
      - Configure GitHub Actions
      - Set up deployment pipelines
      - Manage environments
      - Monitor performance
    
  security_auditor:
    role: "Security review"
    responsibilities:
      - Review code for vulnerabilities
      - Implement security best practices
      - Manage secrets
      - Conduct threat modeling
```

### 6.2 Agent Workflow Sequence

```mermaid
graph TD
    A[User Request] --> B[Project Manager Agent]
    B --> C{Requires Architecture?}
    C -->|Yes| D[Architect Agent]
    C -->|No| E[Code Generator Agent]
    D --> E
    E --> F[Test Engineer Agent]
    F --> G{Tests Pass?}
    G -->|No| E
    G -->|Yes| H[Documentation Writer Agent]
    H --> I[DevOps Engineer Agent]
    I --> J[Security Auditor Agent]
    J --> K{Secure?}
    K -->|No| E
    K -->|Yes| L[Delivery]
```

### 6.3 Agent Communication Protocol

**Agent Handoff Template:**

```json
{
  "from_agent": "project_manager",
  "to_agent": "architect",
  "timestamp": "2026-01-28T10:30:00Z",
  "context": {
    "project_charter": "docs/PROJECT_CHARTER.md",
    "requirements": ["REQ-001", "REQ-002", "REQ-003"],
    "constraints": {
      "timeline": "4 weeks",
      "budget": "$50,000",
      "team_size": 5
    }
  },
  "task": {
    "type": "architecture_design",
    "deliverables": [
      "UML diagrams",
      "Database schema",
      "API specification",
      "ADRs"
    ],
    "deadline": "2026-02-04T17:00:00Z"
  },
  "success_criteria": [
    "All UML diagrams complete",
    "Schema normalized to 3NF",
    "API follows REST principles",
    "At least 3 ADRs documented"
  ]
}
```

---

## 7. Testing & Quality Assurance

### 7.1 Testing Pyramid

```
        /\
       /E2E\         10% - End-to-End Tests
      /------\
     /Integration\   20% - Integration Tests
    /------------\
   /  Unit Tests  \  70% - Unit Tests
  /----------------\
```

### 7.2 Test Coverage Requirements

| Component | Minimum Coverage | Target Coverage |
|-----------|------------------|-----------------|
| Core Business Logic | 90% | 95%+ |
| API Endpoints | 80% | 90%+ |
| Services | 85% | 90%+ |
| Utilities | 80% | 85%+ |
| UI Components | 70% | 80%+ |
| **Overall** | **80%** | **85%+** |

### 7.3 Test Naming Convention

```python
# Format: test_<method>_<scenario>_<expected_outcome>

def test_create_user_with_valid_data_returns_user_object():
    pass

def test_create_user_with_duplicate_email_raises_exception():
    pass

def test_calculate_discount_with_zero_rate_returns_original_price():
    pass
```

### 7.4 Test Structure (AAA Pattern)

```python
def test_calculate_total_with_discount():
    # Arrange
    cart = ShoppingCart()
    cart.add_item(Product("Book", 10.00), quantity=2)
    discount = Discount(rate=0.10)  # 10% off
    
    # Act
    total = cart.calculate_total(discount)
    
    # Assert
    assert total == 18.00  # $20 - 10% = $18
```

### 7.5 Test Categories

**Unit Tests:**
```python
# Test one function/method in isolation
def test_validate_email_with_valid_format_returns_true():
    validator = EmailValidator()
    assert validator.validate("user@example.com") == True

def test_validate_email_with_invalid_format_returns_false():
    validator = EmailValidator()
    assert validator.validate("invalid-email") == False
```

**Integration Tests:**
```python
# Test multiple components working together
def test_user_registration_flow_creates_user_and_sends_email():
    # Arrange
    user_service = UserService(db=test_db, email=test_email_service)
    user_data = {"name": "John", "email": "john@example.com"}
    
    # Act
    user = user_service.register(user_data)
    
    # Assert
    assert user.id is not None
    assert test_db.find_user(user.id) is not None
    assert len(test_email_service.sent_emails) == 1
```

**End-to-End Tests:**
```python
# Test complete user workflow
def test_complete_purchase_flow():
    # User logs in
    browser.visit("/login")
    browser.fill("email", "user@example.com")
    browser.fill("password", "password123")
    browser.click("Login")
    
    # User adds product to cart
    browser.visit("/products/123")
    browser.click("Add to Cart")
    
    # User checks out
    browser.visit("/cart")
    browser.click("Checkout")
    browser.fill("credit_card", "4111111111111111")
    browser.click("Complete Purchase")
    
    # Assert success
    assert "Order Confirmed" in browser.text
```

### 7.6 CI/CD Pipeline Requirements

**`.github/workflows/ci.yml`**

```yaml
name: CI Pipeline

on:
  pull_request:
    branches: [dev, main]
  push:
    branches: [dev, main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Linter
        run: |
          npm run lint  # or pylint, flake8, etc.
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Dependencies
        run: npm install
      - name: Run Unit Tests
        run: npm test
      - name: Run Integration Tests
        run: npm run test:integration
      - name: Generate Coverage Report
        run: npm run coverage
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
  
  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - name: Build Application
        run: npm run build
      - name: Upload Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/
  
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Security Scan
        run: npm audit
      - name: Run SAST
        uses: github/codeql-action/analyze@v2
```

---

## 8. Documentation Standards

### 8.1 README Structure

```markdown
# Project Name

[![CI Status](badge-url)]
[![Coverage](badge-url)]
[![License](badge-url)]

> One-sentence description of what this project does

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview
[2-3 paragraph description of the project, its purpose, and its value proposition]

## Features
- ✅ Feature 1: Description
- ✅ Feature 2: Description
- 🚧 Feature 3: In Progress
- 📋 Feature 4: Planned

## Installation

### Prerequisites
- Node.js >= 14.x
- PostgreSQL >= 12.x
- Redis >= 6.x

### Steps
```bash
# Clone the repository
git clone https://github.com/user/repo.git
cd repo

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## Usage

### Quick Start
```javascript
const client = new APIClient({ apiKey: 'your-key' });
const result = await client.fetchData();
```

### Examples
[Link to examples directory]

## API Documentation
[Link to full API docs]

### Authentication
[How to authenticate]

### Endpoints
- `GET /api/users` - List users
- `POST /api/users` - Create user
[etc.]

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)

## License
[License information]

## Support
- Documentation: [link]
- Issues: [link]
- Email: support@example.com
```

### 8.2 API Documentation Standard (OpenAPI/Swagger)

```yaml
openapi: 3.0.0
info:
  title: Project API
  version: 1.0.0
  description: API for managing users and resources
  contact:
    name: API Support
    email: support@example.com

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

paths:
  /users:
    get:
      summary: List all users
      description: Returns a paginated list of users
      tags:
        - Users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  meta:
                    type: object
                    properties:
                      total: integer
                      page: integer
                      limit: integer
        '401':
          description: Unauthorized
        '500':
          description: Internal server error

components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
        - name
      properties:
        id:
          type: integer
          example: 123
        email:
          type: string
          format: email
          example: user@example.com
        name:
          type: string
          example: John Doe
        created_at:
          type: string
          format: date-time
```

### 8.3 Code Documentation Standards

**Python (Docstrings):**

```python
def calculate_compound_interest(
    principal: float,
    rate: float,
    time: int,
    frequency: int = 1
) -> float:
    """
    Calculate compound interest.
    
    This function computes the future value of an investment based on
    compound interest calculations using the formula:
    A = P(1 + r/n)^(nt)
    
    Args:
        principal: The initial investment amount in currency units.
        rate: The annual interest rate as a decimal (e.g., 0.05 for 5%).
        time: The investment period in years.
        frequency: The number of times interest is compounded per year.
                   Defaults to 1 (annual compounding).
    
    Returns:
        The future value of the investment including interest.
    
    Raises:
        ValueError: If principal, rate, or time is negative, or if
                    frequency is less than 1.
    
    Examples:
        >>> calculate_compound_interest(1000, 0.05, 10)
        1628.89
        
        >>> calculate_compound_interest(5000, 0.03, 5, frequency=4)
        5805.92
    
    Note:
        This function assumes constant interest rates and does not
        account for taxes or fees.
    
    See Also:
        calculate_simple_interest: For simple interest calculations.
    """
    if principal < 0 or rate < 0 or time < 0:
        raise ValueError("Principal, rate, and time must be non-negative")
    if frequency < 1:
        raise ValueError("Frequency must be at least 1")
    
    amount = principal * (1 + rate / frequency) ** (frequency * time)
    return round(amount, 2)
```

**JavaScript (JSDoc):**

```javascript
/**
 * Calculate compound interest.
 * 
 * This function computes the future value of an investment based on
 * compound interest calculations using the formula: A = P(1 + r/n)^(nt)
 * 
 * @param {number} principal - The initial investment amount
 * @param {number} rate - The annual interest rate as a decimal (e.g., 0.05 for 5%)
 * @param {number} time - The investment period in years
 * @param {number} [frequency=1] - Number of times interest is compounded per year
 * @returns {number} The future value of the investment including interest
 * @throws {Error} If principal, rate, or time is negative, or if frequency < 1
 * 
 * @example
 * // Returns 1628.89
 * calculateCompoundInterest(1000, 0.05, 10);
 * 
 * @example
 * // Returns 5805.92
 * calculateCompoundInterest(5000, 0.03, 5, 4);
 */
function calculateCompoundInterest(principal, rate, time, frequency = 1) {
  if (principal < 0 || rate < 0 || time < 0) {
    throw new Error("Principal, rate, and time must be non-negative");
  }
  if (frequency < 1) {
    throw new Error("Frequency must be at least 1");
  }
  
  const amount = principal * Math.pow(1 + rate / frequency, frequency * time);
  return Math.round(amount * 100) / 100;
}
```

### 8.4 CHANGELOG Format

```markdown
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- New feature X for better performance

### Changed
- Updated dependency Y to version 2.0

### Deprecated
- Feature Z will be removed in version 3.0

## [1.2.0] - 2026-01-28
### Added
- User authentication system (#123)
- API rate limiting (#124)
- Comprehensive test suite achieving 87% coverage (#125)

### Changed
- Improved database query performance by 40% (#126)
- Updated UI to Material Design 3 (#127)

### Fixed
- Resolved memory leak in background worker (#128)
- Fixed race condition in order processing (#129)

### Security
- Patched SQL injection vulnerability in search endpoint (CVE-2026-XXXXX)

## [1.1.0] - 2026-01-15
### Added
- Export to CSV functionality (#110)
- Dark mode support (#111)

### Fixed
- Login button not working on mobile (#112)

## [1.0.0] - 2026-01-01
### Added
- Initial release
- User management
- Product catalog
- Order processing
```

---

## 9. Delivery & Deployment

### 9.1 Definition of Done (DoD)

```markdown
## Feature is considered DONE when:

### Code
- [ ] Code is written following all standards in this document
- [ ] Code review completed by 2+ team members
- [ ] No merge conflicts
- [ ] All linters pass
- [ ] No hardcoded values or secrets

### Testing
- [ ] Unit tests written with >80% coverage
- [ ] Integration tests written (if applicable)
- [ ] All tests pass in CI/CD
- [ ] Manual testing completed
- [ ] Performance tested (if applicable)

### Documentation
- [ ] Code comments added where necessary
- [ ] API documentation updated
- [ ] README updated (if applicable)
- [ ] CHANGELOG updated
- [ ] Migration guide written (for breaking changes)

### Quality
- [ ] Security scan passed
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified

### Deployment
- [ ] Staging deployment successful
- [ ] Production deployment plan reviewed
- [ ] Rollback plan documented
- [ ] Monitoring/alerts configured

### Stakeholder
- [ ] Product Owner approved
- [ ] Design review passed (if UI changes)
- [ ] Demo given to stakeholders
```

### 9.2 Release Checklist

```markdown
## Pre-Release
- [ ] All DoD items complete
- [ ] Version number updated (semantic versioning)
- [ ] CHANGELOG updated
- [ ] Release notes drafted
- [ ] Dependencies updated to stable versions
- [ ] Security vulnerabilities addressed
- [ ] Database migrations tested
- [ ] Backward compatibility verified
- [ ] Performance benchmarks meet targets

## Release
- [ ] Tag created: `git tag -a v1.2.0 -m "Release v1.2.0"`
- [ ] Tag pushed: `git push origin v1.2.0`
- [ ] GitHub release created with notes
- [ ] Artifacts published (npm, PyPI, Docker Hub, etc.)
- [ ] Documentation site updated
- [ ] CDN caches purged (if applicable)

## Post-Release
- [ ] Production deployment verified
- [ ] Smoke tests passed
- [ ] Monitoring shows normal metrics
- [ ] No critical errors in logs
- [ ] Stakeholders notified
- [ ] Social media/blog post published
- [ ] Support team briefed on changes
```

### 9.3 Deployment Strategies

**Blue-Green Deployment:**
```yaml
strategy: blue-green
description: "Two identical environments, switch traffic instantly"
steps:
  1: Deploy to green environment (idle)
  2: Run smoke tests on green
  3: Switch traffic from blue to green
  4: Monitor green for issues
  5: Keep blue as quick rollback option
pros:
  - Zero downtime
  - Instant rollback
cons:
  - Double infrastructure cost
```

**Canary Deployment:**
```yaml
strategy: canary
description: "Gradual rollout to subset of users"
steps:
  1: Deploy to 5% of servers
  2: Monitor for 1 hour
  3: If stable, deploy to 25%
  4: Monitor for 2 hours
  5: If stable, deploy to 100%
rollback_trigger:
  - Error rate > 1%
  - Latency > 500ms
  - CPU usage > 80%
```

---

## 10. Agent Training Data

### 10.1 Agent Configuration JSON

**File: `config/agent-training.json`**

```json
{
  "version": "2.0",
  "last_updated": "2026-01-28",
  "protocol_version": "ADMP-2.0",
  
  "global_rules": {
    "before_coding": [
      "Read entire ADMP protocol",
      "Confirm project requirements complete",
      "Create project structure",
      "Initialize Git repository",
      "Set up testing framework",
      "Create documentation templates"
    ],
    "during_coding": [
      "Follow SOLID principles",
      "Write tests alongside code",
      "Commit frequently with conventional commits",
      "Document complex logic",
      "Run linter before committing"
    ],
    "after_coding": [
      "Verify all tests pass",
      "Update documentation",
      "Create Pull Request",
      "Request code review",
      "Update CHANGELOG"
    ]
  },
  
  "agents": {
    "project_manager": {
      "initialization_prompt": "You are a Project Manager AI. Before starting any project, you must: 1) Create a project charter, 2) Define success criteria, 3) Identify stakeholders, 4) Create initial timeline, 5) Set up project board with issues.",
      "required_outputs": [
        "docs/PROJECT_CHARTER.md",
        "docs/ROADMAP.md",
        "GitHub Project board",
        "Initial GitHub Issues"
      ],
      "success_criteria": {
        "charter_complete": true,
        "stakeholders_identified": true,
        "timeline_defined": true,
        "board_created": true
      }
    },
    
    "architect": {
      "initialization_prompt": "You are a Software Architect AI. Before any code is written, you must: 1) Create UML diagrams (use case, class, sequence, component, deployment), 2) Write Architecture Decision Records (ADRs), 3) Design database schema, 4) Define API contracts, 5) Document technology choices.",
      "required_outputs": [
        "docs/diagrams/*.puml",
        "docs/adr/*.md",
        "docs/ARCHITECTURE.md",
        "docs/api/openapi.yml"
      ],
      "validation_rules": {
        "diagrams_present": ["use-case", "class", "sequence", "component", "deployment"],
        "adr_count": "minimum 3",
        "api_spec_valid": true
      }
    },
    
    "code_generator": {
      "initialization_prompt": "You are a Code Generator AI. You MUST follow SOLID principles, write clean code, and include error handling. Before writing code: 1) Understand requirements, 2) Review architecture, 3) Check existing codebase patterns, 4) Plan implementation, 5) Write tests first (TDD).",
      "code_standards": {
        "principles": ["SOLID", "DRY", "KISS", "YAGNI"],
        "max_function_length": 50,
        "max_file_length": 300,
        "naming_convention": {
          "python": "snake_case",
          "javascript": "camelCase",
          "constants": "UPPER_SNAKE_CASE"
        }
      },
      "required_checks": [
        "All functions have type hints/types",
        "Error handling present",
        "Input validation implemented",
        "No hardcoded values",
        "Proper logging added"
      ]
    },
    
    "test_engineer": {
      "initialization_prompt": "You are a Test Engineer AI. Your job is to ensure >80% code coverage and comprehensive testing. For every feature: 1) Write unit tests, 2) Write integration tests, 3) Write E2E tests (if applicable), 4) Create test data/fixtures, 5) Document test scenarios.",
      "coverage_targets": {
        "overall": 80,
        "core_logic": 90,
        "api_endpoints": 85,
        "utilities": 80
      },
      "test_structure": "AAA (Arrange-Act-Assert)",
      "naming_convention": "test_<method>_<scenario>_<outcome>",
      "required_test_types": ["unit", "integration"]
    },
    
    "documentation_writer": {
      "initialization_prompt": "You are a Documentation Writer AI. You create clear, comprehensive documentation. For every feature: 1) Update README, 2) Write/update API docs, 3) Create examples, 4) Update CHANGELOG, 5) Write inline code comments where needed.",
      "required_sections": {
        "README": ["Overview", "Installation", "Usage", "API", "Contributing"],
        "API_DOCS": ["Authentication", "Endpoints", "Examples", "Error Codes"],
        "CODE_COMMENTS": "Complex logic only, explain why not what"
      },
      "style_guide": {
        "tone": "professional but approachable",
        "code_examples": "always include",
        "diagrams": "when helpful for understanding"
      }
    },
    
    "devops_engineer": {
      "initialization_prompt": "You are a DevOps Engineer AI. You set up CI/CD and infrastructure. Your tasks: 1) Configure GitHub Actions, 2) Set up environments, 3) Configure deployment pipelines, 4) Set up monitoring, 5) Document deployment process.",
      "required_pipelines": ["CI (lint, test, build)", "CD (deploy)"],
      "environments": ["development", "staging", "production"],
      "required_checks": {
        "ci": ["linter", "tests", "coverage", "security_scan", "build"],
        "cd": ["deploy", "smoke_tests", "rollback_plan"]
      }
    },
    
    "security_auditor": {
      "initialization_prompt": "You are a Security Auditor AI. You review code for security vulnerabilities. For every PR: 1) Check for SQL injection risks, 2) Check for XSS vulnerabilities, 3) Verify authentication/authorization, 4) Check for exposed secrets, 5) Review dependencies.",
      "owasp_top_10": [
        "Injection",
        "Broken Authentication",
        "Sensitive Data Exposure",
        "XML External Entities (XXE)",
        "Broken Access Control",
        "Security Misconfiguration",
        "Cross-Site Scripting (XSS)",
        "Insecure Deserialization",
        "Using Components with Known Vulnerabilities",
        "Insufficient Logging & Monitoring"
      ],
      "automated_tools": ["npm audit", "snyk", "dependabot", "codeql"]
    }
  },
  
  "workflows": {
    "new_feature": {
      "sequence": [
        {"agent": "project_manager", "task": "create_issue"},
        {"agent": "architect", "task": "design_solution"},
        {"agent": "code_generator", "task": "implement"},
        {"agent": "test_engineer", "task": "test"},
        {"agent": "documentation_writer", "task": "document"},
        {"agent": "devops_engineer", "task": "deploy"},
        {"agent": "security_auditor", "task": "audit"}
      ],
      "parallel_allowed": ["code_generator", "test_engineer"]
    },
    
    "bug_fix": {
      "sequence": [
        {"agent": "project_manager", "task": "triage_bug"},
        {"agent": "code_generator", "task": "fix"},
        {"agent": "test_engineer", "task": "regression_test"},
        {"agent": "documentation_writer", "task": "update_changelog"},
        {"agent": "devops_engineer", "task": "hotfix_deploy"}
      ]
    },
    
    "documentation_update": {
      "sequence": [
        {"agent": "documentation_writer", "task": "update_docs"},
        {"agent": "project_manager", "task": "review"}
      ]
    }
  },
  
  "quality_gates": {
    "code_review": {
      "required_approvals": 2,
      "required_checks": ["lint", "test", "coverage", "security"]
    },
    "merge_to_main": {
      "required_approvals": 2,
      "required_checks": ["all_ci_passed", "documentation_updated", "changelog_updated"],
      "branch_protection": true
    }
  },
  
  "metrics": {
    "kpis": [
      {"name": "Code Coverage", "target": 80, "unit": "percentage"},
      {"name": "Bug Density", "target": 5, "unit": "bugs_per_kloc"},
      {"name": "Mean Time to Recover", "target": 30, "unit": "minutes"},
      {"name": "Deployment Frequency", "target": "daily", "unit": "deployments"},
      {"name": "Lead Time for Changes", "target": 24, "unit": "hours"}
    ]
  }
}
```

### 10.2 Pre-Flight Checklist JSON

**File: `config/preflight-checklist.json`**

```json
{
  "version": "1.0",
  "description": "Checklist that must be completed before any coding begins",
  
  "phase_1_requirements": {
    "name": "Requirements Gathering",
    "items": [
      {
        "id": "REQ-001",
        "task": "Project charter created",
        "file": "docs/PROJECT_CHARTER.md",
        "mandatory": true
      },
      {
        "id": "REQ-002",
        "task": "Stakeholders identified",
        "validation": "at_least_3",
        "mandatory": true
      },
      {
        "id": "REQ-003",
        "task": "Success criteria defined",
        "validation": "measurable",
        "mandatory": true
      },
      {
        "id": "REQ-004",
        "task": "Timeline established",
        "validation": "has_milestones",
        "mandatory": true
      }
    ]
  },
  
  "phase_2_architecture": {
    "name": "Architecture & Design",
    "items": [
      {
        "id": "ARCH-001",
        "task": "Use Case Diagram created",
        "file": "docs/diagrams/use-cases.puml",
        "mandatory": true
      },
      {
        "id": "ARCH-002",
        "task": "Class Diagram created",
        "file": "docs/diagrams/class-diagram.puml",
        "mandatory": true
      },
      {
        "id": "ARCH-003",
        "task": "Sequence Diagrams created",
        "file": "docs/diagrams/sequences/",
        "validation": "at_least_3",
        "mandatory": true
      },
      {
        "id": "ARCH-004",
        "task": "Component Diagram created",
        "file": "docs/diagrams/components.puml",
        "mandatory": true
      },
      {
        "id": "ARCH-005",
        "task": "Deployment Diagram created",
        "file": "docs/diagrams/deployment.puml",
        "mandatory": true
      },
      {
        "id": "ARCH-006",
        "task": "Database schema designed",
        "file": "docs/database-schema.md",
        "validation": "normalized_3NF",
        "mandatory": true
      },
      {
        "id": "ARCH-007",
        "task": "API specification created",
        "file": "docs/api/openapi.yml",
        "validation": "valid_openapi_3",
        "mandatory": true
      },
      {
        "id": "ARCH-008",
        "task": "ADRs documented",
        "directory": "docs/adr/",
        "validation": "at_least_3",
        "mandatory": true
      }
    ]
  },
  
  "phase_3_setup": {
    "name": "Project Setup",
    "items": [
      {
        "id": "SETUP-001",
        "task": "Directory structure created",
        "validation": "follows_standard",
        "mandatory": true
      },
      {
        "id": "SETUP-002",
        "task": "Git repository initialized",
        "validation": "has_branches_main_dev",
        "mandatory": true
      },
      {
        "id": "SETUP-003",
        "task": "README.md created",
        "file": "README.md",
        "validation": "has_required_sections",
        "mandatory": true
      },
      {
        "id": "SETUP-004",
        "task": "CONTRIBUTING.md created",
        "file": "CONTRIBUTING.md",
        "mandatory": true
      },
      {
        "id": "SETUP-005",
        "task": ".gitignore configured",
        "file": ".gitignore",
        "mandatory": true
      },
      {
        "id": "SETUP-006",
        "task": "Linter configured",
        "files": [".eslintrc", ".pylintrc", "pyproject.toml"],
        "validation": "one_present",
        "mandatory": true
      },
      {
        "id": "SETUP-007",
        "task": "Testing framework set up",
        "validation": "tests_run",
        "mandatory": true
      },
      {
        "id": "SETUP-008",
        "task": "CI/CD pipeline configured",
        "file": ".github/workflows/ci.yml",
        "mandatory": true
      },
      {
        "id": "SETUP-009",
        "task": "GitHub Project board created",
        "validation": "has_columns",
        "mandatory": true
      },
      {
        "id": "SETUP-010",
        "task": "Initial issues created",
        "validation": "at_least_5",
        "mandatory": true
      }
    ]
  },
  
  "validation_script": {
    "description": "Python script to validate checklist completion",
    "file": "scripts/validate_preflight.py",
    "example": "python scripts/validate_preflight.py --config config/preflight-checklist.json"
  }
}
```

### 10.3 Example Validation Script

**File: `scripts/validate_preflight.py`**

```python
#!/usr/bin/env python3
"""
Preflight Validation Script
Validates that all required setup is complete before coding begins.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple


class PreflightValidator:
    def __init__(self, config_path: str):
        with open(config_path) as f:
            self.config = json.load(f)
        self.results: List[Tuple[str, bool, str]] = []
    
    def validate_phase(self, phase: Dict) -> bool:
        """Validate all items in a phase."""
        phase_passed = True
        print(f"\n{'='*60}")
        print(f"Validating: {phase['name']}")
        print(f"{'='*60}")
        
        for item in phase['items']:
            passed, message = self.validate_item(item)
            self.results.append((item['task'], passed, message))
            
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status} [{item['id']}] {item['task']}")
            if not passed:
                print(f"      {message}")
                phase_passed = False
        
        return phase_passed
    
    def validate_item(self, item: Dict) -> Tuple[bool, str]:
        """Validate a single checklist item."""
        # Check if file exists
        if 'file' in item:
            if not Path(item['file']).exists():
                return False, f"File not found: {item['file']}"
        
        # Check if directory exists and has content
        if 'directory' in item:
            path = Path(item['directory'])
            if not path.exists():
                return False, f"Directory not found: {item['directory']}"
            
            if 'validation' in item and item['validation'] == 'at_least_3':
                if len(list(path.glob('*.md'))) < 3:
                    return False, f"Expected at least 3 files in {item['directory']}"
        
        # Additional validation rules can be added here
        
        return True, "OK"
    
    def run(self) -> bool:
        """Run all validations."""
        print("\n" + "="*60)
        print("PREFLIGHT VALIDATION")
        print("="*60)
        
        all_passed = True
        
        for phase_key in ['phase_1_requirements', 'phase_2_architecture', 'phase_3_setup']:
            if phase_key in self.config:
                phase_passed = self.validate_phase(self.config[phase_key])
                all_passed = all_passed and phase_passed
        
        # Print summary
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)
        
        total = len(self.results)
        passed = sum(1 for _, p, _ in self.results if p)
        failed = total - passed
        
        print(f"Total checks: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if all_passed:
            print("\n🎉 ALL CHECKS PASSED - Ready to start coding!")
            return True
        else:
            print("\n⚠️  SOME CHECKS FAILED - Complete setup before coding!")
            return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_preflight.py <config-file>")
        sys.exit(1)
    
    validator = PreflightValidator(sys.argv[1])
    success = validator.run()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
```

---

## 11. Emergency Protocols

### 11.1 Production Incident Response

```yaml
severity_levels:
  P0_critical:
    description: "System down, data loss, security breach"
    response_time: "15 minutes"
    notification: "All hands on deck"
    
  P1_high:
    description: "Major feature broken, significant user impact"
    response_time: "1 hour"
    notification: "On-call engineer + manager"
    
  P2_medium:
    description: "Minor feature broken, limited user impact"
    response_time: "4 hours"
    notification: "On-call engineer"
    
  P3_low:
    description: "Cosmetic issue, no user impact"
    response_time: "Next sprint"
    notification: "Create ticket"

incident_response_steps:
  1_detect: "Monitoring alerts or user report"
  2_triage: "Assess severity and impact"
  3_mitigate: "Stop the bleeding (rollback, disable feature, etc.)"
  4_communicate: "Update status page and stakeholders"
  5_fix: "Implement permanent fix"
  6_verify: "Confirm fix resolves issue"
  7_postmortem: "Write blameless postmortem within 48 hours"
```

### 11.2 Rollback Procedure

```bash
#!/bin/bash
# Emergency Rollback Script

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "================================"

# 1. Get last stable version
LAST_STABLE=$(git describe --tags --abbrev=0 HEAD~1)
echo "Rolling back to: $LAST_STABLE"

# 2. Confirm with operator
read -p "Proceed with rollback to $LAST_STABLE? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Rollback cancelled"
    exit 1
fi

# 3. Execute rollback
git checkout $LAST_STABLE
docker-compose down
docker-compose up -d

# 4. Run smoke tests
npm run test:smoke

# 5. Verify health
curl -f http://localhost:8080/health || {
    echo "❌ Health check failed"
    exit 1
}

echo "✅ Rollback complete"
echo "📝 Create incident report: docs/incidents/$(date +%Y%m%d)-rollback.md"
```

---

## 12. Continuous Improvement

### 12.1 Sprint Retrospective Template

```markdown
# Sprint Retrospective - Sprint X

**Date**: YYYY-MM-DD
**Attendees**: [Names]
**Facilitator**: [Name]

## What Went Well ✅
- Item 1
- Item 2
- Item 3

## What Could Be Improved 🔄
- Item 1
- Item 2
- Item 3

## Action Items 🎯
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Action 1 | Name | Date | ⏳ Pending |
| Action 2 | Name | Date | ✅ Done |

## Metrics
- Velocity: X story points
- Bugs reported: X
- Bugs fixed: X
- Code coverage: X%
- Deployment frequency: X per week

## Next Sprint Focus
- Focus area 1
- Focus area 2
```

### 12.2 Protocol Update Process

```markdown
## How to Update This Protocol

1. **Identify Need**: Document why update is needed
2. **Draft Changes**: Create PR with proposed changes
3. **Team Review**: All team members review and comment
4. **Approval**: Requires 2/3 majority approval
5. **Version Update**: Increment version number
6. **Training**: Brief team on changes
7. **Rollout**: Update takes effect next sprint

## Version History
- v2.0 (2026-01-28): Added agent training data
- v1.5 (2025-12-15): Enhanced testing standards
- v1.0 (2025-11-01): Initial release
```

---

## 13. Quick Reference

### 13.1 Command Cheatsheet

```bash
# Project Setup
git clone <repo>
cd <repo>
python scripts/validate_preflight.py config/preflight-checklist.json

# Development
git checkout dev
git pull origin dev
git checkout -b feature/ABC-123-description
# [write code]
git add .
git commit -m "feat(module): description"
git push origin feature/ABC-123-description
gh pr create --base dev

# Testing
npm test
npm run test:coverage
npm run test:e2e

# Code Quality
npm run lint
npm run format
npm run type-check

# Deployment
npm run build
npm run deploy:staging
npm run deploy:production
```

### 13.2 File Templates Location

```
templates/
├── PROJECT_CHARTER.md
├── ADR_TEMPLATE.md
├── API_SPEC_TEMPLATE.yml
├── TEST_PLAN_TEMPLATE.md
├── INCIDENT_REPORT_TEMPLATE.md
└── SPRINT_RETROSPECTIVE_TEMPLATE.md
```

---

## 14. Conclusion

This protocol is not optional. It is the foundation of professional software development.

**Every AI agent must:**
1. Read this entire document before starting any project
2. Follow all rules without exception
3. Request clarification when needed
4. Suggest improvements to this protocol
5. Help enforce these standards

**Remember**: Consistency, quality, and professionalism are not negotiable. They are the price of entry for world-class software engineering.

---

**Protocol Maintainer**: [Name]  
**Last Review**: 2026-01-28  
**Next Review**: 2026-04-28  
**Questions?**: protocol@example.com

---

*"Excellence is not an act, but a habit." - Aristotle*
