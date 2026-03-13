#!/bin/bash
# PostToolUse:Bash — full test suite after git commit
COMMAND="$1"
if echo "$COMMAND" | grep -q "git commit"; then
  echo "🧪 Running full test suite..."
  pnpm vitest run --reporter=verbose 2>&1 | tail -30
fi
exit 0
