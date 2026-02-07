# Search Agent

## Overview

The Search Agent queries the book database and applies intelligent filtering to identify candidate books based on reader context. It uses multiple strategies: genre matching, difficulty alignment, interest-based search, and diversity filters.

**Agent ID**: `search-agent`
**Effort Level**: High (claude-opus-4-6)
**Type**: Data Retrieval

---

## System Prompt

```
You are the Search Agent for the book-advisor system,
a specialized agent for querying and filtering the book catalog.

Your role is to:
1. Build SQL queries based on reader context
2. Apply genre, difficulty, and tag filters
3. Execute full-text search for interests
4. Exclude previously read books
5. Ensure diversity in results
6. Return ranked candidate books for scoring

You DO NOT:
- Score books (that's Scoring Agent)
- Generate justifications (that's Justifier Agent)
- Persist data (that's Persistence Agent)

You ARE responsible for:
- Constructing efficient database queries
- Applying multiple filters intelligently
- Handling no-results gracefully
- Ensuring result diversity
- Optimizing for query performance
```

---

## Input Schema

```json
{
  "context": {
    "mood": "string",
    "profile": "string",
    "interests": ["string"],
    "intent": "string"
  },
  "enrichment": {
    "previousInterests": ["string"],
    "readBooks": ["book-id-1", "book-id-2"],
    "moodTrend": "string"
  },
  "limit": 50
}
```

---

## Execution Flow

```
INPUT (Enriched Context)
   ↓
[Step 1] Build Query Filters
   ├─ Map profile → difficulty level(s)
   ├─ Map interests → genres (multi-match)
   ├─ Build exclusion list (readBooks)
   └─ Set ordering by relevance
   ↓
[Step 2] Query Database
   ├─ Execute Prisma query with filters
   ├─ Full-text search on interests
   └─ Return up to limit results
   ↓
[Step 3] Apply Post-Filters
   ├─ Exclude readBooks
   ├─ Ensure genre diversity
   ├─ Balance difficulty levels
   └─ Apply custom ranking
   ↓
[Step 4] Rank Candidates
   ├─ Score by interest relevance
   ├─ Boost primary interests
   ├─ Sort by quality (tags, ratings)
   └─ Return top candidates
   ↓
[Step 5] Format Output
   ├─ Add matchReasons
   ├─ Include metadata
   └─ Return structured results
   ↓
OUTPUT (Candidate Books)
```

---

## Output Schema

```json
{
  "candidateBooks": [
    {
      "bookId": "string",
      "title": "string",
      "author": "string",
      "genre": "string",
      "difficulty": "beginner|intermediate|advanced",
      "synopsis": "string",
      "tags": ["string"],
      "matchReasons": [
        "Aligns with your interest in ficción",
        "Matches your advanced reading level",
        "Thematic fit with current mood"
      ]
    }
  ],
  "searchMetadata": {
    "totalCandidates": 45,
    "genreDistribution": {
      "ficción": 12,
      "historia": 8,
      "desarrollo": 10,
      "filosofía": 8,
      "ciencia": 7
    },
    "difficultyDistribution": {
      "beginner": 5,
      "intermediate": 20,
      "advanced": 20
    },
    "searchTime": 2150,
    "diversity": {
      "uniqueGenres": 5,
      "authorCount": 43
    }
  }
}
```

---

## Query Building Strategy

### Profile → Difficulty Mapping

```javascript
const profileToDifficulty = {
  "novato": ["beginner", "intermediate"],
  "intermedio": ["beginner", "intermediate", "advanced"],
  "avanzado": ["intermediate", "advanced"],
  "experto": ["advanced"]
};
```

### Interest → Genre Mapping

```javascript
const interestToGenre = {
  "ficción": ["ficción"],
  "desarrollo": ["desarrollo", "educación"],
  "historia": ["historia"],
  "filosofía": ["filosofía"],
  "ciencia": ["ciencia"],
  "romance": ["romance"],
  "misterio": ["misterio"],
  "fantasía": ["fantasía"],
  "poesía": ["poesía"]
};
```

### Mood → Genre Affinity

