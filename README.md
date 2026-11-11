# SSCSTUDYPREPHUB (SSPH)

**One Hub. Every Preparation Resource.**

A full-stack digital library and freemium learning platform built for Indian SSC examination aspirants (**SSC CGL, CHSL, MTS, CPO, and GD**).

> **Disclaimer:** SSPH is an independent educational platform and is not affiliated with the Staff Selection Commission (SSC) or the Government of India.

---

## Key Features

- **16-Category SSC Resource Library**: Preparation Books, Study Notes, Previous Year Questions (PYQs), Study Roadmaps, Current Affairs, General Knowledge, Mathematics, English, Reasoning, General Awareness, Indian Polity, History, Geography, Economics, General Science, and Computer Knowledge.
- **Exam, Subject, Type, Access & Popularity Filters + Live Search Autocomplete**.
- **Freemium Business Model**:
  - **FREE (`₹0`)**: Browse the full public catalog, download free PDFs directly, and unlock ad-supported PDFs via verified rewarded advertisements or ShrinkMe.io shortlinks.
  - **10 BOOKS (`₹59`)**: One-time payment granting 10 download credits. Atomically deducts 1 credit per unique unlocked resource; never double-charges on re-downloads or concurrent clicks.
  - **LIFETIME PREMIUM (`₹300`)**: One-time payment granting unlimited ad-free direct PDF downloads for the lifetime of the SSPH service under published Terms.
- **Modular Rewarded-Ad & ShrinkMe.io Architecture**:
  - Supports **Verified Server-Side Callback** (`AD_PROVIDER_MODE=server_callback`) with HMAC-SHA256 verification (`/api/ads/callback`).
  - Supports **ShrinkMe.io** external ad-supported shortlinks (`adShortlinkUrl` per resource + optional `SHRINKME_API_TOKEN`).
  - Includes a strictly **Development-Only `DEMO` Adapter** (`NODE_ENV !== "production"` + `ENABLE_DEMO_AD_UNLOCK=true`).
  - Never treats client clicks, timers, or popup closures as verified ad completion.
- **Protected PDF Delivery**: Original storage paths and external PDF URLs are never leaked in client HTML/JSON. Downloads flow through short-lived server-signed tokens (`/api/download/[token]`).
- **Razorpay Server Verification**: Server-side order creation (`/api/payments/create-order`), HMAC signature verification (`/api/payments/verify`), and idempotent webhooks (`/api/payments/webhook`).
- **Student Dashboard** (`/dashboard`): Profile management, membership & remaining book credits, download history, unlocked resources, saved/favourite PDFs, and transaction ledger.
- **Admin Dashboard** (`/admin`): Resource CRUD, PDF uploads (magic-byte validated), ShrinkMe.io helper, category management, user & role administration, Razorpay revenue ledger, download/ad analytics, and DMCA/complaint handling.

---

## Tech Stack

- **Frontend / Backend**: Next.js 16 (App Router, TypeScript)
- **Styling / Icons**: Tailwind CSS + Lucide Icons + accessible UI primitives
- **Validation**: Zod
- **Database**: Prisma ORM + SQLite (`prisma/schema.prisma`) for zero-cost local dev, with complete Supabase PostgreSQL schema (`prisma/schema.postgresql.prisma`) + Row Level Security policies (`supabase/migrations/0001_initial_schema_with_rls.sql`)
- **Storage**: Local protected disk storage (`storage/`), External PDF URLs, or optional Supabase Private Storage signed URLs

---

## 1. Installation & Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env
```

Edit `.env` and set a strong random `AUTH_SECRET` (minimum 24 characters):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Initialize the local SQLite database and seed the 16 categories + 14 DEMO resources (with real valid PDFs generated in `storage/pdfs/`):

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

---

## 2. Creating the First Admin Account Securely

Do **not** hardcode default admin passwords in source code or public repositories. Create your administrator account securely via the CLI script:

```bash
npm run admin:create -- --email=admin@yourdomain.com --name="SSPH Admin" --password="YourStrongPassword123!"
```

Or run `npm run admin:create` interactively to have the script prompt or generate a strong random one-time password.

---

## 3. Running Locally & Testing

```bash
# Start development server
npm run dev

