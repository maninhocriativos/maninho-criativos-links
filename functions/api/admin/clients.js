import { errorResponse, HttpError, integer, json, readJson, text } from '../_utils.js';
import { requireAuth } from './_auth.js';

function email(value) {
  const result = text(value, { required: true, max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, 'E-mail inválido');
  return result;
}

function normalizePhone(value) {
  return value.replace(/\D/g, '');
}

export function parseClientContacts(body, type, clientName) {
  const plural = type === 'email' ? 'emails' : 'phones';
  const legacy = type === 'email' ? body.email : body.phone;
  const source = Array.isArray(body[plural])
    ? body[plural]
    : (legacy ? [{ value: legacy, contact_name: clientName }] : []);
  if (source.length > 10) throw new HttpError(400, `Cadastre no máximo 10 ${type === 'email' ? 'e-mails' : 'telefones'}`);

  const seen = new Set();
  const contacts = [];
  for (const item of source) {
    const value = type === 'email'
      ? email(item?.value)
      : text(item?.value, { required: true, max: 30 });
    const contactName = text(item?.contact_name, { required: true, max: 120 });
    const normalizedValue = type === 'email' ? value.toLowerCase() : normalizePhone(value);
    if (type === 'phone' && (normalizedValue.length < 10 || normalizedValue.length > 13)) {
      throw new HttpError(400, 'Telefone inválido');
    }
    if (seen.has(normalizedValue)) throw new HttpError(400, `${type === 'email' ? 'E-mail' : 'Telefone'} repetido no cadastro`);
    seen.add(normalizedValue);
    contacts.push({ value, normalized_value: normalizedValue, contact_name: contactName });
  }
  if (type === 'email' && !contacts.length) throw new HttpError(400, 'Cadastre pelo menos um e-mail');
  return contacts;
}

function fields(body) {
  const name = text(body.name, { required: true, max: 120 });
  const emails = parseClientContacts(body, 'email', name);
  const phones = parseClientContacts(body, 'phone', name);
  return {
    name, emails, phones, email: emails[0].value, phone: phones[0]?.value || '',
    document: text(body.document, { max: 30 }),
    address: text(body.address, { max: 240 }), city: text(body.city, { max: 100 }),
    state: text(body.state, { max: 2 }).toUpperCase(), postal_code: text(body.postal_code, { max: 12 }),
    notes: text(body.notes, { max: 500 }),
  };
}

function contactStatements(env, clientId, client) {
  return [...client.emails.map((contact, index) => ({ ...contact, type: 'email', index })),
    ...client.phones.map((contact, index) => ({ ...contact, type: 'phone', index }))]
    .map(contact => env.DB.prepare(`INSERT INTO client_contacts
      (client_id,type,value,normalized_value,contact_name,is_primary,sort_order)
      VALUES (?,?,?,?,?,?,?)`)
      .bind(clientId, contact.type, contact.value, contact.normalized_value, contact.contact_name, contact.index === 0 ? 1 : 0, contact.index));
}

export async function onRequestGet({ request, env }) {
  const denied = await requireAuth(request, env); if (denied) return denied;
  const url = new URL(request.url);
  const includeArchived = url.searchParams.get('archived') === '1';
  const [clientRows, contactRows] = await Promise.all([
    env.DB.prepare(`SELECT * FROM clients ${includeArchived ? '' : 'WHERE is_active=1'} ORDER BY name COLLATE NOCASE LIMIT 1000`).all(),
    env.DB.prepare(`SELECT client_id,type,value,contact_name,is_primary,sort_order FROM client_contacts ORDER BY client_id,type,sort_order,id`).all(),
  ]);
  const contactsByClient = new Map();
  for (const contact of contactRows.results || []) {
    const grouped = contactsByClient.get(contact.client_id) || { emails: [], phones: [] };
    grouped[contact.type === 'email' ? 'emails' : 'phones'].push({
      value: contact.value, contact_name: contact.contact_name, is_primary: Boolean(contact.is_primary),
    });
    contactsByClient.set(contact.client_id, grouped);
  }
  const clients = (clientRows.results || []).map(client => {
    const grouped = contactsByClient.get(client.id) || { emails: [], phones: [] };
    if (!grouped.emails.length && client.email) grouped.emails.push({ value: client.email, contact_name: client.name, is_primary: true });
    if (!grouped.phones.length && client.phone) grouped.phones.push({ value: client.phone, contact_name: client.name, is_primary: true });
    return { ...client, ...grouped };
  });
  return json({ clients });
}

export async function onRequestPost({ request, env }) {
  try {
    const denied = await requireAuth(request, env); if (denied) return denied;
    const client = fields(await readJson(request));
    const duplicate = await env.DB.prepare(`SELECT id FROM clients WHERE lower(email)=lower(?) AND is_active=1`).bind(client.email).first();
    if (duplicate) throw new HttpError(409, 'Já existe um cliente ativo com este e-mail');
    const created = await env.DB.prepare(`INSERT INTO clients (name,email,phone,document,address,city,state,postal_code,notes) VALUES (?,?,?,?,?,?,?,?,?) RETURNING id`)
      .bind(client.name,client.email,client.phone,client.document,client.address,client.city,client.state,client.postal_code,client.notes).first();
    const statements = contactStatements(env, created.id, client);
    if (statements.length) await env.DB.batch(statements);
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
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM client_contacts WHERE client_id=?`).bind(id),
      ...contactStatements(env, id, client),
    ]);
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
