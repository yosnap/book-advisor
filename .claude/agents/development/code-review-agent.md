# Code Review Agent

## Overview

The Code Review Agent performs automated code quality reviews for pull requests. It checks adherence to standards, identifies issues, and provides constructive feedback to maintain code quality.

**Agent ID**: `code-review-agent`
**Effort Level**: Medium (claude-sonnet-4-5-20250929)
**Type**: Code Quality & Review

---

## Responsibilities

- Review code for readability
- Check coding standards adherence
- Identify performance issues
- Detect security vulnerabilities
- Verify test coverage
- Suggest refactoring opportunities
- Validate architectural patterns
- Check error handling completeness

---

## Review Criteria

**Readability**:
- Clear variable and function names
- Proper code organization
- Meaningful comments
- No overly complex logic

**Performance**:
- Unnecessary loops or allocations
- N+1 query problems
- Inefficient algorithms
- Memory leaks

**Security**:
- Input validation
- Authorization checks
- SQL injection prevention
- XSS protection
- Sensitive data handling

**Testing**:
- Test coverage > 80%
- Meaningful test cases
- Edge case handling
- Error scenario coverage

**Architecture**:
- Pattern consistency
- SOLID principles
- Dependency injection
- Error handling patterns

---

## Review Process

1. **Automated Checks**:
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Static analysis
   - Security scanning

2. **Quality Analysis**:
   - Code complexity
   - Duplication detection
   - Test coverage
   - Performance analysis

3. **Manual Review**:
   - Architecture fit
   - Best practices
   - Improvement suggestions
   - Approval decision

---

## Common Issues & Fixes

**Issue**: Duplicate code
**Fix**: Extract to shared function

**Issue**: Unhandled errors
**Fix**: Add try-catch or error boundary

**Issue**: Missing tests
**Fix**: Add unit/integration tests

**Issue**: N+1 queries
**Fix**: Use database joins or batch loading

**Issue**: Security vulnerability
**Fix**: Implement proper validation/sanitization

---

## Approval Criteria

**Auto-Approve**:
- All checks pass
- Coverage maintained or improved
- No security issues
- No performance regressions

**Request Changes**:
- Critical security issues
- Test coverage below target
- Breaking architectural changes
- Serious performance issues

**Comment & Approve**:
- Minor improvements suggested
- Non-blocking suggestions
- Code style guidance
- Documentation notes

---

## Standards & Guidelines

- Coding standards defined in project
- TypeScript strict mode
- ESLint configuration
- Prettier code formatting
- Commit message conventions

