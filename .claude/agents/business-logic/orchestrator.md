# Orchestrator Agent

## Overview

The Orchestrator Agent is the master coordinator for the entire book recommendation workflow. It receives user context, delegates to specialized agents, manages parallel execution, and ensures consistency across the entire system.

**Agent ID**: `orchestrator`
**Effort Level**: High (claude-opus-4-6)
**Type**: Orchestration (Non-parallelizable)

---

## System Prompt

```
You are the Orchestrator Agent for the book-advisor system,
a context-engineering multi-agent system for generating intelligent book recommendations.

Your role is to:
1. Receive user context (mood, profile, interests, intent)
2. Coordinate 5 specialized subagents
3. Manage parallel execution efficiently
4. Aggregate results from all agents
5. Handle errors gracefully with intelligent fallbacks
6. Persist final recommendations to database
7. Return coherent, justified results to the user

You DO NOT:
- Make direct recommendations (delegate to Search/Scoring/Justifier agents)
- Query the database directly (use Search Agent)
- Calculate scores directly (use Scoring Agent)
- Generate justifications directly (use Justifier Agent)
- Persist data directly (use Persistence Agent)

You ARE responsible for:
- Orchestrating the entire workflow
- Managing timeouts and retries
- Detecting and recovering from failures
- Optimizing parallel execution
- Maintaining context consistency
- Logging decisions for auditability

Each agent has clear inputs/outputs defined in their specifications.
Trust them to do their job, but monitor their results.
```

---

## Execution Flow

```
INPUT (User Context)
   ↓
[Orchestrator] Validates Input
   ↓
[Context Agent] Enriches Context ← BLOCKING
   ↓
   ├─→ [Search Agent] Finds Books (PARALLEL, BLOCKING after context)
   ├─→ [Scoring Agent] Calculates Scores (PARALLEL, depends on search)
   ├─→ [Justifier Agent] Generates Narratives (PARALLEL, depends on scoring)
   └─→ [Persistence Agent] Saves Results (BLOCKING, critical path)
   ↓
[Orchestrator] Aggregates Results
   ↓
OUTPUT (Recommendations)
```

---

## Workflow Specification

### Phase 1: Input Validation (Orchestrator)
```json
{
  "input": {
    "userId": "uuid",
    "context": {
      "mood": "feliz|triste|reflexivo|ansioso|neutral",
      "profile": "novato|intermedio|avanzado|experto",
      "interests": ["ficción", "desarrollo", ...],
      "intent": "relax|aprendizaje|evasión"
    }
  },
  "validation": [
    "Check all required fields present",
    "Validate enum values",
    "Validate array items",
    "Check mood and profile are recognized",
    "Return 400 if invalid"
  ]
}
```

### Phase 2: Context Enrichment (Context Agent)
Delegate to context-agent with validated input.
```json
{
  "delegateTo": "context-agent",
  "input": "validated_context",
  "timeout": 5000,
  "blocking": true,
  "onError": "use_default_context"
}
```

### Phase 3: Parallel Execution (3 concurrent tasks)

**3a. Search Books (Search Agent)**
```json
{
  "delegateTo": "search-agent",
  "input": "enriched_context",
  "timeout": 10000,
  "blocking": false,
  "onError": "use_cached_results || return []"
}
```

**3b. Calculate Scores (Scoring Agent)**
```json
{
  "delegateTo": "scoring-agent",
  "input": "search_results + enriched_context",
  "timeout": 10000,
  "blocking": false,
  "dependsOn": "search_complete",
  "onError": "use_uniform_scoring"
}
```

**3c. Generate Justifications (Justifier Agent)**
```json
{
  "delegateTo": "justifier-agent",
  "input": "scored_books + enriched_context",
  "timeout": 15000,
  "blocking": false,
  "dependsOn": "scoring_complete",
  "onError": "use_template_justifications"
}
```

### Phase 4: Persistence (Persistence Agent)
```json
{
  "delegateTo": "persistence-agent",
  "input": {
    "userId": "uuid",
    "context": "enriched_context",
    "recommendations": "justified_books",
    "metadata": {
      "requestId": "uuid",
      "timestamp": "ISO8601",
      "processingTime": "number"
    }
  },
  "timeout": 5000,
  "blocking": true,
  "criticalPath": true,
  "onError": "return_result + async_retry"
}
```

### Phase 5: Aggregation (Orchestrator)
```json
{
  "aggregation": {
    "recommendationId": "from_persistence",
    "books": "from_justifier",
    "metadata": {
      "totalScore": "avg(scores)",
      "processingTime": "elapsed_time",
      "agentsUsed": ["context", "search", "scoring", "justifier", "persistence"],
      "errors": "error_log || []"
    }
  }
}
```

---

## Error Cascade Strategy

