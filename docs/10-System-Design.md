# System Design Document

Project Name: AI Invoice & Receipt Intake Assistant

Version: 1.0

Prepared By:
Software Architecture Team

Document Type:
System Design Specification

Status:
Draft

---

# Table of Contents

1. Introduction
2. Design Goals
3. Software Design Principles
4. Design Patterns
5. Clean Architecture
6. Package Design
7. Module Design
8. UML Overview
9. Use Case Diagram
10. Class Diagram
11. Sequence Diagrams
12. Activity Diagrams
13. State Diagrams
14. Component Diagram
15. Deployment Diagram
16. Design Decisions

---

# 1. Introduction

This document describes the internal software design of the AI Invoice & Receipt Intake Assistant.

Unlike the System Architecture document, which focuses on infrastructure and deployment, this document explains how software components interact, how classes are organized, and how business logic is structured.

It serves as the primary reference for backend and frontend developers before implementation.

---

# 2. Design Goals

The software design aims to achieve:

• High cohesion

• Low coupling

• Testability

• Scalability

• Maintainability

• Reusability

• Extensibility

• Separation of Concerns

---

# 3. Software Design Principles

The project follows the SOLID principles.

---

## Single Responsibility Principle (SRP)

Every class shall have one responsibility.

Example

InvoiceService

Responsible only for invoice operations.

---

## Open / Closed Principle (OCP)

Modules shall be open for extension but closed for modification.

Example

Adding a new export provider should not require modifying the ExportService.

---

## Liskov Substitution Principle (LSP)

Derived implementations must replace base implementations without breaking functionality.

Example

GoogleSheetsExporter

CsvExporter

Both implement ExportProvider.

---

## Interface Segregation Principle (ISP)

Clients should depend only on interfaces they use.

Example

OCRProvider

AIProvider

StorageProvider

---

## Dependency Inversion Principle (DIP)

Business logic depends on interfaces rather than concrete implementations.

---

# 4. Design Patterns

The application uses several proven software design patterns.

---

## Repository Pattern

Purpose

Abstract database access.

Example

InvoiceRepository

UserRepository

VendorRepository

---

## Service Pattern

Encapsulates business logic.

Examples

InvoiceService

ExportService

ValidationService

---

## Factory Pattern

Creates service implementations dynamically.

Example

OCRFactory

Returns

GoogleVisionProvider

AzureOCRProvider

---

## Strategy Pattern

Allows interchangeable algorithms.

Example

Export Strategies

CSV

Excel

Google Sheets

JSON

---

## Observer Pattern

Used for event notifications.

Example

Invoice Approved

↓

Send Email

↓

Refresh Dashboard

↓

Update Analytics

---

## Adapter Pattern

Wraps third-party APIs.

Examples

Gemini Adapter

Google Sheets Adapter

Stripe Adapter

OCR Adapter

---

## Builder Pattern

Creates AI prompts.

PromptBuilder

↓

Prompt

↓

Examples

↓

Schema

↓

Instructions

---

# 5. Clean Architecture

```text
Presentation

↓

Controllers

↓

Application Services

↓

Domain

↓

Repositories

↓

Infrastructure

↓

Database
```

---

Presentation Layer

React

Material UI

---

Application Layer

Business workflows

Transaction management

---

Domain Layer

Entities

Business Rules

Interfaces

Value Objects

---

Infrastructure Layer

Prisma

Redis

OCR

Gemini

Google Sheets

SMTP

---

# 6. Package Design

Backend Structure

```text
src/

controllers/

services/

repositories/

entities/

dto/

validators/

middleware/

routes/

jobs/

workers/

providers/

utils/

config/

prisma/

types/

interfaces/
```

---

Frontend Structure

```text
src/

components/

pages/

layouts/

hooks/

contexts/

services/

api/

theme/

utils/

assets/

types/
```

---

# 7. Module Design

Modules

Authentication

Organizations

Invoices

OCR

AI

Validation

Dashboard

Exports

Billing

Notifications

Administration

Each module contains:

Controller

↓

Service

↓

Repository

↓

DTO

↓

Validator

↓

Routes

↓

Tests

# 8. UML Overview

The following UML diagrams are maintained as part of the project documentation.

- Use Case Diagram
- Class Diagram
- Sequence Diagram
- Activity Diagram
- State Diagram
- Component Diagram
- Deployment Diagram
- Package Diagram

---

# 9. Use Case Diagram

Actors

Guest

Registered User

Accountant

Administrator

System

---

