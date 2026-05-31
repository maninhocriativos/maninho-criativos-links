# Handoff: CRM Thiago — Painel Admin (Portfólio Freelancer)

## Overview
Painel administrativo (dark SaaS) para um portfólio de freelancer (designer/dev). O dono ("Thiago") gerencia, a partir de uma única área logada:
- **Analytics** — métricas de tráfego e cliques do perfil público
- **Links** — gerenciamento de links estilo Linktree (com preview mobile ao vivo)
- **Portfólio** — vitrine de projetos/cases
- **Leads** — contatos recebidos pelo site (este é o "CRM": lista + detalhe do contato)
- **Perfil** — dados públicos e configurações da conta

Inspiração visual: **Linear / Vercel / Railway**. Dark, profissional, 1 única cor de acento, sem gradientes neon, sem emojis, grid de 8px.

---

## About the Design Files
Os arquivos em `src/` são **referências de design feitas em HTML + React (via Babel no browser)** — protótipos que mostram o visual e o comportamento pretendidos. **Não são código de produção para copiar diretamente.**

A tarefa é **recriar estes designs no ambiente do codebase de destino** (Next.js, Vite+React, etc.), usando os padrões e bibliotecas já estabelecidos nele. Se ainda não existe um ambiente, escolha o framework mais apropriado (recomendado: **React + Vite** ou **Next.js**, já que os protótipos são em React) e implemente lá.

Os protótipos usam:
- React 18 (UMD) + Babel standalone — **isto é só para o protótipo rodar sem build**. No codebase real, use JSX compilado normalmente.
- Estilos via objetos `style={{}}` inline + variáveis CSS (`var(--*)`) definidas em `styles.css`. No codebase real, considere migrar para CSS Modules, Tailwind ou styled-components — **mas preserve os tokens** (ver Design Tokens).
- Ícones SVG inline (`icons.jsx`). Pode trocar por `lucide-react` (os ícones foram desenhados no estilo Lucide/Feather, então o mapeamento é quase 1:1).

---

## Fidelity
**Alta fidelidade (hifi).** Cores, tipografia, espaçamento e interações são finais e devem ser recriados fielmente. As medidas e hex abaixo são exatas.

---

## Design Tokens
Definidos em `src/styles.css` no `:root`. **Esta é a fonte da verdade do design system.**

### Cores — Acento (única)
| Token | Valor | Uso |
|---|---|---|
| `--accent` | `#0070f3` | Cor de acento única (botões primários, links ativos, destaques) |
| `--accent-hover` | `#1a85ff` | Hover do primário |
| `--accent-press` | `#0061d6` | Pressionado |
| `--accent-soft` | `rgba(0,112,243,.14)` | Fundo suave (badges, ícone ativo) |
| `--accent-ring` | `rgba(0,112,243,.40)` | Anel de foco |

### Cores — Superfícies (near-black, escalonadas)
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0a0a0a` | Fundo da página |
| `--surface-1` | `#0f0f10` | Sidebar, barras, inputs |
| `--surface-2` | `#141415` | Cards |
| `--surface-3` | `#1a1a1c` | Elevado / hover |
| `--surface-4` | `#202022` | Chips, trilhas de progresso |

### Cores — Bordas (neutras, NÃO coloridas)
| Token | Valor |
|---|---|
| `--border` | `rgba(255,255,255,.08)` |
| `--border-strong` | `rgba(255,255,255,.14)` |
| `--border-faint` | `rgba(255,255,255,.05)` |

### Cores — Texto
| Token | Valor |
|---|---|
| `--text` | `#ededed` |
| `--text-2` | `#a0a0a8` (secundário) |
| `--text-3` | `#6c6c74` (terciário/faint) |
| `--text-on-accent` | `#ffffff` |

