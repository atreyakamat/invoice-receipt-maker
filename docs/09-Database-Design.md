# Database Design Document

Project Name: AI Invoice & Receipt Intake Assistant

Version: 1.0

Prepared By:
Database Architecture Team

Database:
PostgreSQL 16

ORM:
Prisma ORM

Status:
Draft

---

# Table of Contents

1. Introduction
2. Database Goals
3. Design Principles
4. Database Architecture
5. Entity Relationship Overview
6. Naming Conventions
7. Core Entities
8. Relationships
9. Primary Keys
10. Foreign Keys
11. Indexing Strategy
12. Constraints
13. Multi-Tenant Strategy
14. Soft Deletes
15. Audit Logging
16. Backup Strategy

---

# 1. Introduction

This document defines the relational database architecture for the AI Invoice & Receipt Intake Assistant.

The database is designed to support:

- Multi-tenant SaaS deployment
- High transaction integrity
- Scalable invoice processing
- AI-generated metadata
- Subscription billing
- Reporting & analytics
- Audit logging

PostgreSQL has been selected as the primary datastore due to its ACID compliance, strong indexing capabilities, and excellent support for structured financial data.

---

# 2. Database Goals

The database must provide:

✓ Data Integrity

✓ High Availability

✓ Horizontal Read Scaling

✓ Transaction Safety

✓ Referential Integrity

✓ Secure Multi-Tenant Isolation

✓ Fast Search

✓ Efficient Reporting

---

# 3. Design Principles

## Normalization

The schema follows Third Normal Form (3NF) to eliminate redundancy while maintaining query efficiency.

---

## ACID Compliance

Every financial transaction shall be atomic, consistent, isolated, and durable.

---

## Foreign Key Integrity

All relationships shall enforce referential integrity using foreign key constraints.

---

## Immutable Audit Trail

Critical operations shall be recorded in audit tables.

---

## Soft Deletes

Business records shall be soft deleted using `deleted_at` timestamps instead of permanent deletion.

---

# 4. Database Architecture

```text
                    PostgreSQL

                         │

      ┌──────────────────┼──────────────────┐

      │                  │                  │

 Authentication     Invoice System      Billing

      │                  │                  │

 Organizations     OCR + AI Data     Audit Logs

      │                  │                  │

 Dashboard        Exports          Notifications
```

---

# 5. Entity Relationship Overview

Core business entities:

- Users
- Organizations
- Organization Members
- Sessions
- Invoices
- Invoice Items
- OCR Jobs
- AI Jobs
- Validation Reports
- Categories
- Vendors
- Exports
- Google Connections
- Subscriptions
- Payments
- Notifications
- Audit Logs
- Processing Jobs
- System Settings

---

# 6. Naming Conventions

## Tables

Plural

Examples

users

organizations

invoice_items

subscriptions

---

## Columns

snake_case

Examples

invoice_number

created_at

updated_at

organization_id

---

## Primary Keys

UUID

Example

id UUID PRIMARY KEY

---

## Foreign Keys

table_name_id

Example

organization_id

invoice_id

user_id

---

# 7. Core Entity Overview

## User

Purpose

Stores authenticated users.

Relationships

Belongs to Organization

Owns Sessions

Creates Invoices

Receives Notifications

---

## Organization

Purpose

Represents a tenant/business.

Relationships

Has Many Users

Has Many Invoices

Has Subscription

Has Google Connection

---

## Invoice

Purpose

Stores invoice metadata.

Relationships

Belongs to Organization

Has Many Invoice Items

Has OCR Result

Has AI Result

Has Validation Report

---

## Invoice Item

Purpose

Stores line items extracted from invoices.

---

## Vendor

Purpose

Maintains vendor history and analytics.

---

## Subscription

Purpose

Stores billing information.

---

## Payment

Purpose

Stores payment transactions.

---

## Audit Log

Purpose

Stores immutable activity records.

---

# 8. Relationship Summary

Organization

1 ---- N Users

Organization

1 ---- N Invoices

Invoice

