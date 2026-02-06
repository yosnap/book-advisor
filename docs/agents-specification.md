# Especificación de Agentes Multi-Agente

Sistema de agentes orquestados para recomendación inteligente de libros basada en contexto.

---

## Arquitectura General

```
┌─────────────────────────────────────────┐
│   ENTRADA DEL SISTEMA (Web/Telegram)    │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ ORCHESTRATOR AGENT   │
        │  (Coordinador)       │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    ┌─────────┐          ┌──────────────┐
    │ Context │          │ Search Agent │
    │ Agent   │          └────────┬─────┘
    └────┬────┘                   │
         │                        ▼
         │                   ┌──────────┐
         │                   │ Scoring  │
         │                   │ Agent    │
         │                   └────┬─────┘
         │                        │
         └────────┬───────────────┘
                  │
                  ▼
          ┌───────────────┐
          │ Justifier     │
          │ Agent (LLM)   │
          └───────┬───────┘
                  │
                  ▼
          ┌───────────────┐
          │ Persistence   │
          │ Agent         │
          └───────┬───────┘
                  │
                  ▼
        ┌──────────────────────┐
        │ Respuesta Final      │
        │ (Web/Telegram)       │
        └──────────────────────┘
```

---

## 1. Orchestrator Agent (Agente Orquestador Principal)

### Rol
Coordinar todo el flujo del sistema, delegando responsabilidades a subagentes y asegurando la coherencia de la respuesta final.

### Responsabilidades
- Recibir contexto del usuario
- Orquestar secuencialmente los subagentes
- Manejar errores en cascada
- Persistir decisiones en BD
- Logging y trazabilidad

### Inputs
```json
{
  "userId": "uuid",
  "mood": "string (e.g., 'feliz', 'triste', 'reflexivo')",
  "readerProfile": "string (e.g., 'novato', 'intermedio', 'avanzado')",
  "interests": "string[] (e.g., ['ficción', 'historia', 'desarrollo'])",
  "intent": "string (e.g., 'relax', 'aprendizaje', 'evasión')",
  "preferences": "object (optional preferences)"
}
```

### Outputs
```json
{
  "recommendationId": "uuid",
  "books": [
    {
      "bookId": "uuid",
      "title": "string",
      "author": "string",
      "genre": "string",
      "score": "float (0-1)",
      "justification": "string"
    }
  ],
  "metadata": {
    "totalScore": "float",
    "processingTime": "number (ms)",
    "agentsUsed": "string[]",
    "errors": "string[] (if any)"
  }
}
```

### Tools
- `context_agent` - Validar contexto
- `search_agent` - Buscar libros
- `scoring_agent` - Calcular scores
- `justifier_agent` - Generar justificaciones
- `persistence_agent` - Guardar resultados
- `neon_mcp` - Queries a BD
- `error_handler` - Manejo de errores

### Algoritmo de Orquestación
```
1. ValidateInput(input)
2. EnrichedContext = ContextAgent.Process(input)
3. CandidateBooks = SearchAgent.Query(EnrichedContext)
4. ScoredBooks = ScoringAgent.Calculate(CandidateBooks, EnrichedContext)
5. SortedBooks = Sort(ScoredBooks) [top 3-5]
6. JustifiedBooks = JustifierAgent.Generate(SortedBooks)
7. SaveResult = PersistenceAgent.Save(JustifiedBooks)
8. Return(JustifiedBooks + metadata)
```

### Error Handling
- Si falla ContextAgent → Return error + 400
- Si falla SearchAgent → Return cached results o default recommendations
- Si falla ScoringAgent → Use uniform scoring
- Si falla JustifierAgent → Use templated justifications
- Si falla PersistenceAgent → Log pero devuelve resultado (reintento async)

---

## 2. Context Agent (Agente de Contexto)

### Rol
Capturar, validar y enriquecer el contexto del lector de forma trazable.

### Responsabilidades
- Parsear inputs del usuario
- Validar esquema contra schema.json
- Normalizar valores (mood, profile, etc)
- Enriquecer contexto (historico, patrones)
- Detectar valores anómalos

