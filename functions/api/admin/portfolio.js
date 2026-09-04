import { requireAuth } from './_auth.js';
import { errorResponse, httpUrl, integer, json, readJson, text } from '../_utils.js';

function mediaUrl(value, required = false) {
  const result = text(value, { required, max: 2_048 });
  if (result.startsWith('/')) return result;
  return httpUrl(result, { required });
}

export async function onRequestGet({ request, env }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const { results } = await env.DB.prepare(`SELECT * FROM portfolio ORDER BY order_index, id`).all();
    return json({ items: results });
  } catch (error) { return errorResponse(error); }
}

export async function onRequestPost({ request, env }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const body = await readJson(request);
    const result = await env.DB.prepare(
      `INSERT INTO portfolio (title, category, description, image_url, image_mobile_url, project_url, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      text(body.title, { required: true, max: 150 }), text(body.category, { max: 100 }) || 'Ensaio Fotográfico',
      text(body.description, { max: 2_000 }), mediaUrl(body.image_url, true), mediaUrl(body.image_mobile_url),
      httpUrl(body.project_url), integer(body.order_index, { max: 100_000 })
    ).run();
    return json({ ok: true, id: result.meta?.last_row_id }, 201);
  } catch (error) { return errorResponse(error); }
}
