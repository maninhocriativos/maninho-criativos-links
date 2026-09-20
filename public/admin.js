/* ══ Auth ══ */
async function checkAuth() {
  try {
    const res = await fetch('/api/admin/verify');
    if (res.status === 401) return window.location.replace('/login.html');
    if (!res.ok) throw new Error('Falha ao verificar acesso');
    showPanel();
  } catch {
    document.getElementById('auth-loading').innerHTML = '<strong>Não foi possível conectar ao painel.</strong><p>Verifique sua conexão e tente novamente.</p><button class="btn-primary" onclick="checkAuth()">Tentar novamente</button>';
  }
}

function showPanel() {
  document.getElementById('auth-loading').hidden = true;
  document.getElementById('admin-panel').style.display = 'grid';
  loadAllData();
  restoreTab();
}

async function logout() {
  try {
    const res = await fetch('/api/admin/logout', { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao sair');
    window.location.replace('/login.html');
  } catch { toast('Não foi possível encerrar a sessão. Tente novamente.', true); }
}

/* ══ Tabs ══ */
const tabTitles = { dashboard: ['Visão geral','Seu estúdio em um só lugar'], links: ['Links públicos','Organize os destinos da sua página'], portfolio: ['Portfólio público','Gerencie os cases publicados'], profile: ['Configurações','Identidade e aparência da página'], leads: ['Funil comercial','Transforme contatos em clientes'], clients: ['Clientes','Relacionamento e dados cadastrais'], projects: ['Projetos','Produção, revisão e entregas'], receipts: ['Financeiro e recibos','Recebimentos, documentos e envios'], household: ['Despesas de casa','Seus gastos pessoais separados da empresa'], analytics: ['Marketing e Analytics','Desempenho dos canais digitais'] };

function setTab(name, btn, persist = true) {
  if (!document.getElementById(`tab-${name}`)) name = 'dashboard';
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.snav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.add('active');
  (btn || document.querySelector(`.snav-item[data-tab="${name}"]`))?.classList.add('active');
  document.getElementById('admin-page-title').textContent = tabTitles[name][0];
  document.getElementById('admin-page-subtitle').textContent = tabTitles[name][1];
  if (persist) {
    localStorage.setItem('mc_admin_tab', name);
    if (location.hash !== `#${name}`) history.pushState(null, '', `${location.pathname}${location.search}#${name}`);
  }
  if (name === 'portfolio') loadPortfolioAdmin();
  if (name === 'leads') loadLeads();
  if (name === 'clients') loadClients();
  if (name === 'projects') loadProjects();
  if (name === 'dashboard') loadCrmDashboard();
  if (name === 'receipts') { loadClientOptions(); loadCashFlow(); setFinanceView(sessionStorage.getItem('financeView') || 'cash'); }
  if (name === 'household') loadHouseholdExpenses();
  if (name === 'analytics') loadAnalytics();
  document.title = `${tabTitles[name][0]} — Maninho Criativos`;
  document.getElementById('section-jump').value = name;
  document.querySelectorAll('.snav-item[data-tab]').forEach(item => {
    if (item.dataset.tab === name) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  closeSidebar();
}

function restoreTab() {
  const hashTab = location.hash.replace('#', '');
  const savedTab = localStorage.getItem('mc_admin_tab');
  setTab(hashTab || savedTab || 'dashboard', null, false);
}

window.addEventListener('hashchange', () => restoreTab());

function openDatePicker(id) {
  const input = document.getElementById(id);
  if (!input) return;
  if (typeof input.showPicker === 'function') input.showPicker();
  else { input.focus(); input.click(); }
}

/* ══ Mobile sidebar ══ */
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
function openSidebar() {
  sidebar?.classList.add('open');
  sidebarOverlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('sidebar-close-btn')?.focus();
}
function closeSidebar() {
  const wasOpen = sidebar?.classList.contains('open');
  sidebar?.classList.remove('open');
  sidebarOverlay?.classList.remove('open');
  document.body.style.overflow = '';
  if (wasOpen) document.getElementById('mobile-menu-btn')?.focus();
}

/* ══ Load data ══ */
async function loadAllData() {
  await Promise.all([loadLinks(), loadProfile(), loadQuickStats()]);
}

/* ══ Quick stats bar ══ */
async function loadQuickStats() {
  try {
    const [analyticsRes, leadsRes] = await Promise.all([
      fetch('/api/admin/analytics'),
      fetch('/api/admin/leads')
    ]);
    if (analyticsRes.ok) {
      const a = await analyticsRes.json();
      document.getElementById('qs-views').textContent  = a.today_views  ?? '0';
      document.getElementById('qs-clicks').textContent = a.total_clicks ?? '0';
    }
    if (leadsRes.ok) {
      const l = await leadsRes.json();
      document.getElementById('qs-leads').textContent = l.leads?.length ?? '0';
      const badge = document.getElementById('leads-count');
      if (badge) badge.textContent = l.leads?.length ?? '';
    }
    document.getElementById('quick-stats').style.display = 'flex';
  } catch { /* silent fail — stats are non-critical */ }
}

/* ══ setTab — estendido para portfólio ══ */
const _origSetTab = typeof setTab === 'function' ? setTab : null;

async function loadLinks() {
  const res = await authFetch('/api/admin/links');
  if (!res) return;
  const { links } = await res.json();
  linksCache = links || [];
  renderLinkInsights();
  filterLinks();
}
let linksCache=[];
function filterLinks(){const q=getVal('links-search').toLowerCase(),sort=getVal('links-sort')||'order';const items=linksCache.filter(link=>`${link.title} ${link.url}`.toLowerCase().includes(q));items.sort((a,b)=>sort==='clicks'?(b.click_count||0)-(a.click_count||0):sort==='name'?a.title.localeCompare(b.title,'pt-BR'):(a.order_index||0)-(b.order_index||0));renderLinks(items);}
function renderLinkInsights(){const host=document.getElementById('link-insights');if(!host)return;const active=linksCache.filter(link=>link.is_active).length,total=linksCache.reduce((sum,link)=>sum+(link.click_count||0),0),best=[...linksCache].sort((a,b)=>(b.click_count||0)-(a.click_count||0))[0];host.innerHTML=`<div><span class="insight-icon">${uiIcon('link')}</span><small>Links publicados</small><strong>${active}</strong><em>de ${linksCache.length} cadastrados</em></div><div><span class="insight-icon">${uiIcon('cursor')}</span><small>Cliques acumulados</small><strong>${total.toLocaleString('pt-BR')}</strong><em>em todos os canais</em></div><div><span class="insight-icon">${uiIcon('trend')}</span><small>Melhor desempenho</small><strong class="insight-name">${esc(best?.title||'—')}</strong><em>${best?.click_count||0} cliques</em></div>`;}
function uiIcon(name){const paths={link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',cursor:'<path d="m4 3 7 17 2.4-6.6L20 11 4 3Z"/><path d="m14 14 5 5"/>',trend:'<path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/>',edit:'<path d="m4 20 4.2-1 10.9-10.9a2 2 0 0 0-3-3L5.2 16 4 20Z"/>',trash:'<path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7M10 11v5m4-5v5"/>'};return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.link}</svg>`;}
function brandIcon(link){const value=`${link.title||''} ${link.url||''}`.toLowerCase();let path;if(value.includes('instagram'))path='<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>';else if(value.includes('youtube')||value.includes('youtu.be'))path='<path d="M21 8.2a3 3 0 0 0-2.1-2.1C17 5.5 12 5.5 12 5.5s-5 0-6.9.6A3 3 0 0 0 3 8.2 31 31 0 0 0 2.5 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.9.6 6.9.6 6.9.6s5 0 6.9-.6a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-3.8 31 31 0 0 0-.5-3.8Z"/><path d="m10 9 5 3-5 3V9Z"/>';else if(value.includes('tiktok'))path='<path d="M15 4v10.2a5 5 0 1 1-4-4.9"/><path d="M15 4c.5 3 2.2 4.5 5 4.7"/>';else if(value.includes('whatsapp')||value.includes('wa.me'))path='<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.5 2.8 2 4.3 5 5"/>';else if(value.includes('portfolio')||value.includes('portfólio'))path='<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M9 5V3h6v2M3 11h18M10 11v2h4v-2"/>';else path='<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>';return `<svg viewBox="0 0 24 24" role="img" aria-label="${esc(link.title)}">${path}</svg>`;}

async function loadProfile() {
  const res = await authFetch('/api/admin/profile');
  if (!res) return;
  const { profile } = await res.json();
  if (!profile) return;
  setVal('p-name',        profile.name        || '');
  setVal('p-bio',         profile.bio         || '');
  setVal('p-avatar',      profile.avatar_url  || '');
  setColorField('p-bg-from', profile.bg_from  || '#030810');
  setColorField('p-bg-via',  profile.bg_via   || '#070e1c');
  setColorField('p-bg-to',   profile.bg_to    || '#0c1728');
}

/* ══ Render links table ══ */
function renderLinks(links) {
  const table = document.getElementById('links-table');
  document.getElementById('links-count').textContent = `${links.length} link${links.length !== 1 ? 's' : ''}`;

  if (!links.length) {
    table.innerHTML = '<p style="padding:32px;text-align:center;color:var(--text3)">Nenhum link cadastrado ainda.</p>';
    return;
  }

  table.innerHTML = '';
  links.forEach(link => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.dataset.id = link.id;

    row.innerHTML = `
      <div class="table-row-icon brand-icon">${brandIcon(link)}</div>
      <div class="table-row-info">
        <div class="table-row-title">
          ${esc(link.title)}
          <span class="click-count">${uiIcon('cursor')} ${link.click_count || 0}</span>
        </div>
        <div class="table-row-url">${esc(link.url)}</div>
      </div>
      <div class="table-row-actions">
        <button class="status-badge ${link.is_active ? 'on' : 'off'}"
          onclick="toggleActive(${link.id}, ${link.is_active})">
          ${link.is_active ? '● Ativo' : '○ Inativo'}
        </button>
        <button class="btn-icon" onclick="openEdit(${link.id})" title="Editar">${uiIcon('edit')}</button>
        <button class="btn-danger icon-only" onclick="deleteLink(${link.id})" title="Excluir">${uiIcon('trash')}</button>
      </div>
    `;
    table.appendChild(row);
  });
}

/* ══ Toggle active ══ */
async function toggleActive(id, current) {
  const res = await authFetch(`/api/admin/links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: current ? 0 : 1 })
  });
  if (res?.ok) { toast('Status atualizado ✓'); loadLinks(); }
  else toast('Erro ao atualizar', true);
}

/* ══ Delete link ══ */
async function deleteLink(id) {
  if (!confirm('Excluir este link permanentemente?')) return;
  const res = await authFetch(`/api/admin/links/${id}`, { method: 'DELETE' });
  if (res?.ok) { toast('Link removido'); loadLinks(); }
  else toast('Erro ao remover', true);
}

/* ══ Panel toggle ══ */
function openNewPortfolio() {
  const panel = document.getElementById('add-portfolio-panel');
  panel.querySelector('form').reset();
  setVal('pf-id', '');
  document.getElementById('pf-submit').textContent = 'Adicionar ao portfólio';
  if (!panel.classList.contains('open')) togglePanel('add-portfolio-panel');
}
function togglePanel(id) {
  const el = document.getElementById(id);
  if (el?.classList.contains('content-modal')) {
    el.classList.toggle('open');
    document.body.classList.toggle('modal-open', el.classList.contains('open'));
    return;
  }
  const isOpen = el.classList.contains('open') || el.querySelector('.link-form');
  const inner = el.querySelector('.link-form');
  if (!inner) return;
  if (el.dataset.collapsed === '1') {
    el.dataset.collapsed = '0';
    inner.style.display = '';
    el.querySelector('.panel-card-header button').textContent = '✕';
  } else {
    el.dataset.collapsed = '1';
    inner.style.display = 'none';
    el.querySelector('.panel-card-header button').textContent = '+';
  }
}

/* ══ Create link ══ */
async function submitNewLink(e) {
  e.preventDefault();
  const body = {
    title:       getVal('l-title'),
    url:         getVal('l-url'),
    icon:        getVal('l-icon') || '🔗',
    color_from:  getVal('l-color-from'),
    color_to:    getVal('l-color-to'),
    order_index: parseInt(getVal('l-order')) || 0,
  };

  const res = await authFetch('/api/admin/links', { method: 'POST', body: JSON.stringify(body) });
  if (res?.ok) {
    e.target.reset();
    resetColorDefaults();
    toast('Link adicionado ✓');
    loadLinks();
    togglePanel('add-link-panel');
  } else {
    toast('Erro ao criar link', true);
  }
}

/* ══ Edit modal ══ */
let editingLinks = [];

async function openEdit(id) {
  const res = await authFetch('/api/admin/links');
  if (!res) return;
  const { links } = await res.json();
  const link = links.find(l => l.id === id);
  if (!link) return;

  setVal('edit-id',    link.id);
  setVal('edit-title', link.title);
  setVal('edit-icon',  link.icon);
  setVal('edit-url',   link.url);
  setColorField('edit-cf', link.color_from);
  setColorField('edit-ct', link.color_to);
  setVal('edit-order', link.order_index);

  document.getElementById('edit-modal').classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('edit-modal')) return;
  document.getElementById('edit-modal').classList.remove('open');
}

async function submitEditLink(e) {
  e.preventDefault();
  const id = getVal('edit-id');
  const body = {
    title:       getVal('edit-title'),
    url:         getVal('edit-url'),
    icon:        getVal('edit-icon') || '🔗',
    color_from:  getVal('edit-cf'),
    color_to:    getVal('edit-ct'),
    order_index: parseInt(getVal('edit-order')) || 0,
  };

  const res = await authFetch(`/api/admin/links/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  if (res?.ok) {
    closeModal();
    toast('Link atualizado ✓');
    loadLinks();
  } else {
    toast('Erro ao salvar', true);
  }
}

/* ══ Save profile ══ */
async function submitProfile(e) {
  e.preventDefault();
  const body = {
    name:       getVal('p-name'),
    bio:        getVal('p-bio'),
    avatar_url: getVal('p-avatar'),
    bg_from:    getVal('p-bg-from'),
    bg_via:     getVal('p-bg-via'),
    bg_to:      getVal('p-bg-to'),
  };

  const res = await authFetch('/api/admin/profile', { method: 'PUT', body: JSON.stringify(body) });
  if (res?.ok) toast('Perfil salvo ✓');
  else toast('Erro ao salvar perfil', true);
}

/* ══ Live preview for new link form ══ */
['l-title','l-icon','l-color-from','l-color-to'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updatePreview);
});

function updatePreview() {
  const title = getVal('l-title') || 'Título do link';
  const icon  = getVal('l-icon')  || '🔗';
  const cf    = getVal('l-color-from') || '#667eea';
  const ct    = getVal('l-color-to')   || '#764ba2';
  const prevEl = document.getElementById('link-preview');
  if (!prevEl) return;
  document.getElementById('prev-title').textContent = title;
  document.getElementById('prev-icon').textContent  = icon;
  document.getElementById('prev-icon').style.background = `linear-gradient(135deg,${cf},${ct})`;
}

/* ══ Color sync ══ */
function syncColor(picker, txtId) {
  document.getElementById(txtId).value = picker.value;
  updatePreview();
}

document.querySelectorAll('.color-text').forEach(input => {
  input.addEventListener('input', function() {
    if (/^#[0-9a-fA-F]{6}$/.test(this.value)) {
      const pickerId = this.id.replace('-txt', '');
      const picker = document.getElementById(pickerId);
      if (picker) picker.value = this.value;
      updatePreview();
    }
  });
});

function setColorField(id, value) {
  const picker = document.getElementById(id);
  const txt    = document.getElementById(id + '-txt');
  if (picker) picker.value = value;
  if (txt)    txt.value    = value;
}

function resetColorDefaults() {
  setColorField('l-color-from', '#667eea');
  setColorField('l-color-to',   '#764ba2');
}

/* ══ Helpers ══ */
async function authFetch(url, opts = {}) {
  try {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  if (res.status === 401) { window.location.replace('/login.html'); return null; }
  if (!res.ok && (!opts.method || opts.method === 'GET')) {
    showRequestError('Não foi possível carregar os dados. Tente atualizar esta área.');
    return null;
  }
  return res;
  } catch {
    showRequestError('Conexão interrompida. Verifique sua rede e tente novamente.');
    return null;
  }
}

function getVal(id) { return document.getElementById(id)?.value ?? ''; }
function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v; }
function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let toastTimer;
function toast(msg, isErr = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + (isErr ? 'error' : 'success');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); }, 2800);
}

