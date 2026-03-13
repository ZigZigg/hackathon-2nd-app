---
name: add-api-route
description: Add a Next.js App Router API route. Use for streaming AI responses or webhooks — not for standard data (use tRPC instead).
triggers:
  - "api route"
  - "add route"
  - "rest endpoint"
---

# Add API Route

Use this for: streaming AI responses, webhooks, file uploads.
Use tRPC instead for: standard CRUD, data fetching, mutations.

## Step 1 — Create route file
`src/app/api/[feature]/route.ts`

## Step 2 — Auth check (required on every route)
```ts
import { auth } from '@/server/auth'
const session = await auth()
if (!session) return new Response('Unauthorized', { status: 401 })
```

## Step 3 — Validate input with Zod
```ts
import { z } from 'zod'
const schema = z.object({ ... })
const body = schema.parse(await req.json())
```

## Step 4 — Implement handler
For streaming AI: use `streamText` from `ai` + `result.toDataStreamResponse()`
For webhooks: verify signature before processing
For uploads: validate file type + size before saving

## Step 5 — Error handling
Return proper HTTP status codes. Never expose stack traces.

## Done when
Route responds correctly ✅ | Auth enforced ✅ | Input validated ✅ | No stack traces in errors ✅
