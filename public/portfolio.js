/* ═══════════════════════════════════════
   Portfólio — Maninho Criativos v4
   ═══════════════════════════════════════ */

let allItems = [];
let filtered  = [];
let activeIdx = 0;

async function init() {
  try {
    const res = await fetch('/api/portfolio');
    if (!res.ok) throw new Error();
    const { items } = await res.json();
    allItems = items || [];
  } catch {
    allItems = [];
  }

  const statEl = document.getElementById('stat-n');
  if (statEl && allItems.length) statEl.textContent = allItems.length;

  setupNav();

  document.querySelectorAll('.srv-big-card').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => {
      const cat = card.dataset.goto;
      const btn = document.querySelector(`.cat-btn[data-cat="${CSS.escape(cat)}"]`);
      if (btn) btn.click();
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); }
    });
  });
}

function setupNav() {
  const buttons = document.querySelectorAll('.cat-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      btn.scrollIntoView({ inline:'center', behavior:'smooth', block:'nearest' });

      const cat = btn.dataset.cat;
      if (cat === 'home') {
        showHome();
      } else {
        showGallery(cat);
      }
    });
  });
}

function showHome() {
  document.getElementById('pf-home').style.display    = 'block';
  document.getElementById('pf-gallery').style.display = 'none';
}

function showGallery(cat) {
  document.getElementById('pf-home').style.display    = 'none';
  document.getElementById('pf-gallery').style.display = 'block';

  const grid   = document.getElementById('pf-grid');
  const empty  = document.getElementById('pf-empty');
  const title  = document.getElementById('gallery-title');
  const count  = document.getElementById('gallery-count');

  const labels = {
    'Ensaio Fotográfico':'Ensaio Fotográfico com IA','Design 3D':'Design 3D','IA Generativa':'IA Generativa',
    'Desenvolvimento de Apps':'Apps & Landing Pages','CRM & Meta':'CRM Integrado à Meta','Automação de IA':'Automação de IA para Vendas',
  };
  title.textContent = labels[cat] || cat;

  grid.innerHTML = Array(6).fill(0).map((_,i) => `<div class="pf-skel${i%3===1?' tall':''}"></div>`).join('');
  empty.style.display = 'none';

  setTimeout(() => {
    filtered = allItems.filter(i => i.category === cat);
    count.textContent = filtered.length ? `${filtered.length} projeto${filtered.length>1?'s':''}` : '';

    if (!filtered.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    renderGrid(filtered);
  }, 160);
}

function renderGrid(items) {
  const grid = document.getElementById('pf-grid');
  grid.innerHTML = '';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'pf-card';

    const inner = document.createElement('div');
    inner.className = 'pf-card-inner';

    /* Desktop screenshot (esquerda, grande) */
    const desktop = document.createElement('div');
    desktop.className = 'pf-screenshot desktop';
    const deskImg = document.createElement('img');
    deskImg.src = item.image_url;
    deskImg.alt = `${item.title} - Desktop`;
    deskImg.loading = 'lazy';
    deskImg.decoding = 'async';
    desktop.appendChild(deskImg);

    /* Mobile screenshot (direita, pequeno) */
    const mobile = document.createElement('div');
    mobile.className = 'pf-screenshot mobile';
    const mobImg = document.createElement('img');
    mobImg.src = item.image_mobile_url || item.image_url;
    mobImg.alt = `${item.title} - Mobile`;
    mobImg.loading = 'lazy';
    mobImg.decoding = 'async';
    mobile.appendChild(mobImg);

    /* Overlay com info */
    const ov = document.createElement('div');
    ov.className = 'pf-overlay';
    ov.innerHTML = `
      <div class="pf-overlay-info">
        <span class="pf-overlay-title">${esc(item.title)}</span>
        <span class="pf-overlay-cat">${esc(item.category)}</span>
      </div>
      ${item.project_url ? `
        <a href="${esc(safeExternalUrl(item.project_url))}" target="_blank" rel="noopener noreferrer" class="pf-overlay-link" onclick="event.stopPropagation()">
          Ver projeto →
        </a>` : ''}`;

    inner.appendChild(desktop);
    inner.appendChild(mobile);
    inner.appendChild(ov);
    card.appendChild(inner);
    grid.appendChild(card);

    card.addEventListener('click', () => openLightbox(i));
    requestAnimationFrame(() => setTimeout(() => card.classList.add('in'), i * 38));
  });
}

