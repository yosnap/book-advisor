# Persistence Agent

## Overview

The Persistence Agent handles all database persistence for recommendations with ACID guarantees. It manages transactions to ensure data consistency and handles concurrent writes safely using database-level locking.

**Agent ID**: `persistence-agent`
**Effort Level**: High (claude-opus-4-6)
**Type**: Persistence/Transaction Management

---

## System Prompt

```
You are the Persistence Agent for the book-advisor system,
a specialized agent for safely persisting recommendations to database.

Your role is to:
1. Begin ACID transactions
2. Upsert ReaderContext with historical data
3. Create Recommendation records
4. Create RecommendationBook junction records
5. Manage relationships and constraints
6. Commit or rollback transactions
7. Return confirmation with IDs

You DO NOT:
- Modify book data directly
- Score books (that's Scoring Agent)
- Generate justifications (that's Justifier Agent)
- Query recommendations (read-only for audit)

You ARE responsible for:
- Transactional integrity (all or nothing)
- Handling concurrent writes
- Detecting and recovering from conflicts
- Maintaining referential integrity
- Logging all operations for audit
- Providing confirmation IDs for tracking
```

---

## Data Model

### ReaderContext

```prisma
model ReaderContext {
  id               String   @id @default(cuid())
  userId           String   @unique
  mood             String
  readerProfile    String
  interests        String[]
  intent           String
  preferences      Json?
  previousMoods    String[]
  readBooks        String[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Recommendation

```prisma
model Recommendation {
  id               String   @id @default(cuid())
  contextId        String
  books            RecommendationBook[]
  totalScore       Float?   @default(0.0)
  processingTime   Int?
  agentsUsed       String[]
  errors           String[]
  feedback         String?
  feedbackScore    Int?
  createdAt        DateTime @default(now())
}
```

### RecommendationBook

```prisma
model RecommendationBook {
  id               String   @id @default(cuid())
  recommendationId String
  bookId           String
  score            Float    @default(0.0)
  scoreBreakdown   Json?
  justification    String
  keyReasons       String[]
  rank             Int      @default(0)
  createdAt        DateTime @default(now())
}
```

---

## Transaction Flow

```
INPUT (Justified Books + Context)
   ↓
[Step 1] Begin Transaction
   ├─ START TRANSACTION ISOLATION LEVEL SERIALIZABLE
   ├─ Set timeout to 5000ms
   └─ Initialize rollback handler
   ↓
[Step 2] Upsert ReaderContext
   ├─ Check if userId exists
   ├─ If exists: UPDATE with new mood, interests, etc
   ├─ If not: CREATE new ReaderContext
   ├─ Append current mood to previousMoods
   └─ Update updatedAt timestamp
   ↓
[Step 3] Create Recommendation
   ├─ INSERT new Recommendation record
   ├─ Set contextId to ReaderContext.id
   ├─ Calculate totalScore from books
   ├─ Store processingTime and agentsUsed
   └─ Get recommendationId from DB
   ↓
[Step 4] Create RecommendationBooks
   ├─ LOOP through each justified book
   ├─ INSERT RecommendationBook record
   ├─ Link to Recommendation and Book
   ├─ Store score, justification, reasons
   └─ Set rank from loop index
   ↓
[Step 5] Commit Transaction
   ├─ COMMIT all changes
   ├─ Verify all inserts completed
   └─ Release locks
   ↓
[Step 6] Return Confirmation
   ├─ Format response with IDs
   ├─ Include record counts
   └─ Return to orchestrator
   ↓
OUTPUT (Persisted Recommendation)
```

---

## Input Schema

```json
{
  "userId": "user-123",
  "context": {
    "mood": "reflexivo",
    "profile": "avanzado",
    "interests": ["filosofía", "desarrollo"],
    "intent": "aprendizaje"
  },
  "justifiedBooks": [
    {
      "bookId": "book-101",
      "score": 0.94,
      "justification": "...",
      "keyReasons": ["...", "..."]
    }
  ],
  "metadata": {
    "processingTime": 8500,
    "agentsUsed": ["context", "search", "scoring", "justifier"],
    "requestId": "req-456"
  }
}
```

---

## Output Schema

```json
{
  "recommendationId": "rec-789",
  "contextId": "ctx-456",
  "bookCount": 5,
  "persistenceStatus": "success",
  "timestamp": "2024-12-28T15:45:30Z",
  "persistenceMetadata": {
    "transactionId": "txn-123",
    "persistenceTime": 1850,
    "recordsCreated": 6,
    "booksLinked": 5
  }
}
```

---

## Detailed Steps

### Step 1: Begin Transaction

```sql
-- PostgreSQL transaction
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET statement_timeout = 5000;
```

**Key points**:
- SERIALIZABLE isolation prevents dirty reads, non-repeatable reads, and phantom reads
- 5000ms timeout prevents long-running transactions
- All steps must complete within transaction or entire operation rolls back

### Step 2: Upsert ReaderContext

```javascript
// Prisma upsert
const readerContext = await prisma.readerContext.upsert({
  where: { userId },
  create: {
    userId,
    mood: context.mood,
    readerProfile: context.profile,
    interests: context.interests,
    intent: context.intent,
    previousMoods: [context.mood],
    readBooks: []
  },
  update: {
    mood: context.mood,
    readerProfile: context.profile,
    interests: context.interests,
    intent: context.intent,
    previousMoods: {
      push: context.mood
    },
    updatedAt: new Date(),
    lastAccessedAt: new Date()
  }
});
```

**Handling**:
- CREATE if user is new (first recommendation)
- UPDATE if user exists (common case)
- Append mood to history (keep last 20 for trends)
- Prune previousMoods if > 20 items

### Step 3: Create Recommendation

```javascript
// Calculate aggregate score
const totalScore = justifiedBooks.reduce((sum, book) =>
  sum + book.score, 0) / justifiedBooks.length;

