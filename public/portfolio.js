/* ══ Estado global ══ */
let allItems    = [];
let filtered    = [];
let currentIdx  = 0;
let activeFilter = 'Todos';

/* ══ Carrega portfólio da API ══ */
async function loadPortfolio(cat = 'Todos') {
  activeFilter = cat;
  const grid  = document.getElementById('pf-grid');
  const empty = document.getElementById('pf-empty');

  /* Skeletons enquanto carrega */
  grid.innerHTML = [
    '<div class="pf-skeleton"></div>',
    '<div class="pf-skeleton tall"></div>',
    '<div class="pf-skeleton"></div>',
    '<div class="pf-skeleton tall"></div>',
    '<div class="pf-skeleton"></div>',
    '<div class="pf-skeleton"></div>',
  ].join('');
  empty.style.display = 'none';

  try {
    const url = cat === 'Todos'
      ? '/api/portfolio'
      : `/api/portfolio?category=${encodeURIComponent(cat)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const { items } = await res.json();

    allItems = cat === 'Todos' ? items : allItems; // mantém todos para lightbox
    filtered = items || [];

    if (!filtered.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    renderGrid(filtered);
  } catch {
    grid.innerHTML = '';
    empty.style.display = 'block';
    empty.textContent = 'Erro ao carregar o portfólio. Tente novamente.';
  }
}

/* ══ Renderiza cards ══ */
function renderGrid(items) {
  const grid = document.getElementById('pf-grid');
  grid.innerHTML = '';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'pf-card';
    card.dataset.idx = i;

    const img = document.createElement('img');
    img.src      = item.image_url;
    img.alt      = item.title;
    img.loading  = 'lazy';
    img.decoding = 'async';

    const overlay = document.createElement('div');
    overlay.className = 'pf-card-overlay';
    overlay.innerHTML = `
      <div class="pf-card-info">
        <span class="pf-card-title">${esc(item.title)}</span>
        <span class="pf-card-cat">${esc(item.category)}</span>
      </div>
    `;

    card.appendChild(img);
    card.appendChild(overlay);
    grid.appendChild(card);

    card.addEventListener('click', () => openLightbox(i));

    /* Staggered appear animation */
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add('visible'), i * 45);
    });
  });
}

/* ══ Filtros ══ */
document.querySelectorAll('.pf-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pf-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadPortfolio(btn.dataset.cat);
  });
});

/* ══ LIGHTBOX ══ */
function openLightbox(idx) {
  currentIdx = idx;
  const lb = document.getElementById('lightbox');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  showLightboxItem(idx);
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function showLightboxItem(idx) {
  const item  = filtered[idx];
  if (!item) return;
  const img   = document.getElementById('lb-img');
  const title = document.getElementById('lb-title');
  const cat   = document.getElementById('lb-cat');
  const ctr   = document.getElementById('lb-counter');

  /* Fade swap */
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = item.image_url;
    img.alt = item.title;
    img.onload = () => { img.style.opacity = '1'; };
  }, 120);

  title.textContent = item.title;
  cat.textContent   = item.category;
  ctr.textContent   = `${idx + 1} / ${filtered.length}`;
  currentIdx = idx;
}

function lbNext() { showLightboxItem((currentIdx + 1) % filtered.length); }
function lbPrev() { showLightboxItem((currentIdx - 1 + filtered.length) % filtered.length); }

document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
document.getElementById('lb-next')?.addEventListener('click', lbNext);
document.getElementById('lb-prev')?.addEventListener('click', lbPrev);

document.getElementById('lightbox')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
});

/* Teclado: ← → Esc */
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'ArrowRight') lbNext();
  if (e.key === 'ArrowLeft')  lbPrev();
  if (e.key === 'Escape')     closeLightbox();
});

/* Swipe no lightbox (mobile) */
let lbStartX = 0;
document.getElementById('lightbox')?.addEventListener('touchstart', (e) => {
  lbStartX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('lightbox')?.addEventListener('touchend', (e) => {
  const diff = e.changedTouches[0].clientX - lbStartX;
  if (Math.abs(diff) > 50) { diff < 0 ? lbNext() : lbPrev(); }
}, { passive: true });

/* ══ Helper ══ */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══ Inicia ══ */
loadPortfolio();
