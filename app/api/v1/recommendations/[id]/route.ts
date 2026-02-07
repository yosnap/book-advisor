import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch recommendation with related books
    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!recommendation) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'NOT_FOUND',
            message: 'Recommendation not found',
          },
        },
        { status: 404 }
      );
    }

    // Format response
    const formattedBooks = recommendation.books.map((rec) => ({
      id: rec.book.id,
      title: rec.book.title,
      author: rec.book.author,
      genre: rec.book.genre,
      synopsis: rec.book.synopsis,
      difficulty: rec.book.difficulty,
      publicationYear: rec.book.publicationYear,
      tags: rec.book.tags,
      score: rec.score,
      scoreBreakdown: rec.scoreBreakdown,
      justification: rec.justification,
      keyReasons: rec.keyReasons,
      rank: rec.rank,
    }));

    return NextResponse.json({
      status: 'success',
      data: {
        recommendationId: recommendation.id,
        createdAt: recommendation.createdAt,
        books: formattedBooks,
        metadata: {
          totalScore: recommendation.totalScore,
          processingTime: recommendation.processingTime,
          agentsUsed: recommendation.agentsUsed || [],
          errors: recommendation.errors || [],
        },
      },
    });
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch recommendation',
        },
      },
      { status: 500 }
    );
  }
}