1 ---- N Invoice Items

Invoice

1 ---- 1 OCR Result

Invoice

1 ---- 1 AI Result

Invoice

1 ---- 1 Validation Report

Organization

1 ---- 1 Subscription

Subscription

1 ---- N Payments

User

1 ---- N Audit Logs

User

1 ---- N Notifications

Organization

1 ---- N Exports

Organization

1 ---- N Google Sync Jobs

---

# 9. Primary Keys

All primary keys use UUID.

Benefits

Globally Unique

Safe Distributed Systems

No Predictable IDs

Easy Replication

---

# UUID Format

550e8400-e29b-41d4-a716-446655440000

---

# 10. Foreign Keys

Examples

organization_id

REFERENCES organizations(id)

---

invoice_id

REFERENCES invoices(id)

---

user_id

REFERENCES users(id)

---

subscription_id

REFERENCES subscriptions(id)

# 11. Indexing Strategy

The following indexes should be created to optimize query performance.

---

Users

email (Unique)

organization_id

created_at

---

Organizations

company_name

created_at

---

Invoices

invoice_number

vendor_id

organization_id

status

invoice_date

created_at

---

Invoice Items

invoice_id

---

OCR Jobs

status

created_at

---

AI Jobs

status

invoice_id

---

Validation Reports

invoice_id

approval_status

---

Audit Logs

user_id

organization_id

created_at

---

Notifications

user_id

is_read

created_at

---

Payments

subscription_id

payment_date

---

# Composite Indexes

organization_id + invoice_date

organization_id + status

organization_id + vendor_id

organization_id + created_at

---

# Full Text Search

Recommended

PostgreSQL Full Text Search

Searchable Fields

Vendor Name

Invoice Number

Invoice Notes

AI Notes

---

# 12. Constraints

Unique

users.email

invoice.invoice_number (per organization)

google_connections.organization_id

---

Not Null

organization_id

invoice_number

created_at

updated_at

status

---

Check Constraints

total_amount >= 0

tax_amount >= 0

confidence_score BETWEEN 0 AND 100

---

Enum Constraints

Invoice Status

Queued

OCR

AI

Validation

Completed

Rejected

Failed

---

# 13. Multi-Tenant Strategy

Every business record contains:

organization_id

All queries must include tenant filtering.

Example

```sql
SELECT *
FROM invoices
WHERE organization_id = :organizationId;
```

---

Benefits

Data Isolation

Security

Simplified Billing

Independent Analytics

White-label Ready

---

# 14. Soft Delete Strategy

Instead of deleting rows:

deleted_at TIMESTAMP NULL

Example

```sql
UPDATE invoices
SET deleted_at = NOW()
WHERE id = '...';
```

---

Benefits

Recoverability

Audit Compliance

Historical Reporting

---

# 15. Audit Logging

Critical operations recorded:

Login

Logout

Invoice Upload

Invoice Update

Invoice Delete

Export

Google Sync

Subscription Change

User Invitation

Role Changes

---

Audit Log Fields

id

user_id

organization_id

action

entity

entity_id

ip_address

user_agent

timestamp

---

# 16. Backup Strategy

Database

Daily Full Backup

Hourly Incremental Backup

---

Point-in-Time Recovery (PITR)

Enabled

---

Backup Retention

30 Days

---

Replication

Primary Database

↓

Read Replica

↓

Disaster Recovery Replica

---

# Recovery Targets

RPO

30 Minutes

RTO

2 Hours

---

# Version History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Database Design Foundation |

---

# Approval

| Role | Status |
|------|--------|
| Database Architect | Approved |
| Backend Lead | Pending |
| DevOps Engineer | Pending |
| Security Architect | Pending |

# 17. Database Schema Definition

This section defines every table, its purpose, columns, constraints, indexes, and relationships.

---

# Table 1 - organizations

## Purpose

Stores tenant/business information.

---

## Columns

