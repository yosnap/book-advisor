# book-advisor 📚

**Web Inteligente de Recomendación de Libros**

Sistema completo de recomendación de libros gobernado por contexto, persistido, trazable y escalable.

**URL Producción**: https://books.codeia.dev

---

## 🎯 Visión

No construimos una landing ni un chat con IA.

Construimos un **sistema inteligente gobernado por contexto** que:

1. **Captura** contexto humano del lector (mood, perfil, intereses, intención)
2. **Interpreta** preferencias y estado emocional
3. **Consulta** catálogo de libros en BD centralizada
4. **Delega** decisiones a agentes especializados
5. **Orquesta** múltiples canales (web, Telegram, admin)
6. **Persiste** datos de forma trazable y auditada
7. **Escala** sin acoplamiento funcional

---

## 🏗️ Arquitectura

### Stack Tecnológico

| Componente | Tecnología | Rol |
|-----------|-----------|-----|
| **Framework Web** | Next.js 16 | Frontend + API + Server Components |
| **Base de Datos** | Neon (PostgreSQL serverless) | Persistencia centralizada |
| **ORM** | Prisma | Type-safe database access |
| **Workflows** | n8n | Orquestación de agentes |
| **Bot** | Telegram Bot API | Canal conversacional |
| **Estilos** | Tailwind CSS | Diseño responsive |
| **IA** | Claude Opus 4.6 | Orquestación multi-agente |

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────┐
│              WEB INTELIGENTE (Next.js 16)               │
│  • Formulario de captura de contexto                    │
│  • Presentación de recomendaciones razonadas            │
│  • Dashboard de administración (CRUD libros)            │
│  • API REST para orquestación                           │
└────────┬────────────────────────┬──────────────────────┘
         │                        │
         ▼                        ▼
    ┌──────────┐        ┌─────────────────┐
    │ Telegram │        │ ORQUESTADOR n8n │
    │   Bot    │        │   (Workflow)    │
    └──────────┘        └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌──────────────────────┐
         │ BASE DE DATOS NEON   │
         │  • Books             │
         │  • ReaderContexts    │
         │  • Recommendations   │
         │  • AdminUsers        │
         └──────────────────────┘
