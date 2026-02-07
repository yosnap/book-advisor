# Workflow n8n: Agente Haiku para Justificaciones de Libros

## Resumen

El workflow recibe libros pre-puntuados desde la API de book-advisor y usa **Claude Haiku** para generar justificaciones profesionales y personalizadas por cada libro recomendado.

**URL:** `https://n8n.codeia.dev/webhook/recommend`
**Metodo:** POST

---

## Arquitectura del flujo

```
Webhook POST → Code (preparar prompt) → AI Agent (Haiku) → Code (formatear respuesta) → Respond to Webhook
```

---

## 1. Nodo: Webhook

- **Tipo:** Webhook
- **Metodo:** POST
- **Path:** `/recommend`
- **Response Mode:** "Respond to Webhook" (para devolver la respuesta del agente)

### Payload que recibe

```json
{
  "contextId": "uuid",
  "userId": "uuid",
  "mood": "reflexivo",
  "readerType": "intermedio",
  "favoriteGenres": ["ficcion", "filosofia"],
  "intention": "aprendizaje",
  "candidates": [
    {
      "bookId": "uuid",
      "title": "Cien anos de soledad",
      "author": "Gabriel Garcia Marquez",
      "genre": "ficcion",
      "synopsis": "La historia de siete generaciones de la familia Buendia...",
      "difficulty": "intermediate",
      "publicationYear": 1967,
      "tags": ["realismo magico", "familia", "soledad", "latinoamerica"],
      "score": 0.82,
      "scoreBreakdown": {
        "interestMatch": 1.0,
        "difficultyMatch": 1.0,
        "moodMatch": 0.65
      },
      "keyReasons": ["ficcion"]
    }
  ]
}
```

---

## 2. Nodo: Code (Preparar prompt)

- **Tipo:** Code (JavaScript)
- **Nombre:** "Preparar Prompt para Haiku"

```javascript
const input = $input.first().json;

const mood = input.mood;
const readerType = input.readerType;
const intention = input.intention;
const genres = input.favoriteGenres.join(', ');
const candidates = input.candidates || [];

const booksDescription = candidates.map((book, idx) => {
  return `### Libro ${idx + 1}: "${book.title}" de ${book.author}
- Genero: ${book.genre}
- Sinopsis: ${book.synopsis}
- Dificultad: ${book.difficulty || 'no especificada'}
- Ano: ${book.publicationYear || 'desconocido'}
- Tags: ${(book.tags || []).join(', ')}
- Puntuacion local: ${(book.score * 100).toFixed(0)}%
- Desglose: interes ${(book.scoreBreakdown.interestMatch * 100).toFixed(0)}%, dificultad ${(book.scoreBreakdown.difficultyMatch * 100).toFixed(0)}%, animo ${(book.scoreBreakdown.moodMatch * 100).toFixed(0)}%`;
}).join('\n\n');

const prompt = `Eres un librero experto y apasionado que conoce profundamente cada libro de su coleccion. Un lector te pide recomendaciones.

## Perfil del lector
- Estado de animo: ${mood}
- Nivel de lectura: ${readerType}
- Intencion: ${intention}
- Generos favoritos: ${genres}

## Libros candidatos (ya puntuados por relevancia)

${booksDescription}

## Tu tarea

Para CADA libro, genera una justificacion unica y profesional que:
1. Explique POR QUE este libro especifico es ideal para este lector en este momento
2. Mencione aspectos concretos del CONTENIDO del libro (temas, estilo narrativo, mensaje)
3. Conecte el libro con el estado de animo y la intencion del lector
4. Sea diferente para cada libro (NO uses la misma estructura o frases repetidas)
5. Tenga entre 2-3 oraciones, tono calido pero profesional
6. Incluye 2-3 razones clave concretas por libro

Responde EXCLUSIVAMENTE en JSON valido con este formato:
{
  "recommendations": [
    {
      "rank": 1,
      "bookId": "uuid del libro",
      "title": "titulo",
      "author": "autor",
      "genre": "genero",
      "matchScore": 0.82,
      "justification": "Tu justificacion unica aqui...",
      "keyReasons": ["razon concreta 1", "razon concreta 2"],
      "reasoning": {
        "mood_match": 0.8,
        "genre_match": 0.9,
        "intention_match": 0.7,
        "reader_level_match": 0.85
      }
    }
  ]
}`;

return [{
  json: {
    prompt,
    contextId: input.contextId,
    userId: input.userId,
    candidates
  }
}];
```

---

## 3. Nodo: AI Agent (Claude Haiku)

- **Tipo:** AI Agent o HTTP Request (segun tu configuracion de n8n)

### Opcion A: Nodo "Anthropic Chat Model" (recomendado)

Si tienes el nodo de Anthropic en n8n:

1. Agrega un nodo **"AI Agent"**
2. Conecta un **"Anthropic Chat Model"** como sub-nodo
3. Configura:
   - **Model:** `claude-haiku-4-5-20251001`
   - **Max Tokens:** 2000
   - **Temperature:** 0.7
4. En el AI Agent, usa `{{ $json.prompt }}` como mensaje

### Opcion B: HTTP Request a la API de Anthropic

