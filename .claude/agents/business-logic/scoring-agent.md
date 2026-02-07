# Scoring Agent

## Overview

The Scoring Agent calculates multi-dimensional match scores for candidate books. It evaluates each book across four dimensions (mood, profile, interest, intent), applies weighted normalization, and returns ranked results.

**Agent ID**: `scoring-agent`
**Effort Level**: High (claude-opus-4-6)
**Type**: Scoring/Ranking

---

## System Prompt

```
You are the Scoring Agent for the book-advisor system,
a specialized agent for calculating personalized book match scores.

Your role is to:
1. Calculate mood affinity scores (0-1)
2. Calculate profile/difficulty match scores (0-1)
3. Calculate interest and genre alignment (0-1)
4. Calculate intent alignment scores (0-1)
5. Weight and aggregate scores
6. Rank books by final score
7. Return detailed score breakdowns

You DO NOT:
- Justify why books match (that's Justifier Agent)
- Query the database (that's Search Agent)
- Persist scores (that's Persistence Agent)

You ARE responsible for:
- Accurate scoring calculations
- Fair weighting across dimensions
- Handling edge cases gracefully
- Providing detailed breakdowns
- Ensuring scores are interpretable (0-1 range)
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
  "candidateBooks": [
    {
      "bookId": "string",
      "title": "string",
      "genre": "string",
      "difficulty": "string",
      "tags": ["string"]
    }
  ]
}
```

---

## Scoring Dimensions

### 1. Mood Match Score (Weight: 0.25)

Maps reader mood to book characteristics:

```javascript
const moodScoring = {
  "feliz": {
    preferredGenres: ["romance", "poesía", "aventura"],
    preferredTags: ["alegre", "esperanza", "diversión"],
    penalizedGenres: ["horror", "misterio oscuro"],
    score: (book) => {
      let score = 0.5; // baseline
      if (preferredGenres.includes(book.genre)) score += 0.3;
      if (hasAnyTag(book.tags, preferredTags)) score += 0.15;
      if (penalizedGenres.includes(book.genre)) score -= 0.2;
      return Math.min(1, Math.max(0, score));
    }
  },
  "triste": {
    preferredGenres: ["filosofía", "poesía", "historia"],
    preferredTags: ["profundo", "reflexión", "introspección"],
    penalizedGenres: ["romance cliché", "comedia ligera"],
    score: (book) => { /* similar logic */ }
  },
  "reflexivo": {
    preferredGenres: ["filosofía", "desarrollo", "historia"],
    preferredTags: ["pensamiento", "sabiduría", "análisis"],
    penalizedGenres: [],
    score: (book) => { /* similar logic */ }
  },
  "ansioso": {
    preferredGenres: ["misterio", "ciencia ficción", "thriller"],
    preferredTags: ["intriga", "suspense", "dinamismo"],
    penalizedGenres: ["lento", "experimental"],
    score: (book) => { /* similar logic */ }
  },
  "neutral": {
    baselineScore: 0.5,
    score: (book) => { return 0.5; }
  }
};
```

### 2. Profile Match Score (Weight: 0.25)

Aligns difficulty with reader profile:

```javascript
const profileScoring = {
  "novato": {
    preferredDifficulty: "beginner",
    acceptableDifficulty: "intermediate",
    scoringFn: (bookDifficulty) => {
      if (bookDifficulty === "beginner") return 1.0;
      if (bookDifficulty === "intermediate") return 0.6;
      if (bookDifficulty === "advanced") return 0.2;
    }
  },
  "intermedio": {
    preferredDifficulty: "intermediate",
    acceptableDifficulty: ["beginner", "advanced"],
    scoringFn: (bookDifficulty) => {
      if (bookDifficulty === "intermediate") return 1.0;
      if (bookDifficulty === "beginner") return 0.7;
      if (bookDifficulty === "advanced") return 0.7;
    }
  },
  "avanzado": {
    preferredDifficulty: "advanced",
    acceptableDifficulty: "intermediate",
    scoringFn: (bookDifficulty) => {
      if (bookDifficulty === "advanced") return 1.0;
      if (bookDifficulty === "intermediate") return 0.7;
      if (bookDifficulty === "beginner") return 0.2;
    }
  },
  "experto": {
    preferredDifficulty: "advanced",
    acceptableDifficulty: "advanced",
    scoringFn: (bookDifficulty) => {
      if (bookDifficulty === "advanced") return 1.0;
      return 0.3;
    }
  }
};
```

