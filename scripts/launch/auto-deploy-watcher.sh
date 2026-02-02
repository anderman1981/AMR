#!/bin/bash

# AMROIS Auto-Deploy Watcher (Local CI/CD)
# ----------------------------------------
# Watches for changes on origin/main and re-deploys MAIN environment.

BRANCH="main"
INTERVAL=60

echo "👀 Starting Auto-Deploy Watcher for branch: $BRANCH"
echo "⏱️  Polling interval: ${INTERVAL}s"

# Ensure we are on the correct branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "$BRANCH" ]; then
    echo "⚠️  Warning: Current branch is '$current_branch', not '$BRANCH'."
    echo "   The watcher will pull changes into '$current_branch' matching 'origin/$BRANCH'."
fi

while true; do
    # Fetch latest remote info
    git fetch origin "$BRANCH" > /dev/null 2>&1

    # Get commit hashes
    LOCAL_HASH=$(git rev-parse HEAD)
    REMOTE_HASH=$(git rev-parse "origin/$BRANCH")

    if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
        echo "--------------------------------------------------"
        echo "🚀 New deployment detected!"
        echo "   Local:  ${LOCAL_HASH:0:7}"
        echo "   Remote: ${REMOTE_HASH:0:7}"
        echo "   Date:   $(date)"
        echo "--------------------------------------------------"

        # 1. Pull changes
        echo "📥 Pulling changes..."
        git pull origin "$BRANCH"

        # 2. Install dependencies (Root)
        if [ -f "package.json" ]; then
            echo "📦 Installing root dependencies..."
            npm install
        fi

        # 3. Install dependencies (Dashboard)
        if [ -d "dashboard" ]; then
            echo "📦 Installing dashboard dependencies..."
            cd dashboard && npm install && cd ..
        fi

        # 4. Re-launch MAIN environment
        echo "🔄 Restarting MAIN environment..."
        ./launch-main.sh

        echo "✅ Deployment complete. Watching for next change..."
    else
        # No changes, silent wait or debug log
        # echo "💤 No changes. (HEAD: ${LOCAL_HASH:0:7})"
        :
    fi

    sleep "$INTERVAL"
done
