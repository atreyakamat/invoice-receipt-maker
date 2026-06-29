# Prisma Schema Documentation

Project Name: AI Invoice & Receipt Intake Assistant

Version: 1.0

Database:
PostgreSQL 16

ORM:
Prisma ORM 6.x

Prepared By:
Backend Architecture Team

Status:
Production Draft

---

# Table of Contents

1. Introduction
2. Prisma Overview
3. Database Standards
4. Naming Conventions
5. Datasource
6. Generator
7. Global Model Standards
8. Enums
9. Base Model Pattern
10. Core Models
11. Relationships
12. Index Strategy
13. Migration Strategy
14. Seed Strategy
15. Best Practices

---

# 1. Introduction

This document defines the complete Prisma schema used by the AI Invoice & Receipt Intake Assistant.

The objective is to provide a type-safe, scalable, and maintainable database layer using Prisma ORM with PostgreSQL.

This schema supports:

- Multi-tenancy
- AI invoice processing
- OCR workflows
- User management
- Billing
- Notifications
- Audit logging
- Export history
- Analytics

---

# 2. Prisma Overview

## ORM

Prisma ORM provides:

- Type-safe database queries
- Automatic migrations
- Relation management
- Transaction support
- Excellent TypeScript integration
- Database introspection

---

## Database

PostgreSQL 16

---

## Migration Tool

Prisma Migrate

---

## Seed Tool

Prisma Seed

---

## Query Client

Prisma Client

---

# 3. Database Standards

## Primary Keys

All tables use UUIDs.

```prisma
id String @id @default(uuid())
```

---

## Timestamps

Every model contains

```prisma
createdAt DateTime @default(now())

updatedAt DateTime @updatedAt
```

---

## Soft Delete

Business entities support soft deletion.

```prisma
deletedAt DateTime?
```

---

## Multi Tenancy

Every business table contains

```prisma
organizationId String
```

---

## Naming Standard

snake_case in PostgreSQL

camelCase in Prisma

---

## Referential Integrity

All relations use explicit foreign keys.

---

## Transactions

Financial operations execute inside Prisma transactions.

---

# 4. Naming Conventions

## Models

PascalCase

Example

```text
User

Organization

Invoice

InvoiceItem
```

---

## Fields

camelCase

```text
invoiceNumber

organizationId

createdAt

updatedAt
```

---

## Enums

PascalCase

```text
UserRole

InvoiceStatus

SubscriptionPlan
```

---

## Relations

Singular

```text
organization

invoice

vendor
```

Collections

Plural

```text
users

invoices

payments
```

---

# 5. Datasource

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

# 6. Generator

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Optional

```prisma
generator erd {
  provider = "prisma-erd-generator"
}
```

---

# 7. Global Model Standards

Every model should include

```prisma
id

createdAt

updatedAt
```

Business entities additionally include

```prisma
deletedAt
```

Tenant-aware entities include

```prisma
organizationId
```

---

# Base Model Pattern

Although Prisma has no inheritance, every business entity follows this pattern.

```prisma
id String @id @default(uuid())

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

deletedAt DateTime?
```

---

# 8. Enums

## UserRole

```prisma
enum UserRole {
  OWNER
  ADMIN
  ACCOUNTANT
  MEMBER
  SYSTEM_ADMIN
}
```

---

## InvoiceStatus

```prisma
enum InvoiceStatus {
  QUEUED
  OCR
  AI
  VALIDATION
  COMPLETED
  REJECTED
  FAILED
}
```

---

## OCRStatus

```prisma
enum OCRStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
}
```

---

## AIJobStatus

```prisma
enum AIJobStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
}
```

---

## ValidationStatus

```prisma
enum ValidationStatus {
  APPROVED
  MANUAL_REVIEW
  REJECTED
}
```

---

## ExportFormat

```prisma
enum ExportFormat {
  CSV
  XLSX
  PDF
  JSON
  GOOGLE_SHEETS
}
```

---

## SubscriptionPlan

```prisma
enum SubscriptionPlan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

---

## SubscriptionStatus

```prisma
enum SubscriptionStatus {
  ACTIVE
  TRIAL
  CANCELLED
  EXPIRED
  PAST_DUE
}
```

---

## PaymentStatus

```prisma
enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

---

## NotificationType

```prisma
enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
}
```

---

## JobStatus

```prisma
enum JobStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
}
```

---

# 9. Model Relationships Overview

