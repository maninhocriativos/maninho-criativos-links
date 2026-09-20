import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

function admin() {
  const elements = new Map();
  const html = readFileSync('public/admin.html', 'utf8');
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) {
    elements.set(id, { value: '', textContent: '', innerHTML: '', style: {}, dataset: {},
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      addEventListener() {}, setAttribute() {}, removeAttribute() {},
      getContext() { return {}; }, toDataURL() { return ''; },
      querySelector() { return { textContent: '', reset() {} }; },
      appendChild() {}, reset() {}, focus() {} });
  }
  const context = vm.createContext({ document: { getElementById: id => elements.get(id) || null,
    querySelectorAll: () => [], addEventListener() {} },
    window: { addEventListener() {}, location: { replace() {} } },
    fetch: () => new Promise(() => {}), setTimeout, clearTimeout, console });
  vm.runInContext(readFileSync('public/admin-ux.js', 'utf8'), context);
  vm.runInContext(readFileSync('public/admin.js', 'utf8'), context);
  return { context, elements, run: source => vm.runInContext(source, context) };
}

test('search accepts accents and WhatsApp does not duplicate country code', () => {
  const { run } = admin();
  assert.equal(run("matchesSearch(['João', 'Criação'], ' joao ')"), true);
  assert.equal(run("matchesSearch(['João'], 'maria')"), false);
  assert.equal(run("whatsappNumber('(92) 99999-0000')"), '5592999990000');
  assert.equal(run("whatsappNumber('+55 92 99999-0000')"), '5592999990000');
});

test('paused and cancelled projects remain visible and can be filtered', () => {
  const { run, elements } = admin();
  run(`projectsCache = [
    {id:1,title:'Site em pausa',status:'paused',progress:20},
    {id:2,title:'Campanha encerrada',status:'cancelled',progress:0}
  ]; renderProjectBoard();`);
  assert.match(elements.get('project-board').innerHTML, /Site em pausa/);
  assert.match(elements.get('project-board').innerHTML, /Campanha encerrada/);
  elements.get('projects-status-filter').value = 'paused';
  run('renderProjectBoard()');
  assert.match(elements.get('project-board').innerHTML, /Site em pausa/);
  assert.doesNotMatch(elements.get('project-board').innerHTML, /Campanha encerrada/);
});

test('lead filtering preserves totals and escapes customer content', () => {
  const { run, elements } = admin();
  run(`leadsCache=[{id:1,name:'João <script>',phone:'5592999990000',status:'new'},
    {id:2,name:'Maria',phone:'92999990000',status:'won'}];`);
  elements.get('leads-search').value = 'joao';
  run('renderLeads()');
  assert.match(elements.get('leads-tbody').innerHTML, /João &lt;script&gt;/);
  assert.doesNotMatch(elements.get('leads-tbody').innerHTML, /Maria/);
  assert.match(elements.get('leads-stats').innerHTML, /<span>2<\/span>/);
  assert.match(elements.get('leads-tbody').innerHTML, /wa.me\/5592999990000/);
});

test('cash flow reload respects the selected filter', async () => {
  const { run, elements, context } = admin();
  elements.get('finance-month').value = '2026-09';
  elements.get('cash-status-filter').value = 'pending';
  context.fetch = async () => ({ ok: true, json: async () => ({ month:'2026-09', transactions:[
    {id:1,description:'Recebido',status:'paid',type:'income',amount_cents:10000},
    {id:2,description:'Aguardando',status:'pending',type:'income',amount_cents:20000}
  ] }) });
  await run('loadCashFlow()');
  assert.match(elements.get('cash-tbody').innerHTML, /Aguardando/);
  assert.doesNotMatch(elements.get('cash-tbody').innerHTML, /Recebido/);
});

test('finance and household screens show the same integrated monthly total', () => {
  const { run, elements } = admin();
  run("renderIntegratedCost('finance-integrated-cost',{business_expenses:25000,household_expenses:17500})");
  run("renderIntegratedCost('household-integrated-cost',{business_expenses:25000,household_expenses:17500})");
  const finance = elements.get('finance-integrated-cost').innerHTML;
  const household = elements.get('household-integrated-cost').innerHTML;
  assert.match(finance, /R\$\s*425,00/);
  assert.equal(finance, household);
});

test('cash rows open details from both financial screens', () => {
  const { run, elements } = admin();
  run("cashCache=[{id:9,description:'Entrada detalhada',status:'paid',type:'income',amount_cents:30000,due_date:'2026-09-07',category:'Consultoria'}];renderCashTable()");
  run("householdCache=[{id:10,description:'Mercado detalhado',status:'paid',type:'expense',amount_cents:9000,due_date:'2026-09-07',category:'Mercado e feira'}];renderHouseholdTable()");
  assert.match(elements.get('cash-tbody').innerHTML, /openCashDetail\(9,'business'\)/);
  assert.match(elements.get('household-tbody').innerHTML, /openCashDetail\(10,'household'\)/);
});

