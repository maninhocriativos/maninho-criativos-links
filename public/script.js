async function loadPage() {
  try {
    const [profileRes, linksRes] = await Promise.all([
      fetch('/api/profile'),
      fetch('/api/links')
    ]);

    if (profileRes.ok) {
      const { profile } = await profileRes.json();
      if (profile) {
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-bio').textContent = profile.bio;
        if (profile.avatar_url) {
          document.getElementById('avatar').src = profile.avatar_url;
        }
        document.documentElement.style.setProperty('--bg-from', profile.bg_from);
        document.documentElement.style.setProperty('--bg-via', profile.bg_via);
        document.documentElement.style.setProperty('--bg-to', profile.bg_to);
      }
    }

    const container = document.getElementById('links-container');

    if (!linksRes.ok) throw new Error('API error');
    const { links } = await linksRes.json();

    container.innerHTML = '';

    if (!links || links.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px 0">Nenhum link cadastrado ainda.</p>';
      return;
    }

    links.forEach((link, i) => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'link-card';
      a.setAttribute('role', 'listitem');
      a.setAttribute('tabindex', '0');
      a.style.setProperty('--card-gradient', `linear-gradient(135deg, ${link.color_from}, ${link.color_to})`);
      a.style.animationDelay = `${i * 60}ms`;

      a.innerHTML = `
        <span class="link-icon">${link.icon}</span>
        <span class="link-title">${escapeHtml(link.title)}</span>
        <span class="link-arrow">→</span>
      `;

      a.addEventListener('click', (e) => {
        addRipple(e, a);
        trackClick(link.id);
      });

      container.appendChild(a);

      requestAnimationFrame(() => {
        a.style.opacity = '0';
        a.style.transform = 'translateY(16px)';
        a.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        requestAnimationFrame(() => {
          a.style.opacity = '1';
          a.style.transform = 'translateY(0)';
        });
      });
    });

  } catch {
    const container = document.getElementById('links-container');
    container.innerHTML = links_placeholder();
  }
}

function links_placeholder() {
  const defaults = [
    { title: 'Instagram', icon: '📸', url: '#', from: '#f09433', to: '#bc1888' },
    { title: 'YouTube',   icon: '▶️', url: '#', from: '#FF0000', to: '#cc0000' },
    { title: 'TikTok',    icon: '🎵', url: '#', from: '#010101', to: '#69C9D0' },
    { title: 'WhatsApp',  icon: '💬', url: '#', from: '#25D366', to: '#128C7E' },
  ];
  return defaults.map(l => `
    <a href="${l.url}" class="link-card" style="--card-gradient: linear-gradient(135deg,${l.from},${l.to})">
      <span class="link-icon">${l.icon}</span>
      <span class="link-title">${l.title}</span>
      <span class="link-arrow">→</span>
    </a>
  `).join('');
}

function addRipple(e, el) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

async function trackClick(id) {
  try {
    await fetch(`/api/links/${id}/click`, { method: 'POST' });
  } catch { /* silent */ }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

loadPage();
