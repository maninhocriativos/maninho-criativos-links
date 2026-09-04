const COOKIE_NAME = 'mc_admin_session';

function cookieValue(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return '';
}

export async function hashToken(token) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function sessionCookie(token, request, maxAge = 28_800) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export async function requireAuth(request, env) {
  const token = cookieValue(request, COOKIE_NAME);
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const tokenHash = await hashToken(token);
  const session = await env.DB.prepare(
    `SELECT id FROM admin_sessions WHERE token_hash = ? AND expires_at > datetime('now')`
  ).bind(tokenHash).first();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return null;
}

export function getSessionToken(request) { return cookieValue(request, COOKIE_NAME); }
