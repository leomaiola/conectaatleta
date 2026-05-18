-- ═══════════════════════════════════════════════════════════════
-- CONECTAATLETA — SCHEMA COMPLETO
-- Execute no SQL Editor do Supabase (https://supabase.com → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ─── TABELAS ────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'atleta'
    check (role in ('atleta','empresa','clube','profissional','midia','apoiador')),
  name text,
  bio text,
  location text,
  sport text,
  avatar text default '🏅',
  instagram text,
  youtube text,
  strava text,
  sector text,
  feed_preference text default 'all',
  followers int default 0,
  engagement numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  media_url text,
  likes int default 0,
  created_at timestamptz default now()
);

create table if not exists sponsorships (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references profiles(id) on delete set null,
  sponsor_id uuid references profiles(id) on delete set null,
  title text,
  value numeric,
  status text default 'pending'
    check (status in ('pending','active','closed')),
  contrapartidas text,
  duration text,
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references profiles(id) on delete cascade not null,
  category text,
  title text,
  description text,
  price numeric,
  rating numeric default 5.0,
  reviews int default 0,
  avatar text default '🩺',
  created_at timestamptz default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references profiles(id) on delete cascade not null,
  title text,
  description text,
  goal numeric,
  raised numeric default 0,
  deadline date,
  created_at timestamptz default now()
);

create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  donor_id uuid references profiles(id) on delete set null,
  amount numeric not null,
  message text,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete cascade,
  client_id uuid references profiles(id) on delete set null,
  preferred_date date,
  notes text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────────────

alter table profiles      enable row level security;
alter table feed_posts    enable row level security;
alter table sponsorships  enable row level security;
alter table services      enable row level security;
alter table campaigns     enable row level security;
alter table donations     enable row level security;
alter table bookings      enable row level security;

-- PROFILES
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles for select using (true);

drop policy if exists "profiles_insert" on profiles;
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update" on profiles;
create policy "profiles_update" on profiles for update using (auth.uid() = id);

drop policy if exists "profiles_delete" on profiles;
create policy "profiles_delete" on profiles for delete using (auth.uid() = id);

-- FEED POSTS
drop policy if exists "posts_select" on feed_posts;
create policy "posts_select" on feed_posts for select using (true);

drop policy if exists "posts_insert" on feed_posts;
create policy "posts_insert" on feed_posts for insert with check (auth.uid() = author_id);

drop policy if exists "posts_update" on feed_posts;
create policy "posts_update" on feed_posts for update using (true);

drop policy if exists "posts_delete" on feed_posts;
create policy "posts_delete" on feed_posts for delete using (auth.uid() = author_id);

-- SPONSORSHIPS
drop policy if exists "sponsorships_select" on sponsorships;
create policy "sponsorships_select" on sponsorships for select using (true);

drop policy if exists "sponsorships_insert" on sponsorships;
create policy "sponsorships_insert" on sponsorships for insert with check (auth.uid() is not null);

drop policy if exists "sponsorships_update" on sponsorships;
create policy "sponsorships_update" on sponsorships
  for update using (auth.uid() = athlete_id or auth.uid() = sponsor_id);

-- SERVICES
drop policy if exists "services_select" on services;
create policy "services_select" on services for select using (true);

drop policy if exists "services_insert" on services;
create policy "services_insert" on services for insert with check (auth.uid() = provider_id);

drop policy if exists "services_update" on services;
create policy "services_update" on services for update using (auth.uid() = provider_id);

-- CAMPAIGNS
drop policy if exists "campaigns_select" on campaigns;
create policy "campaigns_select" on campaigns for select using (true);

drop policy if exists "campaigns_insert" on campaigns;
create policy "campaigns_insert" on campaigns for insert with check (auth.uid() = athlete_id);

drop policy if exists "campaigns_update" on campaigns;
create policy "campaigns_update" on campaigns for update using (true);

-- DONATIONS
drop policy if exists "donations_select" on donations;
create policy "donations_select" on donations for select using (true);

drop policy if exists "donations_insert" on donations;
create policy "donations_insert" on donations for insert with check (auth.uid() is not null);

-- BOOKINGS
drop policy if exists "bookings_select" on bookings;
create policy "bookings_select" on bookings for select using (auth.uid() = client_id);

drop policy if exists "bookings_insert" on bookings;
create policy "bookings_insert" on bookings for insert with check (auth.uid() is not null);

-- ─── TRIGGER: updated_at automático ─────────────────────────────────────────

create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

-- ─── TRIGGER: auto-criar profile após signup ─────────────────────────────────
-- Isso cria um perfil básico automaticamente quando o usuário se registra.
-- O App.js depois atualiza com nome, role, sport, etc.

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'atleta'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    '🏅'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── FOLLOWS ────────────────────────────────────────────────────────────────

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

alter table follows enable row level security;

drop policy if exists "follows_select" on follows;
create policy "follows_select" on follows for select using (true);

drop policy if exists "follows_insert" on follows;
create policy "follows_insert" on follows for insert with check (auth.uid() = follower_id);

drop policy if exists "follows_delete" on follows;
create policy "follows_delete" on follows for delete using (auth.uid() = follower_id);

-- ─── SERVICE REQUESTS ────────────────────────────────────────────────────────

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references profiles(id) on delete cascade not null,
  category text not null,
  description text,
  city text,
  state text,
  created_at timestamptz default now()
);

alter table service_requests enable row level security;

drop policy if exists "sr_select" on service_requests;
create policy "sr_select" on service_requests for select using (true);

drop policy if exists "sr_insert" on service_requests;
create policy "sr_insert" on service_requests for insert with check (auth.uid() = athlete_id);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text default 'info',
  title text not null,
  message text,
  read boolean default false,
  data jsonb,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

drop policy if exists "notif_select" on notifications;
create policy "notif_select" on notifications for select using (auth.uid() = user_id);

drop policy if exists "notif_insert" on notifications;
create policy "notif_insert" on notifications for insert with check (auth.uid() is not null);

drop policy if exists "notif_update" on notifications;
create policy "notif_update" on notifications for update using (auth.uid() = user_id);
