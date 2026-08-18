# Noto

All-in-one personal productivity workspace: tasks, Kanban, notes, calendar, projects, and inbox.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Prisma/PostgreSQL (Neon), cookie sessions.

## Setup

1. Create a free database at [neon.tech](https://neon.tech).
2. Copy `.env.example` to `.env`.
3. Paste the **pooled** URL into `DATABASE_URL` and the **direct** URL into `DIRECT_URL`.
4. Keep or replace `AUTH_SECRET`.

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo login:

- Email: `demo@noto.app`
- Password: `noto-demo`

## Vercel

Set the same three env vars in the Vercel project, then redeploy. The build already runs `prisma generate`.

## Product

Projects connect tasks, notes, and calendar events. Inbox is for unsorted capture. Search with `Ctrl/Cmd + K`. Quick add with `Ctrl/Cmd + N`.
