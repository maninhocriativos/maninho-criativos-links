import { HttpError, errorResponse } from '../../../_utils.js';
import { requireAuth } from '../../_auth.js';

export async function onRequestGet({ request, env, params }) {
  try {
    const denied = await requireAuth(request, env); if (denied) return denied;
    const id = Number(params.id);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Recibo inválido');
    const receipt = await env.DB.prepare(`SELECT document_code,pdf_url FROM receipt_emails WHERE id=?`).bind(id).first();
    if (!receipt?.pdf_url) throw new HttpError(404, 'PDF não encontrado');
    const object = await env.STORAGE.get(receipt.pdf_url);
    if (!object) throw new HttpError(404, 'Arquivo não encontrado');
    return new Response(object.body, { headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recibo-${receipt.document_code}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    }});
  } catch (error) { return errorResponse(error); }
}
