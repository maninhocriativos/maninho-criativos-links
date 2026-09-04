import { requireAuth } from './_auth.js';
import { color, errorResponse, httpUrl, integer, json, readJson, text } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const { results } = await env.DB.prepare(`SELECT * FROM links ORDER BY order_index, id`).all();
    return json({ links: results });
  } catch (error) { return errorResponse(error); }
}

export async function onRequestPost({ request, env }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const body = await readJson(request);
    const result = await env.DB.prepare(
      `INSERT INTO links (title, url, icon, color_from, color_to, order_index) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      text(body.title, { required: true, max: 120 }), httpUrl(body.url, { required: true }),
      text(body.icon, { max: 16 }) || '🔗', color(body.color_from, '#667eea'),
      color(body.color_to, '#764ba2'), integer(body.order_index, { max: 100_000 })
    ).run();
    return json({ ok: true, id: result.meta?.last_row_id }, 201);
  } catch (error) { return errorResponse(error); }
}