```text
Organization

│

├── Users

├── Vendors

├── Invoices

├── Exports

├── Subscription

└── GoogleConnection

User

├── Sessions

├── Notifications

└── AuditLogs

Invoice

├── InvoiceItems

├── OCRJob

├── OCRResult

├── AIJob

├── AIResult

└── ValidationReport
```

---

# 10. Schema Organization

The schema is divided into logical domains.

Authentication

- User
- Session
- RefreshToken

Organization

- Organization
- OrganizationMember

Invoice

- Invoice
- InvoiceItem
- Vendor

OCR

- OCRJob
- OCRResult

Artificial Intelligence

- AIJob
- AIResult

Billing

- Subscription
- Payment

Notifications

- Notification

Auditing

- AuditLog

System

- ProcessingJob
- SystemSetting
- ExportJob

---

# Version History

| Version | Description |
|----------|-------------|
| 1.0 | Initial Prisma Schema Documentation |

# 11. Authentication Domain

The Authentication domain manages user identities, login sessions, refresh tokens, and organizational membership.

Models included:

- Organization
- OrganizationMember
- User
- Session
- RefreshToken

---

# Organization Model

## Purpose

Represents a tenant (company or organization) within the SaaS platform.

Every invoice, user, subscription, vendor, and report belongs to an organization.

---

## Prisma Model

```prisma
model Organization {
  id              String   @id @default(uuid())

  companyName     String
  legalName       String?

  email           String?
  phone           String?

  website         String?

  taxId           String?

  currency        String
  timezone        String

  logoUrl         String?

  status          OrganizationStatus @default(ACTIVE)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  users           User[]
  members         OrganizationMember[]
  vendors         Vendor[]
  invoices        Invoice[]
  exports         ExportJob[]

  subscription    Subscription?

  googleConnection GoogleConnection?

  auditLogs       AuditLog[]

  @@index([companyName])
  @@index([status])
}
```

---

## Field Description

| Field | Description |
|--------|-------------|
| id | Unique organization identifier |
| companyName | Public company name |
| legalName | Registered legal entity |
| email | Contact email |
| phone | Organization phone |
| website | Official website |
| taxId | GST/VAT/Tax identifier |
| currency | Default accounting currency |
| timezone | Business timezone |
| logoUrl | Company logo |
| status | Active / Suspended |

---

## Relationships

```text
Organization

├── Users

├── Vendors

├── Invoices

├── Exports

├── Subscription

└── Audit Logs
```

---

## Recommended Queries

Find Organization

```typescript
await prisma.organization.findUnique({
  where:{
     id
  }
})
```

---

Organization with Users

```typescript
await prisma.organization.findUnique({
 include:{
   users:true
 }
})
```

---

# OrganizationStatus Enum

```prisma
enum OrganizationStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
}
```

---

# OrganizationMember Model

## Purpose

Allows multiple users to belong to an organization while maintaining role assignments.

---

## Prisma Model

```prisma
model OrganizationMember {

  id String @id @default(uuid())

  organizationId String

  userId String

  role UserRole

  invitedBy String?

  invitedAt DateTime?

  joinedAt DateTime?

  status MemberStatus

  organization Organization
      @relation(fields:[organizationId], references:[id])

  user User
      @relation(fields:[userId], references:[id])

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  @@unique([organizationId,userId])

  @@index([organizationId])

  @@index([userId])
}
```

---

# MemberStatus

```prisma
enum MemberStatus {
  INVITED
  ACTIVE
  SUSPENDED
}
```

---

Relationship

```text
Organization

↓

OrganizationMember

↓

User
```

---

# User Model

## Purpose

Stores all authenticated platform users.

---

## Prisma Model

```prisma
model User {

  id String @id @default(uuid())

  organizationId String

  firstName String

  lastName String

  email String @unique

  passwordHash String

  avatar String?

  role UserRole

  emailVerified Boolean @default(false)

  lastLogin DateTime?

  organization Organization
      @relation(fields:[organizationId], references:[id])

  sessions Session[]

  refreshTokens RefreshToken[]

  notifications Notification[]

  auditLogs AuditLog[]

  invoices Invoice[]

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  deletedAt DateTime?

  @@index([organizationId])

  @@index([email])

  @@index([role])
}
```

---

## User Relationships

```text
User

├── Sessions

├── Refresh Tokens

├── Notifications

├── Audit Logs

└── Uploaded Invoices
```

---

## Query Example

Login

```typescript
await prisma.user.findUnique({
 where:{
   email
 }
})
```

---

Dashboard