function openLightbox(idx) {
  activeIdx = idx;
  document.getElementById('lightbox').classList.add('open');
  document.getElementById('lightbox').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  renderLB(idx);
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightbox').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.getElementById('lb-open-btn')?.remove();
}

function renderLB(idx) {
  const item = filtered[idx];
  if (!item) return;

  const img = document.getElementById('lb-img');
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = item.image_url;
    img.alt = item.title;
    img.onload = () => { img.style.opacity = '1'; };
  }, 100);

  document.getElementById('lb-title').textContent = item.title;
  document.getElementById('lb-cat').textContent   = item.category;
  document.getElementById('lb-desc').textContent  = item.description || '';
  document.getElementById('lb-counter').textContent = `${idx+1} / ${filtered.length}`;
  activeIdx = idx;

  document.getElementById('lb-open-btn')?.remove();
  if (item.project_url) {
    const btn = document.createElement('a');
    btn.id = 'lb-open-btn';
    btn.href = safeExternalUrl(item.project_url);
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.className = 'lb-project-btn';
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg> Abrir projeto`;
    document.querySelector('.lb-figure')?.appendChild(btn);
  }
}

const lbNext = () => renderLB((activeIdx+1) % filtered.length);
const lbPrev = () => renderLB((activeIdx-1+filtered.length) % filtered.length);

document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
document.getElementById('lb-next')?.addEventListener('click', lbNext);
document.getElementById('lb-prev')?.addEventListener('click', lbPrev);
document.getElementById('lightbox')?.addEventListener('click', e => { if (e.target.id==='lightbox') closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key==='ArrowRight') lbNext();
  if (e.key==='ArrowLeft')  lbPrev();
  if (e.key==='Escape')     closeLightbox();
});
let tx=0;
document.getElementById('lightbox')?.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
document.getElementById('lightbox')?.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50){d<0?lbNext():lbPrev()}},{passive:true});

function esc(s) {
  return String(s?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value, location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
  } catch { return '#'; }
}

// ══ MODAL DE CONTATO ══
function openModal() {
  const modal = document.getElementById('contact-modal');
  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('f-name')?.focus(), 320);
}

function closeModal() {
  const modal = document.getElementById('contact-modal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

(function initModal() {
  const overlay  = document.getElementById('contact-modal');
  const closeBtn = document.getElementById('modal-close');
  const form     = document.getElementById('contact-form');
  const errEl    = document.getElementById('modal-error');

  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    errEl.textContent = '';

    const name    = document.getElementById('f-name').value.trim();
    const phone   = document.getElementById('f-phone').value.trim();
    const insta   = document.getElementById('f-insta').value.trim();
    const service = document.getElementById('f-service').value;
    const msg     = document.getElementById('f-msg').value.trim();

    if (!name)  { errEl.textContent = 'Por favor, informe seu nome.';      return; }
    if (!phone) { errEl.textContent = 'Por favor, informe seu WhatsApp.';  return; }

    const text = [
      '🎯 *Nova mensagem pelo portfólio!*',
      '',
      `👤 *Nome:* ${name}`,
      `📱 *WhatsApp:* ${phone}`,
      insta ? `📸 *Instagram:* ${insta.startsWith('@') ? insta : '@' + insta}` : null,
      `✨ *Serviço de interesse:* ${service}`,
      msg ? `\n💬 *Mensagem:* ${msg}` : null,
      '',
      '_Mensagem enviada pelo portfólio maninhocriativos.com.br_',
    ].filter(l => l !== null).join('\n');

    window.open(`https://wa.me/5592986096874?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, instagram: insta, service, message: msg, page: 'portfolio' })
    }).catch(() => {});

    closeModal();
    form.reset();
  });
})();

init();
