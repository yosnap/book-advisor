# Justifier Agent

## Overview

The Justifier Agent generates personalized, compelling justifications for each book recommendation using Claude's language capabilities. It explains why each book matches the reader's context in natural language.

**Agent ID**: `justifier-agent`
**Effort Level**: High (claude-opus-4-6)
**Type**: LLM-Based Generation

---

## System Prompt

```
You are the Justifier Agent for the book-advisor system,
a specialized literary expert for generating personalized book recommendations justifications.

Your role is to:
1. Receive scored books and reader context
2. Generate compelling, personal justifications for each book
3. Extract and highlight 2-3 key matching reasons
4. Add personalized insights based on mood and profile
5. Write in natural, conversational Spanish where appropriate
6. Keep justifications concise but compelling (150-200 words)

You DO NOT:
- Re-score books (that's Scoring Agent)
- Query the database (that's Search Agent)
- Persist results (that's Persistence Agent)

You ARE responsible for:
- Writing high-quality, persuasive justifications
- Personalizing based on exact context (mood, intent, profile)
- Ensuring factual accuracy about books
- Varying language and structure across justifications
- Maintaining consistency with scores (higher scores = better justifications)
```

---

## Input Schema

```json
{
  "context": {
    "userId": "string",
    "mood": "feliz|triste|reflexivo|ansioso|neutral",
    "profile": "novato|intermedio|avanzado|experto",
    "interests": ["string"],
    "intent": "relax|aprendizaje|evasión"
  },
  "scoredBooks": [
    {
      "bookId": "string",
      "title": "string",
      "author": "string",
      "genre": "string",
      "synopsis": "string",
      "score": 0.92,
      "scoreBreakdown": {
        "moodMatch": 0.95,
        "profileMatch": 0.89,
        "interestMatch": 0.91,
        "intentMatch": 0.88
      }
    }
  ]
}
```

---

## Justification Template

Each justification follows this structure:

```
[Opening Hook] - Connect book to reader's current state
[Primary Match] - Why it aligns with main interests
[Secondary Benefit] - Secondary match or appeal
[Call to Action] - Encouraging closing
```

---

## LLM Prompt Template

```
You are recommending books to a Spanish reader. Here's their context:
- Current mood: {mood} (emotional state)
- Reading level: {profile}
- Interests: {interests.join(', ')}
- Reading goal: {intent_description}

I'm about to show you a book recommendation. Generate a compelling
justification (150-200 words) explaining WHY this book is perfect for them.

Focus on:
1. How the book matches their current {mood} mood
2. Why it's appropriate for their {profile} reading level
3. How it connects to their interests in {interests}
4. How it serves their goal of {intent}

Make it personal, warm, and persuasive. Write in Spanish unless
the book title is in English.

Book to justify:
Title: {title}
Author: {author}
Genre: {genre}
Synopsis: {synopsis}
Match Score: {score} (0.0-1.0)
```

---

## Execution Flow

```
INPUT (Scored Books + Context)
   ↓
[Step 1] Build LLM Prompt
   ├─ Create system prompt
   ├─ Inject reader context
   └─ Prepare batch structure
   ↓
[Step 2] Generate in Batches (PARALLEL)
   ├─ Group books into batches of 5
   ├─ Parallelize 2 batches at once
   └─ Call Claude Opus 4.6
   ↓
[Step 3] Parse Justifications
   ├─ Extract full justification text
   ├─ Clean up formatting
   └─ Validate response structure
   ↓
[Step 4] Extract Key Reasons
   ├─ Identify 2-3 key points
   ├─ Extract as bullet points
   └─ Ensure specificity
   ↓
[Step 5] Add Personalization
   ├─ Include reading level note
   ├─ Add mood-specific insight
   └─ Final quality check
   ↓
[Step 6] Format Output
   ├─ Prepare final JSON
   ├─ Add metadata
   └─ Return to orchestrator
   ↓
OUTPUT (Justified Books)
```

---

## Output Schema

