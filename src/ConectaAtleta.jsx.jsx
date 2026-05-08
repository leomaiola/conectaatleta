import { useState, useEffect, useCallback } from "react";

// ─── SUPABASE CONFIG ───────────────────────────────────────────────────────────
// Substitua pelos seus dados do projeto Supabase
// 1. Acesse https://supabase.com → New Project
// 2. Em Settings > API, copie Project URL e anon key
const SUPABASE_URL = "https://SEU_PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA_ANON_KEY_AQUI";

// SQL para criar as tabelas — rode no Supabase SQL Editor:
/*
create table profiles (
  id uuid references auth.users primary key,
  role text not null check (role in ('atleta','empresa','clube','servico','midia','apoiador')),
  name text, bio text, location text, sport text, avatar text,
  instagram text, youtube text, strava text,
  followers int default 0, engagement numeric default 0,
  created_at timestamptz default now()
);
create table sponsorships (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references profiles(id),
  sponsor_id uuid references profiles(id),
  title text, value numeric, status text default 'pending',
  contrapartidas text, created_at timestamptz default now()
);
create table services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references profiles(id),
  category text, title text, description text,
  price numeric, rating numeric default 5.0,
  created_at timestamptz default now()
);
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references profiles(id),
  title text, description text, goal numeric,
  raised numeric default 0, deadline date,
  created_at timestamptz default now()
);
create table feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id),
  content text, media_url text, likes int default 0,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
alter table sponsorships enable row level security;
alter table services enable row level security;
alter table campaigns enable row level security;
alter table feed_posts enable row level security;
create policy "Public profiles" on profiles for select using (true);
create policy "Own profile" on profiles for all using (auth.uid() = id);
create policy "Public sponsorships" on sponsorships for select using (true);
create policy "Own sponsorships" on sponsorships for all using (auth.uid() = athlete_id or auth.uid() = sponsor_id);
create policy "Public services" on services for select using (true);
create policy "Own services" on services for all using (auth.uid() = provider_id);
create policy "Public campaigns" on campaigns for select using (true);
create policy "Own campaigns" on campaigns for all using (auth.uid() = athlete_id);
create policy "Public feed" on feed_posts for select using (true);
create policy "Own posts" on feed_posts for all using (auth.uid() = author_id);
*/

