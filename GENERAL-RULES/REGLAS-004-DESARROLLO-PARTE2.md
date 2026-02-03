# 🛠️ ESTÁNDARES DE DESARROLLO Y CALIDAD - Parte 2
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-004-DESARROLLO-PARTE2.md

---

## 🏗️ PROJECT STRUCTURE STANDARDS

### Universal Directory Structure
```
project-root/
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   └── tests.yml
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── documentation.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                       # Documentation
│   ├── adr/                    # Architecture Decision Records
│   ├── api/                    # API documentation
│   ├── diagrams/               # UML and other diagrams
│   ├── guides/                 # User guides
│   ├── PROJECT_CHARTER.md
│   ├── ARCHITECTURE.md
│   └── CHANGELOG.md
├── src/                        # Source code
│   ├── core/                   # Core business logic
│   ├── api/                    # API layer
│   ├── services/               # Service layer
│   ├── models/                 # Data models
│   ├── utils/                  # Utilities
│   └── config/                 # Configuration
├── tests/                      # Tests
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   ├── e2e/                    # End-to-end tests
│   ├── fixtures/               # Test data
│   └── mocks/                  # Mock objects
├── scripts/                    # Scripts
│   ├── setup/                  # Setup scripts
│   ├── deploy/                 # Deployment scripts
│   ├── migrate/                # Migration scripts
│   └── seed/                   # Seed data scripts
├── config/                     # Configuration files
│   ├── development.yml
│   ├── staging.yml
│   ├── production.yml
│   └── test.yml
├── .gitignore
├── .editorconfig
├── .eslintrc (or equivalent)
├── .prettierrc (or equivalent)
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
└── package.json (or equivalent)
```

---

## 🧠 HERRAMIENTAS DE CALIDAD AUTOMATIZADAS

### CI/CD Pipeline Integration
```yaml
# .github/workflows/quality-gates.yml
name: Code Quality Gates

on:
  pull_request:
    branches: [dev, main]
  push:
    branches: [dev]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npx eslint . --ext .js,.jsx,.ts,.tsx --format json --output-file eslint-report.json
      
      - name: Run Prettier check
        run: npx prettier --check . --format json --output-file prettier-report.json
      
      - name: Run type checking
        run: npx tsc --noEmit --pretty false --skipLibCheck
      
      - name: Run tests with coverage
        run: npm test --coverage --json --outputFile=test-results.json
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### SonarQube Integration
```yaml
# .github/workflows/sonarqube.yml
name: SonarQube Analysis

on:
  pull_request:
    branches: [dev, main]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

## 🚀 DEPLOYMENT STANDARDS

### Environment Configuration
```yaml
# config/environments/production.yml
app:
  name: "Production Environment"
  debug: false
  port: 4123

database:
  host: "${DB_HOST}"
  port: 5432
  name: "${DB_NAME}"
  ssl: true
  pool:
    min: 10
    max: 50
    acquire_timeout: 30000

cache:
  type: "redis"
  host: "${REDIS_HOST}"
  port: 6379
  ttl: 3600

logging:
  level: "info"
  format: "json"
  destination: "file"
  file: "/var/log/app.log"
  max_size: "100MB"
  max_files: 5

security:
  jwt_secret: "${JWT_SECRET}"
  bcrypt_rounds: 12
  session_timeout: 1800
  rate_limit:
    window_ms: 900000
    max_requests: 100

monitoring:
  health_check:
    interval: 30000
    timeout: 5000
  metrics:
    enabled: true
    interval: 60000
  alerts:
    slack_webhook: "${SLACK_WEBHOOK}"
    email_recipients: ["ops@example.com"]
```

### Docker Configuration (OBLIGATORIO)
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=base --chown=nodejs:nodejs /app/dist ./dist
COPY --from=base --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 4123

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js

CMD ["node", "dist/server.js"]
```

### Docker Compose Development
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "4123:4123"
      - "9229:9229"  # Node.js debugger
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DEBUG=*
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: app_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:
```

---

## 📋 CODE REVIEW AUTOMATION

### GitHub Actions for Review Automation
```yaml
# .github/workflows/review-automation.yml
name: Automated Code Review

on:
  pull_request:
    branches: [dev, main]

jobs:
  automated-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Complexity Analysis
        run: |
          npx complexity-report --format=json --output=complexity.json src/
          npx plato -r -d -x **/*.test.js src/
      
      - name: Security Scan
        run: |
          npm audit --audit-level=high --json > audit-report.json || true
          npx snyk test --json > snyk-report.json || true
      
      - name: Performance Analysis
        run: |
          npx bundlephobia dist/
          npx webpack-bundle-analyzer dist/ --mode=json --report=bundle-report.json
      
      - name: Create Review Report
        run: node scripts/generate-review-report.js
      
      - name: Comment PR with Findings
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('review-report.json', 'utf8'));
            
            let comment = '## 🔍 Automated Code Review Report\n\n';
            
            if (report.complexity.warnings.length > 0) {
              comment += '### ⚠️ Complexity Warnings\n';
              report.complexity.warnings.forEach(w => {
                comment += `- ${w.file}:${w.line} - ${w.message}\n`;
              });
              comment += '\n';
            }
            
            if (report.security.issues.length > 0) {
              comment += '### 🛡️ Security Issues\n';
              report.security.issues.forEach(issue => {
                comment += `- ${issue.severity}: ${issue.title}\n`;
              });
              comment += '\n';
            }
            
            if (report.performance.suggestions.length > 0) {
              comment += '### ⚡ Performance Suggestions\n';
              report.performance.suggestions.forEach(s => {
                comment += `- ${s.message}\n`;
              });
              comment += '\n';
            }
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Review Report Generator
```javascript
// scripts/generate-review-report.js
const fs = require('fs');
const path = require('path');

