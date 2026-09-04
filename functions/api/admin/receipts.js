import { errorResponse, HttpError, integer, json, rateLimit, readJson, text } from '../_utils.js';
import { requireAuth } from './_auth.js';
import { createReceiptPdf } from './_receipt-pdf.js';

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
      <div style="background:#111827;color:#fff;padding:28px 32px"><p style="margin:0;color:#60a5fa;font-size:12px;font-weight:bold;letter-spacing:2px">MANINHO CRIATIVOS</p><h1 style="margin:8px 0 0;font-size:24px">Recibo de Prestação de Serviços</h1><p style="margin:7px 0 0;color:#cbd5e1;font-size:12px">DOCUMENTO NÃO FISCAL • ${escapeHtml(receipt.document_code)}</p></div>
      <div style="padding:32px"><p><strong>Tomador:</strong> ${escapeHtml(receipt.recipient_name)}</p>
        <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:24px 0">
          <p style="margin:0 0 12px"><strong>Descrição:</strong> ${escapeHtml(receipt.description)}</p>
          <p style="margin:0 0 12px"><strong>Valor:</strong> ${escapeHtml(amount)}</p>
          <p style="margin:0 0 12px"><strong>Data:</strong> ${escapeHtml(date)}</p>
          ${receipt.payment_method ? `<p style="margin:0"><strong>Forma de pagamento:</strong> ${escapeHtml(receipt.payment_method)}</p>` : ''}
        </div>
        ${receipt.client_document ? `<p style="font-size:13px;color:#64748b"><strong>CPF/CNPJ:</strong> ${escapeHtml(receipt.client_document)}</p>` : ''}
        ${receipt.client_address ? `<p style="font-size:13px;color:#64748b"><strong>Endereço:</strong> ${escapeHtml(receipt.client_address)}</p>` : ''}
        <div style="margin-top:52px;text-align:center">${receipt.signature_url ? `<img src="${escapeHtml(receipt.signature_url)}" alt="Assinatura digital" style="display:block;max-width:240px;max-height:90px;margin:0 auto -4px">` : ''}<div style="border-top:1px solid #334155;width:280px;margin:0 auto 8px"></div><strong>Maninho Criativos</strong><br><span style="font-size:12px;color:#64748b">Assinatura eletrônica do responsável</span></div>
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
      signature_url: text(body.signature_url, { max: 500 }),
      receipt_date: text(body.receipt_date, { required: true, max: 10 }),
      scheduled_at: body.scheduled_at ? text(body.scheduled_at, { max: 40 }) : null,
    };
    if (receipt.signature_url && !/^\/uploads\/signatures\/[a-f0-9-]+\.png$/i.test(receipt.signature_url)) {
      throw new HttpError(400, 'Assinatura inválida');
    }
    if (receipt.signature_url) receipt.signature_url = new URL(receipt.signature_url, request.url).href;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(receipt.receipt_date)) throw new HttpError(400, 'Data do recibo inválida');
    if (receipt.scheduled_at) {
      const scheduled = Date.parse(receipt.scheduled_at);
      if (!Number.isFinite(scheduled) || scheduled < Date.now() + 60_000 || scheduled > Date.now() + 30 * 86_400_000) {
        throw new HttpError(400, 'O agendamento deve estar entre 1 minuto e 30 dias');
      }
      receipt.scheduled_at = new Date(scheduled).toISOString();
    }

    const created = await env.DB.prepare(`INSERT INTO receipt_emails
      (client_id, recipient_name, recipient_email, description, amount_cents, payment_method, receipt_date, scheduled_at, signature_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`)
      .bind(receipt.client_id, receipt.recipient_name, receipt.recipient_email, receipt.description, receipt.amount_cents,
        receipt.payment_method, receipt.receipt_date, receipt.scheduled_at, receipt.signature_url).first();

    receipt.document_code = `MC-${receipt.receipt_date.replaceAll('-', '')}-${String(created.id).padStart(6, '0')}`;
    await env.DB.prepare(`UPDATE receipt_emails SET document_code=? WHERE id=?`).bind(receipt.document_code, created.id).run();
    const pdf = await createReceiptPdf(receipt, env);
    const pdfKey = `receipts/${receipt.document_code}.pdf`;
    await env.STORAGE.put(pdfKey, pdf.bytes, { httpMetadata: { contentType: 'application/pdf', cacheControl: 'private, max-age=31536000, immutable' } });
    const pdfUrl = `/api/admin/receipts/${created.id}/pdf`;
    await env.DB.prepare(`UPDATE receipt_emails SET pdf_url=? WHERE id=?`).bind(pdfKey, created.id).run();

    const payload = {
      from: env.RESEND_FROM_EMAIL,
      to: [receipt.recipient_email],
      bcc: ['maninhocriativos@gmail.com'],
      subject: `Recibo ${receipt.document_code} — Maninho Criativos`,
      html: receiptHtml(receipt),
      text: `Recibo Maninho Criativos #${created.id}\nCliente: ${receipt.recipient_name}\nDescrição: ${receipt.description}\nValor: R$ ${(receipt.amount_cents / 100).toFixed(2).replace('.', ',')}\nData: ${receipt.receipt_date}`,
      tags: [{ name: 'category', value: 'receipt' }],
      attachments: [{ content: pdf.content, filename: pdf.filename }],
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
    return json({ id: created.id, resend_id: provider.id, status, document_code: receipt.document_code, pdf_url: pdfUrl }, 201);
  } catch (error) { return errorResponse(error); }
}
