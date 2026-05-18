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
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --g: #1D9E75; --g2: #0F6E56; --g3: #E1F5EE; --g4: #9FE1CB;
    --bk: #F7F9FC; --d1: #FFFFFF; --d2: #FFFFFF; --d3: #F0F4F8;
    --bd: #E8ECF2; --tx: #0F1923; --mu: #9BA8B5; --mu2: #6B7A8D;
    --or: #E86B1D; --or2: #FEF0E6; --bl: #378ADD; --bl2: #E6F1FB;
    --yl: #BA7517; --yl2: #FAEEDA; --pu: #534AB7; --pu2: #EEEDFE;
    --rd: #A32D2D; --rd2: #FCEBEB;
  }

  html, body { height: 100%; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bk); color: var(--tx); overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bk); }
  ::-webkit-scrollbar-thumb { background: var(--g4); border-radius: 4px; }

  .app { display: flex; height: 100vh; overflow: hidden; }

  .sidebar { width: 236px; flex-shrink: 0; background: var(--d1); border-right: 1px solid var(--bd); display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden; }
  .sidebar-logo { padding: 22px 20px 18px; border-bottom: 1px solid var(--bd); flex-shrink: 0; }
  .logo-wrap { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 34px; height: 34px; border-radius: 9px; background: var(--g); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .logo-icon-inner { width: 16px; height: 16px; border-radius: 50%; background: #fff; }
  .logo-text { font-size: 15px; font-weight: 700; color: var(--tx); letter-spacing: -0.3px; }
  .logo-text span { color: var(--g); }
  .logo-tag { font-size: 9px; color: var(--mu); letter-spacing: 1px; text-transform: uppercase; margin-top: 3px; font-family: 'DM Mono', monospace; }

  .sidebar-user { padding: 14px 20px; border-bottom: 1px solid var(--bd); display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--g3); border: 2px solid var(--g4); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--g2); flex-shrink: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--tx); }
  .user-role { font-size: 10px; color: var(--g); font-weight: 600; letter-spacing: 0.3px; margin-top: 1px; }

  .sidebar-nav { padding: 14px 10px; flex: 1; }
  .nav-section-label { font-size: 9px; color: var(--mu); letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px 6px; font-family: 'DM Mono', monospace; }
  .nav-item { display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: 8px; cursor: pointer; transition: all 0.15s; font-size: 13px; font-weight: 500; color: var(--mu2); margin-bottom: 1px; border: none; background: none; width: 100%; text-align: left; }
  .nav-item:hover { background: var(--bk); color: var(--tx); }
  .nav-item.active { background: var(--g3); color: var(--g2); font-weight: 600; }
  .nav-item .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; color: inherit; }
  .nav-item .nav-badge { margin-left: auto; background: var(--g); color: #fff; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 100px; font-family: 'DM Mono', monospace; }
  .sidebar-bottom { padding: 12px 10px; border-top: 1px solid var(--bd); flex-shrink: 0; }

  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 56px; flex-shrink: 0; background: var(--d1); border-bottom: 1px solid var(--bd); display: flex; align-items: center; padding: 0 28px; gap: 12px; }
  .topbar-title { font-size: 15px; font-weight: 700; color: var(--tx); flex: 1; letter-spacing: -0.2px; }
  .topbar-search { display: flex; align-items: center; gap: 8px; background: var(--bk); border: 1px solid var(--bd); border-radius: 8px; padding: 8px 14px; width: 240px; transition: border-color 0.15s; }
  .topbar-search:focus-within { border-color: var(--g4); }
  .topbar-search input { background: none; border: none; outline: none; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: var(--tx); width: 100%; }
  .topbar-search input::placeholder { color: var(--mu); }
  .topbar-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--bd); background: var(--d1); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; transition: all 0.15s; color: var(--mu2); }
  .topbar-btn:hover { border-color: var(--g4); color: var(--g); background: var(--g3); }
  .content { flex: 1; overflow-y: auto; padding: 28px; background: var(--bk); }

  .card { background: var(--d1); border: 1px solid var(--bd); border-radius: 12px; overflow: hidden; }
  .card-header { padding: 16px 20px; border-bottom: 1px solid var(--bd); display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-size: 13px; font-weight: 700; color: var(--tx); display: flex; align-items: center; gap: 7px; }
  .card-title-icon { color: var(--g); font-size: 15px; }
  .card-body { padding: 20px; }

  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .stat-card { background: var(--d1); border: 1px solid var(--bd); border-radius: 12px; padding: 20px; transition: all 0.2s; }
  .stat-card:hover { border-color: var(--g4); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(29,158,117,0.08); }
  .stat-icon-wrap { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; font-size: 18px; }
  .stat-icon-wrap.green { background: var(--g3); } .stat-icon-wrap.blue { background: var(--bl2); } .stat-icon-wrap.orange { background: var(--or2); } .stat-icon-wrap.purple { background: var(--pu2); }
  .stat-icon { font-size: 18px; display: block; }
  .stat-value { font-size: 26px; font-weight: 700; line-height: 1; margin-bottom: 5px; letter-spacing: -0.5px; }
  .stat-card.green .stat-value { color: var(--g2); } .stat-card.blue .stat-value { color: var(--bl); } .stat-card.orange .stat-value { color: var(--or); } .stat-card.purple .stat-value { color: var(--pu); }
  .stat-label { font-size: 12px; color: var(--mu2); font-weight: 500; }
  .stat-change { font-size: 11px; color: var(--g); margin-top: 8px; display: flex; align-items: center; gap: 4px; font-weight: 600; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }

  .athlete-card { background: var(--d1); border: 1px solid var(--bd); border-radius: 12px; padding: 20px; transition: all 0.2s; cursor: pointer; }
  .athlete-card:hover { border-color: var(--g4); transform: translateY(-3px); box-shadow: 0 4px 16px rgba(29,158,117,0.08); }
  .athlete-avatar-wrap { position: relative; width: fit-content; margin-bottom: 14px; }
  .athlete-avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--g3); border: 2px solid var(--g4); display: flex; align-items: center; justify-content: center; font-size: 26px; }
  .athlete-sport-badge { position: absolute; bottom: -4px; right: -8px; background: var(--d1); border: 1px solid var(--bd); border-radius: 100px; padding: 2px 8px; font-size: 9px; font-weight: 700; color: var(--g2); text-transform: uppercase; letter-spacing: 0.5px; font-family: 'DM Mono', monospace; white-space: nowrap; }
  .athlete-name { font-size: 14px; font-weight: 700; color: var(--tx); margin-bottom: 2px; }
  .athlete-location { font-size: 12px; color: var(--mu2); margin-bottom: 12px; }
  .athlete-metrics { display: flex; gap: 18px; }
  .metric-val { font-family: 'DM Mono', monospace; font-size: 17px; font-weight: 500; color: var(--tx); }
  .metric-label { font-size: 10px; color: var(--mu); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px; }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 7px; border: none; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; letter-spacing: 0.1px; }
  .btn-primary { background: var(--g); color: #fff; }
  .btn-primary:hover { background: var(--g2); transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--mu2); border: 1px solid var(--bd); }
  .btn-ghost:hover { border-color: var(--g4); color: var(--g2); background: var(--g3); }
  .btn-sm { padding: 6px 12px; font-size: 11px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 100px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; }
  .badge-green { background: var(--g3); color: var(--g2); }
  .badge-orange { background: var(--or2); color: var(--or); }
  .badge-blue { background: var(--bl2); color: var(--bl); }
  .badge-yellow { background: var(--yl2); color: var(--yl); }
  .badge-purple { background: var(--pu2); color: var(--pu); }
  .badge-red { background: var(--rd2); color: var(--rd); }
  .badge-muted { background: var(--bk); color: var(--mu2); border: 1px solid var(--bd); }

  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; padding: 11px 16px; font-size: 10px; color: var(--mu); text-transform: uppercase; letter-spacing: 1.2px; font-family: 'DM Mono', monospace; border-bottom: 1px solid var(--bd); background: var(--bk); }
  .table td { padding: 13px 16px; font-size: 13px; color: var(--tx); border-bottom: 1px solid var(--bd); vertical-align: middle; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: var(--bk); }

  .feed-post { background: var(--d1); border: 1px solid var(--bd); border-radius: 12px; padding: 18px; margin-bottom: 10px; transition: all 0.2s; }
  .feed-post:hover { border-color: var(--g4); }
  .post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .post-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--g3); border: 2px solid var(--g4); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .post-author { font-weight: 700; font-size: 13px; color: var(--tx); }
  .post-meta { font-size: 11px; color: var(--mu2); display: flex; align-items: center; gap: 7px; margin-top: 2px; }
  .post-content { font-size: 13px; line-height: 1.65; color: var(--mu2); margin-bottom: 12px; }
  .post-actions { display: flex; gap: 14px; }
  .post-action { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--mu); cursor: pointer; background: none; border: none; transition: color 0.15s; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; }
  .post-action:hover { color: var(--g); }

  .progress-wrap { background: var(--bk); border-radius: 100px; height: 6px; overflow: hidden; border: 1px solid var(--bd); }
  .progress-bar { height: 100%; background: var(--g); border-radius: 100px; transition: width 0.5s ease; }

  .campaign-card { background: var(--d1); border: 1px solid var(--bd); border-radius: 12px; padding: 20px; transition: all 0.2s; }
  .campaign-card:hover { border-color: var(--g4); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(29,158,117,0.08); }

  .service-card { background: var(--d1); border: 1px solid var(--bd); border-radius: 12px; padding: 20px; transition: all 0.2s; }
  .service-card:hover { border-color: #B5D4F4; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(55,138,221,0.08); }
  .service-icon { width: 44px; height: 44px; border-radius: 10px; background: var(--bl2); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 14px; }
  .service-cat { font-size: 10px; color: var(--bl); font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 4px; font-family: 'DM Mono', monospace; }
  .service-title { font-size: 14px; font-weight: 700; color: var(--tx); margin-bottom: 2px; }
  .service-provider { font-size: 12px; color: var(--mu2); margin-bottom: 12px; }
  .service-footer { display: flex; align-items: center; justify-content: space-between; }
  .service-price { font-family: 'DM Mono', monospace; font-size: 15px; color: var(--g2); font-weight: 500; }

  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 11px; font-weight: 700; color: var(--mu2); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 6px; }
  .form-input, .form-select, .form-textarea { width: 100%; background: var(--bk); border: 1px solid var(--bd); border-radius: 8px; padding: 10px 13px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: var(--tx); outline: none; transition: border-color 0.15s; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--g4); background: #fff; }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-select { cursor: pointer; }

  .modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(15,25,35,0.5); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: var(--d1); border: 1px solid var(--bd); border-radius: 16px; width: 100%; max-width: 500px; max-height: 80vh; overflow-y: auto; animation: slideUp 0.25s ease; box-shadow: 0 20px 60px rgba(15,25,35,0.15); }
  @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
  .modal-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--bd); display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-size: 15px; font-weight: 700; color: var(--tx); }
  .modal-body { padding: 20px 24px; }
  .modal-footer { padding: 14px 24px; border-top: 1px solid var(--bd); display: flex; gap: 10px; justify-content: flex-end; }
  .modal-close { background: none; border: none; color: var(--mu); font-size: 20px; cursor: pointer; transition: color 0.15s; }
  .modal-close:hover { color: var(--tx); }

  .auth-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bk); position: relative; overflow: hidden; }
  .auth-bg { position: absolute; inset: 0; background-image: linear-gradient(var(--bd) 1px, transparent 1px), linear-gradient(90deg, var(--bd) 1px, transparent 1px); background-size: 48px 48px; opacity: 0.6; }
  .auth-glow { position: absolute; width: 600px; height: 400px; border-radius: 50%; background: radial-gradient(ellipse, rgba(29,158,117,0.07) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-60%); }
  .auth-card { background: var(--d1); border: 1px solid var(--bd); border-radius: 20px; padding: 44px 40px; width: 420px; position: relative; z-index: 1; box-shadow: 0 8px 40px rgba(15,25,35,0.08); }
  .auth-logo-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .auth-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--g); display: flex; align-items: center; justify-content: center; }
  .auth-logo-dot { width: 16px; height: 16px; border-radius: 50%; background: #fff; }
  .auth-logo { font-size: 20px; font-weight: 700; color: var(--tx); letter-spacing: -0.3px; }
  .auth-logo span { color: var(--g); }
  .auth-subtitle { font-size: 13px; color: var(--mu2); margin-bottom: 32px; line-height: 1.5; }
  .auth-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--bk); border-radius: 9px; padding: 4px; border: 1px solid var(--bd); }
  .auth-tab { flex: 1; padding: 9px; border-radius: 6px; border: none; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; background: none; color: var(--mu2); }
  .auth-tab.active { background: var(--g); color: #fff; }

  .role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
  .role-btn { padding: 11px 6px; border-radius: 8px; border: 1px solid var(--bd); background: var(--bk); cursor: pointer; text-align: center; transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .role-btn:hover { border-color: var(--g4); background: var(--g3); }
  .role-btn.selected { border-color: var(--g); background: var(--g3); }
  .role-btn .role-icon { font-size: 20px; display: block; margin-bottom: 4px; }
  .role-btn .role-name { font-size: 10px; font-weight: 700; color: var(--mu2); text-transform: uppercase; letter-spacing: 0.3px; }
  .role-btn.selected .role-name { color: var(--g2); }

  .profile-hero { background: var(--d1); border: 1px solid var(--bd); border-radius: 14px; padding: 28px; margin-bottom: 20px; display: flex; gap: 24px; align-items: flex-start; }
  .profile-avatar-lg { width: 80px; height: 80px; border-radius: 50%; background: var(--g3); border: 3px solid var(--g4); display: flex; align-items: center; justify-content: center; font-size: 38px; flex-shrink: 0; }
  .profile-info { flex: 1; }
  .profile-name { font-size: 22px; font-weight: 700; color: var(--tx); margin-bottom: 6px; letter-spacing: -0.3px; }
  .profile-meta-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
  .profile-bio { font-size: 13px; color: var(--mu2); line-height: 1.65; max-width: 600px; margin-bottom: 16px; }
  .profile-socials { display: flex; gap: 8px; flex-wrap: wrap; }
  .social-chip { display: flex; align-items: center; gap: 6px; background: var(--bk); border: 1px solid var(--bd); border-radius: 7px; padding: 6px 12px; font-size: 12px; color: var(--mu2); font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .social-chip:hover { border-color: var(--g4); color: var(--g2); background: var(--g3); }
  .metrics-row { display: flex; gap: 28px; }
  .metric-big { text-align: center; }
  .metric-big-val { font-size: 26px; font-weight: 700; color: var(--g2); letter-spacing: -0.5px; }
  .metric-big-label { font-size: 10px; color: var(--mu); text-transform: uppercase; letter-spacing: 1px; font-family: 'DM Mono', monospace; margin-top: 2px; }

  .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: var(--d1); border: 1px solid var(--g4); border-radius: 10px; padding: 13px 18px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: var(--tx); box-shadow: 0 8px 32px rgba(15,25,35,0.12); animation: slideUp 0.3s ease; max-width: 320px; }
  .toast-icon { font-size: 18px; }

  .empty-state { text-align: center; padding: 60px 24px; }
  .empty-icon { font-size: 44px; margin-bottom: 14px; opacity: 0.4; }
  .empty-title { font-size: 15px; font-weight: 700; color: var(--mu2); margin-bottom: 6px; }
  .empty-text { font-size: 13px; color: var(--mu); line-height: 1.6; }

  .loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bk); flex-direction: column; gap: 16px; }
  .loading-spinner { width: 36px; height: 36px; border: 3px solid var(--g3); border-top-color: var(--g); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .row { display: flex; align-items: center; gap: 12px; }
  .row-between { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .col { display: flex; flex-direction: column; }
  .mt-4{margin-top:4px}.mt-8{margin-top:8px}.mt-16{margin-top:16px}.mt-24{margin-top:24px}
  .mb-4{margin-bottom:4px}.mb-8{margin-bottom:8px}.mb-16{margin-bottom:16px}.mb-24{margin-bottom:24px}
  .text-muted{color:var(--mu2)}.text-green{color:var(--g2)}.text-sm{font-size:12px}.text-xs{font-size:11px}
  .text-mono{font-family:'DM Mono',monospace}.font-bold{font-weight:700}
  .section-title{font-size:16px;font-weight:700;color:var(--tx);margin-bottom:4px;letter-spacing:-0.2px}
  .section-sub{font-size:12px;color:var(--mu2)}
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
          <div style={{ fontSize: 13, color: 'var(--mu2)' }}>Carregando...</div>
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