function generateReviewReport() {
  const complexityReport = JSON.parse(fs.readFileSync('complexity.json', 'utf8'));
  const auditReport = JSON.parse(fs.readFileSync('audit-report.json', 'utf8'));
  
  const report = {
    timestamp: new Date().toISOString(),
    complexity: {
      warnings: complexityReport.files
        .filter(f => f.complexity > 10)
        .map(f => ({
          file: f.path,
          line: 1,
          complexity: f.complexity,
          message: `Complexity score: ${f.complexity} (max recommended: 10)`
        }))
    },
    security: {
      issues: auditReport.vulnerabilities || []
    },
    performance: {
      suggestions: []
    }
  };
  
  fs.writeFileSync('review-report.json', JSON.stringify(report, null, 2));
  console.log('Review report generated');
}

generateReviewReport();
```

---

## 📊 METRICS Y KPIs

### Development Metrics Dashboard
```javascript
// scripts/metrics-collector.js
class MetricsCollector {
  constructor() {
    this.metrics = {
      code_quality: {
        coverage: 0,
        maintainability_index: 0,
        technical_debt_ratio: 0,
        duplicate_code_percentage: 0
      },
      performance: {
        avg_response_time: 0,
        p95_response_time: 0,
        error_rate: 0,
        throughput: 0
      },
      security: {
        vulnerabilities_count: 0,
        critical_vulnerabilities: 0,
        code_scan_score: 0
      },
      process: {
        pr_merge_time: 0,
        build_time: 0,
        deployment_frequency: 0,
        change_failure_rate: 0
      }
    };
  }

  generateDashboardData() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.generateSummary()
    };
  }
}
```

---

## 🔄 CONTINUOUS IMPROVEMENT

### Retrospective Template (OBLIGATORIO)
```markdown
# Sprint Retrospective - [Sprint Number]

**Date:** [Date]  
**Facilitador:** [Name]  
**Attendees:** [List]

## 📊 Metrics Summary
- Velocity: [Story Points]
- Completed Stories: [Count]
- Incompleted Stories: [Count]
- Average Story Size: [Points]
- Cycle Time: [Days]

## 🎯 What Went Well ✅
- [Success 1]
- [Success 2]
- [Success 3]

## 🔄 What Could Be Improved 🔄
- [Improvement 1]
- [Improvement 2]
- [Improvement 3]

## 🎬 Action Items 🎯
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action 1] | [Name] | [Date] | ⏳ |
| [Action 2] | [Name] | [Date] | ⏳ |
| [Action 3] | [Name] [Date] | ⏳ |

## 📈 Process Improvements
- [Process Improvement 1]
- [Process Improvement 2]

## 📚 Lessons Learned
- [Lesson 1]
- [Lesson 2]

## 🎨 Experiments to Try
- [Experiment 1]
- [Experiment 2]
```

---

## 📚 DOCUMENTATION STANDARDS (AVANZADAS)

### API Documentation with OpenAPI 3.0
```yaml
# docs/api/openapi.yml
openapi: 3.0.0
info:
  title: Project API
  version: 1.0.0
  description: |
    ## Overview
    This API provides access to all features of application.
    
    ## Authentication
    All API calls require authentication using Bearer tokens.
    
    ## Rate Limiting
    API is rate-limited to 100 requests per minute.
    
    ## Error Handling
    All errors follow a consistent format.

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### Architecture Decision Records (ADR) Template
```markdown
# ADR-[Number]: [Decision Title]

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded  
**Deciders:** [Names]

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
1. **Alternative A:** [Description]
   - Pros: [Benefits]
   - Cons: [Drawbacks]
   - Rejection: [Why rejected]

2. **Alternative B:** [Description]
   - Pros: [Benefits]
   - Cons: [Drawbacks]
   - Rejection: [Why rejected]

## Implementation Notes
[Any technical details about implementation]

## References
- [Link 1]
- [Link 2]
```

---

**ESTE DOCUMENTO DEFINE LOS ESTÁNDARES DE DESARROLLO**  
Implementar estas prácticas garantiza calidad, mantenibilidad y mejora continua.

**Archivo:** REGLAS-004-DESARROLLO-PARTE2.md  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-02

---

**Documentación completa disponible en Parte 1 y Parte 2**