```json
{
  "justifiedBooks": [
    {
      "bookId": "book-1",
      "title": "1984",
      "justification": "Given your current thoughtful and slightly sad mood, Orwell's dystopian masterpiece offers exactly what you need: a profound meditation on power, freedom, and human nature. This book is challenging—perfectly suited to your advanced reading level—and pulls you into an entirely different world, exactly matching your desire for escapism. Orwell's exploration of psychological manipulation and truth resonates deeply with readers in your frame of mind, turning entertainment into genuine reflection.",
      "keyReasons": [
        "Aligns with your thoughtful, reflexive mood",
        "Advanced complexity for your reading level",
        "Escapism through immersive dystopian world"
      ],
      "personalizedInsight": "This book is known for creating intense emotional connections—many readers report finishing it feeling transformed rather than just entertained."
    }
  ],
  "generationMetadata": {
    "totalBooks": 45,
    "generationTime": 8500,
    "tokenUsage": 18750
  }
}
```

---

## Key Reason Extraction

Automatically extract 2-3 key reasons from the LLM output:

```javascript
function extractKeyReasons(justificationText, scoreBreakdown) {
  const reasons = [];

  // Rule 1: Mention mood
  if (scoreBreakdown.moodMatch > 0.8) {
    reasons.push(`Aligns with your ${mood} mood`);
  }

  // Rule 2: Mention profile
  if (scoreBreakdown.profileMatch > 0.8) {
    reasons.push(`Perfect for your ${profile} reading level`);
  }

  // Rule 3: Mention interests
  if (scoreBreakdown.interestMatch > 0.85) {
    reasons.push(`Matches your interest in ${topInterest}`);
  }

  // Rule 4: Mention intent
  if (scoreBreakdown.intentMatch > 0.8) {
    reasons.push(`Delivers the ${intent} experience you're seeking`);
  }

  return reasons.slice(0, 3);
}
```

---

## Mood-Based Personalization

### Feliz (Happy)

```
Positive, light tone:
"Since you're in a happy mood, this delightful book..."
"Your joyful frame of mind pairs beautifully with..."
"To celebrate your current mood, this charming..."
```

### Triste (Sad)

```
Empathetic, validating tone:
"During times when we feel reflective, books like this..."
"Your current mood calls for something meaningful..."
"In a pensive state, this profound work speaks directly to..."
```

### Reflexivo (Thoughtful)

```
Intellectual, deep tone:
"Your thoughtful approach to reading will appreciate..."
"For the reflective reader in you, this exploration of..."
"Your philosophical interests shine when reading..."
```

### Ansioso (Anxious)

```
Engaging, page-turner tone:
"To match your current energy, this gripping book..."
"When you need to feel immersed and engaged, this..."
"For keeping your mind actively occupied, this thrilling..."
```

### Neutral

```
Balanced tone:
"This well-crafted book offers..."
"A perfect all-around choice that..."
"Whether you're in the mood for discovery or comfort..."
```

---

## Profile-Based Personalization

### Novato (Beginner)

```
"This book is wonderfully accessible, with clear prose and relatable..."
"Perfect for building your reading confidence, as it..."
"Accessible yet engaging, this book..."
```

### Intermedio (Intermediate)

```
"This sophisticated book rewards your developing taste..."
"You're ready for the narrative complexity this offers..."
"This balanced choice meets your growing appreciation for..."
```

### Avanzado (Advanced)

```
"As an experienced reader, you'll appreciate the nuance in..."
"Your advanced reading level will enjoy the layered..."
"For readers seeking intellectual depth, this book..."
```

### Experto (Expert)

```
"This masterpiece reveals new insights to even well-read audiences..."
"For the serious reader, this profound work..."
"Your expertise will unlock the subtle complexities in..."
```

---

## Intent-Based Personalization

### Relax

```
"Perfect for unwinding, this book..."
"A soothing choice that lets you escape..."
"Ideal for a relaxing reading session..."
```

### Aprendizaje (Learning)

```
"This educational gem teaches while entertaining..."
"Your growth mindset will appreciate how this book..."
"Learn something meaningful with this intellectually rich..."
```

### Evasión (Escapism)

```
"Transport yourself entirely with this immersive world..."
"Escape entirely into the captivating narrative of..."
"This book whisks you away to..."
```

---

## Batching Strategy

Process books in parallel batches to optimize LLM usage:

```javascript
const batchSize = 5;
const parallelBatches = 2;

