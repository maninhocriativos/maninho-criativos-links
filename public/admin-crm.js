/* ============================================================
   Maninho Criativos — Admin CRM
   Vanilla JavaScript | Cloudflare Pages
   ============================================================ */

const TOKEN_KEY = 'mc_admin_token';

// ============================================================
// STATE
// ============================================================
const state = {
  route: 'analytics',
  leads: [],
  openLead: null,
  links: [],
  portfolio: [],
  profile: {},
  analytics: {},
};

// ============================================================
// AUTH
// ============================================================
async function checkAuth() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.replace('/login.html');
    return false;
  }

  try {
    const res = await fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      sessionStorage.removeItem(TOKEN_KEY);
      window.location.replace('/login.html');
      return false;
    }
    return true;
  } catch {
    window.location.replace('/login.html');
    return false;
  }
}

function token() {
  return sessionStorage.getItem(TOKEN_KEY);
}

async function apiCall(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...options.headers
    }
  });
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}

// ============================================================
// ROUTING
// ============================================================
function setRoute(route) {
  state.route = route;
  state.openLead = null;
  render();
}

// ============================================================
// RENDER
// ============================================================
function render() {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === state.route);
  });
  document.querySelectorAll('.bnav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === state.route);
  });

  // Update topbar
  const titles = {
    analytics: 'Analytics',
    links: 'Links',
    portfolio: 'Portfólio',
    leads: 'Leads',
    profile: 'Perfil'
  };
  document.getElementById('topbar-title').textContent = titles[state.route] || 'Admin';

  // Render view
  if (state.openLead) {
    renderLeadDetail();
  } else if (state.route === 'analytics') {
    renderAnalytics();
  } else if (state.route === 'links') {
    renderLinks();
  } else if (state.route === 'portfolio') {
    renderPortfolio();
  } else if (state.route === 'leads') {
    renderLeads();
  } else if (state.route === 'profile') {
    renderProfile();
  }
}

// ============================================================
// LOAD DATA
// ============================================================
async function loadData() {
  try {
    const [analyticsRes, leadsRes, linksRes, portfolioRes, profileRes] = await Promise.all([
      apiCall('/api/admin/analytics'),
      apiCall('/api/admin/leads'),
      apiCall('/api/admin/links'),
      fetch('/api/admin/portfolio').then(r => r.json()).catch(() => ({})),
      apiCall('/api/admin/profile')
    ]);

    state.analytics = analyticsRes;
    state.leads = leadsRes.leads || [];
    state.links = linksRes.links || [];
    state.portfolio = portfolioRes.portfolio || portfolioRes.projects || [];
    state.profile = profileRes.profile || {};

    // Update badge
    const newLeads = state.leads.filter(l => l.status === 'new').length;
    const badge = document.getElementById('leads-badge');
    const bnav = document.getElementById('bnav-badge');
    if (newLeads > 0) {
      badge.textContent = newLeads;
      badge.style.display = 'flex';
      bnav.textContent = newLeads;
      bnav.style.display = 'flex';
    }

    render();
  } catch (err) {
    console.error('Failed to load data:', err);
  }
}

