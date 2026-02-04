# Feature Log: Real-time Agent Monitoring (v1.1.0-dev)
**Internal ID:** DOC-FIX-AGENTS
**Date:** 2026-02-02

## 📝 Description
Implementation of real-time telemetry and activity categorization for AI Agents in the AMR System. Focus on data accuracy, removing demo placeholders, and providing granular visibility into book processing tasks.

## 🔗 Issue Related
Closes #DOC-FIX-AGENTS

## ✅ Quality Checklist
- [x] Demo data removed.
- [x] Real-time categories: Reading, Extracting, Card Creation.
- [x] Real resource usage (CPU/Mem) tracking.
- [x] Task-Book link in UI.
- [x] Clean Code (backend/frontend).

## 🛠️ Changes
### Dashboard
- Polling mechanism (5s) in `Agents.jsx`.
- Real statistics cards.
- Resource usage progress bars.

### Backend
- SQLite schema expansion.
- `/api/agents/stats` logic for JSON payload extraction.
- Heartbeat integration with telemetry.
