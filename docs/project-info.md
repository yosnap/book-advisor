# Web Inteligente de Recomendación de Libros

**Sesión de Desarrollo · 60 minutos**
**Stack:** Next.js 16 | Neon + Prisma | n8n | Telegram Bot | Tailwind CSS | Pencil.dev

---

## 1. Introducción

En esta sesión desarrollamos un caso real de **Ingeniería de Contexto** aplicado a un **sistema inteligente de recomendación de libros**.

El objetivo es crear un **sistema completo** que:
- Captura contexto del lector (estado de ánimo, perfil, intereses)
- Estructura ese contexto como artefacto explícito
- Orquesta agentes internos y externos
- Delega recomendaciones a un agente IA en n8n
- Persiste datos en BD centralizada (Neon)
- Escala a múltiples canales (Web + Telegram Bot)

**Diferenciales del proyecto:**
- Web inteligente con dashboard de administración para gestión de libros
- Bot de Telegram con la misma funcionalidad que la web
- Base de datos centralizada consultada por agentes
- Arquitectura desacoplada y escalable

---

## 2. Visión del Sistema

No construimos una landing ni un chat con IA.

Construimos un **sistema inteligente gobernado por contexto** que:

1. **Captura** contexto humano del lector
2. **Interpreta** estado emocional, preferencias e intereses
3. **Consulta** catálogo de libros en BD
4. **Delega** decisiones a agente externo (n8n)
5. **Orquesta** múltiples canales (web, Telegram, admin)
6. **Persiste** datos de forma trazable
7. **Escala** sin acoplamiento funcional

**Donde vive la inteligencia:**
- En el **contexto** (modelo de datos explícito)
- En los **flujos** (decisiones desacopladas)
- En la **arquitectura** (responsabilidades claras)
- **NO** en prompts sueltos

---

## 3. Componentes del Sistema

### 3.1 Web Inteligente (Next.js 16)
- Formulario de captura de contexto del lector
- Presentación de recomendaciones razonadas
- Dashboard de administración (CRUD de libros)
- API REST para orquestación
- Server Components para lógica de contexto

### 3.2 Agente Recomendador (n8n Workflow)
- Recibe contexto estructurado desde web
- Analiza: estado de ánimo + perfil + intereses
- Consulta catálogo en Neon
- Devuelve recomendaciones razonadas
- Registra decisión en BD

### 3.3 Base de Datos (Neon + Prisma ORM)
- **Tabla Books:** catálogo de libros (título, autor, género, sinopsis)
- **Tabla ReaderContexts:** perfiles y preferencias
- **Tabla Recommendations:** historial de recomendaciones
- Consultas optimizadas por n8n

### 3.4 Bot de Telegram
- Mismo flujo que web (captura contexto → obtiene recomendación)
- Interfaz conversacional
- Integración con agente n8n
- Persistencia en Neon

### 3.5 Diseño (Pencil.dev)
- Prototipos en Pencil.dev (local)
- Exportación a componentes Tailwind CSS
- Coherencia visual entre web y admin

---

## 4. Objetivos de la Sesión

Al finalizar:

- Sistema de recomendación funcionando end-to-end
- Contexto del lector modelado y persistido
- Agente n8n orquestando recomendaciones basadas en contexto
- Dashboard admin operativo para gestión de libros
- Bot de Telegram integrado y funcional
- Documentación técnica (en `technical-architecture.md`) lista para producción

---

## 5. Flujo de Desarrollo en 60 Minutos

| Bloque       | Duración | Qué hacemos |
|-------------|----------|-----------|
| Visión      | 10 min   | Contexto: problema y arquitectura |
| Modelo      | 15 min   | Diseño del contexto del lector + BD |
| API & n8n   | 15 min   | Flujo web → agente → respuesta |
| Implementación | 15 min | Setup Next.js, Neon, Prisma, flujo |
| Bot & Deploy | 5 min   | Telegram + consideraciones |

---

## 6. PromPack: Prompts Reutilizables

Estos prompts son **reutilizables** en futuros proyectos de Ingeniería de Contexto.

---

### 6.1 Prompt maestro – Visión de sistema

```
Actuamos como equipo de Ingeniería de Contexto.

Queremos diseñar una WEB INTELIGENTE de recomendaciones de libros,
no una landing ni un chat con IA.

El sistema debe:
- capturar contexto del lector (estado de ánimo, perfil, intereses)
- estructurar ese contexto de forma explícita
- tomar decisiones basadas en contexto
- delegar recomendaciones a un agente externo
- ser desplegable y mantenible

Framework web: Next.js 16
El objetivo es un sistema defendible como proyecto profesional.

Antes de generar cualquier cosa:
1. Define la visión del sistema
2. Define qué problema real resolvemos
3. Define por qué esto NO es vibecoding
```

