/* eslint-disable */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./lib/supabase";
import { api } from "./lib/api";

// ─── MODALIDADES ─────────────────────────────────────────────────────────────
const MODALIDADES = [
  "Atletismo","Natação","Ginástica Artística","Ginástica Rítmica","Futebol","Futebol Feminino",
  "Basquete","Vôlei","Vôlei de Praia","Handebol","Tênis","Tênis de Mesa","Badminton",
  "Boxe","Judô","Karatê","Taekwondo","Luta Livre","Luta Greco-Romana","Esgrima",
  "Tiro Esportivo","Tiro com Arco","Levantamento de Peso","Ciclismo de Estrada",
  "Ciclismo de Pista","Ciclismo BMX","Mountain Bike","Remo","Canoagem","Caiaque",
  "Vela","Hipismo","Pentatlo Moderno","Triatlo","Golfe","Rugby 7s","Surfe",
  "Skate Street","Skate Park","Escalada Esportiva","Breaking",
  "Atletismo Paralímpico","Natação Paralímpica","Basquete em Cadeira de Rodas",
  "Tênis em Cadeira de Rodas","Vôlei Sentado","Futebol de 5","Futebol de 7",
  "Bocha Paralímpica","Goalball","Tiro com Arco Paralímpico","Ciclismo Paralímpico",
  "Paracanoagem","Paratriátlo","Halterofilismo Paralímpico","Judô Paralímpico",
  "Esgrima em Cadeira de Rodas","Remo Paralímpico","Vela Paralímpica","Taekwondo Paralímpico",
  "Corrida de Rua","Beach Tennis","Padel","Futsal","Futebol Society","Futebol Amador",
  "Crossfit","Muay Thai","Jiu-Jitsu","MMA","Capoeira","Natação Master",
  "Ciclismo Amador","Triathlon Amador","Stand Up Paddle","Surf Amador",
  "Basquete 3x3","Frescobol","Peteca","Tênis Amador","Corrida de Montanha",
  "Trail Running","Ultra Maratona","Trekking","Escalada","Esportes Radicais",
  "Dança Esportiva","Cheerleading","Flag Football","Ultimate Frisbee","Pickleball",
  "Orientação","Pentatlo Rural","Rodeo","Pesca Esportiva","Xadrez Esportivo",
  "E-Sports","Cabo de Guerra","Arco e Flecha Recurvo","Arco e Flecha Composto",
];

const ROLES = [
  { key: "atleta",       icon: "🏃", label: "Atleta" },
  { key: "empresa",      icon: "🏢", label: "Empresa" },
  { key: "clube",        icon: "⚽", label: "Clube" },
  { key: "profissional", icon: "🩺", label: "Profissional" },
  { key: "midia",        icon: "📸", label: "Mídia" },
  { key: "apoiador",     icon: "💚", label: "Apoiador" },
];

