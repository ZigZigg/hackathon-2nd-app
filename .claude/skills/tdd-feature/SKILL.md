---
name: tdd-feature
description: Implement a new backend feature using strict TDD. Write failing test first, then implementation.
triggers:
  - "tdd feature"
  - "test first"
---

# TDD Feature

## Step 1 — Write the test file first
Create `src/server/trpc/routers/__tests__/[name].test.ts` before touching impl.
tdd-guard hook will block you if you write the router first.

## Step 2 — Confirm RED
Run: `pnpm vitest run src/server/trpc/routers/__tests__/[name].test.ts`
Must fail. If it passes, the test is wrong — fix it.

## Step 3 — Write minimum implementation
Create `src/server/trpc/routers/[name].ts`.
Write only enough code to make the test pass. No extras.

## Step 4 — Confirm GREEN
Run the test again. Must pass.
If still RED, fix implementation (not the test).

## Step 5 — Refactor
Clean up only after GREEN. Re-run tests after every change.

## Step 6 — Register router
Add to `src/server/trpc/root.ts`.

## Done when
All tests GREEN ✅ | Router registered ✅ | No `any` types ✅