const recommendation = await prisma.recommendation.create({
  data: {
    contextId: readerContext.id,
    totalScore: Math.round(totalScore * 100) / 100,
    processingTime: metadata.processingTime,
    agentsUsed: metadata.agentsUsed,
    errors: metadata.errors || []
  }
});
```

**Validation**:
- Ensure contextId exists (foreign key)
- Validate totalScore is 0-1
- Store processing time for analytics

### Step 4: Create RecommendationBooks

```javascript
// Batch create junction records
const recommendationBooks = await prisma.recommendationBook.createMany({
  data: justifiedBooks.map((book, index) => ({
    recommendationId: recommendation.id,
    bookId: book.bookId,
    score: Math.round(book.score * 100) / 100,
    scoreBreakdown: book.scoreBreakdown || null,
    justification: book.justification,
    keyReasons: book.keyReasons || [],
    rank: index + 1
  }))
});
```

**Constraints**:
- UNIQUE(recommendationId, bookId) - prevent duplicates
- Foreign key: bookId must exist in Book table
- Foreign key: recommendationId must exist in Recommendation table
- rank auto-incremented from position

### Step 5: Commit Transaction

```javascript
// Automatic in Prisma (or explicit if using raw SQL)
// If any error occurs, transaction rolls back automatically
```

**Guarantees**:
- All or nothing (ACID)
- No partial data persisted
- Concurrent transactions serialized

### Step 6: Return Confirmation

```javascript
return {
  recommendationId: recommendation.id,
  contextId: readerContext.id,
  bookCount: justifiedBooks.length,
  persistenceStatus: "success",
  timestamp: new Date().toISOString(),
  persistenceMetadata: {
    transactionId: transactionId,
    persistenceTime: endTime - startTime,
    recordsCreated: 2, // ReaderContext + Recommendation
    booksLinked: justifiedBooks.length
  }
};
```

---

## Concurrency & Locking

### Serializable Isolation

Using SERIALIZABLE isolation level prevents all anomalies:

```
Situation 1: Concurrent updates to same user
User A updates mood → mood = "feliz"
User B updates mood → mood = "triste" (same user)
Result: SERIALIZABLE ensures order is enforced
One transaction commits first, other retries/queues
```

### Deadlock Handling

```javascript
async function persistWithRetry(data, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await persistRecommendation(data);
    } catch (error) {
      if (error.code === 'P2034') { // Deadlock detected
        const backoff = [100, 500, 2000][attempt];
        await sleep(backoff);
        continue;
      }
      throw error; // Non-deadlock errors propagate
    }
  }
  throw new Error('Max retries exceeded due to deadlock');
}
```

---

## Error Scenarios

### Transaction Start Failed

```
ERROR: Cannot begin transaction
REASON: Database connection lost / unavailable
ACTION: RETRY entire persistence with exponential backoff
        [100ms, 500ms, 2000ms]
        If all fail: return error to Orchestrator
        Orchestrator will async retry later
```

### Constraint Violation

```
ERROR: UNIQUE constraint violated
REASON: Duplicate (recommendationId, bookId)
ACTION: ROLLBACK entire transaction
        INSPECT data structure
        Log error details
        RETURN error to Orchestrator
        Do NOT retry (would fail again)
```

### Deadlock Detected

```
ERROR: Serialization conflict (deadlock)
REASON: Concurrent transaction on same records
ACTION: ROLLBACK transaction
        WAIT with exponential backoff [100ms, 500ms]
        RETRY entire persistence
        Maximum 2 retries
        If still fails: return error to Orchestrator
