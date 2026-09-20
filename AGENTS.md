# AGENTS.md — Memória do projeto para agentes de IA

Leia este arquivo inteiro antes de mexer no código. Ele resume o que existe, como rodar, como publicar e o que ainda está pendente.
Detalhes históricos do sistema (versão inicial, tabelas antigas) estão em [SISTEMA.md](SISTEMA.md). Se algo aqui conflitar com o código, **o código vale mais**: corrija este arquivo.

_Última atualização: 2026-09-20._

## 1. O que é

Site + painel administrativo da **Maninho Criativos** (design gráfico / criativos), em português do Brasil.

- **Página pública de links / hub comercial**: `public/index.html`, `style.css`, `script.js`.
- **Portfólio**: `public/portfolio.html`, `portfolio.css`, `portfolio.js` (galerias vindas do D1, imagens no R2).
- **Painel admin** (único oficial): `public/admin.html`, `admin.css`, `admin.js`, `admin-ux.js`. Login em `public/login.html`.
- **CRM / financeiro**: clientes, projetos, fluxo de caixa, cobranças, recibos em PDF, despesas pessoais (aba "household").
- **Página de retorno do pagamento**: `public/pagamento-confirmado.html`.
- Domínio: `https://links.maninhocriativos.com.br`. Repositório: `github.com/maninhocriativos/maninho-criativos-links` (branch `main`).

## 2. Stack e regras de estilo

- HTML/CSS/JS **vanilla** no front (sem framework, sem bundler). ES modules no backend (`"type": "module"`).
- Backend: **Cloudflare Pages Functions** em `functions/api/**` (rotas por caminho de arquivo; arquivos com `_` no início são helpers, não rotas).
- Banco: **Cloudflare D1** (SQLite), binding `DB`, base `maninho-links-db`. Storage: **R2**, binding `STORAGE`.
- Worker separado de cobranças em `workers/billing-reminders.js` (config `wrangler.billing.jsonc`, nome `maninho-cobrancas`).
- Dependências: `pdf-lib` (recibos), `wrangler` e `sharp` (dev). Sem dependências novas sem necessidade.
- Textos de interface, mensagens de erro e comentários de domínio em **pt-BR**.
- Valores monetários sempre em **centavos inteiros** (`amount_cents`). Datas de negócio no fuso **America/Manaus** (UTC−4).
- Arquivos do working copy usam CRLF no Windows; os avisos "LF will be replaced by CRLF" do git são normais.

## 3. Comandos

```bash
npm test                    # node --test  (test/*.test.js, ~30 testes, sem rede)
npm run check               # scripts/check.mjs — valida sintaxe de todos os .js
npm run dev                 # wrangler pages dev public
npm run db:migrate          # migrations no D1 local
npm run db:migrate:prod     # migrations no D1 remoto
npm run deploy              # deploy manual do Pages (normalmente o CI faz isso)
npm run deploy:billing      # deploy do Worker de cobranças (NÃO é feito pelo CI)
npm run deploy:proposta     # deploy da proposta comercial (projeto Pages separado; NÃO é feito pelo CI)
```

Rode `npm test` e `npm run check` antes de qualquer commit.

## 4. Deploy / produção

- **Push na `main`** dispara `.github/workflows/deploy.yml`: `npm ci` → `npm run check` → `wrangler d1 migrations apply maninho-links-db --remote` → `wrangler pages deploy public --project-name=maninho-criativos-links`. Ou seja, **migrations novas vão para produção automaticamente no push**.
- O CI **não roda `npm test`** e **não faz deploy do Worker de cobranças**; este exige `npm run deploy:billing` manualmente.
- Secrets do CI: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Conta Cloudflare: `375b2294ff94a6b815441e2a764e7413`. D1 id: `807715b6-58cd-4b3f-894d-1920ff97ff68`.
- Migrations são a **única** fonte do schema (`migrations/NNNN_nome.sql`, aplicadas em ordem). Os `schema*.sql` da raiz são snapshots históricos — **nunca aplique**. Nova migration = novo arquivo com o próximo número; nunca edite uma já aplicada.

## 5. Configuração e secrets

Variáveis públicas em `wrangler.toml`: `INFINITEPAY_HANDLE` (`maninhocriativos`), `PUBLIC_BASE_URL`.
Secrets (definidos no Cloudflare, **nunca** no repositório; `.env*` está no `.gitignore`):

