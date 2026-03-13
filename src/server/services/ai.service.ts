import Anthropic from '@anthropic-ai/sdk'
import { createAnthropic } from '@ai-sdk/anthropic'

const anthropicSDK = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 3 })
export const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export const DEFAULT_MODEL = 'claude-sonnet-4-6' as const

// For tool use (non-streaming)
export async function generateWithTools(
  systemPrompt: string,
  userMessage: string,
  tools?: Anthropic.Tool[],
) {
  return anthropicSDK.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    tools: tools ?? [],
  })
}

// For data-aware queries — context stuffing (Scenarios A, B, C)
export async function queryWithContext<T>(context: T, question: string, systemPrompt?: string) {
  const response = await anthropicSDK.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    system: systemPrompt ?? 'Answer based only on the provided context.',
    messages: [{
      role: 'user',
      content: `Context:\n${JSON.stringify(context, null, 2)}\n\nQuestion: ${question}`,
    }],
  })
  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}