| Column | Type | Constraints |
|---------|------|-------------|
| id | UUID | PK |
| company_name | VARCHAR(255) | NOT NULL |
| legal_name | VARCHAR(255) | NULL |
| tax_id | VARCHAR(100) | NULL |
| email | VARCHAR(255) | NULL |
| phone | VARCHAR(30) | NULL |
| website | VARCHAR(255) | NULL |
| currency | VARCHAR(10) | NOT NULL |
| timezone | VARCHAR(100) | NOT NULL |
| logo_url | TEXT | NULL |
| status | VARCHAR(30) | DEFAULT 'active' |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |
| deleted_at | TIMESTAMP | NULL |

---

## Indexes

PRIMARY KEY(id)

INDEX(company_name)

INDEX(status)

---

## Relationships

1 Organization

↓

Many Users

Many Invoices

Many Vendors

One Subscription

---

# Prisma

```prisma
model Organization {
  id          String   @id @default(uuid())
  companyName String
  currency    String
  timezone    String
  createdAt   DateTime @default(now())

  users        User[]
  invoices     Invoice[]
  vendors      Vendor[]
  subscription Subscription?
}
```

---

# Table 2 - users

Purpose

Stores registered users.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| first_name | VARCHAR(100) |
| last_name | VARCHAR(100) |
| email | VARCHAR(255) |
| password_hash | TEXT |
| role | VARCHAR(30) |
| avatar | TEXT |
| email_verified | BOOLEAN |
| last_login | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

## Constraints

UNIQUE(email)

FK(organization_id)

---

## Indexes

email

organization_id

role

---

## Relationships

Organization

↓

Users

↓

Sessions

↓

Audit Logs

---

# Table 3 - organization_members

Purpose

Supports multiple users per organization.

---

## Columns

id

organization_id

user_id

role

joined_at

status

---

# Table 4 - sessions

Purpose

Stores refresh sessions.

---

## Columns

id

user_id

refresh_token

device_name

ip_address

user_agent

expires_at

created_at

---

## Indexes

user_id

expires_at

---

# Table 5 - invoices

Purpose

Stores invoice metadata.

---

## Columns

| Column | Type |
|---------|------|
| id | UUID |
| organization_id | UUID |
| vendor_id | UUID |
| invoice_number | VARCHAR(100) |
| invoice_date | DATE |
| due_date | DATE |
| currency | VARCHAR(10) |
| subtotal | DECIMAL(12,2) |
| tax | DECIMAL(12,2) |
| discount | DECIMAL(12,2) |
| total | DECIMAL(12,2) |
| confidence | DECIMAL(5,2) |
| status | VARCHAR(30) |
| storage_url | TEXT |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

## Indexes

organization_id

invoice_number

vendor_id

status

invoice_date

created_at

---

## Relationships

Organization

↓

Invoice

↓

Invoice Items

OCR Result

AI Result

Validation

Exports

---

# Prisma

```prisma
model Invoice {
  id            String   @id @default(uuid())
  invoiceNumber String
  subtotal      Decimal
  tax           Decimal
  total         Decimal
  status        String
}
```

---

# Table 6 - invoice_items

Purpose

Stores extracted line items.

---

## Columns

id

invoice_id

item_name

description

quantity

unit_price

tax

discount

line_total

created_at

---

## Relationships

Invoice

↓

Many Invoice Items

---

# Table 7 - vendors

Purpose

Stores vendor information.

---

## Columns

id

organization_id

vendor_name

email

phone

gst_number

address

city

country

website

created_at

updated_at

---

## Indexes

organization_id

vendor_name

gst_number

---

## Relationships

Vendor

↓

Invoices

Analytics

# Table 8 - ocr_jobs

Purpose

Tracks OCR processing jobs.

---

## Columns

id

invoice_id

status

provider

confidence

processing_time

retry_count

started_at

completed_at

created_at

---

## Status

Queued

Running

Completed

Failed

Retrying

---

# Table 9 - ocr_results

Purpose

Stores OCR output.

---

## Columns

id

invoice_id

raw_text

bounding_boxes

page_count

language

confidence

created_at

---

# Table 10 - ai_jobs

