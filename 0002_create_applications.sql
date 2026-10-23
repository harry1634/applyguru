-- 0002_create_applications.sql

-- Enums
create type public.application_status as enum (
  'wishlist', 'applied', 'screening', 'interview',
  'offer', 'rejected', 'withdrawn', 'ghosted'
);

create type public.work_mode as enum ('remote', 'hybrid', 'onsite');

-- Table
create table if not exists public.applications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  company          text not null,
  role             text not null,
  status           public.application_status not null default 'applied',
  location         text,
  work_mode        public.work_mode,
  salary_min       integer,
  salary_max       integer,
  salary_currency  text not null default 'USD',
  job_url          text,
  job_description  text,
  notes            text,
  contact_name     text,
  contact_email    text,
  applied_at       date,
  deadline_at      date,
  next_step_at     timestamptz,
  next_step_note   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Indexes
create index applications_user_id_idx   on public.applications(user_id);
create index applications_status_idx    on public.applications(status);
create index applications_created_at_idx on public.applications(created_at desc);

-- RLS
alter table public.applications enable row level security;

create policy "Users manage own applications"
  on public.applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger
create trigger applications_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();
