/* Shared interactions for every administrative area. */
function matchesSearch(values, query) {
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  return normalize(values.join(' ')).includes(normalize(query).trim());
}

function whatsappNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}

function showRequestError(message) {
  const banner = document.getElementById('request-error');
  banner.querySelector('span').textContent = message;
  banner.hidden = false;
}

async function refreshCurrentArea() {
  const name = document.querySelector('.tab-content.active')?.id.replace('tab-', '') || 'dashboard';
  const loaders = { dashboard: loadCrmDashboard, links: loadLinks, portfolio: loadPortfolioAdmin,
    leads: loadLeads, clients: loadClients, projects: loadProjects, analytics: loadAnalytics,
    profile: loadProfile, receipts: () => Promise.all([loadCashFlow(), loadReceipts()]), household: loadHouseholdExpenses };
  const button = document.getElementById('refresh-area');
  if (button.disabled) return;
  button.disabled = true;
  button.textContent = 'Atualizando…';
  document.getElementById('request-error').hidden = true;
  try { await loaders[name](); }
  catch { showRequestError('Não foi possível atualizar esta área. Tente novamente.'); }
  finally { button.disabled = false; button.textContent = 'Atualizar'; }
}

document.addEventListener('DOMContentLoaded', () => {
  const loadingAreas = { loadLinks: 'links', loadPortfolioAdmin: 'portfolio', loadLeads: 'leads',
    loadClients: 'clients', loadProjects: 'projects', loadAnalytics: 'analytics',
    loadCrmDashboard: 'dashboard', loadCashFlow: 'receipts', loadHouseholdExpenses: 'household', loadReceipts: 'receipts', loadProfile: 'profile' };
  const pending = new Map();
  for (const [name, area] of Object.entries(loadingAreas)) {
    const original = window[name];
    window[name] = function(...args) {
      if (pending.has(name)) return pending.get(name);
      const section = document.getElementById(`tab-${area}`);
      section.setAttribute('aria-busy', 'true');
      const task = Promise.resolve().then(() => original(...args)).catch(() => {
        showRequestError('Não foi possível carregar esta área. Tente novamente.');
      }).finally(() => {
        pending.delete(name);
        if (![...pending.keys()].some(key => loadingAreas[key] === area)) section.removeAttribute('aria-busy');
      });
      pending.set(name, task);
      return task;
    };
  }
  // Bind visible labels to their controls, including the existing form markup.
  document.querySelectorAll('.form-field').forEach(field => {
    const label = field.querySelector('label');
    const input = field.querySelector('input:not([type="hidden"]), select, textarea');
    if (label && input?.id && !label.htmlFor) label.htmlFor = input.id;
  });
  document.querySelectorAll('input[placeholder], select').forEach(input => {
    if (!input.labels?.length && !input.hasAttribute('aria-label')) {
      input.setAttribute('aria-label', input.placeholder || input.options?.[0]?.text || 'Selecionar opção');
    }
  });
  document.querySelectorAll('button[title]').forEach(button => button.setAttribute('aria-label', button.title));
  document.querySelectorAll('.content-modal .panel-card-header button, .modal-header .btn-icon').forEach(button => button.setAttribute('aria-label', 'Fechar janela'));

  // Existing inline handlers resolve these functions at submit time.
  for (const name of ['submitNewLink', 'submitEditLink', 'submitNewPortfolio', 'submitProfile',
    'submitProject', 'submitClient', 'submitCashTransaction', 'submitReceipt']) {
    const original = window[name];
    window[name] = async function(event) {
      event.preventDefault();
      const form = event.target;
      if (form.dataset.saving === 'true') return;
      form.dataset.saving = 'true';
      form.setAttribute('aria-busy', 'true');
      const buttons = [...form.querySelectorAll('button')].filter(button => button.type === 'submit');
      const states = buttons.map(button => button.disabled);
      buttons.forEach(button => button.disabled = true);
      try { return await original(event); }
      catch { toast('Não foi possível salvar. Seus dados continuam no formulário.', true); }
      finally {
        delete form.dataset.saving;
        form.removeAttribute('aria-busy');
        buttons.forEach((button, index) => button.disabled = states[index]);
      }
    };
  }

  const modalSelector = '.content-modal.open, .modal-backdrop.open';
  let activeModal = null;
  let previousFocus = null;
  const focusable = root => [...root.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')]
    .filter(el => !el.disabled && el.getClientRects().length);
  const syncModal = () => {
    const modal = document.querySelector(modalSelector);
    document.body.classList.toggle('modal-open', Boolean(modal));
    document.getElementById('mobile-menu-btn').setAttribute('aria-expanded', String(document.getElementById('sidebar').classList.contains('open')));
    if (modal === activeModal) return;
    if (modal) {
      previousFocus = document.activeElement;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', modal.querySelector('h3')?.textContent || 'Editar dados');
      activeModal = modal;
      (focusable(modal).find(el => /INPUT|SELECT|TEXTAREA/.test(el.tagName)) || focusable(modal)[0])?.focus();
    } else {
      activeModal?.removeAttribute('aria-modal');
      activeModal = null;
      previousFocus?.focus();
    }
  };
  document.querySelectorAll('.content-modal, .modal-backdrop, #sidebar').forEach(el => {
    new MutationObserver(syncModal).observe(el, { attributes: true, attributeFilter: ['class'] });
  });
  document.addEventListener('focusin', event => {
    if (activeModal && !activeModal.contains(event.target)) focusable(activeModal)[0]?.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (activeModal) activeModal.classList.remove('open');
      else closeSidebar();
    }
    const root = activeModal || (document.getElementById('sidebar').classList.contains('open') ? document.getElementById('sidebar') : null);
    if (event.key === 'Tab' && root) {
      const items = focusable(root), first = items[0], last = items.at(-1);
      if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
  });
  window.addEventListener('offline', () => showRequestError('Você está sem conexão. Reconecte-se antes de salvar ou atualizar.'));
});
