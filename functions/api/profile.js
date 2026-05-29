// GET /api/profile — retorna dados do perfil público
export async function onRequestGet({ env }) {
  try {
    const profile = await env.DB.prepare(
      `SELECT name, bio, avatar_url, bg_from, bg_via, bg_to FROM profile WHERE id = 1`
    ).first();

    return Response.json({ profile }, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