### Cores — Semânticas (baixa saturação, SÓ para status)
| Token | Valor | Soft |
|---|---|---|
| `--green` | `#30a46c` | `rgba(48,164,108,.14)` |
| `--amber` | `#e0a30a` | `rgba(224,163,10,.14)` |
| `--red` | `#e5484d` | `rgba(229,72,77,.14)` |
| `--violet` | `#8e6cf0` | `rgba(142,108,240,.14)` |

### Espaçamento — grid de 8px
`--s-1:4` · `--s-2:8` · `--s-3:12` · `--s-4:16` · `--s-5:24` · `--s-6:32` · `--s-7:48` · `--s-8:64` (px)

### Raio
`--r-sm:6` · `--r-md:8` (padrão) · `--r-lg:12` · `--r-full:999` (px)

### Alturas de controle (SISTEMA FIXO — respeitar)
| Token | Valor | Uso |
|---|---|---|
| `--h-sm` | `28px` | Botão small, tabs |
| `--h-md` | `34px` | **Botão padrão + TODOS os inputs** |
| `--h-lg` | `38px` | Botão large, itens da nav |

### Sombras (sutis, sem brilho colorido)
`--shadow-sm: 0 1px 2px rgba(0,0,0,.4)` · `--shadow-md: 0 4px 16px rgba(0,0,0,.45)` · `--shadow-lg: 0 12px 40px rgba(0,0,0,.55)`

### Tipografia
- Família: **Poppins** (400/500/600/700) — Google Fonts. Fallback: `system-ui, -apple-system, sans-serif`.
- Base: `14px`, line-height `1.5`.
- Escala utilitária (classes em `styles.css`):
  - `.t-display` 28px/600/-0.02em
  - `.t-h1` 20px/600/-0.015em
  - `.t-h2` 15px/600/-0.01em
  - `.t-body` 14px/400
  - `.t-sm` 13px · `.t-xs` 12px
  - `.t-label` 11px/600, uppercase, letter-spacing .06em, cor `--text-3`
  - `.t-mono` → `font-variant-numeric: tabular-nums` (para números/métricas)
  - `.t-muted` (text-2) · `.t-faint` (text-3)

### Densidade (tweakável)
Atributo `[data-density="compact"]` no `<html>` reduz: `--gutter` (24→16), `--card-pad` (20→14), `--row-h` (52→40), `--stack` (16→10), `--sidebar-w` (248→224). Padrão = "comfortable".

---

## Layout Global (Shell)
Definido em `src/shell.jsx` + montado em `src/app.jsx`.

- **Container raiz**: `display:flex; height:100%` — sidebar fixa + main flexível.
- **Sidebar** (`--sidebar-w`, default 248px): fundo `--surface-1`, borda direita `--border`, padding 16/14px. De cima pra baixo:
  1. **Brand**: quadrado 30×30 raio 8 com fundo `--accent` e a letra "t" (700, branco) + nome do dono + site.
  2. **Nav** (label "Painel"): 5 itens, altura 38px cada, gap 2px. Item ativo: fundo `--surface-3`, texto `--text`, ícone na cor `--accent`, e uma **barra de 3px `--accent`** colada na esquerda. Item "Leads" mostra um **badge com contagem de leads novos**.
  3. Spacer flex.
  4. Botão "Ver site público" (outline) com ícone globe + external.
  5. **Conta**: avatar + nome + "Plano Pro" + chevron, abre menu dropdown (Editar perfil / Configurações / Sair).
- **Main**: coluna flex. **Topbar** sticky (altura 64px, borda inferior, `backdrop-filter: blur(8px)`) com título (`.t-h1`) + subtítulo (`.t-sm .t-muted`) à esquerda e ações à direita. Conteúdo abaixo com `overflow-y:auto`.
  - Exceção: no **detalhe de um lead**, a topbar global some (a própria view tem seu header de "voltar").

---

## Screens / Views

