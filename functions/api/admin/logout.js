import { getSessionToken, hashToken, sessionCookie } from './_auth.js';

export async function onRequestPost({ request, env }) {
  const token = getSessionToken(request);
  if (token) await env.DB.prepare(`DELETE FROM admin_sessions WHERE token_hash = ?`).bind(await hashToken(token)).run();
  return new Response(null, { status: 204, headers: { 'Set-Cookie': sessionCookie('', request, 0) } });
}