Si prefieres usar HTTP Request directamente:

- **URL:** `https://api.anthropic.com/v1/messages`
- **Method:** POST
- **Headers:**
  - `x-api-key`: `{{ $credentials.anthropicApi.apiKey }}` (o tu API key)
  - `anthropic-version`: `2023-06-01`
  - `content-type`: `application/json`
- **Body:**

```json
{
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 2000,
  "temperature": 0.7,
  "messages": [
    {
      "role": "user",
      "content": "{{ $json.prompt }}"
    }
  ]
}
```

---

## 4. Nodo: Code (Formatear respuesta)

- **Tipo:** Code (JavaScript)
- **Nombre:** "Formatear Respuesta"

```javascript
const input = $input.first().json;
const contextId = $('Preparar Prompt para Haiku').first().json.contextId;

// Extraer el texto de la respuesta de Haiku
let responseText = '';

// Si viene del nodo AI Agent
if (input.output) {
  responseText = input.output;
}
// Si viene del HTTP Request a la API
else if (input.content && input.content[0]) {
  responseText = input.content[0].text;
}
// Fallback
else {
  responseText = JSON.stringify(input);
}

// Extraer JSON de la respuesta (puede venir envuelto en markdown)
let jsonStr = responseText;
const jsonMatch = responseText.match(/```json?\s*([\s\S]*?)\s*```/);
if (jsonMatch) {
  jsonStr = jsonMatch[1];
}

// Intentar limpiar si hay texto antes/despues del JSON
const braceStart = jsonStr.indexOf('{');
const braceEnd = jsonStr.lastIndexOf('}');
if (braceStart !== -1 && braceEnd !== -1) {
  jsonStr = jsonStr.substring(braceStart, braceEnd + 1);
}

try {
  const parsed = JSON.parse(jsonStr);

  return [{
    json: {
      contextId,
      recommendations: parsed.recommendations || []
    }
  }];
} catch (e) {
  // Si falla el parse, devolver las candidatas originales con justificacion basica
  const candidates = $('Preparar Prompt para Haiku').first().json.candidates || [];

  return [{
    json: {
      contextId,
      recommendations: candidates.map((c, idx) => ({
        rank: idx + 1,
        bookId: c.bookId,
        title: c.title,
        author: c.author,
        genre: c.genre,
        matchScore: c.score,
        justification: c.synopsis || 'Recomendado para ti.',
        keyReasons: c.keyReasons || [],
        reasoning: {
          mood_match: c.scoreBreakdown.moodMatch,
          genre_match: c.scoreBreakdown.interestMatch,
          intention_match: 0.5,
          reader_level_match: c.scoreBreakdown.difficultyMatch
        }
      }))
    }
  }];
}
```

---

## 5. Nodo: Respond to Webhook

- **Tipo:** Respond to Webhook
- **Response Body:** `{{ JSON.stringify($json) }}`
- **Content-Type:** `application/json`
- **Status Code:** 200

---

## Configuracion de credenciales

En n8n, ve a **Settings > Credentials** y crea:

1. **Anthropic API** (si usas el nodo nativo):
   - API Key: tu clave de Anthropic

2. **Header Auth** (si usas HTTP Request):
   - Name: `x-api-key`
   - Value: tu clave de Anthropic

---

## Variable de entorno en Next.js

```bash
N8N_WEBHOOK_URL=https://n8n.codeia.dev/webhook/recommend
```

---

## Flujo de datos completo

```
1. Usuario envia contexto (mood, perfil, generos, intencion)
      |
2. API /api/v1/recommendations (Next.js)
      |
      ├── Busca libros en BD (Prisma)
      ├── Puntua localmente (scoring deterministico)
      ├── Construye candidates[] con datos completos
      |
3. Envia candidates + contexto a n8n webhook
      |
4. n8n: Code prepara prompt para Haiku
      |
5. n8n: Haiku genera justificaciones unicas por libro
      |
6. n8n: Code formatea respuesta JSON
      |
7. API recibe justificaciones y las fusiona con datos locales
      |
8. Si n8n falla → fallback local (synopsis + tags como justificacion)
```

---

## Ejemplo de respuesta esperada de n8n

```json
{
  "contextId": "cm...",
  "recommendations": [
    {
      "rank": 1,
      "bookId": "cm...",
      "title": "Cien anos de soledad",
      "author": "Gabriel Garcia Marquez",
      "genre": "ficcion",
      "matchScore": 0.82,
      "justification": "En un momento reflexivo como el tuyo, sumergirte en Macondo es dejarte llevar por una narrativa que convierte la soledad en poesia. Garcia Marquez teje generaciones enteras con un realismo magico que invita a la contemplacion pausada, ideal para quien busca aprender sobre la condicion humana a traves de la ficcion.",
      "keyReasons": [
        "Narrativa contemplativa ideal para estado reflexivo",
        "Realismo magico que conecta con busqueda de aprendizaje",
        "Nivel intermedio accesible con profundidad tematica"
      ],
      "reasoning": {
        "mood_match": 0.8,
        "genre_match": 0.95,
        "intention_match": 0.75,
        "reader_level_match": 0.9
      }
    }
  ]
}
```
