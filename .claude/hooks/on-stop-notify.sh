#!/bin/bash
# Stop event — desktop notification when task completes
TASK_SUMMARY="${1:-Task completed}"
if command -v osascript &> /dev/null; then
  osascript -e "display notification \"$TASK_SUMMARY\" with title \"Claude Code\" sound name \"Glass\""
fi
if command -v notify-send &> /dev/null; then
  notify-send "Claude Code" "$TASK_SUMMARY"
fi
echo -e "\a"
exit 0
