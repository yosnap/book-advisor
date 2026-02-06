# Agentes de Desarrollo - Especificación Completa

Agentes especializados para cubrir **todo el ciclo de desarrollo** del proyecto book-advisor.

---

## Arquitectura Completa de Agentes

```
┌────────────────────────────────────────────────────────────────┐
│              SISTEMA MULTI-AGENTE COMPLETO                    │
└────────────────────────────────────────────────────────────────┘

CAPA DE NEGOCIO (Dominio - Recomendaciones)
├── Orchestrator Agent
├── Context Agent
├── Search Agent
├── Scoring Agent
├── Justifier Agent
└── Persistence Agent
    ↓
CAPA DE DESARROLLO (Ingeniería)
├── Backend Agent
├── Database Agent
├── UX/UI Agent
├── Testing Agent
├── DevOps Agent
├── Security Agent
├── Documentation Agent
└── Code Review Agent
    ↓
CAPA DE INFRASTRUCTURE (MCPs)
├── Neon MCP (BD)
├── n8n MCP (Workflows)
├── Git MCP (Versionamiento)
├── GitHub MCP (Repos)
└── Deploy MCP (Infrastructure)
```

---

## 1. Backend Agent

### Rol
Diseñar e implementar la lógica de servidores, APIs REST, y orquestación de servicios en Next.js.

### Responsabilidades
- Diseñar endpoints REST
- Implementar Server Components
- Integración con Prisma ORM
- Middleware y autenticación
- Rate limiting y caching
- Error handling global

### Inputs
```json
{
  "feature": "libro recomendations endpoint",
  "context": {
    "framework": "Next.js 16",
    "orm": "Prisma",
    "database": "Neon PostgreSQL",
    "agents": ["orchestrator", "context", "search", "scoring"],
    "requirements": {
      "authenticated": false,
      "rateLimit": "100 req/min",
      "caching": "redis",
      "responseTime": "< 5s"
    }
  },
  "existingSchema": { ...prisma schema... },
  "relatedAgents": ["database_agent", "testing_agent"]
}
```

### Outputs
```json
{
  "endpoint": {
    "method": "POST",
    "path": "/api/v1/recommendations",
    "implementation": {
      "file": "src/app/api/v1/recommendations/route.ts",
      "handler": "async function POST(request: NextRequest)",
      "code": "...",
      "tests": ["unit", "integration"],
      "documentation": "..."
    },
    "inputs": {
      "body": { ...json schema... },
      "headers": { ...required headers... },
      "query": { ...optional query params... }
    },
    "outputs": {
      "status": 200,
      "body": { ...response schema... }
    },
    "errors": {
      "400": "Bad Request - invalid payload",
      "401": "Unauthorized - missing auth",
      "429": "Too Many Requests",
      "500": "Internal Server Error"
    },
    "middleware": [
      "rateLimiter",
      "requestValidation",
      "errorHandler",
      "logging"
    ],
    "dependencies": ["prisma", "zod", "next-auth"],
    "environment_vars": [
      "DATABASE_URL",
      "RATE_LIMIT_KEY",
      "REDIS_URL"
    ]
  },
  "implementation_checklist": {
    "design": true,
    "implementation": false,
    "testing": false,
    "documentation": false
  }
}
```

### Tools
- `typescript_compiler`
- `prisma_orm`
- `next_framework`
- `http_methods`
- `validation_schemas` (Zod)
- `authentication_lib` (NextAuth)
- `cache_layer` (Redis)
- `metrics_collector`

### Responsabilidades Específicas

**API Design:**
- RESTful principles
- OpenAPI/Swagger spec
- Versioning strategy
- Rate limiting policies
- Caching strategies

**Implementation:**
- Server Components vs API Routes
- Database queries optimization
- Error handling patterns
- Logging and monitoring
- Performance optimization

**Integration:**
- Con agentes de negocio (Orchestrator, etc)
- Con agentes de BD (Database Agent)
- Con agentes de testing (Testing Agent)
- Con MCPs (Neon MCP, etc)

---

## 2. Database Agent

### Rol
Diseñar, optimizar y mantener el schema de BD y estrategias de persistencia.

### Responsabilidades
- Diseño del schema Prisma
- Índices y optimizaciones
- Migraciones
- Transacciones ACID
- Backup y recovery
- Scaling strategies