checkAuth();

/* ══════════════════════════════════
   PORTFÓLIO ADMIN
   ══════════════════════════════════ */

async function loadPortfolioAdmin() {
  const res = await authFetch('/api/admin/portfolio');
  if (!res) return;
  const { items } = await res.json();
  portfolioCache = items || [];
  const galleries=[...new Set(portfolioCache.map(item=>item.gallery_name).filter(Boolean))];
  const list=document.getElementById('portfolio-galleries');if(list)list.innerHTML=galleries.map(name=>`<option value="${esc(name)}"></option>`).join('');
  filterPortfolio();
}
let portfolioCache=[];
function filterPortfolio(){const category=getVal('portfolio-filter'),query=(getVal('portfolio-search')||'').toLowerCase();renderPortfolioTable(portfolioCache.filter(item=>(!category||item.category===category)&&(!query||`${item.title} ${item.gallery_name||''} ${item.category}`.toLowerCase().includes(query))));}

function renderPortfolioTable(items) {
  const table = document.getElementById('portfolio-table');
  const count = document.getElementById('portfolio-count');
  if (!table) return;
  count && (count.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`);

  if (!items.length) {
    table.innerHTML = '<p style="padding:32px;text-align:center;color:var(--text3)">Nenhum item ainda.</p>';
    return;
  }

  table.innerHTML = '';
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <div class="table-row-icon" style="background:var(--surface2);border-radius:10px;overflow:hidden;padding:0">
        <img src="${esc(item.image_url)}" alt="" style="width:100%;height:100%;object-fit:cover" loading="lazy" />
      </div>
      <div class="table-row-info">
        <div class="table-row-title">${esc(item.title)}</div>
        <div class="table-row-url">${esc(item.category)}${item.gallery_name?` <span class="portfolio-gallery-chip">${esc(item.gallery_name)}</span>`:''}</div>
      </div>
      <div class="table-row-actions">
        <button class="status-badge ${item.is_active ? 'on' : 'off'}"
          onclick="togglePortfolioItem(${item.id}, ${item.is_active})">
          ${item.is_active ? '● Ativo' : '○ Inativo'}
        </button>
        <button class="btn-icon" onclick="editPortfolioItem(${item.id})" title="Editar">${uiIcon('edit')}</button>
        <button class="btn-danger" onclick="deletePortfolioItem(${item.id})">🗑</button>
      </div>
    `;
    table.appendChild(row);
  });
}