const NAV_BY_ROLE = {
  atleta: [
    { key: "dashboard",    icon: "⊞", label: "Dashboard" },
    { key: "feed",         icon: "📋", label: "Feed" },
    { key: "athletes",     icon: "🏃", label: "Atletas" },
    { key: "sponsorships", icon: "🤝", label: "Patrocínios", badge: null },
    { key: "marketplace",  icon: "🩺", label: "Profissionais" },
    { key: "crowdfunding", icon: "💰", label: "Crowdfunding" },
    { key: "profile",      icon: "👤", label: "Meu Perfil" },
  ],
  empresa: [
    { key: "dashboard",    icon: "⊞", label: "Dashboard" },
    { key: "athletes",     icon: "🏃", label: "Buscar Atletas" },
    { key: "sponsorships", icon: "🤝", label: "Meus Patrocínios", badge: null },
    { key: "profile",      icon: "👤", label: "Perfil da Empresa" },
  ],
  clube: [
    { key: "dashboard",    icon: "⊞", label: "Dashboard" },
    { key: "feed",         icon: "📋", label: "Feed" },
    { key: "athletes",     icon: "🏃", label: "Atletas" },
    { key: "crowdfunding", icon: "💰", label: "Campanhas" },
    { key: "profile",      icon: "👤", label: "Perfil do Clube" },
  ],
  profissional: [
    { key: "dashboard",   icon: "⊞", label: "Dashboard" },
    { key: "feed",        icon: "📋", label: "Feed" },
    { key: "marketplace", icon: "🩺", label: "Meus Serviços" },
    { key: "athletes",    icon: "🏃", label: "Atletas" },
    { key: "profile",     icon: "👤", label: "Meu Perfil" },
  ],
  midia: [
    { key: "dashboard", icon: "⊞", label: "Dashboard" },
    { key: "feed",      icon: "📋", label: "Feed" },
    { key: "athletes",  icon: "🏃", label: "Atletas" },
    { key: "profile",   icon: "👤", label: "Meu Perfil" },
  ],
  apoiador: [
    { key: "dashboard",    icon: "⊞", label: "Dashboard" },
    { key: "feed",         icon: "📋", label: "Feed" },
    { key: "athletes",     icon: "🏃", label: "Atletas" },
    { key: "crowdfunding", icon: "💰", label: "Apoiar Atletas" },
    { key: "profile",      icon: "👤", label: "Meu Perfil" },
  ],
};

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --g:  #10B981; --g2: #059669; --g3: #D1FAE5; --g4: #6EE7B7;
    --grad: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
    --grad-warm: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
    --grad-purple: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
    --bk: #F1F5F9; --d1: #FFFFFF;
    --bd: #E2E8F0; --bd2: #CBD5E1;
    --tx: #0F172A; --mu: #94A3B8; --mu2: #64748B;
    --or: #F59E0B; --or2: #FEF3C7; --or3: #D97706;
    --bl: #3B82F6; --bl2: #DBEAFE; --bl3: #2563EB;
    --pu: #8B5CF6; --pu2: #EDE9FE; --pu3: #7C3AED;
    --rd: #EF4444; --rd2: #FEE2E2; --rd3: #DC2626;
    --pk: #EC4899; --pk2: #FCE7F3;
    --sb: #0F172A;
    --sb2: #1E293B;
    --sb3: #334155;
  }

  html, body { height: 100%; font-family: 'Inter', sans-serif; background: var(--bk); color: var(--tx); overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--bd2); border-radius: 10px; }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* ── SIDEBAR ── */
  .sidebar { width: 240px; flex-shrink: 0; background: var(--sb); display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden; }
  .sidebar-logo { padding: 24px 20px 20px; flex-shrink: 0; }
  .logo-wrap { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--grad); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(16,185,129,0.4); }
  .logo-icon-inner { width: 14px; height: 14px; border-radius: 50%; background: #fff; }
  .logo-text { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -0.3px; font-family: 'Space Grotesk', sans-serif; }
  .logo-text span { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .logo-tag { font-size: 9px; color: var(--sb3); letter-spacing: 1.2px; text-transform: uppercase; margin-top: 3px; font-weight: 600; }

  .sidebar-user { padding: 12px 16px; margin: 8px 12px; background: var(--sb2); border-radius: 12px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .user-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--grad); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: #fff; }
  .user-role { font-size: 10px; color: var(--g4); font-weight: 600; letter-spacing: 0.3px; margin-top: 1px; }

  .sidebar-nav { padding: 8px 12px; flex: 1; }
  .nav-section-label { font-size: 9px; color: var(--sb3); letter-spacing: 1.5px; text-transform: uppercase; padding: 12px 10px 6px; font-weight: 700; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s; font-size: 13px; font-weight: 500; color: #94A3B8; margin-bottom: 2px; border: none; background: none; width: 100%; text-align: left; }
  .nav-item:hover { background: var(--sb2); color: #CBD5E1; }
  .nav-item.active { background: linear-gradient(135deg, rgba(16,185,129,0.18), rgba(59,130,246,0.12)); color: var(--g4); font-weight: 600; border: 1px solid rgba(16,185,129,0.2); }
  .nav-item .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-item .nav-badge { margin-left: auto; background: var(--grad); color: #fff; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 100px; }
  .sidebar-bottom { padding: 12px; border-top: 1px solid var(--sb2); flex-shrink: 0; }

  /* ── TOPBAR ── */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 60px; flex-shrink: 0; background: var(--d1); border-bottom: 1px solid var(--bd); display: flex; align-items: center; padding: 0 28px; gap: 12px; }
  .topbar-title { font-size: 16px; font-weight: 700; color: var(--tx); flex: 1; letter-spacing: -0.3px; font-family: 'Space Grotesk', sans-serif; }
  .topbar-search { display: flex; align-items: center; gap: 8px; background: var(--bk); border: 1.5px solid var(--bd); border-radius: 10px; padding: 8px 14px; width: 260px; transition: all 0.15s; }
  .topbar-search:focus-within { border-color: var(--g); box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
  .topbar-search input { background: none; border: none; outline: none; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--tx); width: 100%; }
  .topbar-search input::placeholder { color: var(--mu); }
  .topbar-btn { width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid var(--bd); background: var(--d1); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; transition: all 0.15s; color: var(--mu2); }
  .topbar-btn:hover { border-color: var(--g); color: var(--g); background: var(--g3); box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
  .content { flex: 1; overflow-y: auto; padding: 28px; background: var(--bk); }

  /* ── CARDS ── */
  .card { background: var(--d1); border: 1.5px solid var(--bd); border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(15,23,42,0.04); }
  .card-header { padding: 18px 22px; border-bottom: 1px solid var(--bd); display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-size: 14px; font-weight: 700; color: var(--tx); display: flex; align-items: center; gap: 7px; font-family: 'Space Grotesk', sans-serif; }
  .card-body { padding: 22px; }

  /* ── STAT CARDS ── */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
  .stat-card { border-radius: 16px; padding: 22px; transition: all 0.2s; border: none; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; border-radius: 50%; opacity: 0.15; }
  .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.12); }
  .stat-card.green { background: linear-gradient(135deg, #ECFDF5, #D1FAE5); }
  .stat-card.green::before { background: #10B981; }
  .stat-card.blue { background: linear-gradient(135deg, #EFF6FF, #DBEAFE); }
  .stat-card.blue::before { background: #3B82F6; }
  .stat-card.orange { background: linear-gradient(135deg, #FFFBEB, #FEF3C7); }
  .stat-card.orange::before { background: #F59E0B; }
  .stat-card.purple { background: linear-gradient(135deg, #F5F3FF, #EDE9FE); }
  .stat-card.purple::before { background: #8B5CF6; }
  .stat-card.yellow { background: linear-gradient(135deg, #FFFBEB, #FEF3C7); }
  .stat-card.yellow::before { background: #F59E0B; }
  .stat-icon-wrap { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 20px; }
  .stat-icon-wrap.green { background: rgba(16,185,129,0.2); }
  .stat-icon-wrap.blue { background: rgba(59,130,246,0.2); }
  .stat-icon-wrap.orange { background: rgba(245,158,11,0.2); }
  .stat-icon-wrap.purple { background: rgba(139,92,246,0.2); }
  .stat-icon { font-size: 20px; display: block; }
  .stat-value { font-size: 30px; font-weight: 800; line-height: 1; margin-bottom: 5px; letter-spacing: -1px; font-family: 'Space Grotesk', sans-serif; }
  .stat-card.green .stat-value { color: #065F46; }
  .stat-card.blue .stat-value { color: #1D4ED8; }
  .stat-card.orange .stat-value, .stat-card.yellow .stat-value { color: #92400E; }
  .stat-card.purple .stat-value { color: #4C1D95; }
  .stat-label { font-size: 12px; color: var(--mu2); font-weight: 500; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 16px; }

  /* ── ATHLETE CARDS ── */
  .athlete-card { background: var(--d1); border: 1.5px solid var(--bd); border-radius: 16px; padding: 22px; transition: all 0.2s; cursor: pointer; box-shadow: 0 1px 4px rgba(15,23,42,0.04); }
  .athlete-card:hover { border-color: var(--g); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(16,185,129,0.12); }
  .athlete-avatar-wrap { position: relative; width: fit-content; margin-bottom: 16px; }
  .athlete-avatar { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #D1FAE5, #DBEAFE); border: 2px solid var(--g4); display: flex; align-items: center; justify-content: center; font-size: 28px; }
  .athlete-sport-badge { position: absolute; bottom: -6px; right: -10px; background: var(--sb); border-radius: 100px; padding: 3px 8px; font-size: 8px; font-weight: 700; color: var(--g4); text-transform: uppercase; letter-spacing: 0.8px; white-space: nowrap; }
  .athlete-name { font-size: 15px; font-weight: 700; color: var(--tx); margin-bottom: 2px; font-family: 'Space Grotesk', sans-serif; }
  .athlete-location { font-size: 12px; color: var(--mu2); margin-bottom: 14px; }
  .athlete-metrics { display: flex; gap: 20px; }
  .metric-val { font-size: 18px; font-weight: 700; color: var(--tx); letter-spacing: -0.5px; font-family: 'Space Grotesk', sans-serif; }
  .metric-label { font-size: 10px; color: var(--mu); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px; font-weight: 600; }

  /* ── BUTTONS ── */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; border: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: -0.1px; }
  .btn-primary { background: var(--grad); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,0.35); }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(16,185,129,0.4); filter: brightness(1.05); }
  .btn-ghost { background: transparent; color: var(--mu2); border: 1.5px solid var(--bd); }
  .btn-ghost:hover { border-color: var(--g); color: var(--g2); background: var(--g3); }
  .btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 8px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  /* ── BADGES ── */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; }
  .badge-green { background: var(--g3); color: var(--g2); }
  .badge-orange { background: var(--or2); color: var(--or3); }
  .badge-blue { background: var(--bl2); color: var(--bl3); }
  .badge-yellow { background: var(--or2); color: var(--or3); }
  .badge-purple { background: var(--pu2); color: var(--pu3); }
  .badge-red { background: var(--rd2); color: var(--rd3); }
  .badge-muted { background: var(--bk); color: var(--mu2); border: 1px solid var(--bd); }

  /* ── TABLE ── */
  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; padding: 12px 18px; font-size: 10px; color: var(--mu); text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 1px solid var(--bd); background: var(--bk); font-weight: 700; }
  .table td { padding: 14px 18px; font-size: 13px; color: var(--tx); border-bottom: 1px solid var(--bd); vertical-align: middle; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: #FAFCFF; }

  /* ── FEED ── */
  .feed-post { background: var(--d1); border: 1.5px solid var(--bd); border-radius: 16px; padding: 20px; margin-bottom: 12px; transition: all 0.2s; box-shadow: 0 1px 4px rgba(15,23,42,0.04); }
  .feed-post:hover { border-color: var(--g4); box-shadow: 0 8px 24px rgba(16,185,129,0.08); }
  .post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .post-avatar { width: 44px; height: 44px; border-radius: 14px; background: var(--grad); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .post-author { font-weight: 700; font-size: 14px; color: var(--tx); font-family: 'Space Grotesk', sans-serif; }
  .post-meta { font-size: 11px; color: var(--mu2); display: flex; align-items: center; gap: 7px; margin-top: 2px; }
  .post-content { font-size: 14px; line-height: 1.7; color: var(--mu2); margin-bottom: 14px; }
  .post-actions { display: flex; gap: 6px; }
  .post-action { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--mu); cursor: pointer; background: var(--bk); border: 1px solid var(--bd); border-radius: 8px; padding: 6px 12px; transition: all 0.15s; font-family: 'Inter', sans-serif; font-weight: 500; }
  .post-action:hover { background: var(--g3); border-color: var(--g4); color: var(--g2); }

  /* ── PROGRESS ── */
  .progress-wrap { background: var(--bk); border-radius: 100px; height: 8px; overflow: hidden; border: 1px solid var(--bd); }
  .progress-bar { height: 100%; background: var(--grad); border-radius: 100px; transition: width 0.6s cubic-bezier(.4,0,.2,1); }

  /* ── CAMPAIGN & SERVICE CARDS ── */
  .campaign-card { background: var(--d1); border: 1.5px solid var(--bd); border-radius: 16px; padding: 22px; transition: all 0.2s; box-shadow: 0 1px 4px rgba(15,23,42,0.04); }
  .campaign-card:hover { border-color: var(--g); transform: translateY(-3px); box-shadow: 0 16px 40px rgba(16,185,129,0.12); }

  .service-card { background: var(--d1); border: 1.5px solid var(--bd); border-radius: 16px; padding: 22px; transition: all 0.2s; box-shadow: 0 1px 4px rgba(15,23,42,0.04); }
  .service-card:hover { border-color: var(--bl); transform: translateY(-3px); box-shadow: 0 16px 40px rgba(59,130,246,0.12); }
  .service-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #EFF6FF, #DBEAFE); display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
  .service-cat { font-size: 10px; color: var(--bl3); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .service-title { font-size: 15px; font-weight: 700; color: var(--tx); margin-bottom: 2px; font-family: 'Space Grotesk', sans-serif; }
  .service-provider { font-size: 12px; color: var(--mu2); margin-bottom: 14px; }
  .service-footer { display: flex; align-items: center; justify-content: space-between; }
  .service-price { font-size: 16px; color: var(--g2); font-weight: 800; letter-spacing: -0.5px; font-family: 'Space Grotesk', sans-serif; }

  /* ── FORMS ── */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 11px; font-weight: 700; color: var(--mu2); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 7px; }
  .form-input, .form-select, .form-textarea { width: 100%; background: var(--bk); border: 1.5px solid var(--bd); border-radius: 10px; padding: 11px 14px; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--tx); outline: none; transition: all 0.15s; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--g); background: #fff; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
  .form-textarea { resize: vertical; min-height: 84px; }
  .form-select { cursor: pointer; }

  /* ── MODAL ── */
  .modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: var(--d1); border: 1.5px solid var(--bd); border-radius: 20px; width: 100%; max-width: 500px; max-height: 82vh; overflow-y: auto; animation: slideUp 0.25s cubic-bezier(.4,0,.2,1); box-shadow: 0 24px 80px rgba(15,23,42,0.2); }
  @keyframes slideUp { from { opacity:0; transform: translateY(24px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }
  .modal-header { padding: 22px 26px 18px; border-bottom: 1px solid var(--bd); display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-size: 16px; font-weight: 700; color: var(--tx); font-family: 'Space Grotesk', sans-serif; }
  .modal-body { padding: 22px 26px; }
  .modal-footer { padding: 16px 26px; border-top: 1px solid var(--bd); display: flex; gap: 10px; justify-content: flex-end; }
  .modal-close { background: var(--bk); border: 1px solid var(--bd); color: var(--mu); font-size: 18px; cursor: pointer; transition: all 0.15s; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; line-height: 1; }
  .modal-close:hover { background: var(--rd2); border-color: var(--rd2); color: var(--rd3); }

  /* ── AUTH ── */
  .auth-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--sb); position: relative; overflow: hidden; }
  .auth-bg { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(139,92,246,0.1) 0%, transparent 50%); }
  .auth-glow { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%); }
  .auth-card { background: rgba(255,255,255,0.97); border: 1.5px solid rgba(255,255,255,0.2); border-radius: 24px; padding: 48px 44px; width: 440px; position: relative; z-index: 1; box-shadow: 0 24px 80px rgba(0,0,0,0.3); }
  .auth-logo-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .auth-logo-icon { width: 40px; height: 40px; border-radius: 12px; background: var(--grad); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(16,185,129,0.4); }
  .auth-logo-dot { width: 16px; height: 16px; border-radius: 50%; background: #fff; }
  .auth-logo { font-size: 22px; font-weight: 800; color: var(--tx); letter-spacing: -0.5px; font-family: 'Space Grotesk', sans-serif; }
  .auth-logo span { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .auth-subtitle { font-size: 13px; color: var(--mu2); margin-bottom: 36px; line-height: 1.6; }
  .auth-tabs { display: flex; gap: 4px; margin-bottom: 28px; background: var(--bk); border-radius: 12px; padding: 4px; border: 1.5px solid var(--bd); }
  .auth-tab { flex: 1; padding: 10px; border-radius: 9px; border: none; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: none; color: var(--mu2); }
  .auth-tab.active { background: var(--grad); color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }

  .role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
  .role-btn { padding: 13px 6px; border-radius: 12px; border: 1.5px solid var(--bd); background: var(--bk); cursor: pointer; text-align: center; transition: all 0.15s; font-family: 'Inter', sans-serif; }
  .role-btn:hover { border-color: var(--g4); background: var(--g3); }
  .role-btn.selected { border-color: var(--g); background: linear-gradient(135deg, #ECFDF5, #EFF6FF); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
  .role-btn .role-icon { font-size: 22px; display: block; margin-bottom: 5px; }
  .role-btn .role-name { font-size: 10px; font-weight: 700; color: var(--mu2); text-transform: uppercase; letter-spacing: 0.3px; }
  .role-btn.selected .role-name { color: var(--g2); }

  /* ── PROFILE ── */
  .profile-hero { background: linear-gradient(135deg, var(--sb) 0%, #1E293B 100%); border-radius: 20px; padding: 32px; margin-bottom: 20px; display: flex; gap: 24px; align-items: flex-start; position: relative; overflow: hidden; }
  .profile-hero::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%); }
  .profile-avatar-lg { width: 84px; height: 84px; border-radius: 20px; background: var(--grad); border: 3px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 40px; flex-shrink: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
  .profile-info { flex: 1; }
  .profile-name { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 8px; letter-spacing: -0.5px; font-family: 'Space Grotesk', sans-serif; }
  .profile-meta-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .profile-bio { font-size: 13px; color: #94A3B8; line-height: 1.7; max-width: 600px; margin-bottom: 18px; }
  .profile-socials { display: flex; gap: 8px; flex-wrap: wrap; }
  .social-chip { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 7px 13px; font-size: 12px; color: #CBD5E1; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .social-chip:hover { background: rgba(16,185,129,0.15); border-color: var(--g4); color: var(--g4); }
  .metrics-row { display: flex; gap: 32px; }
  .metric-big { text-align: center; }
  .metric-big-val { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -1px; font-family: 'Space Grotesk', sans-serif; }
  .metric-big-label { font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 3px; }

  /* ── TOAST ── */
  .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: var(--sb); border: 1px solid var(--sb3); border-radius: 14px; padding: 14px 20px; display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; color: #fff; box-shadow: 0 16px 48px rgba(15,23,42,0.3); animation: slideUp 0.3s cubic-bezier(.4,0,.2,1); max-width: 340px; }
  .toast-icon { font-size: 18px; }

  /* ── EMPTY STATES ── */
  .empty-state { text-align: center; padding: 64px 24px; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.35; }
  .empty-title { font-size: 16px; font-weight: 700; color: var(--mu2); margin-bottom: 6px; font-family: 'Space Grotesk', sans-serif; }
  .empty-text { font-size: 13px; color: var(--mu); line-height: 1.65; }

  /* ── LOADING ── */
  .loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--sb); flex-direction: column; gap: 16px; }
  .loading-spinner { width: 40px; height: 40px; border: 3px solid rgba(16,185,129,0.2); border-top-color: var(--g); border-radius: 50%; animation: spin 0.75s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── UTILITIES ── */
  .row { display: flex; align-items: center; gap: 12px; }
  .row-between { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .col { display: flex; flex-direction: column; }
  .mt-4{margin-top:4px}.mt-8{margin-top:8px}.mt-16{margin-top:16px}.mt-24{margin-top:24px}
  .mb-4{margin-bottom:4px}.mb-8{margin-bottom:8px}.mb-16{margin-bottom:16px}.mb-24{margin-bottom:24px}
  .text-muted{color:var(--mu2)}.text-green{color:var(--g2)}.text-sm{font-size:12px}.text-xs{font-size:11px}
  .font-bold{font-weight:700}
  .section-title{font-size:20px;font-weight:800;color:var(--tx);margin-bottom:4px;letter-spacing:-0.5px;font-family:'Space Grotesk',sans-serif}
  .section-sub{font-size:13px;color:var(--mu2)}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function initials(name) {
  return (name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

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

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('atleta');
  const [sport, setSport] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!email || !pass) { setErr('Preencha e-mail e senha.'); return; }
    setLoading(true); setErr('');
    try {
      if (tab === 'login') {
        const { data, error } = await api.signIn(email, pass);
        if (error) throw new Error(error.message);
        const { data: profile } = await api.getProfile(data.user.id);
        onLogin(data.user, profile || { id: data.user.id, role: 'atleta', name: email.split('@')[0] });
      } else {
        if (!name) { setErr('Preencha seu nome.'); setLoading(false); return; }
        const { data, error } = await api.signUp(email, pass);
        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('Verifique seu e-mail para confirmar o cadastro.');
        const newProfile = { id: data.user.id, role, name, sport: sport || '', avatar: '🏅' };
        await api.createProfile(newProfile);
        onLogin(data.user, newProfile);
      }
    } catch (e) {
      setErr(e.message || 'Erro inesperado. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon"><div className="auth-logo-dot" /></div>
          <div className="auth-logo">Conecta<span>Atleta</span></div>
        </div>
        <div className="auth-subtitle">O ecossistema do atleta amador brasileiro</div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Entrar</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Cadastrar</button>
        </div>

        {tab === 'signup' && (
          <>
            <div className="form-group">
              <label className="form-label">Tipo de Conta</label>
              <div className="role-grid">
                {ROLES.map(r => (
                  <button key={r.key} className={`role-btn ${role === r.key ? 'selected' : ''}`} onClick={() => setRole(r.key)}>
                    <span className="role-icon">{r.icon}</span>
                    <span className="role-name">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                {role === 'empresa' ? 'Nome da Empresa' : role === 'clube' ? 'Nome do Clube' : 'Nome Completo'}
              </label>
              <input className="form-input"
                placeholder={role === 'empresa' ? 'Razão social ou nome fantasia' : role === 'clube' ? 'Nome do clube' : 'Seu nome completo'}
                value={name} onChange={e => setName(e.target.value)} />
            </div>
            {(role === 'atleta' || role === 'profissional' || role === 'clube') && (
              <div className="form-group">
                <label className="form-label">{role === 'atleta' ? 'Modalidade Principal' : role === 'profissional' ? 'Área de Atuação' : 'Modalidade do Clube'}</label>
                <select className="form-select" value={sport} onChange={e => setSport(e.target.value)}>
                  <option value="">Selecione...</option>
                  {role === 'profissional'
                    ? ['Nutrição Esportiva','Fisioterapia Esportiva','Psicologia do Esporte','Preparação Física','Medicina Esportiva','Coaching Esportivo','Fotografia Esportiva','Gestão de Carreira','Marketing Esportivo'].map(a => <option key={a} value={a}>{a}</option>)
                    : MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)
                  }
                </select>
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
          <input className="form-input" type="password" placeholder="••••••••" value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        {err && <div style={{ color: 'var(--rd)', fontSize: 12, marginBottom: 12 }}>{err}</div>}

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? 'Carregando...' : tab === 'login' ? 'Entrar na Plataforma →' : 'Criar Conta →'}
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function DashboardAtleta({ profile, sponsorships, campaigns }) {
  const mySpons = sponsorships.filter(s => s.athlete_id === profile.id);
  const active = mySpons.filter(s => s.status === 'active').length;
  const myRaised = campaigns.filter(c => c.athlete_id === profile.id).reduce((sum, c) => sum + (c.raised || 0), 0);

  return (
    <div className="stat-grid">
      <div className="stat-card green">
        <div className="stat-icon-wrap green"><span className="stat-icon">👥</span></div>
        <div className="stat-value">{(profile.followers || 0).toLocaleString()}</div>
        <div className="stat-label">Seguidores</div>
        <div className="stat-change">Perfil público</div>
      </div>
      <div className="stat-card blue">
        <div className="stat-icon-wrap blue"><span className="stat-icon">📊</span></div>
        <div className="stat-value">{profile.engagement || 0}%</div>
        <div className="stat-label">Taxa de engajamento</div>
      </div>
      <div className="stat-card orange">
        <div className="stat-icon-wrap orange"><span className="stat-icon">🤝</span></div>
        <div className="stat-value">{active}</div>
        <div className="stat-label">Patrocínios ativos</div>
      </div>
      <div className="stat-card purple">
        <div className="stat-icon-wrap purple"><span className="stat-icon">💰</span></div>
        <div className="stat-value">R${(myRaised / 1000).toFixed(1)}K</div>
        <div className="stat-label">Captado crowdfunding</div>
      </div>
    </div>
  );
}

function DashboardEmpresa({ profile, sponsorships, athletes }) {
  const mySpons = sponsorships.filter(s => s.sponsor_id === profile.id);
  const active = mySpons.filter(s => s.status === 'active').length;
  const total = mySpons.reduce((sum, s) => sum + (s.value || 0), 0);
  const reach = mySpons.reduce((_, s) => {
    const a = athletes.find(at => at.id === s.athlete_id);
    return a ? a.followers || 0 : 0;
  }, 0);

  return (
    <div>
      <div className="mb-24">
        <h2 className="section-title">Olá, {profile.name?.split(' ')[0]} 👋</h2>
        <p className="text-muted text-sm">Painel de patrocínios e ROI da sua empresa.</p>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card green"><div className="stat-icon-wrap green"><span className="stat-icon">🤝</span></div><div className="stat-value">{active}</div><div className="stat-label">Atletas patrocinados</div></div>
        <div className="stat-card blue"><div className="stat-icon-wrap blue"><span className="stat-icon">📣</span></div><div className="stat-value">{reach >= 1000 ? `${(reach/1000).toFixed(0)}K` : reach}</div><div className="stat-label">Alcance estimado</div></div>
        <div className="stat-card orange"><div className="stat-icon-wrap orange"><span className="stat-icon">💰</span></div><div className="stat-value">R${total.toLocaleString()}</div><div className="stat-label">Investimento total/ano</div></div>
      </div>
      {mySpons.length > 0 && (
        <div className="card mt-16">
          <div className="card-header"><div className="card-title">🏆 Atletas que você patrocina</div><span className="badge badge-green">{active} ativos</span></div>
          <table className="table"><thead><tr><th>Atleta</th><th>Valor/ano</th><th>Status</th></tr></thead>
          <tbody>{mySpons.slice(0, 5).map(s => (
            <tr key={s.id}><td><div style={{ fontWeight: 600, fontSize: 13 }}>{s.athlete}</div></td>
            <td><span style={{ fontFamily: 'DM Mono', color: 'var(--g2)', fontSize: 13 }}>R${(s.value || 0).toLocaleString()}</span></td>
            <td><span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{s.status === 'active' ? 'Ativo' : 'Pendente'}</span></td></tr>
          ))}</tbody></table>
        </div>
      )}
    </div>
  );
}

function DashboardProfissional({ profile, services }) {
  const myServices = services.filter(s => s.provider_id === profile.id);
  const avgRating = myServices.length > 0 ? (myServices.reduce((sum, s) => sum + (s.rating || 5), 0) / myServices.length).toFixed(1) : '—';
  return (
    <div>
      <div className="mb-24">
        <h2 className="section-title">Olá, {profile.name?.split(' ')[0]} 👋</h2>
        <p className="text-muted text-sm">Área: <strong>{profile.sport || '—'}</strong> · Gerencie seus serviços.</p>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card green"><div className="stat-icon-wrap green"><span className="stat-icon">📦</span></div><div className="stat-value">{myServices.length}</div><div className="stat-label">Serviços cadastrados</div></div>
        <div className="stat-card blue"><div className="stat-icon-wrap blue"><span className="stat-icon">👥</span></div><div className="stat-value">{myServices.reduce((sum, s) => sum + (s.reviews || 0), 0)}</div><div className="stat-label">Avaliações recebidas</div></div>
        <div className="stat-card orange"><div className="stat-icon-wrap orange"><span className="stat-icon">⭐</span></div><div className="stat-value">{avgRating}</div><div className="stat-label">Avaliação média</div></div>
      </div>
    </div>
  );
}

function Dashboard({ profile, user, sponsorships, campaigns, posts, athletes, services }) {
  if (profile.role === 'empresa') return <DashboardEmpresa profile={profile} sponsorships={sponsorships} athletes={athletes} />;
  if (profile.role === 'profissional') return <DashboardProfissional profile={profile} services={services} />;

  const stats = {
    totalAthletes: athletes.length,
    activeSponsorships: sponsorships.filter(s => s.status === 'active').length,
    servicesCount: services.length,
    raised: campaigns.reduce((sum, c) => sum + (c.raised || 0), 0),
  };

  return (
    <div>
      <div className="mb-24">
        <h2 className="section-title">Olá, {profile.name?.split(' ')[0]} 👋</h2>
        <p className="text-muted text-sm">Aqui está o resumo do ecossistema.</p>
      </div>
      <DashboardAtleta profile={profile} sponsorships={sponsorships} campaigns={campaigns} />
      <div className="stat-grid mt-16">
        <div className="stat-card green"><div className="stat-icon-wrap green"><span className="stat-icon">🏃</span></div><div className="stat-value">{stats.totalAthletes.toLocaleString()}</div><div className="stat-label">Atletas na plataforma</div></div>
        <div className="stat-card orange"><div className="stat-icon-wrap blue"><span className="stat-icon">🤝</span></div><div className="stat-value">{stats.activeSponsorships}</div><div className="stat-label">Patrocínios ativos</div></div>
        <div className="stat-card blue"><div className="stat-icon-wrap orange"><span className="stat-icon">🩺</span></div><div className="stat-value">{stats.servicesCount}</div><div className="stat-label">Profissionais cadastrados</div></div>
        <div className="stat-card yellow"><div className="stat-icon-wrap purple"><span className="stat-icon">💰</span></div><div className="stat-value">R${(stats.raised / 1000).toFixed(0)}K</div><div className="stat-label">Captado via crowdfunding</div></div>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">📋 Feed Recente</div></div>
          <div className="card-body" style={{ padding: 16 }}>
            {posts.slice(0, 3).map(post => (
              <div key={post.id} className="feed-post" style={{ marginBottom: 8 }}>
                <div className="post-header">
                  <div className="post-avatar">{post.avatar}</div>
                  <div>
                    <div className="post-author">{post.author}</div>
                    <div className="post-meta"><span className="badge badge-muted">{post.sport}</span><span>{post.time}</span></div>
                  </div>
                </div>
                <div className="post-content" style={{ marginBottom: 0 }}>{post.content.substring(0, 100)}...</div>
              </div>
            ))}
            {posts.length === 0 && <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Nenhum post ainda</div></div>}
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <div className="card-header"><div className="card-title">🏆 Meus Patrocínios</div></div>
            <div className="card-body" style={{ padding: 0 }}>
              {sponsorships.filter(s => s.athlete_id === user?.id || s.sponsor_id === user?.id).length === 0 ? (
                <div className="empty-state" style={{ padding: 24 }}><div className="empty-text">Nenhum patrocínio ainda</div></div>
              ) : (
                <table className="table"><thead><tr><th>Parceiro</th><th>Valor/ano</th><th>Status</th></tr></thead>
                <tbody>{sponsorships.filter(s => s.athlete_id === user?.id || s.sponsor_id === user?.id).slice(0, 3).map(s => (
                  <tr key={s.id}>
                    <td><div style={{ fontWeight: 600, fontSize: 13 }}>{s.sponsor}</div><div style={{ fontSize: 11, color: 'var(--mu2)' }}>{s.title}</div></td>
                    <td><span className="text-mono text-green" style={{ fontSize: 13 }}>R${(s.value || 0).toLocaleString()}</span></td>
                    <td><span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{s.status === 'active' ? 'Ativo' : 'Pendente'}</span></td>
                  </tr>
                ))}</tbody></table>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">💰 Campanhas em Andamento</div></div>
            <div className="card-body" style={{ padding: 16 }}>
              {campaigns.slice(0, 3).map(c => {
                const pct = Math.min(100, Math.round(((c.raised || 0) / (c.goal || 1)) * 100));
                return (
                  <div key={c.id} style={{ marginBottom: 16 }}>
                    <div className="row-between mb-4">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{c.avatar}</span>
                        <div><div style={{ fontSize: 12, fontWeight: 600 }}>{c.title}</div><div style={{ fontSize: 10, color: 'var(--mu2)' }}>{c.athlete}</div></div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--g)', fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div className="progress-wrap"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
                    <div className="row-between mt-4">
                      <span style={{ fontSize: 10, color: 'var(--mu2)' }}>R${(c.raised || 0).toLocaleString()} de R${(c.goal || 0).toLocaleString()}</span>
                      <span style={{ fontSize: 10, color: 'var(--mu)' }}>até {c.deadline}</span>
                    </div>
                  </div>
                );
              })}
              {campaigns.length === 0 && <div className="empty-state" style={{ padding: 16 }}><div className="empty-text">Nenhuma campanha ativa</div></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ATHLETES PAGE ───────────────────────────────────────────────────────────

function AthletesPage({ athletes, onShowModal, following, onFollow, onUnfollow, currentUserId }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const sports = ['all', ...new Set(athletes.map(a => a.sport).filter(Boolean))].slice(0, 8);

  const filtered = athletes.filter(a =>
    (filter === 'all' || a.sport === filter) &&
    (a.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="row-between mb-24">
        <div>
          <div className="section-title">🏃‍♀️ Atletas</div>
          <div className="text-muted text-sm">{athletes.length} atletas na rede</div>
        </div>
      </div>

      <div className="row mb-16" style={{ flexWrap: 'wrap', gap: 8 }}>
        <input className="form-input" style={{ maxWidth: 260 }}
          placeholder="🔍  Buscar atleta..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {sports.map(s => (
            <button key={s} onClick={() => setFilter(s)} className="btn btn-ghost btn-sm"
              style={{ borderColor: filter === s ? 'var(--g)' : undefined, color: filter === s ? 'var(--g)' : undefined }}>
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏃</div>
          <div className="empty-title">Nenhum atleta encontrado</div>
          <div className="empty-text">Tente ajustar os filtros de busca.</div>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map(a => (
            <div key={a.id} className="athlete-card">
              <div className="athlete-avatar-wrap">
                <div className="athlete-avatar">{a.avatar || '🏅'}</div>
                {a.sport && <div className="athlete-sport-badge">{a.sport}</div>}
              </div>
              <div className="athlete-name">{a.name}</div>
              {a.location && <div className="athlete-location">📍 {a.location}</div>}
              <div className="athlete-metrics">
                <div className="metric">
                  <div className="metric-val">{(a.followers || 0) >= 1000 ? `${((a.followers || 0) / 1000).toFixed(1)}K` : (a.followers || 0)}</div>
                  <div className="metric-label">Seguidores</div>
                </div>
                <div className="metric">
                  <div className="metric-val" style={{ color: 'var(--g)' }}>{a.engagement || 0}%</div>
                  <div className="metric-label">Engajamento</div>
                </div>
              </div>
              <div className="row mt-16" style={{ gap: 8 }}>
                {currentUserId !== a.id && (
                  following?.includes(a.id)
                    ? <button className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--g)', color: 'var(--g)' }} onClick={() => onUnfollow(a.id)}>✓ Seguindo</button>
                    : <button className="btn btn-primary btn-sm" onClick={() => onFollow(a.id)}>+ Seguir</button>
                )}
                {currentUserId !== a.id && (
                  <button className="btn btn-ghost btn-sm" onClick={() => onShowModal('sponsorProposal', a)}>Patrocinar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SPONSORSHIPS PAGE ───────────────────────────────────────────────────────

function SponsorshipsPage({ sponsorships, userId, onShowModal }) {
  const mine = sponsorships.filter(s => s.athlete_id === userId || s.sponsor_id === userId);
  const statusColor = { active: 'badge-green', pending: 'badge-yellow', closed: 'badge-muted' };
  const statusLabel = { active: 'Ativo', pending: 'Pendente', closed: 'Encerrado' };

  return (
    <div>
      <div className="row-between mb-24">
        <div>
          <div className="section-title">🤝 Patrocínios</div>
          <div className="text-muted text-sm">Gerencie propostas e parcerias ativas</div>
        </div>
        <button className="btn btn-primary" onClick={() => onShowModal('newSponsorship')}>+ Nova Proposta</button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card green"><span className="stat-icon">✅</span><div className="stat-value">{mine.filter(s => s.status === 'active').length}</div><div className="stat-label">Ativos</div></div>
        <div className="stat-card yellow"><span className="stat-icon">⏳</span><div className="stat-value">{mine.filter(s => s.status === 'pending').length}</div><div className="stat-label">Pendentes</div></div>
        <div className="stat-card orange"><span className="stat-icon">💰</span><div className="stat-value">R${mine.reduce((a, s) => a + (s.value || 0), 0).toLocaleString()}</div><div className="stat-label">Volume total/ano</div></div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">📋 Meus Patrocínios</div></div>
        {mine.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🤝</div><div className="empty-title">Nenhum patrocínio ainda</div><div className="empty-text">Crie uma proposta para começar.</div></div>
        ) : (
          <table className="table">
            <thead><tr><th>Patrocínio</th><th>Atleta</th><th>Patrocinador</th><th>Valor/ano</th><th>Contrapartidas</th><th>Status</th></tr></thead>
            <tbody>
              {mine.map(s => (
                <tr key={s.id}>
                  <td><div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div></td>
                  <td><span style={{ fontSize: 13 }}>{s.athlete}</span></td>
                  <td><span style={{ fontSize: 13, color: 'var(--mu2)' }}>{s.sponsor}</span></td>
                  <td><span className="text-mono text-green" style={{ fontSize: 13 }}>R${(s.value || 0).toLocaleString()}</span></td>
                  <td><span style={{ fontSize: 12, color: 'var(--mu2)' }}>{s.contrapartidas}</span></td>
                  <td><span className={`badge ${statusColor[s.status] || 'badge-muted'}`}>{statusLabel[s.status] || s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card mt-24">
        <div className="card-header"><div className="card-title">⚡ Lei de Incentivo ao Esporte</div><span className="badge badge-yellow">Benefício Fiscal</span></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>O que é?</div>
              <p style={{ fontSize: 13, color: 'var(--mu2)', lineHeight: 1.7 }}>
                Empresas podem deduzir até <strong style={{ color: 'var(--g)' }}>6% do IR devido</strong> ao investir em projetos esportivos aprovados pelo Ministério do Esporte.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Como a plataforma ajuda?</div>
              <p style={{ fontSize: 13, color: 'var(--mu2)', lineHeight: 1.7 }}>
                Conectamos empresas a atletas com projetos aprovados e cuidamos da documentação e relatórios de contrapartida.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MARKETPLACE PAGE ────────────────────────────────────────────────────────

function MarketplacePage({ services, onShowModal }) {
  const [catFilter, setCatFilter] = useState('all');
  const cats = ['all', ...new Set(services.map(s => s.category).filter(Boolean))];
  const filtered = services.filter(s => catFilter === 'all' || s.category === catFilter);

  return (
    <div>
      <div className="row-between mb-24">
        <div>
          <div className="section-title">🩺 Profissionais do Esporte</div>
          <div className="text-muted text-sm">Encontre os melhores profissionais especializados</div>
        </div>
        <button className="btn btn-ghost" onClick={() => onShowModal('addService')}>+ Oferecer Serviço</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className="btn btn-ghost btn-sm"
            style={{ borderColor: catFilter === c ? 'var(--bl)' : undefined, color: catFilter === c ? 'var(--bl)' : undefined }}>
            {c === 'all' ? 'Todos' : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🩺</div><div className="empty-title">Nenhum serviço encontrado</div><div className="empty-text">Seja o primeiro a oferecer um serviço!</div></div>
      ) : (
        <div className="grid-3">
          {filtered.map(s => (
            <div key={s.id} className="service-card">
              <div className="service-icon">{s.avatar}</div>
              <div className="service-cat">{s.category}</div>
              <div className="service-title">{s.title}</div>
              <div className="service-provider">por {s.provider}</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16, alignItems: 'center' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ fontSize: 11, color: i < Math.floor(s.rating || 5) ? 'var(--yl)' : 'var(--mu)' }}>★</span>
                ))}
                <span style={{ fontSize: 11, color: 'var(--mu2)', marginLeft: 4 }}>{s.rating} ({s.reviews} av.)</span>
              </div>
              <div className="service-footer">
                <div className="service-price">R$ {(s.price || 0).toLocaleString()}</div>
                <button className="btn btn-primary btn-sm" onClick={() => onShowModal('bookService', s)}>Contratar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CROWDFUNDING PAGE ───────────────────────────────────────────────────────

function CrowdfundingPage({ campaigns, onShowModal }) {
  const totalRaised = campaigns.reduce((sum, c) => sum + (c.raised || 0), 0);

  return (
    <div>
      <div className="row-between mb-24">
        <div>
          <div className="section-title">💰 Crowdfunding Esportivo</div>
          <div className="text-muted text-sm">Apoie atletas ou crie sua própria campanha</div>
        </div>
        <button className="btn btn-primary" onClick={() => onShowModal('newCampaign')}>+ Nova Campanha</button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card green"><span className="stat-icon">🎯</span><div className="stat-value">{campaigns.length}</div><div className="stat-label">Campanhas ativas</div></div>
        <div className="stat-card yellow"><span className="stat-icon">💰</span><div className="stat-value">R${(totalRaised / 1000).toFixed(1)}K</div><div className="stat-label">Captado total</div></div>
        <div className="stat-card blue"><span className="stat-icon">👥</span><div className="stat-value">{campaigns.length * 12}</div><div className="stat-label">Apoiadores estimados</div></div>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">💰</div><div className="empty-title">Nenhuma campanha ainda</div><div className="empty-text">Seja o primeiro a criar uma campanha!</div></div>
      ) : (
        <div className="grid-3">
          {campaigns.map(c => {
            const pct = Math.min(100, Math.round(((c.raised || 0) / (c.goal || 1)) * 100));
            return (
              <div key={c.id} className="campaign-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--g3)', border: '1.5px solid var(--g)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{c.avatar}</div>
                  <div><div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{c.title}</div><div style={{ fontSize: 11, color: 'var(--mu2)' }}>{c.athlete}</div></div>
                </div>
                <div className="row-between mb-4">
                  <span style={{ fontSize: 12, color: 'var(--mu2)' }}>Progresso</span>
                  <span style={{ fontSize: 13, color: 'var(--g)', fontWeight: 600 }}>{pct}%</span>
                </div>
                <div className="progress-wrap mb-8"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
                <div className="row-between mb-16">
                  <span style={{ fontSize: 12, fontWeight: 600 }}>R${(c.raised || 0).toLocaleString()}</span>
                  <span style={{ fontSize: 11, color: 'var(--mu2)' }}>meta: R${(c.goal || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--mu)' }}>⏰ até {c.deadline}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => onShowModal('donate', c)}>Apoiar R$</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── FEED PAGE ───────────────────────────────────────────────────────────────

function FeedPage({ profile, posts, onCreatePost, onToggleLike, following, onFollow, onUnfollow }) {
  const [liked, setLiked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`liked_${profile?.id}`) || '[]'); }
    catch { return []; }
  });
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  const handleToggle = (id) => {
    const isLiked = liked.includes(id);
    const next = isLiked ? liked.filter(x => x !== id) : [...liked, id];
    setLiked(next);
    localStorage.setItem(`liked_${profile?.id}`, JSON.stringify(next));
    const post = posts.find(p => p.id === id);
    if (post) onToggleLike(id, !isLiked, post.likes);
  };

  const handlePublish = async () => {
    if (!newPost.trim() || posting) return;
    setPosting(true);
    await onCreatePost(newPost.trim());
    setNewPost('');
    setPosting(false);
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="mb-24">
        <div className="section-title">📋 Feed da Comunidade</div>
        <div className="text-muted text-sm">Acompanhe treinos, conquistas e histórias</div>
      </div>

      <div className="card mb-16">
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="post-avatar">{profile.avatar || '🏅'}</div>
            <div style={{ flex: 1 }}>
              <textarea className="form-textarea" style={{ marginBottom: 12 }}
                placeholder="Compartilhe seu treino, conquista ou dica..."
                value={newPost} onChange={e => setNewPost(e.target.value)} rows={3} />
              <div className="row-between">
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn btn-ghost btn-sm">📷 Foto</button>
                  <button className="btn btn-ghost btn-sm">🎥 Vídeo</button>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handlePublish} disabled={posting || !newPost.trim()}>
                  {posting ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {posts.length === 0 && (
        <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">Feed vazio</div><div className="empty-text">Seja o primeiro a publicar!</div></div>
      )}

      {posts.map(post => (
        <div key={post.id} className="feed-post">
          <div className="post-header">
            <div className="post-avatar">{post.avatar}</div>
            <div style={{ flex: 1 }}>
              <div className="post-author">{post.author}</div>
              <div className="post-meta">
                {post.sport && <span className="badge badge-muted">{post.sport}</span>}
                <span>{post.time}</span>
              </div>
            </div>
            {post.author_id !== profile?.id && (
              following?.includes(post.author_id)
                ? <button className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--g)', color: 'var(--g)', flexShrink: 0 }} onClick={() => onUnfollow(post.author_id)}>✓ Seguindo</button>
                : <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={() => onFollow(post.author_id)}>+ Seguir</button>
            )}
          </div>
          <div className="post-content">{post.content}</div>
          <div className="post-actions">
            <button className="post-action" onClick={() => handleToggle(post.id)}
              style={{ color: liked.includes(post.id) ? 'var(--g)' : undefined }}>
              {liked.includes(post.id) ? '💚' : '🤍'} {(post.likes || 0) + (liked.includes(post.id) ? 0 : 0)}
            </button>
            <button className="post-action">💬 Comentar</button>
            <button className="post-action">↗ Compartilhar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PROFILE PAGE ────────────────────────────────────────────────────────────

function ProfilePage({ profile, onUpdateProfile }) {
  const [form, setForm] = useState({
    name: profile.name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    sport: profile.sport || '',
    instagram: profile.instagram || '',
    youtube: profile.youtube || '',
    strava: profile.strava || '',
    avatar: profile.avatar || '🏅',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdateProfile(form);
    setSaving(false);
  };

  return (
    <div>
      <div className="profile-hero">
        <div className="profile-avatar-lg">{profile.avatar || '🏅'}</div>
        <div className="profile-info">
          <div className="profile-name">{profile.name}</div>
          <div className="profile-meta-row">
            <span className="badge badge-green">{ROLES.find(r => r.key === profile.role)?.icon} {ROLES.find(r => r.key === profile.role)?.label}</span>
            {profile.sport && <span className="badge badge-muted">{profile.sport}</span>}
            {profile.location && <span style={{ fontSize: 12, color: 'var(--mu2)' }}>📍 {profile.location}</span>}
          </div>
          <div className="profile-bio">{profile.bio || 'Adicione uma bio ao seu perfil para se apresentar à rede.'}</div>
          <div className="profile-socials">
            {profile.instagram && <button className="social-chip">📸 {profile.instagram}</button>}
            {profile.youtube && <button className="social-chip">▶ {profile.youtube}</button>}
            {profile.strava && <button className="social-chip">🏃 {profile.strava}</button>}
          </div>
        </div>
        {profile.role === 'atleta' && (
          <div className="metrics-row">
            <div className="metric-big">
              <div className="metric-big-val">{((profile.followers || 0) / 1000).toFixed(1)}K</div>
              <div className="metric-big-label">Seguidores</div>
            </div>
            <div className="metric-big">
              <div className="metric-big-val">{profile.engagement || 0}%</div>
              <div className="metric-big-label">Engajamento</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">⚡ Editar Perfil</div></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">Localização</label>
              <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Cidade, Estado" />
            </div>
            <div className="form-group">
              <label className="form-label">Avatar (emoji)</label>
              <input className="form-input" value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} placeholder="🏅" maxLength={2} />
            </div>
            {(profile.role === 'atleta' || profile.role === 'profissional' || profile.role === 'clube') && (
              <div className="form-group">
                <label className="form-label">Modalidade</label>
                <select className="form-select" value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <div className="card-header"><div className="card-title">🔗 Redes Sociais</div></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input className="form-input" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@seu_perfil" />
              </div>
              <div className="form-group">
                <label className="form-label">YouTube</label>
                <input className="form-input" value={form.youtube} onChange={e => setForm(f => ({ ...f, youtube: e.target.value }))} placeholder="Canal YouTube" />
              </div>
              <div className="form-group">
                <label className="form-label">Strava</label>
                <input className="form-input" value={form.strava} onChange={e => setForm(f => ({ ...f, strava: e.target.value }))} placeholder="Usuário Strava" />
              </div>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Redes'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">📄 Mídia Kit</div><span className="badge badge-purple">IA</span></div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: 'var(--mu2)', lineHeight: 1.6, marginBottom: 16 }}>
                Gere automaticamente um mídia kit profissional com suas métricas consolidadas.
              </p>
              <button className="btn btn-primary">🤖 Gerar Mídia Kit com IA</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL CONTENT ───────────────────────────────────────────────────────────

function ModalContent({ type, data, athletes, onClose, onToast, onSave }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(type, form, data);
    setSaving(false);
    if (ok !== false) {
      onToast('✅ Salvo com sucesso!');
      onClose();
    }
  };

  const footer = (label = 'Confirmar') => (
    <>
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : label}
      </button>
    </>
  );

  if (type === 'sponsorProposal') return (
    <Modal title={`Proposta para ${data?.name}`} onClose={onClose} footer={footer('Enviar Proposta')}>
      <div className="form-group"><label className="form-label">Nome da Parceria</label><input className="form-input" placeholder="Ex: Patrocínio Temporada 2025" onChange={e => set('title', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Valor Anual (R$)</label><input className="form-input" type="number" placeholder="0,00" onChange={e => set('value', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Contrapartidas Desejadas</label><textarea className="form-textarea" placeholder="Posts mensais, logo no uniforme, presença em evento..." onChange={e => set('contrapartidas', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Duração</label><select className="form-select" onChange={e => set('duration', e.target.value)}><option>3 meses</option><option>6 meses</option><option>12 meses</option></select></div>
    </Modal>
  );

  if (type === 'newSponsorship') return (
    <Modal title="Nova Proposta de Patrocínio" onClose={onClose} footer={footer('Criar Proposta')}>
      <div className="form-group">
        <label className="form-label">Atleta</label>
        <select className="form-select" onChange={e => set('athlete_id', e.target.value)}>
          <option value="">Selecione um atleta...</option>
          {athletes.map(a => <option key={a.id} value={a.id}>{a.name} {a.sport ? `· ${a.sport}` : ''}</option>)}
        </select>
      </div>
      <div className="form-group"><label className="form-label">Título da Parceria</label><input className="form-input" placeholder="Nome da parceria" onChange={e => set('title', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Valor (R$/ano)</label><input className="form-input" type="number" onChange={e => set('value', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Contrapartidas</label><textarea className="form-textarea" onChange={e => set('contrapartidas', e.target.value)} /></div>
    </Modal>
  );

  if (type === 'newCampaign') return (
    <Modal title="Nova Campanha de Crowdfunding" onClose={onClose} footer={footer('Lançar Campanha')}>
      <div className="form-group"><label className="form-label">Título da Campanha</label><input className="form-input" placeholder="Ex: Ironman 70.3 Floripa 2025" onChange={e => set('title', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Descrição</label><textarea className="form-textarea" placeholder="Conte sua história e por que precisa deste apoio..." onChange={e => set('description', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Meta (R$)</label><input className="form-input" type="number" onChange={e => set('goal', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Prazo</label><input className="form-input" type="date" onChange={e => set('deadline', e.target.value)} /></div>
    </Modal>
  );

  if (type === 'donate') return (
    <Modal title={`Apoiar: ${data?.title}`} onClose={onClose} footer={footer('Confirmar Apoio 💚')}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{data?.avatar}</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{data?.title}</div>
        <div style={{ fontSize: 12, color: 'var(--mu2)' }}>{data?.athlete}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Valor do Apoio (R$)</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[20, 50, 100, 200].map(v => (
            <button key={v} className={`btn btn-sm ${form.amount === v ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1 }} onClick={() => set('amount', v)}>R${v}</button>
          ))}
        </div>
        <input className="form-input" type="number" placeholder="Outro valor..." onChange={e => set('amount', Number(e.target.value))} value={form.amount || ''} />
      </div>
      <div className="form-group"><label className="form-label">Mensagem (opcional)</label><input className="form-input" placeholder="Mande força para o atleta!" onChange={e => set('msg', e.target.value)} /></div>
    </Modal>
  );

  if (type === 'bookService') return (
    <Modal title={`Contratar: ${data?.title}`} onClose={onClose} footer={footer('Solicitar Agendamento')}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, background: 'var(--bk)', borderRadius: 10, padding: 16 }}>
        <span style={{ fontSize: 32 }}>{data?.avatar}</span>
        <div>
          <div style={{ fontWeight: 700 }}>{data?.title}</div>
          <div style={{ fontSize: 12, color: 'var(--mu2)' }}>{data?.provider}</div>
          <div style={{ fontSize: 14, color: 'var(--g)', marginTop: 4 }}>R${(data?.price || 0).toLocaleString()}</div>
        </div>
      </div>
      <div className="form-group"><label className="form-label">Data Preferida</label><input className="form-input" type="date" onChange={e => set('date', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Observações</label><textarea className="form-textarea" placeholder="Conte um pouco sobre seu objetivo..." onChange={e => set('obs', e.target.value)} /></div>
    </Modal>
  );

  if (type === 'addService') return (
    <Modal title="Oferecer Serviço" onClose={onClose} footer={footer('Publicar Serviço')}>
      <div className="form-group">
        <label className="form-label">Categoria</label>
        <select className="form-select" onChange={e => set('category', e.target.value)}>
          <option value="">Selecione...</option>
          {['Nutrição','Fisioterapia','Psicologia','Fotografia','Coaching','Preparação','Medicina','Marketing','Agenciamento'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-group"><label className="form-label">Título do Serviço</label><input className="form-input" placeholder="Ex: Consulta Nutricional Esportiva" onChange={e => set('title', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Descrição</label><textarea className="form-textarea" onChange={e => set('description', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Valor (R$)</label><input className="form-input" type="number" onChange={e => set('price', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Avatar (emoji)</label><input className="form-input" placeholder="🩺" maxLength={2} onChange={e => set('avatar', e.target.value)} /></div>
    </Modal>
  );

  return null;
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  // Data
  const [posts, setPosts] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [services, setServices] = useState([]);
  const [following, setFollowing] = useState([]);

  // ── Session management ────────────────────────────────────────────────────
  useEffect(() => {
    api.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        api.getProfile(session.user.id).then(({ data }) => {
          if (data) setProfile(data);
        });
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { setUser(null); setProfile(null); clearData(); }
      if (event === 'SIGNED_IN' && session?.user) setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load all data after login ─────────────────────────────────────────────
  useEffect(() => {
    if (user) loadAllData();
  }, [user]);

  async function loadAllData() {
    const [p, a, s, c, sv, fw] = await Promise.all([
      api.getFeedPosts(),
      api.getAthletes(),
      api.getSponsorships(),
      api.getCampaigns(),
      api.getServices(),
      api.getFollowing(user.id),
    ]);
    setPosts(p.data || []);
    setAthletes(a.data || []);
    setSponsorships(s.data || []);
    setCampaigns(c.data || []);
    setServices(sv.data || []);
    setFollowing(fw.data || []);
  }

  function clearData() {
    setPosts([]); setAthletes([]); setSponsorships([]); setCampaigns([]); setServices([]); setFollowing([]);
  }

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = (u, p) => { setUser(u); setProfile(p); };
  const handleLogout = async () => { await api.signOut(); };

  // ── Data mutation handlers ─────────────────────────────────────────────────
  const handleCreatePost = async (content) => {
    if (!user) return;
    const { data } = await api.createPost(user.id, content);
    if (data) setPosts(prev => [data, ...prev]);
  };

  const handleToggleLike = async (postId, increment, currentLikes) => {
    const newLikes = Math.max(0, (currentLikes || 0) + (increment ? 1 : -1));
    await api.updatePostLikes(postId, newLikes);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
  };

  const handleFollow = async (targetId) => {
    if (!user) return;
    setFollowing(prev => [...prev, targetId]);
    setAthletes(prev => prev.map(a => a.id === targetId ? { ...a, followers: (a.followers || 0) + 1 } : a));
    await api.followUser(user.id, targetId);
  };

  const handleUnfollow = async (targetId) => {
    if (!user) return;
    setFollowing(prev => prev.filter(id => id !== targetId));
    setAthletes(prev => prev.map(a => a.id === targetId ? { ...a, followers: Math.max(0, (a.followers || 0) - 1) } : a));
    await api.unfollowUser(user.id, targetId);
  };

  const handleUpdateProfile = async (updates) => {
    if (!user) return;
    const { data } = await api.updateProfile(user.id, updates);
    if (data) {
      setProfile(data);
      // Refresh athlete list if user is an athlete
      if (data.role === 'atleta') {
        setAthletes(prev => prev.map(a => a.id === user.id ? { ...a, ...data } : a));
      }
      showToast('✅ Perfil atualizado!');
    }
  };

  const handleModalSave = async (type, form, data) => {
    try {
      if (type === 'sponsorProposal' && data?.id) {
        const { data: sp } = await api.createSponsorship({
          athlete_id: data.id, sponsor_id: user.id,
          title: form.title, value: Number(form.value) || 0,
          contrapartidas: form.contrapartidas, duration: form.duration,
          status: 'pending',
        });
        if (sp) setSponsorships(prev => [sp, ...prev]);
      }

      if (type === 'newSponsorship') {
        const { data: sp } = await api.createSponsorship({
          athlete_id: form.athlete_id || null, sponsor_id: user.id,
          title: form.title, value: Number(form.value) || 0,
          contrapartidas: form.contrapartidas, status: 'pending',
        });
        if (sp) setSponsorships(prev => [sp, ...prev]);
      }

      if (type === 'newCampaign') {
        const { data: camp } = await api.createCampaign({
          athlete_id: user.id, title: form.title,
          description: form.description, goal: Number(form.goal) || 0,
          deadline: form.deadline, raised: 0,
        });
        if (camp) setCampaigns(prev => [camp, ...prev]);
      }

      if (type === 'donate' && data?.id) {
        const amount = Number(form.amount) || 0;
        if (amount <= 0) return false;
        const { newRaised } = await api.donate(data.id, amount);
        setCampaigns(prev => prev.map(c => c.id === data.id ? { ...c, raised: newRaised } : c));
      }

      if (type === 'addService') {
        const { data: svc } = await api.createService({
          provider_id: user.id, category: form.category,
          title: form.title, description: form.description,
          price: Number(form.price) || 0,
          avatar: form.avatar || '🩺', rating: 5.0, reviews: 0,
        });
        if (svc) setServices(prev => [...prev, svc]);
      }

      if (type === 'bookService' && data?.id) {
        await api.createBooking({
          service_id: data.id, client_id: user.id,
          preferred_date: form.date, notes: form.obs,
        });
      }

      return true;
    } catch (e) {
      console.error('handleModalSave:', e);
      showToast('❌ Erro ao salvar. Tente novamente.');
      return false;
    }
  };

  const showModal = useCallback((type, data) => setModal({ type, data }), []);
  const showToast = useCallback((msg) => setToast(msg), []);

  // ── Render ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <div style={{ fontSize: 13, color: '#64748B' }}>Carregando...</div>
        </div>
      </>
    );
  }

  if (!user || !profile) {
    return (
      <>
        <style>{styles}</style>
        <AuthScreen onLogin={handleLogin} />
      </>
    );
  }

  const roleNav = NAV_BY_ROLE[profile.role] || NAV_BY_ROLE.atleta;
  const pageTitle = roleNav.find(n => n.key === page)?.label || 'Dashboard';
  const pendingSpons = sponsorships.filter(s =>
    (s.athlete_id === user.id || s.sponsor_id === user.id) && s.status === 'pending'
  ).length;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-wrap">
              <div className="logo-icon"><div className="logo-icon-inner" /></div>
              <div>
                <div className="logo-text">Conecta<span>Atleta</span></div>
                <div className="logo-tag">Ecossistema Esportivo</div>
              </div>
            </div>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">{initials(profile.name)}</div>
            <div>
              <div className="user-name">{profile.name?.split(' ')[0] || 'Usuário'}</div>
              <div className="user-role">{ROLES.find(r => r.key === profile.role)?.label || 'Atleta'}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Menu</div>
            {roleNav.map(item => (
              <button key={item.key}
                className={`nav-item ${page === item.key ? 'active' : ''}`}
                onClick={() => setPage(item.key)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.key === 'sponsorships' && pendingSpons > 0 && (
                  <span className="nav-badge">{pendingSpons}</span>
                )}
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
              <span style={{ color: 'var(--mu)', fontSize: 14 }}>🔍</span>
              <input placeholder="Buscar atletas, serviços..." />
            </div>
            <button className="topbar-btn" title="Notificações">🔔</button>
            <button className="topbar-btn" title="Config" onClick={() => setPage('profile')}>⚙</button>
          </div>

          <div className="content">
            {page === 'dashboard' && (
              <Dashboard
                profile={profile} user={user}
                sponsorships={sponsorships} campaigns={campaigns}
                posts={posts} athletes={athletes} services={services}
              />
            )}
            {page === 'feed' && (
              <FeedPage
                profile={profile} posts={posts}
                onCreatePost={handleCreatePost}
                onToggleLike={handleToggleLike}
                following={following} onFollow={handleFollow} onUnfollow={handleUnfollow}
              />
            )}
            {page === 'athletes' && (
              <AthletesPage
                athletes={athletes} onShowModal={showModal}
                following={following} onFollow={handleFollow} onUnfollow={handleUnfollow}
                currentUserId={user.id}
              />
            )}
            {page === 'sponsorships' && (
              <SponsorshipsPage sponsorships={sponsorships} userId={user.id} onShowModal={showModal} />
            )}
            {page === 'marketplace' && (
              <MarketplacePage services={services} onShowModal={showModal} />
            )}
            {page === 'crowdfunding' && (
              <CrowdfundingPage campaigns={campaigns} onShowModal={showModal} />
            )}
            {page === 'profile' && (
              <ProfilePage profile={profile} onUpdateProfile={handleUpdateProfile} />
            )}
          </div>
        </main>
      </div>

      {modal && (
        <ModalContent
          type={modal.type}
          data={modal.data}
          athletes={athletes}
          onClose={() => setModal(null)}
          onToast={showToast}
          onSave={handleModalSave}
        />
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