### Inputs
```json
{
  "feature": "book recommendations system",
  "dataModel": {
    "entities": [
      {
        "name": "Book",
        "fields": {
          "id": "uuid primary",
          "title": "string unique",
          "author": "string",
          "genre": "string indexed",
          "synopsis": "text",
          "difficulty": "enum",
          "tags": "string[] array",
          "createdAt": "datetime",
          "updatedAt": "datetime"
        }
      }
    ],
    "relationships": [
      {
        "from": "Recommendation",
        "to": "Book",
        "type": "one-to-many",
        "cascade": "delete"
      }
    ],
    "queries": [
      "SELECT books WHERE genre = X",
      "SELECT recommendations WHERE user_id = Y",
      "COUNT recommendations by genre"
    ]
  },
  "constraints": {
    "maxRows": "1 million books",
    "queryPerformance": "< 100ms",
    "transactionVolume": "1000 rec/min"
  },
  "relatedAgents": ["backend_agent", "testing_agent"]
}
```

### Outputs
```json
{
  "schema": {
    "file": "prisma/schema.prisma",
    "database": "postgresql",
    "provider": "neon",
    "version": "1.0.0",
    "models": [
      {
        "name": "Book",
        "fields": [...],
        "indexes": [
          {
            "name": "idx_books_genre",
            "fields": ["genre"],
            "type": "btree"
          }
        ],
        "constraints": [...]
      }
    ]
  },
  "migrations": {
    "initial": {
      "file": "prisma/migrations/001_initial_schema.sql",
      "description": "Create core tables and indexes",
      "sql": "...",
      "rollback": "..."
    }
  },
  "performance": {
    "estimatedQueries": {
      "byGenre": "15ms avg",
      "byAuthor": "12ms avg",
      "recommendations": "45ms avg"
    },
    "indexes": [
      "genre (selectivity: 0.8)",
      "author (selectivity: 0.95)",
      "tags (GIN index for arrays)"
    ],
    "optimization_notes": "..."
  },
  "backup_strategy": {
    "frequency": "daily",
    "retention": "30 days",
    "testRecovery": "weekly"
  }
}
```

### Tools
- `prisma_schema_builder`
- `sql_query_optimizer`
- `index_analyzer`
- `migration_generator`
- `neon_mcp` (para integraciones)
- `query_profiler`
- `load_simulator`

### Responsabilidades Específicas

**Schema Design:**
- Normalización (3NF)
- Data types optimization
- Field constraints
- Relationships modeling

**Performance:**
- Index strategy
- Query optimization
- Connection pooling
- Caching layers (Redis)

**Operations:**
- Migration versioning
- Backup/recovery
- Disaster planning
- Compliance (GDPR, etc)

---

## 3. UX/UI Agent

### Rol
Diseñar experiencias de usuario, interfaces visuales, y componentes reutilizables.

### Responsabilidades
- User research y personas
- Wireframes y prototipos
- Component library design
- Design system
- Accessibility (A11y)
- Responsive design

### Inputs
```json
{
  "feature": "book recommendation form",
  "users": {
    "personas": [
      {
        "name": "María (Novato lector)",
        "painPoints": ["no sabe qué leer", "abrumado por opciones"],
        "goals": ["encontrar libros fáciles", "que le gusten"]
      },
      {
        "name": "Carlos (Lector avanzado)",
        "painPoints": ["quiere recomendaciones personalizadas"],
        "goals": ["descubrir autores nuevos", "libros complejos"]
      }
    ]
  },
  "requirements": {
    "responsive": ["mobile", "tablet", "desktop"],
    "accessibility": "WCAG 2.1 AA",
    "theme": ["light", "dark"],
    "components": ["form", "card", "modal", "loading"]
  },
  "constraints": {
    "framework": "React 18+",
    "styling": "Tailwind CSS",
    "designSystem": "custom"
  },
  "relatedAgents": ["backend_agent", "testing_agent"]
}
```

