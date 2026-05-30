/* ══ Auth ══ */
const TOKEN_KEY = 'mc_admin_token';
const token = () => sessionStorage.getItem(TOKEN_KEY);

async function doLogin() {
  const pwd = document.getElementById('pwd-input').value.trim();
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  if (!pwd) { errEl.textContent = 'Digite a senha.'; return; }

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pwd })
  });

  if (res.ok) {
    const { token: t } = await res.json();
    sessionStorage.setItem(TOKEN_KEY, t);
    showPanel();
  } else {
    errEl.textContent = 'Senha incorreta.';
    document.getElementById('pwd-input').value = '';
  }
}

async function checkAuth() {
  const t = token();
  if (!t) return showLogin();
  const res = await fetch('/api/admin/verify', { headers: { Authorization: `Bearer ${t}` } });
  res.ok ? showPanel() : showLogin();
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
}

function showPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'grid';
  loadAllData();
}

function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  showLogin();
}

function togglePwd() {
  const inp = document.getElementById('pwd-input');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

document.getElementById('pwd-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

/* ══ Tabs ══ */
function setTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.snav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`)?.classList.add('active');
  btn.classList.add('active');
  const titles = { links: 'Gerenciar Links', portfolio: 'Portfólio', profile: 'Editar Perfil' };
  document.getElementById('admin-page-title').textContent = titles[name] || name;
  if (name === 'portfolio') loadPortfolioAdmin();
  closeSidebar();
}

/* ══ Mobile sidebar ══ */
const sidebar = document.getElementById('sidebar');
document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
});
function closeSidebar() { sidebar?.classList.remove('open'); }

/* ══ Load data ══ */
async function loadAllData() {
  await Promise.all([loadLinks(), loadProfile()]);
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
  const t = token();
  if (!t) { showLogin(); return null; }
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${t}`,
      ...(opts.headers || {})
    }
  });
  if (res.status === 401) { showLogin(); return null; }
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
  const body = {
    title:       getVal('pf-title'),
    category:    getVal('pf-cat'),
    description: getVal('pf-desc'),
    image_url:   getVal('pf-url'),
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
