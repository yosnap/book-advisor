# Model Context Protocol (MCP) - Implementación

Especificación de MCPs para integración de agentes Claude con n8n y Neon.

---

## Visión General

```
┌─────────────────────────────────────┐
│     Claude Agents (book-advisor)    │
└──────────┬──────────────────────────┘
           │
        ┌──┴──┐
        │ MCP │ (Model Context Protocol)
        └──┬──┘
           │
      ┌────┴────┐
      ▼         ▼
┌──────────┐ ┌────────────────────┐
│ Neon MCP │ │ n8n Workflows MCP  │
└────┬─────┘ └─────────┬──────────┘
     │                 │
     ▼                 ▼
  Neon DB          n8n Platform
(PostgreSQL)    (Workflow Engine)
```

---

## 1. Neon MCP (Base de Datos)

### Propósito
Permitir que los agentes Claude ejecuten queries SQL contra la base de datos Neon con transacciones ACID.

### Características Principales
- Ejecutar queries SQL arbitrarias
- Manejo de transacciones (BEGIN, COMMIT, ROLLBACK)
- Introspección de schema
- Health checks
- Connection pooling

### Configuración

```json
{
  "name": "neon-mcp",
  "version": "1.0.0",
  "type": "database",
  "config": {
    "databaseUrl": "${DATABASE_URL}",
    "pooling": {
      "enabled": true,
      "minConnections": 2,
      "maxConnections": 10,
      "connectionTimeoutMs": 5000,
      "idleTimeoutMs": 30000
    },
    "retryPolicy": {
      "maxRetries": 3,
      "backoffMs": [100, 500, 1000],
      "retryableErrors": [
        "ECONNREFUSED",
        "ENOTFOUND",
        "ETIMEDOUT",
        "OperationalError"
      ]
    },
    "ssl": {
      "enabled": true,
      "channelBinding": "required"
    }
  }
}
```

### Tools Disponibles

#### 1.1 `query(sql, params)`

Ejecutar una query SQL (SELECT, INSERT, UPDATE, DELETE).

**Signature:**
```typescript
query(
  sql: string,
  params?: any[],
  options?: {
    timeout?: number,
    maxRows?: number,
    parseJSON?: boolean
  }
): Promise<QueryResult>
```

**Inputs:**
```json
{
  "sql": "SELECT * FROM books WHERE genre = $1 LIMIT 10",
  "params": ["ficción"],
  "options": {
    "timeout": 5000,
    "maxRows": 100,
    "parseJSON": true
  }
}
```

**Outputs:**
```json
{
  "success": true,
  "rows": [
    {
      "id": "uuid",
      "title": "El Quijote",
      "author": "Cervantes",
      "genre": "ficción",
      "synopsis": "...",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "rowCount": 1,
  "executionTimeMs": 45,
  "columns": ["id", "title", "author", "genre", "synopsis", "createdAt"]
}
```

**Error Handling:**
```json
{
  "success": false,
  "error": {
    "code": "QUERY_TIMEOUT",
    "message": "Query exceeded 5000ms timeout",
    "sqlState": null,
    "details": {}
  }
}
```

#### 1.2 `beginTransaction()`

Iniciar una transacción ACID.

**Signature:**
```typescript
beginTransaction(): Promise<TransactionHandle>
```

