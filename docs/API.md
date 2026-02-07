# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Endpoints

### 1. POST /recommendations - Get Book Recommendations

Generate personalized book recommendations based on reader context.

**Request**
```bash
POST /api/v1/recommendations
Content-Type: application/json

{
  "context": {
    "mood": "reflexivo",
    "profile": "intermedio",
    "interests": ["ficción", "filosofía"],
    "intent": "aprendizaje"
  }
}
```

**Response (200 OK)**
```json
{
  "status": "success",
  "data": {
    "recommendationId": "rec-12345",
    "books": [
      {
        "id": "book-1",
        "title": "El Segundo Sexo",
        "author": "Simone de Beauvoir",
        "genre": "Ensayo",
        "synopsis": "...",
        "score": 0.95,
        "scoreBreakdown": {
          "interestMatch": 1.0,
          "difficultyMatch": 0.9,
          "moodMatch": 0.95
        },
        "justification": "This book aligns perfectly with your reflective mood...",
        "keyReasons": ["Matches your interests", "Perfect difficulty level"]
      }
    ],
    "metadata": {
      "totalScore": 0.92,
      "processingTime": 3500,
      "agentsUsed": ["context", "search", "scoring", "justifier"],
      "errors": []
    }
  }
}
```

**Error Response (400)**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid mood value",
    "details": {
      "field": "context.mood",
      "expected": "one of: feliz, triste, reflexivo, ansioso, neutral"
    }
  },
  "requestId": "uuid",
  "timestamp": "2026-02-07T..."
}
```

**Parameters**
- `context.mood` - Reader's current mood (required)
  - Valid values: `feliz`, `triste`, `reflexivo`, `ansioso`, `neutral`
- `context.profile` - Reader level (required)
  - Valid values: `novato`, `intermedio`, `avanzado`, `experto`
- `context.interests` - Genres the reader likes (required, array)
  - Examples: `ficción`, `ensayo`, `ciencia ficción`, `misterio`, `romance`
- `context.intent` - Reading intention (required)
  - Valid values: `relax`, `aprendizaje`, `evasión`

---

### 2. GET /books - List Books

Retrieve books from the catalog with filtering options.

**Request**
```bash
GET /api/v1/books?genre=ficción&difficulty=intermediate&limit=10&offset=0
```

**Response (200 OK)**
```json
{
  "status": "success",
  "data": {
    "books": [
      {
        "id": "book-1",
        "title": "Cien años de soledad",
        "author": "Gabriel García Márquez",
        "genre": "Ficción",
        "synopsis": "A magical realist novel...",
        "difficulty": "intermediate",
        "publicationYear": 1967,
        "tags": ["magic-realism", "family-saga", "latin-american"]
      }
    ],
    "pagination": {
      "total": 60,
      "page": 1,
      "pageSize": 10,
      "hasMore": true
    }
  }
}
```

**Query Parameters**
- `genre` - Filter by genre (optional)
  - Examples: `ficción`, `ensayo`, `ciencia ficción`, `misterio`, `romance`, `poesía`
- `difficulty` - Filter by reading level (optional)
  - Valid values: `beginner`, `intermediate`, `advanced`
- `search` - Full-text search on title, author, synopsis (optional)
- `limit` - Maximum results (optional, default: 50, max: 100)
- `offset` - Pagination offset (optional, default: 0)

---

### 3. POST /context - Save Reader Context

Save or update a reader's context and preferences.

**Request**
```bash
POST /api/v1/context
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "context": {
    "mood": "reflexivo",
    "profile": "intermedio",
    "interests": ["ficción", "filosofía"],
    "intent": "aprendizaje"
  }
}
```

**Response (201 Created)**
```json
{
  "status": "success",
  "data": {
    "contextId": "ctx-12345",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-02-07T10:30:00Z"
  }
}
```

**Parameters**
- `userId` - Unique identifier for the reader (optional, auto-generated if not provided)
- `context` - Reader's context (same as recommendations endpoint)

---

### 4. GET /recommendations/{id} - Get Specific Recommendation

Retrieve a previously saved recommendation.

**Request**
```bash
GET /api/v1/recommendations/rec-12345
```

**Response (200 OK)**
```json
{
  "status": "success",
  "data": {
    "recommendationId": "rec-12345",
    "createdAt": "2026-02-07T10:30:00Z",
    "books": [
      {
        "id": "book-1",
        "title": "El Segundo Sexo",
        "author": "Simone de Beauvoir",
        "genre": "Ensayo",
        "score": 0.95,
        "justification": "..."
      }
    ],
    "metadata": {
      "totalScore": 0.92,
      "processingTime": 3500,
      "agentsUsed": ["context", "search", "scoring", "justifier"],
      "errors": []
    }
  }
}
```

**Error Response (404)**
```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Recommendation not found"
  },
  "requestId": "uuid",
  "timestamp": "2026-02-07T..."
}
```

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Books listed, recommendation generated |
| 201 | Created | Context saved |
| 400 | Bad Request | Invalid mood value, missing field |
| 404 | Not Found | Recommendation ID doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |
| 503 | Service Unavailable | Database connection failed |

---

## Validation Rules

### Mood Enum
```
Valid values: feliz, triste, reflexivo, ansioso, neutral
```

### Reader Profile Enum
```
Valid values: novato, intermedio, avanzado, experto
```

### Intent Enum
```
Valid values: relax, aprendizaje, evasión
```

### Interests Array
- Minimum 1 item
- Valid genres: ficción, ensayo, ciencia ficción, misterio, romance, poesía, aventura, desarrollo personal, infantil, etc.

---

## Scoring Algorithm

The recommendation scoring uses a weighted formula:

```
finalScore = (0.3 × interestMatch) + (0.3 × difficultyMatch) + (0.4 × moodMatch)

