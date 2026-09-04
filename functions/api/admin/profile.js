import { requireAuth } from './_auth.js';
import { color, errorResponse, httpUrl, json, readJson, text } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try { return json({ profile: await env.DB.prepare(`SELECT * FROM profile WHERE id = 1`).first() }); }
  catch (error) { return errorResponse(error); }
}

export async function onRequestPut({ request, env }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const body = await readJson(request);
    await env.DB.prepare(
      `INSERT INTO profile (id, name, bio, avatar_url, bg_from, bg_via, bg_to, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, bio=excluded.bio, avatar_url=excluded.avatar_url,
       bg_from=excluded.bg_from, bg_via=excluded.bg_via, bg_to=excluded.bg_to, updated_at=datetime('now')`
    ).bind(
      text(body.name, { required: true, max: 120 }), text(body.bio, { max: 500 }), httpUrl(body.avatar_url),
      color(body.bg_from, '#0f0c29'), color(body.bg_via, '#302b63'), color(body.bg_to, '#24243e')
    ).run();
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