Purpose

Tracks AI extraction jobs.

---

## Columns

id

invoice_id

provider

model

status

prompt_tokens

completion_tokens

processing_time

created_at

---

# Table 11 - invoice_ai_results

Purpose

Stores structured AI extraction.

---

## Columns

id

invoice_id

vendor

invoice_number

invoice_date

due_date

currency

subtotal

tax

discount

total

category

payment_terms

confidence

ai_notes

json_result

created_at

---

# Table 12 - validation_reports

Purpose

Stores validation results.

---

## Columns

id

invoice_id

validation_score

approval_status

errors

warnings

reviewed_by

reviewed_at

created_at

---

## Approval Status

Approved

Manual Review

Rejected

---

# Table 13 - exports

Purpose

Stores generated export history.

---

## Columns

id

organization_id

format

status

download_url

requested_by

expires_at

created_at

---

# Table 14 - google_connections

Purpose

Stores Google Workspace integration.

---

## Columns

id

organization_id

google_account

refresh_token

spreadsheet_id

worksheet

sync_enabled

created_at

---

# Table 15 - subscriptions

Purpose

Stores SaaS subscription information.

---

## Columns

id

organization_id

plan

billing_cycle

status

document_limit

documents_used

renewal_date

created_at

---

# Table 16 - payments

Purpose

Stores payment history.

---

## Columns

id

subscription_id

provider

transaction_id

amount

currency

status

payment_date

invoice_url

created_at


# Table 17 - notifications

Purpose

Stores user notifications.

---

## Columns

id

user_id

title

message

type

is_read

sent_at

created_at

---

# Table 18 - audit_logs

Purpose

Immutable activity history.

---

## Columns

id

organization_id

user_id

action

entity

entity_id

ip_address

user_agent

metadata

created_at

---

## Examples

LOGIN

UPLOAD

EXPORT

DELETE

GOOGLE_SYNC

SUBSCRIPTION_CHANGE

---

# Table 19 - processing_jobs

Purpose

Tracks background jobs.

---

## Columns

id

job_type

status

worker

retry_count

started_at

completed_at

duration

error_message

created_at

---

# Table 20 - system_settings

Purpose

Stores platform configuration.

---

## Columns

id

key

value

description

updated_by

updated_at

---

# Entity Relationship Summary

```text
Organization
│
├── Users
│    ├── Sessions
│    ├── Notifications
│    └── Audit Logs
│
├── Vendors
│
├── Invoices
│    ├── Invoice Items
│    ├── OCR Jobs
│    ├── OCR Results
│    ├── AI Jobs
│    ├── AI Results
│    ├── Validation Reports
│    └── Exports
│
├── Google Connections
│
└── Subscription
     └── Payments
```

---

# Recommended PostgreSQL Extensions

Enable the following extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

---

# Database Maintenance

## Scheduled Tasks

- Daily VACUUM ANALYZE
- Weekly REINDEX
- Monthly Statistics Refresh
- Daily Backup Verification
- Quarterly Index Review

---

# Migration Strategy

Use Prisma Migrate.

Workflow:

1. Modify Prisma schema.
2. Generate migration.
3. Review SQL.
4. Apply to staging.
5. Apply to production.
6. Verify migration.

---

# Performance Guidelines

- Use UUIDs for identifiers.
- Create indexes on all foreign keys.
- Avoid `SELECT *` in production.
- Use pagination for list APIs.
- Batch inserts where possible.
- Archive old audit logs.
- Cache dashboard aggregates.

---

# Document Summary

This database design provides a normalized PostgreSQL schema with 20 core tables, tenant isolation, strong referential integrity, audit logging, optimized indexing, and a migration strategy. It is intended to serve as the implementation blueprint for the persistence layer of the AI Invoice & Receipt Intake Assistant.

---

# Version History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Complete Database Schema |

---

# Approval

| Role | Status |
|------|--------|
| Database Architect | Approved |
| Backend Lead | Pending |
| Technical Architect | Pending |
| DevOps Lead | Pending |