### 1. Analytics (`src/view-analytics.jsx`)
**Propósito:** visão geral de tráfego e performance do perfil público.
- **Topbar:** título "Analytics", subtítulo "Últimos 14 dias…", ação botão "Exportar" (default, ícone download).
- **Linha de KPIs:** grid 4 colunas, gap `--stack`. Cada `KpiCard` (em `shell.jsx`): label + ícone (30×30, fundo `--surface-3`), valor grande (`.t-display .t-mono` 26px) e delta (verde se ≥0 / vermelho se <0, com seta). KPIs: Visitas (12.640 +18,2%), Cliques (9.475 +12,4%), Leads (38 +6), Taxa de cliques (74,9% −2,1%).
- **Card "Tráfego do perfil":** header com legenda (linha sólida acento = Visitas; linha tracejada `--text-3` = Cliques) + `Tabs` (7d/14d/30d). Gráfico `AreaChart` (SVG, viewBox 760×220): série A = área com gradiente do acento + linha sólida 2.5px acento + ponto no fim; série B = linha tracejada. Gridlines horizontais em `--border-faint`. Eixo X com 6 labels de data.
- **Grid 2 colunas (1.3fr / 1fr):**
  - **Links mais clicados:** lista com título + nº (`.t-mono`) + barra de progresso (6px, raio 3). 1ª barra cor acento sólida; demais `color-mix` do acento a 55%.
  - **Coluna direita (stack):** Card "Fontes de tráfego" com **Donut** (`conic-gradient`, 116px, furo central com total "12,6k visitas") + legenda; Card "Dispositivos" com 3 barras (Mobile 68 / Desktop 27 / Tablet 5).

### 2. Links (`src/view-links.jsx`)
**Propósito:** gerenciar os links do perfil público (estilo Linktree).
- **Topbar:** "Links", ação "Novo link" (primário).
- **Layout grid 2 colunas (1fr / 300px):**
  - **Esquerda — lista de links:** contador "X de Y ativos · arraste para reordenar". Cada `LinkRow` (altura ~60px, card `--surface-2`): handle de **drag (grip)** → reordena via drag&drop nativo; ícone (36×36 raio 9); título + URL (com ícone link); **cliques** (`.t-mono` + label); divisor vertical; **`Toggle`** ativo/inativo (linha inativa cai pra opacity .62); menu `...` (Editar / Copiar URL / Abrir / Excluir). No fim, botão tracejado "Adicionar link".
  - **Direita — preview mobile ao vivo** (sticky): "moldura" de telefone (raio 26, padding 12) com tela radial escura mostrando avatar, @handle, role, ícones sociais e os **links ativos** renderizados como botões. Atualiza conforme toggles/reorder. Abaixo, card com "Total de cliques".

### 3. Portfólio (`src/view-portfolio.jsx`)
**Propósito:** vitrine de projetos/cases.
- **Topbar:** "Portfólio", subtítulo nº de projetos, ação "Novo projeto" (primário).
- **Barra:** `Tabs` (Todos·N / Publicados / Rascunhos) + texto à direita.
- **Grid 3 colunas** de `ProjectCard`:
  - Thumb 156px de altura = **placeholder** (gradiente escuro derivado de um `hue` por projeto + ícone image central). ⚠️ São placeholders — no codebase real, usar imagens reais dos projetos.
  - Badges sobre a thumb: "Destaque" (azul, canto sup. esq., se featured) e status "Publicado" (verde) / "Rascunho" (neutro) no canto sup. dir.
  - **Hover** na thumb: overlay escuro com botões "Editar" + abrir.
  - Meta: título + ano, categoria, descrição (`text-wrap:pretty`), e rodapé com views (`.t-mono`).
  - Último card do grid: botão tracejado "Novo projeto".

### 4. Leads (`src/view-leads.jsx`) — o "CRM"
**Propósito:** gerenciar contatos recebidos pelo site. Duas telas: lista (tabela) e detalhe.

