
# Xplore V2 — Incremental Enhancement Plan

This is an **additive pass**. Existing Sidebar, TopBar, hero card shell, color palette, typography, spacing, and component architecture stay exactly as they are. No file is rewritten from scratch; edits are surgical.

## 1. Hero — placeholder upgrade only

Edit only the right-side `MediaSlot` block inside `src/routes/index.tsx`.

- Wrap the existing `MediaSlot` in a relative container.
- Add 4 small floating icon chips (Users, Calendar, Trophy, Briefcase) absolutely positioned around the media frame with a slow `animate-float` (subtle translate-Y, 4–6s, reduced-motion safe).
- Keep `MediaSlot` API unchanged so future uploads (campus photo / dashboard mockup / mascot / app mockup) drop in via the same `src` prop later. No layout change to the hero card grid.

## 2. Platform Statistics row (NEW)

Insert a new `<section>` directly after the hero, before the existing stats grid — or extend the existing stats grid from 4 → 6 cards. Plan: **extend the existing stats array** to 6 entries (`Active Clubs 48+`, `Events 120+`, `Opportunities 75+`, `Students 2100+`, `Brand Partners 15+`, `Partner Colleges 5+`). Grid becomes `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`. Reuses `Counter` and `surface-card` — zero new styling.

## 3. Featured Clubs, Upcoming Events, Opportunities

These sections already exist. Only data is updated:

- Add `Octaves`, `Pragyan`, `Aavishkar`, `GEEEK Workshop` to `src/lib/data.ts` clubs (keep existing).
- Add `Startup Pitch Fest`, `Sports Analytics Summit` to events.
- Add `Sports Research Analyst`, `Event Volunteer`, `Startup Intern` to opportunities.

No card redesign. Existing grids absorb the new entries.

## 4. NEW homepage widgets (added below current Leaderboard/Activity row)

A new 3-column responsive section using existing `surface-card`:

- **Recommended For You** — list of 3 suggestion rows (icon + title + CTA chip). Static array, shaped so a future AI call can swap the source.
- **Your Campus Journey** — progress card with 4 metrics (Clubs Joined, Events Attended, Applications, Badges). Uses existing shadcn `Progress` component + percentage labels.
- **Achievements** — badge grid (5 badges: Event Explorer, Club Champion, Campus Ambassador, Network Builder, Top Contributor). Circular gradient medallion + label. Locked badges shown desaturated.

Below that, a 2-column row:

- **Announcements** — compact list card (3 dummy items, pinned icon, timestamp).
- **Live Activity** — already exists; extend dummy data with the requested examples. No redesign.

## 5. AI Assistant FAB (NEW)

New component `src/components/AskXploreAI.tsx`:

- Fixed bottom-right circular button (`Sparkles` icon + "Ask Xplore AI" label on hover).
- Click opens a shadcn `Sheet` (right side) with a placeholder chat UI: greeting, 3 suggested prompts, disabled input ("Coming soon"). No backend.
- Mounted once inside `index.tsx` (or `__root.tsx` if it should appear app-wide — defaulting to `__root.tsx` so it's available on all pages).

## 6. Dark mode

- Add `dark` variant tokens in `src/styles.css` via `.dark { … }` block defining `--background`, `--card`, `--sidebar`, `--border`, `--primary`, `--accent-gold`, `--foreground`, `--muted-foreground` to the exact hex values specified (converted to oklch/hsl as the file already uses). Light tokens untouched.
- Add `@custom-variant dark (&:where(.dark, .dark *));` to styles.css.
- New `src/components/ThemeToggle.tsx`: dropdown (Light / Dark / System) using `lucide-react` Sun/Moon/Monitor icons. Persists to `localStorage` (`xplore-theme`), applies `.dark` class on `document.documentElement`, listens to `prefers-color-scheme` for `system`.
- Mount the toggle in `TopBar.tsx` between the message button and the avatar (single surgical insertion).
- A small inline script in `__root.tsx` `<head>` sets the class pre-hydration to avoid FOUC.

## 7. Responsiveness

All new sections use the existing responsive grid breakpoints already used in `index.tsx` (`grid-cols-1 sm: md: lg: xl:`). FAB is `bottom-4 right-4` on mobile, `bottom-6 right-6` desktop. Sheet is full-width on mobile.

## Files touched

- `src/styles.css` — add dark tokens + `@custom-variant dark`. No removal.
- `src/lib/data.ts` — extend arrays.
- `src/routes/index.tsx` — extend stats grid; add Recommendations / Progress / Achievements / Announcements sections; add floating icons around hero MediaSlot; extend activity array.
- `src/components/TopBar.tsx` — insert `<ThemeToggle />`.
- `src/routes/__root.tsx` — pre-hydration theme script + mount `<AskXploreAI />`.
- **New** `src/components/ThemeToggle.tsx`
- **New** `src/components/AskXploreAI.tsx`
- **New** `src/components/RecommendationsCard.tsx`
- **New** `src/components/CampusJourneyCard.tsx`
- **New** `src/components/AchievementsCard.tsx`
- **New** `src/components/AnnouncementsCard.tsx`

## Explicitly NOT changing

Sidebar, hero card layout/grid, feature pill cards, existing color palette, font stack, container widths, section ordering above the new widgets, or any existing component's API.
