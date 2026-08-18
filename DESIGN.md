# Design

<!-- Recorded from the shipped Noto workspace shell. -->

## World

Dark operational workspace. Charcoal layers, inverted white controls, no extra brand color on chrome. Built for daily desk use, not a marketing dashboard.

## Color

- Page: `#141414`
- Surface (sidebar, cards, dialogs): `#181818`
- Text: `#FFFFFF`
- Muted/subtle: white at 55% / 38%
- Border: white at 8% / 14%
- Primary control: white fill, `#141414` text
- Status only: success `#3DD68C`, warning `#E8B931`, danger `#F07167`
- Light theme tokens exist on `[data-theme="light"]` for later use. Dark is default.

## Type

- Inter 400 and 500
- Letter-spacing: `-0.15px`
- Sizes: 12px sidebar/captions, 13px labels, 14px main UI, 24px titles/KPIs
- No other sizes

## Layout

- Desktop (lg+ / iPad landscape): 248px sidebar | main
- Collapsible sidebar to 72px on desktop
- Phone: header + content + bottom nav (5 destinations)
- iPad portrait: hamburger + overlay drawer, no bottom nav; 44px tap targets; horizontal Kanban/calendar scroll
- Active nav: white pill, dark text
- Icons in chrome: 16px, stroke 1.25, simple geometry

## Components

- Radius 10–12px
- Elevation: 1px border, no glow
- Dialogs interrupt for create/edit/delete
- Empty states explain the next action
- Toasts confirm mutations

## Signature

Inverted white pill for the current place in the workspace. The first viewport is “what do I do today,” not a grid of vanity metrics.
