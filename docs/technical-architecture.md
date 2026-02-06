# Arquitectura Técnica – Sistema Inteligente de Recomendación de Libros

**Stack:** Next.js 16 | Neon PostgreSQL | Prisma ORM | Tailwind CSS | n8n | Telegram Bot API | Pencil.dev

---

## 1. Visión Técnica

Sistema de recomendación de libros basado en **Ingeniería de Contexto**, donde:

- El **contexto del usuario** es el artefacto central
- La **inteligencia se orquesta**, no se acumula en prompts
- La **persistencia es trazable** (Neon + Prisma)
- **Múltiples canales** (web, admin, Telegram) comparten mismo motor
- **n8n es el agente decisor**, no la web

---

## 2. Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO FINAL                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────────┐         ┌──────────────┐
   │  WEB UI     │         │ TELEGRAM BOT │
   │ (Next.js)   │         │ (Bot API)    │
   └──────┬──────┘         └──────┬───────┘
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │   NEXT.JS 16        │
            │ - API Routes        │
            │ - Server Components │
            │ - Context Capture   │
            └──────────┬──────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
      ┌──────────────┐    ┌──────────────────┐
      │    NEON      │    │  N8N WORKFLOW    │
      │ PostgreSQL   │    │ (Agente)         │
      │              │    │ - Analyze context│
      │ Tables:      │    │ - Match books    │
      │ - Books      │    │ - Justify        │
      │ - Readers    │◄───┤ - Decide         │
      │ - Recommend. │    │                  │
      └──────────────┘    └──────────────────┘
```

---

## 3. Base de Datos (Neon + Prisma)

### 3.1 Schema Prisma

```prisma
// File: prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== BOOKS =====
model Book {
  id          String   @id @default(cuid())
  title       String   @unique
  author      String
  genre       String   // e.g., "Ficción", "Ensayo", "Ciencia Ficción"
  subgenres   String[] @default([]) // JSON array
  synopsis    String   @db.Text
  year        Int?
  isbn        String?
  rating      Float?   // 1-5
  tags        String[] @default([]) // ["aventura", "misterio", ...]
  difficulty  String   @default("medio") // bajo, medio, alto
  mood        String[] @default([]) // ["reflexivo", "adrenalina", "romántico", ...]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  recommendations Recommendation[]

  @@index([genre])
  @@index([tags])
}

// ===== READER CONTEXT =====
model ReaderContext {
  id              String   @id @default(cuid())

  // Emotional state
  mood            String   // "alegre", "triste", "ansioso", "reflexivo", etc
  moodIntensity   Int      @default(5) // 1-10

  // Reader profile
  readerType      String   // "novato", "regular", "avanzado"
  favoriteGenres  String[] @default([])
  avoidedGenres   String[] @default([])

  // Reading intention
  intention       String   // "relax", "aprendizaje", "evasión", "reflexión"
  preferredLength String   // "corto", "medio", "largo"

  // History
  recentlyRead    String[] @default([]) // Array de book IDs
  dislikedBooks   String[] @default([])

  // Session
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  recommendations Recommendation[]

  @@index([mood])
  @@index([readerType])
}

// ===== RECOMMENDATIONS =====
model Recommendation {
  id              String   @id @default(cuid())

  contextId       String
  context         ReaderContext @relation(fields: [contextId], references: [id], onDelete: Cascade)

  bookId          String
  book            Book     @relation(fields: [bookId], references: [id])

  rank            Int      // 1, 2, 3, etc
  matchScore      Float    // 0-1
  justification   String   @db.Text // "Recomendamos este libro porque..."
  reasoning       Json?    // {"mood_match": 0.9, "genre_match": 0.8, ...}

  accepted        Boolean? // true/false/null (not decided yet)
  feedback        String?  // usuario puede comentar

  createdAt       DateTime @default(now())

  @@unique([contextId, bookId, rank])
  @@index([contextId])
  @@index([bookId])
}