async function submitNewPortfolio(e) {
  e.preventDefault();
  const file = document.getElementById('pf-file')?.files?.[0];
  let imageUrl = getVal('pf-url');
  if (file) {
    const uploaded = await authFetch('/api/admin/upload', {
      method: 'POST', headers: { 'Content-Type': file.type }, body: file
    });
    if (!uploaded?.ok) { toast('Erro ao enviar imagem', true); return; }
    imageUrl = (await uploaded.json()).url;
  }
  if (!imageUrl) { toast('Informe uma imagem', true); return; }
  const body = {
    id:          Number(getVal('pf-id')) || null,
    title:       getVal('pf-title'),
    category:    getVal('pf-cat'),
    gallery_name:getVal('pf-gallery'),
    description: getVal('pf-desc'),
    image_url:   imageUrl,
    image_mobile_url: getVal('pf-mobile-url'),
    project_url: getVal('pf-project-url'),
    order_index: parseInt(getVal('pf-order')) || 0,
  };
  const res = await authFetch(body.id?`/api/admin/portfolio/${body.id}`:'/api/admin/portfolio', { method: body.id?'PATCH':'POST', body: JSON.stringify(body) });
  if (res?.ok) {
    e.target.reset();
    setVal('pf-id','');document.getElementById('pf-submit').textContent='Adicionar';
    togglePanel('add-portfolio-panel');
    toast(body.id?'Item atualizado ✓':'Item adicionado ✓');
    loadPortfolioAdmin();
  } else {
    toast('Erro ao adicionar', true);
  }
}

function editPortfolioItem(id){const item=portfolioCache.find(entry=>entry.id===id);if(!item)return;for(const [field,key] of [['pf-id','id'],['pf-title','title'],['pf-cat','category'],['pf-gallery','gallery_name'],['pf-url','image_url'],['pf-mobile-url','image_mobile_url'],['pf-project-url','project_url'],['pf-desc','description'],['pf-order','order_index']])setVal(field,item[key]??'');document.getElementById('pf-submit').textContent='Salvar alterações';togglePanel('add-portfolio-panel');}

