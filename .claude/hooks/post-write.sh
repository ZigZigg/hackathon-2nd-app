#!/bin/bash
# PostToolUse:Write — lint + typecheck on every file save
FILE_PATH="$1"
if [[ "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  pnpm eslint "$FILE_PATH" --max-warnings=0 --quiet 2>&1
  pnpm tsc --noEmit --pretty 2>&1 | grep -E "error TS" | head -5
fi
exit 0
