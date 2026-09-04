import { errorResponse, HttpError, integer, json, readJson, text } from '../_utils.js';
import { requireAuth } from './_auth.js';

function email(value) {
  const result = text(value, { required: true, max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, 'E-mail inválido');
  return result;
}

function fields(body) {
  return {
    name: text(body.name, { required: true, max: 120 }), email: email(body.email),
    phone: text(body.phone, { max: 30 }), document: text(body.document, { max: 30 }),
    address: text(body.address, { max: 240 }), city: text(body.city, { max: 100 }),
    state: text(body.state, { max: 2 }).toUpperCase(), postal_code: text(body.postal_code, { max: 12 }),
    notes: text(body.notes, { max: 500 }),
  };
}

export async function onRequestGet({ request, env }) {
  const denied = await requireAuth(request, env); if (denied) return denied;
  const url = new URL(request.url);
  const includeArchived = url.searchParams.get('archived') === '1';
  const { results } = await env.DB.prepare(`SELECT * FROM clients ${includeArchived ? '' : 'WHERE is_active=1'} ORDER BY name COLLATE NOCASE LIMIT 1000`).all();
  return json({ clients: results || [] });
}

export async function onRequestPost({ request, env }) {
  try {
    const denied = await requireAuth(request, env); if (denied) return denied;
    const client = fields(await readJson(request));
    const duplicate = await env.DB.prepare(`SELECT id FROM clients WHERE lower(email)=lower(?) AND is_active=1`).bind(client.email).first();
    if (duplicate) throw new HttpError(409, 'Já existe um cliente ativo com este e-mail');
    const created = await env.DB.prepare(`INSERT INTO clients (name,email,phone,document,address,city,state,postal_code,notes) VALUES (?,?,?,?,?,?,?,?,?) RETURNING id`)
      .bind(client.name,client.email,client.phone,client.document,client.address,client.city,client.state,client.postal_code,client.notes).first();
    return json({ id: created.id }, 201);
  } catch (error) { return errorResponse(error); }
}

export async function onRequestPut({ request, env }) {
  try {
    const denied = await requireAuth(request, env); if (denied) return denied;
    const body = await readJson(request); const id = integer(body.id, { min: 1 }); const client = fields(body);
    const duplicate = await env.DB.prepare(`SELECT id FROM clients WHERE lower(email)=lower(?) AND id<>? AND is_active=1`).bind(client.email,id).first();
    if (duplicate) throw new HttpError(409, 'Já existe outro cliente ativo com este e-mail');
    const result = await env.DB.prepare(`UPDATE clients SET name=?,email=?,phone=?,document=?,address=?,city=?,state=?,postal_code=?,notes=?,is_active=1,updated_at=datetime('now') WHERE id=?`)
      .bind(client.name,client.email,client.phone,client.document,client.address,client.city,client.state,client.postal_code,client.notes,id).run();
    if (!result.meta.changes) throw new HttpError(404, 'Cliente não encontrado');
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}

export async function onRequestDelete({ request, env }) {
  try {
    const denied = await requireAuth(request, env); if (denied) return denied;
    const id = integer(new URL(request.url).searchParams.get('id'), { min: 1 });
    const result = await env.DB.prepare(`UPDATE clients SET is_active=0,updated_at=datetime('now') WHERE id=?`).bind(id).run();
    if (!result.meta.changes) throw new HttpError(404, 'Cliente não encontrado');
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
