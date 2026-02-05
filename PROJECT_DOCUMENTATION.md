# AMROIS 2.0 - Super-Agente Coach Architecture

## 🚀 Overview
AMROIS has evolved from a simple multi-agent system into a specialized, pipeline-driven intelligence. The new architecture is designed for deep book analysis, conceptual deep-dives, and personalized coaching delivery.

## 🏗️ Core Architecture (AMROIS 2.0)

### 🛡️ The Specialized Agent Pipeline
The system now operates through a coordinated 5-stage pipeline:

1.  **[InterpreterAgent](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/src/agents/InterpreterAgent.js)**: Classifies user intent and routes tasks to the appropriate specialty.
2.  **[ExtractorAgent](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/src/agents/ExtractorAgent.js)**: Performs RAG (Retrieval-Augmented Generation) using ChromaDB to find precise fragments in the knowledge base.
3.  **[AnalyzerAgent](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/src/agents/AnalyzerAgent.js)**: Applies thinking frameworks like **Feynman** or **First Principles** for deep logic.
4.  **[SynthesizerAgent](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/src/agents/SynthesizerAgent.js)**: Unifies multi-source data into a cohesive, non-redundant response.
5.  **[NarratorAgent](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/src/agents/NarratorAgent.js)**: Tailors the tone and delivery using specific personas (**Coach**, **Personalized Author**).

### 🧠 Master Orchestration
- **[AgentOrchestrator](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/src/services/AgentOrchestrator.js)**: Coordinates the entire flow, ensuring error handling and data consistency across agents.

## 🛠️ Infrastructure Improvements

### 🌐 Connectivity & Ports
- **Standardized Port (5467)**: Unified all service communication on port 5467. This resolves the previous 502 Bad Gateway errors in the Dashboard.
- **n8n Orchestration**: Integrated n8n as a service in the Docker stack for workflow automation.
- **ChromaDB**: Native integration for high-performance semantic search.

### ⚡ Performance Optimization
- **Optimized Dockerfile**: Removed recursive file ownership bottlenecks.
- **.dockerignore**: Implemented strict exclusions to reduce build context and deployment time.

## 📋 Work Plan & Status (Phase 3 & 4)

- [x] **Phase 1: Research & Port Standardization** (Completed)
- [x] **Phase 2: Restoration of UI/Sidebar** (Completed)
- [x] **Phase 3: Multi-Agent Pipeline Implementation** (Completed)
- [/] **Phase 4: Workflow Orchestration (n8n)** (In Progress - Service Integrated)

## 🧪 Deployment Notes
To refresh the environment with the new architecture:
```bash
# Recommended fresh start
docker-compose down
docker-compose up -d --build
```
The Chat API will automatically use the new `AgentOrchestrator` logic for all global chat interactions.