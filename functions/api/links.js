// GET /api/links — retorna links ativos ordenados
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, title, url, icon, color_from, color_to, order_index, click_count
       FROM links WHERE is_active = 1
       ORDER BY order_index ASC, id ASC`
    ).all();

    return Response.json({ links: results }, {
      headers: { 'Cache-Control': 'public, max-age=30' }
    });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