interestMatch =
  1.0 if book.genre in user.interests
  0.3 otherwise

difficultyMatch =
  profile_difficulty_matrix[book.difficulty][user.profile]

moodMatch =
  genre_mood_mapping[user.mood][book.genre] + intent_bonus[user.intent]
```

Example:
- Mood: reflexivo (reflective)
- Profile: intermedio (intermediate)
- Interests: [ficción, filosofía]
- Intent: aprendizaje (learning)

Books matching these criteria will score higher.

---

## Error Codes

| Code | Meaning |
|------|---------|
| VALIDATION_ERROR | Input validation failed |
| NOT_FOUND | Resource not found |
| DATABASE_ERROR | Database operation failed |
| ORCHESTRATION_ERROR | Recommendation generation failed |
| RATE_LIMIT_ERROR | Too many requests |
| INTERNAL_ERROR | Unexpected server error |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Recommendations**: 20 requests/hour per user
- **Books**: 100 requests/hour per user
- **Context**: 10 requests/hour per user

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1644218400
```

---

## Examples

### Complete User Flow

1. **Save user context**
```bash
curl -X POST http://localhost:3000/api/v1/context \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "context": {
      "mood": "feliz",
      "profile": "novato",
      "interests": ["aventura", "ficción"],
      "intent": "relax"
    }
  }'
```

2. **Get recommendations**
```bash
curl -X POST http://localhost:3000/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "context": {
      "mood": "feliz",
      "profile": "novato",
      "interests": ["aventura", "ficción"],
      "intent": "relax"
    }
  }'
```

3. **Retrieve saved recommendation**
```bash
curl http://localhost:3000/api/v1/recommendations/rec-12345
```

4. **List books**
```bash
curl "http://localhost:3000/api/v1/books?genre=aventura&limit=5"
```

---

## Integration Notes

- All endpoints return JSON
- Content-Type must be `application/json` for POST requests
- Timestamps are in ISO 8601 format (UTC)
- UUIDs are used for IDs
- Pagination uses offset/limit pattern

---

**Last Updated**: February 7, 2026
