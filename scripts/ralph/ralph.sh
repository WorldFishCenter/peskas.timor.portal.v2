#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop
# Usage: ./ralph.sh [max_iterations]

set -e

# Add amp to PATH
export PATH="/Users/lore/.amp/bin:$PATH"

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"

# Archive previous run if branch changed
if [ -f "$PRD_FILE" ] && [ -f "$LAST_BRANCH_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")
  
  if [ -n "$CURRENT_BRANCH" ] && [ -n "$LAST_BRANCH" ] && [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
    # Archive the previous run
    DATE=$(date +%Y-%m-%d)
    # Strip "ralph/" prefix from branch name for folder
    FOLDER_NAME=$(echo "$LAST_BRANCH" | sed 's|^ralph/||')
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"
    
    echo "Archiving previous run: $LAST_BRANCH"
    mkdir -p "$ARCHIVE_FOLDER"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"
    echo "   Archived to: $ARCHIVE_FOLDER"
    
    # Reset progress file for new run
    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "Started: $(date)" >> "$PROGRESS_FILE"
    echo "---" >> "$PROGRESS_FILE"
  fi
fi

# Track current branch
if [ -f "$PRD_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  if [ -n "$CURRENT_BRANCH" ]; then
    echo "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
  fi
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "Starting Ralph - Max iterations: $MAX_ITERATIONS"
echo "Iteration timeout: 30 minutes"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "═══════════════════════════════════════════════════════"

  # Run amp with timeout (15 minutes = 900 seconds)
  TIMEOUT=900
  START_TIME=$(date +%s)

  # Run amp in background
  (cat "$SCRIPT_DIR/prompt.md" | amp --dangerously-allow-all 2>&1 | tee /dev/stderr) &
  AMP_PID=$!

  # Wait for amp with progress indicators and timeout
  TIMED_OUT=0
  while kill -0 $AMP_PID 2>/dev/null; do
    ELAPSED=$(($(date +%s) - START_TIME))
    REMAINING=$((TIMEOUT - ELAPSED))

    # Check if we've exceeded timeout
    if [ $ELAPSED -ge $TIMEOUT ]; then
      echo ""
      echo "⚠️  Iteration $i TIMED OUT after $TIMEOUT seconds"
      kill $AMP_PID 2>/dev/null
      sleep 2
      kill -9 $AMP_PID 2>/dev/null
      TIMED_OUT=1
      break
    fi

    if [ $REMAINING -gt 0 ]; then
      printf "\r⏳ Running... %d/%d seconds (%.0f%% complete)" $ELAPSED $TIMEOUT $((ELAPSED * 100 / TIMEOUT))
    fi
    sleep 10
  done

  echo ""

  # Skip to next iteration if timed out
  if [ $TIMED_OUT -eq 1 ]; then
    echo "Check $PROGRESS_FILE for partial progress"
    echo "Skipping to next iteration..."
    continue
  fi

  # Capture exit code if process finished naturally
  wait $AMP_PID 2>/dev/null
  EXIT_CODE=$?

  # Check for completion signal in recent output
  if tail -100 "$SCRIPT_DIR/../../"*.log 2>/dev/null | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "✅ Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    exit 0
  fi

  echo "✓ Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1
