-- 0001_create_profiles.sql
-- Extends Supabase auth.users with application-specific profile data

create table if not exists public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  full_name               text,
  avatar_url              text,
  headline                text,
  location                text,
  website                 text,
  linkedin_url            text,
  github_url              text,
  target_roles            text[]    not null default '{}',
  target_locations        text[]    not null default '{}',
  salary_expectation_min  integer,
  salary_expectation_max  integer,
  onboarding_completed    boolean   not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
