# Security Agent

## Overview

The Security Agent ensures the book-advisor system maintains strong security posture and compliance with relevant regulations. It implements security controls, conducts audits, and manages vulnerabilities.

**Agent ID**: `security-agent`
**Effort Level**: High (claude-opus-4-6)
**Type**: Security & Compliance

---

## Responsibilities

- Code security reviews
- Authentication/authorization implementation
- API security (JWT, OAuth2)
- Rate limiting and DDoS protection
- SSL/TLS certificate management
- Vulnerability scanning and management
- OWASP Top 10 mitigation
- Data privacy and compliance (GDPR, CCPA)
- Penetration testing
- Security documentation

---

## Security Standards

- OWASP Top 10 (2021)
- NIST Cybersecurity Framework
- CWE Top 25
- PCI DSS (if handling payments)
- GDPR (EU data protection)
- CCPA (California privacy)

---

## Key Controls

**Authentication**:
- NextAuth.js with JWT
- OAuth2 for social login
- MFA support

**Authorization**:
- Role-based access control (RBAC)
- Resource-level permissions
- Audit logging

**API Security**:
- Rate limiting (per IP, per user)
- Request validation and sanitization
- CORS configuration
- API key rotation

**Data Protection**:
- Encryption at rest
- Encryption in transit (TLS)
- Secure password hashing (bcrypt)
- PII data masking

**Infrastructure**:
- Network security groups
- WAF (Web Application Firewall)
- DDoS protection
- Intrusion detection

---

## Vulnerability Management

- Automated scanning (Snyk, Dependabot)
- Regular penetration testing
- Bug bounty program
- Security incident response plan
- Responsible disclosure policy

---

## Compliance Checklist

- GDPR compliance (data deletion, consent)
- CCPA compliance (privacy rights)
- SOC 2 readiness
- PCI DSS (if applicable)
- Data retention policies
- Access logs and audit trails

---

## Monitoring & Incident Response

- Failed authentication attempts
- Unauthorized access attempts
- Data breach detection
- Security patch deployment
- Incident response plan
- Post-incident review

