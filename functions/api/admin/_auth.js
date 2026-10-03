const COOKIE_NAME = 'mc_admin_session';
const PASSWORD_ITERATIONS = 120_000;

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

function encode(bytes) {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(normalized), char => char.charCodeAt(0));
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$${PASSWORD_ITERATIONS}$${encode(salt)}$${encode(new Uint8Array(bits))}`;
}

export async function verifyPassword(password, encoded) {
  const [algorithm, iterations, saltText, expectedText] = String(encoded || '').split('$');
  if (algorithm !== 'pbkdf2' || Number(iterations) < 100_000 || !saltText || !expectedText) return false;
  const salt = decode(saltText);
  const expected = decode(expectedText);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: Number(iterations), hash: 'SHA-256' }, key, expected.length * 8));
  if (bits.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < bits.length; index++) difference |= bits[index] ^ expected[index];
  return difference === 0;
}

export function sessionCookie(token, request, maxAge = 28_800) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

function roleAllows(request, role) {
  if (!role || role === 'admin') return true;
  const path = new URL(request.url).pathname;
  if (path.endsWith('/verify')) return true;
  const financeArea = /\/api\/admin\/(cash-flow|receipts|crm-dashboard)(?:\/|$)/.test(path);
  if (role === 'editor') return !financeArea;
  if (role === 'finance') return financeArea || (/\/api\/admin\/clients$/.test(path) && request.method === 'GET');
  return false;
}

export async function requireAuth(request, env) {
  const token = cookieValue(request, COOKIE_NAME);
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const tokenHash = await hashToken(token);
  const session = await env.DB.prepare(
    `SELECT s.id,u.id AS user_id,u.status,u.role FROM admin_sessions s LEFT JOIN admin_users u ON u.id=s.user_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND (u.id IS NULL OR u.status='active')`
  ).bind(tokenHash).first();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user_id !== null && !roleAllows(request, session.role)) return Response.json({ error: 'Seu perfil não tem permissão para esta área' }, { status: 403 });
  return null;
}

export async function getAuthSession(request, env) {
  const token = cookieValue(request, COOKIE_NAME);
  if (!token) return null;
  return env.DB.prepare(
    `SELECT s.id,s.user_id,u.name,u.email,u.role,u.status FROM admin_sessions s LEFT JOIN admin_users u ON u.id=s.user_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND (u.id IS NULL OR u.status='active')`
  ).bind(await hashToken(token)).first();
}

export async function requireOwner(request, env) {
  const token = cookieValue(request, COOKIE_NAME);
  if (!token) return { denied: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  const session = await env.DB.prepare(
    `SELECT s.id,s.user_id,u.role,u.status FROM admin_sessions s LEFT JOIN admin_users u ON u.id=s.user_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND (u.id IS NULL OR u.status='active')`
  ).bind(await hashToken(token)).first();
  if (!session) return { denied: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (session.user_id !== null) return { denied: Response.json({ error: 'Somente o proprietário pode gerenciar usuários' }, { status: 403 }) };
  return { session };
}

export function getSessionToken(request) { return cookieValue(request, COOKIE_NAME); }
