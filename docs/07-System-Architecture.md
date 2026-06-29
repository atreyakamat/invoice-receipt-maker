# System Architecture Document

Project Name: AI Invoice & Receipt Intake Assistant

Version: 1.0

Prepared By:
Solution Architecture Team

Document Type:
System Architecture Specification

Status:
Draft

---

# Table of Contents

1. Introduction
2. Architecture Goals
3. Architectural Principles
4. High-Level Architecture
5. Layered Architecture
6. Component Architecture
7. Module Architecture
8. Request Lifecycle
9. Data Flow
10. Technology Mapping
11. Architecture Decisions

---

# 1. Introduction

The AI Invoice & Receipt Intake Assistant is designed as a cloud-native, modular, event-driven SaaS platform capable of processing invoices at enterprise scale.

The architecture prioritizes:

• Scalability

• Security

• Maintainability

• Performance

• High Availability

• AI Integration

The platform follows modern software engineering practices including Clean Architecture, Domain-Driven Design (DDD), RESTful APIs, asynchronous processing, and cloud-native deployment.

---

# 2. Architecture Goals

The architecture has been designed to satisfy the following objectives:

### Scalability

Support thousands of organizations and millions of invoices.

---

### Reliability

Ensure fault tolerance through queues, retries, and health monitoring.

---

### Maintainability

Separate business logic from infrastructure and presentation.

---

### Extensibility

Allow future integration with:

- QuickBooks
- Xero
- Zoho Books
- SAP
- Tally
- ERP Systems

without modifying core modules.

---

### Security

Protect sensitive financial data using encryption, RBAC, and audit logging.

---

### Performance

Average invoice processing

<15 seconds

Dashboard load

<2 seconds

API response

<500 ms

---

# 3. Architectural Principles

## Clean Architecture

Business logic remains independent of:

- Database
- Frameworks
- UI
- External APIs

Advantages

✓ Easy testing

✓ Replaceable infrastructure

✓ Better maintainability

---

## Domain-Driven Design (DDD)

Core Domains

Authentication

Organizations

Invoices

OCR

AI Extraction

Validation

Export

Billing

Administration

Each domain has its own services, entities, repositories, and APIs.

---

## API-First Design

Every feature is exposed through REST APIs.

Benefits

Future mobile applications

Third-party integrations

Public developer APIs

---

## Event-Driven Processing

Long-running operations execute asynchronously.

Examples

OCR

AI Extraction

Exports

Email Notifications

Analytics

---

## Stateless Services

API servers do not maintain session state.

Benefits

Horizontal scaling

Load balancing

Fault tolerance

---

# 4. High-Level Architecture

```text
                    +--------------------------------+
                    |        Client Browser          |
                    | React + Material UI + TS       |
                    +---------------+----------------+
                                    |
                             HTTPS / REST
                                    |
                 +------------------v------------------+
                 |         API Gateway (Express)       |
                 +------------------+------------------+
                                    |
      +-------------+---------------+--------------+-------------+
      |             |               |              |             |
      |             |               |              |             |
+-----v-----+ +-----v------+ +------v------+ +-----v-----+ +-----v------+
| Auth API  | | Invoice API| | Export API  | | Billing   | | Admin API  |
+-----------+ +------------+ +-------------+ +-----------+ +------------+
      |             |               |              |             |
      +-------------+---------------+--------------+-------------+
                                    |
                           Business Services Layer
                                    |
       +--------------+-------------+--------------+--------------+
       |              |                            |              |
+------v-----+ +------v------+             +-------v------+ +------v------+
| OCR Worker | | AI Worker   |             | Export Worker| | Email Worker|
+------------+ +-------------+             +--------------+ +-------------+
              \         |                         /
               \        |                        /
                +-------v-----------------------+
                |     Redis + BullMQ Queue      |
                +---------------+---------------+
                                |
                                |
                       +--------v--------+
                       | PostgreSQL DB   |
                       +--------+--------+
                                |
         +----------------------+-----------------------+
         |                      |                       |
+--------v--------+    +--------v--------+    +---------v---------+
| Object Storage  |    | Google Sheets   |    | Monitoring Stack  |
| (S3 Compatible) |    | Integration API |    | Grafana/Loki      |
+-----------------+    +-----------------+    +-------------------+
```

---

# 5. Layered Architecture

The application follows a six-layer architecture.

```text
Presentation Layer

↓

API Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer

↓

Persistence Layer
```

---

## Presentation Layer

Technology

React

Material UI

TypeScript

Responsibilities

- User Interface
- Forms
- Dashboard
- Authentication
- API Calls

