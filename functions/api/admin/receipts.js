import { errorResponse, HttpError, integer, json, rateLimit, readJson, text } from '../_utils.js';
import { requireAuth } from './_auth.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function validEmail(value) {
  const email = text(value, { required: true, max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'E-mail inválido');
  return email;
}

function receiptHtml(receipt) {
  const amount = (receipt.amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const date = new Date(`${receipt.receipt_date}T12:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  return `<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#202124">
    <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:#111827;color:#fff;padding:28px 32px"><h1 style="margin:0;font-size:24px">Recibo de pagamento</h1><p style="margin:8px 0 0;color:#cbd5e1">Maninho Criativos</p></div>
      <div style="padding:32px"><p>Olá, <strong>${escapeHtml(receipt.recipient_name)}</strong>.</p><p>Confirmamos o recebimento referente a:</p>
        <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:24px 0">
          <p style="margin:0 0 12px"><strong>Descrição:</strong> ${escapeHtml(receipt.description)}</p>
          <p style="margin:0 0 12px"><strong>Valor:</strong> ${escapeHtml(amount)}</p>
          <p style="margin:0 0 12px"><strong>Data:</strong> ${escapeHtml(date)}</p>
          ${receipt.payment_method ? `<p style="margin:0"><strong>Forma de pagamento:</strong> ${escapeHtml(receipt.payment_method)}</p>` : ''}
        </div>
        ${receipt.client_document ? `<p style="font-size:13px;color:#64748b"><strong>CPF/CNPJ:</strong> ${escapeHtml(receipt.client_document)}</p>` : ''}
        ${receipt.client_address ? `<p style="font-size:13px;color:#64748b"><strong>Endereço:</strong> ${escapeHtml(receipt.client_address)}</p>` : ''}
        <div style="margin-top:52px;text-align:center"><div style="border-top:1px solid #334155;width:280px;margin:0 auto 8px"></div><strong>Maninho Criativos</strong><br><span style="font-size:12px;color:#64748b">Assinatura do responsável</span></div>
        <p style="font-size:13px;color:#64748b">Este recibo foi emitido eletronicamente por Maninho Criativos.</p>
      </div>
    </div></body></html>`;
}

export async function onRequestGet({ request, env }) {
  const denied = await requireAuth(request, env); if (denied) return denied;
  const { results } = await env.DB.prepare(`SELECT * FROM receipt_emails ORDER BY id DESC LIMIT 200`).all();
  return json({ receipts: results || [] });
}

export async function onRequestPost({ request, env }) {
  try {
    const denied = await requireAuth(request, env); if (denied) return denied;
    await rateLimit(env, request, 'admin-receipts', 30, 60 * 60);
    if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) throw new HttpError(503, 'Resend não configurado');
    const body = await readJson(request, 16_384);
    const clientId = integer(body.client_id, { min: 1 });
    const client = await env.DB.prepare(`SELECT * FROM clients WHERE id=? AND is_active=1`).bind(clientId).first();
    if (!client) throw new HttpError(404, 'Cliente não encontrado ou arquivado');
    const receipt = {
      client_id: client.id,
      recipient_name: text(client.name, { required: true, max: 120 }),
      recipient_email: validEmail(client.email),
      client_document: client.document || '',
      client_address: [client.address, [client.city, client.state].filter(Boolean).join(' / '), client.postal_code ? `CEP ${client.postal_code}` : ''].filter(Boolean).join(' • '),
      description: text(body.description, { required: true, max: 500 }),
      amount_cents: integer(body.amount_cents, { min: 1, max: 100_000_000 }),
      payment_method: text(body.payment_method, { max: 80 }),
      receipt_date: text(body.receipt_date, { required: true, max: 10 }),
      scheduled_at: body.scheduled_at ? text(body.scheduled_at, { max: 40 }) : null,
    };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(receipt.receipt_date)) throw new HttpError(400, 'Data do recibo inválida');
    if (receipt.scheduled_at) {
      const scheduled = Date.parse(receipt.scheduled_at);
      if (!Number.isFinite(scheduled) || scheduled < Date.now() + 60_000 || scheduled > Date.now() + 30 * 86_400_000) {
        throw new HttpError(400, 'O agendamento deve estar entre 1 minuto e 30 dias');
      }
      receipt.scheduled_at = new Date(scheduled).toISOString();
    }

    const created = await env.DB.prepare(`INSERT INTO receipt_emails
      (client_id, recipient_name, recipient_email, description, amount_cents, payment_method, receipt_date, scheduled_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`)
      .bind(receipt.client_id, receipt.recipient_name, receipt.recipient_email, receipt.description, receipt.amount_cents,
        receipt.payment_method, receipt.receipt_date, receipt.scheduled_at).first();

    const payload = {
      from: env.RESEND_FROM_EMAIL,
      to: [receipt.recipient_email],
      subject: `Recibo de pagamento — Maninho Criativos #${created.id}`,
      html: receiptHtml(receipt),
      text: `Recibo Maninho Criativos #${created.id}\nCliente: ${receipt.recipient_name}\nDescrição: ${receipt.description}\nValor: R$ ${(receipt.amount_cents / 100).toFixed(2).replace('.', ',')}\nData: ${receipt.receipt_date}`,
      tags: [{ name: 'category', value: 'receipt' }],
      ...(receipt.scheduled_at ? { scheduled_at: receipt.scheduled_at } : {}),
    };
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `receipt-${created.id}` },
      body: JSON.stringify(payload),
    });
    const provider = await response.json().catch(() => ({}));
    if (!response.ok || !provider.id) {
      await env.DB.prepare(`UPDATE receipt_emails SET status='failed', provider_error=?, updated_at=datetime('now') WHERE id=?`)
        .bind(text(provider.message || 'Falha no envio', { max: 500 }), created.id).run();
      throw new HttpError(502, provider.message || 'Não foi possível enviar o recibo');
    }
    const status = receipt.scheduled_at ? 'scheduled' : 'sent';
    await env.DB.prepare(`UPDATE receipt_emails SET status=?, resend_id=?, updated_at=datetime('now') WHERE id=?`)
      .bind(status, provider.id, created.id).run();
    return json({ id: created.id, resend_id: provider.id, status }, 201);
  } catch (error) { return errorResponse(error); }
}
