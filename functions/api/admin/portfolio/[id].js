import { requireAuth } from '../_auth.js';

// PATCH /api/admin/portfolio/:id
export async function onRequestPatch({ request, env, params }) {
  const deny = requireAuth(request, env);
  if (deny) return deny;
  try {
    const id = parseInt(params.id);
    if (!id) return Response.json({ error: 'Invalid id' }, { status: 400 });
    const body = await request.json();
    const allowed = ['title', 'category', 'description', 'image_url', 'order_index', 'is_active'];
    const fields  = Object.keys(body).filter(k => allowed.includes(k));
    if (!fields.length) return Response.json({ error: 'No valid fields' }, { status: 400 });
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await env.DB.prepare(`UPDATE portfolio SET ${setClause} WHERE id = ?`)
      .bind(...fields.map(f => body[f]), id).run();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

// DELETE /api/admin/portfolio/:id
export async function onRequestDelete({ request, env, params }) {
  const deny = requireAuth(request, env);
  if (deny) return deny;
  try {
    const id = parseInt(params.id);
    if (!id) return Response.json({ error: 'Invalid id' }, { status: 400 });
    await env.DB.prepare(`DELETE FROM portfolio WHERE id = ?`).bind(id).run();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
