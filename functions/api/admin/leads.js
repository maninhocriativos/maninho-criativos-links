const TOKEN = 'maninho-admin-2024';

export async function onRequestGet({ request, env }) {
  const auth = request.headers.get('Authorization') || '';
  if (auth !== `Bearer ${TOKEN}`) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { results } = await env.DB.prepare(
    `SELECT * FROM leads ORDER BY created_at DESC LIMIT 500`
  ).all();

  return Response.json({ leads: results });
}

export async function onRequestDelete({ request, env }) {
  const auth = request.headers.get('Authorization') || '';
  if (auth !== `Bearer ${TOKEN}`) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return Response.json({ error: 'ID obrigatório' }, { status: 400 });

  await env.DB.prepare(`DELETE FROM leads WHERE id = ?`).bind(id).run();
  return Response.json({ ok: true });
}
