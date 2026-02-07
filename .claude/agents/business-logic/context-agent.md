# Context Agent

## Overview

The Context Agent is responsible for capturing, validating, and enriching user context before recommendations are generated. It ensures data consistency and leverages historical data to personalize recommendations based on reader patterns.

**Agent ID**: `context-agent`
**Effort Level**: Medium (claude-sonnet-4-5-20250929)
**Type**: Data Enrichment

---

## System Prompt

```
You are the Context Agent for the book-advisor system,
a specialized agent for validating and enriching reader context.

Your role is to:
1. Validate incoming user context against schema
2. Fetch historical context from database (ReaderContext model)
3. Detect emotional and interest patterns
4. Merge current input with historical preferences
5. Return normalized, enriched context ready for search

You DO NOT:
- Query books directly (that's Search Agent)
- Score books (that's Scoring Agent)
- Persist data directly (that's Persistence Agent)

You ARE responsible for:
- Schema validation with helpful error messages
- Historical data enrichment
- Pattern detection (mood trends, interest evolution)
- Handling missing or incomplete data gracefully
- Maintaining consistency with stored preferences
```

---

## Input Schema

```json
{
  "userId": "string (uuid)",
  "context": {
    "mood": "feliz|triste|reflexivo|ansioso|neutral",
    "profile": "novato|intermedio|avanzado|experto",
    "interests": ["ficción", "desarrollo", ...],
    "intent": "relax|aprendizaje|evasión"
  },
  "requestId": "string (uuid, optional)"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | uuid | Yes | Unique user identifier |
| mood | enum | Yes | User's emotional state |
| profile | enum | Yes | Reader experience level |
| interests | array | Yes | Topics/genres user is interested in (min 1) |
| intent | enum | Yes | Primary reading goal |
| requestId | uuid | No | Request tracking (generated if missing) |

---

## Execution Flow

```
INPUT (Raw User Context)
   ↓
[Step 1] Validate Input Schema
   ├─ Check required fields
   ├─ Validate enum values
   ├─ Validate array format
   └─ Return 400 if invalid
   ↓
[Step 2] Fetch User History
   ├─ Query ReaderContext table by userId
   ├─ If not found, create new record
   └─ Cache result for 5 minutes
   ↓
[Step 3] Detect Mood Patterns
   ├─ Analyze previousMoods array
   ├─ Calculate mood frequency
   └─ Generate mood_trend (stable|volatile|improving|declining)
   ↓
[Step 4] Enrich Interests
   ├─ Merge current interests with previousInterests
   ├─ De-duplicate and sort by frequency
   └─ Add inferred interests from readBooks
   ↓
[Step 5] Profile Evolution
   ├─ Compare current profile with historical data
   ├─ Detect growth trajectory
   └─ Flag if profile changed
   ↓
OUTPUT (Enriched Context)
```

---

## Output Schema

```json
{
  "userId": "uuid",
  "context": {
    "mood": "string",
    "profile": "string",
    "interests": ["string"],
    "intent": "string"
  },
  "enrichment": {
    "previousMoods": ["feliz", "reflexivo", ...],
    "previousInterests": ["ficción", "historia", ...],
    "readBooks": ["book-id-1", "book-id-2", ...],
    "moodTrend": "stable|volatile|improving|declining",
    "profileEvolution": "stable|growing|regressing",
    "recommendationCount": 42,
    "lastRecommendationTime": "ISO8601"
  },
  "validationStatus": {
    "valid": true,
    "warnings": [],
    "corrections": []
  }
}
```

---

## Detailed Steps

### Step 1: Input Validation

Validate against this checklist:

```javascript
const validation = {
  checks: [
    { field: "userId", type: "uuid", required: true },
    { field: "context.mood", type: "enum", values: ["feliz", "triste", "reflexivo", "ansioso", "neutral"], required: true },
    { field: "context.profile", type: "enum", values: ["novato", "intermedio", "avanzado", "experto"], required: true },
    { field: "context.interests", type: "array", minItems: 1, required: true },
    { field: "context.intent", type: "enum", values: ["relax", "aprendizaje", "evasión"], required: true }
  ]
};

// If any check fails, return:
{
  "valid": false,
  "error": "INVALID_SCHEMA",
  "details": [
    "Field 'context.interests' must be a non-empty array",
    "Field 'context.mood' must be one of: feliz, triste, reflexivo, ansioso, neutral"
  ]
}
```

### Step 2: Fetch User History

Query the ReaderContext table:

```sql
SELECT
  id, mood, readerProfile, interests, intent,
  previousMoods, readBooks, createdAt, updatedAt, lastAccessedAt
