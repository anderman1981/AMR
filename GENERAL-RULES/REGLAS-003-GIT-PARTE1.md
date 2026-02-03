# 🔥 GIT WORKFLOW Y COLABORACIÓN - Parte 1
**Versión:** 1.0.0  
**Fecha:** 2 de Febrero de 2026  
**Archivo:** REGLAS-003-GIT-PARTE1.md

---

## 🎯 FILOSOFÍA DEL WORKFLOW

> "No ticket, no code" - Regla de Oro
> 
> Todo cambio al códigobase debe estar respaldado por un issue documentado, revisado y aprobado.

---

## 🌳 ESTRUCTURA DE RAMAS

### Branch Strategy (GitFlow Modificado)
```
main (production) ←←← PROTEGIDA SIN COMMITS DIRECTOS
  ↑
  └── release/v1.x.x (release candidates) ←←← Estabilización
        ↑
        └── dev (integration) ←←← Base para todo desarrollo
              ↑
              ├── feature/ID-descripcion-corta     ←←← Nuevas funcionalidades
              ├── fix/ID-descripcion-corta         ←←← Corrección de errores
              ├── hotfix/ID-descripcion-corta       ←←← Errores críticos (desde main)
              ├── docs/ID-descripcion-corta         ←←← Documentación
              ├── refactor/ID-descripcion-corta     ←←← Mejoras de código
              └── chore/ID-descripcion-corta        ←←← Tareas de mantenimiento
```

### Reglas por Tipo de Rama

#### **`main` - PRODUCCIÓN**
- ❌ **PROHIBIDO**: Commits directos
- ✅ **OBLIGATORIO**: Pull Request desde `dev` o `release`
- ✅ **OBLIGATORIO**: 2+ aprobaciones de code review
- ✅ **OBLIGATORIO**: Todos los tests pasan (CI/CD verde)
- ✅ **OBLIGATORIO**: Sin conflictos de merge
- ✅ **OBLIGATORIO**: Actualizado con rama base
- ✅ **OBLIGATORIO**: Tags semantic versioning (`v1.2.3`)

#### **`dev` - INTEGRACIÓN**
- ❌ **NO RECOMENDADO**: Commits directos
- ✅ **RECOMENDADO**: Pull Request para cambios grandes
- ✅ **OBLIGATORIO**: Tests pasando antes de merges
- ✅ **DEBE**: Estable siempre, failure = bloqueo del equipo

#### **Ramas de Feature/Work**
- ✅ **OBLIGATORIO**: Nombrear con ID de issue
- ✅ **OBLIGATORIO**: Crear desde `dev` (excepto hotfix)
- ✅ **OBLIGATORIO**: Pequeños commits atómicos
- ✅ **OBLIGATORIO**: Limpiar después del merge

---

## 🏷️ NOMENCLATURA OBLIGATORIA

### Branch Naming Convention
```
feature/123-nuevo-sistema-login
fix/124-error-en-menu-usuario
hotfix/125-caida-del-servidor
docs/126-actualizar-guia-api
refactor/127-optimizar-consultas-db
chore/128-actualizar-dependencias
```

### Issue Naming Convention
```
[Bug]: Error al cargar productos en dashboard
[Feature]: Implementar autenticación con JWT
[Enhancement]: Mejorar rendimiento de API
[Documentation]: Actualizar README con nueva instalación
[Security]: Corregir vulnerabilidad XSS
[Testing]: Agregar tests para servicio de usuarios
```

---

## 📝 ESTÁNDAR DE COMMITS (Conventional Commits)

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos Válidos (OBLIGATORIO)
| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(auth): add JWT token validation` |
| `fix` | Corrección de bug | `fix(api): resolve race condition in user creation` |
| `docs` | Cambios en documentación | `docs(readme): update installation instructions` |
| `style` | Cambios de formato (sin lógica) | `style(react): fix indentation in components` |
| `refactor` | Refactorización de código | `refactor(database): extract query builder to class` |
| `perf` | Mejoras de performance | `perf(api): optimize database queries with indexes` |
| `test` | Agregar o actualizar tests | `test(auth): add unit tests for JWT middleware` |
| `chore` | Tareas de mantenimiento | `chore(deps): update node dependencies to latest` |
| `ci` | Cambios en CI/CD | `ci(github): add automated testing workflow` |
| `build` | Cambios en build system | `build(docker): optimize docker image size` |

### Ejemplos Completos

#### Good Commit Example
```
feat(auth): add JWT token validation

Implement JWT token validation middleware that checks:
- Token expiration
- Token signature  
- User permissions

Also adds refresh token rotation for better security.

Closes #123
Related to #124
```

#### Bug Fix Example
```
fix(api): resolve race condition in user creation