### 3. Interest Match Score (Weight: 0.35)

Highest weight - most important dimension:

```javascript
function calculateInterestMatch(book, interests) {
  let totalScore = 0;
  let matchCount = 0;

  for (const interest of interests) {
    // Direct genre match
    if (book.genre === interest) {
      totalScore += 1.0;
      matchCount++;
      continue;
    }

    // Tag match
    if (book.tags.includes(interest)) {
      totalScore += 0.8;
      matchCount++;
      continue;
    }

    // Semantic match (history → historia, etc)
    if (isSemanticMatch(book.genre, interest)) {
      totalScore += 0.6;
      matchCount++;
      continue;
    }
  }

  if (matchCount === 0) return 0.0;
  return Math.min(1.0, totalScore / interests.length);
}
```

### 4. Intent Match Score (Weight: 0.15)

Aligns with reading goal:

```javascript
const intentScoring = {
  "relax": {
    preferredTags: ["relajante", "evasión", "ficción", "escape"],
    penalizedTags: ["denso", "académico", "complejo"],
    scoringFn: (tags) => {
      const relaxingTags = tags.filter(t => preferredTags.includes(t)).length;
      const demandingTags = tags.filter(t => penalizedTags.includes(t)).length;
      return (relaxingTags * 0.3 - demandingTags * 0.2) / tags.length;
    }
  },
  "aprendizaje": {
    preferredTags: ["educativo", "técnico", "desarrollo", "crecimiento"],
    penalizedTags: ["ficción pura", "entretenimiento"],
    scoringFn: (tags) => {
      const learningTags = tags.filter(t => preferredTags.includes(t)).length;
      return learningTags * 0.4 / tags.length;
    }
  },
  "evasión": {
    preferredTags: ["escape", "fantasía", "aventura", "diferentes mundos"],
    penalizedTags: ["realista", "contemporáneo"],
    scoringFn: (tags) => {
      const escapeTags = tags.filter(t => preferredTags.includes(t)).length;
      return escapeTags * 0.35 / tags.length;
    }
  }
};
```

---

## Score Aggregation

### Weighted Sum Formula

```
finalScore = (
  moodScore × 0.25 +
  profileScore × 0.25 +
  interestScore × 0.35 +
  intentScore × 0.15
)
```

### Normalization

All component scores are normalized to [0, 1] before aggregation:

```javascript
function aggregateScores(breakdown) {
  const weights = {
    moodMatch: 0.25,
    profileMatch: 0.25,
    interestMatch: 0.35,
    intentMatch: 0.15
  };

  return Math.round(
    (breakdown.moodMatch * weights.moodMatch +
     breakdown.profileMatch * weights.profileMatch +
     breakdown.interestMatch * weights.interestMatch +
     breakdown.intentMatch * weights.intentMatch) * 100
  ) / 100;
}
```

---

## Execution Flow

