# InvoiceMaker

Upload invoices and receipts, review the extracted fields next to the original, export clean data.
Implements the MVP described in [`docs/`](docs) (AI Invoice & Receipt Intake Assistant). Intended to feed approved
supplier bills into [InWoice](https://github.com/atreyakamat/InWoice) later.

## Run with Docker

```bash
docker compose up -d --build
```

Open http://localhost:3000 and create an account. A short tour starts on first sign-in.

That's all that's required. Data lives in two volumes: `db-data` (PostgreSQL) and `app-data` (uploaded files,
generated secrets). To configure anything, copy `.env.example` to `.env` next to `docker-compose.yml`:

| Variable | Default | Purpose |
|---|---|---|
| `APP_PORT` | `3000` | Published port |
| `AI_API_KEY` | empty | Enables AI extraction (line items, categories, better accuracy). Empty = offline rule-based extraction |
| `AI_BASE_URL` | OpenRouter | Any OpenAI-compatible endpoint: OpenRouter, Gemini, Ollama |
| `AI_MODEL` | `google/gemini-2.5-flash` | Model name for that endpoint |
| `POSTGRES_PASSWORD` | `invoicemaker` | Database password (set before first start) |
| `JWT_SECRET`, `REFRESH_SECRET` | generated | Auth signing keys; generated once and stored in `app-data` |

Update: `git pull && docker compose up -d --build`. The schema is synced on start; changes that would drop data are refused.

## How it works

1. **Upload** PDFs or images (JPG, PNG, TIFF; 25 MB, 20 at a time). Drop files anywhere in the app.
2. **Read**: text PDFs are parsed directly; images go through Tesseract OCR (bundled, works offline).
3. **Extract**: vendor, number, dates, currency, amounts, tax, category, line items. AI model if configured, rules otherwise.
4. **Review**: side-by-side with the original. Totals are cross-checked; duplicates by invoice number are flagged.
   `Ctrl+Enter` approves and opens the next document, `Ctrl+S` saves.
5. **Export** approved (or all reviewed) invoices to CSV or Excel, filtered by date.

Approving creates or matches the vendor automatically.

## Local development

Needs Node.js 20+ and PostgreSQL.

```bash
npm install
cp .env.example server/.env          # set DATABASE_URL
npm run db:push -w server            # create tables
npm run dev:server                   # API on :3000
npm run dev:client                   # UI on :5173, proxies /api to :3000
```

## Layout

```
client/   React 19, MUI, React Query, Framer Motion
server/   Express 5, Prisma, Tesseract.js; in-process processing queue
docs/     product and technical specifications
```

## API

All routes under `/api/v1`, bearer-token auth (`/auth/login`, `/auth/register`, `/auth/refresh`).

| Method | Path | |
|---|---|---|
| `POST` | `/invoices/upload` | multipart, field `files` |
| `GET` | `/invoices` · `/invoices/:id` · `/invoices/:id/file` | list, detail, original file |
| `PUT` | `/invoices/:id` | save edits |
| `POST` | `/invoices/:id/validate` | `{ status: "APPROVED" \| "REJECTED", data }` |
| `POST` | `/invoices/:id/reprocess` | run extraction again |
| `GET` | `/exports/csv` · `/exports/excel` | `?status=approved\|all&from=&to=` |
| `GET` | `/dashboard/analytics` | totals, monthly spend, top vendors |
| | `/vendors` · `/organization` | CRUD |

## License

Proprietary. Copyright © 2026
