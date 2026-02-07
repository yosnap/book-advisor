import { Context } from './validation'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!
const N8N_TIMEOUT = 30_000

export interface BookCandidate {
  bookId: string
  title: string
  author: string
  genre: string
  synopsis: string
  difficulty: string | null
  publicationYear: number | null
  tags: string[]
  score: number
  scoreBreakdown: {
    interestMatch: number
    difficultyMatch: number
    moodMatch: number
  }
  keyReasons: string[]
}

export interface N8nRecommendation {
  rank: number
  bookId: string
  title: string
  author: string
  genre: string
  matchScore: number
  justification: string
  keyReasons: string[]
  reasoning: {
    mood_match: number
    genre_match: number
    intention_match: number
    reader_level_match?: number
  }
}

export interface N8nResponse {
  contextId: string
  recommendations: N8nRecommendation[]
}

/**
 * Call n8n webhook with pre-scored book candidates.
 * The n8n workflow uses Haiku to generate professional,
 * book-specific justifications for each candidate.
 */
export async function callN8nRecommendation(
  contextId: string,
  userId: string,
  context: Context,
  candidates?: BookCandidate[]
): Promise<N8nResponse> {
  const payload = {
    contextId,
    userId,
    mood: context.mood,
    readerType: context.profile,
    favoriteGenres: context.interests,
    intention: context.intent,
    // Send pre-scored candidates for Haiku to justify
    candidates: candidates || [],
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), N8N_TIMEOUT)

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`n8n webhook failed (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    // n8n returns an array; extract the first item
    const result = Array.isArray(data) ? data[0] : data
    return result as N8nResponse
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error(`n8n webhook timeout after ${N8N_TIMEOUT}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
