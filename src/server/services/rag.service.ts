// RAG SERVICE — DORMANT STUB
// Uncomment ONLY when /rag-setup skill is triggered on competition day
// Requires: VOYAGE_API_KEY set, DocumentChunk migration run

/*
import { db } from '@/server/db'

const CHUNK_WORDS = 384   // ~512 tokens
const OVERLAP_WORDS = 77  // ~20% overlap
const DEFAULT_K = 5
const MIN_SIMILARITY = 0.7

export function chunkText(text: string): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += CHUNK_WORDS - OVERLAP_WORDS) {
    const chunk = words.slice(i, i + CHUNK_WORDS).join(' ')
    if (chunk.trim()) chunks.push(chunk)
    if (i + CHUNK_WORDS >= words.length) break
  }
  return chunks
}

export async function embedText(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: texts, model: 'voyage-2' }),
  })
  const data = await res.json()
  return data.data.map((d: { embedding: number[] }) => d.embedding)
}

export async function embedAndStore(documentId: string, content: string) {
  const chunks = chunkText(content)
  const embeddings = await embedText(chunks)
  await db.$transaction(
    chunks.map((chunk, i) =>
      db.$executeRaw`
        INSERT INTO "DocumentChunk" (id, "documentId", content, embedding, metadata, "chunkIndex", "createdAt")
        VALUES (gen_random_uuid(), ${documentId}, ${chunk},
                ${JSON.stringify(embeddings[i])}::vector, '{}', ${i}, NOW())
      `
    )
  )
}

export async function semanticSearch(query: string, k = DEFAULT_K) {
  const [queryEmbedding] = await embedText([query])
  return db.$queryRaw<Array<{
    id: string; content: string; documentId: string; chunkIndex: number; similarity: number
  }>>`
    SELECT id, content, "documentId", "chunkIndex",
           1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) AS similarity
    FROM "DocumentChunk"
    WHERE 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${MIN_SIMILARITY}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${k}
  `
}
*/
