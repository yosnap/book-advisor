import { NextRequest, NextResponse } from 'next/server'
import { RecommendationRequestSchema } from '@/lib/validation'
import { prisma } from '@/lib/db'
import { callN8nRecommendation } from '@/lib/n8n'

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const body = await request.json()
    const validated = RecommendationRequestSchema.parse(body)

    // Auto-generate userId if not provided
    const userId = validated.userId || crypto.randomUUID()

    // 1. Save/update reader context in DB
    const readerContext = await prisma.readerContext.upsert({
      where: { userId },
      update: {
        mood: validated.context.mood,
        readerProfile: validated.context.profile,
        interests: validated.context.interests,
        intent: validated.context.intent,
      },
      create: {
        userId,
        mood: validated.context.mood,
        readerProfile: validated.context.profile,
        interests: validated.context.interests,
        intent: validated.context.intent,
      },
    })

    // 2. Call n8n webhook with context
    const n8nResult = await callN8nRecommendation(
      readerContext.id,
      userId,
      validated.context
    )

    // 3. Map n8n response to frontend-expected format
    const books = n8nResult.recommendations.map((rec) => ({
      id: rec.bookId,
      title: rec.title,
      author: rec.author,
      genre: rec.genre,
      synopsis: '',
      matchScore: rec.matchScore,
      score: rec.matchScore,
      justification: rec.justification,
      scoreBreakdown: {
        interestMatch: rec.reasoning.genre_match,
        difficultyMatch: rec.reasoning.reader_level_match ?? 0,
        moodMatch: rec.reasoning.mood_match,
      },
    }))

    return NextResponse.json(
      {
        status: 'success',
        books,
        data: {
          contextId: readerContext.id,
          recommendations: n8nResult.recommendations,
        },
        requestId,
      },
      { status: 200 }
    )
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