### Inputs
```json
{
  "mood": "string",
  "readerProfile": "string",
  "interests": "string[]",
  "intent": "string",
  "userId": "uuid (optional)"
}
```

### Outputs
```json
{
  "contextId": "uuid",
  "normalized": {
    "mood": "string (validated)",
    "readerProfile": "enum",
    "interests": "string[] (normalized)",
    "intent": "enum",
    "weights": {
      "mood": 0.3,
      "profile": 0.2,
      "interests": 0.4,
      "intent": 0.1
    }
  },
  "enriched": {
    "historicalPreferences": "object (if userId exists)",
    "patterns": "string[] (detected patterns)"
  },
  "metadata": {
    "validationPassed": "boolean",
    "warnings": "string[] (if any)"
  }
}
```

### Tools
- `JSON schema validator`
- `enum validator`
- `neon_mcp.query()` - Obtener histórico del usuario

### Validaciones
```javascript
mood: enum['feliz', 'triste', 'reflexivo', 'ansioso', 'neutral']
readerProfile: enum['novato', 'intermedio', 'avanzado', 'experto']
interests: string[] of valid genres/topics
intent: enum['relax', 'aprendizaje', 'evasión']
preferences: object with optional fields
```

---

## 3. Search Agent (Agente de Búsqueda)

### Rol
Consultar la base de datos y filtrar libros candidatos según contexto enriquecido.

### Responsabilidades
- Ejecutar queries optimizadas a Neon
- Aplicar filtros por género, tema, autor
- Aplicar limits y offsets
- Loguear queries para auditoría
- Manejo de timeouts

### Inputs
```json
{
  "contextId": "uuid",
  "interests": "string[]",
  "readerProfile": "string",
  "limit": "number (default: 50)",
  "filters": {
    "genre": "string (optional)",
    "author": "string (optional)",
    "publicationYear": "number (optional)",
    "difficulty": "string (optional)"
  }
}
```

### Outputs
```json
{
  "queryId": "uuid",
  "totalFound": "number",
  "books": [
    {
      "bookId": "uuid",
      "title": "string",
      "author": "string",
      "genre": "string",
      "synopsis": "text",
      "difficulty": "string",
      "publicationYear": "number",
      "tags": "string[]"
    }
  ],
  "metadata": {
    "queryTime": "number (ms)",
    "indexesUsed": "string[]",
    "warnings": "string[] (if any)"
  }
}
```

### SQL Query Template
```sql
SELECT * FROM books
WHERE
  (genre = ANY($1) OR tags && $2)
  AND (difficulty <= $3 OR difficulty IS NULL)
  AND (publication_year >= $4 OR publication_year IS NULL)
  AND (author ILIKE $5 OR $5 IS NULL)
ORDER BY relevance_score DESC
LIMIT $6
```

### Tools
- `neon_mcp.query(sql, params)`
- `neon_mcp.getSchema()`
- `sql_builder` - Construcción de queries dinámicas

---

## 4. Scoring Agent (Agente de Scoring)

### Rol
Calcular match scores entre contexto del lector y cada libro candidato.

### Responsabilidades
- Implementar matching algorithms
- Calcular scores basados en pesos
- Aplicar boost/penalizaciones
- Detectar sesgos en scoring
- Logging de cálculos

### Inputs
```json
{
  "contextId": "uuid",
  "normalizedContext": {
    "mood": "string",
    "readerProfile": "string",
    "interests": "string[]",
    "intent": "string",
    "weights": {
      "mood": 0.3,
      "profile": 0.2,
      "interests": 0.4,
      "intent": 0.1
    }
  },
  "candidates": [
    {
      "bookId": "uuid",
      "title": "string",
      "genre": "string",
      "tags": "string[]",
      "difficulty": "string",
      "tone": "string"
    }
  ]
}
```

