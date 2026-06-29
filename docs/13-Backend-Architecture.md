# Backend Architecture Document

Project Name: AI Invoice & Receipt Intake Assistant

Version: 1.0

Runtime:
Node.js 22 LTS

Framework:
Express.js 5

Language:
TypeScript

ORM:
Prisma ORM

Document Type:
Backend Architecture Specification

Prepared By:
Backend Engineering Team

Status:
Draft

---

# Table of Contents

1. Introduction
2. Backend Goals
3. Backend Architecture
4. Clean Architecture
5. Project Structure
6. Module Architecture
7. Request Lifecycle
8. Controllers
9. Services
10. Repositories
11. DTOs & Validation
12. Middleware
13. Background Workers
14. Queue Architecture
15. Database Layer
16. Security
17. Performance
18. Testing
19. Coding Standards

---

# 1. Introduction

The backend provides all business logic, authentication, AI orchestration, OCR integration, exports, notifications, and persistence for the AI Invoice & Receipt Intake Assistant.

The backend follows a layered architecture that separates business logic from infrastructure and external dependencies.

Core principles include:

- Clean Architecture
- Domain-Driven Design
- RESTful APIs
- Type Safety
- Dependency Injection
- Event-driven processing

---

# 2. Backend Goals

The backend shall provide:

✓ Secure APIs

✓ High performance

✓ Modular services

✓ Scalable background processing

✓ Multi-tenant isolation

✓ Comprehensive logging

✓ Robust validation

✓ Easy maintainability

---

# 3. Backend Architecture

```text
REST API

↓

Controllers

↓

Application Services

↓

Domain Services

↓

Repositories

↓

Prisma ORM

↓

PostgreSQL

↓

Redis

↓

BullMQ

↓

External Providers
```

---

# 4. Clean Architecture

```text
Presentation Layer
(Controllers)

↓

Application Layer
(Services)

↓

Domain Layer
(Entities, Interfaces)

↓

Infrastructure Layer
(Prisma, Redis, AI, OCR)

↓

Persistence Layer
(PostgreSQL)
```

---

## Responsibilities

### Controllers

- Handle HTTP requests
- Validate input
- Call services
- Return responses

---

### Services

- Business logic
- Transactions
- Domain workflows
- Queue orchestration

---

### Repositories

- Database access
- CRUD operations
- Query optimization

---

### Providers

- Gemini API
- OCR API
- Google Sheets
- Email
- Storage

---

# 5. Backend Project Structure

```text
server/

src/

├── config/
├── controllers/
├── services/
├── repositories/
├── entities/
├── dto/
├── validators/
├── middleware/
├── routes/
├── providers/
│
├── workers/
│
├── jobs/
│
├── prisma/
│
├── interfaces/
│
├── utils/
│
├── constants/
│
├── types/
│
├── errors/
│
├── logger/
│
└── app.ts
```

---

# 6. Module Architecture

Each feature follows the same structure.

Example

```text
invoice/

invoice.controller.ts

invoice.service.ts

invoice.repository.ts

invoice.routes.ts

invoice.dto.ts

invoice.validator.ts

invoice.types.ts

invoice.constants.ts

invoice.test.ts
```

---

# 7. Request Lifecycle

```text
HTTP Request

↓

Express Router

↓

Authentication Middleware

↓

Authorization Middleware

↓

Validation Middleware

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Response
```

# 8. Controllers

Controllers are responsible only for HTTP concerns.

Responsibilities

- Parse request
- Validate request
- Call service
- Return HTTP response

Controllers must never contain business logic.

Example

```typescript
class InvoiceController {
  async upload(req, res) {
    const invoice = await invoiceService.upload(req);
    return res.status(201).json(invoice);
  }
}
```

---

# 9. Services

Services contain business logic.

Examples

InvoiceService

AuthenticationService

DashboardService

ExportService

ValidationService

NotificationService

SubscriptionService

---

Responsibilities

- Execute workflows
- Coordinate repositories
- Handle transactions
- Publish jobs
- Apply business rules

---

# 10. Repositories

Repositories abstract database operations.

Responsibilities

CRUD

Pagination

Search

Filtering

Transactions

Optimized Queries

---

Example

```typescript
invoiceRepository.findById()

invoiceRepository.create()

invoiceRepository.update()

invoiceRepository.delete()
```

---

# 11. DTOs & Validation

Every API request shall use a DTO.

Validation Library

Zod

---

Example

```typescript
class UploadInvoiceDto {
  file: File
}
```

---

Validation Rules

Email

Invoice Number

Currency

Amount

Date

Role

Subscription

---

# 12. Middleware

Authentication

Authorization

Validation

Logging

Rate Limiting

Error Handling

CORS

Compression

Helmet

---

Middleware Pipeline

```text
Request

↓

Helmet

↓

CORS

↓

Logger

↓

JWT

↓

RBAC

↓

Validation

↓

Controller
```

# 13. Background Workers

Workers process long-running tasks.

Workers

OCR Worker

AI Worker

Export Worker

Notification Worker

Cleanup Worker

Analytics Worker

---

Worker Lifecycle

Queue

↓

Worker

↓

Job

↓

Retry

↓

Complete

---

# 14. Queue Architecture

Technology

BullMQ

Redis

---

Queues

Upload Queue

OCR Queue

AI Queue

Validation Queue

Export Queue

Email Queue

Cleanup Queue

Analytics Queue

---

Retry Strategy

Attempts

3

Delay

30 Seconds

Backoff

Exponential

---

Dead Letter Queue

Failed jobs are moved to DLQ after maximum retries.

Administrators can manually retry them.

---

# 15. Database Layer

ORM

Prisma

---

Responsibilities

CRUD

Transactions

Connection Pooling

Migrations

Type-safe Queries

---

Repository Flow

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

---

# 16. Security

Authentication

JWT

Refresh Tokens

Argon2

---

Authorization

RBAC

---

Encryption

TLS 1.3

AES-256

---

Input Validation

Zod

SQL Injection Protection

Parameterized Queries

Prisma ORM

---

Security Headers

Helmet

Rate Limiting

Audit Logging

---

# 17. Performance Optimization

Connection Pooling

Redis Cache

Batch Inserts

Indexes

Pagination

Background Processing

Lazy Loading

Compression

---

Performance Targets

API Response

<500ms

Dashboard

<2 seconds

Invoice Upload

<3 seconds

AI Processing

<10 seconds

---

# 18. Testing Strategy

Framework

Vitest

Supertest

---

Test Types

Unit Tests

Integration Tests

API Tests

Repository Tests

Worker Tests

Performance Tests

---

Coverage Target

Overall

80%

Critical Modules

90%

---

# 19. Coding Standards

Language

TypeScript (strict mode)

---

Naming

Controllers

PascalCase

Services

PascalCase

Repositories

PascalCase

Interfaces

Prefix I (optional)

Files

kebab-case

Constants

UPPER_SNAKE_CASE

---

Error Handling

Centralized Error Classes

Structured Logging

Consistent API Responses

---

Dependency Injection

Services depend on interfaces rather than concrete implementations.

---

Logging

Every request receives:

Request ID

User ID

Organization ID

Execution Time

Status Code

---

Version History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Complete Backend Architecture |

---

Approval

| Role | Status |
|------|--------|
| Backend Architect | Approved |
| Lead Backend Developer | Pending |
| DevOps Engineer | Pending |
| Security Architect | Pending |
| Product Owner | Pending |