### Outputs
```json
{
  "design": {
    "figmaUrl": "https://figma.com/...",
    "screens": [
      {
        "name": "Recommendation Form",
        "wireframe": "...",
        "userFlow": "...",
        "components": ["input", "select", "button", "spinner"],
        "states": ["empty", "loading", "success", "error"],
        "accessibility": {
          "ariaLabels": true,
          "keyboardNavigation": true,
          "contrast": "WCAG AA"
        }
      }
    ]
  },
  "components": {
    "implementation": {
      "path": "src/components/RecommendationForm.tsx",
      "component": "RecommendationForm",
      "props": {
        "onSubmit": "callback",
        "loading": "boolean",
        "error": "string | null"
      },
      "code": "...",
      "tests": ["unit", "integration", "a11y"],
      "storybook": "..."
    }
  },
  "designSystem": {
    "colors": {
      "primary": "#2563eb",
      "secondary": "#7c3aed",
      "neutral": "#6b7280"
    },
    "typography": {
      "heading": "font-bold text-2xl",
      "body": "font-normal text-base",
      "small": "font-normal text-sm"
    },
    "spacing": {
      "xs": "0.25rem",
      "sm": "0.5rem",
      "md": "1rem",
      "lg": "1.5rem",
      "xl": "2rem"
    }
  },
  "responsive": {
    "breakpoints": {
      "mobile": "< 640px",
      "tablet": "640px - 1024px",
      "desktop": "> 1024px"
    },
    "adaptations": {
      "mobile": "single column, stack vertically",
      "tablet": "2 columns, larger touch targets",
      "desktop": "multi-column, optimize for mouse"
    }
  },
  "accessibility": {
    "wcag": "2.1 AA compliant",
    "screenReader": true,
    "keyboardOnly": true,
    "colorBlindness": "tested"
  }
}
```

### Tools
- `figma_api`
- `react_component_builder`
- `tailwind_css`
- `storybook`
- `accessibility_checker`
- `responsive_tester`
- `user_research_tools`

### Responsabilidades Específicas

**Design:**
- User personas
- User flows
- Wireframes
- High-fidelity mocks
- Design systems

**Implementation:**
- React components
- Tailwind styling
- Responsive design
- Animation/transitions
- State management (UI)

**Quality:**
- Accessibility testing
- Cross-browser testing
- Performance monitoring
- A/B testing support

---

## 4. Testing Agent

### Rol
Diseñar e implementar estrategias de testing (unit, integration, e2e, performance).

### Responsabilidades
- Test planning
- Unit tests
- Integration tests
- E2E tests
- Performance tests
- Test coverage
- CI/CD validation

### Inputs
```json
{
  "components": [
    {
      "type": "api_endpoint",
      "path": "src/app/api/v1/recommendations/route.ts",
      "method": "POST",
      "functionality": "generate recommendations"
    },
    {
      "type": "react_component",
      "path": "src/components/RecommendationForm.tsx",
      "functionality": "form for capturing reader context"
    },
    {
      "type": "database_query",
      "query": "SELECT * FROM books WHERE genre = $1",
      "criticality": "high"
    }
  ],
  "requirements": {
    "coverage": ">= 80%",
    "framework": "jest",
    "e2eFramework": "playwright",
    "performanceThreshold": "p95 < 5s"
  },
  "relatedAgents": ["backend_agent", "ui_agent"]
}
```

### Outputs
```json
{
  "testStrategy": {
    "pyramid": {
      "unit": "60% (fast, isolated)",
      "integration": "30% (component interactions)",
      "e2e": "10% (critical user flows)"
    },
    "coverage": {
      "target": 80,
      "byComponent": {
        "api_routes": 90,
        "components": 75,
        "utils": 85
      }
    }
  },
  "tests": {
    "unit": {
      "file": "src/components/RecommendationForm.test.tsx",
      "framework": "jest",
      "tests": [
        {
          "name": "renders form fields",
          "type": "snapshot",
          "status": "pending"
        },
        {
          "name": "submits valid data",
          "type": "interaction",
          "status": "pending"
        },
        {
          "name": "shows error on invalid mood",
          "type": "validation",
          "status": "pending"
        }
      ]
    },
    "integration": {
      "file": "src/tests/integration/recommendations.test.ts",
      "framework": "jest + supertest",
      "tests": [
        {
          "name": "POST /api/v1/recommendations with valid context",
          "setup": "seed test database",
          "assertions": ["status 200", "response has books", "response has scores"],
          "status": "pending"
        }
      ]
    },
    "e2e": {
      "file": "e2e/recommendation.spec.ts",
      "framework": "playwright",
      "tests": [
        {
          "name": "user can get book recommendations",
          "steps": [
            "navigate to /",
            "fill mood field",
            "fill interests",
            "submit form",
            "wait for results",
            "verify books displayed"
          ],
          "status": "pending"
        }
      ]
    },
    "performance": {
      "file": "src/tests/performance/recommendations.bench.ts",
      "framework": "k6 o autocannon",
      "tests": [
        {
          "name": "recommendations endpoint - sustained load",
          "vus": 100,
          "duration": "5m",
          "thresholds": {
            "http_req_duration": ["p(95)<5000"],
            "http_req_failed": ["rate<0.1"]
          }
        }
      ]
    }
  },
  "cicd": {
    "pipeline": "GitHub Actions",
    "stages": [
      {
        "name": "lint",
        "script": "npm run lint",
        "failOnError": true
      },
      {
        "name": "unit_tests",
        "script": "npm run test:unit",
        "coverage": ">= 80%"
      },
      {
        "name": "integration_tests",
        "script": "npm run test:integration",
        "timeout": "10m"
      },
      {
        "name": "e2e_tests",
        "script": "npm run test:e2e",
        "timeout": "15m"
      }
    ]
  }
}
```

