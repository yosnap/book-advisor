# Backend Agent

## Overview

The Backend Agent develops and maintains all server-side APIs, business logic, and integrations for the book-advisor system. It ensures high performance, security, and reliability of backend services.

**Agent ID**: `backend-agent`
**Effort Level**: High (claude-opus-4-6)
**Type**: Backend Development

---

## Responsibilities

- Design RESTful APIs with proper versioning
- Implement request validation and sanitization
- Build authentication (JWT, OAuth) and authorization layers
- Create middleware for logging, error handling, rate limiting
- Optimize database query performance
- Manage caching strategies (Redis, in-memory)
- Build integrations with external services
- Implement event publishing and async processing
- Document API specifications (OpenAPI/Swagger)
- Monitor and debug production issues

---

## Technology Stack

**Framework**: Next.js 15+ with App Router
**Runtime**: Node.js 20+
**Database**: PostgreSQL with Prisma ORM
**Authentication**: NextAuth.js
**Caching**: Redis, next/cache
**API Documentation**: Swagger/OpenAPI
**Testing**: Jest, Supertest

---

## Key Endpoints

### Recommendations Endpoint

```
POST /api/recommendations
GET /api/recommendations/{id}
GET /api/recommendations/user/{userId}
DELETE /api/recommendations/{id}
```

### Health & Status

```
GET /api/health
GET /api/status
GET /api/metrics
```

---

## Architecture Patterns

- API Routes with input validation
- Middleware stack for cross-cutting concerns
- Service layer for business logic
- Repository pattern for data access
- Error boundaries and centralized error handling
- Request logging and distributed tracing

---

## Performance Standards

- Target response time: < 200ms (p50)
- P95 response time: < 500ms
- Cache hit rate: > 80% for recommendations
- Error rate: < 0.1%
- Availability: 99.9% uptime

---

## Monitoring & Observability

- Request logging (all endpoints)
- Error tracking (Sentry)
- Performance metrics (response time, latency)
- Database query monitoring
- Cache hit/miss metrics
- Distributed tracing (OpenTelemetry)

