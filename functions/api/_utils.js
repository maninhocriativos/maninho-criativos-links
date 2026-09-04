const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

export async function readJson(request, maxBytes = 16_384) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > maxBytes) throw new HttpError(413, 'Payload muito grande');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new HttpError(413, 'Payload muito grande');
  }
  try { return JSON.parse(text); } catch { throw new HttpError(400, 'JSON inválido'); }
}

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function text(value, { min = 0, max = 255, required = false } = {}) {
  const result = typeof value === 'string' ? value.trim() : '';
  if (required && result.length < Math.max(1, min)) throw new HttpError(400, 'Campo obrigatório ausente');
  if (result.length < min || result.length > max) throw new HttpError(400, 'Campo com tamanho inválido');
  return result;
}

export function integer(value, { min = 0, max = 1_000_000, fallback = 0 } = {}) {
  if (value === '' || value === null || value === undefined) return fallback;
  const result = Number(value);
  if (!Number.isInteger(result) || result < min || result > max) throw new HttpError(400, 'Número inválido');
  return result;
}

export function httpUrl(value, { required = false, max = 2048 } = {}) {
  const result = text(value, { required, max });
  if (!result) return '';
  let parsed;
  try { parsed = new URL(result, 'https://local.invalid'); } catch { throw new HttpError(400, 'URL inválida'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new HttpError(400, 'URL inválida');
  return result;
}

export function color(value, fallback) {
  const result = typeof value === 'string' ? value.trim() : '';
  if (!result && fallback) return fallback;
  if (!result) throw new HttpError(400, 'Cor inválida');
  if (!/^#[0-9a-f]{6}$/i.test(result)) throw new HttpError(400, 'Cor inválida');
  return result;
}

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

export async function rateLimit(env, request, scope, limit, windowSeconds) {
  const raw = `${scope}:${clientIp(request)}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const key = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, bucket, count) VALUES (?, ?, 1)
     ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1`
  ).bind(key, bucket).run();
  const row = await env.DB.prepare(`SELECT count FROM rate_limits WHERE key = ? AND bucket = ?`).bind(key, bucket).first();
  if ((row?.count || 0) > limit) throw new HttpError(429, 'Muitas solicitações. Tente novamente mais tarde.');
  await env.DB.prepare(`DELETE FROM rate_limits WHERE bucket < ?`).bind(bucket - 48).run();
}

export function errorResponse(error) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error(JSON.stringify({ level: 'error', message: error?.message || 'unknown error' }));
  return json({ error: 'Erro interno' }, 500);
}
