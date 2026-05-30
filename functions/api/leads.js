export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { name, phone, instagram, service, message, page } = body;

    if (!name || !phone) {
      return Response.json({ error: 'Nome e WhatsApp são obrigatórios' }, { status: 400 });
    }

    await env.DB.prepare(
      `INSERT INTO leads (name, phone, instagram, service, message, page)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      name.trim(),
      phone.trim(),
      instagram?.trim() || null,
      service?.trim() || null,
      message?.trim() || null,
      page || 'links'
    ).run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
