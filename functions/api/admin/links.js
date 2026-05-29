import { requireAuth } from './_auth.js';

// GET /api/admin/links — todos os links (incluindo inativos)
export async function onRequestGet({ request, env }) {
  const deny = requireAuth(request, env);
  if (deny) return deny;

  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM links ORDER BY order_index ASC, id ASC`
    ).all();
    return Response.json({ links: results });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

// POST /api/admin/links — cria novo link
export async function onRequestPost({ request, env }) {
  const deny = requireAuth(request, env);
  if (deny) return deny;

  try {
    const { title, url, icon, color_from, color_to, order_index } = await request.json();
    if (!title || !url) return Response.json({ error: 'title and url required' }, { status: 400 });

    const result = await env.DB.prepare(
      `INSERT INTO links (title, url, icon, color_from, color_to, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      title, url,
      icon || '🔗',
      color_from || '#667eea',
      color_to || '#764ba2',
      order_index || 0
    ).run();

    return Response.json({ ok: true, id: result.meta?.last_row_id }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
