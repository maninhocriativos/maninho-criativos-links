import { errorResponse, json, rateLimit, readJson, text } from './_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    await rateLimit(env, request, 'lead', 5, 60 * 60);
    const body = await readJson(request);
    const name = text(body.name, { required: true, max: 100 });
    const phone = text(body.phone, { required: true, max: 30 });
    const instagram = text(body.instagram, { max: 100 });
    const service = text(body.service, { max: 120 });
    const message = text(body.message, { max: 2_000 });
    const page = ['links', 'portfolio'].includes(body.page) ? body.page : 'links';
    if (!/^[+\d\s().-]{8,30}$/.test(phone)) return json({ error: 'WhatsApp inválido' }, 400);
    await env.DB.prepare(
      `INSERT INTO leads (name, phone, instagram, service, message, page) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(name, phone, instagram || null, service || null, message || null, page).run();
    return json({ ok: true }, 201);
  } catch (error) { return errorResponse(error); }
}
