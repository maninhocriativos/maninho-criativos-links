/* ══ Auth ══ */
async function checkAuth() {
  try {
    const res = await fetch('/api/admin/verify');
    if (!res.ok) return window.location.replace('/login.html');
    showPanel();
  } catch { window.location.replace('/login.html'); }
}

function showPanel() {
  document.getElementById('admin-panel').style.display = 'grid';
  loadAllData();
  restoreTab();
}

async function logout() {
  await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
  window.location.replace('/login.html');
}

/* ══ Tabs ══ */
const tabTitles = { links: ['Gerenciar Links','Organize os destinos da sua página'], portfolio: ['Portfólio','Gerencie seus projetos publicados'], profile: ['Editar Perfil','Identidade e aparência da página'], leads: ['Leads Captados','Contatos recebidos pelo site'], clients: ['Clientes','Cadastro central para propostas e recibos'], receipts: ['Recibos por e-mail','Envie agora ou programe o disparo'], analytics: ['Analytics','Acompanhe o desempenho do site'] };

function setTab(name, btn, persist = true) {
  if (!document.getElementById(`tab-${name}`)) name = 'links';
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.snav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.add('active');
  (btn || document.querySelector(`.snav-item[data-tab="${name}"]`))?.classList.add('active');
  document.getElementById('admin-page-title').textContent = tabTitles[name][0];
  document.getElementById('admin-page-subtitle').textContent = tabTitles[name][1];
  if (persist) {
    localStorage.setItem('mc_admin_tab', name);
    history.replaceState(null, '', `${location.pathname}${location.search}#${name}`);
  }
  if (name === 'portfolio') loadPortfolioAdmin();
  if (name === 'leads') loadLeads();
  if (name === 'clients') loadClients();
  if (name === 'receipts') { loadClientOptions(); loadReceipts(); }
  if (name === 'analytics') loadAnalytics();
  closeSidebar();
}

function restoreTab() {
  const hashTab = location.hash.replace('#', '');
  const savedTab = localStorage.getItem('mc_admin_tab');
  setTab(hashTab || savedTab || 'links', null, false);
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
}
function closeSidebar() {
  sidebar?.classList.remove('open');
  sidebarOverlay?.classList.remove('open');
  document.body.style.overflow = '';
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
  renderLinks(links || []);
}

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
      <div class="table-row-icon" style="background:linear-gradient(135deg,${esc(link.color_from)},${esc(link.color_to)})">
        ${esc(link.icon)}
      </div>
      <div class="table-row-info">
        <div class="table-row-title">
          ${esc(link.title)}
          <span class="click-count">👆 ${link.click_count || 0}</span>
        </div>
        <div class="table-row-url">${esc(link.url)}</div>
      </div>
      <div class="table-row-actions">
        <button class="status-badge ${link.is_active ? 'on' : 'off'}"
          onclick="toggleActive(${link.id}, ${link.is_active})">
          ${link.is_active ? '● Ativo' : '○ Inativo'}
        </button>
        <button class="btn-icon" onclick="openEdit(${link.id})" title="Editar">✏️</button>
        <button class="btn-danger" onclick="deleteLink(${link.id})" title="Excluir">🗑</button>
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
function togglePanel(id) {
  const el = document.getElementById(id);
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
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  if (res.status === 401) { window.location.replace('/login.html'); return null; }
  return res;
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
  renderPortfolioTable(items || []);
}

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
        <div class="table-row-url">${esc(item.category)}</div>
      </div>
      <div class="table-row-actions">
        <button class="status-badge ${item.is_active ? 'on' : 'off'}"
          onclick="togglePortfolioItem(${item.id}, ${item.is_active})">
          ${item.is_active ? '● Ativo' : '○ Inativo'}
        </button>
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
    title:       getVal('pf-title'),
    category:    getVal('pf-cat'),
    description: getVal('pf-desc'),
    image_url:   imageUrl,
    image_mobile_url: getVal('pf-mobile-url'),
    project_url: getVal('pf-project-url'),
    order_index: parseInt(getVal('pf-order')) || 0,
  };
  const res = await authFetch('/api/admin/portfolio', { method: 'POST', body: JSON.stringify(body) });
  if (res?.ok) {
    e.target.reset();
    togglePanel('add-portfolio-panel');
    toast('Item adicionado ✓');
    loadPortfolioAdmin();
  } else {
    toast('Erro ao adicionar', true);
  }
}

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
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:#666">Carregando...</td></tr>';

  let data;
  try {
    const res = await fetch('/api/admin/leads');
    if (!res.ok) { tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:#f87171">Erro ao carregar.</td></tr>'; return; }
    data = await res.json();
  } catch { tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:#f87171">Erro de conexão.</td></tr>'; return; }
  if (!data || !data.leads) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:#f87171">Erro ao carregar leads.</td></tr>';
    return;
  }

  const leads = data.leads;
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

  if (leads.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:#666">Nenhum lead ainda.</td></tr>';
    return;
  }

  tbody.innerHTML = leads.map(l => `
    <tr>
      <td>${l.id}</td>
      <td><strong>${esc(l.name)}</strong></td>
      <td><a href="https://wa.me/55${l.phone.replace(/\D/g,'')}" target="_blank" class="lead-wa">${esc(l.phone)}</a></td>
      <td>${l.instagram ? `<a href="https://instagram.com/${encodeURIComponent(String(l.instagram).replace(/^@/,''))}" target="_blank" rel="noopener noreferrer">${esc(l.instagram)}</a>` : '—'}</td>
      <td><span class="lead-tag">${esc(l.service || '—')}</span></td>
      <td class="lead-msg">${esc(l.message || '—')}</td>
      <td><span class="lead-page lead-page-${l.page === 'portfolio' ? 'portfolio' : 'links'}">${l.page === 'portfolio' ? 'portfolio' : 'links'}</span></td>
      <td class="lead-date">${formatDate(l.created_at)}</td>
      <td><button class="btn-danger-sm" onclick="deleteLead(${l.id})">✕</button></td>
    </tr>
  `).join('');
}

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