**4a. Lista (`LeadsTable`):**
- **Topbar:** "Leads", subtítulo "N contatos · M novos", ação "Exportar CSV".
- Barra de filtros: `Tabs` (Todos / Novos / Qualificados / Negociação / Ganhos) + `Input` de busca (ícone search, 240px) + botão "Filtros".
- **Tabela** dentro de um Card (sem padding, overflow hidden). Header (altura 42, `.t-label`, fundo `--surface-1`) e linhas em **CSS grid**: colunas `2.4fr 1.3fr 1fr 1fr 0.9fr 40px` = Lead / Origem / Status / Valor / Recebido / chevron.
  - Coluna **Lead**: Avatar 34 + nome + (role · empresa).
  - **Status**: `Badge` com `dot`, tom por status (ver State).
  - **Valor**: `.t-mono`, alinhado à direita, em cinza se 0 ("—").
  - Linha inteira clicável (hover `--surface-3`) → abre o detalhe. Altura mín = `--row-h`.
  - Empty state centralizado se a busca não retorna nada.

**4b. Detalhe (`LeadDetail`):**
- **Header próprio** (sem topbar global): botão "← Leads" + ações à direita: "Responder" (default), "Agendar call" (primário), menu `...` (Marcar como ganho/perdido / Excluir).
- **Grid 2 colunas (320px / 1fr):**
  - **Esquerda (sticky):** Card de perfil (avatar 64, nome 17/600, role, badge de status + estrelas de rating); lista `InfoRow` (Empresa, E-mail [copiável], Telefone [copiável], Local, Origem, Recebido em). Card "Valor potencial" (`.t-mono` 22px + ícone dollar em chip acento). Chips de tags.
  - **Direita (stack):** Card "Mensagem recebida" (ícone mail acento + via origem + texto da mensagem em itálico/aspas). Card "Adicionar nota / resposta" (`Textarea` + botões "Salvar nota" ghost / "Enviar resposta" primário). Card "Histórico" = **timeline vertical** (linha conectora `--border`, marcadores circulares 30px coloridos por tipo: ganho=verde, perdido=vermelho, demais=neutro; ícone por tipo de evento; título + data + detalhe). Renderizada em ordem cronológica reversa (mais recente no topo).

### 5. Perfil (`src/view-profile.jsx`)
**Propósito:** dados públicos + configurações da conta.
- **Topbar:** "Perfil". Conteúdo com `max-width:880px` centralizado.
- Card cabeçalho: avatar 72 + nome/@handle + botão "Trocar foto"; depois **form grid 2 colunas** (`Field`): Nome, Usuário (hint), Título, Localização, Bio (textarea, full width, contador), E-mail, Site. Rodapé com "Cancelar" (ghost) + "Salvar alterações" (primário).
- Card "Redes sociais": lista de SOCIALS (ícone + nome + url + editar), botão "Adicionar" no header da seção.
- Card "Visibilidade & privacidade": `SettingRow` (Perfil público / Formulário de contato) com `Toggle`.
- Card "Notificações": `SettingRow` (Novos leads por e-mail / Resumo semanal).
- **Zona de perigo**: Card com borda avermelhada + botão "Excluir conta" (variant danger).

---

## Componentes (Design System) — `src/ui.jsx`
Recriar como componentes reais no codebase. Props e comportamento:

