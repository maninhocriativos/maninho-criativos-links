// POST /api/links/:id/click — rastreia clique no link
export async function onRequestPost({ env, params }) {
  try {
    const id = parseInt(params.id);
    if (!id) return Response.json({ error: 'Invalid id' }, { status: 400 });

    await env.DB.prepare(
      `UPDATE links SET click_count = click_count + 1 WHERE id = ? AND is_active = 1`
    ).bind(id).run();

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