---

### 6.2 Prompt de arquitectura – Sistema completo

```
Actúas como Arquitecto de Software especializado en Ingeniería de Contexto.

Diseña la arquitectura de un sistema inteligente de recomendación de libros:

COMPONENTES:
- Next.js 16 (web inteligente + dashboard admin)
- Neon + Prisma ORM (persistencia)
- n8n workflow (agente recomendador)
- Telegram Bot (canal alternativo)

INCLUYE:
- Rol de cada componente
- Capas del sistema (UI, contexto, decisión, integraciones)
- Qué responsabilidades tiene cada agente
- Flujo de datos entre componentes
- Cómo se orquesta sin acoplamiento

NO escribas código. Formato: Markdown.
```

---

### 6.3 Prompt de modelo de contexto – Lector

```
Actúas como especialista en Ingeniería de Contexto.

Define el MODELO DE CONTEXTO de un lector para recomendación de libros.

INCLUYE:
- Estado emocional / mood
- Perfil lector (novato, avanzado, etc)
- Intereses temáticos (género favorito, temas)
- Intención lectora (relax, aprendizaje, evasión)
- Histórico de recomendaciones

ENTREGA:
1. Explicación conceptual
2. Estructura en JSON (schema para Prisma)
3. Justificación de diseño

Formato: Markdown + JSON Schema.
```

---

### 6.4 Prompt de flujo – Web a n8n

```
Actúas como diseñador de flujos inteligentes.

Diseña el flujo completo:

1. Usuario rellena formulario (contexto)
2. Web captura datos → schema JSON
3. Web invoca n8n webhook
4. n8n recibe contexto
5. n8n consulta BD (Neon)
6. n8n decide recomendaciones
7. n8n devuelve JSON con libros + justificación
8. Web presenta resultado
9. Se registra en BD

INCLUYE:
- Estructura JSON del contexto
- Estructura JSON de respuesta
- Manejo de errores
- Logging / trazabilidad

Habla de flujos y decisiones, no de UI.
Formato: Markdown.
```

---

### 6.5 Prompt del agente recomendador – n8n

```
Actúas como diseñador de workflow en n8n.

El agente debe:
- Recibir contexto estructurado (JSON)
- Consultar tabla Books en Neon
- Analizar estado de ánimo + perfil + intereses
- Matchear con libros disponibles
- Justificar cada recomendación
- Devolver 3-5 recomendaciones ordenadas

DEFINE:
- Inputs esperados
- Lógica de matching (seudocódigo)
- Estructura de salida JSON
- Campos de justificación

Formato: Markdown.
```

---

### 6.6 Prompt de integración – Bot Telegram

```
Actúas como ingeniero de integraciones.

Define cómo el Bot de Telegram se integra en el sistema:

- Bot recibe mensajes del usuario
- Captura contexto (emocional, preferencias)
- Llama a n8n workflow (mismo que web)
- Recibe recomendaciones
- Responde al usuario en Telegram

INCLUYE:
- Flujo de conversación
- Mapping de inputs desde Telegram al contexto
- Persistencia de datos
- Manejo de errores

Formato: Markdown.
```

---

### 6.7 Prompt de agentes orquestadores – Arquitectura multi-agente

```
Actúas como arquitecto de sistemas multi-agente especializado en Ingeniería de Contexto.

Define la arquitectura de agentes para el sistema de recomendación de libros:

AGENTE PRINCIPAL (Orchestrator):
- Rol: Orquestar todo el flujo del sistema
- Responsabilidades: Coordinar subagentes, persistir decisiones
- Inputs: Contexto del usuario
- Outputs: Recomendaciones finales + metadata
- Tools: Subagentes, BD queries, webhooks
- Limitaciones: No decide directamente, delega

SUBAGENTES:
1. Agente Contexto
   - Rol: Capturar y validar contexto
   - Responsabilidades: Parse inputs, enriquecer contexto
   - Tools: Validators, context schema
   - Limitaciones: Solo captura, no decide

2. Agente Búsqueda (Search Agent)
   - Rol: Consultar BD y filtrar libros
   - Responsabilidades: Query Neon, aplicar filtros
   - Tools: Neon MCP, SQL queries, indexing
   - Limitaciones: Solo búsqueda, sin ranking

3. Agente Scoring
   - Rol: Calcular match scores
   - Responsabilidades: Matching logic, calcular scores
   - Tools: Algoritmos, math functions
   - Limitaciones: Score técnico, sin inteligencia

4. Agente Justificador (LLM-based)
   - Rol: Generar justificaciones
   - Responsabilidades: Crear narrativas razonadas
   - Tools: Claude/ChatGPT API, prompt templates
   - Limitaciones: Solo justificaciones, no decisiones

5. Agente Persistencia
   - Rol: Guardar decisiones
   - Responsabilidades: Guardar en BD, logging
   - Tools: Neon MCP, ORM queries
   - Limitaciones: ACID guarantees

FLUJO:
Orchestrator → Contexto → Búsqueda → Scoring → Justificador → Persistencia → Respuesta

SKILLS REQUERIDAS:
- Per agent
- Versioning
- Error handling
- Retry logic
- Observability

Formato: Markdown.
```