```typescript
await prisma.user.findUnique({

 include:{

   organization:true,

   notifications:true

 }

})
```

---

# UserRole

```prisma
enum UserRole {

 OWNER

 ADMIN

 ACCOUNTANT

 MEMBER

 SYSTEM_ADMIN

}
```
# Session Model

## Purpose

Tracks authenticated browser or device sessions.

Allows:

- View active sessions
- Logout other devices
- Device management

---

## Prisma Model

```prisma
model Session {

  id String @id @default(uuid())

  userId String

  refreshTokenId String?

  deviceName String?

  browser String?

  os String?

  ipAddress String?

  userAgent String?

  expiresAt DateTime

  lastActivity DateTime

  user User
     @relation(fields:[userId], references:[id])

  createdAt DateTime @default(now())

  @@index([userId])

  @@index([expiresAt])

}
```

---

## Session Flow

```text
Login

↓

Session Created

↓

JWT Generated

↓

Refresh Token

↓

Authenticated Requests

↓

Logout

↓

Session Deleted
```

---

# RefreshToken Model

## Purpose

Stores refresh tokens separately from JWT access tokens.

Supports:

- Rotation
- Revocation
- Device-specific logout

---

## Prisma Model

```prisma
model RefreshToken {

  id String @id @default(uuid())

  token String @unique

  userId String

  sessionId String?

  expiresAt DateTime

  revoked Boolean @default(false)

  revokedAt DateTime?

  user User
      @relation(fields:[userId], references:[id])

  createdAt DateTime @default(now())

  @@index([userId])

  @@index([expiresAt])

}
```

---

## Refresh Flow

```text
Expired JWT

↓

Refresh Token

↓

Validation

↓

Generate New JWT

↓

Rotate Refresh Token

↓

Store New Token
```

---

# Authentication Relationships

```text
Organization

│

├──── User

│       │

│       ├──── Session

│       │

│       ├──── RefreshToken

│       │

│       ├──── Notification

│       │

│       └──── AuditLog

│

└──── OrganizationMember
```

---

# Authentication Index Strategy

## User

```prisma
@@index([organizationId])

@@index([email])

@@index([role])
```

---

## Session

```prisma
@@index([userId])

@@index([expiresAt])
```

---

## RefreshToken

```prisma
@@index([userId])

@@index([expiresAt])
```

---

## Organization

```prisma
@@index([companyName])

@@index([status])
```

---

# Authentication Best Practices

✓ UUID Primary Keys

✓ Soft Deletes

✓ Passwords hashed using Argon2id

✓ Refresh Token Rotation

✓ Session Tracking

✓ Email Verification

✓ Device Tracking

✓ JWT Expiry (15 min)

✓ Refresh Token Expiry (7 days)

✓ Multi-Tenant Isolation

---

# Domain Summary

Authentication Domain Models

| Model | Purpose |
|--------|---------|
| Organization | SaaS tenant |
| OrganizationMember | User membership |
| User | Authenticated user |
| Session | Device session |
| RefreshToken | JWT refresh lifecycle |

---

# Next Domain

The next section covers the **Invoice Processing Domain**, including:

- Vendor
- Invoice
- InvoiceItem
- Attachments
- Categories
- Tags
- Invoice History

This is the largest section of the schema and forms the core of the application.

# 12. Invoice Processing Domain

The Invoice Processing Domain manages vendors, invoices, invoice line items, categories, tags, attachments, and invoice lifecycle tracking.

Models

- Vendor
- Invoice
- InvoiceItem
- InvoiceAttachment
- Category
- InvoiceCategory
- Tag
- InvoiceTag
- InvoiceHistory

---

# Vendor Model

## Purpose

Stores supplier/vendor information.

Vendors are organization-specific.

Repeated invoices automatically associate with an existing vendor.

---

## Prisma Model

```prisma
model Vendor {

  id String @id @default(uuid())

  organizationId String

  name String

  email String?

  phone String?

  website String?

  gstNumber String?

  taxNumber String?

  addressLine1 String?

  addressLine2 String?

  city String?

  state String?

  postalCode String?

  country String?

  notes String?

  organization Organization
      @relation(fields:[organizationId], references:[id])

  invoices Invoice[]

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  deletedAt DateTime?

  @@index([organizationId])

  @@index([name])

  @@unique([organizationId,name])

}
```

---

Vendor Relationships

```text
Organization

↓

Vendor

↓

Invoices
```

---

Recommended Queries

Vendor Search