```

---

## 🤖 Sistema Multi-Agente

Sistema de **14 agentes especializados** basado en Claude Opus 4.6:

### Agentes de Negocio (6)

Responsables del motor de recomendaciones:

1. **Orchestrator Agent** - Coordinador central
   - Orquesta flujo completo
   - Maneja errores y timeouts
   - Gestiona ejecución paralela

2. **Context Agent** - Captura y validación
   - Parsea inputs del usuario
   - Valida esquema
   - Enriquece con datos históricos

3. **Search Agent** - Consultas a BD
   - Queries SQL optimizadas
   - Filtrado por género/tema
   - Caching inteligente

4. **Scoring Agent** - Cálculo de relevancia
   - Matching algorithms
   - Ponderación contextual
   - Ranking de resultados

5. **Justifier Agent** (LLM) - Narrativas personalizadas
   - Justificaciones razonadas
   - Personalización por mood
   - Tono adaptativo

6. **Persistence Agent** - Persistencia ACID
   - Guardar recomendaciones
   - Transacciones garantizadas
   - Auditoría completa

### Agentes de Desarrollo (8)

Gestionan todo el ciclo de desarrollo:

1. **Backend Agent** - APIs y lógica de servidor
2. **Database Agent** - Schema y optimizaciones
3. **UX/UI Agent** - Diseño e interfaces
4. **Testing Agent** - Suite de tests
5. **DevOps Agent** - Infrastructure y deployment
6. **Security Agent** - Seguridad y compliance
7. **Documentation Agent** - Docs técnicas
8. **Code Review Agent** - Calidad de código

---

## 📚 Documentación

### Especificaciones Técnicas

- **[docs/prompts.md](docs/prompts.md)** - 9 PromPacks reutilizables para ingeniería de contexto
- **[docs/agents-specification.md](docs/agents-specification.md)** - Especificación completa de 6 agentes de negocio
- **[docs/development-agents.md](docs/development-agents.md)** - Especificación de 8 agentes de desarrollo
- **[docs/mcp-implementation.md](docs/mcp-implementation.md)** - MCPs (Neon, n8n) y sus tools

### Configuración de Agentes

- **[.claude/agents/README.md](.claude/agents/README.md)** - Guía de arquitectura de agentes
- **[.claude/agents/master-orchestrator.json](.claude/agents/master-orchestrator.json)** - Configuración central
- **[.claude/agents/business-logic/](*.claude/agents/business-logic/)** - Agentes de negocio (json + md)
- **[.claude/agents/development/](.claude/agents/development/)** - Agentes de desarrollo (json + md)

### Proyecto

- **[.claude/settings.json](.claude/settings.json)** - Configuración del proyecto
- **[docs/project-info.md](docs/project-info.md)** - Visión e introducción

---

## 🚀 Fases de Implementación

### ✅ Fase 0: Planificación y Arquitectura (COMPLETADO)

- ✅ Definición de visión y contexto
- ✅ Diseño de arquitectura multi-agente
- ✅ Modelo de datos y contexto
- ✅ Especificación de flujos
- ✅ Documentación de agentes
- ✅ Infraestructura de agentes

### 📋 Fase 1: Core (PRÓXIMO)

- [ ] Setup Next.js + Neon + Prisma
- [ ] Prisma schema completo
- [ ] Endpoints API básicos
- [ ] Orquestador funcional
- [ ] Testing end-to-end

### 📋 Fase 2: Admin & Dashboard

- [ ] Dashboard CRUD de libros
- [ ] Bulk upload (CSV)
- [ ] Estadísticas de recomendaciones

### 📋 Fase 3: Agentes & MCPs

- [ ] Implementar MCPs (Neon, n8n)
- [ ] Agentes individuales funcionando
- [ ] Testing multi-agente

### 📋 Fase 4: Canales Alternos

- [ ] Bot de Telegram
- [ ] Integración completaH
- [ ] Deploy en producción

---

## 🛠️ Cómo Empezar

### Requisitos

- Node.js 18+
- npm o pnpm
- PostgreSQL cliente (psql)

### Variables de Entorno

```bash
# Base de datos
DATABASE_URL=postgresql://neondb_owner:...@ep-...neon.tech/neondb

# APIs
ANTHROPIC_API_KEY=sk-...
N8N_API_KEY=...
TELEGRAM_BOT_TOKEN=...
```

### Instalación

```bash
# Clonar repo
git clone <repo-url>
cd book-advisor

# Instalar dependencias
npm install

# Setup Prisma
npx prisma migrate dev

# Iniciar desarrollo
npm run dev
```

### Acceder

- Web: http://localhost:3000
- API: http://localhost:3000/api

---

## 📊 Estado del Proyecto

**Rama Actual**: main (merged from agents)
**Fase**: Fase 0 - Arquitectura (COMPLETADO)
**Próximo**: Fase 1 - Implementación Core

**Documentación**: ✅ Completa
**Agentes**: ✅ Definidos y especificados (Orchestrator listo)
**Code**: 🚧 Por implementar

---

## 🎓 Estándares

- **Context Engineering**: Sistema gobernado por contexto explícito
- **Claude Opus 4.6**: Agent teams, parallel execution, context compaction
- **Autonomous Coordination**: Agentes coordinan sin intervención constante
- **Type Safety**: TypeScript + Zod para validación
- **Observability**: Métricas, logging y tracing en cada paso

---

## 📖 Referencias

- [Anthropic Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Next.js 16](https://nextjs.org)
- [Neon PostgreSQL](https://neon.tech)
- [n8n Automation](https://n8n.io)

---

## 📝 Licencia

Proyecto de formación - Soluciones WhatsApp en Smart Cities

---

**Última actualización**: Febrero 2026
**Rama**: main
**Commits**: 3 commits de arquitectura completados