Previously, concurrent requests could create duplicate users.
Added transaction lock to ensure atomicity and proper error handling.

Fixes #456
Testing: Added integration tests for concurrent user creation
```

#### Documentation Example
```
docs(api): update authentication endpoints documentation

Clarified JWT flow, added request/response examples, and included
common error codes for better developer experience.

Updates to: /docs/api/authentication.md
```

---

## 🔄 PROTOCOLO DE PULL REQUESTS

### Pull Request Template (OBLIGATORIO)

```markdown
## 📝 Descripción
[Descripción clara y concisa de qué hace este PR. Máximo 3 párrafos]

## 🔗 Issues Relacionados
Closes #123
Related to #456

## 🎯 Tipo de Cambio
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Testing improvement

## ✅ Checklist de Calidad

### Código
- [ ] Mi código sigue los estándares de estilo del proyecto
- [ ] He realizado una auto-revisión de mi propio código
- [ ] He comentado el código, particularmente en áreas complejas
- [ ] He agregado comentarios que explican el 'por qué', no el 'qué'
- [ ] No hay código duplicado (DRY principle)
- [ ] Functions hacen una sola cosa (SRP)
- [ ] Variables tienen nombres descriptivos
- [ ] No hay números mágicos sin explicación

### Testing
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Todos los tests nuevos y existentes pasan localmente
- [ ] La cobertura de tests es > 80% para código nuevo
- [ ] Los tests siguen el patrón AAA (Arrange, Act, Assert)
- [ ] Los tests tienen nombres descriptivos (test_when_then_should)

### Documentation
- [ ] He actualizado la documentación pertinente
- [ ] README está actualizado si es necesario
- [ ] API docs están actualizadas si hay cambios en endpoints
- [ ] CHANGELOG.md está actualizado con cambios importantes

### Performance & Security
- [ ] No hay impactos obvios de performance
- [ ] El código ha sido revisado por vulnerabilidades de seguridad
- [ ] No hay secrets o sensitive data hardcoded
- [ ] Input validation está implementado donde es necesario

## 🧪 Testing

### Test Coverage
- **Antes:** X%
- **Después:** Y%
- **Diferencia:** Z%

### Test Cases
- [x] Unit tests para nuevas funciones
- [x] Integration tests para API endpoints
- [x] E2E tests para flujos completos (si aplica)
- [ ] Manual testing realizado en entorno de desarrollo

### Manual Testing
- [x] Tested on local environment
- [ ] Tested on staging environment (si aplica)
- [ ] Tested with production data (anonimizado)

## 📸 Screenshots (si aplica)
[Adjuntar screenshots para cambios UI, dashboard, etc.]

## 🚀 Deployment Notes
[Instrucciones especiales para deployment]
- [ ] Requiere database migration
- [ ] Requiere cache invalidation
- [ ] Requiere environment variables
- [ ] Requiere service restart

## 📚 Additional Context
[Cualquier información adicional que los revisores necesiten saber]

### Breaking Changes
[Listar breaking changes con ejemplos de migración]

### Dependencies
[Listar nuevas dependencias o cambios en versiones]

### Performance Impact
[Describir impacto en performance con métricas si es posible]

## PR Title Format (OBLIGATORIO)
```
[TIPO] Descripción breve (#ID-Issue)

Examples:
[FEAT] Add JWT authentication system (#123)
[FIX] Resolve race condition in user creation (#456)  
[DOC] Update API documentation with new endpoints (#789)
[REFACTOR] Extract database queries to repository pattern (#234)
```

---

## 🤖 AUTOMATION TRIGGERS

### Comandos de Activación para AI Agent

| Trigger | Acción Automática | Rama Resultante | Workflow Completo |
|---------|-------------------|-------------------|-------------------|
| **`/FEA: [Título]`** | 1. Crea Issue "Feature: [Título]"<br>2. Crea rama desde `dev`<br>3. Genera código<br>4. Sube cambios<br>5. Crea PR | `feature/ID-desc` | Issue → Branch → Code → Push → PR |
| **`/FIX: [Error]`** | 1. Crea Issue "Bug: [Error]"<br>2. Crea rama desde `dev`<br>3. Corrige código<br>4. Sube cambios<br>5. Crea PR | `fix/ID-desc` | Issue → Branch → Fix → Push → PR |
| **`/HOT: [Error]`** | 1. Crea Issue "Hotfix: [Error]"<br>2. Crea rama desde **`main`**<br>3. Corrige código<br>4. Sube urgentes<br>5. Crea PR a `main` | `hotfix/ID-desc` | Issue → Branch → Fix → Push → PR (main) |