```typescript
await prisma.vendor.findMany({

 where:{

   organizationId,

   name:{
      contains:search
   }

 }

})
```

---

# Invoice Model

## Purpose

Primary business entity.

Stores extracted invoice information.

---

## Prisma Model

```prisma
model Invoice {

  id String @id @default(uuid())

  organizationId String

  vendorId String?

  uploadedById String

  invoiceNumber String

  invoiceDate DateTime

  dueDate DateTime?

  currency String

  subtotal Decimal @db.Decimal(12,2)

  tax Decimal @db.Decimal(12,2)

  discount Decimal @db.Decimal(12,2)

  shipping Decimal @db.Decimal(12,2)

  total Decimal @db.Decimal(12,2)

  confidence Decimal @db.Decimal(5,2)

  status InvoiceStatus

  notes String?

  storageUrl String

  thumbnailUrl String?

  organization Organization
      @relation(fields:[organizationId], references:[id])

  vendor Vendor?
      @relation(fields:[vendorId], references:[id])

  uploadedBy User
      @relation(fields:[uploadedById], references:[id])

  items InvoiceItem[]

  attachments InvoiceAttachment[]

  categories InvoiceCategory[]

  tags InvoiceTag[]

  history InvoiceHistory[]

  ocrJob OCRJob?

  ocrResult OCRResult?

  aiJob AIJob?

  aiResult AIResult?

  validation ValidationReport?

  exports ExportJob[]

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  deletedAt DateTime?

  @@unique([organizationId,invoiceNumber])

  @@index([organizationId])

  @@index([vendorId])

  @@index([status])

  @@index([invoiceDate])

  @@index([createdAt])

}
```

---

Invoice Relationships

```text
Invoice

├── Invoice Items

├── Attachments

├── Categories

├── Tags

├── OCR Job

├── OCR Result

├── AI Job

├── AI Result

├── Validation

└── Export Jobs
```

---

# InvoiceItem Model

Purpose

Stores individual line items extracted from invoices.

---

```prisma
model InvoiceItem {

  id String @id @default(uuid())

  invoiceId String

  lineNumber Int

  description String

  quantity Decimal @db.Decimal(10,2)

  unitPrice Decimal @db.Decimal(12,2)

  tax Decimal @db.Decimal(12,2)

  discount Decimal @db.Decimal(12,2)

  total Decimal @db.Decimal(12,2)

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  @@index([invoiceId])

}
```

---

Relationship

```text
Invoice

↓

Invoice Items
```

---

Invoice Example

Office Chair

Quantity

2

Unit Price

₹5000

Tax

18%

Total

₹11800

# InvoiceAttachment Model

Purpose

Stores additional uploaded files.

Examples

Purchase Order

Delivery Note

Supporting Documents

---

```prisma
model InvoiceAttachment {

  id String @id @default(uuid())

  invoiceId String

  fileName String

  fileType String

  fileSize Int

  storageUrl String

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  createdAt DateTime @default(now())

}
```

---

# Category Model

Purpose

Expense categories.

Examples

Office Supplies

Travel

Software

Utilities

Marketing

Payroll

---

```prisma
model Category {

  id String @id @default(uuid())

  organizationId String

  name String

  color String?

  description String?

  organization Organization
      @relation(fields:[organizationId], references:[id])

  invoices InvoiceCategory[]

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  @@unique([organizationId,name])

}
```

---

# InvoiceCategory

Many-to-many mapping.

```prisma
model InvoiceCategory {

  invoiceId String

  categoryId String

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  category Category
      @relation(fields:[categoryId], references:[id])

  @@id([invoiceId,categoryId])

}
```

---

# Tag Model

Purpose

Flexible labels.

Examples

Urgent

Finance

Pending Approval

Recurring

Q1

Tax Filing

---

```prisma
model Tag {

  id String @id @default(uuid())

  organizationId String

  name String

  color String?

  organization Organization
      @relation(fields:[organizationId], references:[id])

  invoices InvoiceTag[]

  createdAt DateTime @default(now())

}
```

---

# InvoiceTag

```prisma
model InvoiceTag {

  invoiceId String

  tagId String

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  tag Tag
      @relation(fields:[tagId], references:[id])

  @@id([invoiceId,tagId])

}
```

---

# InvoiceHistory

Purpose

Tracks invoice lifecycle.

---

```prisma
model InvoiceHistory {

  id String @id @default(uuid())

  invoiceId String

  userId String

  action String

  previousStatus String?

  newStatus String?

  comments String?

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  user User
      @relation(fields:[userId], references:[id])

  createdAt DateTime @default(now())

  @@index([invoiceId])

}
```

