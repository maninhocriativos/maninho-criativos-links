import { requireAuth } from './_auth.js';

export async function onRequestGet({ request, env }) {
  const deny = await requireAuth(request, env);
  if (deny) return deny;

  const { results } = await env.DB.prepare(
    `SELECT * FROM leads ORDER BY created_at DESC LIMIT 500`
  ).all();

  return Response.json({ leads: results });
}

export async function onRequestDelete({ request, env }) {
  const deny = await requireAuth(request, env);
  if (deny) return deny;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return Response.json({ error: 'ID obrigatório' }, { status: 400 });

  await env.DB.prepare(`DELETE FROM leads WHERE id = ?`).bind(id).run();
  return Response.json({ ok: true });
}

export async function onRequestPatch({ request, env }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  const body = await request.json();
  const id = Number(body.id); const status = String(body.status || '');
  if (!Number.isInteger(id) || !['new','qualified','negotiation','won','lost'].includes(status)) return Response.json({ error:'Dados inválidos' },{status:400});
  await env.DB.prepare(`UPDATE leads SET status=?,updated_at=datetime('now') WHERE id=?`).bind(status,id).run();
  await env.DB.prepare(`INSERT INTO crm_activities(entity_type,entity_id,action,details) VALUES('lead',?,'status_changed',?)`).bind(id,status).run();
  return Response.json({ok:true});
}
