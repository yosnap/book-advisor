import { prisma } from './db'
import { Context, Profile, Mood } from './validation'

interface ScoreBreakdown {
  interestMatch: number
  difficultyMatch: number
  moodMatch: number
}

interface RecommendedBook {
  bookId: string
  title: string
  author: string
  genre: string
  score: number
  scoreBreakdown: ScoreBreakdown
  justification: string
  keyReasons: string[]
}

interface OrchestrationResult {
  recommendationId: string
  books: RecommendedBook[]
  metadata: {
    totalScore: number
    processingTime: number
    agentsUsed: string[]
    errors: string[]
  }
}

// Phase 1: Validate
export function validateContext(context: Context): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!context.mood) errors.push('Mood is required')
  if (!context.profile) errors.push('Profile is required')
  if (!context.intent) errors.push('Intent is required')
  if (context.interests.length === 0) errors.push('At least one interest is required')
  return { valid: errors.length === 0, errors }
}

// Phase 2: Enrich Context
async function enrichContext(userId: string, context: Context) {
  try {
    const readerContext = await prisma.readerContext.upsert({
      where: { userId },
      update: {
        mood: context.mood,
        readerProfile: context.profile,
        interests: context.interests,
        intent: context.intent,
        lastAccessedAt: new Date(),
      },
      create: {
        userId,
        mood: context.mood,
        readerProfile: context.profile,
        interests: context.interests,
        intent: context.intent,
      },
    })
    return readerContext
  } catch (error) {
    console.error('Context enrichment failed:', error)
    return { mood: context.mood, readerProfile: context.profile, interests: context.interests, intent: context.intent }
  }
}

// Phase 3a: Search Books
async function searchBooks(interests: string[], profile: Profile): Promise<any[]> {
  try {
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { genre: { in: interests } },
          { tags: { hasSome: interests } },
        ],
      },
      take: 30,
    })
    return books
  } catch (error) {
    console.error('Search failed:', error)
    return []
  }
}

// Phase 3b: Score Books
function scoreBooks(books: any[], context: Context): Map<string, ScoreBreakdown> {
  const scores = new Map<string, ScoreBreakdown>()

  const difficultyMap: Record<Profile, Record<string, number>> = {
    novato: { beginner: 1.0, intermediate: 0.5, advanced: 0.2 },
    intermedio: { beginner: 0.7, intermediate: 1.0, advanced: 0.6 },
    avanzado: { beginner: 0.3, intermediate: 0.8, advanced: 1.0 },
    experto: { beginner: 0.1, intermediate: 0.6, advanced: 1.0 },
  }

  const moodGenreMap: Record<Mood, Record<string, number>> = {
    feliz: { ficción: 0.9, romance: 0.8, aventura: 0.8 },
    triste: { ficción: 0.6, filosofía: 0.7, historia: 0.6 },
    reflexivo: { filosofía: 0.9, historia: 0.8, ensayo: 0.8 },
    ansioso: { ficción: 0.5, desarrollo: 0.7, tecnología: 0.6 },
    neutral: { ficción: 0.7, historia: 0.7, ciencia: 0.7 },
  }

  for (const book of books) {
    const interestMatch = context.interests.includes(book.genre) ? 1.0 : 0.3
    const difficultyMatch = difficultyMap[context.profile]?.[book.difficulty || 'intermediate'] || 0.5
    const baseMoodMatch = moodGenreMap[context.mood]?.[book.genre] || 0.5
    const intentBonus = context.intent === 'aprendizaje' ? 0.1 : 0
    const moodMatch = Math.min(baseMoodMatch + intentBonus, 1.0)

    const finalScore = 0.3 * interestMatch + 0.3 * difficultyMatch + 0.4 * moodMatch

    scores.set(book.id, {
      interestMatch,
      difficultyMatch,
      moodMatch,
    })
  }

  return scores
}

