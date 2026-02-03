---
trigger: always_on
---

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