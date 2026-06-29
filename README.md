# Smelloff Scheduler

A premium, dark-mode Telegram scheduling platform built with Next.js 15, TypeScript, Prisma, PostgreSQL, Vercel Cron, Server Actions, and Vercel Blob.

## Features

- Single-owner authentication with signed HTTP-only sessions.
- Dashboard metrics for scheduled, published, failed, draft, total, next queued post, queue health, and Telegram status.
- Unlimited post scheduling with HTML or MarkdownV2, notification controls, timezone field, and recurring schedules.
- Vercel Cron endpoint that checks due posts every minute, publishes through the official Telegram Bot API, retries failures up to three times, and stores every API response.
- Telegram support for `sendMessage`, `sendPhoto`, `sendVideo`, `sendDocument`, and `sendMediaGroup`.
- Media library powered by Vercel Blob metadata in PostgreSQL.
- Calendar, logs, and settings screens.
- Production-first environment separation: bot token and channel ID are server-only.

## Environment

Copy `.env.example` to `.env` and fill values. Generate a bcrypt owner password hash with:

```bash
node -e "require('bcryptjs').hash('your-password', 12).then(console.log)"
```

Never commit real `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, database URLs, or session secrets.

## Database

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## Cron

Configure Vercel Cron to call `/api/cron/publish` every minute. If `CRON_SECRET` is set, send `Authorization: Bearer <CRON_SECRET>`.

## API

### `GET /api/cron/publish`
Publishes due scheduled posts, logs responses, retries failed sends, and creates the next occurrence for recurring posts.

### `POST /api/media`
Accepts multipart form data with `file` and optional `folder`, uploads to Vercel Blob, and stores the asset.

## Deployment

1. Push to GitHub.
2. Import into Vercel.
3. Add the environment variables from `.env.example`.
4. Provision Supabase or Neon PostgreSQL and run Prisma migrations.
5. Add Vercel Blob if media uploads are needed.
6. Configure Vercel Cron for `/api/cron/publish`.