// Split 50 books into 10 batches of 5
const batches = chunkArray(books, batchSize);

// Process 2 batches in parallel
for (let i = 0; i < batches.length; i += parallelBatches) {
  const batch1 = callLLM(batches[i]);
  const batch2 = callLLM(batches[i + 1]);
  await Promise.all([batch1, batch2]);
}
```

---

## Error Handling

### LLM API Error

```
RETRY up to 2 times with exponential backoff [1000ms, 5000ms]
If still fails:
  USE templated justification:
  "This {genre} book matches your interest in {interests}
   and your {profile} reading level."
  LOG warning
  CONTINUE
```

### Rate Limited

```
DETECT 429 response
QUEUE remaining books
WAIT with exponential backoff
RETRY when quota resets
ALERT if limit exceeded
```

### Timeout (>12s)

```
RETURN partial results (books justified so far)
USE templates for remaining books
LOG warning
CONTINUE to persistence
```

### Parsing Error

```
If extraction fails:
USE entire LLM response as justification
SKIP key reason extraction
SET keyReasons = ["Book matched by algorithm"]
LOG warning
CONTINUE
```

---

## Templated Justification Fallback

```javascript
function templateJustification(book, context) {
  const moodPhrase = getMoodPhrase(context.mood);
  const profilePhrase = getProfilePhrase(context.profile);
  const intentPhrase = getIntentPhrase(context.intent);

  return `${moodPhrase}, this ${book.genre} book matches your
          interest in ${context.interests[0]} and your
          ${context.profile} reading level. ${intentPhrase}.`;
}
```

Examples:
- "Since you're in a thoughtful mood, this history book matches your interest in philosophy and your advanced reading level. Perfect for deep, immersive reading."
- "For some escapism, this fantasy novel matches your interest in adventure and your intermediate reading level. A great way to unwind."

---

## Example Justification

### Input

```json
{
  "context": {
    "mood": "reflexivo",
    "profile": "avanzado",
    "interests": ["filosofía", "historia"],
    "intent": "aprendizaje"
  },
  "book": {
    "bookId": "book-101",
    "title": "Sapiens",
    "author": "Yuval Noah Harari",
    "genre": "historia",
    "synopsis": "A sweeping history of mankind...",
    "score": 0.94
  }
}
```

### Generated Justification

```
In your current thoughtful and analytical mood, "Sapiens" becomes
more than just a history book—it's a philosophical journey through
human civilization. Harari's ambitious vision perfectly matches your
interests in both philosophy and history, weaving them together to
create a narrative that challenges everything you thought you knew
about human development.

As an advanced reader, you'll appreciate Harari's sophisticated
argumentation and his willingness to challenge conventional wisdom.
This isn't light reading; it demands intellectual engagement and
rewards deep reflection—exactly what your learning-focused mindset
craves. The book transforms you as you read, leaving you with new
frameworks for understanding both history and human nature.

Perfect for your desire to grow intellectually while satisfying your
current philosophical inclinations.
```

### Key Reasons Extracted

```json
{
  "keyReasons": [
    "Merges your interests in philosophy and history",
    "Intellectual depth perfect for advanced readers",
    "Delivers meaningful learning and personal growth"
  ]
}
```

---

## Monitoring

Track per request:

```json
{
  "requestId": "uuid",
  "metrics": {
    "totalBooks": 45,
    "batchCount": 9,
    "averageGenerationTime": 1889,
    "totalTokenUsage": 18750,
    "fallbackCount": 0,
    "successRate": 1.0,
    "timePerBook": 189
  }
}
```

---

## Implementation Notes

1. **Batch Processing**: Use Claude's native batching API for cost efficiency
2. **Temperature**: Set to 0.7 for creativity with consistency
3. **Token Budget**: 300 tokens max per justification
4. **Language**: Mix Spanish and English appropriately
5. **Quality Check**: Validate all justifications are 150-200 words

