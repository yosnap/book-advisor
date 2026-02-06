# Agent Architecture - book-advisor

Multi-agent system for intelligent book recommendations using context engineering and Claude Opus 4.6 capabilities.

---

## Structure

```
.claude/agents/
├── master-orchestrator.json          # Central coordination config
├── business-logic/                   # Recommendation engine agents
│   ├── orchestrator.json + orchestrator.md
│   ├── context-agent.json + context-agent.md
│   ├── search-agent.json + search-agent.md
│   ├── scoring-agent.json + scoring-agent.md
│   ├── justifier-agent.json + justifier-agent.md
│   └── persistence-agent.json + persistence-agent.md
├── development/                      # Development lifecycle agents
│   ├── backend-agent.json + backend-agent.md
│   ├── database-agent.json + database-agent.md
│   ├── ui-agent.json + ui-agent.md
│   ├── testing-agent.json + testing-agent.md
│   ├── devops-agent.json + devops-agent.md
│   ├── security-agent.json + security-agent.md
│   ├── docs-agent.json + docs-agent.md
│   └── code-review-agent.json + code-review-agent.md
└── README.md                         # This file
```

---

## Agent Files Format

Each agent has two files:

### 1. `{agent-name}.json`
Configuration and specification:
- Agent metadata (name, id, version)
- Role and responsibilities
- Input/output schemas (JSON Schema)
- Dependencies and execution plan
- Tools and capabilities
- Error handling strategies
- Performance targets
- Effort level and model to use

### 2. `{agent-name}.md`
Implementation guide:
- System prompt for the agent
- Detailed workflow specification
- Step-by-step execution instructions
- Error cascade strategies
- Timeout management
- Parallel efficiency notes
- Monitoring metrics
- Example requests/responses
- Implementation notes

---

## Business Logic Agents

### Orchestrator Agent
**Role**: Master coordinator
**Effort**: High (claude-opus-4-6)
**Type**: Non-parallelizable

Coordinates the entire recommendation workflow:
1. Receives user context
2. Delegates to 5 specialized agents
3. Manages parallel execution
4. Aggregates results
5. Handles errors gracefully
6. Persists to database

**File**: `business-logic/orchestrator.md`

### Context Agent
**Role**: Capture and validate reader context
**Effort**: Medium (claude-sonnet-4-5)
**Type**: Parallelizable, fast path

Enriches raw user input with validation and historical data.

**File**: `business-logic/context-agent.md` (TODO)

### Search Agent
**Role**: Query database and filter books
**Effort**: Medium (claude-sonnet-4-5)
**Type**: Parallelizable, depends on context

Executes optimized SQL queries against Neon database.

**File**: `business-logic/search-agent.md` (TODO)

### Scoring Agent
**Role**: Calculate match scores
**Effort**: Medium (claude-sonnet-4-5)
**Type**: Parallelizable, depends on search results

Computes relevance scores using algorithms.

**File**: `business-logic/scoring-agent.md` (TODO)

### Justifier Agent
**Role**: Generate personalized narratives
**Effort**: High (claude-opus-4-6)
**Type**: Parallelizable, depends on scores

Generates compelling explanations for each recommendation.

**File**: `business-logic/justifier-agent.md` (TODO)

### Persistence Agent
**Role**: Save decisions to database
**Effort**: Medium (claude-sonnet-4-5)
**Type**: Parallelizable but critical path

Persists recommendations with ACID guarantees.

**File**: `business-logic/persistence-agent.md` (TODO)

---

## Development Agents

These agents manage the entire development lifecycle:

### Backend Agent
Designs and implements APIs, server components, and middleware.

### Database Agent
Designs, optimizes, and maintains the database schema.

### UX/UI Agent
Designs user interfaces, components, and ensures accessibility.

### Testing Agent
Creates and manages test suites (unit, integration, E2E, performance).

### DevOps Agent
Manages infrastructure, deployment pipelines, and monitoring.

