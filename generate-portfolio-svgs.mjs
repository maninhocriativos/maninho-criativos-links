/**
 * Gera SVGs de portfólio para as novas categorias
 * Execute: node generate-portfolio-svgs.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = "g:/Meu Drive/Maninho Criati/página de links maninhos/public/portfolio";
mkdirSync(OUT, { recursive: true });

const items = [
  // ── Desenvolvimento de Apps ──────────────────────────────────
  {
    file: 'app-01.svg', w: 800, h: 1000,
    grad: ['#1a1a2e','#0f3460','#533483'],
    icon: `<rect x="300" y="180" width="200" height="340" rx="24" fill="none" stroke="white" stroke-width="8"/>
           <rect x="330" y="200" width="140" height="240" rx="8" fill="rgba(255,255,255,0.1)"/>
           <rect x="320" y="220" width="160" height="20" rx="4" fill="rgba(0,212,255,0.6)"/>
           <rect x="320" y="250" width="120" height="12" rx="4" fill="rgba(255,255,255,0.3)"/>
           <rect x="320" y="270" width="140" height="12" rx="4" fill="rgba(255,255,255,0.2)"/>
           <rect x="320" y="310" width="60" height="40" rx="8" fill="rgba(0,212,255,0.4)"/>
           <rect x="390" y="310" width="60" height="40" rx="8" fill="rgba(83,52,131,0.8)"/>
           <circle cx="400" cy="490" r="10" fill="rgba(255,255,255,0.6)"/>`,
    title: 'App Mobile',
    sub: 'React Native · iOS · Android',
  },
  {
    file: 'app-02.svg', w: 800, h: 640,
    grad: ['#0a0e27','#1e3a5f','#2d6a9f'],
    icon: `<rect x="120" y="120" width="560" height="360" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(0,212,255,0.3)" stroke-width="2"/>
           <rect x="120" y="120" width="560" height="40" rx="16" fill="rgba(0,212,255,0.15)"/>
           <circle cx="148" cy="140" r="8" fill="rgba(255,80,80,0.7)"/>
           <circle cx="172" cy="140" r="8" fill="rgba(255,200,0,0.7)"/>
           <circle cx="196" cy="140" r="8" fill="rgba(0,200,80,0.7)"/>
           <rect x="140" y="176" width="140" height="260" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
           <rect x="150" y="190" width="80" height="8" rx="4" fill="rgba(0,212,255,0.5)"/>
           <rect x="150" y="208" width="100" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
           <rect x="150" y="222" width="90" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
           <rect x="300" y="176" width="360" height="120" rx="8" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" stroke-width="1"/>
           <rect x="316" y="192" width="140" height="24" rx="4" fill="rgba(0,212,255,0.3)"/>
           <rect x="316" y="226" width="100" height="10" rx="3" fill="rgba(255,255,255,0.2)"/>
           <rect x="300" y="312" width="170" height="100" rx="8" fill="rgba(83,52,131,0.4)" stroke="rgba(83,52,131,0.6)" stroke-width="1"/>
           <rect x="486" y="312" width="170" height="100" rx="8" fill="rgba(0,85,255,0.2)" stroke="rgba(0,85,255,0.4)" stroke-width="1"/>`,
    title: 'Web App / Dashboard',
    sub: 'Next.js · TypeScript · API REST',
  },
  {
    file: 'app-03.svg', w: 800, h: 900,
    grad: ['#0d0d1f','#1a0533','#2d0b5e'],
    icon: `<rect x="200" y="150" width="400" height="520" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(83,52,131,0.5)" stroke-width="2"/>
           <rect x="220" y="180" width="360" height="60" rx="10" fill="rgba(83,52,131,0.4)"/>
           <rect x="240" y="196" width="160" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
           <rect x="220" y="260" width="160" height="80" rx="10" fill="rgba(0,212,255,0.12)" stroke="rgba(0,212,255,0.25)" stroke-width="1"/>
           <rect x="400" y="260" width="160" height="80" rx="10" fill="rgba(83,52,131,0.25)" stroke="rgba(83,52,131,0.4)" stroke-width="1"/>
           <rect x="220" y="360" width="360" height="100" rx="10" fill="rgba(0,85,255,0.1)" stroke="rgba(0,85,255,0.3)" stroke-width="1"/>
           <rect x="240" y="376" width="200" height="12" rx="4" fill="rgba(0,212,255,0.5)"/>
           <rect x="240" y="398" width="280" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>
           <rect x="240" y="416" width="240" height="8" rx="4" fill="rgba(255,255,255,0.1)"/>
           <rect x="220" y="480" width="360" height="44" rx="10" fill="rgba(0,212,255,0.2)"/>
           <text x="400" y="509" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="rgba(0,212,255,0.9)">CONTRATAR AGORA</text>`,
    title: 'Landing Page Premium',
    sub: 'HTML · CSS · JS · Cloudflare',
  },

  // ── CRM & Meta ──────────────────────────────────────────────
  {
    file: 'crm-01.svg', w: 800, h: 900,
    grad: ['#0a0a0a','#1a0a00','#3d1a00'],
    icon: `<!-- Funil de vendas -->
           <polygon points="180,200 620,200 520,380 280,380" fill="rgba(24,119,242,0.5)" stroke="rgba(24,119,242,0.8)" stroke-width="2"/>
           <text x="400" y="300" text-anchor="middle" font-family="sans-serif" font-size="18" fill="white" font-weight="bold">TRÁFEGO META ADS</text>
           <polygon points="280,400 520,400 460,540 340,540" fill="rgba(24,119,242,0.4)" stroke="rgba(24,119,242,0.7)" stroke-width="2"/>
           <text x="400" y="480" text-anchor="middle" font-family="sans-serif" font-size="15" fill="white">LEADS QUALIFICADOS</text>
           <polygon points="340,560 460,560 420,680 380,680" fill="rgba(0,212,255,0.5)" stroke="rgba(0,212,255,0.8)" stroke-width="2"/>
           <text x="400" y="630" text-anchor="middle" font-family="sans-serif" font-size="13" fill="white">VENDAS</text>
           <polygon points="380,700 420,700 410,780 390,780" fill="rgba(37,211,102,0.6)" stroke="rgba(37,211,102,0.9)" stroke-width="2"/>
           <!-- Meta icon area -->
           <rect x="140" y="140" width="60" height="20" rx="4" fill="rgba(24,119,242,0.8)"/>
           <text x="170" y="155" text-anchor="middle" font-family="sans-serif" font-size="11" fill="white" font-weight="bold">Meta</text>`,
    title: 'CRM + Meta Ads',
    sub: 'Facebook Ads · Lead Gen · CRM',
  },
  {
    file: 'crm-02.svg', w: 800, h: 640,
    grad: ['#050d1a','#071a30','#0a2640'],
    icon: `<!-- Dashboard CRM -->
           <rect x="80" y="100" width="640" height="440" rx="16" fill="rgba(255,255,255,0.03)" stroke="rgba(24,119,242,0.25)" stroke-width="1.5"/>
           <rect x="80" y="100" width="640" height="44" rx="16" fill="rgba(24,119,242,0.2)"/>
           <text x="160" y="128" font-family="sans-serif" font-size="16" font-weight="bold" fill="rgba(255,255,255,0.9)">Painel de Leads — Meta</text>
           <!-- KPI cards -->
           <rect x="100" y="164" width="140" height="80" rx="10" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.2)" stroke-width="1"/>
           <text x="170" y="196" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="900" fill="rgba(0,212,255,0.9)">1.2k</text>
           <text x="170" y="216" text-anchor="middle" font-family="sans-serif" font-size="11" fill="rgba(255,255,255,0.5)">Leads/mês</text>
           <rect x="256" y="164" width="140" height="80" rx="10" fill="rgba(37,211,102,0.1)" stroke="rgba(37,211,102,0.2)" stroke-width="1"/>
           <text x="326" y="196" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="900" fill="rgba(37,211,102,0.9)">38%</text>
           <text x="326" y="216" text-anchor="middle" font-family="sans-serif" font-size="11" fill="rgba(255,255,255,0.5)">Conversão</text>
           <rect x="412" y="164" width="140" height="80" rx="10" fill="rgba(255,150,0,0.1)" stroke="rgba(255,150,0,0.25)" stroke-width="1"/>
           <text x="482" y="196" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="900" fill="rgba(255,150,0,0.9)">R$4.2</text>
           <text x="482" y="216" text-anchor="middle" font-family="sans-serif" font-size="11" fill="rgba(255,255,255,0.5)">CPL médio</text>
           <!-- Chart bars -->
           <rect x="100" y="264" width="560" height="200" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
           <rect x="130" y="370" width="40" height="80" rx="4" fill="rgba(24,119,242,0.5)"/>
           <rect x="190" y="340" width="40" height="110" rx="4" fill="rgba(24,119,242,0.6)"/>
           <rect x="250" y="310" width="40" height="140" rx="4" fill="rgba(24,119,242,0.7)"/>
           <rect x="310" y="290" width="40" height="160" rx="4" fill="rgba(0,212,255,0.6)"/>
           <rect x="370" y="270" width="40" height="180" rx="4" fill="rgba(0,212,255,0.8)"/>
           <rect x="430" y="300" width="40" height="150" rx="4" fill="rgba(0,212,255,0.65)"/>
           <rect x="490" y="330" width="40" height="120" rx="4" fill="rgba(0,212,255,0.5)"/>
           <rect x="550" y="360" width="40" height="90" rx="4" fill="rgba(0,212,255,0.4)"/>`,
    title: 'Dashboard Leads',
    sub: 'Meta Ads · Analytics · CRM',
  },
  {
    file: 'crm-03.svg', w: 800, h: 900,
    grad: ['#0a0a14','#0d1528','#0f2040'],
    icon: `<!-- Pipeline de vendas Kanban -->
           <text x="400" y="130" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="900" fill="rgba(255,255,255,0.85)">Pipeline de Vendas</text>
           <!-- Colunas Kanban -->
           <rect x="80"  y="155" width="170" height="280" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
           <text x="165" y="178" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.5)">NOVO LEAD</text>
           <rect x="92"  y="190" width="146" height="50" rx="6" fill="rgba(24,119,242,0.25)" stroke="rgba(24,119,242,0.4)" stroke-width="1"/>
           <rect x="92"  y="248" width="146" height="50" rx="6" fill="rgba(24,119,242,0.2)" stroke="rgba(24,119,242,0.35)" stroke-width="1"/>
           <rect x="92"  y="306" width="146" height="50" rx="6" fill="rgba(24,119,242,0.15)" stroke="rgba(24,119,242,0.3)" stroke-width="1"/>
           <rect x="315" y="155" width="170" height="280" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
           <text x="400" y="178" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.5)">EM CONTATO</text>
           <rect x="327" y="190" width="146" height="50" rx="6" fill="rgba(0,212,255,0.2)" stroke="rgba(0,212,255,0.4)" stroke-width="1"/>
           <rect x="327" y="248" width="146" height="50" rx="6" fill="rgba(0,212,255,0.15)" stroke="rgba(0,212,255,0.3)" stroke-width="1"/>
           <rect x="550" y="155" width="170" height="280" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
           <text x="635" y="178" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.5)">FECHADO</text>
           <rect x="562" y="190" width="146" height="50" rx="6" fill="rgba(37,211,102,0.25)" stroke="rgba(37,211,102,0.5)" stroke-width="1"/>`,
    title: 'CRM Kanban',
    sub: 'Pipeline · Automação · Meta',
  },

  // ── Automação de IA para Vendas ─────────────────────────────
  {
    file: 'ai-01.svg', w: 800, h: 900,
    grad: ['#030b12','#041520','#062030'],
    icon: `<!-- Bot de atendimento -->
           <!-- Celular -->
           <rect x="270" y="120" width="260" height="500" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(0,212,255,0.3)" stroke-width="2"/>
           <rect x="290" y="150" width="220" height="380" rx="12" fill="rgba(0,0,0,0.5)"/>
           <!-- mensagens -->
           <rect x="300" y="168" width="140" height="32" rx="10" fill="rgba(0,212,255,0.25)"/>
           <text x="370" y="188" text-anchor="middle" font-family="sans-serif" font-size="11" fill="white">Olá! Como posso ajudar?</text>
           <rect x="360" y="212" width="130" height="32" rx="10" fill="rgba(255,255,255,0.1)"/>
           <text x="425" y="232" text-anchor="middle" font-family="sans-serif" font-size="11" fill="rgba(255,255,255,0.8)">Quero saber sobre o serviço</text>
           <rect x="300" y="256" width="120" height="32" rx="10" fill="rgba(0,212,255,0.25)"/>
           <text x="360" y="276" text-anchor="middle" font-family="sans-serif" font-size="11" fill="white">Claro! Qual seria o projeto?</text>
           <rect x="370" y="300" width="110" height="32" rx="10" fill="rgba(255,255,255,0.1)"/>
           <text x="425" y="320" text-anchor="middle" font-family="sans-serif" font-size="11" fill="rgba(255,255,255,0.8)">Um app para minha empresa</text>
           <rect x="300" y="344" width="140" height="52" rx="10" fill="rgba(0,212,255,0.25)"/>
           <text x="370" y="364" text-anchor="middle" font-family="sans-serif" font-size="11" fill="white">Perfeito! Vou te conectar</text>
           <text x="370" y="381" text-anchor="middle" font-family="sans-serif" font-size="11" fill="white">com nosso time 🚀</text>
           <!-- Input bar -->
           <rect x="295" y="492" width="210" height="28" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
           <!-- AI badge -->
           <rect x="320" y="640" width="160" height="32" rx="10" fill="rgba(0,212,255,0.15)" stroke="rgba(0,212,255,0.35)" stroke-width="1"/>
           <text x="400" y="661" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="rgba(0,212,255,0.9)">⚡ Agente IA Ativo</text>`,
    title: 'Agente IA WhatsApp',
    sub: 'OpenAI · n8n · WhatsApp API',
  },
  {
    file: 'ai-02.svg', w: 800, h: 700,
    grad: ['#030810','#040e1c','#061628'],
    icon: `<!-- Fluxo de automação -->
           <text x="400" y="80" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="900" fill="rgba(0,212,255,0.85)">FLUXO DE AUTOMAÇÃO</text>
           <!-- Nós do fluxo -->
           <!-- Lead entra -->
           <rect x="80" y="120" width="140" height="60" rx="10" fill="rgba(24,119,242,0.3)" stroke="rgba(24,119,242,0.6)" stroke-width="1.5"/>
           <text x="150" y="152" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="white">Lead Entra</text>
           <line x1="220" y1="150" x2="290" y2="150" stroke="rgba(0,212,255,0.5)" stroke-width="2" marker-end="url(#arrow)"/>
           <!-- Qualifica -->
           <rect x="290" y="120" width="140" height="60" rx="10" fill="rgba(0,212,255,0.2)" stroke="rgba(0,212,255,0.5)" stroke-width="1.5"/>
           <text x="360" y="145" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="white">IA Qualifica</text>
           <text x="360" y="163" text-anchor="middle" font-family="sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">GPT-4</text>
           <line x1="430" y1="150" x2="500" y2="150" stroke="rgba(0,212,255,0.5)" stroke-width="2"/>
           <!-- Segmenta -->
           <rect x="500" y="120" width="140" height="60" rx="10" fill="rgba(83,52,131,0.3)" stroke="rgba(83,52,131,0.6)" stroke-width="1.5"/>
           <text x="570" y="152" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="white">Segmenta</text>
           <!-- Ramificações -->
           <line x1="570" y1="180" x2="570" y2="240" stroke="rgba(83,52,131,0.5)" stroke-width="2"/>
           <line x1="570" y1="240" x2="200" y2="240" stroke="rgba(83,52,131,0.4)" stroke-width="1.5"/>
           <line x1="570" y1="240" x2="570" y2="300" stroke="rgba(83,52,131,0.5)" stroke-width="2"/>
           <!-- WhatsApp -->
           <rect x="80" y="260" width="220" height="50" rx="8" fill="rgba(37,211,102,0.2)" stroke="rgba(37,211,102,0.4)" stroke-width="1"/>
           <text x="190" y="281" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="rgba(37,211,102,0.9)">WhatsApp Auto</text>
           <text x="190" y="298" text-anchor="middle" font-family="sans-serif" font-size="10" fill="rgba(255,255,255,0.5)">Mensagem personalizada IA</text>
           <!-- Email -->
           <rect x="460" y="300" width="220" height="50" rx="8" fill="rgba(0,212,255,0.2)" stroke="rgba(0,212,255,0.4)" stroke-width="1"/>
           <text x="570" y="321" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="rgba(0,212,255,0.9)">CRM Update</text>
           <text x="570" y="338" text-anchor="middle" font-family="sans-serif" font-size="10" fill="rgba(255,255,255,0.5)">Lead score automático</text>
           <!-- n8n badge -->
           <rect x="300" y="420" width="200" height="36" rx="18" fill="rgba(255,130,0,0.15)" stroke="rgba(255,130,0,0.35)" stroke-width="1"/>
           <text x="400" y="443" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="rgba(255,130,0,0.9)">⚡ Powered by n8n</text>`,
    title: 'Automação de Vendas',
    sub: 'n8n · OpenAI · CRM · WhatsApp',
  },
  {
    file: 'ai-03.svg', w: 800, h: 900,
    grad: ['#040a10','#060f18','#081422'],
    icon: `<!-- Neural network / AI visual -->
           <!-- Círculos conectados -->
           <circle cx="200" cy="300" r="28" fill="rgba(0,212,255,0.2)" stroke="rgba(0,212,255,0.5)" stroke-width="2"/>
           <text x="200" y="306" text-anchor="middle" font-family="sans-serif" font-size="10" fill="white">Lead</text>
           <circle cx="200" cy="420" r="28" fill="rgba(0,212,255,0.2)" stroke="rgba(0,212,255,0.5)" stroke-width="2"/>
           <text x="200" y="426" text-anchor="middle" font-family="sans-serif" font-size="10" fill="white">Email</text>
           <circle cx="200" cy="540" r="28" fill="rgba(0,212,255,0.2)" stroke="rgba(0,212,255,0.5)" stroke-width="2"/>
           <text x="200" y="546" text-anchor="middle" font-family="sans-serif" font-size="10" fill="white">Chat</text>
           <!-- Centro: IA -->
           <circle cx="400" cy="420" r="55" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.4)" stroke-width="2.5"/>
           <circle cx="400" cy="420" r="35" fill="rgba(0,212,255,0.15)" stroke="rgba(0,212,255,0.6)" stroke-width="2"/>
           <text x="400" y="415" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="900" fill="rgba(0,212,255,0.95)">IA</text>
           <text x="400" y="433" text-anchor="middle" font-family="sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">Agent</text>
           <!-- Linhas input -->
           <line x1="228" y1="300" x2="348" y2="395" stroke="rgba(0,212,255,0.3)" stroke-width="1.5" stroke-dasharray="6,3"/>
           <line x1="228" y1="420" x2="345" y2="420" stroke="rgba(0,212,255,0.3)" stroke-width="1.5" stroke-dasharray="6,3"/>
           <line x1="228" y1="540" x2="348" y2="445" stroke="rgba(0,212,255,0.3)" stroke-width="1.5" stroke-dasharray="6,3"/>
           <!-- Outputs -->
           <circle cx="600" cy="300" r="28" fill="rgba(37,211,102,0.2)" stroke="rgba(37,211,102,0.5)" stroke-width="2"/>
           <text x="600" y="295" text-anchor="middle" font-family="sans-serif" font-size="9" fill="white">WhatsApp</text>
           <text x="600" y="308" text-anchor="middle" font-family="sans-serif" font-size="9" fill="white">Auto</text>
           <circle cx="600" cy="420" r="28" fill="rgba(83,52,131,0.3)" stroke="rgba(83,52,131,0.6)" stroke-width="2"/>
           <text x="600" y="415" text-anchor="middle" font-family="sans-serif" font-size="9" fill="white">CRM</text>
           <text x="600" y="428" text-anchor="middle" font-family="sans-serif" font-size="9" fill="white">Update</text>
           <circle cx="600" cy="540" r="28" fill="rgba(24,119,242,0.25)" stroke="rgba(24,119,242,0.5)" stroke-width="2"/>
           <text x="600" y="535" text-anchor="middle" font-family="sans-serif" font-size="9" fill="white">Meta</text>
           <text x="600" y="548" text-anchor="middle" font-family="sans-serif" font-size="9" fill="white">Retarget</text>
           <!-- Linhas output -->
           <line x1="452" y1="395" x2="572" y2="308" stroke="rgba(37,211,102,0.3)" stroke-width="1.5" stroke-dasharray="6,3"/>
           <line x1="455" y1="420" x2="572" y2="420" stroke="rgba(83,52,131,0.4)" stroke-width="1.5" stroke-dasharray="6,3"/>
           <line x1="452" y1="445" x2="572" y2="530" stroke="rgba(24,119,242,0.3)" stroke-width="1.5" stroke-dasharray="6,3"/>
           <!-- Title -->
           <text x="400" y="680" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="900" fill="rgba(0,212,255,0.85)">Agente Multi-Canal</text>
           <text x="400" y="706" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.45)">GPT-4 · n8n · Automação Total</text>`,
    title: 'Agente Multi-Canal',
    sub: 'GPT-4 · n8n · Omnichannel',
  },
];

function makeSVG({ w, h, grad, icon, title, sub }) {
  const [c1, c2, c3] = grad;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="${c1}"/>
      <stop offset="50%"  stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3 || c2}"/>
    </linearGradient>
    <!-- Grid sutil -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,0.04)" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  ${icon}
</svg>`;
}

for (const item of items) {
  const svg = makeSVG(item);
  writeFileSync(join(OUT, item.file), svg, 'utf8');
  console.log(`✓ ${item.file}`);
}

console.log(`\n✅ ${items.length} SVGs gerados em ${OUT}`);
