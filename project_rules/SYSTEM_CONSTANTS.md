# 🛑 SYSTEM CONSTANTS & RULES

> **WARNING**: These rules are IMMUTABLE. Do not change them without explicit authorization.

## 1. Network Port Configuration

The system relies on a specific port architecture to separate Development from Production environments and ensure service isolation.

| Service | Environment | Port | URL | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard (Prod)** | `main` | **3466** | `http://localhost:3466` | Stable production interface. |
| **Dashboard (Dev)** | `dev` | **3465** | `http://localhost:3465` | Development and testing interface. |
| **API Backend** | `shared` | **3467** | `http://localhost:3467` | Central API for Books and Tasks. |
| **Agent Server** | `shared` | **12000** | `http://localhost:12000` | AI Agents service (Ollama/LLM). |
| **Agent Worker** | `shared` | **12001** | `N/A` | Background worker process. |

### Rules
1.  **Never random**: Do not use port 0 or let the OS assign random ports for these core services.
2.  **No conflicts**: If a port is busy, **kill the process** holding it rather than changing the config.
3.  **Hardcoded Defaults**: Configuration files should default to these values if env vars are missing.

## 2. Environment Variables (`.env`)

Standardized variable names for these connections:
```bash
PORT=3467                         # API Port
FRONTEND_URL_PROD=http://localhost:3466
FRONTEND_URL_DEV=http://localhost:3465
AGENT_HOST=http://localhost:12000
```
