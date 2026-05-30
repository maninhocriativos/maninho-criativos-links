import { requireAuth } from './_auth.js';

// GET /api/admin/portfolio — todos os itens
export async function onRequestGet({ request, env }) {
  const deny = requireAuth(request, env);
  if (deny) return deny;
  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM portfolio ORDER BY order_index ASC, id ASC`
    ).all();
    return Response.json({ items: results });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

// POST /api/admin/portfolio — cria item
export async function onRequestPost({ request, env }) {
  const deny = requireAuth(request, env);
  if (deny) return deny;
  try {
    const { title, category, description, image_url, order_index } = await request.json();
    if (!title || !image_url) return Response.json({ error: 'title and image_url required' }, { status: 400 });
    const result = await env.DB.prepare(
      `INSERT INTO portfolio (title, category, description, image_url, order_index)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(title, category || 'Ensaio Fotográfico', description || '', image_url, order_index || 0).run();
    return Response.json({ ok: true, id: result.meta?.last_row_id }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
