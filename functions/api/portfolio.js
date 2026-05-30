// GET /api/portfolio?category=X — itens ativos do portfólio
export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const cat = url.searchParams.get('category');

    const query = cat && cat !== 'Todos'
      ? `SELECT id, title, category, description, image_url, order_index
         FROM portfolio WHERE is_active = 1 AND category = ?
         ORDER BY order_index ASC, id ASC`
      : `SELECT id, title, category, description, image_url, order_index
         FROM portfolio WHERE is_active = 1
         ORDER BY order_index ASC, id ASC`;

    const { results } = cat && cat !== 'Todos'
      ? await env.DB.prepare(query).bind(cat).all()
      : await env.DB.prepare(query).all();

    return Response.json({ items: results }, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
