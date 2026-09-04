import { HttpError, errorResponse } from '../../../_utils.js';
import { requireAuth } from '../../_auth.js';
import { createReceiptPdf } from '../../_receipt-pdf.js';

export async function onRequestGet({ request, env, params }) {
  try {
    const denied = await requireAuth(request, env); if (denied) return denied;
    const id = Number(params.id);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Recibo inválido');
    const receipt = await env.DB.prepare(`SELECT r.*,c.document AS client_document,c.address,c.city,c.state,c.postal_code FROM receipt_emails r LEFT JOIN clients c ON c.id=r.client_id WHERE r.id=?`).bind(id).first();
    if (!receipt) throw new HttpError(404, 'Recibo não encontrado');
    receipt.client_address = [receipt.address, [receipt.city,receipt.state].filter(Boolean).join(' / '), receipt.postal_code ? `CEP ${receipt.postal_code}` : ''].filter(Boolean).join(' • ');
    const pdf = await createReceiptPdf(receipt, env);
    if (receipt.pdf_url) await env.STORAGE.put(receipt.pdf_url, pdf.bytes, { httpMetadata: { contentType:'application/pdf', cacheControl:'private, no-store' } });
    return new Response(pdf.bytes, { headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recibo-${receipt.document_code}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    }});
  } catch (error) { return errorResponse(error); }
}
