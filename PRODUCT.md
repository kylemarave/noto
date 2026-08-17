# Product

<!-- uizze:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js (App Router) + TypeScript + Tailwind CSS + Prisma/SQLite + cookie-session auth. Chosen because the repo is empty, the brief forbids a static prototype, SQLite can later move to Postgres, and the stack stays modular. Light-mode tokens are reserved in CSS variables; the shipped theme is the user-pinned dark workspace.

## Users

Primary user: a single person managing personal and work work in one daily workspace. They open the app to see what to do today, capture ideas quickly, and keep tasks, notes, and dates connected through projects.

## Product Purpose

Noto is an all-in-one productivity workspace: tasks + Kanban + notes + calendar + planning in one place. Success means a user can open it every day and immediately understand what they need to do.

## Positioning

Projects are the connective tissue. A due date on a task appears on the calendar; a note and an event can belong to the same project; the dashboard summarizes the whole system. It is one workspace, not a set of unrelated pages.

## Operating Context

Daily desktop-first use with laptop, tablet, and mobile support. Keyboard capture (Ctrl/Cmd+K search, quick add). Inbox for unsorted capture, then organize into projects, tasks, notes, or calendar.

## Capabilities and Constraints

Confirmed for MVP: dashboard, inbox, tasks/Kanban, projects, notes, calendar, global search, quick add, auth with per-user data.

Explicitly deferred: habits, goals, time tracking, Pomodoro, reminders, recurring tasks, attachments, teams, comments, activity history, AI, analytics, automations, templates, third-party integrations.

Product name is **Noto**.

## Brand Commitments

User-pinned visual system (overrides the prompt’s light palette for v1):

- Inter Regular and Medium, letter-spacing -0.15px
- Type sizes: 12px sidebar, 13px labels, 14px main, 24px KPIs
- Surfaces: #141414 page, #181818 cards/sidebar, #FFFFFF text
- Icons: 16px line icons, stroke 1.25
- Dark, quiet, operational dashboard — not a marketing site
- Do not copy proprietary third-party UI; use the token system only

## Evidence on Hand

No real user data, logos, or testimonials. Seed/demo content is synthetic and labeled as such.

## Product Principles

1. One connected system, not separate apps.
2. Simple enough for daily use; powerful enough to manage everything.
3. Capture first (Inbox), organize later.
4. Architecture can grow; do not ship deferred features now.
5. Real persistence, not a fake prototype.
