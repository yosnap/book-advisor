# Database Schema - Prisma + Neon

Complete schema definition for the book-advisor recommendation system using Prisma ORM and Neon PostgreSQL.

---

## Overview

The schema is organized into 4 logical groups:

1. **Core Entities** (Recommendation System)
2. **Admin & User Management**
3. **Audit & Logging**
4. **Caching & Analytics**

---

## Core Entities

### Book

Catalog of available books.

```prisma
model Book {
  id              String   @id @default(cuid())
  title           String   @unique
  author          String
  genre           String   @db.VarChar(100)
  synopsis        String   @db.Text
  difficulty      String?  @default("intermediate") // "beginner", "intermediate", "advanced"
  publicationYear Int?
  tags            String[] @default([])
}
```

**Fields**:
- `id`: Unique book identifier (CUID)
- `title`: Book title (unique)
- `author`: Author name
- `genre`: Primary genre (indexed for filtering)
- `synopsis`: Full book description
- `difficulty`: Reading difficulty level
- `publicationYear`: Year of publication
- `tags`: Array of additional tags for categorization

**Indexes**:
- `genre` - For genre-based filtering
- `author` - For author searches
- Full-text search on title + synopsis

**Relations**:
- Many-to-many with `Recommendation` via `RecommendationBook`

---

### ReaderContext

User context and preferences for personalized recommendations.

```prisma
model ReaderContext {
  id               String   @id @default(cuid())
  userId           String   @unique
  mood             String   // "feliz", "triste", "reflexivo", "ansioso", "neutral"
  readerProfile    String   // "novato", "intermedio", "avanzado", "experto"
  interests        String[] @default([])
  intent           String   // "relax", "aprendizaje", "evasión"
  preferences      Json?
  previousMoods    String[] @default([])
  readBooks        String[] @default([])
}
```

**Fields**:
- `userId`: External user identifier
- `mood`: Current emotional state
- `readerProfile`: Reader experience level
- `interests`: Array of interest tags
- `intent`: Reading purpose/intention
- `preferences`: JSON for flexible preference storage
- `previousMoods`: Historical mood data
- `readBooks`: List of previously read book IDs

**Indexes**:
- `userId` (unique) - Fast user lookup
- `mood` - For mood-based filtering
- `readerProfile` - For profile filtering

**Relations**:
- One-to-many with `Recommendation`

---

### Recommendation

Generated recommendations for a reader.

```prisma
model Recommendation {
  id               String   @id @default(cuid())
  contextId        String
  context          ReaderContext @relation(...)
  books            RecommendationBook[]
  totalScore       Float?   @default(0.0)
  processingTime   Int?
  agentsUsed       String[] @default([])
  errors           String[] @default([])
  feedback         String?
  feedbackScore    Int?
}
```

**Fields**:
- `contextId`: Reference to reader context
- `totalScore`: Average score of all recommendations
- `processingTime`: How long the recommendation took (ms)
- `agentsUsed`: Which agents were involved
- `errors`: Any errors encountered
- `feedback`: User feedback on recommendations
- `feedbackScore`: 1-5 rating from user

**Relations**:
- Many-to-one with `ReaderContext` (onDelete: Cascade)
- One-to-many with `RecommendationBook`

---

### RecommendationBook

Junction table linking recommendations to books.

```prisma
model RecommendationBook {
  id               String   @id @default(cuid())
  recommendationId String
  recommendation   Recommendation @relation(...)
  bookId           String
  book             Book @relation(...)
  score            Float    @default(0.0)
  scoreBreakdown   Json?
  justification    String   @db.Text
  keyReasons       String[] @default([])
  rank             Int      @default(0)
}
```

**Fields**:
- `score`: Relevance score (0-1)
- `scoreBreakdown`: Detailed score breakdown (JSON)
  ```json
  {
    "moodMatch": 0.9,
    "profileMatch": 0.8,
    "interestMatch": 0.85,
    "intentMatch": 0.75
  }
  ```
- `justification`: Why this book was recommended
- `keyReasons`: 3-5 bullet points explaining the recommendation
- `rank`: Position in the recommendation list

**Constraints**:
- Unique combination of (recommendationId, bookId)

---

## Admin & User Management

### AdminUser

Admin users who manage the book catalog and view statistics.

```prisma
model AdminUser {
  id               String   @id @default(cuid())
  email            String   @unique
  name             String
  hashedPassword   String
  role             String   @default("editor")
  canCreateBooks   Boolean  @default(true)
  canEditBooks     Boolean  @default(true)
  canDeleteBooks   Boolean  @default(false)
  canViewStats     Boolean  @default(true)
}
```

**Roles**:
- `viewer` - Read-only access to stats
- `editor` - Can create/edit books (default)
- `admin` - Full access

---

## Audit & Logging

### AuditLog

Complete audit trail of all operations.

```prisma
model AuditLog {
  id               String   @id @default(cuid())
  entityType       String   // "book", "recommendation", "admin_user"
  entityId         String
  action           String   // "created", "updated", "deleted", "accessed"
  userId           String?
  adminUserId      String?
  oldData           Json?
  newData           Json?
  ipAddress        String?
  userAgent        String?
  createdAt        DateTime @default(now())
}
```

