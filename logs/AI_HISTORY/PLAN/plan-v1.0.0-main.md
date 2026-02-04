# Implementation Plan: Project Reorganization & AI Standards

## Goal Description
Standardize the project's documentation, AI rules, and logging structure. Additionally, create a local-only Project Admin Dashboard on port 3463 for file visualization.

## Proposed Changes

### 1. AI Standards & Master Rules
#### [NEW] [MASTER_RULES.md](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/MASTER_RULES.md)
-   Consolidate existing rules from `rules/AI_DEVELOPMENT_MASTER_PROTOCOL.md` and `rules/GIT_WORKFLOW_RULES.md`.
-   Establish mandatory validation steps for any AI interacting with the project.
-   Include current port mappings (Dashboard 3466/3465, API 3467/3464, Admin 3463).

### 2. Standardized Logging System
#### [NEW] [logs/AI_HISTORY/](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/logs/AI_HISTORY/)
-   Create a directory structure to archive AI artifacts:
    -   `FIX/`: history of bug fixes.
    -   `FEAT/`: history of new features.
    -   `DOCS/`: versioned walkthroughs (e.g., `walkthrough-v1.0.0-main.md`).
    -   `TASK/`: history of active task lists.
    -   `PLAN/`: history of implementation plans.

### 3. Project Documentation & Map
#### [NEW] [docs/guides/PROJECT_MAP.md](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/docs/guides/PROJECT_MAP.md)
-   Generate a comprehensive map of files and folders using a tree structure.
-   Describe the responsibility of each main directory.

### 4. Project Admin Dashboard (Local Only)
#### [NEW] [admin/](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/admin/)
-   **Backend**: Simple Node.js/Express server that reads the local filesystem.
-   **Frontend**: Basic HTML/CSS interface to visualize the project map and file content.
-   **Config**: Runs on Port `3463`.
-   **Security**: Restricted to `localhost`.
-   **Git**: Added to `.gitignore` to ensure it remains local.

### 5. Integration
#### [MODIFY] [package.json](file:///Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/package.json)
-   Add `"dev:admin": "node admin/server.js"` script.

## Verification Plan

### Automated Tests
-   Verify server status on `http://localhost:3463/health`.

### Manual Verification
1.  **Check Rules**: Ensure `MASTER_RULES.md` is complete and references existing protocols.
2.  **Test Logging**: Manually move a dummy plan to `logs/AI_HISTORY/PLAN/` and verify naming.
3.  **Run Admin**: Execute `npm run dev:admin` and open `localhost:3463`. Confirm project structure is visible.
