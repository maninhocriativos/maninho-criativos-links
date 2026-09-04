import { errorResponse, HttpError, json } from '../../_utils.js';
import { requireAuth } from '../_auth.js';

export async function onRequestDelete({ request, env, params }) {
  try {
    const denied = await requireAuth(request, env); if (denied) return denied;
    const id = Number(params.id);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Recibo inválido');
    const receipt = await env.DB.prepare(`SELECT id, status, resend_id FROM receipt_emails WHERE id=?`).bind(id).first();
    if (!receipt) throw new HttpError(404, 'Recibo não encontrado');
    if (receipt.status !== 'scheduled' || !receipt.resend_id) throw new HttpError(409, 'Somente envios agendados podem ser cancelados');
    const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(receipt.resend_id)}/cancel`, {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
    });
    if (!response.ok) {
      const provider = await response.json().catch(() => ({}));
      throw new HttpError(502, provider.message || 'Não foi possível cancelar o agendamento');
    }
    await env.DB.prepare(`UPDATE receipt_emails SET status='cancelled', updated_at=datetime('now') WHERE id=?`).bind(id).run();
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
