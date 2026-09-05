# Design

<!-- Recorded from the shipped Noto workspace shell. -->

## World

Dark operational workspace. Charcoal layers, inverted white controls, no extra brand color on chrome. Built for daily desk use, not a marketing dashboard.

## Color

Monochrome. Greyscale is the entire palette; red is the only hue and it is
reserved for destructive actions and overdue dates.

- Page: `#141414`
- Surface (sidebar, dialogs, calendar cells): `#181818`
- Text: `#FFFFFF`
- Muted/subtle: white at 58% / 48% (both clear 4.5:1 on the page)
- Border/line: white at 8% / 16%
- Fill: white at 6% / 10% — inputs and hover use fill, not borders
- Primary control: white fill, `#141414` text
- Danger only: `#F07167` dark, `#C0392F` light
- Project colors are a greyscale ramp. Any legacy hex is collapsed to its
  perceived lightness by `monoTint()` so old data never reintroduces hue.
- Light theme tokens exist on `[data-theme="light"]`. Dark is default.

## Type

- Inter 400 and 500
- Letter-spacing: `-0.15px`
- Sizes: 12px sidebar/captions, 13px labels, 14px main UI, 24px titles/KPIs
- No other sizes

## Layout

Operate mode: content pins under the header. Never vertically center a
workspace page — that leaves a void above the work.

- Desktop (lg+ / iPad landscape): 248px sidebar | main
- Collapsible sidebar to 72px on desktop
- Phone: header + content + bottom nav (5 destinations)
- iPad portrait: hamburger + overlay drawer, no bottom nav; 44px tap targets; horizontal Kanban/calendar scroll
- Main pad: 16px / 24px (`px-4 py-5` → `md:px-6 md:py-6`)
- Data pages (dashboard, projects, notes, tasks, calendar) use the full pane
- Forms (settings, note body, inbox capture) stay a reading measure, left-aligned
- Inbox: capture rail ~22rem | unsorted list
- Notes: 320px list rail | editor, filling leftover viewport height
- Section stack `gap-7`–`gap-8`; heading to content `gap-3`; row cluster tighter than section
- Active nav: white pill, dark text
- Icons in chrome: 16px, stroke 1.25, simple geometry

## Components

Pages are lists, not card walls. A row is a hairline bottom border, a 14px
title, a 12px meta line, and a right-aligned tabular value. Cards survive only
where an object is genuinely draggable (Kanban) — never nested inside another
card, never as page scaffolding, and never as a metric-tile grid.

- Radius: 6px inner, 8px controls and rows, 12px dialogs
- Elevation: 1px border; shadow only on overlays
- Inputs are fill-on-hover, not bordered boxes
- One create action lives in the header; nothing duplicates it
- Dialogs interrupt for create/edit/delete
- Empty states are one sentence with the next action linked inline
- Toasts confirm mutations

## Signature

Inverted white pill for the current place in the workspace — the only filled
element on screen, so the eye finds it instantly. The first viewport is “what do
I do today,” read as text, not as a grid of vanity metrics.
