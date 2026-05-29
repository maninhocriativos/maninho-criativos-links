const TOKEN_KEY = 'mc_admin_token';

function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
function setToken(t) { sessionStorage.setItem(TOKEN_KEY, t); }
function clearToken() { sessionStorage.removeItem(TOKEN_KEY); }

async function checkAuth() {
  const token = getToken();
  if (!token) return showLogin();
  const res = await fetch('/api/admin/verify', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) showPanel();
  else showLogin();
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
}

function showPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'flex';
  loadAdminData();
}

async function doLogin() {
  const pwd = document.getElementById('pwd-input').value;
  const err = document.getElementById('login-error');
  err.textContent = '';
  if (!pwd) { err.textContent = 'Digite a senha.'; return; }

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pwd })
  });

  if (res.ok) {
    const { token } = await res.json();
    setToken(token);
    showPanel();
  } else {
    err.textContent = 'Senha incorreta.';
    document.getElementById('pwd-input').value = '';
  }
}

document.getElementById('pwd-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

function logout() {
  clearToken();
  showLogin();
}

function toggleForm(id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
}

async function loadAdminData() {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  const [profileRes, linksRes] = await Promise.all([
    fetch('/api/admin/profile', { headers }),
    fetch('/api/admin/links', { headers })
  ]);

  if (profileRes.ok) {
    const { profile } = await profileRes.json();
    if (profile) {
      document.getElementById('p-name').value = profile.name || '';
      document.getElementById('p-bio').value = profile.bio || '';
      document.getElementById('p-avatar').value = profile.avatar_url || '';
      document.getElementById('p-bg-from').value = profile.bg_from || '#0f0c29';
      document.getElementById('p-bg-via').value = profile.bg_via || '#302b63';
      document.getElementById('p-bg-to').value = profile.bg_to || '#24243e';
    }
  }

  if (linksRes.ok) {
    const { links } = await linksRes.json();
    renderAdminLinks(links);
  }
}

function renderAdminLinks(links) {
  const list = document.getElementById('admin-links-list');
  list.innerHTML = '';

  if (!links || links.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:24px 0">Nenhum link ainda.</p>';
    return;
  }

  links.forEach(link => {
    const card = document.createElement('div');
    card.className = 'admin-link-card';
    card.dataset.id = link.id;

    card.innerHTML = `
      <span class="admin-link-icon">${link.icon}</span>
      <div class="admin-link-info">
        <strong>${escapeHtml(link.title)}</strong>
        <span>${escapeHtml(link.url)}</span>
      </div>
      <span class="stats-chip">👆 ${link.click_count || 0}</span>
      <div class="admin-link-actions">
        <button class="toggle-badge ${link.is_active ? 'active' : 'inactive'}"
          onclick="toggleLink(${link.id}, ${link.is_active})">
          ${link.is_active ? 'Ativo' : 'Inativo'}
        </button>
        <button class="btn btn-danger" onclick="deleteLink(${link.id})">✕</button>
      </div>
    `;
    list.appendChild(card);
  });
}

async function saveProfile() {
  const token = getToken();
  const body = {
    name: document.getElementById('p-name').value,
    bio: document.getElementById('p-bio').value,
    avatar_url: document.getElementById('p-avatar').value,
    bg_from: document.getElementById('p-bg-from').value,
    bg_via: document.getElementById('p-bg-via').value,
    bg_to: document.getElementById('p-bg-to').value,
  };

  const res = await fetch('/api/admin/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    toggleForm('profile-form');
    showToast('Perfil salvo ✓');
  } else {
    showToast('Erro ao salvar perfil', true);
  }
}

async function createLink() {
  const token = getToken();
  const body = {
    title: document.getElementById('l-title').value,
    url: document.getElementById('l-url').value,
    icon: document.getElementById('l-icon').value || '🔗',
    color_from: document.getElementById('l-color-from').value,
    color_to: document.getElementById('l-color-to').value,
    order_index: parseInt(document.getElementById('l-order').value) || 0,
  };

  if (!body.title || !body.url) { showToast('Título e URL obrigatórios', true); return; }

  const res = await fetch('/api/admin/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    toggleForm('new-link-form');
    document.getElementById('l-title').value = '';
    document.getElementById('l-url').value = '';
    document.getElementById('l-icon').value = '';
    showToast('Link adicionado ✓');
    loadAdminData();
  } else {
    showToast('Erro ao criar link', true);
  }
}

async function toggleLink(id, currentState) {
  const token = getToken();
  const res = await fetch(`/api/admin/links/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ is_active: currentState ? 0 : 1 })
  });
  if (res.ok) loadAdminData();
}

async function deleteLink(id) {
  if (!confirm('Excluir este link?')) return;
  const token = getToken();
  const res = await fetch(`/api/admin/links/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) {
    showToast('Link removido');
    loadAdminData();
  }
}

function showToast(msg, isError = false) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:${isError ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)'};
    color:#fff;padding:10px 20px;border-radius:10px;
    font-size:.9rem;font-weight:600;z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,0.3);
    animation:slideUp .3s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

checkAuth();
