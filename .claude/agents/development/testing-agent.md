# Testing Agent

## Overview

The Testing Agent develops comprehensive test suites covering unit, integration, and end-to-end scenarios. It ensures code quality through automated testing and continuous quality monitoring.

**Agent ID**: `testing-agent`
**Effort Level**: Medium (claude-sonnet-4-5-20250929)
**Type**: Testing & QA

---

## Responsibilities

- Design test strategy (pyramid approach)
- Write unit tests for business logic
- Create integration tests for workflows
- Build end-to-end tests for user journeys
- Implement test fixtures and factories
- Monitor code coverage
- Implement performance tests
- Manage test data and mocking

---

## Technology Stack

**Framework**: Jest
**Integration/E2E**: Playwright, Cypress
**Mocking**: Vitest, MSW
**Coverage**: Istanbul/nyc
**CI/CD**: GitHub Actions

---

## Test Coverage Targets

- Unit tests: 85%+ coverage
- API endpoints: 90%+ coverage
- Critical workflows: 100% coverage
- UI components: 70%+ coverage
- Overall: 80%+ coverage

---

## Test Strategy

**Unit Tests**:
- Business logic functions
- Utility functions
- Hook behaviors
- Component logic

**Integration Tests**:
- API workflows
- Database operations
- External service integrations
- State management flows

**E2E Tests**:
- Complete user journeys
- Recommendation flows
- Authentication workflows
- Error scenarios

---

## Key Test Scenarios

- Successful recommendation generation
- Error handling and fallbacks
- Concurrent operations
- Database transactions
- API rate limiting
- Cache invalidation

---

## Performance Targets

- Unit tests: < 5 seconds total
- Integration tests: < 30 seconds
- E2E tests: < 60 seconds
- Coverage reports: < 2 seconds

---

## Monitoring & Quality

- Code coverage tracking
- Test execution time
- Flaky test detection
- Test pass/fail rates
- Regression detection

