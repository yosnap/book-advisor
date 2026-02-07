import { prisma } from './db'
import { Context, Profile, Mood, Intent } from './validation'

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
  synopsis: string
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

// --- Scoring Configuration ---

const SCORE_WEIGHTS = { interest: 0.35, difficulty: 0.25, mood: 0.40 }

const difficultyMap: Record<Profile, Record<string, number>> = {
  novato: { beginner: 1.0, intermediate: 0.6, advanced: 0.2 },
  intermedio: { beginner: 0.6, intermediate: 1.0, advanced: 0.5 },
  avanzado: { beginner: 0.3, intermediate: 0.7, advanced: 1.0 },
  experto: { beginner: 0.1, intermediate: 0.5, advanced: 1.0 },
}

const moodGenreAffinity: Record<Mood, Record<string, number>> = {
  feliz: {
    ficción: 0.85, romance: 0.9, fantasía: 0.85, aventura: 0.9, poesía: 0.7,
    humor: 0.95, ciencia: 0.6, historia: 0.5, filosofía: 0.4, desarrollo: 0.5,
    misterio: 0.6, ensayo: 0.4, política: 0.3,
  },
  triste: {
    ficción: 0.7, romance: 0.5, fantasía: 0.6, poesía: 0.85, filosofía: 0.8,
    historia: 0.65, desarrollo: 0.75, misterio: 0.5, ensayo: 0.7, ciencia: 0.5,
    aventura: 0.4, humor: 0.3, política: 0.4,
  },
  reflexivo: {
    filosofía: 0.95, ensayo: 0.9, historia: 0.85, ciencia: 0.8, desarrollo: 0.75,
    ficción: 0.65, poesía: 0.8, política: 0.7, misterio: 0.6,
    romance: 0.3, fantasía: 0.4, aventura: 0.4, humor: 0.3,
  },
  ansioso: {
    desarrollo: 0.85, ficción: 0.6, fantasía: 0.7, aventura: 0.65, romance: 0.5,
    humor: 0.7, ciencia: 0.5, poesía: 0.6, misterio: 0.4,
    filosofía: 0.3, historia: 0.4, ensayo: 0.4, política: 0.3,
  },
  neutral: {
    ficción: 0.7, historia: 0.7, ciencia: 0.7, filosofía: 0.65, desarrollo: 0.65,
    ensayo: 0.65, romance: 0.6, fantasía: 0.65, aventura: 0.65, misterio: 0.65,
    poesía: 0.6, humor: 0.6, política: 0.55,
  },
}

const intentBonus: Record<Intent, Record<string, number>> = {
  aprendizaje: {
    ciencia: 0.15, historia: 0.15, filosofía: 0.12, ensayo: 0.12,
    desarrollo: 0.1, política: 0.1,
  },
  evasión: {
    ficción: 0.15, fantasía: 0.15, aventura: 0.12, romance: 0.1,
    misterio: 0.1, humor: 0.1,
  },
  relax: {
    romance: 0.12, poesía: 0.12, ficción: 0.1, fantasía: 0.1,
    humor: 0.1, aventura: 0.08,
  },
}

// Tag affinity: which tags resonate with which mood/intent combinations
const moodTagAffinity: Record<Mood, string[]> = {
  feliz: ['aventura', 'humor', 'amor', 'épica', 'sueños', 'fantasía', 'familia', 'realismo mágico'],
  triste: ['psicología', 'moral', 'existencialismo', 'muerte', 'soledad', 'tragedia', 'filosofía', 'humanidad'],
  reflexivo: ['filosofía', 'existencialismo', 'política', 'ética', 'psicología', 'sociedad', 'ciencia', 'cosmos'],
  ansioso: ['desarrollo', 'autoayuda', 'productividad', 'creatividad', 'fantasía', 'humor', 'aventura'],
  neutral: ['clásico', 'historia', 'ciencia', 'cultura', 'sociedad', 'naturaleza', 'ensayo'],
}

// --- Phase 1: Validate ---

export function validateContext(context: Context): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!context.mood) errors.push('Mood is required')
  if (!context.profile) errors.push('Profile is required')
  if (!context.intent) errors.push('Intent is required')
  if (context.interests.length === 0) errors.push('At least one interest is required')
  return { valid: errors.length === 0, errors }
}

// --- Phase 2: Enrich Context ---

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
    return null
  }
}

// --- Phase 3a: Search Books ---

