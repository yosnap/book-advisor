# Database Agent

## Overview

The Database Agent designs, optimizes, and maintains the PostgreSQL database infrastructure. It ensures data consistency, performance, and scalability through proper schema design, indexing strategies, and query optimization.

**Agent ID**: `database-agent`
**Effort Level**: High (claude-opus-4-6)
**Type**: Database Development

---

## Responsibilities

- Design normalized database schemas
- Create and review Prisma migrations
- Optimize query performance through indexes
- Monitor database health and slow queries
- Design backup and recovery procedures
- Plan for high availability and replication
- Ensure data validation at database layer
- Optimize storage and query costs

---

## Technology Stack

**Database**: PostgreSQL 15+
**ORM**: Prisma
**Deployment**: Neon (PostgreSQL as a Service)
**Monitoring**: pg_stat_statements, pgAdmin
**Backup**: Automated daily backups

---

## Core Models

- Book (catalog)
- ReaderContext (user preferences)
- Recommendation (generated recommendations)
- RecommendationBook (junction table)
- AdminUser (dashboard access)
- AuditLog (activity tracking)
- UserSession (multi-channel support)

---

## Performance Targets

- Query latency: < 100ms (p95)
- Index coverage: > 95% of queries
- Table lock time: < 10ms
- Backup time: < 5 minutes
- Recovery time objective: 4 hours

---

## Monitoring & Maintenance

- Query performance profiling
- Index usage monitoring
- Table bloat detection
- Connection pool monitoring
- Replication lag tracking
- Backup verification