### Ejemplos de Uso
```
/FEA: Implementar sistema de notificaciones push
/FIX: Error en cálculo de precios con descuentos
/HOT: Caída del servidor por memoria insuficiente  
/DOC: Actualizar guía de configuración para producción
```

---

## 🔄 BRANCH PROTECTION RULES

### GitHub Branch Protection Configuration

#### `main` Branch Rules
```yaml
required_status_checks:
  strict: true  # Must be up to date
  contexts:
    - "CI/CD Pipeline"
    - "Code Quality Check"
    - "Security Scan"
    - "Test Coverage"

enforce_admins: true  # Even admins must follow rules

required_pull_request_reviews:
  required_approving_review_count: 2
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
  dismissal_restrictions:
    users: []
    teams: ["core-team"]

restrictions:
  users: ["dependabot[bot]"]
  teams: ["core-team"]
```

#### `dev` Branch Rules
```yaml
required_status_checks:
  strict: false  # Can be slightly behind
  contexts:
    - "CI/CD Pipeline"
    - "Test Coverage"

enforce_admins: false

required_pull_request_reviews:
  required_approving_review_count: 1
  dismiss_stale_reviews: true
  require_code_owner_reviews: false
```

---

## 📋 GESTIÓN DE TAREAS (ISSUES & PROJECTS)

### Issue Creation Template (OBLIGATORIO)

#### Bug Report Template
```markdown
## 🐛 Bug Description
[Descripción clara del bug]

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## 🎯 Expected Behavior
[Qué esperabas que pasara]

## 📸 Screenshots
[Agregar screenshots si aplica]

## 🖥️ Environment
- OS: [e.g. macOS 14.2]
- Browser: [e.g. Chrome 120]
- Node.js: [e.g. 20.10.0]
- App Version: [e.g. v1.2.3]

## 📝 Additional Context
[Contexto adicional]
```

#### Feature Request Template
```markdown
## 🚀 Feature Description
[Descripción clara de la funcionalidad deseada]

## 💡 Problem Statement
[Qué problema resuelve esta funcionalidad]

## 🎯 Proposed Solution
[Descripción de la solución propuesta]

## 🔄 Alternatives Considered
[Qué otras opciones fueron consideradas]

## 📈 Success Criteria
[Cómo sabremos que esta feature está completa]

## 🎨 Mockups/UI Design
[Agregar mockups si aplica]

## 📋 Implementation Checklist
- [ ] Backend implementation
- [ ] Frontend implementation
- [ ] Database changes
- [ ] Tests
- [ ] Documentation
```

### Project Board (Kanban) Configuration

#### Columns Structure
```
┌─────────┬─────────────┬─────────────┬───────────┬─────────────┐
│  Todo   │ In Progress │   Review    │   Done    │   Blocked   │
├─────────┼─────────────┼─────────────┼───────────┼─────────────┤
│ Issues  │ Development │ PR Created  │ Merged   │ Waiting for │
│ new     │ in progress│ awaiting    │ and      │ external    │
│         │             │ review       │ deployed │ dependencies │
└─────────┴─────────────┴─────────────┴───────────┴─────────────┘
```

#### Automation Rules
1. **New Issue** → Automatically moves to **Todo**
2. **Branch Created** → Move to **In Progress**
3. **PR Opened** → Move to **Review**
4. **PR Merged** → Move to **Done**
5. **Blocker Label Added** → Move to **Blocked**

---

## 🔄 COMANDOS GIT ESENCIALES

### Workflow Commands

#### 1. Start New Feature
```bash
# Ensure dev is up to date
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/123-nueva-funcionalidad

# Do work...
# Make commits following conventional commit format

# Push to remote
git push origin feature/123-nueva-funcionalidad

# Create PR (using GitHub CLI)
gh pr create --base dev --title "[FEAT] Nueva funcionalidad (#123)" --body-file .github/pr-template.md
```

#### 2. Start Bug Fix
```bash
# From dev branch
git checkout dev
git pull origin dev

# Create fix branch
git checkout -b fix/124-error-menu

# Implement fix...
git add .
git commit -m "fix(ui): resolve menu navigation error

Previously, clicking menu items would cause console errors.
Added proper event handler delegation to fix issue.

Fixes #124"

git push origin fix/124-error-menu

# Create PR
gh pr create --base dev --title "[FIX] Resolve menu navigation error (#124)"
```

#### 3. Hotfix (from main)
```bash
# From main branch (EMERGENCY ONLY)
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/125-critical-security-fix

# Fix critical issue...
git add .
git commit -m "fix(security): patch critical XSS vulnerability

Immediate security patch to prevent script injection.
All user input now properly sanitized.

Fixes #125"

git push origin hotfix/125-critical-security-fix

# Create PR to main
gh pr create --base main --title "[HOT] Patch critical XSS vulnerability (#125)"
```