/* ══ CLIENTES ══ */
let clientsCache = [];

async function fetchClients() {
  const res = await authFetch('/api/admin/clients');
  if (!res?.ok) return [];
  clientsCache = (await res.json()).clients || [];
  return clientsCache;
}

async function loadClients() {
  const tbody = document.getElementById('clients-tbody'); if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:28px">Carregando...</td></tr>';
  const clients = await fetchClients();
  document.getElementById('clients-count').textContent = `${clients.length} cliente${clients.length === 1 ? '' : 's'}`;
  tbody.innerHTML = clients.length ? clients.map(client => `<tr>
    <td><strong>${esc(client.name)}</strong><br><small>${esc(client.email)}</small></td><td>${esc(client.phone || '—')}</td>
    <td>${esc(client.document || '—')}</td><td>${esc([client.city, client.state].filter(Boolean).join(' / ') || '—')}</td>
    <td><button class="btn-secondary small" onclick="editClient(${client.id})">Editar</button> <button class="btn-danger-sm" onclick="archiveClient(${client.id})">Arquivar</button></td></tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;padding:28px">Nenhum cliente cadastrado.</td></tr>';
}

async function submitClient(event) {
  event.preventDefault(); const id = Number(getVal('c-id')) || null;
  const body = { id, name:getVal('c-name'), email:getVal('c-email'), phone:getVal('c-phone'), document:getVal('c-document'), address:getVal('c-address'), city:getVal('c-city'), state:getVal('c-state'), postal_code:getVal('c-postal'), notes:getVal('c-notes') };
  const res = await authFetch('/api/admin/clients', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  if (res?.ok) { toast(id ? 'Cliente atualizado ✓' : 'Cliente cadastrado ✓'); resetClientForm(); loadClients(); }
  else if (res) { const data = await res.json().catch(() => ({})); toast(data.error || 'Erro ao salvar cliente', true); }
}

function editClient(id) {
  const client = clientsCache.find(item => item.id === id); if (!client) return;
  for (const [field,key] of [['c-id','id'],['c-name','name'],['c-email','email'],['c-phone','phone'],['c-document','document'],['c-address','address'],['c-city','city'],['c-state','state'],['c-postal','postal_code'],['c-notes','notes']]) setVal(field, client[key] || '');
  document.getElementById('client-submit').textContent = 'Salvar alterações'; document.getElementById('client-cancel').hidden = false;
  document.getElementById('client-form').scrollIntoView({ behavior:'smooth', block:'start' });
}

function resetClientForm() {
  document.getElementById('client-form').reset(); setVal('c-id','');
  document.getElementById('client-submit').textContent = 'Cadastrar cliente'; document.getElementById('client-cancel').hidden = true;
}

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
    const res = await authFetch('/api/admin/receipts', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) {
      event.target.reset();
      const now = new Date();
      document.getElementById('r-date').value = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
      toggleReceiptSchedule();
      updateReceiptPreview();
      toast(scheduled ? 'Recibo agendado ✓' : 'Recibo enviado ✓');
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
    <td>${receipt.status === 'scheduled' ? `<button class="btn-danger-sm" onclick="cancelReceipt(${receipt.id})">Cancelar</button>` : '—'}</td></tr>`).join('');
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

/* ══ ANALYTICS ══ */
async function loadAnalytics() {
  const loadingEl = document.getElementById('analytics-loading');
  const contentEl = document.getElementById('analytics-content');
  if (!loadingEl || !contentEl) return;
  loadingEl.style.display = 'block';
  contentEl.style.display = 'none';

  let d;
  try {
    const res = await fetch('/api/admin/analytics');
    if (!res.ok) {
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
