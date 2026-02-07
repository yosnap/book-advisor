import { NextRequest, NextResponse } from 'next/server'
import { RecommendationRequestSchema } from '@/lib/validation'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = RecommendationRequestSchema.parse(body)
    const userId = validated.userId || crypto.randomUUID()

    const context = await prisma.readerContext.upsert({
      where: { userId },
      update: {
        mood: validated.context.mood,
        readerProfile: validated.context.profile,
        interests: validated.context.interests,
        intent: validated.context.intent,
        lastAccessedAt: new Date(),
      },
      create: {
        userId,
        mood: validated.context.mood,
        readerProfile: validated.context.profile,
        interests: validated.context.interests,
        intent: validated.context.intent,
      },
    })

    return NextResponse.json(
      {
        status: 'success',
        data: {
          contextId: context.id,
          userId: context.userId,
          createdAt: context.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Context save error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid context data',
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'SAVE_ERROR',
          message: 'Failed to save context',
        },
      },
      { status: 500 }
    )
  }
}