### Security Agent
Ensures security, compliance, and threat mitigation.

### Documentation Agent
Creates API docs, guides, and technical documentation.

### Code Review Agent
Reviews code quality, best practices, and performance.

**Files**: `development/{agent-name}.json` + `{agent-name}.md` (TODO)

---

## How to Use

### 1. For Individual Agent Implementation

Load an agent's `.md` file to get:
- System prompt to feed to Claude
- Detailed specification of what the agent should do
- Step-by-step execution flow
- Error handling strategies
- Monitoring metrics to track

Example:
```
You are implementing the Search Agent.
Load: business-logic/search-agent.md
Use: System Prompt + Workflow Specification
```

### 2. For Orchestration

Load `master-orchestrator.json` to see:
- Which agents exist
- How they interact
- Parallel vs sequential execution
- Timeout policies
- Error recovery strategies

### 3. For Development Workflow

Use development agents to:
- Design before implementing
- Test while coding
- Review code continuously
- Deploy with confidence
- Monitor in production

---

## Execution Model (Claude Opus 4.6)

### Agent Teams Pattern

```
Master Orchestrator (main coordinator)
  ↓
Business Logic Team (parallel execution)
  ├─ Context Agent
  ├─ Search Agent
  ├─ Scoring Agent
  ├─ Justifier Agent
  └─ Persistence Agent
  ↓
Development Team (manages implementation)
  ├─ Backend, Database, UX/UI
  ├─ Testing, DevOps, Security
  └─ Documentation, Code Review
```

### Key Capabilities

1. **Autonomous Coordination** - Agents work without constant intervention
2. **Parallel Execution** - Multiple agents run simultaneously
3. **Context Management** - Long-running workflows with context compaction
4. **Planning & Tool Use** - Complex task breakdown and execution
5. **Effort Controls** - Granular control over intelligence vs speed vs cost

### Effort Levels

- **Low** (claude-haiku-4-5): Simple tasks, documentation, validation
- **Medium** (claude-sonnet-4-5): Business logic, APIs, design
- **High** (claude-opus-4-6): Complex decisions, architecture, orchestration

---

## Standards

**Based on**: Claude Opus 4.6 release standards
**Reference**: https://www.anthropic.com/news/claude-opus-4-6

**Key Principles**:
- Each agent has clear inputs/outputs
- Agents are stateless and composable
- Error handling is graceful and informative
- Observability is built-in
- Context is managed efficiently
- Execution is optimized for parallel performance

---

## Next Steps

1. **Create remaining business-logic agent files** (Context, Search, Scoring, Justifier, Persistence)
2. **Create development agent files** (Backend, Database, UX/UI, Testing, DevOps, Security, Docs, Code Review)
3. **Implement orchestrator logic** in `src/lib/orchestrator.ts`
4. **Create MCP bridges** to connect agents to tools
5. **Test agent coordination** with mock requests
6. **Deploy to production** with monitoring

---

## File Checklist

### Business Logic Agents
- [x] orchestrator.json + orchestrator.md
- [ ] context-agent.json + context-agent.md
- [ ] search-agent.json + search-agent.md
- [ ] scoring-agent.json + scoring-agent.md
- [ ] justifier-agent.json + justifier-agent.md
- [ ] persistence-agent.json + persistence-agent.md

### Development Agents
- [ ] backend-agent.json + backend-agent.md
- [ ] database-agent.json + database-agent.md
- [ ] ui-agent.json + ui-agent.md
- [ ] testing-agent.json + testing-agent.md
- [ ] devops-agent.json + devops-agent.md
- [ ] security-agent.json + security-agent.md
- [ ] docs-agent.json + docs-agent.md
- [ ] code-review-agent.json + code-review-agent.md

---

## Questions?

Refer to:
- `docs/agents-specification.md` - Full agent specifications
- `docs/development-agents.md` - Development agent details
- `docs/mcp-implementation.md` - Tool integration
- `.claude/settings.json` - Project configuration
