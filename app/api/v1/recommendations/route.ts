import { NextRequest, NextResponse } from 'next/server'
import { RecommendationRequestSchema } from '@/lib/validation'
import { prisma } from '@/lib/db'
import { callN8nRecommendation, BookCandidate } from '@/lib/n8n'
import {
  validateContext,
  searchBooks,
  scoreAndRankBooks,
  orchestrateRecommendations,
} from '@/lib/orchestrator'

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const body = await request.json()
    const validated = RecommendationRequestSchema.parse(body)
    const userId = validated.userId || crypto.randomUUID()
    const context = validated.context

    // 1. Validate
    const validation = validateContext(context)
    if (!validation.valid) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.errors.join(', '),
          },
          requestId,
        },
        { status: 400 }
      )
    }

    // 2. Save/update reader context
    const readerContext = await prisma.readerContext.upsert({
      where: { userId },
      update: {
        mood: context.mood,
        readerProfile: context.profile,
        interests: context.interests,
        intent: context.intent,
      },
      create: {
        userId,
        mood: context.mood,
        readerProfile: context.profile,
        interests: context.interests,
        intent: context.intent,
      },
    })

    // 3. Score books locally (fast, deterministic)
    // Normalize interests to lowercase to match DB genre values
    const normalizedInterests = context.interests.map((i: string) => i.toLowerCase())
    const foundBooks = await searchBooks(normalizedInterests, context.profile)
    const contextWithNormalized = { ...context, interests: normalizedInterests }
    const rankedBooks = scoreAndRankBooks(foundBooks, contextWithNormalized)

    // Build candidates with full book data for n8n/Haiku
    const candidates: BookCandidate[] = rankedBooks.map(({ book, score, breakdown, tagMatches: _tagMatches }) => ({
      bookId: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      synopsis: book.synopsis || '',
      difficulty: book.difficulty || null,
      publicationYear: book.publicationYear || null,
      tags: book.tags || [],
      score,
      scoreBreakdown: breakdown,
      keyReasons: normalizedInterests.filter(
        (i: string) => book.genre?.toLowerCase() === i.toLowerCase() ||
          book.tags?.some((t: string) => t.toLowerCase() === i.toLowerCase())
      ),
    }))

    // 4. Send to n8n for Haiku-powered justifications
    try {
      const n8nResult = await callN8nRecommendation(
        readerContext.id,
        userId,
        contextWithNormalized,
        candidates
      )

      // Merge n8n justifications with local book data
      const books = n8nResult.recommendations.map((rec, idx) => {
        const candidate = candidates.find((c) => c.bookId === rec.bookId) || candidates[idx]
        return {
          id: rec.bookId,
          title: rec.title || candidate?.title,
          author: rec.author || candidate?.author,
          genre: rec.genre || candidate?.genre,
          synopsis: candidate?.synopsis || '',
          difficulty: candidate?.difficulty || null,
          publicationYear: candidate?.publicationYear || null,
          tags: candidate?.tags || [],
          matchScore: rec.matchScore || candidate?.score || 0,
          score: rec.matchScore || candidate?.score || 0,
          justification: rec.justification,
          keyReasons: rec.keyReasons || candidate?.keyReasons || [],
          scoreBreakdown: {
            interestMatch: rec.reasoning?.genre_match ?? candidate?.scoreBreakdown.interestMatch ?? 0,
            difficultyMatch: rec.reasoning?.reader_level_match ?? candidate?.scoreBreakdown.difficultyMatch ?? 0,
            moodMatch: rec.reasoning?.mood_match ?? candidate?.scoreBreakdown.moodMatch ?? 0,
          },
        }
      })

      return NextResponse.json(
        {
          status: 'success',
          books,
          data: {
            contextId: readerContext.id,
            recommendations: n8nResult.recommendations,
          },
          source: 'n8n',
          requestId,
        },
        { status: 200 }
      )
    } catch (n8nError) {
      console.warn(`[${requestId}] n8n unavailable, using local orchestrator:`, (n8nError as Error).message)

      // 5. Fallback: full local orchestrator (scoring + basic justifications)
      const result = await orchestrateRecommendations(userId, contextWithNormalized)

      const books = result.books.map((book) => ({
        id: book.bookId,
        title: book.title,
        author: book.author,
        genre: book.genre,
        synopsis: book.synopsis,
        matchScore: book.score,
        score: book.score,
        justification: book.justification,
        keyReasons: book.keyReasons,
        scoreBreakdown: book.scoreBreakdown,
      }))

      return NextResponse.json(
        {
          status: 'success',
          books,
          data: {
            contextId: readerContext.id,
            recommendationId: result.recommendationId,
          },
          source: 'local',
          requestId,
        },
        { status: 200 }
      )
    }
  } catch (error: any) {
    console.error(`[${requestId}] Recommendation error:`, error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
          requestId,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'ORCHESTRATION_ERROR',
          message: error.message || 'Failed to generate recommendations',
        },
        requestId,
      },
      { status: 500 }
    )
  }
}