// ===== ADMIN (opcional: users para dashboard) =====
model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed
  role      String   @default("editor") // editor, admin
  createdAt DateTime @default(now())
}
```

### 3.2 Índices Clave

- `Book.genre`, `Book.tags`: para búsquedas rápidas de libros por género/tags
- `ReaderContext.mood`, `ReaderContext.readerType`: para análisis en n8n
- `Recommendation.contextId`, `Recommendation.bookId`: para historial

---

## 4. API REST (Next.js 16)

### 4.1 Endpoints

**POST `/api/recommendations/capture`**
```json
// Request: Captura contexto del usuario
{
  "mood": "reflexivo",
  "moodIntensity": 7,
  "readerType": "avanzado",
  "favoriteGenres": ["Ficción", "Ensayo"],
  "avoidedGenres": ["Romance"],
  "intention": "aprendizaje",
  "preferredLength": "largo",
  "recentlyRead": ["book-id-1", "book-id-2"]
}

// Response: Se crea ReaderContext, se invoca n8n
{
  "contextId": "ctx-xyz123",
  "status": "processing",
  "message": "Buscando recomendaciones..."
}
```

**GET `/api/recommendations/:contextId`**
```json
// Response: Lista recomendaciones
{
  "contextId": "ctx-xyz123",
  "recommendations": [
    {
      "rank": 1,
      "book": {
        "id": "book-123",
        "title": "El Segundo Sexo",
        "author": "Simone de Beauvoir",
        "genre": "Ensayo",
        "synopsis": "...",
        "rating": 4.8
      },
      "matchScore": 0.95,
      "justification": "Excelente coincidencia con tu interés en ensayos reflexivos y análisis profundo. Tu mood reflexivo hace que sea el momento ideal para este libro.",
      "reasoning": {
        "mood_match": 0.9,
        "genre_match": 0.95,
        "intention_match": 1.0,
        "recent_read_distance": 0.85
      }
    },
    // ... más recomendaciones
  ]
}
```

**POST `/api/recommendations/:contextId/feedback`**
```json
// Request: Usuario acepta/rechaza recomendación
{
  "bookId": "book-123",
  "accepted": true,
  "feedback": "Me encantó, perfecto para mi mood actual"
}

// Response: Actualiza Recommendation.accepted y feedback
{
  "success": true,
  "updated": true
}
```

**POST `/api/admin/books`** (Dashboard)
```json
// Request: Crear nuevo libro
{
  "title": "Nuevo Libro",
  "author": "Autor",
  "genre": "Ficción",
  "synopsis": "...",
  "tags": ["aventura", "misterio"],
  "difficulty": "medio",
  "mood": ["adrenalina", "intriga"]
}