### Tools
- `jest`
- `testing_library`
- `playwright` / `cypress`
- `k6` / `autocannon` (load testing)
- `coverage_analyzer`
- `github_actions`

### Responsabilidades Específicas

**Planning:**
- Test strategy definition
- Coverage targets
- Test data management
- Test environment setup

**Implementation:**
- Unit test writing
- Integration test design
- E2E test scripting
- Performance test setup

**Automation:**
- CI/CD pipeline
- Automated test execution
- Coverage reporting
- Test result analysis

---

## 5. DevOps Agent

### Rol
Diseñar infraestructura, deployment pipelines, y operaciones en producción.

### Responsabilidades
- Infrastructure as Code (IaC)
- Deployment pipelines
- Monitoring y alerting
- Scaling strategies
- Disaster recovery
- Cost optimization

### Inputs
```json
{
  "application": {
    "framework": "Next.js 16",
    "database": "Neon PostgreSQL",
    "services": ["web", "api", "bot", "workflows"],
    "expectedLoad": "1000 users/day",
    "sla": {
      "availability": "99.9%",
      "responseTime": "p95 < 5s"
    }
  },
  "environment": "production",
  "productionUrl": "https://books.codeia.dev",
  "constraints": {
    "budget": "$500/month",
    "regions": ["EU"]
  },
  "relatedAgents": ["backend_agent", "security_agent"]
}
```

### Outputs
```json
{
  "infrastructure": {
    "provider": "Vercel + Neon + n8n Cloud",
    "architecture": {
      "frontend": {
        "platform": "Vercel",
        "regions": ["eu1"],
        "caching": "edge CDN",
        "scaling": "automatic"
      },
      "backend": {
        "platform": "Vercel Serverless Functions",
        "regions": ["eu-central"],
        "timeout": "300s",
        "memory": "1024MB"
      },
      "database": {
        "platform": "Neon",
        "region": "eu-central-1",
        "pooling": "enabled",
        "backups": "automated daily"
      },
      "workflows": {
        "platform": "n8n Cloud",
        "deployment": "webhook-based"
      }
    }
  },
  "deployment": {
    "strategy": "continuous deployment",
    "pipeline": {
      "trigger": "push to main",
      "steps": [
        {
          "name": "build",
          "command": "npm run build",
          "timeout": "10m"
        },
        {
          "name": "tests",
          "command": "npm run test:all",
          "timeout": "15m",
          "failOnError": true
        },
        {
          "name": "deploy",
          "command": "vercel deploy --prod",
          "timeout": "5m"
        },
        {
          "name": "smoke_tests",
          "command": "npm run test:smoke:prod",
          "timeout": "5m"
        },
        {
          "name": "notify",
          "command": "send deployment notification"
        }
      ]
    }
  },
  "monitoring": {
    "application": {
      "provider": "Vercel Analytics",
      "metrics": [
        "response_time_p95",
        "error_rate",
        "throughput"
      ]
    },
    "database": {
      "provider": "Neon Monitoring",
      "metrics": [
        "query_latency",
        "connection_pool_utilization",
        "storage_usage"
      ]
    },
    "alerting": {
      "provider": "Vercel + Custom",
      "rules": [
        {
          "condition": "error_rate > 1%",
          "action": "page on-call"
        },
        {
          "condition": "response_time_p95 > 10s",
          "action": "alert in Slack"
        }
      ]
    }
  },
  "scaling": {
    "horizontal": "automatic via Vercel",
    "vertical": "upgrade Neon plan as needed",
    "caching": "Redis for frequently accessed data",
    "cdn": "Vercel Edge for static assets"
  },
  "disaster_recovery": {
    "rto": "1 hour",
    "rpo": "15 minutes",
    "backups": {
      "database": "automated daily + point-in-time",
      "code": "GitHub"
    },
    "recovery_procedures": "..."
  }
}
```