// ─── SUPABASE CLIENT (sem biblioteca externa) ───────────────────────────────
const supabase = (() => {
  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };

  let authToken = SUPABASE_ANON_KEY;
  let currentUser = null;

  const authHeaders = () => ({
    ...headers,
    Authorization: `Bearer ${authToken}`,
  });

  const query = async (table, params = "") => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
      headers: authHeaders(),
    });
    return r.json();
  };

  const insert = async (table, data) => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...authHeaders(), Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    return r.json();
  };

  const update = async (table, match, data) => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${match}`, {
      method: "PATCH",
      headers: { ...authHeaders(), Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    return r.json();
  };

  const signUp = async (email, password) => {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (d.access_token) { authToken = d.access_token; currentUser = d.user; }
    return d;
  };

  const signIn = async (email, password) => {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (d.access_token) { authToken = d.access_token; currentUser = d.user; }
    return d;
  };

  const signOut = () => {
    authToken = SUPABASE_ANON_KEY;
    currentUser = null;
  };

  const getUser = () => currentUser;

  return { query, insert, update, signUp, signIn, signOut, getUser };
})();

// ─── MOCK DATA (usado enquanto Supabase não estiver configurado) ────────────
const MOCK = {
  user: { id: "u1", email: "julia@email.com" },
  profile: {
    id: "u1", role: "atleta", name: "Juliana Ferreira",
    bio: "Triatleta há 4 anos · Top 10 estadual SP · Buscando patrocínio para Ironman 70.3",
    location: "São Paulo, SP", sport: "Triatlo", avatar: "🏃‍♀️",
    instagram: "@juliferreira_tri", youtube: "JuliFerreiraFit", strava: "juliana.ferreira",
    followers: 4200, engagement: 8.4,
  },
  athletes: [
    { id: "a1", name: "Juliana Ferreira", sport: "Triatlo", location: "SP", avatar: "🏃‍♀️", followers: 4200, engagement: 8.4, role: "atleta" },
    { id: "a2", name: "Ricardo Campos", sport: "Mountain Bike", location: "MG", avatar: "🚵", followers: 12000, engagement: 6.1, role: "atleta" },
    { id: "a3", name: "Ana Beatriz Costa", sport: "Natação", location: "RS", avatar: "🏊", followers: 2800, engagement: 11.0, role: "atleta" },
    { id: "a4", name: "Marcos Oliveira", sport: "Beach Tennis", location: "RJ", avatar: "🏸", followers: 28000, engagement: 9.3, role: "atleta" },
    { id: "a5", name: "Carla Mendes", sport: "Corrida", location: "DF", avatar: "🏅", followers: 6500, engagement: 7.2, role: "atleta" },
    { id: "a6", name: "Pedro Souza", sport: "Ciclismo", location: "SC", avatar: "🚴", followers: 3100, engagement: 5.8, role: "atleta" },
  ],
  sponsorships: [
    { id: "s1", title: "Parceria Equipamentos 2025", sponsor: "SportPro Brasil", value: 3600, status: "active", contrapartidas: "Posts semanais, logo no kit", athlete: "Juliana Ferreira" },
    { id: "s2", title: "Campanha Ironman Floripa", sponsor: "Nutrição Max", value: 1800, status: "pending", contrapartidas: "3 stories + reels pós prova", athlete: "Juliana Ferreira" },
    { id: "s3", title: "Apoio Temporada MTB", sponsor: "TrailGear", value: 5400, status: "active", contrapartidas: "Conteúdo mensal + presença em evento", athlete: "Ricardo Campos" },
  ],
  services: [
    { id: "sv1", category: "Nutrição", title: "Nutricionista Esportiva", provider: "Dra. Camila Torres", price: 280, rating: 4.9, avatar: "🥗", reviews: 47 },
    { id: "sv2", category: "Fisioterapia", title: "Fisio Esportivo", provider: "Dr. Bruno Alves", price: 220, rating: 4.8, avatar: "💪", reviews: 63 },
    { id: "sv3", category: "Psicologia", title: "Psicólogo do Esporte", provider: "Dr. Rafael Lima", price: 200, rating: 4.7, avatar: "🧠", reviews: 29 },
    { id: "sv4", category: "Fotografia", title: "Fotógrafo Esportivo", provider: "Lucas Andrade", price: 890, rating: 5.0, avatar: "📸", reviews: 38 },
    { id: "sv5", category: "Coaching", title: "Gestor de Carreira Esportiva", provider: "Ana Paula Reis", price: 450, rating: 4.9, avatar: "🎯", reviews: 21 },
    { id: "sv6", category: "Preparação", title: "Preparador Físico", provider: "Coach Marcos V.", price: 350, rating: 4.8, avatar: "⚡", reviews: 55 },
  ],
  campaigns: [
    { id: "c1", title: "Ironman 70.3 Florianópolis", athlete: "Juliana Ferreira", goal: 8000, raised: 5340, deadline: "2025-09-15", avatar: "🏃‍♀️" },
    { id: "c2", title: "Campeonato Sul-Americano Natação", athlete: "Ana Beatriz Costa", goal: 12000, raised: 7800, deadline: "2025-08-30", avatar: "🏊" },
    { id: "c3", title: "Kit MTB Temporada 2025", athlete: "Ricardo Campos", goal: 5000, raised: 4200, deadline: "2025-07-01", avatar: "🚵" },
  ],
  feed: [
    { id: "f1", author: "Juliana Ferreira", avatar: "🏃‍♀️", content: "Treino de brick hoje: 40km bike + 10km corrida. Corpo pedindo descanso, mente pedindo mais 🔥 #triatlo #ironman", likes: 342, time: "2h atrás", sport: "Triatlo" },
    { id: "f2", author: "Marcos Oliveira", avatar: "🏸", content: "Parceria confirmada com @SportGear_BR! Muito feliz com esse apoio para a temporada de beach tennis. Gratidão 🙏", likes: 891, time: "4h atrás", sport: "Beach Tennis" },
    { id: "f3", author: "Ricardo Campos", avatar: "🚵", content: "Trail na Serra da Mantiqueira. 1800m de elevação, paisagem incrível e muita lama haha. MTB é vida! 🏔️", likes: 567, time: "6h atrás", sport: "MTB" },
    { id: "f4", author: "Ana Beatriz Costa", avatar: "🏊", content: "Record pessoal nos 200m livre: 2min04s! Campanha de crowdfunding chegou a 65% da meta. Muito obrigada a todos! 💙", likes: 423, time: "8h atrás", sport: "Natação" },
    { id: "f5", author: "Carla Mendes", avatar: "🏅", content: "Maratona de Brasília em 4 semanas. Preparação na reta final, planilha 100% concluída. É hora de confiar no treino 🎯", likes: 234, time: "12h atrás", sport: "Corrida" },
  ],
  stats: {
    totalAthletes: 847,
    activeSponsorships: 124,
    servicesBooked: 389,
    raised: 284700,
  },
};

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Instrument+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --g: #00E87A;
    --g2: #00B85F;
    --g3: rgba(0,232,122,0.12);

    --bk: #07090A;
    --d1: #0D1014;
    --d2: #13181D;
    --d3: #1A2028;
    --bd: rgba(255,255,255,0.07);
    --tx: #EEF2F0;
    --mu: #5A6872;
    --mu2: #8A9BA8;
    --or: #FF6B2C;
    --bl: #2CE8FF;
    --yl: #FFD600;
    --pu: #B47AFF;
    --rd: #FF4466;
  }

  html, body { height: 100%; font-family: 'Instrument Sans', sans-serif; background: var(--bk); color: var(--tx); overflow-x: hidden; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--bk); }
  ::-webkit-scrollbar-thumb { background: var(--g); border-radius: 2px; }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* SIDEBAR */
  .sidebar {
    width: 240px; flex-shrink: 0;
    background: var(--d1);
    border-right: 1px solid var(--bd);
    display: flex; flex-direction: column;
    overflow-y: auto; overflow-x: hidden;
  }

  .sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--bd);
    flex-shrink: 0;
  }

  .logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    letter-spacing: 1px;
    color: var(--g);
  }
  .logo-text span { color: var(--mu2); }

  .logo-tag {
    font-family: 'Instrument Mono', monospace;
    font-size: 9px; color: var(--mu);
    letter-spacing: 2px; text-transform: uppercase;
    margin-top: 4px;
  }

  .sidebar-user {
    padding: 20px 24px;
    border-bottom: 1px solid var(--bd);
    display: flex; align-items: center; gap: 12px;
    flex-shrink: 0;
  }

  .user-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--g3);
    border: 1.5px solid var(--g);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }

  .user-name { font-size: 13px; font-weight: 600; }
  .user-role {
    font-size: 10px; color: var(--g);
    text-transform: uppercase; letter-spacing: 1px;
    font-family: 'Instrument Mono', monospace;
  }

  .sidebar-nav { padding: 16px 12px; flex: 1; }

  .nav-section-label {
    font-size: 9px; color: var(--mu);
    letter-spacing: 2px; text-transform: uppercase;
    padding: 4px 12px 8px;
    font-family: 'Instrument Mono', monospace;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    cursor: pointer; transition: all 0.15s;
    font-size: 13px; font-weight: 500;
    color: var(--mu2); margin-bottom: 2px;
    border: none; background: none; width: 100%; text-align: left;
  }

  .nav-item:hover { background: var(--d3); color: var(--tx); }
  .nav-item.active { background: var(--g3); color: var(--g); }
  .nav-item .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-item .nav-badge {
    margin-left: auto; background: var(--g); color: var(--bk);
    font-size: 9px; font-weight: 700; padding: 2px 7px;
    border-radius: 100px; font-family: 'Instrument Mono', monospace;
  }

  .sidebar-bottom {
    padding: 16px 12px;
    border-top: 1px solid var(--bd);
    flex-shrink: 0;
  }

  /* MAIN */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .topbar {
    height: 60px; flex-shrink: 0;
    background: var(--d1);
    border-bottom: 1px solid var(--bd);
    display: flex; align-items: center;
    padding: 0 32px; gap: 16px;
  }

  .topbar-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700;
    flex: 1;
  }

  .topbar-search {
    display: flex; align-items: center; gap: 8px;
    background: var(--d2); border: 1px solid var(--bd);
    border-radius: 8px; padding: 8px 16px;
    width: 260px;
  }

  .topbar-search input {
    background: none; border: none; outline: none;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px; color: var(--tx); width: 100%;
  }

  .topbar-search input::placeholder { color: var(--mu); }

  .topbar-btn {
    width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid var(--bd); background: var(--d2);
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; font-size: 16px; transition: all 0.15s;
  }
  .topbar-btn:hover { border-color: var(--g); }

  .content { flex: 1; overflow-y: auto; padding: 32px; }

  /* CARDS */
  .card {
    background: var(--d2);
    border: 1px solid var(--bd);
    border-radius: 12px; overflow: hidden;
  }

  .card-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--bd);
    display: flex; align-items: center; justify-content: space-between;
  }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    display: flex; align-items: center; gap: 8px;
  }

  .card-body { padding: 24px; }

  /* STAT CARDS */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }

  .stat-card {
    background: var(--d2); border: 1px solid var(--bd);
    border-radius: 12px; padding: 24px;
    position: relative; overflow: hidden;
    transition: all 0.2s;
  }
  .stat-card:hover { border-color: rgba(0,232,122,0.3); transform: translateY(-2px); }

  .stat-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
  }
  .stat-card.green::before { background: var(--g); }
  .stat-card.orange::before { background: var(--or); }
  .stat-card.blue::before { background: var(--bl); }
  .stat-card.yellow::before { background: var(--yl); }

  .stat-icon { font-size: 24px; margin-bottom: 16px; display: block; }
  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 32px; font-weight: 800; line-height: 1;
    margin-bottom: 6px;
  }
  .stat-card.green .stat-value { color: var(--g); }
  .stat-card.orange .stat-value { color: var(--or); }
  .stat-card.blue .stat-value { color: var(--bl); }
  .stat-card.yellow .stat-value { color: var(--yl); }

  .stat-label { font-size: 12px; color: var(--mu2); font-weight: 500; }
  .stat-change { font-size: 11px; color: var(--g); margin-top: 8px; display: flex; align-items: center; gap: 4px; }

  /* GRID LAYOUTS */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

  /* ATHLETE CARDS */
  .athlete-card {
    background: var(--d2); border: 1px solid var(--bd);
    border-radius: 12px; padding: 24px;
    transition: all 0.2s; cursor: pointer;
  }
  .athlete-card:hover { border-color: rgba(0,232,122,0.35); transform: translateY(-3px); background: var(--d3); }

  .athlete-avatar-wrap { position: relative; width: fit-content; margin-bottom: 16px; }
  .athlete-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--g3); border: 2px solid var(--g);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
  }
  .athlete-sport-badge {
    position: absolute; bottom: -4px; right: -8px;
    background: var(--d1); border: 1px solid var(--bd);
    border-radius: 100px; padding: 2px 8px;
    font-size: 9px; font-weight: 700; color: var(--g);
    text-transform: uppercase; letter-spacing: 0.5px;
    font-family: 'Instrument Mono', monospace;
    white-space: nowrap;
  }

  .athlete-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 2px; }
  .athlete-location { font-size: 12px; color: var(--mu2); margin-bottom: 14px; }

  .athlete-metrics { display: flex; gap: 20px; }
  .metric { }
  .metric-val { font-family: 'Instrument Mono', monospace; font-size: 18px; font-weight: 500; }
  .metric-label { font-size: 10px; color: var(--mu); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: 6px; border: none;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 12px; font-weight: 600; cursor: pointer;
    transition: all 0.15s; text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .btn-primary { background: var(--g); color: var(--bk); }
  .btn-primary:hover { background: var(--g2); transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--mu2); border: 1px solid var(--bd); }
  .btn-ghost:hover { border-color: var(--g); color: var(--g); }
  .btn-sm { padding: 6px 14px; font-size: 11px; }

  /* TAGS / BADGES */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 100px;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase;
    font-family: 'Instrument Mono', monospace;
  }
  .badge-green { background: rgba(0,232,122,0.12); color: var(--g); }
  .badge-orange { background: rgba(255,107,44,0.12); color: var(--or); }
  .badge-blue { background: rgba(44,232,255,0.12); color: var(--bl); }
  .badge-yellow { background: rgba(255,214,0,0.12); color: var(--yl); }
  .badge-purple { background: rgba(180,122,255,0.12); color: var(--pu); }
  .badge-red { background: rgba(255,68,102,0.12); color: var(--rd); }
  .badge-muted { background: rgba(255,255,255,0.06); color: var(--mu2); }

  /* TABLE */
  .table { width: 100%; border-collapse: collapse; }
  .table th {
    text-align: left; padding: 12px 16px;
    font-size: 10px; color: var(--mu);
    text-transform: uppercase; letter-spacing: 1.5px;
    font-family: 'Instrument Mono', monospace;
    border-bottom: 1px solid var(--bd);
  }
  .table td {
    padding: 14px 16px; font-size: 13px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
  }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: rgba(255,255,255,0.02); }

  /* FEED */
  .feed-post {
    background: var(--d2); border: 1px solid var(--bd);
    border-radius: 12px; padding: 20px;
    margin-bottom: 12px; transition: all 0.2s;
  }
  .feed-post:hover { border-color: rgba(0,232,122,0.2); }

  .post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .post-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--g3); border: 1.5px solid var(--g);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .post-author { font-weight: 600; font-size: 14px; }
  .post-meta { font-size: 11px; color: var(--mu2); display: flex; align-items: center; gap: 8px; margin-top: 2px; }
  .post-content { font-size: 14px; line-height: 1.6; color: var(--mu2); margin-bottom: 14px; }
  .post-actions { display: flex; gap: 16px; }
  .post-action {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--mu); cursor: pointer;
    background: none; border: none; transition: color 0.15s;
    font-family: 'Instrument Sans', sans-serif;
  }
  .post-action:hover { color: var(--g); }

  /* PROGRESS BAR */
  .progress-wrap { background: var(--d1); border-radius: 100px; height: 6px; overflow: hidden; }
  .progress-bar { height: 100%; background: var(--g); border-radius: 100px; transition: width 0.5s ease; }

  /* CAMPAIGN CARD */
  .campaign-card {
    background: var(--d2); border: 1px solid var(--bd);
    border-radius: 12px; padding: 24px; transition: all 0.2s;
  }
  .campaign-card:hover { border-color: rgba(0,232,122,0.3); transform: translateY(-2px); }

  /* SERVICES */
  .service-card {
    background: var(--d2); border: 1px solid var(--bd);
    border-radius: 12px; padding: 24px; transition: all 0.2s;
  }
  .service-card:hover { border-color: rgba(44,232,255,0.3); transform: translateY(-2px); }
  .service-icon {
    width: 48px; height: 48px; border-radius: 10px;
    background: rgba(44,232,255,0.08); border: 1px solid rgba(44,232,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 16px;
  }
  .service-cat { font-size: 10px; color: var(--bl); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; font-family: 'Instrument Mono', monospace; }
  .service-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .service-provider { font-size: 12px; color: var(--mu2); margin-bottom: 12px; }
  .service-footer { display: flex; align-items: center; justify-content: space-between; }
  .service-price { font-family: 'Instrument Mono', monospace; font-size: 16px; color: var(--g); font-weight: 500; }
  .service-rating { font-size: 12px; color: var(--yl); display: flex; align-items: center; gap: 4px; }

  /* FORM */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 11px; font-weight: 600; color: var(--mu2); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; font-family: 'Instrument Mono', monospace; }
  .form-input, .form-select, .form-textarea {
    width: 100%; background: var(--d1); border: 1px solid var(--bd);
    border-radius: 8px; padding: 11px 14px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px; color: var(--tx); outline: none; transition: border-color 0.15s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--g); }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-select { cursor: pointer; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .modal {
    background: var(--d2); border: 1px solid var(--bd);
    border-radius: 16px; width: 100%; max-width: 520px;
    max-height: 80vh; overflow-y: auto;
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
  .modal-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid var(--bd);
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }
  .modal-body { padding: 24px 28px; }
  .modal-footer { padding: 16px 28px; border-top: 1px solid var(--bd); display: flex; gap: 10px; justify-content: flex-end; }
  .modal-close { background: none; border: none; color: var(--mu); font-size: 20px; cursor: pointer; transition: color 0.15s; }
  .modal-close:hover { color: var(--tx); }

  /* AUTH */
  .auth-screen {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bk); position: relative; overflow: hidden;
  }
  .auth-bg {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(0,232,122,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,232,122,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .auth-glow {
    position: absolute; width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,232,122,0.08) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%,-50%);
  }
  .auth-card {
    background: var(--d2); border: 1px solid var(--bd);
    border-radius: 20px; padding: 48px 44px; width: 420px;
    position: relative; z-index: 1;
  }
  .auth-logo {
    font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800;
    color: var(--g); letter-spacing: 1px; margin-bottom: 4px;
  }
  .auth-logo span { color: var(--mu2); }
  .auth-subtitle { font-size: 13px; color: var(--mu2); margin-bottom: 36px; }
  .auth-tabs { display: flex; gap: 4px; margin-bottom: 28px; background: var(--d1); border-radius: 8px; padding: 4px; }
  .auth-tab {
    flex: 1; padding: 9px; border-radius: 6px; border: none;
    font-family: 'Instrument Sans', sans-serif; font-size: 13px;
    font-weight: 600; cursor: pointer; transition: all 0.15s;
    background: none; color: var(--mu2);
  }
  .auth-tab.active { background: var(--g); color: var(--bk); }

  .role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
  .role-btn {
    padding: 12px 8px; border-radius: 8px;
    border: 1px solid var(--bd); background: var(--d1);
    cursor: pointer; text-align: center; transition: all 0.15s;
    font-family: 'Instrument Sans', sans-serif;
  }
  .role-btn:hover { border-color: rgba(0,232,122,0.3); }
  .role-btn.selected { border-color: var(--g); background: var(--g3); }
  .role-btn .role-icon { font-size: 22px; display: block; margin-bottom: 4px; }
  .role-btn .role-name { font-size: 10px; font-weight: 600; color: var(--mu2); text-transform: uppercase; letter-spacing: 0.5px; }
  .role-btn.selected .role-name { color: var(--g); }

  .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--bd); }
  .divider span { font-size: 11px; color: var(--mu); }

  .alert-config {
    background: rgba(255,214,0,0.08); border: 1px solid rgba(255,214,0,0.2);
    border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;
    font-size: 12px; color: var(--yl); line-height: 1.6;
  }
  .alert-config strong { display: block; margin-bottom: 4px; font-size: 13px; }

  /* PROFILE PAGE */
  .profile-hero {
    background: linear-gradient(135deg, var(--d2) 0%, rgba(0,232,122,0.05) 100%);
    border: 1px solid var(--bd); border-radius: 16px;
    padding: 32px; margin-bottom: 24px;
    display: flex; gap: 28px; align-items: flex-start;
  }
  .profile-avatar-lg {
    width: 88px; height: 88px; border-radius: 50%;
    background: var(--g3); border: 3px solid var(--g);
    display: flex; align-items: center; justify-content: center;
    font-size: 44px; flex-shrink: 0;
  }
  .profile-info { flex: 1; }
  .profile-name { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; margin-bottom: 4px; }
  .profile-meta-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
  .profile-bio { font-size: 14px; color: var(--mu2); line-height: 1.6; max-width: 600px; margin-bottom: 20px; }
  .profile-socials { display: flex; gap: 10px; }
  .social-chip {
    display: flex; align-items: center; gap: 6px;
    background: var(--d1); border: 1px solid var(--bd);
    border-radius: 6px; padding: 6px 12px;
    font-size: 12px; color: var(--mu2);
    text-decoration: none; transition: all 0.15s;
  }
  .social-chip:hover { border-color: var(--g); color: var(--g); }

  .metrics-row { display: flex; gap: 32px; }
  .metric-big { text-align: center; }
  .metric-big-val { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--g); }
  .metric-big-label { font-size: 11px; color: var(--mu); text-transform: uppercase; letter-spacing: 1px; font-family: 'Instrument Mono', monospace; }

  /* NOTIFICATIONS */
  .notif-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--g); flex-shrink: 0;
  }

  /* EMPTY STATE */
  .empty-state {
    text-align: center; padding: 60px 24px; color: var(--mu);
  }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  .empty-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--mu2); margin-bottom: 8px; }
  .empty-text { font-size: 13px; line-height: 1.6; }

  /* TOAST */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: var(--d2); border: 1px solid var(--g);
    border-radius: 10px; padding: 14px 20px;
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: slideUp 0.3s ease;
    max-width: 340px;
  }
  .toast-icon { font-size: 18px; }

  /* RESPONSIVE helpers */
  .row { display: flex; align-items: center; gap: 12px; }
  .row-between { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .col { display: flex; flex-direction: column; }
  .gap-4 { gap: 4px; }
  .gap-8 { gap: 8px; }
  .gap-16 { gap: 16px; }
  .mt-4 { margin-top: 4px; }
  .mt-8 { margin-top: 8px; }
  .mt-16 { margin-top: 16px; }
  .mt-24 { margin-top: 24px; }
  .mb-4 { margin-bottom: 4px; }
  .mb-8 { margin-bottom: 8px; }
  .mb-16 { margin-bottom: 16px; }
  .mb-24 { margin-bottom: 24px; }
  .text-muted { color: var(--mu2); }
  .text-green { color: var(--g); }
  .text-sm { font-size: 12px; }
  .text-xs { font-size: 11px; }
  .text-mono { font-family: 'Instrument Mono', monospace; }
  .font-bold { font-weight: 700; }
  .section-head { margin-bottom: 20px; }
  .section-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .section-sub { font-size: 12px; color: var(--mu2); }
`;