---

Example History

Invoice Uploaded

↓

OCR Completed

↓

AI Extraction

↓

Manual Validation

↓

Approved

↓

Exported

---

# Invoice Domain Relationships

```text
Organization

│

├── Vendors

│

└── Invoices

      │

      ├── InvoiceItems

      ├── Attachments

      ├── Categories

      ├── Tags

      ├── History

      ├── OCR

      ├── AI

      ├── Validation

      └── Exports
```

---

# Invoice Index Strategy

Invoice

```prisma
@@index([organizationId])

@@index([vendorId])

@@index([status])

@@index([invoiceDate])

@@index([createdAt])

@@unique([organizationId,invoiceNumber])
```

---

Vendor

```prisma
@@index([organizationId])

@@index([name])
```

---

InvoiceItem

```prisma
@@index([invoiceId])
```

---

History

```prisma
@@index([invoiceId])
```

---

# Best Practices

✓ Vendor names normalized

✓ Composite unique invoice numbers per organization

✓ Soft delete invoices

✓ Monetary fields stored as Decimal

✓ History table for auditability

✓ Many-to-many categories

✓ Many-to-many tags

✓ Attachments stored in object storage

✓ Invoice thumbnails generated asynchronously

---

# Domain Summary

| Model | Purpose |
|--------|---------|
| Vendor | Supplier management |
| Invoice | Primary accounting document |
| InvoiceItem | Line items |
| InvoiceAttachment | Supporting files |
| Category | Expense grouping |
| InvoiceCategory | Many-to-many mapping |
| Tag | Flexible labels |
| InvoiceTag | Many-to-many mapping |
| InvoiceHistory | Lifecycle audit trail |

---

# Next Domain

Part 4 will define the **AI & OCR Processing Domain**, including:

- OCRJob
- OCRResult
- AIJob
- AIResult
- ValidationReport
- AI Prompt History
- Confidence Metrics
- Processing Pipeline

# 13. AI & OCR Processing Domain

The AI & OCR domain transforms uploaded invoices into structured accounting data.

Pipeline

```text
Upload

↓

OCR Job

↓

OCR Result

↓

AI Job

↓

AI Result

↓

Validation Report

↓

Invoice Updated

↓

Dashboard Analytics
```

---

# OCRJob Model

## Purpose

Tracks OCR processing requests and execution metadata.

One invoice has one OCR job.

---

## Prisma Model

```prisma
model OCRJob {

  id String @id @default(uuid())

  invoiceId String @unique

  provider OCRProvider

  status OCRStatus

  priority Int @default(1)

  retryCount Int @default(0)

  processingTime Int?

  confidence Decimal? @db.Decimal(5,2)

  startedAt DateTime?

  completedAt DateTime?

  errorMessage String?

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  @@index([status])

  @@index([provider])

}
```

---

## OCR Providers

```prisma
enum OCRProvider {

  GOOGLE_VISION

  AZURE_DOCUMENT_INTELLIGENCE

  AWS_TEXTRACT

  TESSERACT

}
```

---

## Job Lifecycle

```text
Queued

↓

Running

↓

Completed

↓

Stored

OR

Failed

↓

Retry
```

---

# OCRResult Model

## Purpose

Stores extracted OCR text and metadata.

---

## Prisma Model

```prisma
model OCRResult {

  id String @id @default(uuid())

  invoiceId String @unique

  rawText String

  pageCount Int

  detectedLanguage String?

  confidence Decimal @db.Decimal(5,2)

  boundingBoxes Json?

  metadata Json?

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  createdAt DateTime @default(now())

}
```

---

## Stored Information

- Raw OCR text
- Number of pages
- Detected language
- OCR confidence
- Bounding boxes
- OCR metadata

---

# AIJob Model

## Purpose

Tracks AI extraction requests.

---

## Prisma Model

```prisma
model AIJob {

  id String @id @default(uuid())

  invoiceId String @unique

  provider AIProvider

  model String

  status AIJobStatus

  promptTokens Int?

  completionTokens Int?

  processingTime Int?

  retryCount Int @default(0)

  startedAt DateTime?

  completedAt DateTime?

  errorMessage String?

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  @@index([status])

}
```

---

## AI Providers

```prisma
enum AIProvider {

  GEMINI

  OPENAI

  CLAUDE

  MISTRAL

  OLLAMA

}
```

---

## AI Workflow