```text
               +-----------------------------+
               | AI Invoice Assistant System |
               +-----------------------------+

Guest
   │
   ├──────── Register
   ├──────── Login
   └──────── Verify Email

User
   │
   ├──────── Upload Invoice
   ├──────── View Dashboard
   ├──────── Export Data
   ├──────── Manage Profile
   └──────── Connect Google Sheets

Administrator
   │
   ├──────── Manage Users
   ├──────── View Logs
   ├──────── Retry Jobs
   ├──────── Manage Plans
   └──────── System Settings
```

---

# 10. Class Diagram

```text
                User
                  │
        --------------------
        │                  │
   Organization       Notification

                  │
               Invoice
                  │
      ------------------------
      │          │           │
 InvoiceItem  OCRResult   AIResult
      │                      │
      └────────────┬─────────┘
                   │
           ValidationReport
```

---

Major Classes

User

Organization

Invoice

InvoiceItem

Vendor

OCRJob

AIJob

ExportJob

Subscription

Payment

Notification

AuditLog

---

# 11. Sequence Diagram

Invoice Upload

```text
User

↓

React UI

↓

Invoice Controller

↓

Invoice Service

↓

Storage Service

↓

Queue Service

↓

OCR Worker

↓

AI Worker

↓

Validation Service

↓

Database

↓

Dashboard
```

---

Export Flow

```text
User

↓

Export Controller

↓

Export Service

↓

Strategy Factory

↓

CSV Exporter

↓

Storage

↓

Download Link
```

---

# 12. Activity Diagram

Invoice Processing

```text
Start

↓

Upload Invoice

↓

Validate File

↓

Store Document

↓

OCR

↓

AI Extraction

↓

Validation

↓

Approved?

Yes → Dashboard

No → Manual Review

↓

Export

↓

End
```

# 13. State Diagram

Invoice State Machine

```text
Queued

↓

OCR Processing

↓

AI Processing

↓

Validation

↓

Approved
     │
     ├──────── Exported
     │
     └──────── Archived

Rejected

↓

Manual Review

↓

Approved

OR

Deleted
```

---

# 14. Component Diagram

```text
Frontend

↓

REST API

↓

Authentication

↓

Invoice Service

↓

OCR Service

↓

AI Service

↓

Validation Service

↓

Database

↓

Exports
```

---

# 15. Deployment Diagram

```text
Client Browser

↓

Cloudflare CDN

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

Gemini API

↓

Google Vision

↓

Google Sheets

↓

Monitoring
```

---

# 16. Design Decisions

## Decision 1

Use TypeScript across frontend and backend.

Reason

Improves maintainability and type safety.

---

## Decision 2

Use Prisma ORM.

Reason

Type-safe database access with migration support.

---

## Decision 3

Use BullMQ for asynchronous processing.

Reason

Reliable retries and scalable background jobs.

---

## Decision 4

Use Material UI.

Reason

Accessible, enterprise-ready component library.

---

## Decision 5

Use Repository Pattern.

Reason

Decouples business logic from persistence.

---

## Decision 6

Use Service Layer.

Reason

Centralizes business rules and simplifies testing.

---

## Decision 7

Use UUIDs for all primary keys.

Reason

Improves security and supports distributed systems.

---

## Decision 8

Use Object Storage for uploaded files.

Reason

Scalable, cost-effective, and independent from the relational database.

---

# Quality Attributes

The design emphasizes:

- Maintainability
- Extensibility
- Testability
- Security
- Performance
- Reliability
- Scalability

---

# Coding Guidelines

- One responsibility per class
- Dependency injection for services
- DTOs for API boundaries
- Repository interfaces for persistence
- Comprehensive unit tests
- Consistent error handling
- Structured logging

---

# Future Design Evolution

## Phase 2

- Event bus integration
- CQRS for reporting
- Domain events

## Phase 3

- Microservices
- Saga pattern
- Event sourcing (selected modules)

## Phase 4

- Distributed tracing
- AI orchestration service
- Multi-region deployment

---

# Document Summary

This System Design Document defines the internal software structure of the AI Invoice & Receipt Intake Assistant. It establishes the design principles, architectural patterns, UML models, package organization, module decomposition, and engineering decisions that guide implementation while ensuring maintainability and scalability.

---

# Version History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Complete System Design Specification |

---

# Approval

| Role | Status |
|------|--------|
| Software Architect | Approved |
| Lead Backend Engineer | Pending |
| Lead Frontend Engineer | Pending |
| QA Lead | Pending |
| Product Owner | Pending |
