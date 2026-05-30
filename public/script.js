/* ══ SVG brand icons — sem emojis ══ */
const ICONS = {
  instagram: `<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,

  youtube: `<svg viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602-6.264 3.591z"/></svg>`,

  tiktok: `<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,

  whatsapp: `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,

  facebook: `<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,

  twitter: `<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.861L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,

  linkedin: `<svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,

  behance: `<svg viewBox="0 0 24 24"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.69.76-.63.17-1.29.25-1.99.25H0V4.51h6.938zm-.23 5.57c.584 0 1.06-.14 1.42-.42.35-.28.528-.7.528-1.27 0-.32-.056-.58-.17-.8a1.37 1.37 0 00-.46-.52 1.94 1.94 0 00-.68-.29 3.76 3.76 0 00-.84-.09H2.59v3.39h4.12zm.1 5.82c.317 0 .617-.03.9-.1.283-.07.53-.18.74-.33.21-.16.376-.37.5-.63.12-.27.18-.6.18-.98 0-.76-.22-1.31-.67-1.64-.44-.33-1.02-.5-1.74-.5H2.59v4.18h4.22zm9.935 1.49c.4.39.97.58 1.71.58.53 0 .99-.13 1.38-.4.39-.27.63-.55.72-.86h2.56c-.41 1.27-1.04 2.18-1.9 2.72-.86.54-1.9.81-3.12.81-.85 0-1.61-.13-2.29-.41-.68-.27-1.26-.66-1.73-1.16-.47-.5-.83-1.1-1.08-1.78-.25-.68-.38-1.43-.38-2.24 0-.79.13-1.52.4-2.2.27-.68.65-1.27 1.13-1.77.49-.5 1.07-.89 1.76-1.18.68-.28 1.44-.43 2.27-.43.93 0 1.73.18 2.42.54.69.36 1.26.84 1.7 1.45.45.61.77 1.3.97 2.08.2.77.26 1.6.19 2.47h-7.63c.04.85.3 1.5.7 1.9zm3.16-5.02c-.32-.35-.82-.53-1.49-.53-.44 0-.8.07-1.1.22-.3.14-.54.33-.72.55-.18.22-.31.46-.38.72-.08.26-.12.5-.14.72h4.42c-.08-.73-.27-1.33-.59-1.68zm-4.42-5.42h5.43v1.3h-5.43z"/></svg>`,

  portfolio: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,

  link: `<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
};

function getIcon(url, titleFallback) {
  const u = (url || '').toLowerCase();
  if (u.includes('instagram'))  return ICONS.instagram;
  if (u.includes('youtube'))    return ICONS.youtube;
  if (u.includes('tiktok'))     return ICONS.tiktok;
  if (u.includes('whatsapp') || u.includes('wa.me')) return ICONS.whatsapp;
  if (u.includes('facebook') || u.includes('fb.com')) return ICONS.facebook;
  if (u.includes('twitter') || u.includes('x.com'))  return ICONS.twitter;
  if (u.includes('linkedin'))   return ICONS.linkedin;
  if (u.includes('behance'))    return ICONS.behance;
  return ICONS.portfolio;
}

/* ══ Carrega dados do banco D1 ══ */
async function loadPage() {
  const container = document.getElementById('links-container');

  const fallbackTimer = setTimeout(() => {
    if (container.querySelector('.banner-skeleton')) renderBanners(DEFAULT_LINKS);
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
    container.appendChild(buildBanner(link, i));
  });

  container.querySelectorAll('.link-banner').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = `opacity 0.38s ease ${i * 70}ms, transform 0.38s ease ${i * 70}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }));
  });

  renderBioSocials(links);
}

/* Detecta se o link deve abrir o modal (só WhatsApp) */
function isWhatsApp(url) {
  return /wa\.me|whatsapp/i.test(url || '');
}