# Run automated core logic, security & transactional credit tests
npm test

# Typecheck & production build verification
npm run typecheck
npm run build
```

---

## 4. Integrations Requiring External Credentials

| Integration | Environment Variables Required | Behavior When Unconfigured |
| --- | --- | --- |
| **Google Drive Auto-Sync** | `GOOGLE_DRIVE_FOLDER_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON` (or `GOOGLE_DRIVE_API_KEY`), optional `GOOGLE_DRIVE_WEBHOOK_SECRET`, `CRON_SECRET` | Admin Drive tab displays configuration status; manual/auto sync returns clear setup instructions until configured. |
| **Gemini 3.8 Flash SEO Metadata (Optional)** | `GEMINI_API_KEY` (Google AI Studio free tier) | Automatically falls back to free verified **Google Books API + Open Library API + PDF opening-page text extraction**. |
| **Razorpay Payments** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Displays a clear configuration notice on `/pricing` and returns HTTP 503 on order creation. Never fakes payment success. |
| **Rewarded-Ad Callback Provider** | `AD_PROVIDER_MODE="server_callback"`, `AD_PROVIDER_WEBHOOK_SECRET`, `AD_PROVIDER_NAME`, `AD_PROVIDER_EMBED_URL` | Falls back to `shrinkme` (if resource has `adShortlinkUrl`), `demo` (in local dev only if `ENABLE_DEMO_AD_UNLOCK="true"`), or displays an informative message offering ₹59 / ₹300 plans. |
| **ShrinkMe.io Ad Shortlinks** | `SHRINKME_API_TOKEN` + per-resource `adShortlinkUrl` | Auto-shortens Google Drive free links during Drive sync and supports one-click shortening in Admin Dashboard. |
| **Supabase PostgreSQL & Storage (Optional)** | `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` | Uses local SQLite (`file:./dev.db`) and local protected `storage/` folder automatically. |
| **Transactional Email (Optional)** | `RESEND_API_KEY`, `EMAIL_FROM` | In local development, password reset links are logged to the server console. |

---

## 4B. Connecting Google Drive Auto-Sync + 10–15 Page Sample + ShrinkMe + SEO Metadata

1. **Create a Free Google Cloud Project & Enable Google Drive API**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com) (free tier), enable **Google Drive API**.
   - **Recommended (Service Account — works even on private Drive folders & direct paid downloads)**:
     1. Create a Service Account → Keys → Add Key → JSON.
     2. Put the JSON string (or base64) in `GOOGLE_SERVICE_ACCOUNT_JSON` inside `.env`.
     3. Share your Google Drive `BOOKS` folder with that Service Account email (`...@...iam.gserviceaccount.com`) as **Viewer**.
     4. Copy the folder ID from `https://drive.google.com/drive/folders/<FOLDER_ID>` into `GOOGLE_DRIVE_FOLDER_ID`.
   - **Alternative (API Key — for link-shared folders)**: Set `GOOGLE_DRIVE_API_KEY` and share the Drive folder as *"Anyone with the link → Viewer"*.
2. **How Auto-Fetch Works**:
   - **Instant Trigger**: Click **Sync Google Drive Now** inside `/admin` → **Google Drive Auto-Sync**.
   - **Automatic Push Webhook (Production HTTPS)**: Click **Register Push Webhook** in `/admin` (registers Google Drive `files.watch` to `POST /api/webhooks/google-drive` verified via `GOOGLE_DRIVE_WEBHOOK_SECRET`).
   - **Automatic Cron Sync (Every 10 mins)**: `vercel.json` runs `GET /api/cron/drive-sync` with `CRON_SECRET` automatically (or ping it from a free cron service like cron-job.org).
