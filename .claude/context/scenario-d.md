# Scenario D — AI App + RAG

## Core Entities (extends Scenario C)
- Document (id, title, fileUrl, status, uploadedById, createdAt)
- DocumentChunk (id, documentId, content, embedding vector(1536), chunkIndex)

## pgvector Setup (already in migration — just activate)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX ON "DocumentChunk" USING ivfflat (embedding vector_cosine_ops);

## RAG Pipeline
1. Upload → parse → chunk (512 tokens, 20% overlap)
2. Embed via Voyage AI voyage-2 (1536 dims)
3. Store in DocumentChunk.embedding
4. Query → embed → cosine search → top-5 chunks
5. Rerank → inject into Claude prompt → answer with citations

## tRPC Routers
- documents.router: upload, list, delete, getStatus
- chat.router: createSession, sendMessage (streaming), listSessions
- search.router: semanticSearch

## UI Pages
- /documents — upload + list + processing status
- /chat — streaming chat + source citations panel
- /search — semantic search with highlighted results