// ============================================================
// VIEW: ANALYTICS
// ============================================================
function renderAnalytics() {
  const view = document.getElementById('view-analytics');
  const a = state.analytics;

  view.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:var(--stack)">

      <!-- KPIs -->
      <div class="grid-kpi">
        <div class="card">
          <div style="font-size:12px; color:var(--text-2); margin-bottom:8px">VISITAS</div>
          <div class="t-display t-mono" style="color:var(--accent)">${a.total_views || 0}</div>
          <div style="font-size:12px; color:var(--text-2); margin-top:4px">+${a.today_views || 0} hoje</div>
        </div>
        <div class="card">
          <div style="font-size:12px; color:var(--text-2); margin-bottom:8px">CLIQUES</div>
          <div class="t-display t-mono" style="color:var(--accent)">${a.total_clicks || 0}</div>
          <div style="font-size:12px; color:var(--text-2); margin-top:4px">Em todos os links</div>
        </div>
        <div class="card">
          <div style="font-size:12px; color:var(--text-2); margin-bottom:8px">ABERTURAS MODAL</div>
          <div class="t-display t-mono" style="color:var(--accent)">${a.modal_opens || 0}</div>
          <div style="font-size:12px; color:var(--text-2); margin-top:4px">Contatos iniciados</div>
        </div>
        <div class="card">
          <div style="font-size:12px; color:var(--text-2); margin-bottom:8px">SESSÕES ÚNICAS</div>
          <div class="t-display t-mono" style="color:var(--accent)">${a.unique_sessions || 0}</div>
          <div style="font-size:12px; color:var(--text-2); margin-top:4px">Usuários únicos</div>
        </div>
      </div>

      <!-- Links mais clicados -->
      <div class="card">
        <div class="card-header">
          <h3>Links Mais Clicados</h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px">
          ${(a.top_links || []).slice(0, 5).map((link, i) => {
            const total = (a.top_links || []).reduce((s, l) => s + (l.clicks || 0), 0);
            const pct = total > 0 ? ((link.clicks / total) * 100).toFixed(0) : 0;
            return `
              <div style="display:flex; align-items:center; gap:12px">
                <div style="flex-shrink:0; width:20px; text-align:center; color:var(--text-2); font-size:12px; font-weight:600">${i+1}</div>
                <div style="flex:1; min-width:0">
                  <div style="font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${link.label || 'Link'}</div>
                </div>
                <div style="flex:1; height:6px; background:var(--surface-3); border-radius:3px; overflow:hidden">
                  <div style="height:100%; width:${pct}%; background:var(--accent); border-radius:3px"></div>
                </div>
                <div style="flex-shrink:0; width:40px; text-align:right; color:var(--accent); font-weight:600; font-size:13px">${link.clicks || 0}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;
  view.style.display = 'block';
}

// ============================================================
// VIEW: LINKS
// ============================================================
function renderLinks() {
  const view = document.getElementById('view-links');
  const links = state.links || [];

  view.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:var(--stack)">

      <div style="display:flex; justify-content:space-between; align-items:center">
        <div>
          <h2 class="t-h2">${links.filter(l => l.is_active).length} de ${links.length} ativos</h2>
          <div style="font-size:12px; color:var(--text-2)">Arraste para reordenar</div>
        </div>
        <button class="btn btn-primary" onclick="console.log('Novo link')">+ Novo Link</button>
      </div>

      <div class="card" style="padding:0; overflow:hidden">
        ${links.length === 0 ? `
          <div style="padding:40px; text-align:center; color:var(--text-2)">Nenhum link cadastrado</div>
        ` : `
          <div>
            ${links.map((link, i) => `
              <div style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-bottom:1px solid var(--border-faint); opacity:${link.is_active ? '1' : '0.62'}">
                <div style="width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg, ${link.color_from}, ${link.color_to}); display:flex; align-items:center; justify-content:center; color:#fff; font-size:18px; flex-shrink:0">${link.icon}</div>
                <div style="flex:1; min-width:0">
                  <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${link.title}</div>
                  <div style="font-size:12px; color:var(--text-2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${link.url}</div>
                </div>
                <div style="flex-shrink:0; color:var(--text-2); font-size:12px; font-weight:600">👆 ${link.click_count || 0}</div>
                <div style="flex-shrink:0; width:1px; height:24px; background:var(--border)"></div>
                <button class="btn btn-icon" style="width:28px; height:28px" onclick="console.log('toggle', ${i})">
                  ${link.is_active ? '●' : '○'}
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
  view.style.display = 'block';
}

// ============================================================
// VIEW: PORTFOLIO
// ============================================================
function renderPortfolio() {
  const view = document.getElementById('view-portfolio');
  const projects = state.portfolio || [];

  view.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:var(--stack)">

      <div style="display:flex; justify-content:space-between; align-items:center">
        <h2 class="t-h2">${projects.length} projeto${projects.length !== 1 ? 's' : ''}</h2>
        <button class="btn btn-primary" onclick="console.log('Novo projeto')">+ Novo Projeto</button>
      </div>

      <div class="grid-portfolio">
        ${projects.map(p => {
          const hue = p.id ? (parseInt(p.id) * 47) % 360 : Math.random() * 360;
          return `
            <div class="card" style="padding:0; overflow:hidden; cursor:pointer; transition:border-color 0.12s">
              <div style="height:160px; background:${p.image_url ? `url('${p.image_url}')` : `linear-gradient(135deg, hsl(${hue}, 70%, 35%), hsl(${hue + 30}, 70%, 45%))`}; background-size:cover; background-position:center; display:flex; align-items:center; justify-content:center; color:#fff; opacity:${p.image_url ? '1' : '0.85'}">
                ${!p.image_url ? '<div style="font-size:36px; opacity:0.6">📷</div>' : ''}
              </div>
              <div style="padding:var(--s-3)">
                <div style="font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${p.title}</div>
                <div style="font-size:12px; color:var(--text-2); margin-top:2px">${p.category}</div>
                <div style="font-size:12px; color:var(--text-3); margin-top:4px; line-height:1.4">${(p.description || '').substring(0, 80)}${(p.description || '').length > 80 ? '...' : ''}</div>
                <div style="display:flex; gap:6px; margin-top:10px; flex-wrap:wrap">
                  ${p.featured ? '<span class="badge blue"><span class="badge-dot"></span>Destaque</span>' : ''}
                  ${p.is_active ? '<span class="badge green"><span class="badge-dot"></span>Publicado</span>' : '<span class="badge violet"><span class="badge-dot"></span>Rascunho</span>'}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
  view.style.display = 'block';
}

// ============================================================
// VIEW: LEADS (TABELA)
// ============================================================
function renderLeads() {
  const view = document.getElementById('view-leads');
  const leads = state.leads || [];

  view.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:var(--stack)">

      <div style="display:flex; justify-content:space-between; align-items:center">
        <h2 class="t-h2">${leads.length} contatos ${leads.length > 0 ? '· ' + leads.filter(l => l.status === 'new').length + ' novos' : ''}</h2>
        <button class="btn btn-secondary">📥 Exportar CSV</button>
      </div>

      <div style="display:flex; gap:12px; margin-bottom:12px">
        <div class="input-wrap" style="flex:1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input class="input" placeholder="Buscar contatos..." />
        </div>
        <button class="btn btn-secondary">Filtros</button>
      </div>

      <div class="card" style="padding:0; overflow:hidden">
        <div class="leads-header">
          <div class="t-label">Lead</div>
          <div class="t-label">Origem</div>
          <div class="t-label">Status</div>
          <div class="t-label">Valor</div>
          <div class="t-label">Recebido</div>
          <div></div>
        </div>
        ${leads.length === 0 ? `
          <div style="padding:40px; text-align:center; color:var(--text-2)">Nenhum contato ainda</div>
        ` : leads.map(lead => `
          <div class="lead-row" onclick="state.openLead = '${lead.id}'; render()">
            <div class="lc-lead flex items-center gap-s3">
              <div style="width:34px; height:34px; border-radius:6px; background:var(--accent); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:600; flex-shrink:0">${lead.name.charAt(0).toUpperCase()}</div>
              <div style="flex:1; min-width:0">
                <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${lead.name}</div>
                <div style="font-size:12px; color:var(--text-2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${lead.service}</div>
              </div>
            </div>
            <div class="lc-source" style="color:var(--text-2); font-size:12px">${lead.page === 'portfolio' ? 'Portfólio' : 'Links'}</div>
            <div class="lc-status">
              <span class="badge ${lead.status === 'new' ? 'blue' : 'violet'}">
                <span class="badge-dot"></span>
                ${lead.status === 'new' ? 'Novo' : 'Qualificado'}
              </span>
            </div>
            <div class="lc-value t-mono" style="text-align:right">${lead.value || '—'}</div>
            <div class="lc-date t-sm t-faint" style="text-align:right; white-space:nowrap">${new Date(lead.created_at).toLocaleDateString('pt-BR')}</div>
            <div class="lc-chev" style="text-align:right; color:var(--text-3); font-size:12px">→</div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
  view.style.display = 'block';
}

// ============================================================
// VIEW: LEAD DETAIL
// ============================================================
function renderLeadDetail() {
  const lead = state.leads.find(l => l.id === state.openLead);
  if (!lead) return;

  document.getElementById('topbar-title').textContent = lead.name;
  document.getElementById('topbar-subtitle').textContent = lead.service;

  const view = document.getElementById('view-leads');
  view.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:var(--stack)">

      <div style="display:flex; gap:12px; align-items:center; padding-bottom:var(--s-4); border-bottom:1px solid var(--border)">
        <button class="btn btn-ghost" onclick="state.openLead = null; render()">← Leads</button>
        <div class="flex-spacer"></div>
        <button class="btn btn-secondary">💬 Responder</button>
        <button class="btn btn-primary">📞 Agendar Call</button>
      </div>

      <div class="grid-lead-detail">

        <!-- Esquerda: perfil -->
        <div class="flex flex-col gap-stack sticky-side" style="top:var(--gutter)">
          <div class="card">
            <div style="display:flex; flex-direction:column; align-items:center; gap:12px; margin-bottom:16px">
              <div style="width:64px; height:64px; border-radius:12px; background:var(--accent); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:24px">${lead.name.charAt(0).toUpperCase()}</div>
              <div style="text-align:center">
                <div style="font-weight:600; font-size:15px">${lead.name}</div>
                <div style="font-size:13px; color:var(--text-2)">${lead.service}</div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; border-top:1px solid var(--border); padding-top:12px">
              <div style="display:flex; justify-content:space-between; font-size:12px">
                <span class="t-faint">Telefone</span>
                <span>${lead.phone}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px">
                <span class="t-faint">E-mail</span>
                <span>${lead.email || '—'}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px; align-items:center">
                <span class="t-faint">Instagram</span>
                ${lead.instagram ? `<a href="https://instagram.com/${lead.instagram.replace('@', '')}" target="_blank" style="color:var(--accent); font-weight:500; text-decoration:none">@${lead.instagram.replace('@', '')}</a>` : '<span>—</span>'}
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px">
                <span class="t-faint">Origem</span>
                <span>${lead.page === 'portfolio' ? 'Portfólio' : 'Links'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Direita: mensagem + notas -->
        <div class="flex flex-col gap-stack">
          <div class="card">
            <div class="card-header">
              <h3>Mensagem Recebida</h3>
            </div>
            <div style="color:var(--text-2); font-style:italic; line-height:1.6">"${lead.message}"</div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Adicionar Nota</h3>
            </div>
            <textarea class="textarea" placeholder="Digite uma nota ou resposta..." style="margin-bottom:12px"></textarea>
            <div style="display:flex; gap:8px">
              <button class="btn btn-ghost">Salvar Nota</button>
              <button class="btn btn-primary">Enviar Resposta</button>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
  view.style.display = 'block';
}

// ============================================================
// VIEW: PROFILE
// ============================================================
function renderProfile() {
  const view = document.getElementById('view-profile');
  const p = state.profile || {};

  view.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:var(--stack); max-width:680px">

      <div class="card">
        <div class="card-header">
          <h3>Perfil</h3>
        </div>
        <div style="display:flex; gap:20px; margin-bottom:24px">
          <div style="width:72px; height:72px; border-radius:12px; background:var(--accent); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:28px">${(p.name || 'M').charAt(0).toUpperCase()}</div>
          <div style="flex:1">
            <div style="font-weight:600; font-size:15px; margin-bottom:4px">${p.name}</div>
            <button class="btn btn-secondary" style="font-size:12px">Trocar foto</button>
          </div>
        </div>

        <div class="grid-form-2">
          <div>
            <label class="t-label" style="display:block; margin-bottom:6px">Nome</label>
            <input class="input" value="${p.name || ''}" />
          </div>
          <div>
            <label class="t-label" style="display:block; margin-bottom:6px">Usuário</label>
            <input class="input" value="${p.username || ''}" />
          </div>
          <div>
            <label class="t-label" style="display:block; margin-bottom:6px">E-mail</label>
            <input class="input" type="email" value="${p.email || ''}" />
          </div>
          <div>
            <label class="t-label" style="display:block; margin-bottom:6px">Site</label>
            <input class="input" placeholder="https://..." />
          </div>
        </div>

        <div style="margin-top:16px">
          <label class="t-label" style="display:block; margin-bottom:6px">Bio</label>
          <textarea class="textarea" placeholder="Fale sobre você...">${p.bio || ''}</textarea>
        </div>

        <div style="display:flex; gap:8px; margin-top:20px; border-top:1px solid var(--border); padding-top:16px">
          <button class="btn btn-ghost">Cancelar</button>
          <button class="btn btn-primary">Salvar Alterações</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Redes Sociais</h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px">
          <div style="display:flex; align-items:center; gap:12px">
            <div style="width:36px; height:36px; border-radius:8px; background:var(--surface-3); display:flex; align-items:center; justify-content:center">📸</div>
            <div style="flex:1">
              <div style="font-size:13px; font-weight:500">Instagram</div>
              <div style="font-size:12px; color:var(--text-2)">instagram.com/seu-usuario</div>
            </div>
            <button class="btn btn-icon">✎</button>
          </div>
        </div>
        <button class="btn btn-outline" style="width:100%; margin-top:12px">+ Adicionar Rede</button>
      </div>

    </div>
  `;
  view.style.display = 'block';
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function attachListeners() {
  // Nav routing
  document.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => {
      setRoute(btn.dataset.route);
    });
  });

  // Visit site
  document.getElementById('btn-visit-site')?.addEventListener('click', () => {
    window.open('/', '_blank');
  });

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.replace('/login.html');
  });
}

// ============================================================
// INIT
// ============================================================
async function init() {
  const ok = await checkAuth();
  if (!ok) return;

  attachListeners();
  await loadData();
}

// Start
document.addEventListener('DOMContentLoaded', init);