### Outputs
```json
{
  "scoringId": "uuid",
  "scored": [
    {
      "bookId": "uuid",
      "totalScore": 0.85,
      "breakdown": {
        "moodMatch": 0.9,
        "profileMatch": 0.8,
        "interestMatch": 0.85,
        "intentMatch": 0.75
      },
      "boosts": {
        "reason": "string",
        "value": 0.05
      },
      "penalties": []
    }
  ],
  "metadata": {
    "algorithm": "weighted_euclidean",
    "calculationTime": "number (ms)"
  }
}
```

### Algoritmo Base
```javascript
totalScore =
  (moodMatch * 0.3) +
  (profileMatch * 0.2) +
  (interestMatch * 0.4) +
  (intentMatch * 0.1)

// Boosts
if (recentlyAdded) totalScore += 0.05
if (highRating) totalScore += 0.05

// Penalties
if (alreadyRead) totalScore -= 0.2
if (lowAvailability) totalScore -= 0.1

finalScore = clamp(totalScore, 0, 1)
```

### Tools
- `math_functions` - Cálculos de similitud
- `similarity_algorithms` - Cosine, euclidean, etc

---

## 5. Justifier Agent (Agente Justificador - LLM-based)

### Rol
Generar justificaciones narrativas y convincentes para cada recomendación.

### Responsabilidades
- Crear narrativas personalizadas
- Conectar libro con contexto del lector
- Generar explicaciones claras y concisas
- Adaptar tono según mood del lector
- Validar que justificaciones sean coherentes

### Inputs
```json
{
  "contextId": "uuid",
  "readerContext": {
    "mood": "string",
    "profile": "string",
    "interests": "string[]",
    "intent": "string"
  },
  "scoredBooks": [
    {
      "bookId": "uuid",
      "title": "string",
      "author": "string",
      "genre": "string",
      "synopsis": "text",
      "score": 0.85,
      "breakdown": {
        "moodMatch": 0.9,
        "profileMatch": 0.8,
        "interestMatch": 0.85
      }
    }
  ]
}
```

### Outputs
```json
{
  "justificationId": "uuid",
  "justified": [
    {
      "bookId": "uuid",
      "shortJustification": "string (1-2 lines)",
      "longJustification": "string (2-3 paragraphs)",
      "keyReasons": "string[] (3-5 bullets)",
      "tone": "string (matched to reader mood)",
      "personalizedQuote": "string (optional)"
    }
  ],
  "metadata": {
    "model": "claude-sonnet-4-5",
    "generationTime": "number (ms)",
    "tokensUsed": "number"
  }
}
```

### Prompt Template
```
Actúas como experto en recomendación de libros que entiende profundamente
los estados emocionales y preferencias de los lectores.

El lector actual tiene:
- Mood: {mood}
- Profile: {readerProfile}
- Interests: {interests}
- Intent: {intent}

Estoy recomendando estos libros:
{jsonBooks}

Para CADA libro, genera:
1. Una justificación corta (1-2 líneas)
2. Una justificación larga (2-3 párrafos)
3. 3-5 razones clave
4. Un tono que refleje el mood actual

Responde en JSON.
```

### Tools
- `claude_api` - LLM calls
- `prompt_templates` - Plantillas de prompts
- `tone_analyzer` - Análisis de tone

---

## 6. Persistence Agent (Agente de Persistencia)

### Rol
Guardar decisiones y datos en la base de datos con garantías ACID.

### Responsabilidades
- Crear records de recomendación
- Transacciones ACID
- Logging de decisiones
- Auditoría de cambios
- Manejo de fallos transaccionales

### Inputs
```json
{
  "recommendationData": {
    "userId": "uuid",
    "contextId": "uuid",
    "books": [
      {
        "bookId": "uuid",
        "score": 0.85,
        "justification": "string"
      }
    ],
    "metadata": {
      "orchestratorId": "uuid",
      "processingTime": "number",
      "timestamp": "ISO8601"
    }
  }
}
```

### Outputs
```json
{
  "persistenceId": "uuid",
  "saved": {
    "recommendationId": "uuid",
    "userId": "uuid",
    "createdAt": "ISO8601",
    "books": "uuid[]",
    "status": "persisted"
  },
  "metadata": {
    "transactionTime": "number (ms)",
    "rowsAffected": "number",
    "errors": "string[] (if any)"
  }
}
```