---

## API Layer

Technology

Express

Responsibilities

- Authentication
- Validation
- Routing
- Authorization
- Error Handling

---

## Application Layer

Responsibilities

- Business Workflows
- Service Coordination
- Queue Management
- Transaction Management

---

## Domain Layer

Contains

Entities

Value Objects

Business Rules

Policies

Domain Services

Repositories

---

## Infrastructure Layer

Contains

OCR Provider

Gemini API

Redis

SMTP

Google Sheets

Storage

Monitoring

---

## Persistence Layer

Contains

PostgreSQL

Prisma ORM

Database Migrations

Repositories

Caching

# 6. Component Architecture

The application is composed of loosely coupled components.

## Authentication Component

Responsibilities

- Registration
- Login
- Sessions
- JWT
- Permissions

---

## Organization Component

Responsibilities

- Business Management
- User Invitations
- Team Roles

---

## Invoice Component

Responsibilities

- Upload
- Storage
- Metadata
- Status Tracking

---

## OCR Component

Responsibilities

- OCR Processing
- Image Enhancement
- Confidence Scores

---

## AI Component

Responsibilities

- Prompt Generation
- JSON Extraction
- Categorization
- Confidence Analysis

---

## Validation Component

Responsibilities

- Business Rules
- Duplicate Detection
- Mathematical Validation

---

## Dashboard Component

Responsibilities

- Reports
- Charts
- KPIs
- Statistics

---

## Export Component

Responsibilities

- CSV
- Excel
- Google Sheets

---

## Notification Component

Responsibilities

- Email
- In-App Notifications
- Future Push Notifications

---

## Billing Component

Responsibilities

- Plans
- Payments
- Usage
- Quotas

---

## Administration Component

Responsibilities

- Monitoring
- User Management
- Queue Management
- Analytics

---

# 7. Module Architecture

```text
Authentication
      │
      ├── Login
      ├── Register
      ├── Sessions
      └── RBAC

Organizations
      │
      ├── Members
      ├── Roles
      └── Settings

Invoices
      │
      ├── Upload
      ├── OCR
      ├── AI
      ├── Validation
      └── Export

Dashboard
      │
      ├── Statistics
      ├── Charts
      ├── Search
      └── Reports

Administration
      │
      ├── Logs
      ├── Monitoring
      ├── Billing
      └── Users
```

---

# 8. Request Lifecycle

Invoice Upload Lifecycle

```text
User

↓

Upload Invoice

↓

Frontend Validation

↓

REST API

↓

Authentication

↓

Authorization

↓

File Validation

↓

Virus Scan

↓

Object Storage

↓

BullMQ Queue

↓

OCR Worker

↓

AI Worker

↓

Validation Engine

↓

Database

↓

Google Sheets Export

↓

Notification

↓

Dashboard Refresh
```

---

# 9. Data Flow Architecture

```text
Invoice

↓

Upload Service

↓

Storage

↓

OCR

↓

AI

↓

Validation

↓

Persistence

↓

Export

↓

Reporting

↓

Analytics
```

---

# 10. Technology Mapping

| Layer | Technology |
|--------|------------|
| UI | React + Material UI |
| API | Express |
| Business Logic | TypeScript Services |
| Queue | BullMQ |
| Cache | Redis |
| Database | PostgreSQL |
| ORM | Prisma |
| OCR | Google Vision |
| AI | Gemini |
| Storage | S3 Compatible |
| Monitoring | Prometheus + Grafana |
| Logging | Loki + Sentry |

---

# 11. Architecture Decision Records (ADRs)

## ADR-001

Decision

Use React + Material UI.

Reason

Enterprise-grade UI components with accessibility and responsive design.

---

## ADR-002

Decision

Use PostgreSQL instead of MongoDB.

Reason

Strong ACID compliance, relational data integrity, and SQL support for financial records.

---

## ADR-003

Decision

Use BullMQ with Redis.

Reason

Reliable background processing, retries, scheduling, and scalability.

---

## ADR-004

Decision

Use Gemini for AI extraction.

Reason

High-quality structured JSON generation and competitive cost.

---

## ADR-005

Decision

Use Object Storage instead of storing files in the database.

Reason

Improved scalability, reduced database size, and lower storage costs.

---

# Version History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Core Architecture Document |

# 12. Architecture Style

## Selected Architecture

The AI Invoice & Receipt Intake Assistant follows a **Modular Monolith** architecture for Version 1.

Although the application is deployed as a single backend service, each business domain is isolated into independent modules. This approach simplifies deployment while maintaining clear boundaries for future migration to microservices.

