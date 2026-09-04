import { errorResponse, json, rateLimit, readJson, text } from '../_utils.js';
import { hashToken, sessionCookie } from './_auth.js';

async function sameHash(a, b) {
  const enc = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a || '')),
    crypto.subtle.digest('SHA-256', enc.encode(b || '')),
  ]);
  const lv = new Uint8Array(left), rv = new Uint8Array(right);
  let result = 0;
  for (let i = 0; i < lv.length; i++) result |= lv[i] ^ rv[i];
  return result === 0 && Boolean(a) && Boolean(b);
}

export async function onRequestPost({ request, env }) {
  try {
    await rateLimit(env, request, 'admin-login', 8, 15 * 60);
    const body = await readJson(request, 2_048);
    const username = text(body.username, { required: true, max: 100 });
    const password = text(body.password, { required: true, max: 256 });
    const validUser = env.ADMIN_USER || 'admin';
    if (!env.ADMIN_PASSWORD || !await sameHash(username, validUser) || !await sameHash(password, env.ADMIN_PASSWORD)) {
      return json({ error: 'Usuário ou senha incorretos' }, 401);
    }
    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM admin_sessions WHERE expires_at <= datetime('now')`),
      env.DB.prepare(`INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, datetime('now', '+8 hours'))`).bind(await hashToken(token)),
    ]);
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token, request) });
  } catch (error) { return errorResponse(error); }
}
