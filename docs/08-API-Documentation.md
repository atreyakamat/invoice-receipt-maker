# API Documentation

Project Name: AI Invoice & Receipt Intake Assistant

Version: 1.0

API Version

v1

Base URL

https://api.invoiceai.com/api/v1

Protocol

HTTPS

Authentication

JWT Bearer Token

API Format

REST

Content Type

application/json

---

# Table of Contents

1. API Standards
2. Authentication
3. HTTP Status Codes
4. Error Response Model
5. Authentication APIs
6. Organization APIs
7. User APIs
8. Invoice APIs
9. OCR APIs
10. AI APIs
11. Validation APIs
12. Dashboard APIs
13. Export APIs
14. Google Sheets APIs
15. Subscription APIs
16. Admin APIs
17. Webhooks
18. Rate Limiting

---

# 1 API Standards

## Base URL

https://api.invoiceai.com/api/v1

---

## Request Format

JSON

---

## Response Format

JSON

---

## Authentication Header

Authorization: Bearer JWT_TOKEN

---

## API Versioning

/api/v1/

Future

/api/v2/

---

## Time Format

ISO-8601

Example

2026-07-10T15:32:45Z

---

## Currency

ISO-4217

Example

INR

USD

EUR

---

# 2 Authentication

Protected APIs require

Authorization

Bearer Token

Example

Authorization: Bearer eyJhbGci...

---

Token Lifetime

Access Token

15 Minutes

Refresh Token

7 Days

---

# 3 HTTP Status Codes

| Code | Description |
|------|-------------|
|200|Success|
|201|Created|
|202|Accepted|
|204|No Content|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|422|Validation Failed|
|429|Rate Limit|
|500|Internal Server Error|
|503|Service Unavailable|

---

# 4 Error Response Model

```json
{
  "success": false,
  "error": {
    "code": "INV-001",
    "message": "Invoice not found",
    "timestamp": "2026-06-29T10:00:00Z",
    "requestId": "req_928193"
  }
}
```

---

# 5 Authentication APIs

## Register User

POST

/api/v1/auth/register

---

Description

Create a new user account.

---

Request

```json
{
  "firstName":"John",
  "lastName":"Doe",
  "email":"john@example.com",
  "password":"SecurePassword123!",
  "organization":"Acme Pvt Ltd"
}
```

---

Success Response

201 Created

```json
{
  "success":true,
  "message":"Registration successful",
  "userId":"usr_001"
}
```

---

Errors

400

409

422

---

## Login

POST

/api/v1/auth/login

---

Request

```json
{
 "email":"john@example.com",
 "password":"SecurePassword123!"
}
```

---

Response

```json
{
 "accessToken":"...",
 "refreshToken":"...",
 "expiresIn":900
}
```

---

## Refresh Token

POST

/api/v1/auth/refresh

---

## Logout

POST

/api/v1/auth/logout

---

## Forgot Password

POST

/api/v1/auth/forgot-password

---

## Reset Password

POST

/api/v1/auth/reset-password

---

## Verify Email

POST

/api/v1/auth/verify-email

# 6 Organization APIs

## Create Organization

POST

/api/v1/organizations

---

Request

```json
{
 "companyName":"Acme Pvt Ltd",
 "currency":"INR",
 "timezone":"Asia/Kolkata"
}
```

---

Response

201

```json
{
 "organizationId":"org_001"
}
```

---

## Get Organization

GET

/api/v1/organizations/{id}

---

## Update Organization

PATCH

/api/v1/organizations/{id}

---

## Delete Organization

DELETE

/api/v1/organizations/{id}

---

## Invite Member

POST

/api/v1/organizations/{id}/invite

---

## Remove Member

DELETE

/api/v1/organizations/{id}/members/{memberId}

---

## Change Member Role

PATCH

/api/v1/organizations/{id}/members/{memberId}

---

# 7 User APIs

## Get Current User

GET

/api/v1/users/me

---

## Update Profile

PATCH

/api/v1/users/me

---

## Change Password

PATCH

/api/v1/users/password

---

## Upload Avatar

POST

/api/v1/users/avatar

---

## Delete Account

DELETE

/api/v1/users/me

# 8 Invoice APIs

## Upload Invoice

POST

/api/v1/invoices/upload

Content-Type

multipart/form-data

---

Request

file

organizationId

---

Response

```json
{
 "invoiceId":"inv_1001",
 "status":"queued"
}
```

---

## Bulk Upload

POST

/api/v1/invoices/bulk-upload

---

## Get All Invoices

GET

/api/v1/invoices

Supports

Pagination

Filtering

Sorting

Search

---

Query Parameters

page

limit

status

vendor

category

dateFrom

dateTo

---

## Get Invoice

GET

/api/v1/invoices/{invoiceId}

---

## Update Invoice

PATCH

/api/v1/invoices/{invoiceId}

---

## Delete Invoice

DELETE

/api/v1/invoices/{invoiceId}

---

## Retry Invoice Processing

POST

/api/v1/invoices/{invoiceId}/retry

---

## Download Original

GET