- **`Button`** — `variant`: primary | default | ghost | outline | danger; `size`: sm (28px) | md (34px) | lg (38px); props `icon`, `iconRight`, `full`, `disabled`. Transições de 140ms em background/color/border. Botão só-ícone vira quadrado (lado = altura).
- **`Input`** — altura fixa 34px, `icon` opcional, foco = borda acento + ring `0 0 0 3px --accent-soft`. Fundo `--surface-1`.
- **`Textarea`** — mesmos estados de foco, `resize: vertical`.
- **`Badge`** — `tone`: neutral | blue | green | amber | red | violet; `dot` opcional (bolinha 6px). Altura 22, raio full, fonte 12/500.
- **`Avatar`** — iniciais sobre gradiente derivado de hue (hash do nome) OU `src`. `size` configurável. Borda `--border`.
- **`Toggle`** — switch 38×22 (ou 32×18 sm), knob branco, fundo acento quando on.
- **`Card`** — fundo `--surface-2`, borda `--border`, raio `--r-lg`, padding `--card-pad`. `hover` opcional intensifica a borda.
- **`Tabs`** — segmented pill: trilha `--surface-1`, item ativo `--surface-4`. Altura 28.
- **`Menu`** — dropdown com `items` (cada um: icon, label, onClick, danger, divider). Fecha ao clicar fora. `align` left/right.
- **`SectionTitle`**, **`Divider`** — auxiliares.
- **Ícones** (`icons.jsx`): SVG stroke 1.6, viewBox 24, `currentColor`. ~60 ícones no estilo Lucide/Feather. **Sugestão:** substituir por `lucide-react` no codebase (nomes equivalem: search, plus, mail, phone, calendar, trash, edit, eye, link, etc.).

---

