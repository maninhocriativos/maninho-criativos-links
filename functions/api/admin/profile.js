import { requireAuth } from './_auth.js';

// GET /api/admin/profile
export async function onRequestGet({ request, env }) {
  const deny = requireAuth(request, env);
  if (deny) return deny;

  try {
    const profile = await env.DB.prepare(
      `SELECT * FROM profile WHERE id = 1`
    ).first();
    return Response.json({ profile });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

// PUT /api/admin/profile
export async function onRequestPut({ request, env }) {
  const deny = requireAuth(request, env);
  if (deny) return deny;

  try {
    const { name, bio, avatar_url, bg_from, bg_via, bg_to } = await request.json();

    await env.DB.prepare(
      `INSERT INTO profile (id, name, bio, avatar_url, bg_from, bg_via, bg_to, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         bio = excluded.bio,
         avatar_url = excluded.avatar_url,
         bg_from = excluded.bg_from,
         bg_via = excluded.bg_via,
         bg_to = excluded.bg_to,
         updated_at = datetime('now')`
    ).bind(name, bio, avatar_url, bg_from, bg_via, bg_to).run();

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