test('new cash charge switches to its due month and clears filters', () => {
  const { run, elements } = admin();
  elements.get('finance-month').value = '2026-09';
  elements.get('cash-search').value = 'antiga';
  elements.get('cash-type-filter').value = 'expense';
  elements.get('cash-status-filter').value = 'paid';
  run("revealCreatedCash('2026-10-01')");
  assert.equal(elements.get('finance-month').value, '2026-10');
  assert.equal(elements.get('cash-search').value, '');
  assert.equal(elements.get('cash-type-filter').value, '');
  assert.equal(elements.get('cash-status-filter').value, '');
});

test('client cards show every responsible contact and escape customer data', () => {
  const { run, elements } = admin();
  run(`clientsCache=[{id:1,name:'Empresa <Teste>',document:'00.000.000/0001-00',city:'Manaus',state:'AM',
    emails:[{value:'financeiro@empresa.com.br',contact_name:'Andrey'},{value:'diretoria@empresa.com.br',contact_name:'Beatriz'}],
    phones:[{value:'(92) 99999-0000',contact_name:'Carlos'}]}];renderClients();`);
  const html = elements.get('clients-list').innerHTML;
  assert.match(html, /Empresa &lt;Teste&gt;/);
  assert.match(html, /Andrey/);
  assert.match(html, /Beatriz/);
  assert.match(html, /Carlos/);
  assert.match(html, /wa\.me\/5592999990000/);
});

test('network errors and failed GET requests show a recoverable error', async () => {
  const { run, elements, context } = admin();
  context.fetch = async () => { throw new Error('offline'); };
  assert.equal(await run("authFetch('/api/admin/projects')"), null);
  assert.equal(elements.get('request-error').hidden, false);
  context.fetch = async () => ({ ok:false, status:500 });
  assert.equal(await run("authFetch('/api/admin/projects')"), null);
});

test('automatic InfinitePay checkout replaces the manual link field', () => {
  const { run, elements } = admin();
  elements.get('cf-type').value = 'income';
  elements.get('cf-status').value = 'pending';
  elements.get('cf-infinitepay-auto').checked = true;
  run('toggleInfinitePay()');
  assert.equal(elements.get('cf-manual-payment').hidden, true);
  assert.match(elements.get('cash-submit').textContent, /gerar cobrança/i);
  elements.get('cf-infinitepay-auto').checked = false;
  run('toggleInfinitePay()');
  assert.equal(elements.get('cf-manual-payment').hidden, false);
});

test('expense mode shows supplier fields and hides customer billing tools', () => {
  const { run, elements } = admin();
  elements.get('cf-type').value = 'expense';
  elements.get('cf-status').value = 'pending';
  run('updateCashCategories()');
  assert.equal(elements.get('cash-modal-title').textContent, 'Nova despesa');
  assert.equal(elements.get('cf-expense-details').hidden, false);
  assert.equal(elements.get('cf-income-links').hidden, true);
  assert.equal(elements.get('cf-infinitepay-box').hidden, true);
  assert.equal(elements.get('cf-reminder-box').hidden, true);
  assert.equal(elements.get('cf-status-paid').textContent, 'Pago');
  assert.match(elements.get('cash-submit').textContent, /Salvar despesa/);
});

test('household mode uses personal categories and a dedicated beneficiary field', () => {
  const { run, elements } = admin();
  elements.get('cf-scope').value = 'household';
  elements.get('cf-type').value = 'expense';
  run('updateCashCategories()');
  assert.equal(elements.get('cash-modal-title').textContent, 'Nova despesa de casa');
  assert.equal(elements.get('cf-household-details').hidden, false);
  assert.equal(elements.get('cf-expense-details').hidden, true);
  assert.match(elements.get('cf-category').innerHTML, /Mercado e feira/);
});

test('business expense can select a known service company or type another one', () => {
  const { run, elements } = admin();
  elements.get('cf-type').value = 'expense';
  elements.get('cf-company').value = '__other';
  run('updateCashTypeUI()');
  assert.equal(elements.get('cf-custom-company-field').hidden, false);
  assert.equal(elements.get('cf-counterparty').required, true);
  elements.get('cf-type').value = 'income';
  run('updateCashTypeUI()');
  assert.equal(elements.get('cf-counterparty').required, false);
});