---

### 6.8 Prompt de MCP – Motor de n8n integrado

```
Actúas como diseñador de Model Context Protocol (MCP) para n8n.

Especifica un MCP que actúe como puente entre el sistema y n8n:

OBJETIVO:
Permitir que agentes Claude usen n8n workflows como tools nativos.

CAPABILITIES (Tools a exponer):
1. execute_workflow
   - Input: workflowId, payload
   - Output: workflow result
   - Uso: Ejecutar flujos n8n desde agentes

2. list_workflows
   - Output: [{id, name, description}]
   - Uso: Descubrir workflows disponibles

3. get_workflow_schema
   - Input: workflowId
   - Output: JSON schema de inputs/outputs
   - Uso: Validar payloads antes de ejecutar

4. poll_result
   - Input: executionId
   - Output: Status + result JSON
   - Uso: Obtener resultados de ejecuciones async

AUTENTICACIÓN:
- n8n API Key
- Webhook signatures verification

ERRORES A MANEJAR:
- Workflow not found
- Invalid payload schema
- Execution timeout
- Rate limiting

Formato: Markdown + pseudocódigo.
```

---

### 6.9 Prompt de MCP – Neon connector (reference)

```
Nota: Usaremos MCP de Neon existente en repositorio oficial.

Características esperadas:
- query() → ejecutar SQL
- beginTransaction() → ACID
- getSchema() → introspection
- Health checks

Configuración necesaria:
- DATABASE_URL
- Connection pooling
- Retry policies

Referencia: Neon MCP en https://github.com/anthropics/mcp-servers
```

---

## 7. Checklist de Implementación

**Sesión 60 min (Arquitectura & Planning):**
- [ ] Visión y contexto claros
- [ ] Schema Prisma definido (Reader, Books, Recommendations, AdminUsers)
- [ ] Modelo JSON de contexto cerrado
- [ ] Flujo web → n8n → respuesta documentado
- [ ] n8n workflow prototipado
- [ ] Endpoints API en Next.js definidos
- [ ] Telegram Bot architecture bosquejada
- [ ] **Agentes orquestadores definidos** (Orchestrator + Sub-agentes)
- [ ] **MCPs planificados** (Neon MCP + n8n MCP)
- [ ] Repo inicializado con setup básico

**Post-sesión (Desarrollo Fase 1: Core):**
- [ ] Setup completo (Next.js + Neon + Prisma)
- [ ] Schema Prisma migrado a BD
- [ ] Endpoints API en Next.js funcionando
- [ ] n8n workflow integrado con Neon
- [ ] Testing de flujo web → n8n → respuesta

**Fase 2 (Admin & Dashboard):**
- [ ] Dashboard admin CRUD de libros
- [ ] Bulk upload de libros (CSV)
- [ ] Estadísticas de recomendaciones

**Fase 3 (Agentes & MCPs):**
- [ ] MCP Neon implementado
- [ ] MCP n8n creado e integrado
- [ ] Agente Orchestrator en Claude Code
- [ ] Sub-agentes funcionales
- [ ] Testing de flujos multi-agente

**Fase 4 (Canales Alternos):**
- [ ] Bot de Telegram funcional
- [ ] Integración Telegram → MCP Neon
- [ ] Testing e2e

---

## 8. Recursos Técnicos

Ver `docs/technical-architecture.md` para:
- Arquitectura multi-agente y MCPs (Sección 9)
- Schemas Prisma detallados (Sección 3)
- API endpoints (Sección 4)
- Estructura de payloads JSON (Sección 5)
- n8n workflow logic (Sección 6)
- Telegram Bot integration (Sección 7)
- MCP Neon y MCP n8n (Sección 9)
- Setup paso a paso (Sección 10)
- Deploy en producción (Sección 11)

---

> **Principio guía:**
> No construimos webs con IA.
> Construimos **sistemas inteligentes gobernados por contexto, persistidos, trazables y escalables**.
