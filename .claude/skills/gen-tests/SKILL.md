---
name: gen-tests
description: Generate missing tests for an existing router or component. Use when coverage is below 80%.
triggers:
  - "gen tests"
  - "generate tests"
  - "write tests"
---

# Generate Tests

## Step 1 — Identify what to test
Read the target file. List every exported procedure/function/component.

## Step 2 — Create test file (if missing)
Router tests: `src/server/trpc/routers/__tests__/[name].test.ts`
Component tests: co-locate as `[Component].test.tsx`

## Step 3 — Router test template
```ts
import { createCallerFactory } from '@/server/trpc'
import { appRouter } from '@/server/trpc/root'
import { db } from '@/server/db'

const createCaller = createCallerFactory(appRouter)

describe('[router].list', () => {
  it('returns items for authenticated user', async () => {
    const caller = createCaller({ session: { user: { id: 'u1' } }, db })
    const result = await caller.[router].list()
    expect(result).toBeDefined()
  })

  it('throws UNAUTHORIZED when not authenticated', async () => {
    const caller = createCaller({ session: null, db })
    await expect(caller.[router].list()).rejects.toThrow('UNAUTHORIZED')
  })
})
```

## Step 4 — Cover these cases per procedure
- Happy path with valid input
- Unauthenticated request → UNAUTHORIZED
- Invalid input → ZodError or BAD_REQUEST
- Not found → NOT_FOUND (for getById, update, delete)

## Step 5 — Run and confirm
`pnpm vitest run [test-file] --reporter=verbose`
Target: all cases pass, >80% coverage on the file.
