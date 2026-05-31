# Maninho Criativos — Resumo Completo do Sistema
Gerado em: 2026-05-31

---

## 1. STACK TECNOLÓGICO

### Frontend
- HTML5 / CSS3 / JavaScript vanilla (sem frameworks)
- Font: Inter (Google Fonts) — 400, 500, 600, 700, 800, 900
- Responsive design com breakpoints em 768px e 480px

### Backend
- Cloudflare Pages Functions (serverless)
- Node.js runtime

### Database
- Cloudflare D1 (SQLite)
- Database ID: 807715b6-58cd-4b3f-894d-1920ff97ff68
- Nome: maninho-links-db
- Binding: DB

### Storage
- Cloudflare R2 (object storage)
- Bucket: maninho-criativos-storage
- Binding: STORAGE

### Deploy
- GitHub + GitHub Actions
- Auto-deploy em push na main branch para Cloudflare Pages
- Repositório: github.com/maninhocriativos/maninho-criativos-links

### Hosting
- Cloudflare Pages
- Domínio: links.maninhocriativos.com.br
- Cloudflare Account ID: 375b2294ff94a6b815441e2a764e7413

---

## 2. ARQUITETURA

```
public/
  ├── index.html          (Landing page com links e hero)
  ├── portfolio.html      (Portfólio com projetos do D1)
  ├── login.html          (Página de login separada)
  ├── admin.html          (Painel administrativo)
  ├── style.css           (CSS da landing page)
  ├── admin.css           (CSS do admin — SaaS design)
  ├── portfolio.css       (CSS da página de portfólio)
  ├── script.js           (JS da landing page)
  ├── admin.js            (JS do painel admin)
  ├── portfolio.js        (JS do portfólio)
  ├── track.js            (Analytics/tracking)
  ├── login.js            (Inline em login.html)
  ├── Images/             (Logos, banners, fotos)
  └── ensaio/             (48 fotos WebP do ensaio — foto-1.webp até foto-48.webp)

functions/api/
  ├── admin/
  │   ├── login.js        (POST — valida usuário + senha)
  │   ├── verify.js       (GET — valida token ativo)
  │   ├── links.js        (GET/POST/PATCH/DELETE — CRUD de links)
  │   ├── leads.js        (GET/DELETE — gerenciar leads)
  │   ├── analytics.js    (GET — estatísticas de visitas/cliques)
  │   ├── profile.js      (GET/POST — dados do perfil)
  │   └── _auth.js        (Helper — validação de bearer token)
  ├── leads.js            (POST — salvar lead do modal)
  └── track.js            (POST — registrar evento de analytics)

wrangler.toml             (Configuração Cloudflare Pages)
```

---

## 3. BANCO DE DADOS (D1)

### Tabela: profile
```
id (INTEGER PRIMARY KEY)
name (TEXT)
bio (TEXT)
avatar_url (TEXT)
bg_from (TEXT)     — cor gradiente início
bg_via (TEXT)      — cor gradiente meio
bg_to (TEXT)       — cor gradiente fim
created_at (DATETIME)
```

### Tabela: links
```
id (INTEGER PRIMARY KEY)
title (TEXT)       — ex: "Instagram"
url (TEXT)         — ex: "https://instagram.com/..."
icon (TEXT)        — emoji
color_from (TEXT)  — cor início do card
color_to (TEXT)    — cor fim do card
order_index (INTEGER)
is_active (BOOLEAN)
click_count (INTEGER DEFAULT 0)
created_at (DATETIME)
```

### Tabela: portfolio
```
id (INTEGER PRIMARY KEY)
title (TEXT)       — nome do projeto
category (TEXT)    — ex: "Design 3D", "Fotografia", "IA"
description (TEXT)
image_url (TEXT)   — URL da imagem desktop
image_mobile_url (TEXT) — URL imagem mobile
project_url (TEXT) — link externo do projeto
is_active (BOOLEAN)
order_index (INTEGER)
created_at (DATETIME)
```

### Tabela: leads
```
id (INTEGER PRIMARY KEY)
name (TEXT)
phone (TEXT)       — telefone completo
instagram (TEXT)
service (TEXT)     — serviço solicitado
message (TEXT)
page (TEXT)        — "links" ou "portfolio"
created_at (DATETIME)
```

### Tabela: analytics_events
```
id (INTEGER PRIMARY KEY)
type (TEXT)        — "view", "click", "modal_open"
page (TEXT)        — "links" ou "portfolio"
data (JSON)        — dados do evento (ex: título do link)
session_id (TEXT)
referrer (TEXT)
created_at (DATETIME)
```

---

## 4. AUTENTICAÇÃO

### Sistema de Login
- Página separada: `/login.html`
- Campos: Usuário + Senha
- Endpoint: POST `/api/admin/login`

### Secrets no Cloudflare
```
ADMIN_USER = "maninhocriativos"
ADMIN_PASSWORD = (senha em secret)
ADMIN_TOKEN = (token em secret)
```

