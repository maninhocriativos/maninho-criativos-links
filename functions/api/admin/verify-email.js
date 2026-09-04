import { errorResponse, json, rateLimit, readJson, text } from '../_utils.js';
import { hashToken, sessionCookie } from './_auth.js';

export async function onRequestPost({ request, env }) {
  try {
    await rateLimit(env, request, 'admin-email-code', 12, 15 * 60);
    const body = await readJson(request, 1_024);
    const challengeId = text(body.challenge_id, { required: true, max: 64 });
    const code = text(body.code, { required: true, min: 6, max: 6 });
    if (!/^\d{6}$/.test(code)) return json({ error: 'Código inválido ou expirado' }, 401);
    const codeHash = await hashToken(`${challengeId}:${code}:${env.ADMIN_PASSWORD || ''}`);
    const challenge = await env.DB.prepare(
      `SELECT id FROM admin_login_challenges
       WHERE id = ? AND code_hash = ? AND attempts < 5 AND expires_at > datetime('now')`
    ).bind(challengeId, codeHash).first();
    await env.DB.prepare(`UPDATE admin_login_challenges SET attempts = attempts + 1 WHERE id = ?`).bind(challengeId).run();
    if (!challenge) return json({ error: 'Código inválido ou expirado' }, 401);

    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM admin_login_challenges WHERE id = ?`).bind(challengeId),
      env.DB.prepare(`DELETE FROM admin_sessions WHERE expires_at <= datetime('now')`),
      env.DB.prepare(`INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, datetime('now', '+8 hours'))`)
        .bind(await hashToken(token)),
    ]);
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token, request) });
  } catch (error) { return errorResponse(error); }
}
