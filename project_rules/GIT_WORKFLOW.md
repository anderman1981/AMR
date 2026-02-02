# 🐙 GIT WORKFLOW & ENVIRONMENT RULES

> **STRICT ENFORCEMENT**: These rules are critical for maintaining a clean separation between Development and Production.

## 1. Environment-Agnostic UI (The "No-Hardcode" Rule)

**NEVER** hardcode environment names (like "dev", "prod", "staging") directly in the UI components.

### ❌ Forbidden
```jsx
// DO NOT DO THIS
<span>Branch: dev</span> 
```

### ✅ Required
Use environment variables or build-time flags to determine what to show.
```jsx
// DO THIS
const isDev = import.meta.env.DEV;
{isDev && <span>Branch: {import.meta.env.VITE_BRANCH_NAME}</span>}
```

## 2. Footer Display Logic (Sidebar)

- **Development (`npm run dev`)**:
    - Show **FULL** details: Version, Branch, System Status.
    - Context: Developers need to know exactly what they are breaking.
- **Production (`npm run prod`)**:
    - Show **MINIMAL** details: Only Version (in discreet gray).
    - Context: End-users (or demos) should see a clean interface, not debug info.

## 3. Branching Strategy (Git Flow)

1.  **`main`**: Production-ready code. **PROTECTED**. No direct commits.
2.  **`dev`**: Integration branch. All features merge here first.
3.  **`feature/*`**: New capabilities (e.g., `feature/real-agents`).
4.  **`fix/*`**: Bug fixes.

**Merge Rule**: `feature/*` -> `dev` -> (Verify) -> `main`.
