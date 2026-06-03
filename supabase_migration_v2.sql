-- ═══════════════════════════════════════════════════════════════
-- CONECTAATLETA — MIGRATION V2
-- Amizade/Conexão, Privacidade, Premium, Admin
-- Execute no Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── COLUNAS NOVAS EM PROFILES ───────────────────────────────────────────────

alter table profiles add column if not exists visibility   text    default 'public' check (visibility in ('public','friends'));
alter table profiles add column if not exists is_premium   boolean default false;
alter table profiles add column if not exists premium_expires_at timestamptz;
alter table profiles add column if not exists is_admin     boolean default false;

-- ─── TABELA: CONEXÕES / AMIZADES ─────────────────────────────────────────────

create table if not exists connections (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid references profiles(id) on delete cascade not null,
  receiver_id   uuid references profiles(id) on delete cascade not null,
  status        text default 'pending' check (status in ('pending','accepted','rejected')),
  created_at    timestamptz default now(),
  unique(requester_id, receiver_id)
);

alter table connections enable row level security;

drop policy if exists "conn_select" on connections;
create policy "conn_select" on connections for select using (
  auth.uid() = requester_id or auth.uid() = receiver_id or status = 'accepted'
);

drop policy if exists "conn_insert" on connections;
create policy "conn_insert" on connections for insert with check (auth.uid() = requester_id);

drop policy if exists "conn_update" on connections;
create policy "conn_update" on connections for update using (
  auth.uid() = receiver_id or auth.uid() = requester_id
);

drop policy if exists "conn_delete" on connections;
create policy "conn_delete" on connections for delete using (
  auth.uid() = requester_id or auth.uid() = receiver_id
);

-- ─── TABELA: CONFIGURAÇÕES ADMIN ─────────────────────────────────────────────

create table if not exists admin_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

alter table admin_settings enable row level security;

drop policy if exists "admin_settings_select" on admin_settings;
create policy "admin_settings_select" on admin_settings for select using (true);

drop policy if exists "admin_settings_insert" on admin_settings;
create policy "admin_settings_insert" on admin_settings for insert with check (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

drop policy if exists "admin_settings_update" on admin_settings;
create policy "admin_settings_update" on admin_settings for update using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Valor padrão do plano premium (R$ 99/mês)
insert into admin_settings (key, value) values ('premium_price', '99')
  on conflict (key) do nothing;

-- ─── ÍNDICES ─────────────────────────────────────────────────────────────────

create index if not exists idx_connections_requester on connections(requester_id);
create index if not exists idx_connections_receiver  on connections(receiver_id);
create index if not exists idx_connections_status    on connections(status);