### Tools
- `terraform` / `pulumi` (IaC)
- `github_actions` (CI/CD)
- `vercel_api`
- `neon_api`
- `docker`
- `kubernetes` (si aplica)
- `monitoring_tools`

### Responsabilidades Específicas

**Infrastructure:**
- Cloud resource provisioning
- Networking and security groups
- Database configuration
- Load balancing

**Deployment:**
- Build pipeline automation
- Environment management
- Blue-green deployments
- Rollback procedures

**Operations:**
- System monitoring
- Log aggregation
- Alert management
- Incident response

---

## 6. Security Agent

### Rol
Asegurar que la aplicación cumple con estándares de seguridad y privacidad.

### Responsabilidades
- Threat modeling
- Vulnerability scanning
- Authentication/Authorization
- Data encryption
- Compliance (GDPR, etc)
- Security testing

### Inputs
```json
{
  "application": {
    "type": "web + api",
    "data": "user preferences, book recommendations",
    "regulations": ["GDPR"],
    "assets": "book database, user profiles"
  },
  "threats": [
    "SQL injection",
    "XSS attacks",
    "Unauthorized data access",
    "Data breach"
  ],
  "relatedAgents": ["backend_agent", "testing_agent", "devops_agent"]
}
```

### Outputs
```json
{
  "threatModel": {
    "assets": [
      {
        "name": "User Preferences",
        "value": "high",
        "threats": ["unauthorized_access", "data_breach"],
        "mitigations": ["encryption_at_rest", "rbac", "audit_logging"]
      }
    ]
  },
  "implementation": {
    "authentication": {
      "method": "NextAuth.js",
      "providers": ["credentials", "oauth"],
      "mfa": false,
      "sessionTimeout": "24 hours"
    },
    "authorization": {
      "type": "role-based (RBAC)",
      "roles": ["user", "admin"],
      "implementation": "middleware"
    },
    "encryption": {
      "transport": "TLS 1.3 everywhere",
      "atRest": {
        "database": "encrypted at application level",
        "secrets": "encrypted in environment"
      }
    },
    "inputValidation": {
      "framework": "Zod",
      "coverage": "100% of API inputs"
    }
  },
  "compliance": {
    "gdpr": {
      "dataProcessing": "documented",
      "userRights": ["access", "deletion", "portability"],
      "dataRetention": "defined in policy"
    }
  },
  "testing": {
    "sast": "enabled",
    "dast": "monthly",
    "dependencies": "snyk scan"
  }
}
```

### Tools
- `threat_modeling`
- `owasp_tools`
- `snyk` (dependency scanning)
- `sonarqube` (SAST)
- `zap` (DAST)
- `nextauth`
- `encryption_lib`

---

## 7. Documentation Agent

### Rol
Crear y mantener documentación técnica, guías y referencias.

### Responsabilidades
- API documentation
- Architecture docs
- Deployment guides
- Troubleshooting guides
- User guides
- Code comments

### Inputs
```json
{
  "features": [
    {
      "name": "Book Recommendations",
      "endpoint": "POST /api/v1/recommendations",
      "description": "Get personalized book recommendations"
    }
  ],
  "format": "markdown",
  "tools": ["swagger", "docusaurus"]
}
```

### Outputs
```json
{
  "documentation": {
    "api": {
      "file": "docs/api.md",
      "format": "OpenAPI 3.0",
      "endpoints": "all documented"
    },
    "architecture": {
      "file": "docs/architecture.md",
      "diagrams": "mermaid"
    },
    "deployment": {
      "file": "docs/deployment.md",
      "guides": ["development", "production", "troubleshooting"]
    }
  }
}
```

