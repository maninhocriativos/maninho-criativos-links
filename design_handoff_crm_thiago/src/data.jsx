// data.jsx — dados mock do portfólio freelancer "Thiago"

const OWNER = {
  name: "Thiago Mendes",
  handle: "thiagomendes",
  role: "Product Designer & Front-end",
  bio: "Desenho e construo produtos digitais. 8 anos ajudando startups a transformar ideias em interfaces que convertem.",
  location: "São Paulo, BR",
  email: "ola@thiagomendes.design",
  site: "thiagomendes.design",
  avatarHue: 210,
};

const LINKS = [
  { id: "l1", title: "Portfólio completo", url: "thiagomendes.design/work", icon: "portfolio", active: true,  clicks: 4820, ctr: 38.2 },
  { id: "l2", title: "Agende uma call (30min)", url: "cal.com/thiago/intro", icon: "calendar", active: true,  clicks: 2140, ctr: 17.0 },
  { id: "l3", title: "Estudo de caso — Fintech Nuvo", url: "thiagomendes.design/nuvo", icon: "star", active: true,  clicks: 1690, ctr: 13.4 },
  { id: "l4", title: "Newsletter de design", url: "thiagomendes.substack.com", icon: "mail", active: true,  clicks: 1205, ctr: 9.6 },
  { id: "l5", title: "Template Figma (grátis)", url: "gum.co/thiago-kit", icon: "download", active: false, clicks: 980,  ctr: 7.8 },
  { id: "l6", title: "GitHub", url: "github.com/thiagomendes", icon: "github", active: true,  clicks: 640,  ctr: 5.1 },
];

const SOCIALS = [
  { id: "instagram", url: "@thiago.design", icon: "instagram" },
  { id: "linkedin", url: "in/thiagomendes", icon: "linkedin" },
  { id: "dribbble", url: "thiagomendes", icon: "dribbble" },
  { id: "github", url: "thiagomendes", icon: "github" },
];

const PROJECTS = [
  { id: "p1", title: "Nuvo Bank", category: "Fintech · App", year: "2025", status: "published", featured: true,  hue: 210, views: 3200, desc: "Redesign do app de conta digital. +24% em ativação." },
  { id: "p2", title: "Lumen Health", category: "Saúde · Web", year: "2025", status: "published", featured: true,  hue: 150, views: 2100, desc: "Plataforma de telemedicina e agendamento." },
  { id: "p3", title: "Orbit Analytics", category: "SaaS · Dashboard", year: "2024", status: "published", featured: false, hue: 280, views: 1850, desc: "Dashboard de métricas para times de produto." },
  { id: "p4", title: "Mesa Café", category: "Branding · Web", year: "2024", status: "published", featured: false, hue: 30,  views: 1320, desc: "Identidade e site para cafeteria de SP." },
  { id: "p5", title: "Vela Studio", category: "Portfólio · Web", year: "2024", status: "draft",     featured: false, hue: 340, views: 0,    desc: "Site para estúdio de arquitetura." },
  { id: "p6", title: "Pace Running", category: "App · Mobile", year: "2023", status: "published", featured: false, hue: 190, views: 970,  desc: "App de treino de corrida com social." },
];

