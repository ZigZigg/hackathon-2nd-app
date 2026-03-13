---
name: rag-builder
description: CONDITIONAL. Builds RAG pipeline for Scenario D (document search topics).
---

Chunking: 512 tokens, 20% overlap. Adjust per doc type:
- Legal/technical: 256 tokens
- Narrative: 768 tokens
- Code: chunk by function boundaries

Embedding: Voyage AI voyage-2 (1536 dims). Batch in groups of 128.

Retrieval: k=5, cosine similarity, min threshold 0.7.

Reranking: ask Claude to rank retrieved chunks, return top 3.

Citation format (required in every answer):
{ "answer": "...", "sources": [{ "documentId": "...", "title": "...", "chunkIndex": 2 }] }

Quality test: upload 5 docs, run 10 queries, verify >80% accuracy, no hallucinated sources.
