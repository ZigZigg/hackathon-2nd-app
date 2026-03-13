---
name: ai-feature
description: Add an AI-powered feature using Claude via Vercel AI SDK. Covers streaming, tool use, and context stuffing.
triggers:
  - "ai feature"
  - "add ai"
  - "claude integration"
---

# AI Feature

## Step 1 — Choose the pattern

**Streaming chat** (user sees tokens in real time):
→ API route at `src/app/api/ai/[feature]/route.ts`
→ Use `streamText` from `ai` + `anthropic('claude-sonnet-4-6')`
→ Return `result.toDataStreamResponse()`
→ Frontend: `useChat` hook from `ai/react`

**Context stuffing** (query over DB data):
→ Use `queryWithContext` from `@/server/services/ai.service`
→ Fetch relevant records from DB, pass as context
→ Call from a tRPC procedure, not an API route

**Tool use** (Claude creates/updates records):
→ Use `generateWithTools` from `@/server/services/ai.service`
→ Define tools with Zod input schemas
→ Handle `tool_use` blocks in response

## Step 2 — Auth + rate limiting (required)
Every AI endpoint must:
- Check session before calling Claude
- Limit to reasonable token budget (`maxTokens: 1000`)

## Step 3 — Error handling
```ts
try {
  // AI call
} catch (error) {
  // Never expose raw error to client
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'AI request failed' })
}
```

## Step 4 — Frontend (streaming)
```ts
const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/ai/[feature]',
})
```
Always show a loading state while streaming.

## Done when
Auth enforced ✅ | Streaming works ✅ | Error handled gracefully ✅ | No API keys on client ✅