```javascript
const moodAffinity = {
  "feliz": {
    boost: ["romance", "poesía"],
    penalize: ["misterio", "oscuro"]
  },
  "triste": {
    boost: ["filosofía", "poesía", "historia"],
    penalize: []
  },
  "reflexivo": {
    boost: ["filosofía", "desarrollo", "historia"],
    penalize: []
  },
  "ansioso": {
    boost: ["misterio", "ciencia"],
    penalize: ["poesía", "lento"]
  },
  "neutral": {
    boost: [],
    penalize: []
  }
};
```

---

## Query Execution

### Primary Query (Prisma)

```javascript
const books = await prisma.book.findMany({
  where: {
    AND: [
      // Genre filter
      { genre: { in: selectedGenres } },

      // Difficulty filter
      { difficulty: { in: allowedDifficulties } },

      // Exclude previously read
      { id: { notIn: readBookIds } },

      // Optional: Full-text search
      { OR: interests.map(interest => ({
        OR: [
          { title: { search: interest } },
          { synopsis: { search: interest } },
          { tags: { hasSome: [interest] } }
        ]
      })) }
    ]
  },
  select: {
    id: true,
    title: true,
    author: true,
    genre: true,
    difficulty: true,
    synopsis: true,
    tags: true,
    publicationYear: true
  },
  take: limit,
  orderBy: { createdAt: 'desc' } // Or by custom ranking
});
```

### Post-Processing

```javascript
function postProcessResults(books, context, enrichment) {
  // 1. Exclude already read
  const filtered = books.filter(b => !enrichment.readBooks.includes(b.id));

  // 2. Add match reasons
  const withReasons = filtered.map(book => ({
    ...book,
    matchReasons: generateMatchReasons(book, context)
  }));

  // 3. Apply diversity filters
  const diverse = ensureDiversity(withReasons, {
    maxPerAuthor: 2,
    genreBalance: true,
    difficultyBalance: true
  });

  // 4. Rank by relevance
  return rankByRelevance(diverse, context);
}
```

---

## Diversity Algorithm

Ensure variety in recommendations:

```javascript
function ensureDiversity(books, { maxPerAuthor, genreBalance, difficultyBalance }) {
  const selected = [];
  const authorCounts = {};
  const genreCounts = {};
  const difficultyCounts = {};

  for (const book of books) {
    // Check author limit
    if ((authorCounts[book.author] || 0) >= maxPerAuthor) continue;

    // Check genre balance
    if (genreBalance && genreCounts[book.genre] >= 3) continue;

    // Check difficulty balance
    if (difficultyBalance && difficultyCounts[book.difficulty] >= 4) continue;

    selected.push(book);
    authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
    genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
    difficultyCounts[book.difficulty] = (difficultyCounts[book.difficulty] || 0) + 1;

    if (selected.length >= 50) break;
  }

  return selected;
}
```

---

## Match Reasons Generation

```javascript
function generateMatchReasons(book, context) {
  const reasons = [];

  // Interest match
  const matchedInterests = context.interests.filter(i =>
    book.genre.includes(i) || book.tags.includes(i)
  );
  if (matchedInterests.length > 0) {
    reasons.push(`Matches your interest in ${matchedInterests.join(', ')}`);
  }

  // Difficulty match
  const profileDifficulty = getProfileDifficulty(context.profile);
  if (book.difficulty === profileDifficulty) {
    reasons.push(`Perfect difficulty level for your ${context.profile} profile`);
  }

  // Mood alignment
  const moodGenres = getMoodAlignedGenres(context.mood);
  if (moodGenres.includes(book.genre)) {
    reasons.push(`Well-suited for your current ${context.mood} mood`);
  }

  // Intent alignment
  if (context.intent === "relax" && hasRelaxingTags(book.tags)) {
    reasons.push(`Recommended for relaxation and leisure reading`);
  } else if (context.intent === "aprendizaje" && hasLearningTags(book.tags)) {
    reasons.push(`Great for learning and personal development`);
  }

  return reasons;
}
```

---

## Error Handling

### No Results Found

```
Initial search returns 0 results
EXPAND search criteria:
1. Remove difficulty restrictions
2. Broaden to any genre
3. Query all books without filters
RETRY query
If still 0 results:
  → Return empty array
  → Log warning
  → Alert that catalog is too small
```

### Database Query Error

```
RETRY up to 2 times with exponential backoff [500ms, 2000ms]
FALLBACK: Execute simplified query
  - Single genre match only
  - No full-text search
  - Basic difficulty filter
If still fails:
  → Return empty array
  → Log error
  → Continue to scoring with empty list
```

