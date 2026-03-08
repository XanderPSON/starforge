# Starforge — Stretch Goal Roadmap

Future features beyond the MVP. Each item is behind a feature flag and degrades gracefully when off.

---

## A. SSO / Authentication

- **Library:** `next-auth` v5 (Auth.js) with Google OAuth provider
- **Flow:** Sign in → Google OAuth → session cookie → user record in DB
- **Scope:** Coinbase email domain restriction (`@coinbase.com`) enforced at provider level
- **Infrastructure:** `middleware.ts` for route protection, `app/api/auth/[...nextauth]/route.ts`, SessionProvider in layout
- **Feature flag:** `NEXT_PUBLIC_ENABLE_AUTH=true`; when off, app works as today (anonymous, localStorage)

## B. Database Backend

- **Stack:** Prisma ORM + PostgreSQL (or Supabase for managed hosting)
- **Schema (initial):**
  - `User { id, email, name, role: 'student' | 'admin', createdAt }`
  - `TrainingProgress { userId, slug, pageIndex, completedAt }`
  - `InteractionResponse { userId, slug, componentId, value: JSON, submittedAt }`
- **Migration path:** On first login, import localStorage data into DB. Continue reading/writing localStorage as cache, sync to DB on save.
- **Feature flag:** `NEXT_PUBLIC_ENABLE_DB=true`

## C. Admin Dashboard & Analytics

- **Route:** `/admin` (protected by auth + role check)
- **Views:**
  - Per-training: completion rates, average time, drop-off page, response heatmap
  - Per-person: which trainings completed, progress through each, timestamps
  - Per-question: all responses for a given question, distribution analysis
- **Killer feature:** Page-level drop-off analysis — "if everyone stops at a certain point, maybe that point is broken"
- **Data model:** Requires `InteractionResponse` table with timestamps
- **Feature flag:** Admin role gated (`role: 'admin'` users only)

## D. Role System

- Two roles: `student` (default), `admin`
- Admin can: access dashboard, view all responses, toggle admin mode
- Student can: take trainings, see own progress
- Role stored in DB `User.role` field, changeable by other admins

## E. Feature Flags

- Simple env-var based: `NEXT_PUBLIC_ENABLE_AUTH`, `NEXT_PUBLIC_ENABLE_DB`, `NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD`
- All features degrade gracefully when flags are off (localStorage fallback, no dashboard route)
- Future: migrate to a proper feature flag service (LaunchDarkly, etc.)