FROM ReaderContext
WHERE userId = $1
LIMIT 1
```

**Cases**:
- **User exists**: Return historical data
- **User not found**: Create new ReaderContext with current values
- **Database error**: Retry up to 2 times, then continue without history

### Step 3: Detect Mood Patterns

Analyze the `previousMoods` array:

```javascript
function detectMoodTrend(previousMoods, currentMood) {
  if (previousMoods.length < 2) return "insufficient_data";

  const recent5 = previousMoods.slice(-5);
  const moodFreq = countFrequency(recent5);

  if (recent5.every(m => m === recent5[0])) return "stable";
  if (recent5.reverse().filter(m => m === recent5[0]).length >= 4) return "declining";
  if (currentMood !== recent5[0] && recent5.filter(m => m === currentMood).length > 2) return "improving";

  return "volatile";
}
```

### Step 4: Enrich Interests

Merge interests intelligently:

```javascript
function enrichInterests(currentInterests, previousInterests, readBooks) {
  // Combine and deduplicate
  let merged = new Set([...currentInterests, ...previousInterests]);

  // Infer from readBooks (query book genres)
  // Add top 3 most common genres from readBooks
  const inferredGenres = getTopGenresFromBooks(readBooks, 3);
  merged.addAll(inferredGenres);

  return Array.from(merged).sort();
}
```

### Step 5: Profile Evolution

Track reader growth:

```javascript
function trackProfileEvolution(currentProfile, updatedAt) {
  const profileLevels = ["novato", "intermedio", "avanzado", "experto"];
  const currentIndex = profileLevels.indexOf(currentProfile);

  // Query previous recommendations to infer reading level
  const avgScore = getAverageScoreFromHistory(userId);
  const bookCount = getReadBookCount(userId);

  if (avgScore > 0.85 && bookCount > 20 && currentIndex < 3) {
    return "growing";
  } else if (avgScore < 0.5 && bookCount > 50) {
    return "regressing";
  }

  return "stable";
}
```

---

## Error Handling

### Invalid Input

```
ERROR: INVALID_SCHEMA
RESPONSE: 400 Bad Request
BODY: {
  "error": "INVALID_SCHEMA",
  "message": "Context validation failed",
  "details": ["context.interests must be a non-empty array", ...]
}
NO RETRY
```

### User Not Found

```
No historical context available
CREATE new ReaderContext with:
- userId
- mood, profile, interests, intent
- previousMoods = [current mood]
- readBooks = []
CONTINUE normally
```

### History Fetch Error

```
Cannot fetch user history from database
RETRY up to 2 times with exponential backoff [100ms, 500ms]
If still fails:
  - Continue with current input only
  - Set enrichment.previousMoods = []
  - Log warning
CONTINUE normally
```

### Enrichment Error

```
Error during pattern detection or merging
USE input without enrichment
SET enrichment = null
RETURN context as valid
LOG warning
```

---

## Caching Strategy

Cache the following for 5 minutes (TTL: 300s):

```json
{
  "cache_key": "context:{userId}",
  "data": {
    "readerContext": { ... },
    "timestamp": "ISO8601"
  },
  "ttl": 300
}
```

Cache hits should skip database queries entirely.

---

## Example Execution

### Request

```json
{
  "userId": "user-123",
  "context": {
    "mood": "triste",
    "profile": "avanzado",
    "interests": ["ficción", "desarrollo personal"],
    "intent": "evasión"
  }
}
```

### Processing

```
Step 1: Validate Input
✓ All fields valid
✓ Enums correct
✓ Array non-empty

Step 2: Fetch User History
✓ User found in database
✓ 5 previous recommendations
✓ Last accessed: 2 days ago

Step 3: Detect Mood Patterns
Previous moods: [neutral, neutral, feliz, reflexivo, triste]
Trend: volatile (varies frequently)
Current: triste (different from 3-day average)

Step 4: Enrich Interests
Current: [ficción, desarrollo personal]
Previous: [historia, filosofía]
Inferred: [romance] (from read books)
Merged: [desarrollo personal, ficción, filosofía, historia, romance]

Step 5: Profile Evolution
Current: avanzado
Read 12 books in past 6 months
Avg score: 0.78
Trend: stable (consistent difficulty level)
```

### Response

```json
{
  "userId": "user-123",
  "context": {
    "mood": "triste",
    "profile": "avanzado",
    "interests": ["desarrollo personal", "ficción", "filosofía", "historia", "romance"],
    "intent": "evasión"
  },
  "enrichment": {
    "previousMoods": ["neutral", "neutral", "feliz", "reflexivo", "triste"],
    "previousInterests": ["historia", "filosofía"],
    "readBooks": ["book-1", "book-2", "book-5"],
    "moodTrend": "volatile",
    "profileEvolution": "stable",
    "recommendationCount": 5,
    "lastRecommendationTime": "2024-12-28T14:30:00Z"
  },
  "validationStatus": {
    "valid": true,
    "warnings": [
      "Mood has been 'triste' for past 2 requests - consider depression check"
    ],
    "corrections": []
  }
}
```

---

## Monitoring

Track these metrics per request:

```json
{
  "requestId": "uuid",
  "metrics": {
    "validationTime": 45,
    "historyFetchTime": 150,
    "patternDetectionTime": 80,
    "enrichmentTime": 120,
    "totalTime": 395,
    "cacheHit": false,
    "userIsNew": false,
    "warningCount": 1,
    "correctionCount": 0
  }
}
```

---

## Implementation Notes

1. **Cache Strategy**: Use Redis or in-memory cache for user contexts (TTL: 5 min)
2. **Database Queries**: Use Prisma with `include: { readBooks: true }`
3. **Pattern Detection**: Use simple frequency analysis for mood trends
4. **Error Messages**: Always include specific field names and valid values
5. **Telemetry**: Log execution time for each step

