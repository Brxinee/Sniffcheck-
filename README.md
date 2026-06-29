# Smelloff Scheduler

Smelloff Scheduler is a production-ready Telegram scheduling platform for the SmelloffIndia channel. It is built with Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Vercel, GitHub Actions, Server Actions, and Vercel Blob.

## Features

- Single-owner dashboard with signed HTTP-only session authentication.
- Unlimited scheduled, draft, published, failed, and recurring Telegram posts.
- GitHub Actions scheduler that calls the app every 15 minutes, avoiding Vercel Hobby cron limits.
- Safe queue processing with database locks, stale-lock recovery, retry limits, publish logs, and Telegram message ID storage.
- Official Telegram Bot API publishing for `sendMessage`, `sendPhoto`, `sendVideo`, `sendDocument`, and `sendMediaGroup`.
- HTML and MarkdownV2 post modes, emoji and hashtag friendly editor, preview, character counter, save draft, schedule, and publish now actions.
- Media library with Vercel Blob uploads and searchable metadata-ready schema.
- Premium dark Smelloff UI using `#080808` background and `#B8FF57` brand color.

## Folder Structure

```text
app/                    Next.js app router pages and API routes
app/api/scheduler/      Protected scheduler endpoint called by GitHub Actions
components/             Reusable dashboard, post editor, lists, and cards
lib/                    Auth, config, database, Telegram, validation, and scheduler logic
prisma/schema.prisma    PostgreSQL data model and indexes
.github/workflows/      15-minute GitHub Actions scheduler workflow
```

## Environment Variables

Copy `.env.example` to `.env` locally and configure the same variables in Vercel. Add `SCHEDULER_URL` and `SCHEDULER_SECRET` as GitHub repository secrets for the workflow.

Generate a bcrypt owner password hash:

```bash
node -e "require('bcryptjs').hash('your-password', 12).then(console.log)"
```

Never commit real bot tokens, channel IDs, database URLs, scheduler secrets, or session secrets.

## Installation

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Scheduler Architecture

1. GitHub Actions runs `.github/workflows/scheduler.yml` every 15 minutes.
2. The workflow sends `POST /api/scheduler` with `Authorization: Bearer $SCHEDULER_SECRET`.
3. The API validates the bearer token.
4. The scheduler releases stale publishing locks older than 30 minutes.
5. It claims each due scheduled post with an atomic database update.
6. It publishes through the official Telegram Bot API.
7. It marks successful posts as `PUBLISHED`, stores Telegram message IDs, and logs the response.
8. It retries failed posts up to 3 times and marks exhausted posts as `FAILED`.

## API Documentation

### `POST /api/scheduler`

Protected scheduler endpoint. Requires:

```http
Authorization: Bearer <SCHEDULER_SECRET>
```

Returns:

```json
{
  "processed": 0,
  "published": 0,
  "failed": 0,
  "skipped": 0
}
```

### `POST /api/media`

Accepts multipart form data with `file` and optional `folder`. Uploads to Vercel Blob and stores metadata in PostgreSQL.

### `POST /api/ai/generate`

Generates odor-related Telegram post content. Uses OpenAI if configured; otherwise returns a deterministic production-safe fallback.

## Deployment

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Provision Supabase or Neon PostgreSQL and set `DATABASE_URL`.
4. Add all variables from `.env.example` to Vercel.
5. Run Prisma migrations against production.
6. Add GitHub repository secrets `SCHEDULER_URL` and `SCHEDULER_SECRET`.
7. Enable GitHub Actions.
