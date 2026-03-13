#!/bin/bash
# PostToolUse:Write — auto-run related test after every implementation edit
FILE_PATH="$1"

if [[ "$FILE_PATH" =~ src/server/trpc/routers/([^/]+)\.ts$ ]] && \
   [[ ! "$FILE_PATH" =~ \.test\.ts$ ]]; then
  ROUTER_NAME="${BASH_REMATCH[1]}"
  TEST_FILE="src/server/trpc/routers/__tests__/${ROUTER_NAME}.test.ts"
  if [ -f "$TEST_FILE" ]; then
    pnpm vitest run "$TEST_FILE" --reporter=verbose 2>&1 | tail -20
  fi
fi

if [[ "$FILE_PATH" =~ \.test\.ts$ ]]; then
  pnpm vitest run "$FILE_PATH" --reporter=verbose 2>&1 | tail -20
fi
exit 0