---

### Why Modular Monolith?

Benefits

- Faster development
- Easier debugging
- Lower infrastructure cost
- Simpler deployment
- Shared transactions
- Easier testing

---

### Migration Path

Version 1

Modular Monolith

↓

Version 2

Extract AI Processing Service

↓

Version 3

Extract Export Service

↓

Version 4

Event Driven Microservices

---

# 13. OCR Architecture

## Overview

The OCR subsystem is responsible for transforming uploaded documents into structured text before AI processing begins.

---

## OCR Components

Document Upload

↓

Image Processor

↓

OCR Engine

↓

Text Cleaner

↓

OCR Validator

↓

OCR Storage

↓

AI Queue

---

## Image Preprocessing

Before OCR execution, every document undergoes preprocessing.

Operations

- Image normalization
- Deskew
- Rotation correction
- Contrast enhancement
- Noise removal
- Resolution optimization

---

## OCR Engine Responsibilities

- Text Extraction
- Table Detection
- Multi-page Support
- Confidence Calculation
- Character Bounding Boxes

---

## OCR Failure Strategy

Attempt 1

↓

Retry

↓

Retry with Enhanced Image

↓

Alternative OCR Provider

↓

Manual Review Queue

---

# 14. AI Processing Architecture

## Overview

The AI Engine converts OCR text into structured accounting data.

The architecture separates prompt construction, AI execution, validation, and persistence into independent components.

---

## AI Pipeline

OCR Result

↓

Prompt Builder

↓

Prompt Templates

↓

Context Builder

↓

Gemini API

↓

Structured JSON

↓

JSON Validator

↓

Confidence Engine

↓

Business Validation

↓

Persistence

---

## AI Components

### Prompt Builder

Generates optimized prompts.

Responsibilities

- JSON schema injection
- System instructions
- Invoice examples
- Formatting rules

---

### Context Builder

Adds business-specific information.

Examples

- Currency
- Locale
- Organization settings
- Vendor history

---

### AI Client

Responsibilities

- API communication
- Rate limiting
- Retry handling
- Timeout management

---

### Response Validator

Ensures

- Valid JSON
- Required fields
- Schema compliance
- Confidence scores

---

# 15. Queue Architecture

## Overview

Background jobs are processed using BullMQ with Redis.

This prevents long-running operations from blocking user requests.

---

## Queue Types

### Upload Queue

Stores uploaded files waiting for OCR.

---

### OCR Queue

Processes image recognition.

---

### AI Queue

Processes OCR output.

---

### Export Queue

Generates CSV, Excel, and Google Sheets.

---

### Notification Queue

Sends emails and future push notifications.

---

### Cleanup Queue

Deletes temporary files.

---

## Queue Flow

Upload

↓

Upload Queue

↓

OCR Queue

↓

AI Queue

↓

Validation Queue

↓

Export Queue

↓

Notification Queue

↓

Completed

---

## Retry Policy

Retry Attempts

3

Delay

30 seconds

Backoff

Exponential

---

## Dead Letter Queue

Failed jobs after maximum retries are moved into a Dead Letter Queue (DLQ).

Administrators may manually inspect and retry failed jobs.

---

# 16. Redis Architecture

Redis provides temporary storage and messaging.

---

## Responsibilities

Queue Management

Caching

Rate Limiting

Session Storage

Temporary Locks

---

## Cached Objects

Dashboard Statistics

Invoice Summary

Vendor List

Subscription Usage

Organization Settings

AI Prompt Cache

---

## Cache Expiration

Dashboard

60 seconds

Vendor Cache

10 minutes

Organization Settings

1 hour

Authentication Tokens

15 minutes

---

# 17. Database Architecture

## Overview

PostgreSQL acts as the primary source of truth.

All transactional data is stored within the relational database.

---

## Core Entities

Users

Organizations

Invoices

Invoice Items

OCR Results

AI Results

Validation Reports

Subscriptions

Payments

Audit Logs

Notifications

---

## Relationships

Organization

↓

Users

↓

Invoices

↓

Invoice Items

↓

Validation

↓

Exports

---

## Database Principles

Normalization

Foreign Keys

Transactions

Indexes

Soft Deletes

Audit Logging

---

## Read Optimization

Indexes

Materialized Views

Connection Pooling

Query Optimization

---

# 18. Storage Architecture

## Object Storage

Uploaded documents are stored separately from the database.

Recommended

Amazon S3

Cloudflare R2

DigitalOcean Spaces

---

## Stored Objects

Original PDF

Invoice Images

Temporary OCR Files

Export Files