```text
OCR Text

↓

Prompt Builder

↓

LLM

↓

JSON Response

↓

Validation

↓

Stored
```
# AIResult Model

## Purpose

Stores structured AI output.

---

## Prisma Model

```prisma
model AIResult {

  id String @id @default(uuid())

  invoiceId String @unique

  vendorName String

  invoiceNumber String

  invoiceDate DateTime

  dueDate DateTime?

  currency String

  subtotal Decimal @db.Decimal(12,2)

  tax Decimal @db.Decimal(12,2)

  discount Decimal @db.Decimal(12,2)

  total Decimal @db.Decimal(12,2)

  paymentTerms String?

  category String?

  confidence Decimal @db.Decimal(5,2)

  reasoning String?

  extractedJson Json

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  createdAt DateTime @default(now())

}
```

---

## Stored JSON Example

```json
{
  "vendor":"Adobe",
  "invoiceNumber":"INV-2026-001",
  "subtotal":1200,
  "tax":216,
  "total":1416
}
```

---

# ValidationReport Model

## Purpose

Stores validation results after AI extraction.

---

## Prisma Model

```prisma
model ValidationReport {

  id String @id @default(uuid())

  invoiceId String @unique

  score Decimal @db.Decimal(5,2)

  status ValidationStatus

  approvedBy String?

  reviewedAt DateTime?

  warnings Json?

  errors Json?

  comments String?

  invoice Invoice
      @relation(fields:[invoiceId], references:[id])

  createdAt DateTime @default(now())

}
```

---

## Validation Levels

```text
100%

↓

Auto Approved

95–99%

↓

Recommended Approval

80–94%

↓

Manual Review

Below 80%

↓

Rejected
```

---

# AIPromptHistory Model

## Purpose

Stores prompts sent to the LLM for debugging, auditing, and prompt optimization.

---

```prisma
model AIPromptHistory {

  id String @id @default(uuid())

  aiJobId String

  promptVersion String

  prompt Text

  response Text

  tokensUsed Int?

  processingTime Int?

  createdAt DateTime @default(now())

}
```

---

# ConfidenceMetric Model

Purpose

Stores confidence values for each extracted field.

---

```prisma
model ConfidenceMetric {

  id String @id @default(uuid())

  invoiceId String

  field String

  confidence Decimal @db.Decimal(5,2)

  createdAt DateTime @default(now())

}
```

---

Example

| Field | Confidence |
|--------|-----------:|
| Vendor | 99.6 |
| Invoice Number | 98.2 |
| Invoice Date | 97.8 |
| Total | 99.9 |

---

# ProcessingPipeline Model

Purpose

Tracks every stage of processing.

---

```prisma
model ProcessingPipeline {

  id String @id @default(uuid())

  invoiceId String

  stage String

  status JobStatus

  duration Int?

  worker String?

  metadata Json?

  createdAt DateTime @default(now())

}
```

---

Pipeline Stages

Upload

OCR

AI

Validation

Export

Notification

Completed

# AI Relationships

```text
Invoice

│

├── OCRJob

│

├── OCRResult

│

├── AIJob

│

├── AIResult

│

├── ValidationReport

│

├── AIPromptHistory

│

├── ConfidenceMetric

│

└── ProcessingPipeline
```

---

# Index Strategy

OCRJob

```prisma
@@index([status])

@@index([provider])
```

---

AIJob

```prisma
@@index([status])

@@index([provider])
```

---

ValidationReport

```prisma
@@index([status])
```

---

ConfidenceMetric

```prisma
@@index([invoiceId])

@@index([field])
```

---

ProcessingPipeline

```prisma
@@index([invoiceId])

@@index([stage])
```

---

# AI Best Practices

✓ Store raw OCR output

✓ Store AI JSON separately

✓ Preserve prompts for debugging

✓ Version prompts

✓ Track token usage

✓ Measure processing time

✓ Capture field-level confidence

✓ Retry failed jobs

✓ Never overwrite historical AI outputs

✓ Maintain validation history

---

# Domain Summary

| Model | Purpose |
|--------|---------|
| OCRJob | OCR execution tracking |
| OCRResult | OCR output |
| AIJob | AI extraction execution |
| AIResult | Structured invoice data |
| ValidationReport | AI validation results |
| AIPromptHistory | Prompt auditing |
| ConfidenceMetric | Field confidence tracking |
| ProcessingPipeline | Stage-by-stage processing |

---

# Next Domain

Part 5 covers the **Business & Platform Services Domain**, including:

- Subscription
- Payment
- ExportJob
- GoogleConnection
- Notification
- AuditLog
- ProcessingJob
- SystemSetting
- Webhook
- APIKey

This will complete the production-ready Prisma schema.

# 14. Business Services & Platform Domain

This domain contains all platform-level services including billing,
exports, notifications, audit logs, webhooks, API keys and system
configuration.

Models

- Subscription
- Payment
- ExportJob
- GoogleConnection
- Notification
- AuditLog
- ProcessingJob
- SystemSetting
- Webhook
- APIKey

---

# Subscription Model

## Purpose

Represents an organization's active subscription.

Each organization owns exactly one subscription.

---

## Prisma Model

```prisma
model Subscription {

  id String @id @default(uuid())

  organizationId String @unique

  plan SubscriptionPlan

  status SubscriptionStatus

  billingCycle BillingCycle

  documentLimit Int

  documentsUsed Int @default(0)

  storageLimit Int

  storageUsed Int @default(0)

  renewalDate DateTime?

  expiresAt DateTime?

  organization Organization
      @relation(fields:[organizationId], references:[id])

  payments Payment[]

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

}
```

---

## BillingCycle

```prisma
enum BillingCycle {

  MONTHLY

  YEARLY

}
```

---

Relationship

```text
Organization

↓

Subscription

↓

Payments
```

---

# Payment Model

## Purpose

Stores subscription payment history.

---

```prisma
model Payment {

  id String @id @default(uuid())

  subscriptionId String

  provider PaymentProvider

  transactionId String @unique

  amount Decimal @db.Decimal(12,2)

  currency String

  status PaymentStatus

  invoiceUrl String?

  paidAt DateTime?

  subscription Subscription
      @relation(fields:[subscriptionId], references:[id])

  createdAt DateTime @default(now())

  @@index([subscriptionId])

}
```

---

## PaymentProvider

```prisma
enum PaymentProvider {

  STRIPE

  RAZORPAY

  PAYPAL

}
```

---

# ExportJob Model

Purpose

Tracks export generation.

---

```prisma
model ExportJob {

  id String @id @default(uuid())

  organizationId String

  invoiceId String?

  format ExportFormat

  status JobStatus

  downloadUrl String?

  expiresAt DateTime?

  requestedById String

  organization Organization
      @relation(fields:[organizationId], references:[id])

  invoice Invoice?
      @relation(fields:[invoiceId], references:[id])

  createdAt DateTime @default(now())

  @@index([organizationId])

}
```

---

# GoogleConnection Model

Purpose

Stores Google Workspace integration.

---

```prisma
model GoogleConnection {

  id String @id @default(uuid())

  organizationId String @unique

  googleEmail String

  refreshToken String

  spreadsheetId String?

  worksheetName String?

  syncEnabled Boolean @default(true)

  organization Organization
      @relation(fields:[organizationId], references:[id])

  createdAt DateTime @default(now())

}
```

# Notification Model

Purpose

Stores user notifications.

---

```prisma
model Notification {

  id String @id @default(uuid())

  userId String

  title String

  message String

  type NotificationType

  isRead Boolean @default(false)

  actionUrl String?

  user User
      @relation(fields:[userId], references:[id])

  createdAt DateTime @default(now())

  @@index([userId])

}
```

---

Notification Types

```prisma
INFO

SUCCESS

WARNING

ERROR
```

---

# AuditLog Model

Purpose

Immutable activity history.

---

```prisma
model AuditLog {

  id String @id @default(uuid())

  organizationId String

  userId String?

  action String

  entity String

  entityId String?

  ipAddress String?

  userAgent String?

  metadata Json?

  organization Organization
      @relation(fields:[organizationId], references:[id])

  user User?
      @relation(fields:[userId], references:[id])

  createdAt DateTime @default(now())

  @@index([organizationId])

  @@index([userId])

  @@index([action])

}
```

---

Example Actions

LOGIN

UPLOAD

DELETE

EXPORT

SYNC

SUBSCRIPTION_UPDATE

ROLE_CHANGE

---

# ProcessingJob Model

Purpose

Tracks background workers.

---

```prisma
model ProcessingJob {

  id String @id @default(uuid())

  worker String

  queue String

  jobType String

  status JobStatus

  retryCount Int

  duration Int?

  errorMessage String?

  metadata Json?

  createdAt DateTime @default(now())

}
```

---

Worker Examples

OCR Worker

AI Worker

Export Worker

Notification Worker

Cleanup Worker

# SystemSetting Model