### Tools
- `swagger_editor`
- `docusaurus`
- `markdown_lint`
- `mermaid` (diagrams)

---

## 8. Code Review Agent

### Rol
Revisar calidad de código, adherencia a estándares, y mejores prácticas.

### Responsabilidades
- Code quality review
- Best practices validation
- Performance review
- Security review
- Style guide adherence

### Inputs
```json
{
  "pullRequest": {
    "files_changed": ["src/components/Form.tsx", "src/app/api/route.ts"],
    "changes": "...",
    "relatedIssue": "feat/recommendations"
  }
}
```

### Outputs
```json
{
  "review": {
    "approval": false,
    "comments": [
      {
        "file": "src/components/Form.tsx",
        "line": 42,
        "type": "performance",
        "message": "Consider using useCallback to prevent re-renders"
      }
    ],
    "blockers": 0,
    "suggestions": 3
  }
}
```

---

## Flujo Completo de Desarrollo

```
┌─────────────────────────────────────────────────────────────┐
│ FEATURE REQUEST (nueva funcionalidad)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ 1. DESIGN PHASE             │
         │ (Backend, Database, UX/UI)  │
         └────────────┬────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ 2. IMPLEMENTATION           │
         │ (Backend Agent)             │
         └────────────┬────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ 3. COMPONENT DEVELOPMENT    │
         │ (UX/UI Agent)               │
         └────────────┬────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ 4. DATABASE MIGRATIONS      │
         │ (Database Agent)            │
         └────────────┬────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ 5. TESTING                  │
         │ (Testing Agent)             │
         └────────────┬────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ 6. SECURITY REVIEW          │
         │ (Security Agent)            │
         └────────────┬────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ 7. CODE REVIEW              │
         │ (Code Review Agent)         │
         └────────────┬────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ 8. DOCUMENTATION            │
         │ (Documentation Agent)       │
         └────────────┬────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │ 9. DEPLOYMENT               │
         │ (DevOps Agent)              │
         └────────────┬────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ FEATURE IN PRODUCTION│
            └──────────────────────┘
```

---

## Orquestación de Agentes de Desarrollo

El **Master Development Orchestrator** coordina todos estos agentes:

```python
class MasterDevelopmentOrchestrator:
    def __init__(self):
        self.backend_agent = BackendAgent()
        self.database_agent = DatabaseAgent()
        self.ui_agent = UIAgent()
        self.testing_agent = TestingAgent()
        self.devops_agent = DevOpsAgent()
        self.security_agent = SecurityAgent()
        self.docs_agent = DocsAgent()
        self.review_agent = CodeReviewAgent()

    async def implement_feature(self, feature_spec):
        # Fase 1: Diseño
        db_design = await self.database_agent.design(feature_spec)
        api_design = await self.backend_agent.design(feature_spec, db_design)
        ui_design = await self.ui_agent.design(feature_spec)

        # Fase 2: Implementación
        db_code = await self.database_agent.implement(db_design)
        api_code = await self.backend_agent.implement(api_design)
        ui_code = await self.ui_agent.implement(ui_design)

        # Fase 3: Testing
        tests = await self.testing_agent.create_tests(
            api_code, ui_code, db_code
        )
        test_results = await self.testing_agent.run_tests(tests)

        # Fase 4: Security
        security_review = await self.security_agent.review(
            api_code, db_code
        )

        # Fase 5: Code Review
        review = await self.review_agent.review(
            api_code, ui_code, db_code
        )

        # Fase 6: Documentation
        docs = await self.docs_agent.generate(
            api_design, db_design, ui_design
        )

        # Fase 7: Deployment
        deployment = await self.devops_agent.deploy(
            api_code, ui_code, db_code
        )

        return {
            "feature": feature_spec,
            "implementation": {
                "backend": api_code,
                "database": db_code,
                "ui": ui_code
            },
            "tests": test_results,
            "security": security_review,
            "review": review,
            "documentation": docs,
            "deployment": deployment
        }
```

---

## Matriz de Responsabilidades

| Agente | Feature Design | Implementation | Testing | Security | Docs | Deploy |
|--------|---|---|---|---|---|---|
| Backend | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Database | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| UX/UI | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| Testing | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Security | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| DevOps | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| Documentation | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| Code Review | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ |

✅ = Primary responsibility
⚠️ = Secondary/Review role