### Fluxo
1. Usuário preenche `/login.html`
2. Submete para `/api/admin/login` (POST username + password)
3. Backend valida contra ADMIN_USER e ADMIN_PASSWORD
4. Se OK, retorna ADMIN_TOKEN
5. Frontend salva token em `sessionStorage['mc_admin_token']`
6. Redireciona para `/admin.html`

### Verificação
- Admin.js verifica token ao carregar (checkAuth)
- Redireciona para `/login.html` se token inválido
- Todos os endpoints da API usam `requireAuth()` para validar bearer token

---

## 5. PÁGINAS PÚBLICAS

### index.html (Landing Page)
- Hero section: foto banner com animação do usuário Manitinha
- Headline: "Criatividade Digital que Gera Resultados" em 3 linhas
- Cards de links gerenciáveis via admin
- Carrossel de 48 fotos do ensaio fotográfico
- Seção de bio/sobre
- Modal de contato (nome, telefone, instagram, serviço, mensagem)
- Footer
- Tracking integrado

### portfolio.html (Portfólio)
- Hero com banner "Manitinha tech"
- Grid masonry de projetos do D1
- Filtro por categoria (abas)
- Lightbox para visualizar projetos
- Modal de contato igual ao de index.html
- Integrado com analytics

### login.html (Login Admin)
- Página standalone com background animado (orbs + grid)
- Logo da marca
- Campos: Usuário, Senha (com toggle mostrar/ocultar)
- Botão com spinner de loading
- Mensagens de erro
- Design SaaS profissional (accent azul #0070f3)

---

## 6. PAINEL ADMINISTRATIVO (/admin.html)

### Design
- Sidebar + Topbar + Content layout
- Sidebar: 220px fixed, dark background, nav items com active indicator (barra azul)
- Topbar: 52px sticky, blur backdrop, título da página
- Quick stats bar: visualizações hoje, leads totais, cliques, status sistema
- Design system SaaS: linear/vercel style (neutro dark, sem gradientes, accent #0070f3)

### Abas (Tabs)

#### 1. Links
- Tabela de links cadastrados com ícone, título, URL
- Status on/off com botão interativo
- Contador de cliques por link
- Ações: editar, deletar
- Formulário de criação: título, emoji, URL, cores gradiente, ordem
- Editor de link modal com preview

#### 2. Portfólio
- Tabela de projetos do D1
- Thumbnail, título, categoria
- Status on/off
- Ações: editar, deletar
- Upload via R2

#### 3. Leads
- Tabela com leads preenchidos no modal
- Colunas: nome, telefone, instagram, serviço, mensagem, data
- Ação de deletar
- Link de WhatsApp para contato
- Estatísticas: total de leads, por página, por serviço

#### 4. Analytics
- Cards com métricas: visualizações, cliques, modal opens, sessões únicas
- Gráfico de barras: últimos 30 dias de visualizações
- Top 20 links mais clicados com barra visual
- Visualizações por página (links vs portfólio)

#### 5. Perfil
- Editar dados do perfil (nome, bio, avatar URL)
- Editar cores de gradiente de fundo
- Salvar alterações

---

## 7. API ENDPOINTS

### Authentication
```
POST   /api/admin/login
       Body: { username, password }
       Response: { token }

GET    /api/admin/verify
       Headers: Authorization: Bearer <token>
       Response: { ok }
```

### Links Management
```
GET    /api/admin/links
       Response: { links: [...] }

POST   /api/admin/links
       Body: { title, url, icon, color_from, color_to, order_index }
       Response: { id, ... }

PATCH  /api/admin/links/:id
       Body: { is_active, ... }
       Response: { ok }

DELETE /api/admin/links/:id
       Response: { ok }
```

### Portfolio
```
GET    /api/admin/portfolio
       Response: { projects: [...] }

POST   /api/admin/portfolio
       Body: { title, category, description, image_url, project_url }
       Response: { id, ... }

DELETE /api/admin/portfolio/:id
       Response: { ok }
```

### Leads
```
GET    /api/admin/leads
       Response: { leads: [...] }

DELETE /api/admin/leads?id=<id>
       Response: { ok }

POST   /api/leads
       Body: { name, phone, instagram, service, message, page }
       Response: { id } (silencioso)
```

### Analytics
```
GET    /api/admin/analytics
       Response: {
         total_views,
         today_views,
         total_clicks,
         modal_opens,
         unique_sessions,
         by_page: [...],
         by_day: [...],
         top_links: [...]
       }
```

### Tracking
```
POST   /api/track
       Body: { type, page, session_id, referrer, data }
       Response: 204 No Content
```

### Profile
```
GET    /api/admin/profile
       Response: { profile: { name, bio, avatar_url, ... } }

POST   /api/admin/profile
       Body: { name, bio, avatar_url, bg_from, bg_via, bg_to }
       Response: { ok }
```

---

## 8. FLUXOS PRINCIPAIS

### Fluxo: Usuário preenche modal de contato
1. Modal abre ao clicar em "Contratar" ou WhatsApp
2. Usuário preenche: nome, telefone, instagram, serviço, mensagem
3. Ao submeter, construir mensagem WhatsApp
4. Salvar lead silenciosamente no D1 via POST `/api/leads`
5. Redirecionar para WhatsApp com mensagem pré-escrita
6. Modal fecha
7. Lead aparece no admin em até 1 segundo

### Fluxo: Admin gerencia links
1. Login em `/login.html` com usuário + senha
2. Redirect para `/admin.html` com token em sessionStorage
3. Sidebar carrega, abas viram acessíveis
4. Admin pode: criar link (form), editar (modal), deletar, ativar/desativar
5. Links aparecem no site imediatamente (sem reload necessário)
6. Cliques em links são rastreados em analytics_events

### Fluxo: Analytics automático
1. `track.js` carrega em todas as páginas (index.html, portfolio.html)
2. Gera/carrega session_id do sessionStorage
3. Registra page view ao carregar (POST `/api/track`)
4. Registra cliques em links e botões
5. Registra quando modal abre
6. Dados acumulam em analytics_events
7. Admin vê em tempo real na aba Analytics

---

## 9. DESIGN SYSTEM

### Paleta de Cores
```
Admin Panel (SaaS style):
  --bg:       #0a0a0a      (fundo principal)
  --bg2:      #111111      (superfícies)
  --bg3:      #161616      (hover)
  --border:   rgba(255,255,255,.08)
  --border2:  rgba(255,255,255,.12)
  --text:     #ededed       (texto principal)
  --text2:    #888         (texto secundário)
  --text3:    #555         (texto terciário)
  --accent:   #0070f3      (azul principal — igual Vercel)
  --accent-h: #0060df      (hover)
  --red:      #e5484d
  --green:    #00b341
  --amber:    #f5a623
  --purple:   #8b5cf6
```

### Componentes Principais
- Buttons: primary (accent bg), secondary (surface bg), ghost, danger
- Inputs: 34px altura, border subtle, focus ring azul
- Cards: surface bg, border subtle, no shadows (clean)
- Tables: striped hover, thead uppercase
- Badges: pill format, colored
- Modal: backdrop blur, smooth animation
- Toast: bottom center, auto-dismiss

### Tipografia
- Font-family: Inter
- Heading: 1.3-1.5rem, 700-800 weight
- Body: 0.82-0.9rem, 400-600 weight
- Small: 0.68-0.75rem, 500-700 weight
- Letter-spacing negativo em headlines (-0.4px a -1px)

---

## 10. PERFORMANCE

### Imagens
- Ensaio: 48 fotos em WebP (800px width)
- Logo: PNG com fallback CSS
- Banner: optimized PNG

### Bundle
- CSS: ~25KB (admin.css)
- JS: ~15KB (admin.js)
- Zero frameworks (vanilla)

### Caching
- Cloudflare Pages: cache automaticamente assets
- D1 queries: sem cache (live data)
- Analytics: batch POST com sendBeacon

---

## 11. SEGURANÇA

### Autenticação
- Token baseado em bearer token
- Validação em cada endpoint `/api/admin/*`
- SessionStorage (não cookie) — sessão por aba do navegador

### Inputs
- Validação básica em formulários
- SQL injection prevention via D1 prepared statements
- XSS prevention: sanitizar emoji/títulos

### Secrets
- ADMIN_USER, ADMIN_PASSWORD, ADMIN_TOKEN em Cloudflare Secrets
- Nunca expostos em código

---

## 12. PRÓXIMAS MELHORIAS

- Drag-and-drop para reordenar links no admin
- Upload de imagens via R2 no painel
- Dashboard overview com gráficos melhores
- Refinements no design do admin (ainda mais premium)
- Integração com mais redes sociais

---

## 13. COMO DEPLOYAR

```bash
# Push para main branch
git add .
git commit -m "..."
git push origin main

# GitHub Actions dispara automaticamente
# Cloudflare Pages roda wrangler deploy
# Site está vivo em ~2-3 minutos
```

---

## 14. URLS IMPORTANTES

- Site: https://links.maninhocriativos.com.br
- Portfólio: https://links.maninhocriativos.com.br/portfolio.html
- Admin Login: https://links.maninhocriativos.com.br/login.html
- Admin Panel: https://links.maninhocriativos.com.br/admin.html
- GitHub: https://github.com/maninhocriativos/maninho-criativos-links
- Cloudflare Project: maninho-criativos-links

---

## 15. CONTATO

- WhatsApp: 5592986096874
- Email: maninhocriativos@gmail.com
- GitHub: maninhocriativos

---

**Documento gerado em:** 2026-05-31
**Última atualização:** Deploy SaaS-grade admin redesign