function buildBanner(link, i) {
  const a = document.createElement('a');
  const usesModal = isWhatsApp(link.url);

  a.href      = usesModal ? '#' : link.url;
  a.className = 'link-banner';
  a.dataset.id = link.id || '';

  if (!usesModal) {
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
  }

  const cf = link.color_from || '#00d4ff';
  const ct = link.color_to   || '#0055ff';
  a.style.setProperty('--card-grad', `linear-gradient(135deg,${cf},${ct})`);

  const svgIcon = getIcon(link.url, link.title);
  const ctaText = usesModal ? 'Falar pelo WhatsApp →' : 'Acessar →';

  a.innerHTML = `
    <div class="banner-icon-block">
      <div class="banner-icon-bg"></div>
      <div class="banner-icon-svg">${svgIcon}</div>
    </div>
    <div class="banner-text-block">
      <span class="banner-name">${esc(link.title)}</span>
      <span class="banner-cta">${ctaText}</span>
    </div>
    <div class="banner-arrow">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
  `;

  a.addEventListener('click', (e) => {
    addRipple(e, a);
    if (link.id) fetch(`/api/links/${link.id}/click`, { method: 'POST' }).catch(() => {});
    if (usesModal) {
      e.preventDefault();
      openModal(link);
    }
  });

  return a;
}

