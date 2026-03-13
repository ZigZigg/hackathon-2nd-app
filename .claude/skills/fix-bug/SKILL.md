---
name: fix-bug
description: Diagnose and fix a bug systematically. Never guess — reproduce first, then fix.
triggers:
  - "fix bug"
  - "debug"
  - "something is broken"
---

# Fix Bug

## Step 1 — Reproduce it
Write the exact steps to trigger the bug.
If you can't reproduce it reliably, you can't confirm the fix.

## Step 2 — Write a failing test (if backend)
Add a test case that captures the broken behavior.
It must fail now. It will pass after the fix.

## Step 3 — Find the root cause
Read the error message fully — don't skim.
Check: input validation, auth checks, DB query, response shape.
Use `console.error` temporarily to inspect values.

Common causes:
- `undefined` where a value is expected → check optional chaining and nulls
- UNAUTHORIZED → session not passed to tRPC caller
- Zod parse error → input shape mismatch
- Type error → run `pnpm type-check` to find it

## Step 4 — Fix the smallest thing possible
Do not refactor while fixing. Change only what's broken.

## Step 5 — Confirm fixed
Run the failing test → must now pass.
Run full test suite → no regressions: `pnpm test`
Manually verify the original repro steps no longer trigger the bug.

## Step 6 — Remove debug logs
Delete any `console.error` added in step 3.

## Done when
Failing test now passes ✅ | Full suite still passes ✅ | Debug logs removed ✅
