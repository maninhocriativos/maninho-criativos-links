/* ═══════════════════════════════════════════
   Portfólio — Maninho Criativos
   ═══════════════════════════════════════════ */

let allItems = [];
let filtered = [];
let activeIdx = 0;

/* ══ Carrega dados da API ══ */
async function init() {
  try {
    const res = await fetch('/api/portfolio');
    if (!res.ok) throw new Error();
    const { items } = await res.json();
    allItems = items || [];
  } catch {
    allItems = [];
  }

  /* Atualiza contador no hero */
  const statEl = document.getElementById('stat-count');
  if (statEl && allItems.length) statEl.textContent = allItems.length;

  /* Inicializa abas e mostra "Todos" */
  initTabs();
  showCategory('Todos');
}

/* ══ Abas com indicador deslizante ══ */
function initTabs() {
  const tabs = document.querySelectorAll('.pf-tab');
  const indicator = document.getElementById('pf-tab-indicator');
  const wrap = document.getElementById('pf-tabs-wrap');

  function moveIndicator(btn) {
    const tabsEl = document.getElementById('pf-tabs');
    const tabsRect = tabsEl.getBoundingClientRect();
    const btnRect  = btn.getBoundingClientRect();
    indicator.style.left  = (btn.offsetLeft) + 'px';
    indicator.style.width = btn.offsetWidth + 'px';
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      moveIndicator(tab);

      /* Scroll para a aba ativa */
      tab.scrollIntoView({ inline:'center', behavior:'smooth', block:'nearest' });

      showCategory(tab.dataset.cat);
    });
  });

  /* Posiciona no active inicial */
  const firstActive = document.querySelector('.pf-tab.active');
  if (firstActive) {
    /* Aguarda layout */
    requestAnimationFrame(() => moveIndicator(firstActive));
  }

  /* Recalcula no resize */
  window.addEventListener('resize', () => {
    const a = document.querySelector('.pf-tab.active');
    if (a) moveIndicator(a);
  }, { passive: true });
}

/* ══ Filtra e exibe categoria ══ */
function showCategory(cat) {
  const grid  = document.getElementById('pf-grid');
  const empty = document.getElementById('pf-empty');
  const title = document.getElementById('pf-cat-title');
  const count = document.getElementById('pf-cat-count');

  /* Skeleton enquanto "carrega" (micro-delay visual) */
  grid.innerHTML = `
    <div class="pf-skel"></div><div class="pf-skel tall"></div>
    <div class="pf-skel"></div><div class="pf-skel tall"></div>
    <div class="pf-skel"></div><div class="pf-skel"></div>`;
  empty.style.display = 'none';

  const catLabels = {
    'Todos':                  'Todos os trabalhos',
    'Ensaio Fotográfico':     'Ensaio Fotográfico com IA',
    'Design 3D':              'Design 3D',
    'IA Generativa':          'IA Generativa',
    'Desenvolvimento de Apps':'Desenvolvimento de Apps',
    'CRM & Meta':             'CRM Integrado à Meta',
    'Automação de IA':        'Automação de IA para Vendas',
  };
  title.textContent = catLabels[cat] || cat;

  setTimeout(() => {
    filtered = cat === 'Todos'
      ? allItems
      : allItems.filter(i => i.category === cat);

    count.textContent = filtered.length
      ? `${filtered.length} projeto${filtered.length > 1 ? 's' : ''}`
      : '';

    if (!filtered.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    renderGrid(filtered);
  }, 180);
}

/* ══ Renderiza cards ══ */
function renderGrid(items) {
  const grid = document.getElementById('pf-grid');
  grid.innerHTML = '';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'pf-card';

    const inner = document.createElement('div');
    inner.className = 'pf-card-inner';

    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.title;
    img.loading = 'lazy';
    img.decoding = 'async';

    const overlay = document.createElement('div');
    overlay.className = 'pf-overlay';
    overlay.innerHTML = `
      <span class="pf-overlay-title">${esc(item.title)}</span>
      <span class="pf-overlay-cat">${esc(item.category)}</span>`;

    inner.appendChild(img);
    inner.appendChild(overlay);
    card.appendChild(inner);
    grid.appendChild(card);

    card.addEventListener('click', () => openLightbox(i));

    /* Stagger */
    requestAnimationFrame(() =>
      setTimeout(() => card.classList.add('in'), i * 38)
    );
  });
}

/* ══ LIGHTBOX ══ */
function openLightbox(idx) {
  activeIdx = idx;
  const lb = document.getElementById('lightbox');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderLightbox(idx);
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function renderLightbox(idx) {
  const item = filtered[idx];
  if (!item) return;

  const img   = document.getElementById('lb-img');
  const title = document.getElementById('lb-title');
  const cat   = document.getElementById('lb-cat');
  const desc  = document.getElementById('lb-desc');
  const ctr   = document.getElementById('lb-counter');

  img.style.opacity = '0';
  setTimeout(() => {
    img.src = item.image_url;
    img.alt = item.title;
    img.onload = () => { img.style.opacity = '1'; };
  }, 100);

  title.textContent = item.title;
  cat.textContent   = item.category;
  desc.textContent  = item.description || '';
  ctr.textContent   = `${idx + 1} / ${filtered.length}`;
  activeIdx = idx;
}

const lbNext = () => renderLightbox((activeIdx + 1) % filtered.length);
const lbPrev = () => renderLightbox((activeIdx - 1 + filtered.length) % filtered.length);

document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
document.getElementById('lb-next')?.addEventListener('click', lbNext);
document.getElementById('lb-prev')?.addEventListener('click', lbPrev);

document.getElementById('lightbox')?.addEventListener('click', e => {
  if (e.target.id === 'lightbox') closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowRight') lbNext();
  if (e.key === 'ArrowLeft')  lbPrev();
  if (e.key === 'Escape')     closeLightbox();
});

let lbTouchX = 0;
document.getElementById('lightbox')?.addEventListener('touchstart', e => {
  lbTouchX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('lightbox')?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - lbTouchX;
  if (Math.abs(dx) > 50) { dx < 0 ? lbNext() : lbPrev(); }
}, { passive: true });

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

init();