### Timeout

```
Query execution exceeds 8000ms
RETURN partial results if available
FALLBACK: Use cached results from previous searches
If no cache:
  → Return empty array
  → Log warning
```

---

## Caching Strategy

```json
{
  "cache_key": "search:{interests}:{profile}:{mood}",
  "data": {
    "candidateBooks": [...],
    "timestamp": "ISO8601"
  },
  "ttl": 600
}
```

Cache hit rate should reduce database load for common search patterns.

---

## Example Execution

### Input

```json
{
  "context": {
    "mood": "reflexivo",
    "profile": "avanzado",
    "interests": ["filosofía", "desarrollo"],
    "intent": "aprendizaje"
  },
  "enrichment": {
    "previousInterests": ["historia"],
    "readBooks": ["book-1", "book-5", "book-12"],
    "moodTrend": "stable"
  },
  "limit": 50
}
```

### Processing

```
Step 1: Build Filters
Profile (avanzado) → difficulties: [intermediate, advanced]
Interests (filosofía, desarrollo) → genres: [filosofía, desarrollo, educación]
Mood (reflexivo) → boost: [filosofía, desarrollo, historia]
Exclude: [book-1, book-5, book-12]

Step 2: Execute Query
SELECT * FROM Book
WHERE genre IN ['filosofía', 'desarrollo', 'educación']
  AND difficulty IN ['intermediate', 'advanced']
  AND id NOT IN ['book-1', 'book-5', 'book-12']
LIMIT 50

Result: 45 books

Step 3: Post-Filter
Apply diversity: max 2 per author
Genre balance: spread across 5+ genres
Difficulty balance: mix intermediate and advanced

Step 4: Rank by Relevance
1. "Critique of Pure Reason" - Kant - filosofía - advanced
2. "A Brief History of Time" - Hawking - ciencia - advanced
3. "Thinking, Fast and Slow" - Kahneman - desarrollo - advanced
... (42 more)

Step 5: Generate Match Reasons
Book 1: ["Aligns with your interest in filosofía", "Perfect for your advanced level"]
Book 2: ["Interest in ciencia detected", "Advanced conceptual depth"]
```

### Response

```json
{
  "candidateBooks": [
    {
      "bookId": "book-101",
      "title": "Critique of Pure Reason",
      "author": "Immanuel Kant",
      "genre": "filosofía",
      "difficulty": "advanced",
      "synopsis": "A foundational work of philosophy exploring...",
      "tags": ["epistemología", "metafísica", "clásicos"],
      "matchReasons": [
        "Aligns with your interest in filosofía",
        "Perfect for your advanced reading level",
        "Well-suited for your current reflexivo mood"
      ]
    },
    {
      "bookId": "book-102",
      "title": "Thinking, Fast and Slow",
      "author": "Daniel Kahneman",
      "genre": "desarrollo",
      "difficulty": "advanced",
      "synopsis": "Nobel laureate explores decision-making...",
      "tags": ["psicología", "cognición", "biases"],
      "matchReasons": [
        "Matches your interest in desarrollo",
        "Recommended for learning and personal development",
        "Advanced cognitive insights for your profile"
      ]
    }
  ],
  "searchMetadata": {
    "totalCandidates": 45,
    "genreDistribution": {
      "filosofía": 15,
      "desarrollo": 18,
      "educación": 12
    },
    "difficultyDistribution": {
      "intermediate": 18,
      "advanced": 27
    },
    "searchTime": 2150,
    "diversity": {
      "uniqueGenres": 3,
      "authorCount": 44
    }
  }
}
```

---

## Monitoring

Track per request:

```json
{
  "requestId": "uuid",
  "metrics": {
    "queryTime": 2150,
    "resultsCount": 45,
    "cachedResult": false,
    "genresQueried": 3,
    "difficultyLevels": 2,
    "excludedCount": 3,
    "diversityScore": 0.92
  }
}
```

---

## Implementation Notes

1. **Database Indexes**: Ensure indexes on genre, difficulty, author
2. **Full-Text Search**: Enable PostgreSQL full-text search on title and synopsis
3. **Caching**: Cache genre distributions and popular searches
4. **Performance**: Target 2-3 second response time for typical queries
5. **Pagination**: Support cursor-based pagination for large result sets