**Tracks**:
- All create/update/delete operations
- Who performed the action (userId or adminUserId)
- Before/after data (oldData, newData)
- Client information (IP, user agent)

**Indexes**:
- `entityType` + `entityId` - Find all changes for an entity
- `userId` - Find all actions by a user
- `createdAt` - Timeline queries

---

### Cache

Cache for frequently accessed data.

```prisma
model Cache {
  id               String   @id
  key              String   @unique
  value            Json
  expiresAt        DateTime
}
```

**Usage**:
- Cache book catalog queries
- Cache user preferences
- Cache recommendation results

---

### UserSession

Track user sessions across channels.

```prisma
model UserSession {
  id               String   @id @default(cuid())
  userId           String
  channel          String   // "web", "telegram", "mobile"
  sessionToken     String   @unique
  expiresAt        DateTime
  lastActivityAt   DateTime @updatedAt
}
```

**Channels**:
- `web` - Web browser
- `telegram` - Telegram bot
- `mobile` - Mobile app (future)

---

## Analytics

### RecommendationMetric

Track how users interact with recommendations.

```prisma
model RecommendationMetric {
  id               String   @id @default(cuid())
  recommendationId String
  userAccepted     Boolean?
  booksClicked     String[] @default([])
  booksPurchased   String[] @default([])
  viewedAt         DateTime?
  clickedAt        DateTime?
  purchasedAt      DateTime?
}
```

**Metrics**:
- `userAccepted` - Whether user accepted the recommendation
- `booksClicked` - Which books user clicked
- `booksPurchased` - Which books user bought (from integrations)

---

### DailyStats

Aggregate statistics for dashboards.

```prisma
model DailyStats {
  id                  String   @id @default(cuid())
  date                DateTime @unique
  totalRecommendations Int    @default(0)
  totalReadersActive  Int     @default(0)
  avgProcessingTime   Float   @default(0.0)
  topGenres           Json    // { "ficción": 45, "historia": 32, ... }
  avgScore            Float   @default(0.0)
  acceptanceRate      Float   @default(0.0)
}
```

**Aggregates**:
- Total recommendations per day
- Active readers
- Average processing time
- Top genres
- Average score and acceptance rate

---

## Setup Instructions

### 1. Install Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Create .env file

Copy `.env.example` to `.env.local` and update:

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### 3. Run Migration

First migration creates all tables:

```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. (Optional) Seed Database

```bash
npx prisma db seed
```

---

## Usage Examples

### Create a Book

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const book = await prisma.book.create({
  data: {
    title: '1984',
    author: 'George Orwell',
    genre: 'ficción',
    synopsis: '...',
    difficulty: 'advanced',
    tags: ['distopia', 'política', 'futuro'],
  },
})
```

### Create Reader Context

```typescript
const context = await prisma.readerContext.create({
  data: {
    userId: 'user-123',
    mood: 'triste',
    readerProfile: 'avanzado',
    interests: ['ficción', 'desarrollo personal'],
    intent: 'evasión',
  },
})
```

### Generate Recommendation

```typescript
const recommendation = await prisma.recommendation.create({
  data: {
    contextId: context.id,
    totalScore: 0.92,
    processingTime: 2400,
    agentsUsed: ['context', 'search', 'scoring', 'justifier', 'persistence'],
    books: {
      create: [
        {
          bookId: book1.id,
          score: 0.92,
          justification: 'Given your current mood...',
          keyReasons: ['Reason 1', 'Reason 2'],
          rank: 1,
        },
      ],
    },
  },
  include: {
    books: {
      include: { book: true },
    },
  },
})
```

### Query Recommendations

```typescript
// Get recent recommendations
const recent = await prisma.recommendation.findMany({
  where: {
    contextId: contextId,
  },
  include: {
    books: {
      include: { book: true },
      orderBy: { rank: 'asc' },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
})

// Get top books by score
const topBooks = await prisma.recommendationBook.findMany({
  where: {
    score: { gte: 0.8 },
  },
  include: { book: true },
  orderBy: { score: 'desc' },
  take: 5,
})
```

---

## Migrations

Manage schema changes with migrations:

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# View migration status
npx prisma migrate status

# Resolve migration issues
npx prisma migrate resolve --rolled-back migration_name
```

---

## Performance Optimization

### Indexes

Already included in schema:
- Book: genre, author, full-text search
- ReaderContext: userId, mood, readerProfile
- Recommendation: contextId, createdAt
- AuditLog: entityType, userId, createdAt

### Queries

For best performance:
- Always use `include()` to fetch relations in one query
- Use `where` filters before fetching large datasets
- Paginate results with `take` and `skip`
- Use indexes for common filter patterns

### Connection Pooling

Neon provides connection pooling by default. Configure in Prisma:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Backup & Recovery

Neon handles backups automatically:
- Daily automatic backups (30 days retention)
- Point-in-time recovery available
- See [Neon Backups](https://neon.tech/docs/manage/backups)

---

## Testing

For testing, use a separate database or reset after tests:

```bash
# Reset database (CAREFUL!)
npx prisma migrate reset

# Seed test data
npx prisma db seed
```

---

## Additional Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Neon + Prisma Guide](https://neon.tech/docs/guides/prisma)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