## Interactions & Behavior
- **Navegação:** estado `route` em `app.jsx` troca a view. Clicar num item da sidebar (ou do bottom nav no mobile) muda `route` e zera `openLead`.
- **Leads:** clicar numa linha seta `openLead` (id) → renderiza `LeadDetail`; "← Leads" volta. Ações "Marcar como ganho/perdido" atualizam o `status` do lead no estado.
- **Filtro/busca de leads:** `useMemo` filtra por status (tabs) e por texto (nome/empresa/role/origem).
- **Links:** `Toggle` alterna `active`; **drag&drop** reordena (HTML5 draggable — `onDragStart/onDragOver/onDrop` com splice no array). Preview mobile reflete só os ativos.
- **Tweaks** (painel canto inf. dir., `tweaks-panel.jsx`): controla `density` (comfortable/compact → atributo `data-density`), `radius` (2–16px → sobrescreve `--r-*`), e `accent` (3 presets: #0070f3 Vercel, #8e6cf0 Linear, #30a46c Railway → sobrescreve `--accent*`). **No codebase real, isto é opcional** — serve para demonstrar a flexibilidade dos tokens; pode virar um theme switcher ou ser removido.
- **Transições:** hovers e estados em ~120–160ms. Sem animações pesadas.

---

## Responsive Behavior
Layout totalmente responsivo via media queries em `styles.css` (os grids de layout usam **classes CSS**, não estilos inline, justamente para poderem ser sobrescritos por breakpoint). Breakpoints:

| Largura | Mudança |
|---|---|
| **≤1100px** | KPIs do Analytics passam de 4 → 2 colunas |
| **≤1000px** | Grid do Portfólio passa de 3 → 2 colunas |
| **≤860px** (tablet→mobile) | **Sidebar some** e dá lugar a um **bottom nav fixo** (`.app-bottomnav`, 58px, espelha os 5 itens da NAV com badge de leads novos); grids de 2 colunas (Analytics, Links, Detalhe do Lead) viram 1 coluna; colunas `sticky` deixam de grudar; conteúdo ganha `padding-bottom` para não ficar atrás do bottom nav |
| **≤680px** | **Tabela de Leads vira cards empilhados** — o header da tabela some e cada linha usa `grid-template-areas` (nome+avatar à esquerda; status, valor e data empilhados à direita) |
| **≤560px** (mobile estreito) | KPIs, Portfólio e form do Perfil em 1 coluna; topbar com altura automática |

Padrões de implementação:
- **Bottom nav** (`BottomNav` em `shell.jsx`): renderizado sempre, escondido por CSS no desktop (`.app-bottomnav{display:none}`) e exibido `flex` ≤860px; a sidebar (`.app-sidebar`) faz o inverso. No codebase real, use o padrão de navegação responsiva do seu framework.
- **Tabs roláveis:** o componente `Tabs` tem `overflow-x:auto` + scrollbar oculta para rolar na horizontal quando não cabem (ex.: filtros de Leads no mobile).
- **Tabela→cards:** conversão 100% CSS via `grid-template-areas` em `.lead-row` + classes de célula (`lc-lead`, `lc-status`, `lc-value`, `lc-date`, `lc-source`, `lc-chev`) para reposicionar/ocultar por breakpoint.
- `env(safe-area-inset-bottom)` no bottom nav para respeitar o home-indicator do iOS.

---

## State Management
Tudo client-side com `useState` no protótipo. Mapeamento para o codebase real:
- `route` (aba atual) → router real (Next.js routes / React Router).
- `leads[]`, `openLead` → vir de API/DB; status do lead é mutável.
- `links[]` (ordem + active) → persistir ordem e flag no backend.
- Forms do Perfil → estado controlado, submeter a API.
- Tweaks (density/accent/radius) → persistência opcional em localStorage / preferências do usuário.

### Modelos de dados (ver `src/data.jsx` para exemplos completos)
- **Lead**: `{ id, name, company, role, status, email, phone, location, source, value, createdAt, lastActivity, rating(1-5), tags[], message, timeline[] }`. `timeline[i] = { type: message|view|call|note|won|lost, title, detail, date }`.
- **Link**: `{ id, title, url, icon, active, clicks, ctr }`.
- **Project**: `{ id, title, category, year, status: published|draft, featured, hue, views, desc }`.
- **Status do lead** → label + tom de badge: `new`→Novo/blue, `qualified`→Qualificado/violet, `negotiation`→Negociação/amber, `won`→Ganho/green, `lost`→Perdido/red.

---

## Assets
- **Fonte:** Poppins via Google Fonts (`@import` em `styles.css`). No codebase, usar `next/font` ou self-host.
- **Ícones:** SVG inline próprios (`icons.jsx`) — recomenda-se trocar por `lucide-react`.
- **Imagens de projeto:** atualmente **placeholders** (gradiente + ícone). Substituir por imagens/thumbnails reais.
- **Avatares:** gerados (iniciais + gradiente). Pode manter como fallback ou usar fotos reais.
- Nenhum asset de marca de terceiros é usado.

---

## Files (em `src/`)
| Arquivo | Conteúdo |
|---|---|
| `index.html` | Entrada — carrega React/Babel + todos os scripts na ordem |
| `styles.css` | **Tokens do design system** + reset + utilitários de tipografia |
| `icons.jsx` | Biblioteca de ícones SVG + componente `Icon` |
| `ui.jsx` | Componentes base (Button, Input, Badge, Avatar, Toggle, Card, Tabs, Menu…) |
| `data.jsx` | Dados mock (OWNER, LINKS, PROJECTS, LEADS, ANALYTICS) + modelos |
| `shell.jsx` | Sidebar, Topbar, KpiCard, definição da NAV |
| `tweaks-panel.jsx` | Painel de tweaks (opcional no codebase) |
| `view-analytics.jsx` | Aba Analytics (gráficos em SVG/CSS) |
| `view-links.jsx` | Aba Links + preview mobile |
| `view-portfolio.jsx` | Aba Portfólio (grid de cards) |
| `view-leads.jsx` | Aba Leads (tabela + detalhe) |
| `view-profile.jsx` | Aba Perfil (forms + settings) |
| `app.jsx` | Roteamento entre abas + aplicação dos tweaks + topbars |

### Como rodar o protótipo localmente
Abrir `index.html` num servidor estático (ex.: `npx serve src` ou a extensão Live Server). Não precisa de build — React e Babel vêm via CDN. Os arquivos `.jsx` são transpilados no browser (só para o protótipo; não fazer isso em produção).
