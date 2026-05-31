export async function onRequestPost({ request, env }) {
  try {
    const { type, page, data, session_id, referrer } = await request.json();
    if (!type) return new Response(null, { status: 204 });

    await env.DB.prepare(
      `INSERT INTO analytics_events (type, page, data, session_id, referrer)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      type,
      page || null,
      data ? JSON.stringify(data) : null,
      session_id || null,
      referrer || null
    ).run();

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