**Outputs:**
```json
{
  "success": true,
  "transactionId": "txn-abc-123",
  "isolation": "read_committed",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 1.3 `commit(transactionId)`

Confirmar transacción.

**Signature:**
```typescript
commit(transactionId: string): Promise<CommitResult>
```

**Outputs:**
```json
{
  "success": true,
  "transactionId": "txn-abc-123",
  "duration": 120,
  "rowsAffected": 5
}
```

#### 1.4 `rollback(transactionId)`

Revertir transacción en caso de error.

**Signature:**
```typescript
rollback(transactionId: string): Promise<RollbackResult>
```

**Outputs:**
```json
{
  "success": true,
  "transactionId": "txn-abc-123",
  "duration": 50
}
```

#### 1.5 `getSchema(table?, full?)`

Introspección del schema de la base de datos.

**Signature:**
```typescript
getSchema(
  table?: string,
  full?: boolean
): Promise<SchemaInfo>
```

**Inputs:**
```json
{
  "table": "books",
  "full": true
}
```

**Outputs:**
```json
{
  "success": true,
  "tables": {
    "books": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "isPrimaryKey": true,
          "defaultValue": null,
          "constraints": ["PRIMARY KEY"]
        },
        {
          "name": "title",
          "type": "varchar(255)",
          "nullable": false,
          "isPrimaryKey": false,
          "constraints": ["NOT NULL", "UNIQUE"]
        },
        {
          "name": "genre",
          "type": "varchar(100)",
          "nullable": true,
          "isPrimaryKey": false,
          "constraints": []
        }
      ],
      "indexes": [
        {
          "name": "idx_books_genre",
          "columns": ["genre"],
          "unique": false
        }
      ],
      "foreignKeys": []
    }
  }
}
```

#### 1.6 `healthCheck()`

Verificar conexión y estado del servidor.

**Signature:**
```typescript
healthCheck(): Promise<HealthStatus>
```

**Outputs:**
```json
{
  "success": true,
  "status": "healthy",
  "connectionPool": {
    "active": 3,
    "idle": 7,
    "waiting": 0,
    "capacity": 10
  },
  "database": {
    "version": "15.2",
    "uptime": 3600
  },
  "lastCheck": "2024-01-15T10:30:00Z"
}
```

---

## 2. n8n Workflows MCP

### Propósito
Permitir que los agentes Claude ejecuten y monitoreen workflows de n8n, actuando como orquestador de flujos complejos.

### Características Principales
- Ejecutar workflows n8n (sync/async)
- Listar workflows disponibles
- Obtener schema de inputs/outputs
- Polling para resultados async
- Manejo de errores y timeouts

### Configuración

```json
{
  "name": "n8n-workflows-mcp",
  "version": "1.0.0",
  "type": "workflow_engine",
  "config": {
    "baseUrl": "https://cloud.n8n.io",
    "apiKey": "${N8N_API_KEY}",
    "authentication": "bearer_token",
    "webhookSignatureVerification": true,
    "webhookSecret": "${N8N_WEBHOOK_SECRET}",
    "defaults": {
      "timeout": 30000,
      "maxPolls": 60,
      "pollInterval": 1000
    },
    "rateLimiting": {
      "maxRequestsPerMinute": 100,
      "maxConcurrentWorkflows": 10
    }
  }
}
```

### Tools Disponibles

#### 2.1 `execute_workflow(workflowId, payload, options)`

Ejecutar un workflow n8n.

**Signature:**
```typescript
execute_workflow(
  workflowId: string,
  payload: object,
  options?: {
    async?: boolean,
    timeout?: number,
    webhookPath?: string,
    priority?: 'low' | 'normal' | 'high'
  }
): Promise<ExecutionResult>
```

**Inputs:**
```json
{
  "workflowId": "wf-book-recommendations-v1",
  "payload": {
    "mood": "triste",
    "readerProfile": "avanzado",
    "interests": ["ficción", "desarrollo"],
    "intent": "evasión",
    "userId": "user-123"
  },
  "options": {
    "async": false,
    "timeout": 15000,
    "priority": "high"
  }
}
```

**Outputs (Synchronous):**
```json
{
  "success": true,
  "executionId": "exec-abc-123",
  "status": "success",
  "duration": 2500,
  "data": {
    "recommendations": [
      {
        "bookId": "book-1",
        "title": "1984",
        "author": "Orwell",
        "score": 0.92,
        "justification": "..."
      }
    ],
    "metadata": {
      "totalScore": 0.92,
      "processingTime": 2400
    }
  }
}
```

**Outputs (Asynchronous):**
```json
{
  "success": true,
  "executionId": "exec-def-456",
  "status": "running",
  "webhookUrl": "https://your-app/webhooks/n8n/exec-def-456",
  "message": "Workflow submitted for async execution. Results will be posted to webhook URL."
}
```

#### 2.2 `list_workflows(filter?)`

Listar todos los workflows disponibles.

**Signature:**
```typescript
list_workflows(filter?: {
  name?: string,
  tags?: string[],
  active?: boolean
}): Promise<WorkflowList>
```

**Inputs:**
```json
{
  "filter": {
    "tags": ["recommendations", "books"],
    "active": true
  }
}
```

**Outputs:**
```json
{
  "success": true,
  "count": 3,
  "workflows": [
    {
      "id": "wf-book-recommendations-v1",
      "name": "Book Recommendation Engine",
      "description": "Main workflow for generating book recommendations",
      "version": "1.0.0",
      "active": true,
      "tags": ["recommendations", "books", "core"],
      "created": "2024-01-10T09:00:00Z",
      "updated": "2024-01-15T10:00:00Z",
      "createdBy": "admin",
      "executionsCount": 156
    },
    {
      "id": "wf-justification-generator",
      "name": "Justification Generator",
      "description": "Generate detailed justifications for recommendations",
      "version": "1.0.0",
      "active": true,
      "tags": ["justification", "books"],
      "created": "2024-01-12T09:00:00Z",
      "updated": "2024-01-15T10:00:00Z",
      "createdBy": "admin",
      "executionsCount": 152
    }
  ]
}
```

#### 2.3 `get_workflow_schema(workflowId)`

Obtener el schema JSON de inputs/outputs de un workflow.

**Signature:**
```typescript
get_workflow_schema(workflowId: string): Promise<WorkflowSchema>
```

**Inputs:**
```json
{
  "workflowId": "wf-book-recommendations-v1"
}
```

**Outputs:**
```json
{
  "success": true,
  "workflowId": "wf-book-recommendations-v1",
  "version": "1.0.0",
  "inputSchema": {
    "type": "object",
    "required": ["mood", "readerProfile", "interests", "intent"],
    "properties": {
      "mood": {
        "type": "string",
        "enum": ["feliz", "triste", "reflexivo", "ansioso", "neutral"],
        "description": "Current emotional state"
      },
      "readerProfile": {
        "type": "string",
        "enum": ["novato", "intermedio", "avanzado", "experto"],
        "description": "Reader experience level"
      },
      "interests": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Array of interests/genres",
        "examples": ["ficción", "historia", "desarrollo"]
      },
      "intent": {
        "type": "string",
        "enum": ["relax", "aprendizaje", "evasión"],
        "description": "Reading intention"
      },
      "userId": {
        "type": "string",
        "format": "uuid",
        "description": "Optional user ID for personalization"
      }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "recommendations": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "bookId": { "type": "string" },
            "title": { "type": "string" },
            "author": { "type": "string" },
            "score": { "type": "number", "minimum": 0, "maximum": 1 },
            "justification": { "type": "string" }
          }
        }
      },
      "metadata": {
        "type": "object",
        "properties": {
          "totalScore": { "type": "number" },
          "processingTime": { "type": "number" }
        }
      }
    }
  }
}
```

#### 2.4 `poll_result(executionId, options?)`

Polling para obtener resultado de ejecución async.

**Signature:**
```typescript
poll_result(
  executionId: string,
  options?: {
    maxWait?: number,
    pollInterval?: number
  }
): Promise<PollResult>
```

**Inputs:**
```json
{
  "executionId": "exec-def-456",
  "options": {
    "maxWait": 30000,
    "pollInterval": 2000
  }
}
```

**Outputs:**
```json
{
  "success": true,
  "executionId": "exec-def-456",
  "status": "success",
  "pollAttempts": 5,
  "totalWaitTime": 10000,
  "data": {
    "recommendations": [...],
    "metadata": {...}
  }
}
```

#### 2.5 `get_execution_status(executionId)`

Obtener estado actual de una ejecución.

**Signature:**
```typescript
get_execution_status(executionId: string): Promise<ExecutionStatus>
```

**Outputs:**
```json
{
  "success": true,
  "executionId": "exec-abc-123",
  "workflowId": "wf-book-recommendations-v1",
  "status": "success",
  "started": "2024-01-15T10:30:00Z",
  "completed": "2024-01-15T10:30:02Z",
  "duration": 2000,
  "errorMessage": null,
  "data": { ... }
}
```

---

## 3. Integración de MCPs en Agentes

### Ejemplo: Orchestrator usando MCPs

```python
class OrchestratorAgent:
    def __init__(self, mcp_neon, mcp_n8n):
        self.mcp_neon = mcp_neon
        self.mcp_n8n = mcp_n8n

    async def execute(self, user_context):
        # Paso 1: Validar contexto usando Neon MCP
        schema = await self.mcp_neon.getSchema('users')

        # Paso 2: Ejecutar workflow de recomendación en n8n
        result = await self.mcp_n8n.execute_workflow(
            'wf-book-recommendations-v1',
            user_context,
            options={'async': False, 'timeout': 15000}
        )

        # Paso 3: Persistir resultado en Neon
        await self.mcp_neon.query(
            """
            INSERT INTO recommendations
            (user_id, recommendation_data, created_at)
            VALUES ($1, $2, NOW())
            """,
            [user_context['userId'], json.dumps(result['data'])]
        )

        return result
