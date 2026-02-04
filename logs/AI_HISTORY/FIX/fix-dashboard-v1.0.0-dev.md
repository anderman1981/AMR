# 🛠️ Bug Fix: Dashboard Port & Branch Display

**Date**: 2026-02-02
**Issue**: Dashboard (3465) failing to connect to DEV API (3464) and showing 'main' branch in sidebar.

## 🔍 Root Cause Analysis
1.  **Hardcoded Ports**: `api.js` and `agents.js` had a hardcoded fallback to `3467` (MAIN API).
2.  **Proxy Mismatch**: `vite.config.js` was pointing to an old port (`4126`).
3.  **Static Version**: `version.json` was not being updated correctly because of a parent directory reference error in the reorganize-scripts phase.

## 🛠️ Implementation Details
### 1. Connectivity
- Updated `dashboard/src/services/api.js` and `agents.js` to use empty string fallbacks, forcing Vite to use its internal proxy.
- Set `vite.config.js` proxy target to `http://localhost:3464`.
- Updated `launch-dev.sh` to pass the correct `API_URL` to the dashboard process.

### 2. Metadata (Branch)
- Corrected the version generation trigger in `dashboard/package.json`.
- Forced a regeneration of `version.json`, which now correctly identifies the `dev` branch.

## ✅ Verification
- Checked `version.json`: `branch` is now `dev`.
- Verified API proxying via curl and dashboard restart.

---
*Verified by AMR Master Agent*