async function togglePortfolioItem(id, current) {
  const res = await authFetch(`/api/admin/portfolio/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: current ? 0 : 1 })
  });
  if (res?.ok) { toast('Status atualizado ✓'); loadPortfolioAdmin(); }
  else toast('Erro ao atualizar', true);
}

async function deletePortfolioItem(id) {
  if (!confirm('Remover este item do portfólio?')) return;
  const res = await authFetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' });
  if (res?.ok) { toast('Item removido'); loadPortfolioAdmin(); }
  else toast('Erro ao remover', true);
}

/* ══ LEADS ══ */
async function loadLeads() {
  const tbody = document.getElementById('leads-tbody');
  const stats = document.getElementById('leads-stats');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:#666">Carregando...</td></tr>';

  let data;
  try {
    const res = await authFetch('/api/admin/leads');
    if (!res?.ok) { tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:#f87171">Erro ao carregar.</td></tr>'; return; }
    data = await res.json();
  } catch { tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:#f87171">Erro de conexão.</td></tr>'; return; }
  if (!data || !data.leads) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:#f87171">Erro ao carregar leads.</td></tr>';
    return;
  }

  leadsCache = data.leads;
  renderLeads();
}
let leadsCache = [];
function renderLeads() {
  const tbody = document.getElementById('leads-tbody');
  const stats = document.getElementById('leads-stats');
  const leads = leadsCache;
  if (stats) {
    const total = leads.length;
    const hoje = leads.filter(l => l.created_at?.startsWith(new Date().toISOString().slice(0, 10))).length;
    stats.innerHTML = `
      <div class="lead-stat"><span>${total}</span><small>Total de leads</small></div>
      <div class="lead-stat"><span>${hoje}</span><small>Hoje</small></div>
      <div class="lead-stat"><span>${leads.filter(l=>l.page==='portfolio').length}</span><small>Via portfólio</small></div>
      <div class="lead-stat"><span>${leads.filter(l=>l.page==='links').length}</span><small>Via página de links</small></div>
    `;
  }

  const filtered = leads.filter(l => matchesSearch([l.name,l.phone,l.service,l.message], getVal('leads-search')) && (!getVal('leads-status-filter') || (l.status || 'new') === getVal('leads-status-filter')));
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:#666">Nenhuma oportunidade encontrada. Ajuste os filtros ou aguarde novos contatos.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(l => `
    <tr>
      <td>${l.id}</td>
      <td><strong>${esc(l.name)}</strong></td>
      <td><a href="https://wa.me/${whatsappNumber(l.phone)}" target="_blank" rel="noopener noreferrer" class="lead-wa">${esc(l.phone)}</a></td>
      <td>${l.instagram ? `<a href="https://instagram.com/${encodeURIComponent(String(l.instagram).replace(/^@/,''))}" target="_blank" rel="noopener noreferrer">${esc(l.instagram)}</a>` : '—'}</td>
      <td><span class="lead-tag">${esc(l.service || '—')}</span></td>
      <td class="lead-msg">${esc(l.message || '—')}</td>
      <td><select class="crm-status-select status-${esc(l.status||'new')}" onchange="updateLeadStatus(${l.id},this.value)"><option value="new" ${l.status==='new'?'selected':''}>Novo</option><option value="qualified" ${l.status==='qualified'?'selected':''}>Qualificado</option><option value="negotiation" ${l.status==='negotiation'?'selected':''}>Negociação</option><option value="won" ${l.status==='won'?'selected':''}>Ganho</option><option value="lost" ${l.status==='lost'?'selected':''}>Perdido</option></select></td>
      <td><span class="lead-page lead-page-${l.page === 'portfolio' ? 'portfolio' : 'links'}">${l.page === 'portfolio' ? 'portfolio' : 'links'}</span></td>
      <td class="lead-date">${formatDate(l.created_at)}</td>
      <td><button class="btn-danger-sm" onclick="deleteLead(${l.id})">✕</button></td>
    </tr>
  `).join('');
}

async function updateLeadStatus(id,status){const res=await authFetch('/api/admin/leads',{method:'PATCH',body:JSON.stringify({id,status})});if(res?.ok){toast('Oportunidade atualizada ✓');loadLeads();}else toast('Erro ao atualizar oportunidade',true);}

async function deleteLead(id) {
  if (!confirm('Remover este lead?')) return;
  const res = await authFetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
  if (res?.ok) { toast('Lead removido'); loadLeads(); }
  else toast('Erro ao remover', true);
}

function formatDate(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

/* ══ CRM — VISÃO GERAL E PROJETOS ══ */
const projectStages = { briefing:'Briefing', creation:'Criação', review:'Revisão', approved:'Aprovado', delivered:'Entregue', paused:'Pausado', cancelled:'Cancelado' };
let projectsCache = [];

async function loadCrmDashboard() {
  const res = await authFetch('/api/admin/crm-dashboard'); if(!res?.ok)return;
  const data = await res.json(); const money = cents => (cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  document.getElementById('crm-kpis').innerHTML = [
    ['Clientes ativos',data.clients,'Relacionamentos'],['Oportunidades',data.open_leads,'No funil'],['Projetos ativos',data.active_projects,'Em produção'],['Pipeline',money(data.pipeline_cents),'Valor dos projetos'],['Recebimentos',money(data.revenue_cents),'Recibos emitidos']
  ].map(([label,value,hint])=>`<div class="crm-kpi"><small>${label}</small><strong>${value}</strong><span>${hint}</span></div>`).join('');
  const deadlines=document.getElementById('crm-deadlines');
  deadlines.innerHTML=data.deadlines.length?data.deadlines.map(item=>`<button onclick="setTab('projects')"><span><strong>${esc(item.title)}</strong><small>${esc(item.client_name)} • ${projectStages[item.status]||item.status}</small></span><time>${receiptDateLabel(item.deadline)}</time></button>`).join(''):'<div class="crm-empty">Nenhuma entrega programada.</div>';
  const activities=document.getElementById('crm-activities');
  activities.innerHTML=data.activities.length?data.activities.map(item=>`<div class="crm-activity"><span></span><div><strong>${esc(item.details||item.action)}</strong><small>${esc(item.entity_type)} • ${formatDate(item.created_at)}</small></div></div>`).join(''):'<div class="crm-empty">As movimentações aparecerão aqui.</div>';
}

async function loadProjects() {
  const [projectsRes] = await Promise.all([authFetch('/api/admin/projects'), loadProjectClientOptions()]); if(!projectsRes?.ok)return;
  projectsCache=(await projectsRes.json()).projects||[]; renderProjectBoard();
}
async function loadProjectClientOptions() {
  const clients=clientsCache.length?clientsCache:await fetchClients(); const select=document.getElementById('pr-client'); if(!select)return;
  const current=select.value; select.innerHTML='<option value="">Selecione</option>'+clients.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join(''); select.value=current;
}
function renderProjectBoard() {
  const board=document.getElementById('project-board'); if(!board)return;
  const selectedStage=getVal('projects-status-filter');
  const stages=selectedStage?[selectedStage]:Object.keys(projectStages);
  const visible=projectsCache.filter(p=>matchesSearch([p.title,p.client_name,p.service],getVal('projects-search')));
  document.getElementById('projects-count').textContent=visible.filter(p=>!selectedStage||p.status===selectedStage).length+' projetos encontrados';
  board.innerHTML=stages.map(stage=>{const items=visible.filter(p=>p.status===stage);return `<section class="project-column"><header><span>${projectStages[stage]}</span><b>${items.length}</b></header><div>${items.length?items.map(p=>`<article class="project-card" role="button" tabindex="0" aria-label="Editar ${esc(p.title)}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();editProject(${p.id})}" onclick="editProject(${p.id})"><small>${esc(p.service)}</small><h4>${esc(p.title)}</h4><p>${esc(p.client_name)}</p><div class="project-progress"><span style="width:${p.progress}%"></span></div><footer><span>${p.progress}%</span><time>${p.deadline?receiptDateLabel(p.deadline):'Sem prazo'}</time></footer></article>`).join(''):'<p class="project-empty">Nenhum projeto</p>'}</div></section>`}).join('');
}
async function submitProject(event) {
  event.preventDefault(); const id=Number(getVal('pr-id'))||null; const value=Number(getVal('pr-value'))||0;
  const body={id,client_id:Number(getVal('pr-client')),title:getVal('pr-title'),service:getVal('pr-service'),status:getVal('pr-status'),deadline:getVal('pr-deadline'),value_cents:Math.round(value*100),progress:Number(getVal('pr-progress'))||0,notes:getVal('pr-notes')};
  const res=await authFetch('/api/admin/projects',{method:id?'PUT':'POST',body:JSON.stringify(body)}); if(res?.ok){toast(id?'Projeto atualizado ✓':'Projeto criado ✓');resetProjectForm();loadProjects();}else if(res){const d=await res.json().catch(()=>({}));toast(d.error||'Erro ao salvar projeto',true);}
}
function editProject(id) { const p=projectsCache.find(item=>item.id===id);if(!p)return;for(const [field,key] of [['pr-id','id'],['pr-client','client_id'],['pr-title','title'],['pr-service','service'],['pr-status','status'],['pr-deadline','deadline'],['pr-progress','progress'],['pr-notes','notes']])setVal(field,p[key]??'');setVal('pr-value',(p.value_cents/100).toFixed(2));document.getElementById('pr-submit').textContent='Salvar projeto';document.getElementById('pr-cancel').hidden=false;document.getElementById('project-form').scrollIntoView({behavior:'smooth'}); }
function resetProjectForm(){document.getElementById('project-form').reset();setVal('pr-id','');setVal('pr-progress','0');document.getElementById('pr-submit').textContent='Criar projeto';document.getElementById('pr-cancel').hidden=true;}

/* ══ FINANCEIRO ══ */
let cashCache=[];
const cashCategories={income:['Contrato mensal','Desenvolvimento avulso','Manutenção e suporte','Hospedagem e domínio','Projetos de design','Identidade visual','Social media','Website','Consultoria','Outras receitas'],expense:['Software e assinaturas','Infraestrutura e hospedagem','Publicidade','Equipamentos','Freelancers','Impostos','Escritório','Outras despesas']};
const householdCategories=['Mercado e feira','Salão e beleza','Farmácia e saúde','Restaurantes e delivery','Transporte e combustível','Aluguel e condomínio','Água, luz e gás','Internet e telefone','Limpeza e manutenção','Lazer e entretenimento','Roupas e compras','Educação','Pets','Outras despesas da casa'];
let householdCache=[];
const brl=cents=>(Number(cents||0)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
async function loadCashFlow(){const input=document.getElementById('finance-month');if(!input)return;if(!input.value)input.value=new Date().toISOString().slice(0,7);const res=await authFetch(`/api/admin/cash-flow?month=${input.value}&scope=business`);if(!res?.ok)return;const data=await res.json();cashCache=data.transactions||[];const s=data.summary||{};document.getElementById('finance-kpis').innerHTML=[['Receitas recebidas',brl(s.income_paid),'income'],['Despesas pagas',brl(s.expense_paid),'expense'],['Saldo do mês',brl((s.income_paid||0)-(s.expense_paid||0)),'balance'],['A receber',brl(s.receivable),'pending'],['A pagar',brl(s.payable),'pending']].map(([l,v,t])=>`<div class="finance-kpi ${t}"><small>${l}</small><strong>${v}</strong></div>`).join('');document.getElementById('finance-period-label').textContent=new Date(`${data.month}-02T12:00:00`).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});renderIntegratedCost('finance-integrated-cost',data.combined_summary);filterCashFlow();renderFinanceReport(data.monthly||[],data.categories||[]);}
function renderCashTable(items=cashCache){const tbody=document.getElementById('cash-tbody');if(!tbody)return;const labels={pending:'Pendente',paid:'Pago',cancelled:'Cancelado'};tbody.innerHTML=items.length?items.map(t=>{const channelList=[t.reminder_email&&'E-mail',t.reminder_sms&&'SMS',t.reminder_whatsapp&&'WhatsApp'].filter(Boolean),channels=channelList.join(' + '),planned=channelList.length*3,sent=Number(t.reminder_sent_count||0),party=t.type==='expense'?(t.counterparty_name||'Fornecedor não informado'):(t.client_name||t.project_title||'Sem vínculo');return `<tr class="clickable-cash-row" tabindex="0" onclick="openCashDetail(${t.id},'business')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openCashDetail(${t.id},'business')}"><td><span class="cash-date">${receiptDateLabel(t.due_date)}</span></td><td><strong>${esc(t.description)}</strong>${t.recurrence_frequency==='monthly'?` <span class="recurrence-chip">Mensal ${t.installment_number}/${t.installment_total}</span>`:''}<br><small>${esc(party)}</small>${t.reminder_enabled?`<br><span class="cash-reminder-chip">${sent}/${planned} enviados · ${esc(channels)} · 09h, 13h e 17h</span>`:''}${t.payment_url?`<br><a class="cash-payment-link" href="${esc(t.payment_url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Abrir link de pagamento ↗</a>`:''}</td><td><span class="category-chip">${esc(t.category)}</span></td><td><span class="cash-status ${t.status}">${labels[t.status]}</span></td><td class="cash-value ${t.type}">${t.type==='expense'?'−':'+'} ${brl(t.amount_cents)}</td><td><button class="btn-secondary small" onclick="event.stopPropagation();editCash(${t.id})">Editar</button></td></tr>`;}).join(''):'<tr><td colspan="6"><div class="crm-empty"><strong>Nenhum lançamento encontrado</strong><span>Ajuste os filtros ou registre uma nova movimentação.</span></div></td></tr>';}
function filterCashFlow(){const query=(getVal('cash-search')||'').toLowerCase(),type=getVal('cash-type-filter'),status=getVal('cash-status-filter');renderCashTable(cashCache.filter(t=>(!query||`${t.description} ${t.category} ${t.client_name||''} ${t.project_title||''} ${t.counterparty_name||''}`.toLowerCase().includes(query))&&(!type||t.type===type)&&(!status||t.status===status)));}
function revealCreatedCash(dueDate){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dueDate||''))return;
  setVal('finance-month',dueDate.slice(0,7));setVal('cash-search','');setVal('cash-type-filter','');setVal('cash-status-filter','');
}
function setFinanceView(view){const cash=view==='cash';document.getElementById('finance-view-cash')?.classList.toggle('active',cash);document.getElementById('finance-view-receipts')?.classList.toggle('active',!cash);document.getElementById('finance-tab-cash')?.classList.toggle('active',cash);document.getElementById('finance-tab-receipts')?.classList.toggle('active',!cash);sessionStorage.setItem('financeView',view);if(!cash)loadReceipts();}
function exportCashFlow(){if(!cashCache.length){toast('Não há lançamentos para exportar',true);return;}const header=['Data','Tipo','Descrição','Categoria','Cliente, projeto ou fornecedor','Status','Valor'];const rows=cashCache.map(t=>[t.due_date,t.type==='income'?'Entrada':'Saída',t.description,t.category,t.type==='expense'?(t.counterparty_name||''):t.client_name||t.project_title||'',t.status,(t.amount_cents/100).toFixed(2).replace('.',',')]);const quote=v=>`"${String(v??'').replaceAll('"','""')}"`;const csv='\ufeff'+[header,...rows].map(row=>row.map(quote).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`fluxo-caixa-${getVal('finance-month')}.csv`;a.click();URL.revokeObjectURL(url);toast('Relatório exportado ✓');}
function renderFinanceReport(monthly,categories){const max=Math.max(1,...monthly.flatMap(m=>[m.income||0,m.expense||0]));document.getElementById('finance-chart').innerHTML=monthly.length?monthly.map(m=>`<div class="finance-bar-group"><div class="finance-bars"><i class="bar-income" style="height:${Math.max(3,(m.income/max)*100)}%"></i><i class="bar-expense" style="height:${Math.max(3,(m.expense/max)*100)}%"></i></div><small>${m.month.slice(5)}/${m.month.slice(2,4)}</small></div>`).join(''):'<div class="crm-empty">Sem dados para o relatório.</div>';document.getElementById('finance-categories').innerHTML=categories.slice(0,6).map(c=>`<div><span>${esc(c.category)}</span><strong class="${c.type}">${brl(c.total)}</strong></div>`).join('');}
function renderIntegratedCost(targetId,summary={}){const business=Number(summary.business_expenses||0),household=Number(summary.household_expenses||0),total=business+household;document.getElementById(targetId).innerHTML=`<div class="integrated-cost-copy"><strong>Gasto total do mês</strong><small>Visão integrada das contas profissionais e de casa, incluindo valores pagos e pendentes.</small></div><div class="integrated-cost-value"><small>Empresa</small><strong>${brl(business)}</strong></div><div class="integrated-cost-value"><small>Casa</small><strong>${brl(household)}</strong></div><div class="integrated-cost-value total"><small>Total geral</small><strong>${brl(total)}</strong></div>`;}
async function loadHouseholdExpenses(){
  const input=document.getElementById('household-month');if(!input)return;
  if(!input.value)input.value=new Date().toISOString().slice(0,7);
  const res=await authFetch(`/api/admin/cash-flow?month=${input.value}&scope=household`);if(!res?.ok)return;
  const data=await res.json();householdCache=data.transactions||[];const s=data.summary||{};
  const paid=Number(s.expense_paid||0),pending=Number(s.payable||0),total=paid+pending;
  document.getElementById('household-kpis').innerHTML=[['Total do mês',brl(total),'total'],['Já pago',brl(paid),'paid'],['Ainda a pagar',brl(pending),'pending'],['Lançamentos',String(householdCache.filter(t=>t.status!=='cancelled').length),'count']].map(([label,value,tone])=>`<div class="household-kpi ${tone}"><small>${label}</small><strong>${value}</strong></div>`).join('');
  renderIntegratedCost('household-integrated-cost',data.combined_summary);
  document.getElementById('household-period-label').textContent=new Date(`${data.month}-02T12:00:00`).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const categoryFilter=document.getElementById('household-category-filter'),current=categoryFilter.value;
  categoryFilter.innerHTML='<option value="">Todas as categorias</option>'+householdCategories.map(category=>`<option>${category}</option>`).join('');categoryFilter.value=current;
  const categoryTotals=(data.categories||[]).filter(item=>item.type==='expense');
  document.getElementById('household-categories').innerHTML=categoryTotals.length?categoryTotals.map(item=>{const width=paid?Math.max(4,Math.round((Number(item.total)/paid)*100)):0;return `<div class="household-category-row"><div><span>${esc(item.category)}</span><strong>${brl(item.total)}</strong></div><i><b style="width:${width}%"></b></i></div>`;}).join(''):'<div class="crm-empty"><strong>Nenhum gasto pago</strong><span>As categorias aparecerão aqui.</span></div>';
  filterHouseholdExpenses();
}
function renderHouseholdTable(items=householdCache){const tbody=document.getElementById('household-tbody');if(!tbody)return;const labels={pending:'Pendente',paid:'Pago',cancelled:'Cancelado'};tbody.innerHTML=items.length?items.map(t=>`<tr class="clickable-cash-row" tabindex="0" onclick="openCashDetail(${t.id},'household')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openCashDetail(${t.id},'household')}"><td><span class="cash-date">${receiptDateLabel(t.due_date)}</span></td><td><strong>${esc(t.description)}</strong>${t.recurrence_frequency==='monthly'?` <span class="recurrence-chip">Mensal ${t.installment_number}/${t.installment_total}</span>`:''}<br><small>${esc(t.counterparty_name||'Não informado')}</small></td><td><span class="category-chip">${esc(t.category)}</span></td><td><span class="cash-status ${t.status}">${labels[t.status]}</span></td><td class="cash-value expense">− ${brl(t.amount_cents)}</td><td><button class="btn-secondary small" onclick="event.stopPropagation();editHouseholdExpense(${t.id})">Editar</button></td></tr>`).join(''):'<tr><td colspan="6"><div class="crm-empty"><strong>Nenhuma despesa de casa</strong><span>Registre seu primeiro gasto do mês.</span></div></td></tr>';}
function filterHouseholdExpenses(){const query=getVal('household-search')||'',category=getVal('household-category-filter'),status=getVal('household-status-filter');renderHouseholdTable(householdCache.filter(t=>matchesSearch([t.description,t.category,t.counterparty_name],query)&&(!category||t.category===category)&&(!status||t.status===status)));}
function openHouseholdExpenseModal(){openCashModal(null,'household');}
function editHouseholdExpense(id){openCashModal(householdCache.find(t=>t.id===id),'household');}
function openCashDetail(id,scope='business'){
  const source=scope==='household'?householdCache:cashCache,transaction=source.find(item=>Number(item.id)===Number(id));if(!transaction)return;
  const expense=transaction.type==='expense',statusLabels={pending:'Pendente',paid:expense?'Pago':'Recebido',cancelled:'Cancelado'},party=expense?(transaction.counterparty_name||'Não informado'):(transaction.client_name||'Sem cliente'),project=transaction.project_title||'Sem projeto';
  document.getElementById('cash-detail-eyebrow').textContent=scope==='household'?'Despesa de casa':expense?'Despesa da empresa':'Entrada da empresa';
  document.getElementById('cash-detail-title').textContent=transaction.description;
  const amount=document.getElementById('cash-detail-amount');amount.className=`cash-detail-amount ${transaction.type}`;amount.innerHTML=`<small>Valor do lançamento</small><strong>${expense?'− ':'+ '}${brl(transaction.amount_cents)}</strong>`;
  const details=[['Categoria',transaction.category],['Status',statusLabels[transaction.status]||transaction.status],[expense?'Vencimento':'Vencimento',receiptDateLabel(transaction.due_date)],[expense?'Pago em':'Recebido em',transaction.paid_date?receiptDateLabel(transaction.paid_date):'Não informado'],[expense?'Estabelecimento / empresa':'Cliente',party],['Forma de pagamento',transaction.payment_method||'Não informada']];
  if(!expense)details.push(['Projeto',project]);
  if(transaction.counterparty_document)details.push(['CPF/CNPJ',transaction.counterparty_document]);
  document.getElementById('cash-detail-grid').innerHTML=details.map(([label,value])=>`<div class="cash-detail-item"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join('');
  const notes=document.getElementById('cash-detail-notes');notes.hidden=!transaction.notes;notes.innerHTML=transaction.notes?`<strong>Observações</strong><br>${esc(transaction.notes)}`:'';
  const recurrence=document.getElementById('cash-detail-recurrence');recurrence.hidden=transaction.recurrence_frequency!=='monthly';recurrence.innerHTML=transaction.recurrence_frequency==='monthly'?`<strong>Recorrência mensal</strong><br>Parcela ${Number(transaction.installment_number||1)} de ${Number(transaction.installment_total||1)}. Ao editar, você pode sincronizar valor e dados em toda a série.`:'';
  document.getElementById('cash-detail-edit').onclick=()=>{closeCashDetail();openCashModal(transaction,scope);};
  document.getElementById('cash-detail-modal').classList.add('open');document.body.classList.add('modal-open');
}
function closeCashDetail(event){if(event&&event.target!==document.getElementById('cash-detail-modal'))return;document.getElementById('cash-detail-modal').classList.remove('open');document.body.classList.remove('modal-open');}
function exportHouseholdExpenses(){if(!householdCache.length){toast('Não há despesas de casa para exportar',true);return;}const header=['Data','Descrição','Categoria','Estabelecimento ou beneficiário','Status','Valor'];const rows=householdCache.map(t=>[t.due_date,t.description,t.category,t.counterparty_name||'',t.status,(t.amount_cents/100).toFixed(2).replace('.',',')]);const quote=value=>`"${String(value??'').replaceAll('"','""')}"`;const csv='\ufeff'+[header,...rows].map(row=>row.map(quote).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`despesas-de-casa-${getVal('household-month')}.csv`;a.click();URL.revokeObjectURL(url);toast('Despesas exportadas ✓');}
async function openCashModal(transaction=null,requestedScope='business'){
  const scope=transaction?.expense_scope||requestedScope;
  if(!clientsCache.length)await fetchClients();
  if(!projectsCache.length){const r=await authFetch('/api/admin/projects');if(r?.ok)projectsCache=(await r.json()).projects||[];}
  document.getElementById('cf-client').innerHTML='<option value="">Sem cliente</option>'+clientsCache.map(c=>`<option value="${c.id}">${esc(c.name)} — ${esc(c.email||c.phone||'sem contato')}</option>`).join('');
  document.getElementById('cf-project').innerHTML='<option value="">Sem projeto</option>'+projectsCache.map(p=>`<option value="${p.id}">${esc(p.title)}</option>`).join('');
  document.getElementById('cash-form').reset();
  setVal('cf-id',transaction?.id||'');setVal('cf-scope',scope);setVal('cf-type',scope==='household'?'expense':(transaction?.type||'income'));setVal('cf-frequency','once');
  document.getElementById('cf-infinitepay-auto').checked=!transaction;
  document.getElementById('cf-reminder-email').checked=true;document.getElementById('cf-reminder-sms').checked=false;document.getElementById('cf-reminder-whatsapp').checked=false;
  updateCashCategories();
  if(transaction){
    for(const [f,k]of[['cf-status','status'],['cf-description','description'],['cf-category','category'],['cf-due','due_date'],['cf-paid','paid_date'],['cf-client','client_id'],['cf-project','project_id'],['cf-payment','payment_method'],['cf-payment-url','payment_url'],['cf-counterparty-document','counterparty_document'],['cf-notes','notes']])setVal(f,transaction[k]||'');
    const companyOptions=[...document.getElementById('cf-company').options].map(option=>option.value);
    if(scope==='household'){setVal('cf-household-counterparty',transaction.counterparty_name||'');setVal('cf-household-document',transaction.counterparty_document||'');}
    else if(companyOptions.includes(transaction.counterparty_name)){setVal('cf-company',transaction.counterparty_name);}
    else{setVal('cf-company','__other');setVal('cf-counterparty',transaction.counterparty_name||'');}
    setVal('cf-amount',(transaction.amount_cents/100).toFixed(2));
    document.getElementById('cf-reminder-enabled').checked=Boolean(transaction.reminder_enabled);document.getElementById('cf-reminder-email').checked=Boolean(transaction.reminder_email);document.getElementById('cf-reminder-sms').checked=Boolean(transaction.reminder_sms);document.getElementById('cf-reminder-whatsapp').checked=Boolean(transaction.reminder_whatsapp);
  }else{setVal('cf-due',new Date().toISOString().slice(0,10));document.getElementById('cf-reminder-enabled').checked=false;}
  document.getElementById('cf-series-update').hidden=!transaction?.recurrence_group;document.getElementById('cf-update-series').checked=Boolean(transaction?.recurrence_group);
  updateCashTypeUI();toggleCustomCashCompany();document.getElementById('cf-frequency').disabled=Boolean(transaction);document.getElementById('cf-type').disabled=scope==='household';
  document.getElementById('cash-modal').classList.add('open');document.body.classList.add('modal-open');
}
function closeCashModal(event){if(event&&event.target!==document.getElementById('cash-modal'))return;document.getElementById('cash-modal').classList.remove('open');document.body.classList.remove('modal-open');}
function updateCashCategories(){const type=getVal('cf-type')||'income',scope=getVal('cf-scope')||'business',select=document.getElementById('cf-category'),current=select.value,categories=scope==='household'?householdCategories:cashCategories[type];select.innerHTML=categories.map(c=>`<option>${c}</option>`).join('');if(categories.includes(current))select.value=current;updateCashTypeUI();}
function editCash(id){openCashModal(cashCache.find(t=>t.id===id));}
function updateCashTypeUI(){
  const expense=getVal('cf-type')==='expense',household=getVal('cf-scope')==='household',editing=Boolean(getVal('cf-id'));
  document.getElementById('cash-modal-title').textContent=household?(editing?'Editar despesa de casa':'Nova despesa de casa'):expense?(editing?'Editar despesa':'Nova despesa'):(editing?'Editar cobrança':'Nova cobrança');
  document.getElementById('cash-modal-subtitle').textContent=household?'Registre um gasto pessoal sem misturar com as contas da empresa.':expense?'Registre uma conta a pagar e identifique a empresa do serviço.':'Registre uma entrada a receber e vincule ao cliente.';
  document.getElementById('cf-status-paid').textContent=expense?'Pago':'Recebido';
  document.getElementById('cf-paid-label').textContent=expense?'Pago em':'Recebido em';
  document.getElementById('cf-frequency-label').textContent=expense?'Recorrência da despesa':'Recorrência da cobrança';
  document.getElementById('cf-frequency-once').textContent=expense?'Despesa avulsa':'Cobrança avulsa';
  document.getElementById('cf-frequency-monthly').textContent=expense?'Mensal / assinatura recorrente':'Mensal / contrato recorrente';
  document.getElementById('cf-income-links').hidden=expense;document.getElementById('cf-expense-details').hidden=!expense||household;document.getElementById('cf-household-details').hidden=!household;
  document.getElementById('cf-company').required=expense&&!household;document.getElementById('cf-household-counterparty').required=household;
  toggleCustomCashCompany();toggleCashRecurrence();toggleCashReminder();
}
function toggleCustomCashCompany(){const custom=getVal('cf-type')==='expense'&&getVal('cf-scope')!=='household'&&getVal('cf-company')==='__other',field=document.getElementById('cf-custom-company-field'),input=document.getElementById('cf-counterparty');field.hidden=!custom;input.required=custom;if(!custom)input.value='';}
function syncCashCompany(){const input=document.getElementById('cf-counterparty');if(input)input.value=input.value.trimStart();}
function toggleCashRecurrence(){const monthly=getVal('cf-frequency')==='monthly',expense=getVal('cf-type')==='expense';document.getElementById('cf-months-field').hidden=!monthly;document.getElementById('cf-recurrence-help').textContent=monthly?(expense?'A primeira despesa mantém o status escolhido; as próximas serão criadas como pendentes.':'A primeira cobrança mantém o status escolhido; as próximas serão criadas como pendentes.'):(expense?'Use a recorrência mensal para assinaturas, aluguel e custos fixos.':'Use mensal para clientes fixos, manutenção e contratos continuados.');}
function toggleCashReminder(){const master=document.getElementById('cf-reminder-enabled'),income=getVal('cf-type')==='income',eligible=income&&getVal('cf-status')==='pending';if(!master)return;document.getElementById('cf-reminder-box').hidden=!income;master.disabled=!eligible;if(!eligible)master.checked=false;document.getElementById('cf-reminder-settings').hidden=!eligible||!master.checked;toggleInfinitePay();}
function toggleInfinitePay(){
  const automatic=document.getElementById('cf-infinitepay-auto')?.checked;
  const income=getVal('cf-type')==='income',eligible=income&&getVal('cf-status')==='pending';
  const checkbox=document.getElementById('cf-infinitepay-auto');if(!checkbox)return;
  document.getElementById('cf-infinitepay-box').hidden=!income;
  checkbox.disabled=!eligible;if(!eligible)checkbox.checked=false;
  document.getElementById('cf-manual-payment').hidden=!income||Boolean(eligible&&automatic);
  document.getElementById('cash-submit').textContent=!income?'Salvar despesa':eligible&&automatic?'Salvar e gerar cobrança':'Salvar cobrança';
}
async function submitCashTransaction(event){
  event.preventDefault();
  const id=Number(getVal('cf-id'))||null,type=getVal('cf-type'),scope=getVal('cf-scope')||'business',expense=type==='expense',household=scope==='household',amount=Number(getVal('cf-amount')),frequency=getVal('cf-frequency')||'once',months=frequency==='monthly'?Number(getVal('cf-months')):1;
  const reminderEnabled=!expense&&document.getElementById('cf-reminder-enabled').checked,generatePaymentLink=!expense&&document.getElementById('cf-infinitepay-auto').checked;
  const selectedCompany=getVal('cf-company'),counterparty=household?getVal('cf-household-counterparty'):(selectedCompany==='__other'?getVal('cf-counterparty'):selectedCompany),counterpartyDocument=household?getVal('cf-household-document'):getVal('cf-counterparty-document');
  if(expense&&!counterparty){toast(household?'Informe o estabelecimento ou beneficiário':'Escolha a empresa ou informe outro prestador',true);return;}
  if((reminderEnabled||generatePaymentLink)&&!getVal('cf-client')){toast('Selecione o cliente da cobrança',true);return;}
  if(reminderEnabled&&!generatePaymentLink&&!getVal('cf-payment-url')){toast('Informe ou gere o link de pagamento da InfinitePay',true);return;}
  const body={id,type,expense_scope:scope,status:getVal('cf-status'),description:getVal('cf-description'),category:getVal('cf-category'),amount_cents:Math.round(amount*100),due_date:getVal('cf-due'),paid_date:getVal('cf-paid'),client_id:expense?null:Number(getVal('cf-client'))||null,project_id:expense?null:Number(getVal('cf-project'))||null,counterparty_name:expense?counterparty:'',counterparty_document:expense?counterpartyDocument:'',payment_method:getVal('cf-payment'),payment_url:expense?'':getVal('cf-payment-url'),generate_payment_link:generatePaymentLink,reminder_enabled:reminderEnabled,reminder_email:!expense&&document.getElementById('cf-reminder-email').checked,reminder_sms:!expense&&document.getElementById('cf-reminder-sms').checked,reminder_whatsapp:!expense&&document.getElementById('cf-reminder-whatsapp').checked,notes:getVal('cf-notes'),recurrence_frequency:frequency,recurrence_months:months,update_recurrence_group:Boolean(id&&document.getElementById('cf-update-series').checked)};
  const button=document.getElementById('cash-submit');button.disabled=true;button.textContent=generatePaymentLink?'Gerando na InfinitePay...':'Salvando...';
  try{
    const res=await authFetch('/api/admin/cash-flow',{method:id?'PUT':'POST',body:JSON.stringify(body)});
    if(res?.ok){const data=await res.json().catch(()=>({}));const synced=data.updated_series>1?` · ${data.updated_series} meses sincronizados`:'';toast((household?(data.created>1?`${data.created} despesas de casa criadas ✓`:'Despesa de casa salva ✓'):expense?(data.created>1?`${data.created} despesas mensais criadas ✓`:'Despesa salva ✓'):generatePaymentLink?(data.created>1?`${data.created} checkouts InfinitePay gerados ✓`:'Checkout InfinitePay gerado ✓'):data.created>1?`${data.created} cobranças mensais criadas ✓`:'Cobrança salva ✓')+synced);closeCashModal();if(household){setVal('household-month',body.due_date.slice(0,7));loadHouseholdExpenses();}else{revealCreatedCash(body.due_date);loadCashFlow();loadCrmDashboard();}}
    else if(res){const d=await res.json().catch(()=>({}));toast(d.error||'Erro ao salvar lançamento',true);}
  }finally{button.disabled=false;toggleInfinitePay();}
}

/* ══ CLIENTES ══ */
let clientsCache = [];

async function fetchClients() {
  const res = await authFetch('/api/admin/clients');
  if (!res?.ok) return [];
  clientsCache = (await res.json()).clients || [];
  return clientsCache;
}

async function loadClients() {
  const list = document.getElementById('clients-list'); if (!list) return;
  list.innerHTML = '<div class="client-grid-empty">Carregando clientes...</div>';
  await fetchClients();
  renderClients();
}
function renderClients() {
  const list = document.getElementById('clients-list');
  const clients = clientsCache.filter(c=>matchesSearch([
    c.name,c.email,c.phone,c.document,c.city,
    ...(c.emails || []).flatMap(contact => [contact.value, contact.contact_name]),
    ...(c.phones || []).flatMap(contact => [contact.value, contact.contact_name]),
  ],getVal('clients-search')));
  document.getElementById('clients-count').textContent = `${clients.length} cliente${clients.length === 1 ? '' : 's'}`;
  list.innerHTML = clients.length ? clients.map(client => `<article class="client-list-card">
    <header class="client-list-card-header">
      <span class="client-avatar">${esc(clientInitials(client.name))}</span>
      <div class="client-identity"><h4>${esc(client.name)}</h4><div class="client-meta">${client.document ? `<span>CPF/CNPJ ${esc(client.document)}</span>` : '<span>Documento não informado</span>'}${client.city || client.state ? `<span>⌖ ${esc([client.city,client.state].filter(Boolean).join(' / '))}</span>` : '<span>Local não informado</span>'}</div></div>
    </header>
    <div class="client-card-contacts">
      <section><div class="client-contact-title"><span>✉</span><strong>E-mails</strong></div>${clientContactCards('email',client.emails,client.email,client.name)}</section>
      <section><div class="client-contact-title"><span>☎</span><strong>Telefones</strong></div>${clientContactCards('phone',client.phones,client.phone,client.name)}</section>
    </div>
    <footer class="client-list-actions"><button class="btn-secondary small" onclick="editClient(${client.id})">Editar cadastro</button><button class="client-archive-action" onclick="archiveClient(${client.id})">Arquivar</button></footer>
  </article>`).join('') : '<div class="client-grid-empty"><strong>Nenhum cliente encontrado</strong><span>Ajuste a busca ou cadastre um novo cliente.</span></div>';
}

function clientInitials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  return `${words[0]?.[0] || 'C'}${words.length > 1 ? words.at(-1)[0] : ''}`.toUpperCase();
}

function clientContactCards(type, contacts, fallbackValue, fallbackName) {
  const list = contacts?.length ? contacts : (fallbackValue ? [{ value:fallbackValue, contact_name:fallbackName }] : []);
  if (!list.length) return '<p class="client-contact-empty">Não informado</p>';
  return `<div class="client-contact-items">${list.map((contact,index)=>{
    const target=type==='email'?`mailto:${contact.value}`:`https://wa.me/${whatsappNumber(contact.value)}`;
    return `<a class="client-contact-item" href="${esc(target)}" ${type==='phone'?'target="_blank" rel="noopener"':''}>
      <span><b>${esc(contact.contact_name || fallbackName)}</b><small>${esc(contact.value)}</small></span>${index===0?'<em>Principal</em>':''}
    </a>`;
  }).join('')}</div>`;
}

function clientContactRow(type, contact = {}, index = 0) {
  const isEmail = type === 'email';
  return `<div class="client-contact-row" data-contact-row data-type="${type}">
    <input class="admin-input" data-field="contact-name" maxlength="120" placeholder="Nome do responsável" aria-label="Nome do responsável" value="${esc(contact.contact_name || '')}">
    <input class="admin-input" data-field="value" ${isEmail ? 'type="email"' : 'type="tel" inputmode="tel"'} maxlength="${isEmail ? 254 : 30}" placeholder="${isEmail ? 'email@empresa.com.br' : '(92) 99999-9999'}" aria-label="${isEmail ? 'E-mail' : 'Celular ou telefone'}" value="${esc(contact.value || '')}">
    <span class="primary-chip" ${index === 0 ? '' : 'hidden'}>Principal</span>
    <button type="button" class="contact-remove" title="Remover contato" aria-label="Remover contato" onclick="removeClientContact(this)">×</button>
  </div>`;
}

function renderClientContacts(type, contacts = []) {
  const container = document.getElementById(type === 'email' ? 'c-emails' : 'c-phones');
  if (!container) return;
  const list = contacts.length ? contacts : [{}];
  container.innerHTML = list.map((contact, index) => clientContactRow(type, contact, index)).join('');
}

function addClientContact(type) {
  if (!['email','phone'].includes(type)) return;
  const container = document.getElementById(type === 'email' ? 'c-emails' : 'c-phones');
  if (container.querySelectorAll('[data-contact-row]').length >= 10) return toast('Limite de 10 contatos por tipo', true);
  container.insertAdjacentHTML('beforeend', clientContactRow(type, {}, container.querySelectorAll('[data-contact-row]').length));
  container.lastElementChild?.querySelector('[data-field="contact-name"]')?.focus();
}

function removeClientContact(button) {
  const row = button.closest('[data-contact-row]');
  const container = row?.parentElement;
  if (!row || !container) return;
  const rows = [...container.querySelectorAll('[data-contact-row]')];
  if (rows.length === 1) {
    row.querySelectorAll('input').forEach(input => { input.value = ''; });
    return;
  }
  row.remove();
  [...container.querySelectorAll('[data-contact-row]')].forEach((item, index) => { item.querySelector('.primary-chip').hidden = index !== 0; });
}

function readClientContacts(type) {
  const container = document.getElementById(type === 'email' ? 'c-emails' : 'c-phones');
  return [...container.querySelectorAll('[data-contact-row]')].map(row => ({
    contact_name: row.querySelector('[data-field="contact-name"]').value.trim(),
    value: row.querySelector('[data-field="value"]').value.trim(),
  })).filter(contact => contact.value || contact.contact_name);
}

async function submitClient(event) {
  event.preventDefault(); const id = Number(getVal('c-id')) || null;
  const emails = readClientContacts('email'); const phones = readClientContacts('phone');
  if (!emails.length) return toast('Cadastre pelo menos um e-mail', true);
  if ([...emails, ...phones].some(contact => !contact.value || !contact.contact_name)) return toast('Preencha o contato e o nome do responsável em todas as linhas', true);
  const body = { id, name:getVal('c-name'), email:emails[0].value, phone:phones[0]?.value || '', emails, phones, document:getVal('c-document'), address:getVal('c-address'), city:getVal('c-city'), state:getVal('c-state'), postal_code:getVal('c-postal'), notes:getVal('c-notes') };
  const res = await authFetch('/api/admin/clients', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  if (res?.ok) { toast(id ? 'Cliente atualizado ✓' : 'Cliente cadastrado ✓'); closeClientModal(); loadClients(); }
  else if (res) { const data = await res.json().catch(() => ({})); toast(data.error || 'Erro ao salvar cliente', true); }
}

function editClient(id) {
  const client = clientsCache.find(item => item.id === id); if (!client) return;
  resetClientForm();
  for (const [field,key] of [['c-id','id'],['c-name','name'],['c-document','document'],['c-address','address'],['c-city','city'],['c-state','state'],['c-postal','postal_code'],['c-notes','notes']]) setVal(field, client[key] || '');
  renderClientContacts('email', client.emails?.length ? client.emails : [{ value:client.email, contact_name:client.name }]);
  renderClientContacts('phone', client.phones?.length ? client.phones : (client.phone ? [{ value:client.phone, contact_name:client.name }] : []));
  document.getElementById('client-modal-title').textContent = 'Editar cliente';
  document.getElementById('client-submit').textContent = 'Salvar alterações';
  document.getElementById('client-modal').classList.add('open'); document.body.classList.add('modal-open');
}

function resetClientForm() {
  document.getElementById('client-form').reset(); setVal('c-id','');
  renderClientContacts('email'); renderClientContacts('phone');
  document.getElementById('client-modal-title').textContent = 'Novo cliente';
  document.getElementById('client-submit').textContent = 'Cadastrar cliente';
}

function openClientModal() {
  resetClientForm();
  document.getElementById('client-modal').classList.add('open'); document.body.classList.add('modal-open');
  document.getElementById('c-name').focus();
}

function closeClientModal(event) {
  const modal = document.getElementById('client-modal');
  if (event && event.target !== modal) return;
  modal.classList.remove('open'); document.body.classList.remove('modal-open'); resetClientForm();
}

renderClientContacts('email');
renderClientContacts('phone');

async function archiveClient(id) {
  if (!confirm('Arquivar este cliente? O histórico de recibos será preservado.')) return;
  const res = await authFetch(`/api/admin/clients?id=${id}`, { method:'DELETE' });
  if (res?.ok) { toast('Cliente arquivado'); loadClients(); } else toast('Erro ao arquivar', true);
}

let cepTimer;
function handleCepInput(input) {
  const digits = input.value.replace(/\D/g, '').slice(0, 8);
  input.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  clearTimeout(cepTimer);
  if (digits.length === 8) cepTimer = setTimeout(lookupCep, 350);
  else document.getElementById('cep-status').textContent = '';
}

async function lookupCep() {
  const cep = getVal('c-postal').replace(/\D/g, '');
  if (cep.length !== 8) return;
  const status = document.getElementById('cep-status');
  status.textContent = 'Buscando endereço...'; status.style.color = 'var(--text2)';
  const res = await authFetch(`/api/admin/cep/${cep}`);
  if (!res?.ok) {
    const data = await res?.json().catch(() => ({}));
    status.textContent = data?.error || 'CEP não encontrado'; status.style.color = 'var(--red)'; return;
  }
  const data = await res.json();
  setVal('c-address', [data.address, data.neighborhood].filter(Boolean).join(' — '));
  setVal('c-city', data.city); setVal('c-state', data.state);
  status.textContent = 'Endereço preenchido ✓'; status.style.color = '#22c55e';
  document.getElementById('c-address').focus();
}

async function loadClientOptions() {
  const clients = await fetchClients(); const select = document.getElementById('r-client'); if (!select) return;
  select.innerHTML = '<option value="">Selecione um cliente</option>' + clients.map(client => `<option value="${client.id}">${esc(client.name)} — ${esc(client.email)}</option>`).join('');
  selectReceiptClient();
}

function selectReceiptClient() {
  const client = clientsCache.find(item => item.id === Number(getVal('r-client')));
  setVal('r-email-preview', client?.email || '');
  updateReceiptPreview();
}

function receiptDateLabel(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '—';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function updateReceiptPreview() {
  const client = clientsCache.find(item => item.id === Number(getVal('r-client')));
  const amount = Number(getVal('r-amount')) || 0;
  document.getElementById('preview-client').textContent = client?.name || 'Selecione um cliente';
  document.getElementById('preview-document').textContent = client?.document ? `CPF/CNPJ ${client.document}` : '';
  document.getElementById('preview-amount').textContent = amount.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  document.getElementById('preview-service-amount').textContent = amount.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  document.getElementById('preview-description').textContent = getVal('r-description') || 'Descrição do pagamento';
  document.getElementById('preview-payment').textContent = getVal('r-payment') || 'Não informada';
  document.getElementById('preview-date').textContent = receiptDateLabel(getVal('r-date'));
  const address = client ? [client.address, [client.city, client.state].filter(Boolean).join(' / '), client.postal_code ? `CEP ${client.postal_code}` : ''].filter(Boolean).join(' • ') : '';
  document.getElementById('preview-address').textContent = address;
}

function printReceipt() {
  updateReceiptPreview();
  window.print();
}

let signatureDirty = false;
let signatureHistory = [];
function setupSignaturePad() {
  const canvas = document.getElementById('signature-pad'); if (!canvas) return;
  const context = canvas.getContext('2d');
  context.lineWidth = 4; context.lineCap = 'round'; context.lineJoin = 'round'; context.strokeStyle = '#111827';
  let drawing = false;
  const point = event => { const rect = canvas.getBoundingClientRect(); return { x:(event.clientX-rect.left)*(canvas.width/rect.width), y:(event.clientY-rect.top)*(canvas.height/rect.height) }; };
  canvas.addEventListener('pointerdown', event => { signatureHistory.push(context.getImageData(0,0,canvas.width,canvas.height)); if(signatureHistory.length>20)signatureHistory.shift(); drawing=true; signatureDirty=true; canvas.setPointerCapture(event.pointerId); const p=point(event); context.beginPath(); context.moveTo(p.x,p.y); updateSignatureUi(); });
  canvas.addEventListener('pointermove', event => { if(!drawing)return; const p=point(event); context.lineTo(p.x,p.y); context.stroke(); updateSignaturePreview(); });
  const stop = () => { if(!drawing)return; drawing=false; updateSignaturePreview(); };
  canvas.addEventListener('pointerup', stop); canvas.addEventListener('pointercancel', stop);
}

function updateSignaturePreview() {
  const image=document.getElementById('preview-signature'); const canvas=document.getElementById('signature-pad');
  image.hidden=!signatureDirty;
  if(signatureDirty) image.src=canvas.toDataURL('image/png'); else image.removeAttribute('src');
  updateSignatureUi();
}

function updateSignatureUi() {
  const status=document.getElementById('signature-status');
  status.textContent=signatureDirty?'Assinado':'Não assinado'; status.classList.toggle('signed',signatureDirty);
  document.getElementById('signature-placeholder').classList.toggle('hidden',signatureDirty);
  document.getElementById('signature-clear').disabled=!signatureDirty;
  document.getElementById('signature-undo').disabled=!signatureHistory.length;
}

function undoSignature() {
  const canvas=document.getElementById('signature-pad'), context=canvas.getContext('2d');
  const previous=signatureHistory.pop(); if(!previous)return;
  context.clearRect(0,0,canvas.width,canvas.height); context.putImageData(previous,0,0);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
  signatureDirty=false; for(let i=3;i<pixels.length;i+=4){if(pixels[i]){signatureDirty=true;break;}}
  updateSignaturePreview();
}

function clearSignature() {
  const canvas=document.getElementById('signature-pad'); canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  signatureDirty=false; signatureHistory=[]; updateSignaturePreview();
}

async function uploadSignature() {
  if(!signatureDirty) return '';
  const blob=await new Promise(resolve => document.getElementById('signature-pad').toBlob(resolve,'image/png'));
  if(!blob) throw new Error('Não foi possível processar a assinatura');
  const response=await authFetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':'image/png','X-Upload-Purpose':'signature'},body:blob});
  if(!response?.ok) throw new Error('Não foi possível salvar a assinatura');
  return (await response.json()).url;
}

/* ══ RECIBOS POR E-MAIL ══ */
function toggleReceiptSchedule() {
  const scheduled = getVal('r-mode') === 'scheduled';
  document.getElementById('r-schedule-field').hidden = !scheduled;
  document.getElementById('r-scheduled').required = scheduled;
  document.getElementById('receipt-submit').textContent = scheduled ? 'Agendar recibo' : 'Enviar recibo';
}

async function submitReceipt(event) {
  event.preventDefault();
  const button = document.getElementById('receipt-submit');
  const amount = Number(getVal('r-amount'));
  const scheduled = getVal('r-mode') === 'scheduled';
  const scheduledValue = getVal('r-scheduled');
  if (!Number.isFinite(amount) || amount <= 0) { toast('Informe um valor válido', true); return; }
  if (scheduled && !scheduledValue) { toast('Informe a data e hora do envio', true); return; }
  const body = {
    client_id: Number(getVal('r-client')),
    description: getVal('r-description'), amount_cents: Math.round(amount * 100),
    payment_method: getVal('r-payment'), receipt_date: getVal('r-date'),
    scheduled_at: scheduled ? new Date(scheduledValue).toISOString() : null,
  };
  button.disabled = true;
  try {
    body.signature_url = await uploadSignature();
    const res = await authFetch('/api/admin/receipts', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) {
      const created = await res.json();
      event.target.reset();
      const now = new Date();
      document.getElementById('r-date').value = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
      toggleReceiptSchedule();
      clearSignature();
      updateReceiptPreview();
      toast(`${scheduled ? 'Recibo agendado' : 'Recibo enviado'} • ${created.document_code} ✓`);
      loadReceipts();
    } else if (res) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || 'Erro ao processar recibo', true);
    }
  } finally { button.disabled = false; }
}

async function loadReceipts() {
  const tbody = document.getElementById('receipts-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:28px">Carregando...</td></tr>';
  const res = await authFetch('/api/admin/receipts');
  if (!res?.ok) { tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar recibos.</td></tr>'; return; }
  const { receipts = [] } = await res.json();
  document.getElementById('receipts-count').textContent = `${receipts.length} recibo${receipts.length === 1 ? '' : 's'}`;
  if (!receipts.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:28px">Nenhum recibo enviado.</td></tr>'; return; }
  const labels = { sent: 'Enviado', scheduled: 'Agendado', cancelled: 'Cancelado', failed: 'Falhou', pending: 'Processando' };
  tbody.innerHTML = receipts.map(receipt => `
    <tr><td>#${receipt.id}</td><td><strong>${esc(receipt.recipient_name)}</strong><br><small>${esc(receipt.recipient_email)}</small></td>
    <td>${esc(receipt.description)}</td><td>${(receipt.amount_cents / 100).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}</td>
    <td>${formatDate(receipt.scheduled_at || receipt.created_at)}</td><td><span class="lead-tag">${labels[receipt.status] || esc(receipt.status)}</span></td>
    <td><div style="display:flex;gap:6px">${receipt.pdf_url ? `<a class="btn-secondary small" href="/api/admin/receipts/${receipt.id}/pdf">PDF</a>` : ''}${receipt.status === 'scheduled' ? `<button class="btn-danger-sm" onclick="cancelReceipt(${receipt.id})">Cancelar</button>` : ''}</div></td></tr>`).join('');
}

async function cancelReceipt(id) {
  if (!confirm('Cancelar este envio agendado?')) return;
  const res = await authFetch(`/api/admin/receipts/${id}`, { method: 'DELETE' });
  if (res?.ok) { toast('Agendamento cancelado'); loadReceipts(); }
  else { const data = await res?.json().catch(() => ({})); toast(data?.error || 'Erro ao cancelar', true); }
}

const receiptDate = document.getElementById('r-date');
if (receiptDate) {
  const now = new Date(); const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  receiptDate.value = localDate.toISOString().slice(0, 10);
}
['r-description','r-amount','r-payment','r-date'].forEach(id => document.getElementById(id)?.addEventListener('input', updateReceiptPreview));
updateReceiptPreview();
setupSignaturePad();

/* ══ ANALYTICS ══ */
async function loadAnalytics() {
  const loadingEl = document.getElementById('analytics-loading');
  const contentEl = document.getElementById('analytics-content');
  if (!loadingEl || !contentEl) return;
  loadingEl.style.display = 'block';
  contentEl.style.display = 'none';

  let d;
  try {
    const res = await authFetch('/api/admin/analytics');
    if (!res?.ok) {
      loadingEl.textContent = 'Erro ao carregar analytics. Tente novamente.';
      return;
    }
    d = await res.json();
  } catch {
    loadingEl.textContent = 'Erro de conexão.';
    return;
  }
  if (!d) return;

  document.getElementById('analytics-loading').style.display = 'none';
  document.getElementById('analytics-content').style.display = 'block';

  // Stats cards
  document.getElementById('analytics-cards').innerHTML = [
    { icon: '👁', label: 'Visualizações totais', value: d.total_views, color: '#00d4ff' },
    { icon: '📅', label: 'Hoje', value: d.today_views, color: '#7b2ff7' },
    { icon: '🔗', label: 'Cliques em links', value: d.total_clicks, color: '#25D366' },
    { icon: '💬', label: 'Abriram o modal', value: d.modal_opens, color: '#f59e0b' },
    { icon: '🧑', label: 'Sessões únicas', value: d.unique_sessions, color: '#0055ff' },
  ].map(c => `
    <div class="acard" style="--ac:${c.color}">
      <span class="acard-icon">${c.icon}</span>
      <span class="acard-val">${c.value}</span>
      <span class="acard-label">${c.label}</span>
    </div>
  `).join('');

  // Gráfico de barras por dia
  const days = d.by_day.slice(0, 30).reverse();
  const maxN = Math.max(...days.map(d => d.n), 1);
  document.getElementById('chart-days').innerHTML = days.length === 0
    ? '<p style="color:#666;text-align:center;padding:32px">Sem dados ainda</p>'
    : `<div class="bar-chart">${days.map(r => `
        <div class="bar-col">
          <div class="bar-fill" style="height:${Math.round((r.n/maxN)*100)}%" title="${r.n} visitas"></div>
          <span class="bar-label">${r.day?.slice(5)}</span>
        </div>`).join('')}</div>`;

  // Top links
  document.getElementById('top-links-list').innerHTML = d.top_links.length === 0
    ? '<p style="color:#666;text-align:center;padding:32px">Sem cliques registrados ainda</p>'
    : d.top_links.map((l, i) => `
      <div class="top-link-row">
        <span class="tl-rank">${i+1}</span>
        <span class="tl-name">${esc(l.label || l.href || '—')}</span>
        <span class="tl-bar"><span style="width:${Math.round((l.clicks/d.top_links[0].clicks)*100)}%"></span></span>
        <span class="tl-count">${l.clicks}</span>
      </div>`).join('');
}