```

### Ejemplo: Context Agent usando Neon MCP

```python
class ContextAgent:
    def __init__(self, mcp_neon):
        self.mcp_neon = mcp_neon

    async def enrich_context(self, user_id, context):
        # Obtener histórico del usuario
        history = await self.mcp_neon.query(
            """
            SELECT interests, mood_patterns
            FROM user_profiles
            WHERE user_id = $1
            """,
            [user_id]
        )

        # Enriquecer contexto con datos históricos
        enriched = {**context, 'history': history['rows'][0]}
        return enriched
```

---

## 4. Manejo de Errores en MCPs

### Error Types

```json
{
  "AUTHENTICATION_ERROR": {
    "code": 401,
    "message": "Invalid API key or token",
    "recoverable": false
  },
  "WORKFLOW_NOT_FOUND": {
    "code": 404,
    "message": "Workflow ID not found",
    "recoverable": false
  },
  "VALIDATION_ERROR": {
    "code": 400,
    "message": "Payload does not match workflow schema",
    "recoverable": false
  },
  "TIMEOUT_ERROR": {
    "code": 408,
    "message": "Workflow execution exceeded timeout",
    "recoverable": true
  },
  "RATE_LIMIT_ERROR": {
    "code": 429,
    "message": "Rate limit exceeded",
    "recoverable": true
  },
  "EXECUTION_ERROR": {
    "code": 500,
    "message": "Workflow failed during execution",
    "recoverable": true
  },
  "CONNECTION_ERROR": {
    "code": 503,
    "message": "Cannot connect to service",
    "recoverable": true
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "type": "TIMEOUT_ERROR",
    "code": 408,
    "message": "Workflow execution exceeded timeout after 15000ms",
    "details": {
      "workflowId": "wf-book-recommendations-v1",
      "executionId": "exec-abc-123",
      "timeoutMs": 15000,
      "recoverable": true,
      "suggestedAction": "retry_with_longer_timeout"
    }
  }
}
```

---

## 5. Configuración de Desarrollo

### Environment Variables

```bash
# Neon
DATABASE_URL=postgresql://neondb_owner:npg_Ts6EWcSthbI5@ep-mute-bread-ag0ndobb-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# n8n
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_SECRET=your-webhook-secret
N8N_BASE_URL=https://cloud.n8n.io

