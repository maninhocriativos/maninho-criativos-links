/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Mobile menu ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── Intersection Observer for animations ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-animate], [data-animate-delay]').forEach(el => observer.observe(el));

/* Garante que elementos do hero já visíveis aparecem sem esperar scroll */
requestAnimationFrame(() => {
  document.querySelectorAll('.hero [data-animate], .hero [data-animate-delay]').forEach(el => {
    el.classList.add('visible');
    observer.unobserve(el);
  });
});

/* ── Load links from API ── */
async function loadLinks() {
  const container = document.getElementById('links-container');

  /* Timeout de segurança: se a API demorar >4s mostra fallback */
  const fallbackTimer = setTimeout(() => {
    if (container.querySelector('.link-card-skeleton')) {
      container.innerHTML = FALLBACK_LINKS_HTML;
      setupLinkEvents();
    }
  }, 4000);

  try {
    const [profileRes, linksRes] = await Promise.all([
      fetch('/api/profile'),
      fetch('/api/links')
    ]);

    if (profileRes.ok) {
      const { profile } = await profileRes.json();
      if (profile?.bio) {
        const bioEl = document.getElementById('hero-bio');
        if (bioEl) bioEl.textContent = profile.bio;
      }
    }

    clearTimeout(fallbackTimer);
    if (!linksRes.ok) throw new Error('API error');
    const { links } = await linksRes.json();

    container.innerHTML = '';

    if (!links?.length) {
      container.innerHTML = FALLBACK_LINKS_HTML;
      setupLinkEvents();
      return;
    }

    links.forEach((link, i) => {
      container.appendChild(buildCard(link, i));
    });

    setupLinkEvents();
  } catch {
    clearTimeout(fallbackTimer);
    container.innerHTML = FALLBACK_LINKS_HTML;
    setupLinkEvents();
  }
}

function buildCard(link, i) {
  const a = document.createElement('a');
  a.href = link.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'link-card-premium';
  a.dataset.id = link.id;
  a.style.cssText = `--card-grad: linear-gradient(135deg,${link.color_from},${link.color_to}); animation-delay:${i*60}ms`;

  a.innerHTML = `
    <div class="card-icon-wrap">${link.icon}</div>
    <div class="card-info">
      <span class="card-platform">${escHtml(link.title)}</span>
      <span class="card-handle">${escHtml(extractHandle(link.url))}</span>
    </div>
    <div class="card-arrow">→</div>
  `;

  /* entrance animation */
  a.style.opacity = '0';
  a.style.transform = 'translateY(20px)';
  a.style.transition = `opacity 0.45s ease ${i*70}ms, transform 0.45s ease ${i*70}ms`;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    a.style.opacity = '1';
    a.style.transform = 'translateY(0)';
  }));

  return a;
}

function setupLinkEvents() {
  document.querySelectorAll('.link-card-premium').forEach(card => {
    card.addEventListener('click', (e) => {
      addRipple(e, card);
      const id = card.dataset.id;
      if (id) fetch(`/api/links/${id}/click`, { method: 'POST' }).catch(() => {});
    });
  });
}

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
    if (parts.length) return '@' + parts[parts.length - 1];
    return u.hostname;
  } catch { return url; }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Fallback cards rendered as HTML strings (no API) */
const FALLBACK_LINKS_HTML = [
  { title:'Instagram', icon:'📸', url:'https://instagram.com/maninhocriativos', from:'#f09433', to:'#bc1888' },
  { title:'YouTube',   icon:'▶️', url:'https://youtube.com/@maninhocriativos',  from:'#FF0000', to:'#cc0000' },
  { title:'TikTok',    icon:'🎵', url:'https://tiktok.com/@maninhocriativos',   from:'#010101', to:'#69C9D0' },
  { title:'WhatsApp',  icon:'💬', url:'https://wa.me/5500000000000',            from:'#25D366', to:'#128C7E' },
].map((l,i) => `
  <a href="${l.url}" target="_blank" rel="noopener" class="link-card-premium"
     style="--card-grad:linear-gradient(135deg,${l.from},${l.to})">
    <div class="card-icon-wrap">${l.icon}</div>
    <div class="card-info">
      <span class="card-platform">${l.title}</span>
      <span class="card-handle">${extractHandle(l.url)}</span>
    </div>
    <div class="card-arrow">→</div>
  </a>
`).join('');

loadLinks();