### SQL Operations
```sql
BEGIN TRANSACTION;

INSERT INTO recommendations
  (id, user_id, context_id, created_at, status)
VALUES ($1, $2, $3, NOW(), 'completed');

INSERT INTO recommendation_books
  (recommendation_id, book_id, score, justification)
VALUES ($4, $5, $6, $7), ...;

INSERT INTO audit_log
  (entity_type, entity_id, action, data, timestamp)
VALUES ('recommendation', $1, 'created', $8, NOW());

COMMIT;
```

### Error Handling
```javascript
try {
  BEGIN TRANSACTION
  InsertRecommendation()
  InsertRecommendationBooks()
  InsertAuditLog()
  COMMIT
} catch (error) {
  ROLLBACK
  LogError(error)
  Return error (reintento será manejado por Orchestrator)
}
```

### Tools
- `neon_mcp.query(sql, params)`
- `neon_mcp.beginTransaction()`
- `neon_mcp.commit()` / `rollback()`
- `logger` - Logging events

---

## Especificaciones Transversales

### Error Handling Strategy

**Niveles de error:**

1. **CRITICAL** (Orchestrator falla)
   - Retornar 500 + error al usuario
   - Loguear con máximo detalle
   - Alertar a admin

2. **HIGH** (Context/Search/Persistence fallan)
   - Intentar fallback
   - Loguear con detalle
   - Continuar si es posible

3. **MEDIUM** (Scoring/Justifier fallan)
   - Usar valores por defecto
   - Loguear warning
   - Continuar

4. **LOW** (Logging/Metadata fallan)
   - Ignorar silenciosamente
   - Continuar

### Retry Logic

```javascript
MAX_RETRIES = 3
BACKOFF_STRATEGY = exponential (1s, 2s, 4s)

for attempt in [1..MAX_RETRIES] {
  try {
    return execute()
  } catch (error) {
    if (isRetryable(error) && attempt < MAX_RETRIES) {
      sleep(2 ^ attempt)
      continue
    } else {
      throw error
    }
  }
}
```

### Observability

**Logs requeridos en cada agente:**
- Input received (with hash for sensitive data)
- Processing start/end
- Decisions made
- Errors (with stack trace)
- Output generated
- Processing time

**Métricas requeridas:**
- Processing time per agent
- Error rate per agent
- Cache hit rate (if applicable)
- Token usage (for LLM agents)

### Versioning

Cada agente incluye:
- `agentVersion: "1.0.0"`
- `schemaVersion: "1.0.0"`
- `compatibleWith: ["1.0.0"]`

---

## Flujo Completo de Ejemplo

```json
ENTRADA:
{
  "mood": "triste",
  "readerProfile": "avanzado",
  "interests": ["ficción", "desarrollo personal"],
  "intent": "evasión",
  "userId": "abc-123"
}

PASO 1 - ContextAgent:
Normaliza, valida, enriquece
Salida: contextId + weighted context

PASO 2 - SearchAgent:
Query Neon con intereses + profile
Salida: 40 candidatos

PASO 3 - ScoringAgent:
Calcula scores para cada candidato
Salida: 40 libros con scores

PASO 4 - ScoringAgent (sort):
Ordena y selecciona top 5
Salida: 5 best matches

PASO 5 - JustifierAgent:
Genera narrativas para cada uno
Salida: Justificaciones personalizadas

PASO 6 - PersistenceAgent:
Guarda en BD
Salida: recommendationId

PASO 7 - Orchestrator:
Devuelve respuesta final
{
  "recommendationId": "xyz-789",
  "books": [...5 recomendaciones...],
  "metadata": {...}
}
```

---

## Consideraciones de Diseño

1. **Stateless**: Cada agente es stateless, solo procesa inputs y retorna outputs
2. **Composable**: Pueden usarse independientemente o en cadena
3. **Testeable**: Inputs/outputs bien definidos facilitan testing
4. **Observable**: Logging exhaustivo en cada paso
5. **Escalable**: Sin dependencias de estado compartido
6. **Versionable**: Cada agente es versionable independientemente