const LEADS = [
  {
    id: "c1", name: "Marina Costa", company: "Nuvo Bank", role: "Head of Product", status: "negotiation",
    email: "marina@nuvo.com", phone: "+55 11 98123-4521", location: "São Paulo, BR",
    source: "Agende uma call", value: 28000, createdAt: "2026-05-22", lastActivity: "há 2h", rating: 5,
    tags: ["Fintech", "Quente", "Redesign"],
    message: "Oi Thiago! Vimos seu case da Nuvo e queremos conversar sobre o redesign do nosso app de investimentos. Temos budget aprovado pro Q3.",
    timeline: [
      { type: "message", title: "Mensagem recebida", detail: "Formulário do site · Redesign do app", date: "22 mai, 14:20" },
      { type: "view", title: "Visitou 3 projetos", detail: "Nuvo Bank, Orbit, Lumen", date: "22 mai, 14:05" },
      { type: "call", title: "Call agendada", detail: "28 mai · 15h — Discovery", date: "24 mai, 09:10" },
      { type: "note", title: "Nota interna", detail: "Budget Q3 confirmado. Enviar proposta até sexta.", date: "26 mai, 18:00" },
    ],
  },
  {
    id: "c2", name: "Rafael Lima", company: "Lumen Health", role: "CEO", status: "qualified",
    email: "rafael@lumen.health", phone: "+55 21 99540-1180", location: "Rio de Janeiro, BR",
    source: "Portfólio completo", value: 42000, createdAt: "2026-05-20", lastActivity: "há 1 dia", rating: 4,
    tags: ["Saúde", "Plataforma"],
    message: "Precisamos redesenhar nosso fluxo de agendamento. Vi que você já trabalhou com saúde. Qual sua disponibilidade?",
    timeline: [
      { type: "message", title: "Mensagem recebida", detail: "Formulário do site", date: "20 mai, 10:30" },
      { type: "view", title: "Visitou case Lumen Health", detail: "2min 14s na página", date: "20 mai, 10:12" },
      { type: "note", title: "Nota interna", detail: "Escopo grande. Pedir mais detalhes do time atual.", date: "21 mai, 11:00" },
    ],
  },
  {
    id: "c3", name: "Júlia Andrade", company: "Mesa Café", role: "Fundadora", status: "new",
    email: "julia@mesacafe.com.br", phone: "+55 11 97700-2240", location: "São Paulo, BR",
    source: "Instagram", value: 8500, createdAt: "2026-05-28", lastActivity: "há 4h", rating: 3,
    tags: ["Branding", "Pequeno"],
    message: "Adorei seu trabalho! Estou abrindo uma segunda unidade da cafeteria e queria um site novo. Trabalha com projetos menores?",
    timeline: [
      { type: "message", title: "Mensagem recebida", detail: "Link do Instagram", date: "28 mai, 09:40" },
    ],
  },
  {
    id: "c4", name: "Bruno Tavares", company: "Orbit Analytics", role: "Co-founder", status: "won",
    email: "bruno@orbit.io", phone: "+55 11 98800-1100", location: "Remoto", 
    source: "Newsletter", value: 35000, createdAt: "2026-04-12", lastActivity: "há 3 dias", rating: 5,
    tags: ["SaaS", "Cliente"],
    message: "Fechado! Vamos tocar o projeto do dashboard. Te mando o contrato assinado hoje.",
    timeline: [
      { type: "message", title: "Mensagem recebida", detail: "Formulário do site", date: "12 abr, 16:00" },
      { type: "call", title: "Call de discovery", detail: "45min — escopo definido", date: "16 abr, 14:00" },
      { type: "note", title: "Proposta enviada", detail: "R$ 35.000 · 8 semanas", date: "18 abr, 10:00" },
      { type: "won", title: "Projeto fechado", detail: "Contrato assinado", date: "27 mai, 09:30" },
    ],
  },
  {
    id: "c5", name: "Camila Reis", company: "Freelancer", role: "Ilustradora", status: "lost",
    email: "camila.reis@gmail.com", phone: "+55 31 99100-7788", location: "Belo Horizonte, BR",
    source: "Template Figma", value: 0, createdAt: "2026-05-02", lastActivity: "há 2 semanas", rating: 2,
    tags: ["Sem budget"],
    message: "Queria saber se você faz parceria/permuta de design. Não tenho budget agora.",
    timeline: [
      { type: "message", title: "Mensagem recebida", detail: "Link do template", date: "02 mai, 12:00" },
      { type: "lost", title: "Marcado como perdido", detail: "Sem budget no momento", date: "10 mai, 15:00" },
    ],
  },
  {
    id: "c6", name: "Diego Fontana", company: "Pace", role: "Product Lead", status: "qualified",
    email: "diego@pace.run", phone: "+55 11 96600-3322", location: "São Paulo, BR",
    source: "Agende uma call", value: 19000, createdAt: "2026-05-25", lastActivity: "há 1 dia", rating: 4,
    tags: ["App", "Mobile"],
    message: "Olá! Queremos evoluir a parte social do nosso app de corrida. Você tem disponibilidade pra um projeto de 6 semanas?",
    timeline: [
      { type: "message", title: "Mensagem recebida", detail: "Agende uma call", date: "25 mai, 08:20" },
      { type: "call", title: "Call agendada", detail: "30 mai · 11h", date: "26 mai, 10:00" },
    ],
  },
];

// status dos leads -> label + tom de badge
const LEAD_STATUS = {
  new:         { label: "Novo",        tone: "blue" },
  qualified:   { label: "Qualificado", tone: "violet" },
  negotiation: { label: "Negociação",  tone: "amber" },
  won:         { label: "Ganho",       tone: "green" },
  lost:        { label: "Perdido",     tone: "red" },
};

const TIMELINE_ICON = {
  message: "mail", view: "eye", call: "phone", note: "note", won: "checkCircle", lost: "x",
};

// Analytics — séries
const ANALYTICS = {
  kpis: [
    { id: "views",  label: "Visitas no perfil", value: "12.640", delta: +18.2, icon: "eye" },
    { id: "clicks", label: "Cliques em links",  value: "9.475",  delta: +12.4, icon: "cursor" },
    { id: "leads",  label: "Leads recebidos",   value: "38",     delta: +6,    deltaUnit: "", icon: "leads" },
    { id: "ctr",    label: "Taxa de cliques",   value: "74,9%",  delta: -2.1,  icon: "trendUp" },
  ],
  // 14 dias
  traffic: [320,410,380,520,610,540,720,680,840,790,910,1020,980,1140],
  trafficClicks: [210,260,250,360,420,380,510,470,600,560,650,740,710,820],
  topLinks: [
    { title: "Portfólio completo", clicks: 4820, pct: 100 },
    { title: "Agende uma call", clicks: 2140, pct: 44 },
    { title: "Estudo de caso — Nuvo", clicks: 1690, pct: 35 },
    { title: "Newsletter de design", clicks: 1205, pct: 25 },
    { title: "GitHub", clicks: 640, pct: 13 },
  ],
  sources: [
    { label: "Instagram", pct: 42, hue: 340 },
    { label: "Direto", pct: 24, hue: 210 },
    { label: "LinkedIn", pct: 18, hue: 200 },
    { label: "Google", pct: 11, hue: 30 },
    { label: "Outros", pct: 5, hue: 150 },
  ],
  devices: [
    { label: "Mobile", pct: 68 },
    { label: "Desktop", pct: 27 },
    { label: "Tablet", pct: 5 },
  ],
};

function fmtMoney(v) {
  if (!v) return "—";
  return "R$ " + v.toLocaleString("pt-BR");
}

Object.assign(window, { OWNER, LINKS, SOCIALS, PROJECTS, LEADS, LEAD_STATUS, TIMELINE_ICON, ANALYTICS, fmtMoney });
