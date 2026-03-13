#!/bin/bash
# PreToolUse:Bash — blocks catastrophic commands
COMMAND="$1"

DANGEROUS=(
  "rm -rf /" "rm -rf ~" "rm -rf \*"
  "DROP TABLE" "DROP DATABASE"
  "DELETE FROM.*WHERE.*1=1"
  "git push.*--force.*main" "git push.*-f.*main"
  "npx prisma db push --accept-data-loss"
)

for pattern in "${DANGEROUS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    echo "🚫 BLOCKED: $COMMAND (matched: $pattern)"
    echo "Run manually outside Claude Code if truly needed."
    exit 1
  fi
done
exit 0