```

### Timeout Exceeded

```
ERROR: Statement timeout (> 5000ms)
REASON: Transaction taking too long
ACTION: ROLLBACK (automatic)
        Log timeout details
        RETRY once with longer timeout [10000ms]
        If timeout again: return error to Orchestrator
```

### Persistence Failed (Critical)

```
ERROR: Multiple failures despite retries
REASON: Database unavailable or corrupted
ACTION: ROLLBACK transaction
        DO NOT retry immediately
        RETURN error to Orchestrator
        Set failurePolicy = "async_retry_with_logging"
        Log full details for investigation
        Schedule async retry in 5 minutes
        Alert operations team
```

---

## Audit & Logging

### Log Entry Format

```json
{
  "timestamp": "2024-12-28T15:45:30Z",
  "action": "RECOMMENDATION_PERSISTED",
  "recommendationId": "rec-789",
  "userId": "user-123",
  "bookCount": 5,
  "transactionId": "txn-123",
  "processingTime": 1850,
  "status": "success"
}
```

### Audit Trail

Use AuditLog table to track:

```javascript
await prisma.auditLog.create({
  data: {
    entityType: "recommendation",
    entityId: recommendation.id,
    action: "created",
    userId: userId,
    newData: {
      contextId: readerContext.id,
      bookCount: justifiedBooks.length,
      totalScore: totalScore
    }
  }
});
```

---

## Async Retry Strategy

If persistence fails in production:

```javascript
// Schedule async retry
const failedPersistence = {
  userId: data.userId,
  context: data.context,
  justifiedBooks: data.justifiedBooks,
  metadata: data.metadata,
  attemptCount: 1,
  nextRetry: new Date(Date.now() + 5 * 60000) // 5 minutes
};

await queue.enqueue({
  type: "ASYNC_PERSISTENCE_RETRY",
  data: failedPersistence,
  schedule: failedPersistence.nextRetry
});
```

Retry schedule:
- 1st attempt: Immediate
- 2nd attempt: 5 minutes later
- 3rd attempt: 30 minutes later
- 4th attempt: 2 hours later
- Give up after 24 hours

---

## Example Execution

### Input

```json
{
  "userId": "user-123",
  "context": {
    "mood": "reflexivo",
    "profile": "avanzado",
    "interests": ["filosofía", "desarrollo"],
    "intent": "aprendizaje"
  },
  "justifiedBooks": [
    {
      "bookId": "book-101",
      "score": 0.94,
      "justification": "...",
      "keyReasons": ["Merges philosophy and history", "Advanced depth"]
    }
  ]
}
```

### Processing

```
Step 1: BEGIN TRANSACTION
✓ Transaction started
✓ Isolation: SERIALIZABLE
✓ Timeout: 5000ms

Step 2: UPSERT ReaderContext
✓ User user-123 found
✓ UPDATE with new mood: reflexivo
✓ Append mood to previousMoods: [..., reflexivo]
✓ contextId = ctx-456

Step 3: CREATE Recommendation
✓ INSERT new Recommendation
✓ totalScore = 0.94
✓ processingTime = 8500
✓ agentsUsed = [context, search, scoring, justifier]
✓ recommendationId = rec-789

Step 4: CREATE RecommendationBooks
✓ INSERT RecommendationBook for book-101
✓ rank = 1
✓ 1 book linked

Step 5: COMMIT TRANSACTION
✓ All changes committed
✓ Locks released

Step 6: RETURN CONFIRMATION
✓ recommendationId: rec-789
✓ bookCount: 1
✓ persistenceStatus: success
✓ persistenceTime: 1850ms
```

### Output

```json
{
  "recommendationId": "rec-789",
  "contextId": "ctx-456",
  "bookCount": 1,
  "persistenceStatus": "success",
  "timestamp": "2024-12-28T15:45:30Z",
  "persistenceMetadata": {
    "transactionId": "txn-123",
    "persistenceTime": 1850,
    "recordsCreated": 2,
    "booksLinked": 1
  }
}
```

---

## Monitoring

Track per request:

```json
{
  "requestId": "req-456",
  "metrics": {
    "transactionSuccess": true,
    "persistenceTime": 1850,
    "recordsCreated": 2,
    "booksLinked": 5,
    "retryCount": 0,
    "deadlockDetected": false,
    "rollbackCount": 0
  }
}
```

---

## Implementation Notes

1. **Connection Pool**: Use connection pooling (10-20 connections)
2. **Transaction Isolation**: Always use SERIALIZABLE for recommendation data
3. **Timeout Management**: Set statement timeout to 5000ms
4. **Batch Operations**: Use createMany for multiple RecommendationBooks
5. **Error Logging**: Log full stack trace and context for every error
6. **Monitoring**: Track transaction success rate (target: > 99%)

