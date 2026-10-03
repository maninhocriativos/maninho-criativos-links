import { errorResponse, HttpError, integer, json, readJson, text } from '../_utils.js';
import { requireOwner } from './_auth.js';

const roles = new Set(['admin', 'editor', 'finance']);

export async function onRequestGet({ request, env }) {
  const access = await requireOwner(request, env);
  if (access.denied) return access.denied;
  const { results } = await env.DB.prepare(`SELECT id,name,email,role,status,email_verified_at,approved_at,created_at FROM admin_users ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, name COLLATE NOCASE`).all();
  return json({ users: results || [] });
}

export async function onRequestPatch({ request, env }) {
  try {
    const access = await requireOwner(request, env);
    if (access.denied) return access.denied;
    const body = await readJson(request, 2_048);
    const id = integer(body.id, { min: 1 });
    const status = text(body.status, { required: true, max: 20 });
    const role = text(body.role || 'editor', { required: true, max: 20 });
    if (!['active', 'disabled'].includes(status)) throw new HttpError(400, 'Status de usuário inválido');
    if (!roles.has(role)) throw new HttpError(400, 'Perfil de acesso inválido');
    const user = await env.DB.prepare(`SELECT id,email_verified_at FROM admin_users WHERE id=?`).bind(id).first();
    if (!user) throw new HttpError(404, 'Usuário não encontrado');
    if (status === 'active' && !user.email_verified_at) throw new HttpError(409, 'O usuário precisa confirmar o e-mail antes da aprovação');
    await env.DB.prepare(`UPDATE admin_users SET status=?,role=?,approved_at=CASE WHEN ?='active' THEN COALESCE(approved_at,datetime('now')) ELSE approved_at END,updated_at=datetime('now') WHERE id=?`)
      .bind(status, role, status, id).run();
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