Generated Reports

---

## Lifecycle Policy

Temporary Files

24 hours

Exports

30 days

Invoices

Until deleted by customer

---

## Storage Workflow

Upload

↓

Object Storage

↓

Metadata Database

↓

Processing

↓

Export

↓

Archive

---

# 19. Caching Strategy

## Cache Levels

Browser Cache

↓

CDN Cache

↓

Redis Cache

↓

Database

---

## Cached Data

Dashboard

Statistics

Vendor Lookup

Invoice Categories

Subscription Information

Settings

---

## Cache Invalidation

Invoice Uploaded

↓

Dashboard Cache Cleared

↓

Analytics Recalculated

↓

New Cache Generated

# 20. Multi-Tenant Architecture

## Tenant Isolation

Each organization is treated as an independent tenant.

Every record includes:

organization_id

---

## Data Isolation Rules

Users may only access data belonging to their organization.

All database queries are filtered using tenant identifiers.

Shared infrastructure never exposes cross-tenant information.

---

## Benefits

Strong security

Simpler scaling

Independent billing

Separate analytics

Future white-label support

---

# 21. Security Architecture

## Security Layers

Client

↓

HTTPS

↓

API Gateway

↓

Authentication

↓

Authorization

↓

Business Rules

↓

Database

↓

Encrypted Storage

---

## Authentication

JWT

Refresh Tokens

Email Verification

Future

MFA

SSO

Passkeys

---

## Authorization

Role-Based Access Control

Owner

Admin

Accountant

Member

System Administrator

---

## Encryption

TLS 1.3

AES-256

Argon2 Password Hashing

Encrypted Secrets

---

## Security Monitoring

Failed Logins

Rate Limits

Audit Logs

IP Tracking

Suspicious Activity Detection

---

# 22. High Availability

Target Availability

99.9%

---

## Availability Components

Multiple API Instances

↓

Load Balancer

↓

Redis Queue

↓

Database

↓

Storage

---

## Health Checks

API

Database

Redis

AI Provider

OCR Provider

Storage

Email Service

---

# 23. Disaster Recovery

## Backup Strategy

Database

Hourly Incremental

Daily Full Backup

---

Object Storage

Versioning Enabled

Geo-Redundant Storage

---

Configuration

Git Repository

Infrastructure as Code

Environment Backup

---

## Recovery Objectives

RPO

30 minutes

RTO

2 hours

---

# 24. Load Balancing

Recommended

Nginx

Cloudflare Load Balancer

AWS ALB

---

## Distribution Strategy

Round Robin

Least Connections

Health-Based Routing

---

# 25. Deployment Architecture

```text
Internet

↓

Cloudflare CDN

↓

Load Balancer

↓

React Frontend

↓

Express API

↓

Redis

↓

BullMQ Workers

↓

PostgreSQL

↓

S3 Storage

↓

Monitoring Stack
```

---

# 26. Scalability Strategy

Horizontal API Scaling

Worker Scaling

Redis Cluster

Read Replicas

CDN

Object Storage

Future Kubernetes

---

## Scaling Targets

Organizations

100,000+

Users

1 Million+

Invoices

100 Million+

API Requests

50 Million/month

---

# 27. Architecture Decision Records

ADR-006

Use PostgreSQL instead of NoSQL.

Reason

Relational financial data requires strong consistency.

---

ADR-007

Use Object Storage.

Reason

Lower cost and improved scalability.

---

ADR-008

Use BullMQ.

Reason

Reliable retries and delayed jobs.

---

ADR-009

Use Material UI.

Reason

Enterprise-ready design system.

---

ADR-010

Use React Query.

Reason

Server-state management with caching and background synchronization.

---

# 28. Future Architecture Evolution

Version 2

Dedicated AI Service

Dedicated OCR Service

---

Version 3

Microservices

Kafka Event Bus

Service Discovery

---

Version 4

Multi-Region Deployment

Global CDN

AI Recommendation Engine

Enterprise White Label

---

# Document Summary

The System Architecture document defines the complete architectural blueprint for the AI Invoice & Receipt Intake Assistant.

It covers architectural style, AI processing, background queues, storage, caching, multi-tenancy, security, deployment, disaster recovery, and future scalability.

This document serves as the primary technical reference for architects, backend developers, DevOps engineers, and infrastructure teams.

---

# Version History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Complete System Architecture |

---

# Approval

| Role | Status |
|------|--------|
| Solution Architect | Approved |
| Technical Lead | Pending |
| DevOps Engineer | Pending |
| Security Architect | Pending |
| Product Owner | Pending |