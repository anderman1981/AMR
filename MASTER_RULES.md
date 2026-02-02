# 📜 AMR PROJECT MASTER RULES (v1.0.0)

## 🎯 Source of Truth
This document is the absolute "Source of Truth" for all AI Agents and developers. Any agent must read and validate this file before performing operations.

---

## 🏛️ Project Structure & Routing

### 1. Environments
| Environment | Role | Dashboard | API | Local Path |
| :--- | :--- | :--- | :--- | :--- |
| **MAIN** | Production | `http://localhost:3466` | `http://localhost:3467` | `/Users/andersonmartinezrestrepo/AMR/` |
| **DEV** | Development | `http://localhost:3465` | `http://localhost:3464` | `/Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/` |
| **ADMIN** | Local Management | `http://localhost:3463` | - | Local Only |

### 2. CI/CD Local Protocol
- **Auto-Deploy**: Use `npm run watch:deploy` to activate the automatic merge-to-main deployment.
- **Manual Launch**: Use `./launch-main.sh` or `./launch-dev.sh`.

---

## 🛠️ AI Working Standards (The 5 Cs)
1. **Consistency**: Same rules, same results.
2. **Completeness**: Nothing is done until tested and documented.
3. **Clarity**: Code must be readable and self-explanatory.
4. **Compliance**: Project standards are non-negotiable.
5. **Continuous Improvement**: Every task must leave the codebase better.

### Git & Task Workflow ("No ticket, no code")
- **Issues**: Always exist before code.
- **Branches**: `feature/ID-desc`, `fix/ID-desc`, `docs/ID-desc`.
- **Commits**: Follow Conventional Commits.

---

## 📂 Archiving & Documentation (AI History)

All AI-generated artifacts must be archived in `logs/AI_HISTORY/`:
- `logs/AI_HISTORY/TASK/`: Checklist history.
- `logs/AI_HISTORY/PLAN/`: Approved implementation plans.
- `logs/AI_HISTORY/DOCS/`: Versioned walkthroughs.
- `logs/AI_HISTORY/FEAT/`: Feature descriptions.
- `logs/AI_HISTORY/FIX/`: Bug fix logs.
- `logs/AI_HISTORY/GIT/`: Git operation and consolidation logs.

**Naming Convention**: `[TYPE]-[VERSION]-[BRANCH].md` (e.g., `walkthrough-v1.2.0-main.md`)

---

## 📜 Referenced Protocols
- [GIT_WORKFLOW_RULES.md](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/rules/GIT_WORKFLOW_RULES.md)
- [AI_DEVELOPMENT_MASTER_PROTOCOL.md](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/rules/AI_DEVELOPMENT_MASTER_PROTOCOL.md)
- [AGENT_ARCHITECTURE_GUIDE.md](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/rules/AGENT_ARCHITECTURE_GUIDE.md)