// ─── COMPONENTS ────────────────────────────────────────────────────────────

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="toast">
      <span className="toast-icon">✅</span>
      <span>{msg}</span>
    </div>
  );
}

function Modal({ title, children, footer, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ────────────────────────────────────────────────────────────

const ROLES = [
  { key: "atleta", icon: "🏃‍♀️", label: "Atleta" },
  { key: "empresa", icon: "🏢", label: "Empresa" },
  { key: "clube", icon: "⚽", label: "Clube" },
  { key: "servico", icon: "🩺", label: "Serviço" },
  { key: "midia", icon: "📸", label: "Mídia" },
  { key: "apoiador", icon: "💚", label: "Apoiador" },
];

function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("atleta");
  const [sport, setSport] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const isDemo = SUPABASE_URL.includes("SEU_PROJETO");

  const handleSubmit = async () => {
    if (isDemo) { onLogin(MOCK.user, MOCK.profile); return; }
    setLoading(true); setErr("");
    try {
      if (tab === "login") {
        const d = await supabase.signIn(email, pass);
        if (d.error) throw new Error(d.error.message);
        const profiles = await supabase.query("profiles", `?id=eq.${d.user.id}&select=*`);
        onLogin(d.user, profiles[0] || null);
      } else {
        const d = await supabase.signUp(email, pass);
        if (d.error) throw new Error(d.error.message);
        await supabase.insert("profiles", { id: d.user.id, role, name, sport });
        onLogin(d.user, { id: d.user.id, role, name, sport });
      }
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-logo">Conecta<span>Atleta</span></div>
        <div className="auth-subtitle">O ecossistema do atleta amador brasileiro</div>
        {isDemo && (
          <div className="alert-config">
            <strong>⚙️ Modo Demo Ativo</strong>
            Para usar com banco de dados real, configure SUPABASE_URL e SUPABASE_ANON_KEY no topo do arquivo.
            Clique em "Entrar" para explorar a plataforma com dados de exemplo.
          </div>
        )}

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Entrar</button>
          <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Cadastrar</button>
        </div>

        {tab === "signup" && (
          <>
            <div className="form-group">
              <label className="form-label">Tipo de Conta</label>
              <div className="role-grid">
                {ROLES.map(r => (
                  <button key={r.key} className={`role-btn ${role === r.key ? "selected" : ""}`} onClick={() => setRole(r.key)}>
                    <span className="role-icon">{r.icon}</span>
                    <span className="role-name">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input className="form-input" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
            </div>
            {role === "atleta" && (
              <div className="form-group">
                <label className="form-label">Modalidade Principal</label>
                <input className="form-input" placeholder="Ex: Corrida, Beach Tennis, Natação..." value={sport} onChange={e => setSport(e.target.value)} />
              </div>
            )}
          </>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Senha</label>
          <input className="form-input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>

        {err && <div style={{ color: "var(--rd)", fontSize: 12, marginBottom: 12 }}>{err}</div>}

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px" }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? "Carregando..." : tab === "login" ? "Entrar na Plataforma →" : "Criar Conta →"}
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function Dashboard({ profile }) {
  return (
    <div>
      <div className="mb-24">
        <h2 className="section-title">Olá, {profile.name?.split(" ")[0]} 👋</h2>
        <p className="text-muted text-sm">Aqui está o resumo do seu ecossistema hoje.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card green">
          <span className="stat-icon">🏃‍♀️</span>
          <div className="stat-value">{MOCK.stats.totalAthletes.toLocaleString()}</div>
          <div className="stat-label">Atletas na plataforma</div>
          <div className="stat-change">↑ +24 esta semana</div>
        </div>
        <div className="stat-card orange">
          <span className="stat-icon">🤝</span>
          <div className="stat-value">{MOCK.stats.activeSponsorships}</div>
          <div className="stat-label">Patrocínios ativos</div>
          <div className="stat-change">↑ +8 este mês</div>
        </div>
        <div className="stat-card blue">
          <span className="stat-icon">🛒</span>
          <div className="stat-value">{MOCK.stats.servicesBooked}</div>
          <div className="stat-label">Serviços contratados</div>
          <div className="stat-change">↑ +31 esta semana</div>
        </div>
        <div className="stat-card yellow">
          <span className="stat-icon">💰</span>
          <div className="stat-value">R${(MOCK.stats.raised / 1000).toFixed(0)}K</div>
          <div className="stat-label">Captado via crowdfunding</div>
          <div className="stat-change">↑ +R$18K este mês</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Feed Recente</div>
            <button className="btn btn-ghost btn-sm">Ver tudo</button>
          </div>
          <div className="card-body" style={{ padding: "16px" }}>
            {MOCK.feed.slice(0, 3).map(post => (
              <div key={post.id} className="feed-post" style={{ marginBottom: 8 }}>
                <div className="post-header">
                  <div className="post-avatar">{post.avatar}</div>
                  <div>
                    <div className="post-author">{post.author}</div>
                    <div className="post-meta">
                      <span className="badge badge-muted">{post.sport}</span>
                      <span>{post.time}</span>
                    </div>
                  </div>
                </div>
                <div className="post-content" style={{ fontSize: 13, marginBottom: 0 }}>{post.content.substring(0, 100)}...</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <div className="card-header">
              <div className="card-title">🏆 Meus Patrocínios</div>
              <span className="badge badge-green">{MOCK.sponsorships.filter(s => s.status === "active").length} ativos</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Parceiro</th>
                    <th>Valor/ano</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK.sponsorships.slice(0, 3).map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.sponsor}</div>
                        <div style={{ fontSize: 11, color: "var(--mu2)" }}>{s.title}</div>
                      </td>
                      <td><span className="text-mono text-green" style={{ fontSize: 13 }}>R${s.value.toLocaleString()}</span></td>
                      <td>
                        <span className={`badge ${s.status === "active" ? "badge-green" : "badge-yellow"}`}>
                          {s.status === "active" ? "Ativo" : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">💰 Campanhas em Destaque</div>
            </div>
            <div className="card-body" style={{ padding: "16px" }}>
              {MOCK.campaigns.map(c => {
                const pct = Math.round((c.raised / c.goal) * 100);
                return (
                  <div key={c.id} style={{ marginBottom: 16 }}>
                    <div className="row-between mb-4">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{c.avatar}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{c.title}</div>
                          <div style={{ fontSize: 10, color: "var(--mu2)" }}>{c.athlete}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--g)", fontFamily: "Instrument Mono", fontWeight: 500 }}>{pct}%</span>
                    </div>
                    <div className="progress-wrap">
                      <div className="progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="row-between mt-4">
                      <span style={{ fontSize: 10, color: "var(--mu2)" }}>R${c.raised.toLocaleString()} de R${c.goal.toLocaleString()}</span>
                      <span style={{ fontSize: 10, color: "var(--mu)" }}>até {c.deadline}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ATHLETES PAGE ──────────────────────────────────────────────────────────

function AthletesPage({ onShowModal }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const sports = ["all", "Triatlo", "Mountain Bike", "Natação", "Beach Tennis", "Corrida", "Ciclismo"];
  const filtered = MOCK.athletes.filter(a =>
    (filter === "all" || a.sport === filter) &&
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="row-between mb-24">
        <div>
          <div className="section-title">🏃‍♀️ Atletas</div>
          <div className="text-muted text-sm">Encontre e conecte-se com atletas da rede</div>
        </div>
        <button className="btn btn-primary" onClick={() => onShowModal("addAthlete")}>+ Meu Perfil</button>
      </div>

      <div className="row mb-16" style={{ flexWrap: "wrap", gap: 8 }}>
        <input
          className="form-input" style={{ maxWidth: 260 }}
          placeholder="🔍  Buscar atleta..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sports.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="btn btn-ghost btn-sm"
              style={{ borderColor: filter === s ? "var(--g)" : undefined, color: filter === s ? "var(--g)" : undefined }}>
              {s === "all" ? "Todos" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-auto">
        {filtered.map(a => (
          <div key={a.id} className="athlete-card">
            <div className="athlete-avatar-wrap">
              <div className="athlete-avatar">{a.avatar}</div>
              <div className="athlete-sport-badge">{a.sport}</div>
            </div>
            <div className="athlete-name">{a.name}</div>
            <div className="athlete-location">📍 {a.location}</div>
            <div className="athlete-metrics">
              <div className="metric">
                <div className="metric-val">{a.followers >= 1000 ? `${(a.followers/1000).toFixed(1)}K` : a.followers}</div>
                <div className="metric-label">Seguidores</div>
              </div>
              <div className="metric">
                <div className="metric-val" style={{ color: "var(--g)" }}>{a.engagement}%</div>
                <div className="metric-label">Engajamento</div>
              </div>
            </div>
            <div className="row mt-16" style={{ gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => onShowModal("sponsorProposal", a)}>Patrocinar</button>
              <button className="btn btn-ghost btn-sm">Ver Perfil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SPONSORSHIPS PAGE ──────────────────────────────────────────────────────

function SponsorshipsPage({ onShowModal }) {
  const statusColor = { active: "badge-green", pending: "badge-yellow", closed: "badge-muted" };
  const statusLabel = { active: "Ativo", pending: "Pendente", closed: "Encerrado" };

  return (
    <div>
      <div className="row-between mb-24">
        <div>
          <div className="section-title">🤝 Patrocínios</div>
          <div className="text-muted text-sm">Gerencie propostas e parcerias ativas</div>
        </div>
        <button className="btn btn-primary" onClick={() => onShowModal("newSponsorship")}>+ Nova Proposta</button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
        <div className="stat-card green">
          <span className="stat-icon">✅</span>
          <div className="stat-value">{MOCK.sponsorships.filter(s => s.status === "active").length}</div>
          <div className="stat-label">Ativos</div>
        </div>
        <div className="stat-card yellow">
          <span className="stat-icon">⏳</span>
          <div className="stat-value">{MOCK.sponsorships.filter(s => s.status === "pending").length}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card orange">
          <span className="stat-icon">💰</span>
          <div className="stat-value">R${MOCK.sponsorships.reduce((a, s) => a + s.value, 0).toLocaleString()}</div>
          <div className="stat-label">Volume Total/ano</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Todos os Patrocínios</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Patrocínio</th>
              <th>Atleta</th>
              <th>Patrocinador</th>
              <th>Valor/ano</th>
              <th>Contrapartidas</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK.sponsorships.map(s => (
              <tr key={s.id}>
                <td><div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div></td>
                <td><span style={{ fontSize: 13 }}>{s.athlete}</span></td>
                <td><span style={{ fontSize: 13, color: "var(--mu2)" }}>{s.sponsor}</span></td>
                <td><span className="text-mono text-green" style={{ fontSize: 13 }}>R${s.value.toLocaleString()}</span></td>
                <td><span style={{ fontSize: 12, color: "var(--mu2)" }}>{s.contrapartidas}</span></td>
                <td><span className={`badge ${statusColor[s.status]}`}>{statusLabel[s.status]}</span></td>
                <td><button className="btn btn-ghost btn-sm">Detalhes</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-24">
        <div className="card-header">
          <div className="card-title">⚡ Lei de Incentivo ao Esporte</div>
          <span className="badge badge-yellow">Benefício Fiscal</span>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>O que é?</div>
              <p style={{ fontSize: 13, color: "var(--mu2)", lineHeight: 1.7 }}>
                Empresas podem deduzir até <strong style={{ color: "var(--g)" }}>6% do IR devido</strong> ao investir em projetos esportivos aprovados pelo Ministério do Esporte. De 6 milhões de empresas elegíveis, menos de 0,02% utilizam este benefício.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Como a plataforma ajuda?</div>
              <p style={{ fontSize: 13, color: "var(--mu2)", lineHeight: 1.7 }}>
                Conectamos empresas a atletas com projetos aprovados, cuidamos da documentação e relatórios de contrapartida, e geramos o comprovante de investimento para a Receita Federal.
              </p>
            </div>
          </div>
          <div className="mt-16">
            <button className="btn btn-primary">📋 Ver Projetos Aprovados</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MARKETPLACE PAGE ───────────────────────────────────────────────────────

function MarketplacePage({ onShowModal }) {
  const [catFilter, setCatFilter] = useState("all");
  const cats = ["all", "Nutrição", "Fisioterapia", "Psicologia", "Fotografia", "Coaching", "Preparação"];
  const filtered = MOCK.services.filter(s => catFilter === "all" || s.category === catFilter);

  return (
    <div>
      <div className="row-between mb-24">
        <div>
          <div className="section-title">🛒 Marketplace de Serviços</div>
          <div className="text-muted text-sm">Profissionais especializados em esporte para você</div>
        </div>
        <button className="btn btn-ghost" onClick={() => onShowModal("addService")}>+ Oferecer Serviço</button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className="btn btn-ghost btn-sm"
            style={{ borderColor: catFilter === c ? "var(--bl)" : undefined, color: catFilter === c ? "var(--bl)" : undefined }}>
            {c === "all" ? "Todos" : c}
          </button>
        ))}
      </div>

      <div className="grid-3">
        {filtered.map(s => (
          <div key={s.id} className="service-card">
            <div className="service-icon">{s.avatar}</div>
            <div className="service-cat">{s.category}</div>
            <div className="service-title">{s.title}</div>
            <div className="service-provider">por {s.provider}</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ fontSize: 10, color: i < Math.floor(s.rating) ? "var(--yl)" : "var(--mu)" }}>★</span>
              ))}
              <span style={{ fontSize: 11, color: "var(--mu2)" }}>{s.rating} ({s.reviews} avaliações)</span>
            </div>
            <div className="service-footer">
              <div className="service-price">R$ {s.price.toLocaleString()}</div>
              <button className="btn btn-primary btn-sm" onClick={() => onShowModal("bookService", s)}>Contratar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CROWDFUNDING PAGE ──────────────────────────────────────────────────────

function CrowdfundingPage({ onShowModal }) {
  return (
    <div>
      <div className="row-between mb-24">
        <div>
          <div className="section-title">💰 Crowdfunding Esportivo</div>
          <div className="text-muted text-sm">Apoie atletas ou crie sua própria campanha</div>
        </div>
        <button className="btn btn-primary" onClick={() => onShowModal("newCampaign")}>+ Nova Campanha</button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
        <div className="stat-card green">
          <span className="stat-icon">🎯</span>
          <div className="stat-value">{MOCK.campaigns.length}</div>
          <div className="stat-label">Campanhas ativas</div>
        </div>
        <div className="stat-card yellow">
          <span className="stat-icon">💰</span>
          <div className="stat-value">R$17K</div>
          <div className="stat-label">Captado total</div>
        </div>
        <div className="stat-card blue">
          <span className="stat-icon">👥</span>
          <div className="stat-value">284</div>
          <div className="stat-label">Apoiadores únicos</div>
        </div>
      </div>

      <div className="grid-3">
        {MOCK.campaigns.map(c => {
          const pct = Math.round((c.raised / c.goal) * 100);
          return (
            <div key={c.id} className="campaign-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--g3)", border: "1.5px solid var(--g)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{c.avatar}</div>
                <div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "var(--mu2)" }}>{c.athlete}</div>
                </div>
              </div>

              <div className="row-between mb-4">
                <span style={{ fontSize: 12, color: "var(--mu2)" }}>Progresso</span>
                <span style={{ fontSize: 13, color: "var(--g)", fontFamily: "Instrument Mono", fontWeight: 600 }}>{pct}%</span>
              </div>
              <div className="progress-wrap mb-8">
                <div className="progress-bar" style={{ width: `${pct}%` }} />
              </div>
              <div className="row-between mb-16">
                <span style={{ fontSize: 12, fontWeight: 600 }}>R${c.raised.toLocaleString()}</span>
                <span style={{ fontSize: 11, color: "var(--mu2)" }}>meta: R${c.goal.toLocaleString()}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--mu)", display: "flex", alignItems: "center", gap: 4 }}>⏰ até {c.deadline}</span>
                <button className="btn btn-primary btn-sm" onClick={() => onShowModal("donate", c)}>Apoiar R$</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FEED PAGE ──────────────────────────────────────────────────────────────

function FeedPage({ profile, onShowModal }) {
  const [liked, setLiked] = useState([]);
  const [newPost, setNewPost] = useState("");

  const toggleLike = (id) => setLiked(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div className="mb-24">
        <div className="section-title">📋 Feed da Comunidade</div>
        <div className="text-muted text-sm">Acompanhe treinos, conquistas e histórias</div>
      </div>

      <div className="card mb-16">
        <div className="card-body">
          <div style={{ display: "flex", gap: 12 }}>
            <div className="post-avatar">{profile.avatar || "🏅"}</div>
            <div style={{ flex: 1 }}>
              <textarea
                className="form-textarea" style={{ marginBottom: 12 }}
                placeholder="Compartilhe seu treino, conquista ou dica..."
                value={newPost} onChange={e => setNewPost(e.target.value)}
                rows={3}
              />
              <div className="row-between">
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn btn-ghost btn-sm">📷 Foto</button>
                  <button className="btn btn-ghost btn-sm">🎥 Vídeo</button>
                </div>
                <button className="btn btn-primary btn-sm"
                  onClick={() => { if (newPost.trim()) { setNewPost(""); onShowModal("postCreated"); } }}>
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {MOCK.feed.map(post => (
        <div key={post.id} className="feed-post">
          <div className="post-header">
            <div className="post-avatar">{post.avatar}</div>
            <div style={{ flex: 1 }}>
              <div className="post-author">{post.author}</div>
              <div className="post-meta">
                <span className="badge badge-muted">{post.sport}</span>
                <span>{post.time}</span>
              </div>
            </div>
          </div>
          <div className="post-content">{post.content}</div>
          <div className="post-actions">
            <button className="post-action" onClick={() => toggleLike(post.id)}
              style={{ color: liked.includes(post.id) ? "var(--g)" : undefined }}>
              {liked.includes(post.id) ? "💚" : "🤍"} {post.likes + (liked.includes(post.id) ? 1 : 0)}
            </button>
            <button className="post-action">💬 Comentar</button>
            <button className="post-action">↗ Compartilhar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PROFILE PAGE ───────────────────────────────────────────────────────────

function ProfilePage({ profile }) {
  return (
    <div>
      <div className="profile-hero">
        <div className="profile-avatar-lg">{profile.avatar || "🏅"}</div>
        <div className="profile-info">
          <div className="profile-name">{profile.name}</div>
          <div className="profile-meta-row">
            <span className="badge badge-green">{ROLES.find(r => r.key === profile.role)?.icon} {ROLES.find(r => r.key === profile.role)?.label}</span>
            {profile.sport && <span className="badge badge-muted">{profile.sport}</span>}
            {profile.location && <span style={{ fontSize: 12, color: "var(--mu2)" }}>📍 {profile.location}</span>}
          </div>
          <div className="profile-bio">{profile.bio || "Adicione uma bio ao seu perfil para se apresentar à rede."}</div>
          <div className="profile-socials">
            {profile.instagram && <a className="social-chip" href="#">📸 {profile.instagram}</a>}
            {profile.youtube && <a className="social-chip" href="#">▶ {profile.youtube}</a>}
            {profile.strava && <a className="social-chip" href="#">🏃 {profile.strava}</a>}
          </div>
        </div>
        <div>
          {profile.role === "atleta" && (
            <div className="metrics-row">
              <div className="metric-big">
                <div className="metric-big-val">{(profile.followers / 1000).toFixed(1)}K</div>
                <div className="metric-big-label">Seguidores</div>
              </div>
              <div className="metric-big">
                <div className="metric-big-val">{profile.engagement}%</div>
                <div className="metric-big-label">Engajamento</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚡ Editar Perfil</div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input className="form-input" defaultValue={profile.name} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" defaultValue={profile.bio} rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">Localização</label>
              <input className="form-input" defaultValue={profile.location} placeholder="Cidade, Estado" />
            </div>
            <div className="form-group">
              <label className="form-label">Modalidade</label>
              <input className="form-input" defaultValue={profile.sport} placeholder="Corrida, Natação..." />
            </div>
            <button className="btn btn-primary">Salvar Alterações</button>
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <div className="card-header">
              <div className="card-title">🔗 Redes Sociais</div>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input className="form-input" defaultValue={profile.instagram} placeholder="@seu_perfil" />
              </div>
              <div className="form-group">
                <label className="form-label">YouTube</label>
                <input className="form-input" defaultValue={profile.youtube} placeholder="Canal YouTube" />
              </div>
              <div className="form-group">
                <label className="form-label">Strava</label>
                <input className="form-input" defaultValue={profile.strava} placeholder="Usuário Strava" />
              </div>
              <button className="btn btn-primary">Conectar Redes</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">📄 Mídia Kit</div>
              <span className="badge badge-purple">IA</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: "var(--mu2)", lineHeight: 1.6, marginBottom: 16 }}>
                Gere automaticamente um mídia kit profissional com suas métricas consolidadas de todas as redes sociais.
              </p>
              <button className="btn btn-primary">🤖 Gerar Mídia Kit com IA</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL FORMS ────────────────────────────────────────────────────────────

function ModalContent({ type, data, onClose, onToast }) {
  const [form, setForm] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const isDemo = SUPABASE_URL.includes("SEU_PROJETO");
    if (!isDemo) {
      if (type === "newSponsorship") await supabase.insert("sponsorships", { ...form, athlete_id: data?.id });
      if (type === "newCampaign") await supabase.insert("campaigns", { ...form });
      if (type === "addService") await supabase.insert("services", { ...form });
    }
    onToast("✅ Salvo com sucesso!");
    onClose();
  };

  if (type === "sponsorProposal") return (
    <Modal title={`Proposta para ${data?.name}`} onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Enviar Proposta</button></>}>
      <div className="form-group">
        <label className="form-label">Nome da Parceria</label>
        <input className="form-input" placeholder="Ex: Patrocínio Temporada 2025" onChange={e => set("title", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Valor Anual (R$)</label>
        <input className="form-input" type="number" placeholder="0,00" onChange={e => set("value", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Contrapartidas Desejadas</label>
        <textarea className="form-textarea" placeholder="Posts mensais, logo no uniforme, presença em evento..." onChange={e => set("contrapartidas", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Duração</label>
        <select className="form-select" onChange={e => set("duration", e.target.value)}>
          <option>3 meses</option><option>6 meses</option><option>12 meses</option>
        </select>
      </div>
    </Modal>
  );

  if (type === "newSponsorship") return (
    <Modal title="Nova Proposta de Patrocínio" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Criar Proposta</button></>}>
      <div className="form-group">
        <label className="form-label">Atleta</label>
        <select className="form-select">
          {MOCK.athletes.map(a => <option key={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Título da Parceria</label>
        <input className="form-input" placeholder="Nome da parceria" onChange={e => set("title", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Valor (R$/ano)</label>
        <input className="form-input" type="number" onChange={e => set("value", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Contrapartidas</label>
        <textarea className="form-textarea" onChange={e => set("contrapartidas", e.target.value)} />
      </div>
    </Modal>
  );

  if (type === "newCampaign") return (
    <Modal title="Nova Campanha de Crowdfunding" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Lançar Campanha</button></>}>
      <div className="form-group">
        <label className="form-label">Título da Campanha</label>
        <input className="form-input" placeholder="Ex: Ironman 70.3 Floripa 2025" onChange={e => set("title", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Descrição</label>
        <textarea className="form-textarea" placeholder="Conte sua história e por que precisa deste apoio..." onChange={e => set("description", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Meta (R$)</label>
        <input className="form-input" type="number" onChange={e => set("goal", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Prazo</label>
        <input className="form-input" type="date" onChange={e => set("deadline", e.target.value)} />
      </div>
    </Modal>
  );

  if (type === "donate") return (
    <Modal title={`Apoiar: ${data?.title}`} onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Confirmar Apoio 💚</button></>}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{data?.avatar}</div>
        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{data?.title}</div>
        <div style={{ fontSize: 12, color: "var(--mu2)" }}>{data?.athlete}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Valor do Apoio (R$)</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[20, 50, 100, 200].map(v => (
            <button key={v} className={`btn btn-ghost btn-sm ${form.amount == v ? "btn-primary" : ""}`}
              style={{ flex: 1, borderColor: form.amount == v ? "var(--g)" : undefined }}
              onClick={() => set("amount", v)}>
              R${v}
            </button>
          ))}
        </div>
        <input className="form-input" type="number" placeholder="Outro valor..." onChange={e => set("amount", e.target.value)} value={form.amount || ""} />
      </div>
      <div className="form-group">
        <label className="form-label">Mensagem (opcional)</label>
        <input className="form-input" placeholder="Mande força para o atleta!" onChange={e => set("msg", e.target.value)} />
      </div>
    </Modal>
  );

  if (type === "bookService") return (
    <Modal title={`Contratar: ${data?.title}`} onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Solicitar Agendamento</button></>}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, background: "var(--d1)", borderRadius: 10, padding: 16 }}>
        <span style={{ fontSize: 32 }}>{data?.avatar}</span>
        <div>
          <div style={{ fontWeight: 700 }}>{data?.title}</div>
          <div style={{ fontSize: 12, color: "var(--mu2)" }}>{data?.provider}</div>
          <div style={{ fontSize: 14, color: "var(--g)", fontFamily: "Instrument Mono", marginTop: 4 }}>R${data?.price?.toLocaleString()}</div>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Data Preferida</label>
        <input className="form-input" type="date" onChange={e => set("date", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Observações</label>
        <textarea className="form-textarea" placeholder="Conte um pouco sobre seu objetivo..." onChange={e => set("obs", e.target.value)} />
      </div>
    </Modal>
  );

  if (type === "addService") return (
    <Modal title="Oferecer Serviço" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Publicar Serviço</button></>}>
      <div className="form-group">
        <label className="form-label">Categoria</label>
        <select className="form-select" onChange={e => set("category", e.target.value)}>
          {["Nutrição","Fisioterapia","Psicologia","Fotografia","Coaching","Preparação"].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Título do Serviço</label>
        <input className="form-input" placeholder="Ex: Consulta Nutricional Esportiva" onChange={e => set("title", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Descrição</label>
        <textarea className="form-textarea" onChange={e => set("description", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Valor (R$)</label>
        <input className="form-input" type="number" onChange={e => set("price", e.target.value)} />
      </div>
    </Modal>
  );

  if (type === "postCreated") return (
    <Modal title="Post Publicado! 🎉" onClose={onClose} footer={<button className="btn btn-primary" onClick={onClose}>Fechar</button>}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <p style={{ color: "var(--mu2)", lineHeight: 1.6 }}>Seu post foi publicado no feed da comunidade! Outros atletas e patrocinadores já podem ver sua atualização.</p>
      </div>
    </Modal>
  );

  return null;
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "dashboard", icon: "⊞", label: "Dashboard" },
  { key: "feed", icon: "📋", label: "Feed" },
  { key: "athletes", icon: "🏃‍♀️", label: "Atletas" },
  { key: "sponsorships", icon: "🤝", label: "Patrocínios", badge: "2" },
  { key: "marketplace", icon: "🛒", label: "Serviços" },
  { key: "crowdfunding", icon: "💰", label: "Crowdfunding" },
  { key: "profile", icon: "👤", label: "Meu Perfil" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showModal = useCallback((type, data) => setModal({ type, data }), []);
  const showToast = useCallback((msg) => setToast(msg), []);

  const handleLogin = (u, p) => { setUser(u); setProfile(p || MOCK.profile); };
  const handleLogout = () => { supabase.signOut(); setUser(null); setProfile(null); };

  const pageTitle = NAV_ITEMS.find(n => n.key === page)?.label || "Dashboard";

  if (!user) return (
    <>
      <style>{styles}</style>
      <AuthScreen onLogin={handleLogin} />
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-text">Conecta<span>Atleta</span></div>
            <div className="logo-tag">// Ecossistema Esportivo</div>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">{profile?.avatar || "🏅"}</div>
            <div>
              <div className="user-name">{profile?.name?.split(" ")[0] || "Usuário"}</div>
              <div className="user-role">{ROLES.find(r => r.key === profile?.role)?.label || "Atleta"}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Menu</div>
            {NAV_ITEMS.map(item => (
              <button key={item.key}
                className={`nav-item ${page === item.key ? "active" : ""}`}
                onClick={() => setPage(item.key)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <button className="nav-item" onClick={handleLogout}>
              <span className="nav-icon">⎋</span>
              Sair
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{pageTitle}</div>
            <div className="topbar-search">
              <span style={{ color: "var(--mu)", fontSize: 14 }}>🔍</span>
              <input placeholder="Buscar atletas, serviços..." />
            </div>
            <button className="topbar-btn" title="Notificações">🔔</button>
            <button className="topbar-btn" title="Config">⚙</button>
          </div>

          <div className="content">
            {page === "dashboard" && <Dashboard profile={profile} />}
            {page === "feed" && <FeedPage profile={profile} onShowModal={showModal} />}
            {page === "athletes" && <AthletesPage onShowModal={showModal} />}
            {page === "sponsorships" && <SponsorshipsPage onShowModal={showModal} />}
            {page === "marketplace" && <MarketplacePage onShowModal={showModal} />}
            {page === "crowdfunding" && <CrowdfundingPage onShowModal={showModal} />}
            {page === "profile" && <ProfilePage profile={profile} />}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {modal && <ModalContent type={modal.type} data={modal.data} onClose={() => setModal(null)} onToast={showToast} />}

      {/* TOAST */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