// Response: Libro creado
{
  "id": "book-xyz",
  "title": "Nuevo Libro",
  "createdAt": "2024-02-06T..."
}
```

**GET `/api/admin/books`** (Dashboard)
```json
// Response: Lista de libros con paginación
{
  "books": [...],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

---

## 5. Flujo de Integración: Web ↔ n8n

### 5.1 Flujo Paso a Paso

```
1. USUARIO RELLENA FORMULARIO
   ├─ Selecciona mood (alegre, triste, reflexivo, etc)
   ├─ Selecciona reader type (novato, regular, avanzado)
   ├─ Selecciona intention (relax, aprendizaje, evasión)
   └─ Especifica preferencias (géneros, longitud, tags)

2. NEXT.JS CAPTURA CONTEXTO
   ├─ POST /api/recommendations/capture
   ├─ Crea ReaderContext en Neon
   └─ Devuelve contextId

3. NEXT.JS INVOCA N8N WEBHOOK
   ├─ POST https://n8n-instance.com/webhook/recommend
   ├─ Payload: { contextId, mood, readerType, ... }
   └─ Async (no espera respuesta)

4. N8N ANALIZA CONTEXTO
   ├─ Recibe payload
   ├─ Conecta a Neon
   ├─ Query: SELECT * FROM "Book" WHERE ...
   ├─ Lógica de matching (pseudocódigo):
   │  - Filter por género favorito (score +0.3)
   │  - Filter por mood compatibility (score +0.4)
   │  - Penalizar géneros evitados (score -0.5)
   │  - Bonus si reader type avanzado + libro difícil (score +0.2)
   │  - Penalizar si recientemente leído (score -0.6)
   └─ Top 5 libros por score

5. N8N GENERA JUSTIFICACIONES (Claude/ChatGPT)
   ├─ Para cada libro top 5:
   │  ├─ Prompt: "Justifica por qué [LIBRO] es perfecto para lector [TIPO] con mood [MOOD] e intención [INTENCIÓN]"
   │  └─ Guarda en Recommendation.justification
   └─ Estructura reasoning JSON

6. N8N PERSISTE EN NEON
   ├─ INSERT INTO Recommendation
   │  (contextId, bookId, rank, matchScore, justification, reasoning)
   └─ Done

7. NEXT.JS POLLING O WEBHOOK CALLBACK
   ├─ Opción A: Frontend polling cada 2s a GET /api/recommendations/:contextId
   ├─ Opción B: n8n callback a /api/webhooks/n8n-complete (webhook)
   └─ Cuando status == ready, mostrar recomendaciones

8. PRESENTACIÓN EN WEB
   ├─ GET /api/recommendations/:contextId
   ├─ Renderiza recomendaciones con justificaciones
   └─ Usuario puede aceptar/rechazar (feedback)
```

### 5.2 Payloads JSON

**Webhook Call from Web to n8n:**
```json
{
  "contextId": "ctx-abc123",
  "mood": "reflexivo",
  "moodIntensity": 8,
  "readerType": "avanzado",
  "favoriteGenres": ["Ensayo", "Ficción"],
  "avoidedGenres": ["Romance"],
  "intention": "aprendizaje",
  "preferredLength": "largo",
  "tags": ["filosofía", "sociología"],
  "recentlyRead": ["book-1", "book-2"]
}
```

**n8n Response (guardar en BD):**
```json
{
  "contextId": "ctx-abc123",
  "recommendations": [
    {
      "rank": 1,
      "bookId": "book-xyz",
      "matchScore": 0.94,
      "justification": "Este ensayo de Beauvoir se alinea perfectamente con tu búsqueda reflexiva actual...",
      "reasoning": {
        "mood_match": 0.95,
        "genre_match": 1.0,
        "intention_match": 0.9,
        "reader_level_match": 0.95,
        "recency_penalty": -0.1
      }
    }
  ]
}
```

---

## 6. Agente n8n: Lógica de Decisión

### 6.1 Pseudocódigo de Matching

```
FUNCTION recommendBooks(context) {
  allBooks = DB.query("SELECT * FROM Book")

  scores = {}
  FOR each book IN allBooks:
    score = 0.5  // baseline

    // Genre matching
    IF book.genre IN context.favoriteGenres:
      score += 0.3
    IF book.genre IN context.avoidedGenres:
      score -= 0.5
      CONTINUE

    // Mood compatibility
    IF book.mood INTERSECT context.mood:
      score += 0.4

    // Reader type matching
    IF context.readerType == "avanzado" AND book.difficulty == "alto":
      score += 0.2
    IF context.readerType == "novato" AND book.difficulty == "alto":
      score -= 0.1

    // Intention matching
    IF context.intention == "aprendizaje" AND "ensayo" IN book.tags:
      score += 0.2

    // Recency penalty
    IF book.id IN context.recentlyRead:
      score -= 0.6

    scores[book.id] = score

  // Top 5
  topBooks = SORT(scores).TOP(5)

  RETURN topBooks
}
```

### 6.2 n8n Nodes (Workflow)

```
1. Webhook (Trigger)
   Input: {contextId, mood, ...}

2. Read Context from DB
   Query: SELECT * FROM ReaderContext WHERE id = :contextId

3. Query Books from DB
   Query: SELECT * FROM Book (limit 1000, optimize with indexes)

4. Calculate Scores
   JavaScript node: Implement matching logic above
   Output: [{bookId, score}, ...]

5. Top 5 Books
   Array node: Filter top 5

6. For Each Book (Loop)
   6.1 Get Book Details (SQL)
   6.2 Generate Justification (Claude/ChatGPT)
   6.3 Structure Recommendation JSON
   6.4 Save to DB
       INSERT INTO Recommendation (contextId, bookId, rank, matchScore, ...)

7. HTTP Response
   Output: {status: "success", recommendationCount: 5}
```

---

## 7. Bot de Telegram

### 7.1 Integración

```
User (Telegram) → Telegram Bot API → Webhook en Next.js
  ↓
/api/webhooks/telegram
  ↓
Parse mensaje → Extract intención
  ↓
Capture context (conversational)
  ↓
POST /api/recommendations/capture
  ↓
Wait for recommendations
  ↓
Format como mensaje Telegram
  ↓
Send back to user
```

### 7.2 Flujo Conversacional

```
User: "Hola bot, necesito una recomendación de libro"

Bot: "¡Hola! Para recomendarte el mejor libro, necesito entender tu mood actual.
¿Cómo te sientes hoy?
Opciones: 😊 Alegre | 😔 Triste | 🤔 Reflexivo | 😰 Ansioso | 🥱 Relajado"

User: "Reflexivo"

Bot: "Interesante. ¿Qué tipo de lector eres?
Opciones: 📕 Novato | 📗 Regular | 📚 Avanzado"

User: "Avanzado"

Bot: "¿Qué intención tienes al leer?
Opciones: 🌤️ Relax | 🎓 Aprendizaje | 🏃 Evasión | 💭 Reflexión"

User: "Aprendizaje"

Bot: "Analizando... 🔍
[Espera a recomendaciones de n8n]

Aquí están mis recomendaciones para ti:

📖 **El Segundo Sexo** - Simone de Beauvoir
Score: 94% ✨
Justificación: Este ensayo es perfecto para tu mood reflexivo actual y tu intención de aprendizaje. Como lector avanzado, apreciarás el análisis profundo sobre género y filosofía existencialista.
👍 Me interesa | 👎 No me atrae

[Similar para 2-4 libros más]"

User: "👍" (en respuesta a primer libro)

Bot: "¡Excelente! Anotado. ¿Otra recomendación?"
```

### 7.3 Persistencia en Telegram

- Cada usuario = unique Telegram ID
- Asociar Telegram ID con ReaderContext en BD
- Historial de contextos y recomendaciones por user

---

## 8. Dashboard Admin (Next.js)

### 8.1 Componentes

**Sección de Libros**
- CRUD de Books
- Bulk upload (CSV)
- Editor de campos (title, author, genre, tags, mood, difficulty)
- Preview de recomendaciones (simular n8n logic)
- Búsqueda y filtrado

**Sección de Estadísticas**
- Total de recomendaciones
- Géneros más recomendados
- Moods más frecuentes
- Libros más recomendados
- Aceptación de recomendaciones (%)

**Sección de Usuarios (opcional)**
- Historial de contextos
- Recomendaciones dadas
- Feedback del usuario

### 8.2 Rutas

```
/admin
  /admin/login
  /admin/books
    /admin/books/new
    /admin/books/[id]/edit
  /admin/stats
  /admin/users
```

---

## 9. Flujo de Pencil.dev → Tailwind

1. **Diseño en Pencil.dev**
   - Mockups de web, dashboard, Telegram (reference)
   - Guardar en `/design/pencil-exports`

2. **Exportar estructura**
   - Identifica componentes reutilizables
   - Mapea a Tailwind CSS

3. **Componentes React + Tailwind**
   ```
   /app/components
     /ui/Button.tsx
     /ui/Card.tsx
     /ui/Modal.tsx
     /RecommendationCard.tsx
     /BookForm.tsx
     /ContextCapture.tsx
   ```

4. **Paleta de colores (Tailwind)**
   - Define en `tailwind.config.js`
   - Usar consistent en web, admin, mockups Telegram

---

## 10. Setup Paso a Paso

### 10.1 Proyecto Next.js

```bash
# Crear proyecto
npx create-next-app@latest book-advisor --typescript --tailwind

# Instalar dependencias
npm install @prisma/client
npm install --save-dev prisma
npm install telegram-bot-api (si integras bot aquí)

# Setup Prisma
npx prisma init
# Editar .env.local con DATABASE_URL de Neon
# Crear schema en prisma/schema.prisma

# Migrations
npx prisma migrate dev --name init
npx prisma generate

# Generate Prisma Client
npx prisma generate
```

### 10.2 Variables de Entorno

```env
# .env.local
DATABASE_URL=postgresql://user:password@neon.tech/dbname
N8N_WEBHOOK_URL=https://n8n-instance.com/webhook/recommend
OPENAI_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=123456789:ABCDefghi...
TELEGRAM_BOT_WEBHOOK=https://yourdomain.com/api/webhooks/telegram
```

### 10.3 Setup n8n

1. Deploy n8n (local o cloud)
2. Crear workflow con nodes:
   - Webhook (trigger)
   - Read from Neon
   - Calculate scores
   - Generate justifications (LLM)
   - Persist to Neon
3. Webhook URL: `https://instance/webhook/recommend`

### 10.4 Setup Telegram Bot

1. Crear bot con @BotFather en Telegram
2. Obtener token
3. Crear webhook: `/api/webhooks/telegram`
4. Set webhook URL en Telegram API

---

## 11. Despliegue

### 11.1 Stack de Producción

- **Frontend/API**: Vercel (Next.js)
- **BD**: Neon (PostgreSQL managed)
- **Automatización**: n8n Cloud o self-hosted
- **Bot**: Telegram Bot API (serverless, sin deploy)

### 11.2 Environment per Stage

```
.env.local        → desarrollo
.env.staging      → staging (Neon staging branch)
.env.production   → producción
```

### 11.3 CI/CD

- Prisma migrations antes de deploy
- Run tests (si existen)
- Deploy a Vercel

---

## 12. Consideraciones de Escalabilidad

- **Índices en Neon**: Genre, tags, mood (críticos)
- **Caching**: Redis para Books catalog (opcional)
- **Rate limiting**: API endpoints
- **Async**: n8n debe ser async, no bloquear web
- **Monitoreo**: Logs en n8n, error tracking en Sentry
- **Batch**: Bulk upload de libros en admin

---

## 13. Testing (Opcional pero Recomendado)

```bash
# Unit tests
npm test

# Integration tests
# - API endpoints
# - Prisma queries
# - n8n webhook calls

# E2E tests
# - Flujo completo: captura → recomendación → feedback
```

---

## 14. Validación de Arquitectura

**¿Por qué esto es un sistema, no un demo?**

✅ Contexto explícito (model estructurado en BD)
✅ Inteligencia orquestada (n8n es agente, no prompt)
✅ Persistencia trazable (todas las decisiones en BD)
✅ Múltiples canales (web + Telegram comparten motor)
✅ Escalable (sin acoplamiento web ↔ n8n)
✅ Defendible (arquitectura clara, decisiones justificadas)

**¿Por qué no es vibecoding?**

❌ No es "un prompt que genera texto"
❌ No pierde contexto entre requests
❌ No está acoplado al UI
❌ Decisiones son reproducibles y trazables
❌ Puedo auditar por qué se recomendó cada libro

