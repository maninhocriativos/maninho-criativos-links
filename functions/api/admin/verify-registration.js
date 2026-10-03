import { errorResponse, HttpError, json, rateLimit, readJson, text } from '../_utils.js';
import { hashToken } from './_auth.js';

export async function onRequestPost({ request, env }) {
  try {
    await rateLimit(env, request, 'admin-registration-code', 12, 15 * 60);
    const body = await readJson(request, 1_024);
    const challengeId = text(body.challenge_id, { required: true, max: 64 });
    const code = text(body.code, { required: true, min: 6, max: 6 });
    if (!/^\d{6}$/.test(code)) throw new HttpError(401, 'Código inválido ou expirado');
    const challenge = await env.DB.prepare(`SELECT id,user_id,email,code_hash,purpose FROM admin_login_challenges WHERE id=? AND attempts<5 AND expires_at>datetime('now')`).bind(challengeId).first();
    await env.DB.prepare(`UPDATE admin_login_challenges SET attempts=attempts+1 WHERE id=?`).bind(challengeId).run();
    const user = challenge?.user_id ? await env.DB.prepare(`SELECT id,password_hash,status,email_verified_at FROM admin_users WHERE id=?`).bind(challenge.user_id).first() : null;
    const expected = user ? await hashToken(`${challengeId}:${code}:${user.password_hash}`) : '';
    if (!challenge || challenge.purpose !== 'registration' || !user || user.status !== 'pending' || user.email_verified_at || challenge.code_hash !== expected) {
      throw new HttpError(401, 'Código inválido ou expirado');
    }
    await env.DB.batch([
      env.DB.prepare(`UPDATE admin_users SET email_verified_at=datetime('now'),updated_at=datetime('now') WHERE id=?`).bind(user.id),
      env.DB.prepare(`DELETE FROM admin_login_challenges WHERE id=?`).bind(challengeId),
    ]);
    return json({ ok: true, pending_approval: true });
  } catch (error) { return errorResponse(error); }
}