# Claude
ANTHROPIC_API_KEY=your-claude-api-key
```

### Inicializar MCPs en Proyecto

```bash
# Instalar dependencias MCP
npm install @anthropic-ai/sdk @modelcontextprotocol/sdk

# Configurar en settings.json
# Ver .claude/settings.json para configuración completa
```

---

## 6. Testing de MCPs

### Test Suite

```javascript
describe('Neon MCP', () => {
  describe('query()', () => {
    it('should execute SELECT queries', async () => {
      const result = await mcp.query(
        'SELECT * FROM books LIMIT 1'
      );
      expect(result.success).toBe(true);
      expect(result.rows).toHaveLength(1);
    });

    it('should handle parameterized queries', async () => {
      const result = await mcp.query(
        'SELECT * FROM books WHERE genre = $1',
        ['ficción']
      );
      expect(result.success).toBe(true);
    });
  });

  describe('Transactions', () => {
    it('should commit transaction', async () => {
      const txn = await mcp.beginTransaction();
      await mcp.query(
        'INSERT INTO books (...) VALUES (...)',
        [],
        { transactionId: txn.transactionId }
      );
      const result = await mcp.commit(txn.transactionId);
      expect(result.success).toBe(true);
    });
  });
});

describe('n8n Workflows MCP', () => {
  describe('execute_workflow()', () => {
    it('should execute workflow synchronously', async () => {
      const result = await mcp.execute_workflow(
        'wf-book-recommendations-v1',
        {
          mood: 'feliz',
          readerProfile: 'avanzado',
          interests: ['ficción'],
          intent: 'relax'
        }
      );
      expect(result.success).toBe(true);
      expect(result.data.recommendations).toBeDefined();
    });
  });

  describe('list_workflows()', () => {
    it('should list all active workflows', async () => {
      const result = await mcp.list_workflows({ active: true });
      expect(result.success).toBe(true);
      expect(result.workflows).toBeInstanceOf(Array);
    });
  });
});
```

---

## 7. Monitoring y Observability

### Métricas de MCP

```json
{
  "neon_mcp": {
    "total_queries": 1234,
    "successful_queries": 1210,
    "failed_queries": 24,
    "average_query_time_ms": 45,
    "p95_query_time_ms": 120,
    "p99_query_time_ms": 250,
    "active_connections": 5,
    "connection_pool_utilization": 0.5
  },
  "n8n_mcp": {
    "total_executions": 567,
    "successful_executions": 545,
    "failed_executions": 22,
    "average_execution_time_ms": 2400,
    "p95_execution_time_ms": 8000,
    "timeout_errors": 5,
    "rate_limit_errors": 2
  }
}
```

### Logging Requerido

Cada MCP debe loguear:
- Request recibido (sin datos sensibles)
- Validación de inputs
- Ejecución iniciada/completada
- Errors (con stack trace)
- Response devuelto
- Timing y métricas
