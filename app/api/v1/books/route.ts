import { NextRequest, NextResponse } from 'next/server'
import { BooksQuerySchema } from '@/lib/validation'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = {
      genre: searchParams.get('genre') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const validated = BooksQuerySchema.parse(query)

    const books = await prisma.book.findMany({
      where: {
        ...(validated.genre && { genre: validated.genre }),
        ...(validated.difficulty && { difficulty: validated.difficulty }),
        ...(validated.search && {
          OR: [
            { title: { contains: validated.search, mode: 'insensitive' } },
            { author: { contains: validated.search, mode: 'insensitive' } },
            { synopsis: { contains: validated.search, mode: 'insensitive' } },
          ],
        }),
      },
      skip: validated.offset,
      take: validated.limit,
    })

    const total = await prisma.book.count({
      where: {
        ...(validated.genre && { genre: validated.genre }),
        ...(validated.difficulty && { difficulty: validated.difficulty }),
        ...(validated.search && {
          OR: [
            { title: { contains: validated.search, mode: 'insensitive' } },
            { author: { contains: validated.search, mode: 'insensitive' } },
            { synopsis: { contains: validated.search, mode: 'insensitive' } },
          ],
        }),
      },
    })

    return NextResponse.json({
      status: 'success',
      data: {
        books,
        pagination: {
          offset: validated.offset,
          limit: validated.limit,
          total,
          hasMore: validated.offset + validated.limit < total,
        },
      },
    })
  } catch (error: any) {
    console.error('Books fetch error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch books',
        },
      },
      { status: 500 }
    )
  }
}