3. **What Each Synced Book Gets Automatically**:
   - First **10–15 pages** sliced via `pdf-lib` into a free inline sample PDF (`/api/resources/[id]/sample`) shown directly on the book page.
   - Web & Drive SEO metadata enrichment (Google Books + Open Library + optional Gemini `gemini-3.8-flash` with `google_search` grounding when `GEMINI_API_KEY` is set).
   - **Free Users**: Auto-shortened **ShrinkMe.io** link (`SHRINKME_API_TOKEN`) showing ads before redirecting to the Drive download.
   - **Paid Users (₹59 10-Books Pass / ₹300 Lifetime)**: Ad-free direct PDF streaming from Google Drive via short-lived signed `/api/download/[token]`.

---

## 5. Switching to Supabase Free Tier (PostgreSQL + Private Storage)

1. Create a free Supabase project at [supabase.com](https://supabase.com).
2. Copy `prisma/schema.postgresql.prisma` over `prisma/schema.prisma`.
3. Update `DATABASE_URL` (Session Pooler) and `DIRECT_URL` in `.env` / hosting environment variables.
4. Push schema & apply Row Level Security policies:
   ```bash
   npx prisma db push
   ```
   Then run `supabase/migrations/0001_initial_schema_with_rls.sql` inside the Supabase SQL Editor to enable RLS and create the private `ssph-resources` storage bucket.
5. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET="ssph-resources"`.

---

## 6. Configuring Razorpay (Test & Live)

1. Sign in to [dashboard.razorpay.com](https://dashboard.razorpay.com) and complete KYC for live payments (Test Mode works immediately without KYC).
2. Under **Account & Settings → API Keys**, generate keys and set:
   - `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
3. Under **Webhooks**, add endpoint:
   `https://yourdomain.com/api/payments/webhook`
   Select events: `payment.captured`, `order.paid`, `payment.failed`.
   Set `RAZORPAY_WEBHOOK_SECRET` to your webhook secret.

---

## 7. Configuring ShrinkMe.io or Rewarded-Ad Provider

### Option A: ShrinkMe.io Free PDF Source (Ad-Shortlink Workflow)
1. Upload or host your free PDF on your CDN / cloud file mirror and shorten that download link inside your [ShrinkMe.io](https://shrinkme.io) dashboard (or set `SHRINKME_API_TOKEN` to auto-shorten from the Admin Dashboard).
2. In SSPH **Admin Dashboard → Add/Edit Resource**, set **Access Type** to `Ad-Supported`, paste the `https://shrinkme.io/...` URL in **ShrinkMe.io Ad-Supported Shortlink**, and also supply a protected source URL/upload so **10-Books Pass** and **Lifetime Premium** members can download directly without viewing ShrinkMe ads.

### Option B: Server-Callback Rewarded Ad Network
1. Set `AD_PROVIDER_MODE="server_callback"` and `AD_PROVIDER_WEBHOOK_SECRET="<your-secret>"`.
2. Configure your ad provider's S2S postback to `POST /api/ads/callback` with JSON `{ sessionToken, externalRef, timestamp, signature }` where `signature` is `HMAC-SHA256("${sessionToken}:${externalRef}:${timestamp}", AD_PROVIDER_WEBHOOK_SECRET)`.

---

## 8. Free-Tier Deployment Guide

1. **Database**: Use Supabase Free Tier PostgreSQL (500 MB database, 1 GB private file storage). Note: SQLite (`file:./dev.db`) is for local development/VPS only—serverless hosts like Vercel do not persist local SQLite files across deployments.
2. **Hosting**: Deploy to **Vercel Hobby (free tier)**, **Railway**, or **Render** (subject to current provider free-tier limits):
   - Connect your Git repository.
   - Set all required production environment variables (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NODE_ENV="production"`, and ensure `ENABLE_DEMO_AD_UNLOCK="false"`).
   - Run `npx prisma db push` and `npm run db:seed` against your production PostgreSQL DB, then run `npm run admin:create` once from your secure local shell with production `DATABASE_URL`.
3. **Custom Domain**: Add your domain in Vercel/Render Project Settings → Domains, configure the DNS `A` / `CNAME` records at your registrar, and update `NEXT_PUBLIC_SITE_URL="https://yourdomain.com"`.