/* ══ Bio social icons ══ */
function renderBioSocials(links) {
  const wrap = document.getElementById('bio-socials');
  if (!wrap) return;
  wrap.innerHTML = '';

  const seen = new Set();
  links.slice(0, 6).forEach(link => {
    const key = Object.keys(ICONS).find(k => link.url.toLowerCase().includes(k)) || 'link';
    if (seen.has(key)) return;
    seen.add(key);
    const a = document.createElement('a');
    a.href   = link.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    a.className = 'bio-social-btn';
    a.title  = link.title;
    a.innerHTML = ICONS[key] || ICONS.link;
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

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const DEFAULT_LINKS = [
  { title:'Instagram', url:'https://instagram.com/maninhocriativos', color_from:'#f09433', color_to:'#bc1888' },
  { title:'YouTube',   url:'https://youtube.com/@maninhocriativos',  color_from:'#FF0000', color_to:'#cc0000' },
  { title:'TikTok',    url:'https://tiktok.com/@maninhocriativos',   color_from:'#010101', color_to:'#69C9D0' },
  { title:'WhatsApp',  url:'https://wa.me/5592986096874',            color_from:'#25D366', color_to:'#128C7E' },
  { title:'Portfolio', url:'https://maninhocriativos.com',           color_from:'#00d4ff', color_to:'#0055ff' },
];

loadPage();
initCarousel();
initModal();

/* Botão "Quero meu ensaio" também abre o modal */
document.getElementById('btn-ensaio')?.addEventListener('click', (e) => {
  e.preventDefault();
  openModal({
    title: 'Ensaio Fotográfico com IA',
    url: 'https://wa.me/5592986096874',
    color_from: '#25D366',
    color_to: '#128C7E',
  });
});

/* ══ MODAL DE CONTATO ══ */
const SERVICE_MAP = {
  instagram:  'Ensaio Fotográfico com IA',
  youtube:    'Conteúdo & Tutoriais',
  tiktok:     'Conteúdo & Tutoriais',
  whatsapp:   'Ensaio Fotográfico com IA',
  portfolio:  'Design 3D',
  behance:    'Design 3D',
  default:    'Ensaio Fotográfico com IA',
};

function initModal() {
  const overlay = document.getElementById('contact-modal');
  const closeBtn = document.getElementById('modal-close');
  const form    = document.getElementById('contact-form');
  const errEl   = document.getElementById('modal-error');

  /* Fechar */
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* Submit */
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    errEl.textContent = '';

    const name    = document.getElementById('f-name').value.trim();
    const phone   = document.getElementById('f-phone').value.trim();
    const insta   = document.getElementById('f-insta').value.trim();
    const service = document.getElementById('f-service').value;
    const msg     = document.getElementById('f-msg').value.trim();

    if (!name)  { errEl.textContent = 'Por favor, informe seu nome.'; return; }
    if (!phone) { errEl.textContent = 'Por favor, informe seu WhatsApp.'; return; }

    const text = [
      '🎯 *Nova mensagem pelo site!*',
      '',
      `👤 *Nome:* ${name}`,
      `📱 *WhatsApp:* ${phone}`,
      insta ? `📸 *Instagram:* ${insta.startsWith('@') ? insta : '@' + insta}` : null,
      `✨ *Serviço de interesse:* ${service}`,
      msg ? `\n💬 *Mensagem:* ${msg}` : null,
      '',
      '_Mensagem enviada pelo site maninhocriativos.com.br_',
    ].filter(l => l !== null).join('\n');

    const url = `https://wa.me/5592986096874?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    // Salva lead no banco silenciosamente
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, instagram: insta, service, message: msg, page: 'links' })
    }).catch(() => {});

    closeModal();
    form.reset();
  });
}

function openModal(link) {
  const overlay  = document.getElementById('contact-modal');
  const iconEl   = document.getElementById('modal-icon');
  const titleEl  = document.getElementById('modal-title');
  const serviceEl = document.getElementById('f-service');

  /* Detecta rede e pré-preenche */
  const url   = (link.url || '').toLowerCase();
  const title = link.title || 'este serviço';
  const icon  = link.icon  || '✨';

  /* Ícone e título do modal */
  if (iconEl) {
    iconEl.style.background = `linear-gradient(135deg,${link.color_from||'#00d4ff'},${link.color_to||'#0055ff'})`;
    iconEl.innerHTML = `<div class="banner-icon-svg" style="width:28px;height:28px">${getIcon(link.url, title)}</div>`;
  }
  if (titleEl) titleEl.textContent = `Falar sobre ${title}`;

  /* Pré-seleciona o serviço mais relevante */
  if (serviceEl) {
    const key = Object.keys(SERVICE_MAP).find(k => url.includes(k)) || 'default';
    const val = SERVICE_MAP[key];
    const opt = [...serviceEl.options].find(o => o.value === val);
    if (opt) serviceEl.value = val;
  }

  document.getElementById('modal-error').textContent = '';
  overlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('f-name')?.focus(), 320);
}

function closeModal() {
  document.getElementById('contact-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ══ CARROSSEL INFINITO — loop contínuo suave ══ */
function initCarousel() {
  const TOTAL = 48;
  const track    = document.getElementById('carousel-track');
  const carousel = document.getElementById('carousel');
  const dotsWrap = document.getElementById('carousel-dots');
  const btnPrev  = document.getElementById('carousel-prev');
  const btnNext  = document.getElementById('carousel-next');
  if (!track || !carousel) return;

  /* Oculta controles desnecessários no modo marquee */
  if (dotsWrap) dotsWrap.style.display = 'none';
  if (btnPrev)  btnPrev.style.display  = 'none';
  if (btnNext)  btnNext.style.display  = 'none';

  /* Cria um set de slides */
  function makeSlides() {
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= TOTAL; i++) {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const img = document.createElement('img');
      img.loading  = 'lazy';
      img.decoding = 'async';
      img.alt = `Ensaio com IA — foto ${i}`;
      img.src = `ensaio/foto-${i}.webp`;
      slide.appendChild(img);
      frag.appendChild(slide);
    }
    return frag;
  }

  /* Duplica slides para loop sem corte */
  track.appendChild(makeSlides());
  track.appendChild(makeSlides());
  track.classList.add('carousel-marquee');

  /* Velocidade: 75px/s desktop, 55px/s mobile */
  const isMobile = window.innerWidth <= 768;
  const slideW   = isMobile ? 180 + 16 : 260 + 16;
  const speed    = isMobile ? 55 : 75;          // px/s
  const duration = (TOTAL * slideW) / speed;    // segundos para um ciclo completo
  track.style.animationDuration = duration + 's';

  /* Pausa ao hover (desktop) e ao tocar (mobile) */
  const pause  = () => track.style.animationPlayState = 'paused';
  const resume = () => track.style.animationPlayState = 'running';

  carousel.addEventListener('mouseenter', pause);
  carousel.addEventListener('mouseleave', resume);
  carousel.addEventListener('touchstart',  pause, { passive: true });
  carousel.addEventListener('touchend',   resume, { passive: true });
}

/* ══ PARALLAX no hero background ══ */
(function () {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg || window.matchMedia('(max-width:600px)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.35}px) scale(1.05)`;
      ticking = false;
    });
  }, { passive: true });
})();

/* ══ REVEAL nas service cards ══ */
(function () {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('revealed'), i * 120);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
})();
