# 📘 AMR System Guide (v1.0.0)

## 🏗️ Architecture Overview
AMR is a distributed orchestration system designed for managing multiple agents across Windows/macOS environments.

### Components
1. **Core API (Node.js/Express)**: Orchestrates tasks, manages devices, and handles LLM integrations.
2. **Dashboard (React/Vite)**: Unified interface for monitoring and control.
3. **Agents (Node.js)**: Local processes running on each device, reporting status and executing commands.
4. **Admin Dashboard (Local)**: File system explorer for developers.

---

## 🌐 Environments & Routing
| Feature | MAIN | DEV |
| :--- | :--- | :--- |
| **Port** | 3466 | 3465 |
| **API Port** | 3467 | 3464 |
| **Database** | SQLite (Production) | SQLite (Dev) |

---

## 🛠️ Developer Workflow
1. **Setup**: Run `scripts/setup/install-macos.sh`.
2. **Launch DEV**: Run `scripts/launch/launch-dev.sh`.
3. **Audit**: Always check `MASTER_RULES.md` before coding.
4. **Logs**: Archive AI-generated plans and tasks in `logs/AI_HISTORY/`.

---

## 📂 Directory Map
Refer to [PROJECT_MAP.md](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/docs/guides/PROJECT_MAP.md) for a detailed structure.

---
*Last Updated: 2026-02-02*
