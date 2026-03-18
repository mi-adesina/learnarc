-- ============================================================
-- LearnArc — Supabase Schema (fixed ordering)
-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────────────────
create table public.profiles (
  id                  uuid references auth.users(id) on delete cascade primary key,
  name                text not null default '',
  avatar_url          text,
  role                text not null default 'student' check (role in ('student','admin')),
  onboarding_complete boolean not null default false,
  goals               text[] default '{}',
  experience          text default 'beginner',
  hours_per_week      integer default 5,
  streak              integer not null default 0,
  last_active_date    date,
  xp                  integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- COURSES
-- ──────────────────────────────────────────────────────────────
create table public.courses (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text not null default '',
  emoji           text not null default '📚',
  thumb_gradient  text not null default 'linear-gradient(135deg,#1a1a2e,#16213e)',
  bar_color       text not null default 'linear-gradient(90deg,#7c6af7,#f472b6)',
  total_hours     numeric(4,1) not null default 0,
  total_lessons   integer not null default 0,
  difficulty      text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  tags            text[] default '{}',
  published       boolean not null default false,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Anyone can view published courses"
  on public.courses for select using (published = true);

create policy "Admins can manage courses"
  on public.courses for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────
-- ENROLLMENTS  (must come before lessons RLS)
-- ──────────────────────────────────────────────────────────────
create table public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  course_id   uuid references public.courses(id) on delete cascade not null,
  progress_pct integer not null default 0,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);

alter table public.enrollments enable row level security;

create policy "Users can view own enrollments"
  on public.enrollments for select using (auth.uid() = user_id);

create policy "Users can enroll"
  on public.enrollments for insert with check (auth.uid() = user_id);

create policy "Users can update own enrollment"
  on public.enrollments for update using (auth.uid() = user_id);

create policy "Admins can view all enrollments"
  on public.enrollments for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────
-- LESSONS  (after enrollments so RLS can reference it)
-- ──────────────────────────────────────────────────────────────
create table public.lessons (
  id               uuid primary key default uuid_generate_v4(),
  course_id        uuid references public.courses(id) on delete cascade not null,
  title            text not null,
  type             text not null default 'video' check (type in ('video','article','quiz')),
  duration_minutes integer not null default 10,
  order_index      integer not null default 0,
  content_url      text,
  content_body     text,
  published        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "Users can view published lessons in enrolled courses"
  on public.lessons for select using (
    published = true
    and (
      exists (
        select 1 from public.enrollments
        where user_id = auth.uid() and course_id = lessons.course_id
      )
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );

create policy "Admins can manage lessons"
  on public.lessons for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────
-- LESSON PROGRESS
-- ──────────────────────────────────────────────────────────────
create table public.lesson_progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  lesson_id    uuid references public.lessons(id) on delete cascade not null,
  course_id    uuid references public.courses(id) on delete cascade not null,
  completed    boolean not null default false,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "Users can manage own lesson progress"
  on public.lesson_progress for all using (auth.uid() = user_id);

-- Auto-update enrollment progress % when a lesson is marked complete
create or replace function public.update_enrollment_progress()
returns trigger language plpgsql security definer as $$
declare
  v_total     integer;
  v_completed integer;
  v_pct       integer;
begin
  select count(*) into v_total
    from public.lessons
    where course_id = new.course_id and published = true;

  select count(*) into v_completed
    from public.lesson_progress
    where user_id = new.user_id
      and course_id = new.course_id
      and completed = true;

  v_pct := case when v_total > 0 then round((v_completed::numeric / v_total) * 100) else 0 end;

  update public.enrollments
     set progress_pct  = v_pct,
         completed_at  = case when v_pct = 100 then now() else null end
   where user_id = new.user_id and course_id = new.course_id;

  -- Award XP for completing a lesson
  if new.completed = true then
    update public.profiles set xp = xp + 10 where id = new.user_id;
  end if;

  return new;
end;
$$;

create trigger on_lesson_progress_change
  after insert or update on public.lesson_progress
  for each row execute procedure public.update_enrollment_progress();

-- ──────────────────────────────────────────────────────────────
-- QUIZ QUESTIONS
-- ──────────────────────────────────────────────────────────────
create table public.quiz_questions (
  id            uuid primary key default uuid_generate_v4(),
  course_id     uuid references public.courses(id) on delete cascade not null,
  question      text not null,
  options       text[] not null,
  correct_index integer not null,
  order_index   integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.quiz_questions enable row level security;

create policy "Users can view questions for enrolled courses"
  on public.quiz_questions for select using (
    exists (
      select 1 from public.enrollments
      where user_id = auth.uid() and course_id = quiz_questions.course_id
    )
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage questions"
  on public.quiz_questions for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ──────────────────────────────────────────────────────────────
-- QUIZ ATTEMPTS
-- ──────────────────────────────────────────────────────────────
create table public.quiz_attempts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  course_id    uuid references public.courses(id) on delete cascade not null,
  score        integer not null,
  total        integer not null,
  pct          integer not null,
  answers      integer[] not null default '{}',
  completed_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Users can manage own attempts"
  on public.quiz_attempts for all using (auth.uid() = user_id);

create policy "Admins can view all attempts"
  on public.quiz_attempts for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Award XP on quiz completion
create or replace function public.award_quiz_xp()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles
     set xp = xp + greatest(1, (new.pct / 10))
   where id = new.user_id;
  return new;
end;
$$;

create trigger on_quiz_attempt
  after insert on public.quiz_attempts
  for each row execute procedure public.award_quiz_xp();

-- ──────────────────────────────────────────────────────────────
-- ACTIVITY FEED
-- ──────────────────────────────────────────────────────────────
create table public.activity (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       text not null,
  title      text not null,
  meta       text,
  color      text not null default '#7c6af7',
  created_at timestamptz not null default now()
);

alter table public.activity enable row level security;

create policy "Users can manage own activity"
  on public.activity for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- SEED DATA
-- ──────────────────────────────────────────────────────────────
insert into public.courses
  (title, description, emoji, thumb_gradient, bar_color, total_hours, total_lessons, difficulty, tags, published)
values
  ('Advanced React Development',
   'Master React hooks, patterns, performance optimization, and modern state management.',
   '🚀','linear-gradient(135deg,#1a1a2e,#16213e)','linear-gradient(90deg,#60a5fa,#a78bfa)',
   12, 24, 'advanced', array['react','javascript','frontend'], true),

  ('JavaScript Pro Patterns',
   'Deep dive into async patterns, closures, prototypes, and modern ES2024 features.',
   '⚡','linear-gradient(135deg,#1a2e1e,#0d2112)','linear-gradient(90deg,#fbbf24,#f472b6)',
   8, 18, 'intermediate', array['javascript','es6','async'], true),

  ('CSS Mastery & Design Systems',
   'Build scalable design systems with CSS Grid, custom properties, and component architecture.',
   '🎨','linear-gradient(135deg,#2e1a2e,#1e0d2e)','linear-gradient(90deg,#34d399,#60a5fa)',
   6, 15, 'intermediate', array['css','design','frontend'], true),

  ('Node.js & Express APIs',
   'Build production REST APIs with authentication, validation, and database integration.',
   '🟢','linear-gradient(135deg,#1e2a1e,#0d1e0d)','linear-gradient(90deg,#34d399,#7c6af7)',
   10, 20, 'intermediate', array['nodejs','express','backend'], true),

  ('TypeScript Fundamentals',
   'Go from JavaScript to TypeScript with types, generics, decorators, and real-world patterns.',
   '🔷','linear-gradient(135deg,#1a1a2e,#0a1a2e)','linear-gradient(90deg,#60a5fa,#a78bfa)',
   7, 16, 'beginner', array['typescript','javascript'], true),

  ('MongoDB & Database Design',
   'Schema design, aggregation pipelines, indexing strategies, and performance tuning.',
   '🗄','linear-gradient(135deg,#2e1a1a,#1e0d0d)','linear-gradient(90deg,#34d399,#7c6af7)',
   5, 12, 'beginner', array['mongodb','database','backend'], true);