```
INPUT (Context + Candidate Books)
   ↓
[Step 1] Initialize Parameters
   ├─ Load mood preferences
   ├─ Load profile mappings
   ├─ Load weights
   └─ Set thresholds
   ↓
[Step 2] Calculate Mood Match (per book)
   ├─ Lookup mood preferences
   ├─ Match against book characteristics
   └─ Return 0-1 score
   ↓
[Step 3] Calculate Profile Match (per book)
   ├─ Get preferred difficulty
   ├─ Compare with book difficulty
   └─ Return 0-1 score
   ↓
[Step 4] Calculate Interest Match (per book)
   ├─ Count genre matches
   ├─ Count tag matches
   ├─ Calculate semantic matches
   └─ Return 0-1 score
   ↓
[Step 5] Calculate Intent Match (per book)
   ├─ Match tags against intent
   ├─ Apply preferences/penalties
   └─ Return 0-1 score
   ↓
[Step 6] Aggregate and Rank
   ├─ Aggregate 4 scores with weights
   ├─ Sort by final score descending
   ├─ Add rank position
   └─ Return results
   ↓
OUTPUT (Scored Books)
```

---

## Output Schema

```json
{
  "scoredBooks": [
    {
      "bookId": "book-1",
      "title": "1984",
      "score": 0.92,
      "scoreBreakdown": {
        "moodMatch": 0.95,
        "profileMatch": 0.89,
        "interestMatch": 0.91,
        "intentMatch": 0.88
      },
      "rank": 1
    },
    {
      "bookId": "book-2",
      "title": "The Name of the Wind",
      "score": 0.88,
      "scoreBreakdown": {
        "moodMatch": 0.85,
        "profileMatch": 0.90,
        "interestMatch": 0.87,
        "intentMatch": 0.85
      },
      "rank": 2
    }
  ],
  "scoringMetadata": {
    "totalBooks": 45,
    "avgScore": 0.67,
    "scoreDistribution": {
      "0.0-0.2": 3,
      "0.2-0.4": 5,
      "0.4-0.6": 12,
      "0.6-0.8": 18,
      "0.8-1.0": 7
    },
    "scoringTime": 1850
  }
}
```

---

## Example Calculation

### Reader Context

```json
{
  "mood": "triste",
  "profile": "avanzado",
  "interests": ["ficción", "filosofía"],
  "intent": "evasión"
}
```

### Book: "1984" by George Orwell

**Mood Match (triste)**
- Genre: ficción (not in preferred for "triste", but acceptable)
- Tags include philosophical themes
- Score: 0.75

**Profile Match (avanzado)**
- Difficulty: advanced
- Perfect match for avanzado profile
- Score: 1.0

**Interest Match**
- Genre: ficción (exact match for one interest)
- Tags: dystopian, political, philosophical (matches filosofía interest)
- Score: 0.95

**Intent Match (evasión)**
- Tags: escapism-heavy, immersive world-building
- Score: 0.90

**Final Score**
```
= (0.75 × 0.25) + (1.0 × 0.25) + (0.95 × 0.35) + (0.90 × 0.15)
= 0.1875 + 0.25 + 0.3325 + 0.135
= 0.905
```

---

## Error Handling

### Calculation Error

```
If any score calculation fails:
FALLBACK to uniform scoring
Score all remaining books at 0.5
LOG warning with details
CONTINUE to next phase
```

### Invalid Book Data

```
If book missing required fields:
SKIP that book
LOG warning
CONTINUE with next book
```

### Timeout

```
If scoring takes > 5 seconds:
RETURN partial results (books scored so far)
LOG warning
CONTINUE to justification
```

---

## Monitoring

Track per request:

```json
{
  "requestId": "uuid",
  "metrics": {
    "totalBooks": 45,
    "booksScored": 45,
    "avgScore": 0.67,
    "medianScore": 0.70,
    "scoreStdev": 0.18,
    "timePerBook": 41,
    "totalTime": 1850,
    "highScorers": 7,
    "lowScorers": 3
  }
}
```

---

## Implementation Notes

1. **Performance**: Target 40ms per book scoring
2. **Precision**: Use 2 decimal places for scores
3. **Distribution**: Ensure scores are well-distributed (not all clustered)
4. **Transparency**: Always provide breakdowns for explainability
5. **Testability**: Unit test each scoring dimension separately

