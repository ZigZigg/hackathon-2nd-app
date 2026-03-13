#!/bin/bash
# PreToolUse:Write — blocks impl files without a test file
FILE_PATH="$1"

if [[ "$FILE_PATH" =~ src/server/trpc/routers/[^_][^/]+\.ts$ ]] && \
   [[ ! "$FILE_PATH" =~ \.test\.ts$ ]] && \
   [[ ! "$FILE_PATH" =~ root\.ts$ ]] && \
   [[ ! "$FILE_PATH" =~ index\.ts$ ]]; then

  ROUTER_NAME=$(basename "$FILE_PATH" .ts)
  TEST_FILE="src/server/trpc/routers/__tests__/${ROUTER_NAME}.test.ts"

  if [ ! -f "$TEST_FILE" ]; then
    echo "🚫 TDD GUARD BLOCKED"
    echo "Cannot write: $FILE_PATH"
    echo "Missing test: $TEST_FILE"
    echo "Create the test file first → confirm RED → then write impl"
    exit 1
  fi
fi
exit 0
