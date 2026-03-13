---
name: new-feature
description: Add a full-stack feature end-to-end. Follows the canonical Feature Addition Order from CLAUDE.md.
triggers:
  - "new feature"
  - "add feature"
---

# New Feature

Follow this order exactly. Do not skip steps.

## 1 — Schema (if new data needed)
Add model to `prisma/schema.prisma`.
Run: `pnpm db:migrate --name [feature-name]`
Run: `pnpm db:generate`

## 2 — Validation schema
Create `src/lib/validations/[feature].ts` with Zod schemas.
These are the shared source of truth for frontend and backend.

## 3 — tRPC router (TDD-first)
Run `/tdd-feature` for this step.
Register in `src/server/trpc/root.ts`.

## 4 — React hook
Create `src/hooks/use-[feature].ts` using tRPC client.
Handle loading, error, and success states.

## 5 — Form component (if user input needed)
Create `src/components/forms/[Feature]Form.tsx`.
Use react-hook-form + Zod resolver from step 2.

## 6 — Page
Create `src/app/(dashboard)/[feature]/page.tsx`.
Use the hook from step 4. Handle all 3 states: loading / empty / error.

## Done when
Tests GREEN ✅ | Page renders ✅ | All 3 states handled ✅ | No TypeScript errors ✅
