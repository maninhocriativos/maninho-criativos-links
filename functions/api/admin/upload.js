import { requireAuth } from './_auth.js';
import { errorResponse, json } from '../_utils.js';

const ALLOWED = new Map([
  ['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/avif', 'avif'],
]);

export async function onRequestPost({ request, env }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const type = request.headers.get('content-type')?.split(';')[0].trim();
    const extension = ALLOWED.get(type);
    const length = Number(request.headers.get('content-length') || 0);
    if (!extension) return json({ error: 'Formato de imagem não permitido' }, 415);
    if (!length || length > 5 * 1024 * 1024) return json({ error: 'Imagem deve ter no máximo 5 MB' }, 413);
    const purpose = request.headers.get('x-upload-purpose') === 'signature' ? 'signatures' : 'portfolio';
    const key = `${purpose}/${crypto.randomUUID()}.${extension}`;
    await env.STORAGE.put(key, request.body, { httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' } });
    return json({ ok: true, url: `/uploads/${key}` }, 201);
  } catch (error) { return errorResponse(error); }
}