| Variável | Uso |
|---|---|
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | login do admin |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | e-mail de código de login / verificação e recibos |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM` | SMS de cobrança (Worker) |
| `ZAPI_INSTANCE_ID`, `ZAPI_INSTANCE_TOKEN`, `ZAPI_CLIENT_TOKEN` | WhatsApp de cobrança via Z-API (Worker) |
| binding `EMAIL` + `BILLING_FROM_EMAIL` | e-mail de cobrança pelo Cloudflare Email (Worker) |

## 6. Segurança (já implementado — preservar)

- Login: e-mail + senha + código temporário por e-mail; sessão aleatória em cookie `HttpOnly`, expira em 8 h.
- Toda rota em `functions/api/admin/**` deve chamar `requireAuth` (`functions/api/admin/_auth.js`). Rota nova de admin sem isso é bug.
- Endpoints públicos (`leads`, `track`, webhook) validam payload, limitam tamanho (`readJson(request, maxBytes)` em `_utils.js`) e usam rate limiting no D1 quando aplicável.
- Validação de entrada com helpers de `functions/api/_utils.js` (`text`, URLs só http/https, cores, inteiros).
- Upload do portfólio vai para o R2.

## 7. O que foi construído (histórico resumido)

**Base (commits antigos):** link hub, leads, analytics, autenticação, portfólio com galerias (migrations 0001–0009), CRM de design, clientes, fluxo de caixa com recorrência, recibos em PDF com assinatura.

**Página pública:** transformada em hub comercial, com refinamentos mobile (hero sem cobrir o retrato, hub restrito ao viewport, arte do portfólio sempre visível).

**Trabalho mais recente (migrations 0010–0015, testes em `test/`):**

- **0010 `billing_reminders`** — colunas de cobrança em `cash_transactions` (`payment_url`, `reminder_enabled/_email/_sms/_whatsapp`) e tabela `billing_reminder_deliveries` (única por transação+canal+slot → evita envio duplicado). O Worker `workers/billing-reminders.js` roda por cron em UTC `0 13/17/21 * * *` = **09h, 13h e 17h em Manaus** (slots 1–3), envia lembretes de cobranças `income` pendentes que vencem **hoje** por e-mail (Cloudflare Email), SMS (Twilio) e WhatsApp (Z-API), só para clientes ativos.
- **0011 `infinitepay_checkout`** — checkout automático **InfinitePay**: ao salvar uma cobrança, `createInfinitePayLink` (`functions/api/_infinitepay.js`) gera o link (`order_nsu` = `maninho-<uuid>`), substituindo o campo manual de link. Webhook público `POST /api/infinitepay/webhook` (`functions/api/infinitepay/webhook.js`) guarda o evento em `infinitepay_webhook_events` e **só marca como pago após confirmar em `payment_check` da InfinitePay e conferir o valor em centavos** (não confie no payload recebido).
- **0012 `client_contacts`** — vários e-mails/telefones por cliente (`client_contacts`), cada um com pessoa responsável obrigatória, um primário; contatos legados migrados. Lógica em `functions/api/admin/clients.js`.
- **0013 `cash_counterparty`** — despesas exigem fornecedor/beneficiário (`counterparty_name`, `counterparty_document`); nunca ligadas a dados de cobrança de cliente.
- **0014 `finance_alerts`** — tabela `finance_alert_deliveries` (alerta "três dias antes", e-mail/WhatsApp). **A tabela existe, mas nenhum código a usa ainda** (ver pendências).
- **0015 `household_expenses`** — `expense_scope` (`business`/`household`): despesas pessoais separadas das da empresa, com aba própria no admin e categorias próprias; receita nunca pode ser `household`. `GET /api/admin/cash-flow?scope=business|household`.
- **Admin UX** (`public/admin-ux.js`): busca sem acento, botão "Atualizar", estado `aria-busy`, banner de erro de requisição, labels ligados aos campos, login remodelado.
- Testes: `admin`, `billing-reminders`, `cash-flow`, `clients`, `infinitepay`, `utils` (30 passando em 2026-09-20).

Estado do banco remoto em 2026-09-20: migrations 0001–0015 **já aplicadas** em produção.

## 7.1 Proposta comercial (Carlos Mota)

- **Cliente: Carlos Mota**, autor do método M.O.T.A. (Mentalidade, Organização, Técnica, Ação). O M.O.T.A. é a primeira metodologia dentro do motor. (Versões antigas da página diziam "Mindora Edu"; foi corrigido.)
- Página estática em `proposta/index.html` (HTML/CSS/JS puros, um arquivo só) com `proposta/_headers` (noindex, nosniff) e `<meta robots noindex>`.
- Projeto Cloudflare Pages **próprio**: `maninho-proposta` (separado do site de links). Deploy manual: `npm run deploy:proposta`. Domínio: `proposta.maninhocriativos.com.br` (CNAME `proposta` → `maninho-proposta.pages.dev`, proxied, já criado; o token do `.env.local` tem DNS Edit).
- **Conteúdo (versão 2, 2026-09-20):** vende o "Sistema Inteligente de Formação Contínua de Líderes" (motor adaptativo, não um LMS). Seções: valor (comparativo), ciclo de 10 etapas, Diagnóstico 360 (simulador interativo), 4 fontes de avaliação + princípios de confiança, gêmeo de desenvolvimento, dois painéis (líder / RH), plataforma e ativos (M.O.T.A. é a primeira metodologia dentro do motor), fases e CTA.
- **Envelope de abertura (premium):** overlay `#gate` com envelope azul-noite, filetes e forro em ouro (SVG), lacre de cera com monograma M (borda orgânica gerada no JS), brilho que percorre o papel, reflexo que segue o mouse, estrelas/poeira dourada. Sequência ao clicar no envelope ou em "Abrir proposta" (movimento **contínuo, sem pausas**: uma única animação WAAPI `letter.animate` com 3 keyframes — repouso → carta fora do envelope → tela cheia; ~3 s até a capa): lacre se rompe com flash de luz → aba abre (3D) → a carta sobe e, sem parar, é puxada até cobrir a tela → o texto da carta some (`is-clearing`) e a capa entra por baixo (sem título duplicado). O envelope usa `--ew` que respeita a altura da tela; em telas verticais o texto da carta se ajusta à faixa central visível. A carta tem o mesmo fundo do hero de propósito. Lógica em `<script>` próprio e à prova de falhas (se algo quebrar, a proposta aparece). O envelope aparece **sempre** ao carregar, mesmo com `#seção` (o hash é lido, removido da URL e usado para rolar depois). Pular o envelope (testes/screenshots): `/?direto`. Respeita `prefers-reduced-motion`. Cuidado: animações CSS com `fill-mode: both` anulam classes de opacity; use `animation: none` ao esconder.
- **Desempenho da abertura (medido com CDP, `cdp-perf`: rAF gaps em tempo real):** antes 3–4 quadros >50 ms (pico 117 ms); depois 0 quadros >50 ms. Regras que mantêm isso: (1) só `transform`/`opacity` animam (nada de `filter`, `backdrop-filter`, `mask`, `left`); (2) a carta é desenhada já no tamanho que cobre a tela e só é *reduzida* (nunca ampliada → nunca borra nem re-rasteriza); (3) elementos que começam invisíveis e entram na abertura ficam com `opacity: .01` + `will-change` para serem pintados antes; (4) o trabalho pesado (`reveal()`) roda quando a carta está estática cobrindo a tela e é dividido em quadros diferentes; (5) animações decorativas e da capa ficam pausadas enquanto o gate está ativo (`html.locked`); (6) paralaxe usa `transform` direto por elemento (`_s` + `paint()`), leituras e escritas em fases separadas, sem variáveis CSS herdadas (evita recálculo de estilo em cascata).
- **Efeitos "wow" (inspirados no site tryfit.com.br, reimplementados do zero):** (1) **ciclo de 10 etapas como jornada horizontal fixada** (`#ciclo.pin-on`: a seção fica `position: sticky` e a rolagem vertical desloca o trilho; JS mede o trilho e dá altura ao `#cyclePin`; só ≥1000px, altura ≥620px e sem reduced-motion — senão vira grade; `overflow: clip` na seção porque `overflow: hidden` quebra o sticky); (2) **títulos** (`.sec-h2`, `.final-title`) sobem palavra por palavra de máscaras; (3) **manifesto** (`#manifesto`, sticky) cujas palavras acendem conforme a rolagem; (4) faixa **"em números"** com contagem (`data-count`); (5) barra de **progresso** dourada no topo, nav que esconde ao descer, **índice de capítulos** lateral (≥1200px); (6) só com mouse (`pointer: fine`): **cursor** dourado (ponto + anel, ponto vira círculo `mix-blend-mode: difference` sobre links), **botões magnéticos** e **cards com luz** (`.glow`, `--mx/--my`); (7) bloco "como começamos" no final. Toda a rolagem passa por um único `tick()` por quadro (leituras primeiro, escritas depois). Rolagem completa medida: 0 quadros >25 ms.
- **Paralaxe (forte):** atributos `data-speed` (vertical), `data-speedx` (horizontal), `data-rot` (rotação) e `data-depth` (mouse). Camadas: grade/brilhos/rede de nós na capa, numerais grandes e formas (`.shape` orb/ring/sq/dot) em cada seção, duas faixas de texto que deslizam na horizontal (`.band`), fade do conteúdo da capa e cards em grade com velocidades alternadas (`stagger()`, só a partir de 1000px). O efeito de aparecer ao rolar (`.reveal`) usa a propriedade CSS `translate` (não `transform`) justamente para não anular a paralaxe, e uma varredura por `getBoundingClientRect` (não IntersectionObserver). Efeitos de hover usam `translate` pelo mesmo motivo.
- Simulador (seção 03, cabeçalho centralizado): 9 competências (M, O, T, A + Comunicação, Feedback, Delegação, Decisão, Desenvolvimento de pessoas) em sliders; o resultado é um **radar SVG** (`renderRadar`, fontes maiores no celular) com as 3 menores como prioridades; a menor gera a microtrilha em 6 cards (teoria, simulação, prática real, acompanhamento, avaliação, reavaliação). Valores e painéis são **ilustrativos** e a página avisa.
- Botão final abre o WhatsApp da Maninho com mensagem pronta.
- **Não inventar** preço, prazo ou métricas: a página diz que escopo, cronograma e investimento são definidos com o cliente. Ainda não há seção de investimento.
- Teste local: servir a pasta `proposta/` em http e abrir no Chrome; em screenshots headless use iframes (hash direto) e desative as transições, pois o fade não completa sob virtual-time.

## 8. Pendências / dívidas conhecidas

1. **Alertas de 3 dias antes** (`finance_alert_deliveries`): schema pronto, lógica de envio **não implementada** no Worker.
2. **Webhook InfinitePay é público e grava a cada chamada** — considerar rate limit. Reenvio do mesmo `transaction_nsu` volta o evento a `received` e reprocessa; ideal ignorar quando a cobrança já está `paid`.
3. O CI não executa `npm test` — vale adicionar um passo.
4. O Worker `maninho-cobrancas` foi publicado pela primeira vez em 2026-09-20 (antes disso nunca existiu na conta). Deploy é manual (`npm run deploy:billing`), com `workers_dev`/`preview_urls` desativados (só cron, sem URL pública). Precisa dos secrets Twilio/Z-API **no próprio Worker** (`npx wrangler secret put NOME --config wrangler.billing.jsonc`); sem eles, SMS/WhatsApp falham com erro registrado (e-mail funciona via binding). O token em `.env.local` precisa de Workers Scripts: Edit.
5. Lixo versionado na raiz: `CRM THIAGO.zip`, `design_handoff_crm_thiago/` (referência de design do CRM) e vários scripts de conversão de imagem (`*.py`, `convert-*.mjs`). Não remover sem confirmar com o dono.
6. `SISTEMA.md` é de 2026-05-31 e está parcialmente desatualizado (arquitetura pré-CRM).

## 9. Convenções para agentes

- Peça confirmação antes de ações irreversíveis ou externas (migrations remotas manuais, deploy, apagar dados, envio de mensagens reais a clientes).
- Nunca commite segredos nem rode SMS/WhatsApp/e-mail reais em testes; os testes usam stubs.
- Mantenha o padrão do código existente (SQL inline com `?` bindings, `json()` para respostas, erros em pt-BR).
- Ao terminar uma mudança relevante, atualize a seção 7/8 deste arquivo.