Purpose

Stores global platform configuration.

---

```prisma
model SystemSetting {

  id String @id @default(uuid())

  key String @unique

  value Json

  description String?

  updatedBy String?

  updatedAt DateTime @updatedAt

}
```

---

Example Settings

SMTP

JWT Expiry

Maximum Upload Size

OCR Provider

AI Provider

Maintenance Mode

---

# Webhook Model

Purpose

Stores outbound webhook endpoints.

---

```prisma
model Webhook {

  id String @id @default(uuid())

  organizationId String

  name String

  url String

  secret String

  events Json

  enabled Boolean @default(true)

  createdAt DateTime @default(now())

}
```

---

Webhook Events

invoice.completed

invoice.failed

subscription.updated

export.completed

organization.created

---

# APIKey Model

Purpose

Allows future public API access.

---

```prisma
model APIKey {

  id String @id @default(uuid())

  organizationId String

  name String

  hashedKey String

  lastUsed DateTime?

  expiresAt DateTime?

  revoked Boolean @default(false)

  createdAt DateTime @default(now())

}
```

---

# Platform Relationships

```text
Organization

│

├── Subscription

│      └── Payments

│

├── ExportJobs

│

├── GoogleConnection

│

├── Webhooks

│

├── API Keys

│

└── Audit Logs

User

│

├── Notifications

│

└── Audit Logs
```

---

# Index Strategy

Subscription

```prisma
@@unique([organizationId])
```

Payment

```prisma
@@index([subscriptionId])
```

Notification

```prisma
@@index([userId])
```

AuditLog

```prisma
@@index([organizationId])

@@index([userId])

@@index([action])
```

Webhook

```prisma
@@index([organizationId])
```

APIKey

```prisma
@@index([organizationId])
```

---

# Best Practices

✓ One subscription per organization

✓ Immutable audit logs

✓ Encrypted webhook secrets

✓ Hashed API keys only

✓ Notification read tracking

✓ Export expiry links

✓ Payment transaction uniqueness

✓ Configuration stored as JSON

✓ Retry failed jobs

✓ Webhook signing

---

# Complete Schema Summary

## Authentication

- Organization
- OrganizationMember
- User
- Session
- RefreshToken

---

## Invoice Processing

- Vendor
- Invoice
- InvoiceItem
- InvoiceAttachment
- Category
- InvoiceCategory
- Tag
- InvoiceTag
- InvoiceHistory

---

## AI & OCR

- OCRJob
- OCRResult
- AIJob
- AIResult
- ValidationReport
- AIPromptHistory
- ConfidenceMetric
- ProcessingPipeline

---

## Platform

- Subscription
- Payment
- ExportJob
- GoogleConnection
- Notification
- AuditLog
- ProcessingJob
- SystemSetting
- Webhook
- APIKey

---

## Total Schema

| Category | Models |
|----------|-------:|
| Authentication | 5 |
| Invoice Processing | 9 |
| AI & OCR | 8 |
| Platform Services | 10 |
| **Total Models** | **32** |

---

# Recommended PostgreSQL Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE EXTENSION IF NOT EXISTS "unaccent";
```

---

# Prisma Commands

Generate Client

```bash
npx prisma generate
```

Create Migration

```bash
npx prisma migrate dev --name init
```

Deploy Migrations

```bash
npx prisma migrate deploy
```

Seed Database

```bash
npx prisma db seed
```

Open Prisma Studio

```bash
npx prisma studio
```

Reset Development Database

```bash
npx prisma migrate reset
```

---

# Production Recommendations

✓ Enable connection pooling

✓ Use Prisma Accelerate or PgBouncer

✓ Apply indexes before production

✓ Enable query logging only in development

✓ Use Decimal for financial fields

✓ Never store plaintext secrets or API keys

✓ Rotate refresh tokens

✓ Archive old audit logs

✓ Use transactions for financial workflows

✓ Monitor slow queries regularly

---

# Document Summary

This Prisma Schema document defines the complete persistence layer for the AI Invoice & Receipt Intake Assistant. It includes 32 production-ready models, enums, relationships, indexing strategies, migration workflows, and operational recommendations. It serves as the primary reference for backend developers implementing the PostgreSQL database with Prisma ORM.

---

# Version History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Complete Prisma Schema Documentation |

---

# Approval

| Role | Status |
|------|--------|
| Database Architect | Approved |
| Backend Architect | Approved |
| Technical Lead | Pending |
| DevOps Engineer | Pending |
| Product Owner | Pending |

