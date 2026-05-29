/* ══ Carrega dados do banco D1 ══ */
async function loadPage() {
  const container = document.getElementById('links-container');

  const fallbackTimer = setTimeout(() => {
    if (container.querySelector('.banner-skeleton')) {
      renderBanners(DEFAULT_LINKS);
    }
  }, 4000);

  try {
    const [profileRes, linksRes] = await Promise.all([
      fetch('/api/profile'),
      fetch('/api/links')
    ]);

    clearTimeout(fallbackTimer);

    if (profileRes.ok) {
      const { profile } = await profileRes.json();
      if (profile) applyProfile(profile);
    }

    if (!linksRes.ok) throw new Error();
    const { links } = await linksRes.json();
    renderBanners(links?.length ? links : DEFAULT_LINKS);

  } catch {
    clearTimeout(fallbackTimer);
    renderBanners(DEFAULT_LINKS);
  }
}

/* ══ Aplica perfil na bio ══ */
function applyProfile(p) {
  if (p.name) {
    const el = document.getElementById('bio-name');
    if (el) el.textContent = p.name.toUpperCase();
  }
  if (p.bio) {
    const el = document.getElementById('bio-text');
    if (el) el.textContent = p.bio;
  }
}

/* ══ Renderiza banners ══ */
function renderBanners(links) {
  const container = document.getElementById('links-container');
  container.innerHTML = '';

  links.forEach((link, i) => {
    const a = buildBanner(link, i);
    container.appendChild(a);
  });

  /* Animação de entrada sequencial */
  container.querySelectorAll('.link-banner').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }));
  });

  /* Popula bio socials */
  renderSocials(links);
}

/* ══ Constrói cada banner ══ */
function buildBanner(link, i) {
  const a = document.createElement('a');
  a.href  = link.url;
  a.target = '_blank';
  a.rel   = 'noopener noreferrer';
  a.className = 'link-banner';
  a.dataset.id = link.id || '';

  const cf = link.color_from || '#00d4ff';
  const ct = link.color_to   || '#0055ff';

  a.style.setProperty('--card-grad', `linear-gradient(135deg,${cf},${ct})`);
  a.style.setProperty('--card-grad-start', hexToRgba(cf, 0.15));

  a.innerHTML = `
    <div class="banner-left">
      <div class="banner-left-bg"></div>
      <div class="banner-left-noise"></div>
      <span class="banner-icon">${esc(link.icon || '🔗')}</span>
    </div>
    <div class="banner-right">
      <span class="banner-platform">${esc(link.title)}</span>
      <span class="banner-handle">${esc(extractHandle(link.url))}</span>
      <span class="banner-cta">Acessar →</span>
    </div>
    <div class="banner-arrow">→</div>
  `;

  a.addEventListener('click', (e) => {
    addRipple(e, a);
    if (link.id) fetch(`/api/links/${link.id}/click`, { method: 'POST' }).catch(() => {});
  });

  return a;
}

/* ══ Bio socials (pega os primeiros 5 links principais) ══ */
const SOCIAL_ICONS = {
  instagram: '📸',
  youtube:   '▶️',
  tiktok:    '🎵',
  whatsapp:  '💬',
  twitter:   '𝕏',
  linkedin:  '💼',
  behance:   '🅱',
  pinterest: '📌',
};

function renderSocials(links) {
  const wrap = document.getElementById('bio-socials');
  if (!wrap) return;
  wrap.innerHTML = '';
  links.slice(0, 6).forEach(link => {
    const key = Object.keys(SOCIAL_ICONS).find(k => link.url.toLowerCase().includes(k));
    const icon = key ? SOCIAL_ICONS[key] : (link.icon || '🔗');
    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'bio-social-link';
    a.title = link.title;
    a.textContent = icon;
    wrap.appendChild(a);
  });
}

/* ══ Helpers ══ */
function addRipple(e, el) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const r = document.createElement('span');
  r.className = 'ripple';
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  el.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}

function extractHandle(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    if (parts.length) return u.hostname.replace('www.','') + '/' + parts[parts.length-1];
    return u.hostname.replace('www.','');
  } catch { return url; }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══ Dados de fallback (quando API não responde) ══ */
const DEFAULT_LINKS = [
  { title:'Instagram', icon:'📸', url:'https://instagram.com/maninhocriativos', color_from:'#f09433', color_to:'#bc1888' },
  { title:'YouTube',   icon:'▶️', url:'https://youtube.com/@maninhocriativos',  color_from:'#FF0000', color_to:'#cc0000' },
  { title:'TikTok',    icon:'🎵', url:'https://tiktok.com/@maninhocriativos',   color_from:'#010101', color_to:'#69C9D0' },
  { title:'WhatsApp',  icon:'💬', url:'https://wa.me/5500000000000',            color_from:'#25D366', color_to:'#128C7E' },
  { title:'Portfolio', icon:'🎨', url:'https://maninhocriativos.com',           color_from:'#00d4ff', color_to:'#0055ff' },
];

loadPage();
