/* ══ Maninho Criativos — Analytics Tracker ══ */
(function () {
  // Gera ou recupera session_id
  let sid = sessionStorage.getItem('mc_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('mc_sid', sid);
  }

  const page = document.body.dataset.page || 'links';
  const ref  = document.referrer || null;

  function send(type, data) {
    navigator.sendBeacon
      ? navigator.sendBeacon('/api/track', new Blob([JSON.stringify({ type, page, data, session_id: sid, referrer: ref })], { type: 'application/json' }))
      : fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, page, data, session_id: sid, referrer: ref }), keepalive: true });
  }

  // Page view ao carregar
  send('view');

  // Rastreia cliques em links e botões importantes
  document.addEventListener('click', function (e) {
    const el = e.target.closest('a[href], button, [data-track]');
    if (!el) return;

    const label = el.dataset.track || el.innerText?.trim().slice(0, 60) || el.getAttribute('aria-label') || 'click';
    const href  = el.href || null;

    if (el.tagName === 'A' && href && !href.startsWith(location.origin)) {
      send('click', { label, href });
    } else if (el.classList.contains('hero-whatsapp-btn') || el.classList.contains('top-nav-cta') || el.classList.contains('home-cta-btn')) {
      send('modal_open', { label });
    } else if (el.classList.contains('link-btn')) {
      send('click', { label, href });
    }
  }, { passive: true });
})();