export async function searchBooks(interests: string[], _profile: Profile): Promise<any[]> {
  try {
    // Broader search: match genres, tags, or related content
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

// --- Phase 3b: Score Books ---

function scoreBook(book: any, context: Context): { score: number; breakdown: ScoreBreakdown; tagMatches: string[] } {
  // 1. Interest match: genre directly in interests = high, tag overlap = medium
  const genreMatch = context.interests.some(
    (i) => i.toLowerCase() === book.genre.toLowerCase()
  ) ? 1.0 : 0.0
  const tagOverlap = book.tags?.filter((t: string) =>
    context.interests.some((i) => i.toLowerCase() === t.toLowerCase())
  ) || []
  const tagScore = Math.min(tagOverlap.length * 0.3, 0.8)
  const interestMatch = Math.max(genreMatch, tagScore)

  // 2. Difficulty match
  const difficultyMatch = difficultyMap[context.profile]?.[book.difficulty || 'intermediate'] || 0.5

  // 3. Mood match: base genre affinity + tag affinity + intent bonus
  const genreKey = book.genre.toLowerCase()
  const baseMoodScore = moodGenreAffinity[context.mood]?.[genreKey] || 0.5

  // Tag affinity bonus: how many of the book's tags resonate with the mood
  const affineTags = moodTagAffinity[context.mood] || []
  const matchingTags = book.tags?.filter((t: string) =>
    affineTags.some((at) => t.toLowerCase().includes(at.toLowerCase()) || at.toLowerCase().includes(t.toLowerCase()))
  ) || []
  const tagAffinityBonus = Math.min(matchingTags.length * 0.06, 0.18)

  // Intent bonus for specific genres
  const genreIntentBonus = intentBonus[context.intent]?.[genreKey] || 0
  const moodMatch = Math.min(baseMoodScore + tagAffinityBonus + genreIntentBonus, 1.0)

  // Final weighted score
  const score = SCORE_WEIGHTS.interest * interestMatch +
    SCORE_WEIGHTS.difficulty * difficultyMatch +
    SCORE_WEIGHTS.mood * moodMatch

  return {
    score,
    breakdown: { interestMatch, difficultyMatch, moodMatch },
    tagMatches: [...tagOverlap, ...matchingTags.filter((t: string) => !tagOverlap.includes(t))],
  }
}

export function scoreAndRankBooks(books: any[], context: Context): Array<{
  book: any
  score: number
  breakdown: ScoreBreakdown
  tagMatches: string[]
}> {
  const scored = books.map((book) => {
    const { score, breakdown, tagMatches } = scoreBook(book, context)
    return { book, score, breakdown, tagMatches }
  })

  // Sort by score descending, then by tag match count as tiebreaker
  scored.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.01) return b.score - a.score
    return b.tagMatches.length - a.tagMatches.length
  })

  // Ensure genre diversity: no more than 2 books of the same genre in top 5
  const result: typeof scored = []
  const genreCount: Record<string, number> = {}
  for (const item of scored) {
    const g = item.book.genre.toLowerCase()
    if ((genreCount[g] || 0) < 2) {
      result.push(item)
      genreCount[g] = (genreCount[g] || 0) + 1
    }
    if (result.length >= 5) break
  }

  return result
}

// --- Phase 3c: Fallback Justification (used when n8n/Haiku is unavailable) ---

// Placeholder justification for local fallback only.
// The primary justification engine is Haiku via n8n.
function generateFallbackJustification(
  book: any,
  _context: Context,
  _breakdown: ScoreBreakdown,
  tagMatches: string[]
): string {
  const synopsis = book.synopsis || ''
  const tags = [...new Set(tagMatches)].slice(0, 3)
  const tagStr = tags.length > 0 ? ` Temas: ${tags.join(', ')}.` : ''
  return `${synopsis}${tagStr}`
}

function buildKeyReasons(
  book: any,
  context: Context,
  breakdown: ScoreBreakdown,
  tagMatches: string[]
): string[] {
  const reasons: string[] = []

  if (breakdown.interestMatch >= 0.8) {
    reasons.push(`Género ${book.genre} en tus intereses`)
  }
  if (breakdown.moodMatch >= 0.7) {
    reasons.push(`Alta afinidad con tu estado de ánimo (${context.mood})`)
  }
  if (breakdown.difficultyMatch >= 0.8) {
    reasons.push(`Nivel adecuado para perfil ${context.profile}`)
  }
  if (tagMatches.length > 0) {
    const tags = [...new Set(tagMatches)].slice(0, 2)
    reasons.push(`Temáticas afines: ${tags.join(', ')}`)
  }
  if (book.publicationYear) {
    if (book.publicationYear < 1900) {
      reasons.push('Obra clásica de referencia')
    } else if (book.publicationYear > 2000) {
      reasons.push('Perspectiva contemporánea')
    }
  }

  return reasons.length > 0 ? reasons : [`Recomendado para ${context.intent}`]
}

// --- Phase 4: Persist ---

async function persistRecommendation(
  userId: string,
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
            book: { connect: { id: rb.bookId } },
            score: rb.score,
            scoreBreakdown: rb.scoreBreakdown as any,
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

// --- Phase 5: Orchestrate ---

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
    await enrichContext(userId, context)
    agentsUsed.push('context')

    // Phase 3a: Search
    const foundBooks = await searchBooks(context.interests, context.profile)
    if (foundBooks.length === 0) {
      console.warn('No books found for search criteria')
    }
    agentsUsed.push('search')

    // Phase 3b: Score and rank with diversity
    const rankedBooks = scoreAndRankBooks(foundBooks, context)
    agentsUsed.push('scoring')

    // Phase 3c: Generate fallback justifications (real justifications come from Haiku via n8n)
    const recommendedBooks: RecommendedBook[] = rankedBooks.map(({ book, score, breakdown, tagMatches }) => ({
      bookId: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      synopsis: book.synopsis || '',
      score,
      scoreBreakdown: breakdown,
      justification: generateFallbackJustification(book, context, breakdown, tagMatches),
      keyReasons: buildKeyReasons(book, context, breakdown, tagMatches),
    }))
    agentsUsed.push('justifier')

    // Phase 4: Persist
    const processingTime = Date.now() - startTime
    const metadata = {
      totalScore: recommendedBooks.reduce((sum, b) => sum + b.score, 0) / Math.max(recommendedBooks.length, 1),
      processingTime,
      agentsUsed,
      errors,
    }

    const recommendationId = await persistRecommendation(userId, recommendedBooks, metadata)
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