/api/v1/invoices/{invoiceId}/download

---

## Invoice Status

GET

/api/v1/invoices/{invoiceId}/status

---

# Pagination Example

```json
{
 "page":1,
 "limit":20,
 "total":560,
 "items":[]
}
```

---

# Invoice Status Values

Queued

OCR

AI

Validation

Completed

Rejected

Failed

# 9 OCR APIs

## Start OCR

POST

/api/v1/ocr/process

---

## OCR Status

GET

/api/v1/ocr/jobs/{jobId}

---

## OCR Result

GET

/api/v1/ocr/results/{invoiceId}

---

## Retry OCR

POST

/api/v1/ocr/retry

---

## OCR Logs

GET

/api/v1/ocr/logs/{invoiceId}

---

# Response Example

```json
{
 "status":"completed",
 "confidence":98,
 "pages":3
}
```

---

# 10 AI APIs

## AI Extraction

POST

/api/v1/ai/extract

---

## Retry Extraction

POST

/api/v1/ai/retry

---

## AI Result

GET

/api/v1/ai/results/{invoiceId}

---

## Confidence

GET

/api/v1/ai/confidence/{invoiceId}

---

## Validate AI JSON

POST

/api/v1/ai/validate

---

Response

```json
{
 "vendor":"Adobe",
 "invoiceNumber":"INV-2026",
 "confidence":97
}
```

---

# 11 Validation APIs

## Run Validation

POST

/api/v1/validation/run

---

## Approve Invoice

POST

/api/v1/validation/approve

---

## Reject Invoice

POST

/api/v1/validation/reject

---

## Validation Report

GET

/api/v1/validation/{invoiceId}

---

## Validation History

GET

/api/v1/validation/history

# 12 Dashboard APIs

The Dashboard APIs provide aggregated business insights and real-time metrics for authenticated users.

---

## Get Dashboard Summary

GET

/api/v1/dashboard

### Description

Returns an overview of invoices, processing status, expenses, and subscription usage.

### Response

```json
{
  "totalInvoices": 245,
  "processed": 231,
  "pending": 8,
  "failed": 6,
  "monthlyExpense": 125430.50,
  "documentsRemaining": 755
}
```

---

## Get Dashboard Charts

GET

/api/v1/dashboard/charts

### Query Parameters

period

daily

weekly

monthly

yearly

---

Response

```json
{
  "labels":["Jan","Feb","Mar"],
  "expenses":[25000,42000,31000],
  "tax":[3200,5100,4200]
}
```

---

## Vendor Analytics

GET

/api/v1/dashboard/vendors

---

Response

```json
{
 "vendors":[
   {
      "name":"Adobe",
      "totalInvoices":32,
      "amount":54200
   }
 ]
}
```

---

## Expense Categories

GET

/api/v1/dashboard/categories

---

## Monthly Trends

GET

/api/v1/dashboard/trends

---

## Processing Statistics

GET

/api/v1/dashboard/processing

---

# 13 Export APIs

## Generate CSV

POST

/api/v1/export/csv

---

Request

```json
{
 "filters":{
   "dateFrom":"2026-01-01",
   "dateTo":"2026-12-31"
 }
}
```

---

Response

```json
{
 "jobId":"exp_001",
 "status":"processing"
}
```

---

## Export Excel

POST

/api/v1/export/excel

---

## Export JSON

POST

/api/v1/export/json

---

## Export PDF Report

POST

/api/v1/export/pdf

---

## Export Status

GET

/api/v1/export/jobs/{jobId}

---

## Download Export

GET

/api/v1/export/download/{jobId}

---

## Cancel Export

DELETE

/api/v1/export/jobs/{jobId}

---

# Export Status

Queued

Running

Completed

Failed

Expired

---

# 14 Google Sheets APIs

## Connect Google Account

POST

/api/v1/google/connect

---

## OAuth Callback

GET

/api/v1/google/callback

---

## Get Connection Status

GET

/api/v1/google/status

---

## Synchronize Invoice

POST

/api/v1/google/sync/{invoiceId}

---

## Synchronize All

POST

/api/v1/google/sync-all

---

## Disconnect Account

DELETE

/api/v1/google/disconnect

---

## Retry Synchronization

POST

/api/v1/google/retry/{jobId}

---

# Response

```json
{
 "status":"connected",
 "spreadsheetId":"sheet_001"
}
```

---

# 15 Subscription APIs

## Get Current Subscription

GET

/api/v1/subscription

---

## Create Subscription

POST

/api/v1/subscription

---

## Upgrade Plan

PATCH

/api/v1/subscription/upgrade

---

## Downgrade Plan

PATCH

/api/v1/subscription/downgrade

---

## Cancel Subscription

DELETE

/api/v1/subscription

---

## Usage Statistics

GET

/api/v1/subscription/usage

---

## Billing History

GET

/api/v1/subscription/invoices

---

## Payment Methods

GET

/api/v1/subscription/payment-methods

---

## Update Payment Method

PATCH

/api/v1/subscription/payment-method

---

## Plans

GET

/api/v1/subscription/plans

