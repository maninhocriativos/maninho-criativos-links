import { checkInfinitePayPayment } from '../_infinitepay.js';
import { json, readJson } from '../_utils.js';

function shortString(value, max = 240) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function dateInManaus() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function verifyAndApply(env, eventId, payload) {
  try {
    const transaction = await env.DB.prepare(`SELECT id,amount_cents,status FROM cash_transactions
      WHERE infinitepay_order_nsu=? AND payment_provider='infinitepay'`).bind(payload.order_nsu).first();
    if (!transaction) {
      await env.DB.prepare(`UPDATE infinitepay_webhook_events SET status='ignored',provider_error=?,processed_at=datetime('now') WHERE id=?`)
        .bind('Cobrança não encontrada', eventId).run();
      return;
    }

    const confirmed = await checkInfinitePayPayment(env, {
      orderNsu: payload.order_nsu,
      transactionNsu: payload.transaction_nsu,
      slug: payload.invoice_slug,
    });
    const expected = Number(transaction.amount_cents);
    const confirmedAmount = Number(confirmed.amount);
    if (!confirmed.paid || !Number.isInteger(confirmedAmount) || confirmedAmount !== expected) {
      await env.DB.prepare(`UPDATE infinitepay_webhook_events SET status='ignored',provider_error=?,processed_at=datetime('now') WHERE id=?`)
        .bind('Pagamento não confirmado ou valor divergente', eventId).run();
      return;
    }

    const paidAmount = Number.isInteger(Number(confirmed.paid_amount)) ? Number(confirmed.paid_amount) : confirmedAmount;
    const captureMethod = shortString(confirmed.capture_method || payload.capture_method, 40);
    const receiptUrl = shortString(payload.receipt_url, 2048);
    await env.DB.batch([
      env.DB.prepare(`UPDATE cash_transactions SET status='paid',paid_date=?,payment_method=?,
        infinitepay_transaction_nsu=?,infinitepay_invoice_slug=?,infinitepay_receipt_url=?,
        infinitepay_paid_amount_cents=?,infinitepay_capture_method=?,infinitepay_synced_at=datetime('now'),
        updated_at=datetime('now') WHERE id=?`).bind(
        dateInManaus(), captureMethod === 'pix' ? 'PIX' : captureMethod === 'credit_card' ? 'Cartão de crédito' : 'InfinitePay',
        payload.transaction_nsu, payload.invoice_slug, receiptUrl, paidAmount, captureMethod, transaction.id,
      ),
      env.DB.prepare(`UPDATE infinitepay_webhook_events SET status='verified',provider_error='',processed_at=datetime('now') WHERE id=?`).bind(eventId),
    ]);
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', event: 'infinitepay_webhook_processing_failed', eventId, message: error?.message || 'unknown' }));
    await env.DB.prepare(`UPDATE infinitepay_webhook_events SET status='failed',provider_error=?,processed_at=datetime('now') WHERE id=?`)
      .bind(shortString(error?.message || 'Erro desconhecido'), eventId).run();
  }
}

export async function onRequestPost(context) {
  let payload;
  try {
    payload = await readJson(context.request, 32_768);
  } catch {
    return json({ error: 'Payload inválido' }, 400);
  }
  const orderNsu = shortString(payload.order_nsu, 100);
  const transactionNsu = shortString(payload.transaction_nsu, 100);
  const invoiceSlug = shortString(payload.invoice_slug || payload.slug, 100);
  if (!orderNsu || !transactionNsu || !invoiceSlug) return json({ error: 'Campos obrigatórios ausentes' }, 400);

  const safePayload = {
    order_nsu: orderNsu,
    transaction_nsu: transactionNsu,
    invoice_slug: invoiceSlug,
    capture_method: shortString(payload.capture_method, 40),
    receipt_url: shortString(payload.receipt_url, 2048),
  };
  const result = await context.env.DB.prepare(`INSERT INTO infinitepay_webhook_events
    (transaction_nsu,order_nsu,invoice_slug,payload) VALUES(?,?,?,?)
    ON CONFLICT(transaction_nsu) DO UPDATE SET payload=excluded.payload,status='received',provider_error='',processed_at=NULL
    RETURNING id`).bind(transactionNsu, orderNsu, invoiceSlug, JSON.stringify(payload)).first();
  context.waitUntil(verifyAndApply(context.env, result.id, safePayload));
  return json({ ok: true });
}

export function onRequestGet() {
  return json({ error: 'Método não permitido' }, 405, { Allow: 'POST' });
}