#### 4. After PR Merge
```bash
# Switch back to dev
git checkout dev
git pull origin dev

# Delete local branch
git branch -d feature/123-nueva-funcionalidad

# Delete remote branch
git push origin --delete feature/123-nueva-funcionalidad
```

---

## 🚨 EMERGENCY PROTOCOLOS

### Critical Production Issues

#### Immediate Response (First 5 minutes)
1. **Create Hotfix Branch**: From `main` immediately
2. **Implement Fix**: Minimal change to fix issue
3. **Deploy**: Direct deployment to production
4. **Communicate**: Alert team and stakeholders

#### Post-Incident (Within 1 hour)
1. **Create Issue**: Document root cause analysis
2. **Write Tests**: Ensure bug doesn't reoccur
3. **Update Documentation**: Lessons learned
4. **Team Retrospective**: Process improvements

### Rollback Procedures
```bash
# Quick rollback to previous stable version
git checkout main
git tag -l "v*" --sort=-version:refname | head -2 | tail -1
# This gets the second-to-latest tag

# Create rollback branch
git checkout -b rollback/v1.2.2-to-v1.2.1

# Emergency push and deploy
git push origin rollback/v1.2.2-to-v1.2.1
```

---

## 📊 CODE REVIEW STANDARDS

### Reviewer Responsibilities
1. **Functionality**: Code works as intended
2. **Standards**: Follows project conventions
3. **Performance**: No obvious performance issues
4. **Security**: No security vulnerabilities
5. **Tests**: Adequate test coverage
6. **Documentation**: Code is self-documenting

### Review Guidelines
- **Be constructive**: Focus on improvement, not criticism
- **Explain why**: Give reasoning for suggested changes
- **Approve when ready**: Don't delay unnecessarily
- **Ask questions**: Clarify unclear code
- **Suggest alternatives**: Offer better approaches

### Approval Process
```markdown
Review Status Options:
✅ Approve - Code is ready to merge
🔄 Request Changes - Issues to fix before merge
💭 Comment - Questions or suggestions, but not blocking
```

---

## 🔗 INTEGRATION CON HERRAMIENTAS

### GitHub Actions Workflow Integration
```yaml
name: PR Validation

on:
  pull_request:
    branches: [dev, main]

jobs:
  validate-branch-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check branch name
        run: |
          if [[ ! "${{ github.head_ref }}" =~ ^(feature|fix|hotfix|docs|refactor|chore)/[0-9] ]]; then
            echo "Invalid branch name format"
            exit 1
          fi

  validate-commit-messages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate commits
        run: |
            for commit in $(git rev-list origin/${{ github.base_ref }}..${{ github.sha }}); do
              message=$(git log --format=%B -n 1 $commit)
              if [[ ! "$message" =~ ^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)\(.+\): .+ ]]; then
                echo "Invalid commit message format: $message"
                exit 1
              fi
            done

  auto-label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Auto-label PR
        uses: actions/labeler@v4
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          configuration-path: .github/labeler.yml
```

### Labeler Configuration
```yaml
# .github/labeler.yml
bug:
  - changed-files:
      - any-glob-to-any-file:
          - src/**/*.js
          - src/**/*.py

documentation:
  - changed-files:
      - any-glob-to-any-file:
          - "**.md"
          - "docs/**"

enhancement:
  - changed-files:
      - any-glob-to-any-file:
          - "src/**/*"
          - "tests/**/*"

security:
  - changed-files:
      - any-glob-to-any-file:
          - "src/middleware/**"
          - "src/auth/**"
```

---

## 📈 METRICS Y KPIs

### Git Workflow Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| PR Merge Time | < 24 hours | GitHub API |
| Time to First Review | < 4 hours | GitHub API |
| Code Coverage | > 80% | Jest coverage |
| Failed Builds | < 5% | GitHub Actions |
| Branch Age | < 7 days | Git commands |

### Quality Metrics
- **Commit Frequency**: 10+ commits/week/team member
- **PR Size**: < 500 lines changed per PR
- **Review Participation**: 100% of PRs reviewed
- **Issue Resolution**: < 3 days average
- **Documentation Updates**: 1 per feature

---

**ESTE DOCUMENTO DEFINE EL WORKFLOW DE COLABORACIÓN**  
Seguir estas reglas no es opcional, es obligatorio.

**Archivo:** REGLAS-003-GIT.md  
**Versión:** 1.0.0  
**Última actualización:** 2026-02-02

---

**Continúa en Parte 2 para más comandos y métricas avanzadas**