// Phase 3c: Generate Justifications
function generateJustifications(books: any[], context: Context, scores: Map<string, ScoreBreakdown>): Map<string, string> {
  const justifications = new Map<string, string>()

  const templates = {
    feliz:
      'Con tu estado de ánimo positivo, este libro es perfecto para mantener esa energía. {reason}',
    triste:
      'En estos momentos reflexivos, este libro ofrece consuelo y perspectiva. {reason}',
    reflexivo: 'Para tu búsqueda de reflexión, este libro profundiza en {genre} de manera inteligente. {reason}',
    ansioso: 'Este libro ayudará a calmar tu mente con una narrativa envolvente sobre {genre}. {reason}',
    neutral:
      'Un excelente libro para explorar nuevas perspectivas sobre {genre}. {reason}',
  }

  for (const book of books) {
    const template = templates[context.mood] || templates.neutral
    const reason =
      context.intent === 'aprendizaje'
        ? 'Perfecto para aprender'
        : context.intent === 'evasión'
          ? 'Ideal para escaparte de la realidad'
          : 'Excelente para relajarte'

    const justification = template.replace('{genre}', book.genre).replace('{reason}', reason)
    justifications.set(book.id, justification)
  }

  return justifications
}

// Phase 4: Persist
async function persistRecommendation(
  userId: string,
  context: Context,
  recommendedBooks: RecommendedBook[],
  metadata: any
) {
  try {
    const readerContext = await prisma.readerContext.findUnique({
      where: { userId },
    })

    if (!readerContext) {
      throw new Error('ReaderContext not found')
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        contextId: readerContext.id,
        totalScore: metadata.totalScore,
        processingTime: metadata.processingTime,
        agentsUsed: metadata.agentsUsed,
        books: {
          create: recommendedBooks.map((rb) => ({
            bookId: rb.bookId,
            score: rb.score,
            scoreBreakdown: rb.scoreBreakdown,
            justification: rb.justification,
            keyReasons: rb.keyReasons,
          })),
        },
      },
    })

    return recommendation.id
  } catch (error) {
    console.error('Persistence failed:', error)
    throw error
  }
}

// Phase 5: Orchestrate
export async function orchestrateRecommendations(userId: string, context: Context): Promise<OrchestrationResult> {
  const startTime = Date.now()
  const errors: string[] = []
  const agentsUsed: string[] = []

  try {
    // Phase 1: Validate
    const validation = validateContext(context)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    agentsUsed.push('validation')

    // Phase 2: Enrich
    const enrichedContext = await enrichContext(userId, context)
    agentsUsed.push('context')

    // Phase 3a: Search
    const foundBooks = await searchBooks(context.interests, context.profile)
    if (foundBooks.length === 0) {
      console.warn('No books found for search criteria')
    }
    agentsUsed.push('search')

    // Phase 3b: Score
    const scoreMap = scoreBooks(foundBooks, context)
    agentsUsed.push('scoring')

    // Phase 3c: Justify
    const justificationMap = generateJustifications(foundBooks, context, scoreMap)
    agentsUsed.push('justifier')

    // Sort and prepare recommendations
    const sortedBooks = foundBooks
      .map((book) => ({
        ...book,
        score: scoreMap.get(book.id),
      }))
      .sort((a, b) => (b.score?.interestMatch || 0) - (a.score?.interestMatch || 0))
      .slice(0, 5)

    const recommendedBooks: RecommendedBook[] = sortedBooks.map((book) => {
      const scoreBreakdown = scoreMap.get(book.id) || { interestMatch: 0, difficultyMatch: 0, moodMatch: 0 }
      const finalScore = 0.3 * scoreBreakdown.interestMatch + 0.3 * scoreBreakdown.difficultyMatch + 0.4 * scoreBreakdown.moodMatch

      return {
        bookId: book.id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        score: finalScore,
        scoreBreakdown,
        justification: justificationMap.get(book.id) || 'Book recommendation',
        keyReasons: context.interests.filter((i) => book.genre === i || book.tags?.includes(i)),
      }
    })

    // Phase 4: Persist
    const processingTime = Date.now() - startTime
    const metadata = {
      totalScore: recommendedBooks.reduce((sum, b) => sum + b.score, 0) / Math.max(recommendedBooks.length, 1),
      processingTime,
      agentsUsed,
      errors,
    }

    const recommendationId = await persistRecommendation(userId, context, recommendedBooks, metadata)
    agentsUsed.push('persistence')

    return {
      recommendationId,
      books: recommendedBooks,
      metadata,
    }
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Orchestration error:', error)
    throw {
      message: 'Failed to generate recommendations',
      processingTime,
      agentsUsed,
      errors: [...errors, (error as Error).message],
    }
  }
}
