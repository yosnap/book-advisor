# PromPack: Prompts Reutilizables

Estos prompts son **reutilizables** en futuros proyectos de Ingeniería de Contexto aplicados a sistemas inteligentes.

---

## 1. Prompt Maestro – Visión de Sistema

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

## 2. Prompt de Arquitectura – Sistema Completo

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

## 3. Prompt de Modelo de Contexto – Lector

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

## 4. Prompt de Flujo – Web a n8n

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

## 5. Prompt del Agente Recomendador – n8n

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

## 6. Prompt de Integración – Bot Telegram

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

## 7. Prompt de Agentes Orquestadores – Arquitectura Multi-Agente

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

## 8. Prompt de MCP – Motor de n8n Integrado

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

## 9. Prompt de MCP – Neon Connector (Reference)

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

## Cómo Usar Estos Prompts

1. **Para diseñar nuevas características**: Usa el prompt maestro (1) + el prompt de arquitectura (2)
2. **Para definir modelos de datos**: Usa el prompt de modelo de contexto (3)
3. **Para diseñar flujos**: Usa el prompt de flujo (4)
4. **Para agentes especializados**: Usa los prompts 5, 6, 7
5. **Para MCPs**: Usa los prompts 8 y 9

Cada prompt es **independiente reutilizable** pero también **complementario** cuando se usan juntos.
