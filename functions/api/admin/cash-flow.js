import { errorResponse, HttpError, httpUrl, integer, json, readJson, text } from '../_utils.js';
import { createInfinitePayLink, makeInfinitePayOrderNsu } from '../_infinitepay.js';
import { requireAuth } from './_auth.js';

const TYPES = new Set(['income', 'expense']);
const STATUSES = new Set(['pending', 'paid', 'cancelled']);

function flag(value, fallback = false) {
  if (value === undefined || value === null) return fallback ? 1 : 0;
  return value === true || value === 1 || value === '1' ? 1 : 0;
}

function paymentUrl(value) {
  const result = httpUrl(value, { max: 2048 });
  if (!result) return '';
  let parsed;
  try { parsed = new URL(result); } catch { throw new HttpError(400, 'Link de pagamento inválido'); }
  if (parsed.protocol !== 'https:') throw new HttpError(400, 'O link de pagamento deve usar HTTPS');
  return parsed.href;
}

export function parseCashTransaction(body) {
  const type = text(body.type, { required: true, max: 10 });
  const status = text(body.status || 'pending', { required: true, max: 12 });
  if (!TYPES.has(type) || !STATUSES.has(status)) throw new HttpError(400, 'Tipo ou status inválido');
  const dueDate = text(body.due_date, { required: true, max: 10 });
  const paidDate = text(body.paid_date, { max: 10 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || (paidDate && !/^\d{4}-\d{2}-\d{2}$/.test(paidDate))) {
    throw new HttpError(400, 'Data inválida');
  }

  const transaction = {
    client_id: type === 'income' && body.client_id ? integer(body.client_id, { min: 1 }) : null,
    project_id: type === 'income' && body.project_id ? integer(body.project_id, { min: 1 }) : null,
    type,
    category: text(body.category, { required: true, max: 80 }),
    description: text(body.description, { required: true, max: 240 }),
    amount_cents: integer(body.amount_cents, { min: 1, max: 100_000_000 }),
    due_date: dueDate,
    paid_date: status === 'paid' ? (paidDate || dueDate) : null,
    status,
    payment_method: text(body.payment_method, { max: 80 }),
    notes: text(body.notes, { max: 500 }),
    counterparty_name: type === 'expense' ? text(body.counterparty_name, { required: true, max: 160 }) : '',
    counterparty_document: type === 'expense' ? text(body.counterparty_document, { max: 30 }) : '',
    expense_scope: type === 'expense' && body.expense_scope === 'household' ? 'household' : 'business',
    payment_url: paymentUrl(body.payment_url),
    reminder_enabled: flag(body.reminder_enabled),
    reminder_email: flag(body.reminder_email, true),
    reminder_sms: flag(body.reminder_sms),
    reminder_whatsapp: flag(body.reminder_whatsapp),
    generate_payment_link: flag(body.generate_payment_link),
  };

  if (transaction.reminder_enabled) {
    if (transaction.type !== 'income') throw new HttpError(400, 'Cobranças automáticas são permitidas somente para receitas');
    if (transaction.status !== 'pending') throw new HttpError(400, 'A cobrança automática exige status pendente');
    if (!transaction.client_id) throw new HttpError(400, 'Selecione um cliente para ativar a cobrança');
    if (!transaction.payment_url && !transaction.generate_payment_link) throw new HttpError(400, 'Informe ou gere o link de pagamento da InfinitePay');
    if (!transaction.reminder_email && !transaction.reminder_sms && !transaction.reminder_whatsapp) {
      throw new HttpError(400, 'Selecione ao menos um canal de cobrança');
    }
  }
  return transaction;
}

async function clientForPayment(env, clientId) {
  if (!clientId) throw new HttpError(400, 'Selecione um cliente para gerar a cobrança da InfinitePay');
  const client = await env.DB.prepare('SELECT id,name,email,phone FROM clients WHERE id=? AND is_active=1').bind(clientId).first();
  if (!client) throw new HttpError(404, 'Cliente não encontrado');
  return client;
}

async function generatedPayment(env, transaction, client, installmentNumber, installmentTotal) {
  const orderNsu = makeInfinitePayOrderNsu();
  const installment = installmentTotal > 1 ? ` (${installmentNumber}/${installmentTotal})` : '';
  const result = await createInfinitePayLink(env, {
    amountCents: transaction.amount_cents,
    description: `${transaction.description}${installment}`.slice(0, 240),
    orderNsu,
    customer: client,
  });
  return {
    paymentUrl: result.paymentUrl,
    paymentProvider: 'infinitepay',
    orderNsu,
    invoiceSlug: result.invoiceSlug,
  };
}

async function mapInBatches(values, batchSize, callback) {
  const output = [];
  for (let start = 0; start < values.length; start += batchSize) {
    const batch = values.slice(start, start + batchSize);
    output.push(...await Promise.all(batch.map(callback)));
  }
  return output;
}

function addMonths(dateString, offset) {
  const [year, month, day] = dateString.split('-').map(Number);
  const targetMonth = month - 1 + offset;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  return `${targetYear}-${String(normalizedMonth + 1).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}

export async function onRequestGet({ request, env }) {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  const url = new URL(request.url);
  const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) return json({ error: 'Mês inválido' }, 400);
  const scope = url.searchParams.get('scope') || 'business';
  if (!['business', 'household'].includes(scope)) return json({ error: 'Área financeira inválida' }, 400);
  const scopeFilter = scope === 'household' ? "t.expense_scope='household'" : "t.expense_scope='business'";
  const aggregateScopeFilter = scope === 'household' ? "expense_scope='household'" : "expense_scope='business'";
  const [rows, summary, monthly, categories, combinedSummary] = await Promise.all([
    env.DB.prepare(`SELECT t.*, c.name client_name, c.email client_email, c.phone client_phone, p.title project_title,
      (SELECT COUNT(*) FROM billing_reminder_deliveries d WHERE d.transaction_id=t.id AND d.status='sent') reminder_sent_count,
      (SELECT MAX(d.sent_at) FROM billing_reminder_deliveries d WHERE d.transaction_id=t.id AND d.status='sent') reminder_last_sent_at
      FROM cash_transactions t LEFT JOIN clients c ON c.id=t.client_id
      LEFT JOIN design_projects p ON p.id=t.project_id
      WHERE substr(t.due_date,1,7)=? AND ${scopeFilter} ORDER BY t.due_date DESC,t.id DESC`).bind(month).all(),
    env.DB.prepare(`SELECT
      COALESCE(SUM(CASE WHEN type='income' AND status='paid' THEN amount_cents ELSE 0 END),0) income_paid,
      COALESCE(SUM(CASE WHEN type='expense' AND status='paid' THEN amount_cents ELSE 0 END),0) expense_paid,
      COALESCE(SUM(CASE WHEN type='income' AND status='pending' THEN amount_cents ELSE 0 END),0) receivable,
      COALESCE(SUM(CASE WHEN type='expense' AND status='pending' THEN amount_cents ELSE 0 END),0) payable
      FROM cash_transactions WHERE substr(due_date,1,7)=? AND ${aggregateScopeFilter}`).bind(month).first(),
    env.DB.prepare(`SELECT substr(due_date,1,7) month,
      SUM(CASE WHEN type='income' AND status='paid' THEN amount_cents ELSE 0 END) income,
      SUM(CASE WHEN type='expense' AND status='paid' THEN amount_cents ELSE 0 END) expense
      FROM cash_transactions WHERE due_date>=date('now','-11 months','start of month') AND ${aggregateScopeFilter}
      GROUP BY month ORDER BY month`).all(),
    env.DB.prepare(`SELECT category,type,SUM(amount_cents) total FROM cash_transactions
      WHERE substr(due_date,1,7)=? AND status='paid' AND ${aggregateScopeFilter} GROUP BY category,type ORDER BY total DESC`).bind(month).all(),
    env.DB.prepare(`SELECT
      COALESCE(SUM(CASE WHEN expense_scope='business' THEN amount_cents ELSE 0 END),0) business_expenses,
      COALESCE(SUM(CASE WHEN expense_scope='household' THEN amount_cents ELSE 0 END),0) household_expenses
      FROM cash_transactions WHERE type='expense' AND status!='cancelled' AND substr(due_date,1,7)=?`).bind(month).first(),
  ]);
  return json({ month, transactions: rows.results || [], summary, combined_summary: combinedSummary, monthly: monthly.results || [], categories: categories.results || [] });
}

export async function onRequestPost({ request, env }) {
  try {
    const denied = await requireAuth(request, env);
    if (denied) return denied;
    const body = await readJson(request);
    const transaction = parseCashTransaction(body);
    const frequency = body.recurrence_frequency === 'monthly' ? 'monthly' : 'once';
    const months = frequency === 'monthly' ? integer(body.recurrence_months, { min: 2, max: 36 }) : 1;
    const group = frequency === 'monthly' ? crypto.randomUUID() : null;
    if (transaction.generate_payment_link && (transaction.type !== 'income' || transaction.status !== 'pending')) {
      throw new HttpError(400, 'O link da InfinitePay só pode ser gerado para uma receita pendente');
    }
    const client = transaction.generate_payment_link ? await clientForPayment(env, transaction.client_id) : null;
    const installments = Array.from({ length: months }, (_, index) => index);
    const generated = transaction.generate_payment_link
      ? await mapInBatches(installments, 4, index => generatedPayment(env, transaction, client, index + 1, months))
      : installments.map(() => ({ paymentUrl: transaction.payment_url, paymentProvider: '', orderNsu: '', invoiceSlug: '' }));
    const statements = [];
    for (let index = 0; index < months; index += 1) {
      const future = index > 0;
      statements.push(env.DB.prepare(`INSERT INTO cash_transactions
        (client_id,project_id,type,category,description,amount_cents,due_date,paid_date,status,payment_method,notes,
         recurrence_group,recurrence_frequency,installment_number,installment_total,payment_url,reminder_enabled,
         reminder_email,reminder_sms,reminder_whatsapp,payment_provider,infinitepay_order_nsu,infinitepay_invoice_slug,
         counterparty_name,counterparty_document,expense_scope)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        transaction.client_id, transaction.project_id, transaction.type, transaction.category, transaction.description,
        transaction.amount_cents, addMonths(transaction.due_date, index), future ? null : transaction.paid_date,
        future ? 'pending' : transaction.status, transaction.payment_method, transaction.notes, group, frequency,
        index + 1, months, generated[index].paymentUrl, transaction.reminder_enabled, transaction.reminder_email,
        transaction.reminder_sms, transaction.reminder_whatsapp, generated[index].paymentProvider,
        generated[index].orderNsu, generated[index].invoiceSlug, transaction.counterparty_name, transaction.counterparty_document,
        transaction.expense_scope,
      ));
    }
    await env.DB.batch(statements);
    await env.DB.prepare(`INSERT INTO crm_activities(entity_type,entity_id,action,details)
      VALUES('receipt',0,'cash_created',?)`).bind(
      frequency === 'monthly' ? `${transaction.description} • recorrência de ${months} meses` : transaction.description,
    ).run();
    return json({ ok: true, created: months, recurrence_group: group, payment_url: generated[0]?.paymentUrl || '' }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestPut({ request, env }) {
  try {
    const denied = await requireAuth(request, env);
    if (denied) return denied;
    const body = await readJson(request);
    const id = integer(body.id, { min: 1 });
    const transaction = parseCashTransaction(body);
    const existing = await env.DB.prepare(`SELECT payment_url,payment_provider,infinitepay_order_nsu,infinitepay_invoice_slug,recurrence_group
      FROM cash_transactions WHERE id=?`).bind(id).first();
    if (!existing) throw new HttpError(404, 'Lançamento não encontrado');
    let payment = {
      paymentUrl: transaction.payment_url,
      paymentProvider: transaction.payment_url === existing.payment_url ? existing.payment_provider : '',
      orderNsu: transaction.payment_url === existing.payment_url ? existing.infinitepay_order_nsu : '',
      invoiceSlug: transaction.payment_url === existing.payment_url ? existing.infinitepay_invoice_slug : '',
    };
    if (transaction.generate_payment_link) {
      if (transaction.type !== 'income' || transaction.status !== 'pending') {
        throw new HttpError(400, 'O link da InfinitePay só pode ser gerado para uma receita pendente');
      }
      const client = await clientForPayment(env, transaction.client_id);
      payment = await generatedPayment(env, transaction, client, 1, 1);
    }
    const result = await env.DB.prepare(`UPDATE cash_transactions SET
      client_id=?,project_id=?,type=?,category=?,description=?,amount_cents=?,due_date=?,paid_date=?,status=?,
      payment_method=?,notes=?,payment_url=?,reminder_enabled=?,reminder_email=?,reminder_sms=?,reminder_whatsapp=?,
      payment_provider=?,infinitepay_order_nsu=?,infinitepay_invoice_slug=?,counterparty_name=?,counterparty_document=?,expense_scope=?,
      updated_at=datetime('now') WHERE id=?`).bind(
      transaction.client_id, transaction.project_id, transaction.type, transaction.category, transaction.description,
      transaction.amount_cents, transaction.due_date, transaction.paid_date, transaction.status,
      transaction.payment_method, transaction.notes, payment.paymentUrl, transaction.reminder_enabled,
      transaction.reminder_email, transaction.reminder_sms, transaction.reminder_whatsapp, payment.paymentProvider,
      payment.orderNsu, payment.invoiceSlug, transaction.counterparty_name, transaction.counterparty_document, transaction.expense_scope, id,
    ).run();
    if (!result.meta.changes) throw new HttpError(404, 'Lançamento não encontrado');
    let updatedSeries = 1;
    if (body.update_recurrence_group && existing.recurrence_group) {
      const seriesResult = await env.DB.prepare(`UPDATE cash_transactions SET
        client_id=?,project_id=?,type=?,category=?,description=?,amount_cents=?,payment_method=?,notes=?,
        reminder_enabled=?,reminder_email=?,reminder_sms=?,reminder_whatsapp=?,counterparty_name=?,counterparty_document=?,
        expense_scope=?,updated_at=datetime('now') WHERE recurrence_group=?`).bind(
        transaction.client_id, transaction.project_id, transaction.type, transaction.category, transaction.description,
        transaction.amount_cents, transaction.payment_method, transaction.notes, transaction.reminder_enabled,
        transaction.reminder_email, transaction.reminder_sms, transaction.reminder_whatsapp, transaction.counterparty_name,
        transaction.counterparty_document, transaction.expense_scope, existing.recurrence_group,
      ).run();
      updatedSeries = Number(seriesResult.meta.changes || 1);
    }
    return json({ ok: true, payment_url: payment.paymentUrl, updated_series: updatedSeries });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const denied = await requireAuth(request, env);
    if (denied) return denied;
    const id = integer(new URL(request.url).searchParams.get('id'), { min: 1 });
    await env.DB.prepare(`UPDATE cash_transactions SET status='cancelled',updated_at=datetime('now') WHERE id=?`).bind(id).run();
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
