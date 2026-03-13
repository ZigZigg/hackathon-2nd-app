# Scenario C — AI App (no RAG)

## Core Entities
- ChatSession (id, userId, title, createdAt)
- ChatMessage (id, sessionId, role, content, tokens, createdAt)

## tRPC Routers
- sessions.router: list, create, delete, rename
- messages.router: list (by session)

## API Routes
- POST /api/ai/chat — streaming response via Vercel AI SDK

## UI Pages
- /chat — chat window + streaming + session sidebar
- /chat/[id] — conversation history
- /settings — model config, system prompt

## AI Features
- Streaming response (tokens appear in real time)
- Tool use: create/update records directly from chat
- Context stuffing: inject relevant DB data into system prompt
