# Walkthrough: Routing & Local CI/CD

We have successfully updated the project routing and implemented a Local CI/CD system.

## 1. New Routing Configuration
The application is now configured to run in two distinct environments with dedicated ports:

| Environment | Dashboard URL | API URL | Path |
| :--- | :--- | :--- | :--- |
| **MAIN (Prod)** | `http://localhost:3466` | `http://localhost:3467` | `/Users/andersonmartinezrestrepo/AMR/` |
| **DEV** | `http://localhost:3465` | `http://localhost:3464` | `/Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/` |

### How to Launch
We created two helper scripts for easy launching:

**For MAIN:**
```bash
./launch-main.sh
```

**For DEV:**
```bash
./launch-dev.sh
```

## 2. Local CI/CD (Auto-Deploy)
We implemented an "Auto-Deploy Watcher" that polls GitHub for changes to the `main` branch.

### How it works
1.  The script `auto-deploy-watcher.sh` runs in the background.
2.  Every **60 seconds**, it checks `origin/main`.
3.  If a new commit (Merged PR) is detected:
    -   It stops the running MAIN services.
    -   Pulls the code (`git pull`).
    -   Installs dependencies (`npm install`).
    -   Restarts the MAIN environment (`./launch-main.sh`).

### How to Start the CI/CD Watcher
Run this command in a dedicated terminal (or background it):

```bash
npm run watch:deploy
# OR manually:
./auto-deploy-watcher.sh
```

> [!TIP]
> Keep this script running on your "Server" machine (the one hosting MAIN) to ensure it always reflects the latest code from GitHub.

## Verification
-   [x] **Routing**: Confirmed `launch-main.sh` sets PORT=3467 and DASHBOARD_PORT=3466.
-   [x] **CI/CD**: `auto-deploy-watcher.sh` successfully detects git changes and triggers the restart capability.