---

Response

```json
{
 "plan":"Professional",
 "documentsUsed":245,
 "remaining":755,
 "renewalDate":"2026-08-01"
}
```

# 16 Administration APIs

## Get Admin Dashboard

GET

/api/v1/admin/dashboard

---

## List Users

GET

/api/v1/admin/users

---

## User Details

GET

/api/v1/admin/users/{userId}

---

## Suspend User

PATCH

/api/v1/admin/users/{userId}/suspend

---

## Delete User

DELETE

/api/v1/admin/users/{userId}

---

## Organizations

GET

/api/v1/admin/organizations

---

## AI Jobs

GET

/api/v1/admin/jobs/ai

---

## OCR Jobs

GET

/api/v1/admin/jobs/ocr

---

## Retry Failed Job

POST

/api/v1/admin/jobs/{jobId}/retry

---

## Queue Statistics

GET

/api/v1/admin/queues

---

## System Logs

GET

/api/v1/admin/logs

---

## System Metrics

GET

/api/v1/admin/metrics

---

## Platform Settings

PATCH

/api/v1/admin/settings

---

# 17 Webhook APIs

External systems can subscribe to platform events.

---

## Webhook Events

invoice.created

invoice.updated

invoice.completed

invoice.failed

export.completed

subscription.renewed

subscription.cancelled

organization.created

user.invited

---

## Register Webhook

POST

/api/v1/webhooks

---

## Update Webhook

PATCH

/api/v1/webhooks/{id}

---

## Delete Webhook

DELETE

/api/v1/webhooks/{id}

---

## Test Webhook

POST

/api/v1/webhooks/{id}/test

---

## Webhook Payload

```json
{
 "event":"invoice.completed",
 "timestamp":"2026-06-29T10:30:00Z",
 "data":{
   "invoiceId":"inv_001",
   "organizationId":"org_001",
   "status":"completed"
 }
}
```

---

# 18 Rate Limiting

| Endpoint | Limit |
|-----------|------:|
| Authentication | 10 requests/minute |
| Upload | 20 requests/hour |
| Standard APIs | 100 requests/minute |
| Export | 10 requests/hour |
| Admin APIs | 300 requests/minute |

---

# 19 Idempotency

Endpoints that create resources should support idempotency.

Supported Endpoints

- Invoice Upload
- Export Generation
- Subscription Creation
- Google Sync

---

### Header

Idempotency-Key

Example

```
Idempotency-Key: 84f93d0a-1234-5678-ae45-29efac22e891
```

---

# 20 Pagination Standard

List endpoints return:

```json
{
  "page":1,
  "limit":20,
  "total":560,
  "pages":28,
  "items":[]
}
```

---

# 21 Standard Response Model

Success

```json
{
  "success":true,
  "message":"Operation completed successfully",
  "data":{}
}
```

Failure

```json
{
  "success":false,
  "error":{
      "code":"VAL-001",
      "message":"Validation failed"
  }
}
```

---

# 22 Security Headers

Responses should include

Strict-Transport-Security

Content-Security-Policy

X-Content-Type-Options

X-Frame-Options

Referrer-Policy

Permissions-Policy

Cross-Origin-Resource-Policy

---

# 23 API Versioning

Current

/api/v1/

Future

/api/v2/

Deprecated versions remain supported for six months before removal.

---

# 24 SDK Examples

## JavaScript

```javascript
const response = await fetch("/api/v1/invoices", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

const data = await response.json();
```

---

## Python

```python
import requests

headers = {
    "Authorization": f"Bearer {token}"
}

response = requests.get(
    "https://api.invoiceai.com/api/v1/invoices",
    headers=headers
)

print(response.json())
```

---

## cURL

```bash
curl -X GET \
https://api.invoiceai.com/api/v1/invoices \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

# 25 API Error Codes

| Code | Description |
|------|-------------|
| AUTH-001 | Invalid credentials |
| AUTH-002 | Token expired |
| AUTH-003 | Account locked |
| INV-001 | Invoice not found |
| INV-002 | Invalid file |
| OCR-001 | OCR processing failed |
| AI-001 | AI extraction failed |
| VAL-001 | Validation failed |
| EXP-001 | Export failed |
| SUB-001 | Subscription required |
| SYS-001 | Internal server error |

---

# 26 API Changelog

| Version | Description |
|----------|-------------|
| v1.0 | Initial release |
| v1.1 | Google Sheets integration |
| v1.2 | Export APIs |
| v2.0 | Planned public developer API |

---

# Document Summary

This API documentation defines all public and administrative endpoints required by the AI Invoice & Receipt Intake Assistant. It standardizes request and response formats, authentication, pagination, rate limiting, webhook behavior, security headers, and SDK usage examples, enabling frontend, backend, and third-party developers to integrate with the platform consistently.

---

# Version History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Complete REST API Documentation |

---

# Approval

| Role | Status |
|------|--------|
| API Architect | Approved |
| Backend Lead | Pending |
| Frontend Lead | Pending |
| QA Lead | Pending |
| Security Architect | Pending |