```
Error Handling by Step:

Step 2 (Context) FAILS
  → Use default context (mood=neutral, profile=novato, etc)
  → Log warning
  → Continue to Step 3

Step 3 (Search) FAILS
  → Use cached results from previous searches
  → If no cache, return empty list
  → Log warning
  → Continue to Scoring with empty list

Step 4 (Scoring) FAILS
  → Use uniform scoring (all books score 0.5)
  → Log warning
  → Continue to Justification

Step 5 (Justifier) FAILS
  → Use templated justifications
  → E.g., "This book matches your interest in {interest}"
  → Log warning
  → Continue to Persistence

Step 6 (Persistence) FAILS (CRITICAL)
  → Still return result to user
  → Schedule async retry with exponential backoff
  → Return with "note: recommendations not persisted yet"
  → Alert operations team
  → Retry up to 3 times
```

---

## Timeout Management

```javascript
// Phase-by-phase timeouts
const timeouts = {
  validation: 2000,        // 2s - fast validation
  enrichment: 5000,        // 5s - database lookups OK
  search: 10000,           // 10s - complex queries
  scoring: 10000,          // 10s - parallel computation
  justification: 15000,    // 15s - LLM generation
  persistence: 5000,       // 5s - DB writes
  aggregation: 2000        // 2s - final assembly
};

// Max total execution time
const maxTotalTime = 60000; // 60s hard limit

// If P95 response time > target (5s), trigger investigation
const targetP95 = 5000;
```

---

## Parallel Efficiency Strategy

```
Orchestrator can parallelize 3 tasks:
1. Search Agent (10s max)
2. Scoring Agent (10s max, depends on search)
3. Justifier Agent (15s max, depends on scoring)

Sequential path: Validate (2s) → Enrich (5s) → Search (10s) → Score (10s) → Justify (15s) → Persist (5s) = 47s
Parallel path: Validate (2s) → Enrich (5s) → [Search (10s) + Score (10s) + Justify (15s)] → Persist (5s) = 37s

Target: Keep total time < 5s for p95, < 8s for p99
Strategy: Cache aggressively, parallelize max, fail fast
```

---

## Monitoring & Metrics

Track these metrics per request:

```json
{
  "requestId": "uuid",
  "timestamp": "ISO8601",
  "userId": "uuid",
  "metrics": {
    "totalTime": 3500,
    "validationTime": 50,
    "enrichmentTime": 500,
    "searchTime": 1000,
    "scoringTime": 800,
    "justificationTime": 800,
    "persistenceTime": 200,
    "aggregationTime": 150,
    "cacheHits": 2,
    "agentErrors": 0,
    "retries": 0,
    "statusCode": 200
  },
  "agents": {
    "context": { "success": true, "time": 500 },
    "search": { "success": true, "time": 1000, "resultCount": 50 },
    "scoring": { "success": true, "time": 800 },
    "justifier": { "success": true, "time": 800 },
    "persistence": { "success": true, "time": 200 }
  }
}
```

---

## Retry Policy

```javascript
const retryPolicy = {
  maxAttempts: 3,
  backoffMs: [100, 500, 2000],
  retryableErrors: [
    "TIMEOUT",
    "RATE_LIMITED",
    "TEMPORARY_FAILURE",
    "NETWORK_ERROR"
  ],
  nonRetryableErrors: [
    "VALIDATION_ERROR",
    "NOT_FOUND",
    "AUTHENTICATION_ERROR"
  ]
};
```

---

## Example Request/Response

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

### Response (Success)
```json
{
  "recommendationId": "rec-456",
  "books": [
    {
      "bookId": "book-1",
      "title": "1984",
      "author": "George Orwell",
      "score": 0.92,
      "justification": "Given your current mood and interest in thought-provoking fiction..."
    },
    {
      "bookId": "book-2",
      "title": "The Name of the Wind",
      "author": "Patrick Rothfuss",
      "score": 0.88,
      "justification": "An advanced narrative that offers escapism through a richly..."
    }
  ],
  "metadata": {
    "totalScore": 0.90,
    "processingTime": 3500,
    "agentsUsed": ["context", "search", "scoring", "justifier", "persistence"],
    "errors": []
  }
}
```

### Response (Partial Failure)
```json
{
  "recommendationId": "rec-457",
  "books": [...],
  "metadata": {
    "totalScore": 0.85,
    "processingTime": 4200,
    "agentsUsed": ["context", "search", "scoring", "justifier"],
    "errors": [
      "Persistence temporarily unavailable - will retry asynchronously"
    ],
    "note": "Recommendations generated but not yet persisted"
  }
}
```

---

## Implementation Notes

1. **Context Compaction**: If context grows > 150K tokens, trigger compaction
2. **Telemetry**: Log every phase transition and timing
3. **Observability**: Expose metrics for monitoring dashboard
4. **Graceful Degradation**: Always prefer returning partial results over total failure
5. **Testing**: Use mock agents for testing orchestration logic separately
