# LearnArc — Production-Ready Learning Platform

Full-stack Next.js 14 learning platform with Supabase auth, real-time progress tracking, quiz scoring, and an admin dashboard.

## Tech Stack
| Layer     | Technology                     |
|-----------|-------------------------------|
| Framework | Next.js 14 (App Router)       |
| Language  | TypeScript                    |
| Auth + DB | Supabase (Postgres + Auth)    |
| Styling   | CSS Variables + Tailwind      |
| State     | Zustand (persisted)           |
| Deploy    | Vercel                        |

## Features
- Email + Google OAuth auth with protected routes
- 4-step onboarding flow
- Dashboard with live stats, streaks, XP
- Course enrollment + progress tracking
- Lesson completion system (unlocks sequentially)
- Quiz arena — saves attempts to DB, awards XP
- Progress page with XP levels + quiz history
- Admin panel — user management, course CRUD
- Dark/light mode (persisted)
- Mobile responsive
- SEO metadata + security headers

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Set up Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. (Optional) Enable Google OAuth: Authentication → Providers → Google

### 3. Environment
```bash
cp .env.local.example .env.local
# Fill in your SUPABASE_URL and SUPABASE_ANON_KEY
```

### 4. Run
```bash
npm run dev   # http://localhost:3000
```

## Deploy to Vercel
```bash
npx vercel
```
Add env vars in Vercel dashboard. Set Supabase redirect URL to `https://your-app.vercel.app/auth/callback`.

## Make a User Admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
```

## Add Quiz Questions
```sql
INSERT INTO quiz_questions (course_id, question, options, correct_index, order_index)
VALUES ('course-uuid', 'Your question?', ARRAY['A','B','C','D'], 1, 0);
```

## Project Structure
```
src/
├── app/
│   ├── (app)/          # Auth-protected pages
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── lessons/
│   │   ├── quiz/
│   │   ├── progress/
│   │   └── settings/
│   ├── admin/          # Admin panel (role-gated)
│   ├── login/          # Auth page
│   ├── onboarding/     # 4-step onboarding
│   └── auth/callback/  # OAuth handler
├── components/ui/      # Button, Modal, Toast, Badge…
├── hooks/useAuth.ts    # Supabase session hook
├── lib/
│   ├── api.ts          # All data fetching
│   └── supabase/       # client / server / middleware
├── store/              # Zustand stores
├── types/index.ts      # TypeScript types
└── middleware.ts       # Route protection
supabase/schema.sql     # Full DB schema + seed data
```
