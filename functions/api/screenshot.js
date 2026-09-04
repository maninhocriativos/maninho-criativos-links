import { errorResponse, json, rateLimit } from './_utils.js';

export async function onRequestGet({ request, env }) {
  try {
    await rateLimit(env, request, 'screenshot', 20, 60 * 60);
    const params = new URL(request.url).searchParams;
    let target;
    try { target = new URL(params.get('url')); } catch { return json({ error: 'URL inválida' }, 400); }
    if (!['http:', 'https:'].includes(target.protocol)) return json({ error: 'URL inválida' }, 400);
    const width = Number(params.get('width') || 1200);
    if (!Number.isInteger(width) || width < 320 || width > 1920) return json({ error: 'Largura inválida' }, 400);
    return Response.redirect(`https://image.thum.io/get/width/${width}/${target.href}`, 302);
  } catch (error) { return errorResponse(error); }
}
