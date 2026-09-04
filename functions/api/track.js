import { errorResponse, rateLimit, readJson, text } from './_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    await rateLimit(env, request, 'analytics', 120, 60 * 60);
    const body = await readJson(request, 4_096);
    const type = ['view', 'click', 'modal_open'].includes(body.type) ? body.type : null;
    if (!type) return new Response(null, { status: 204 });
    const page = ['links', 'portfolio'].includes(body.page) ? body.page : null;
    const sessionId = text(body.session_id, { max: 100 });
    const referrer = text(body.referrer, { max: 2_048 });
    const data = body.data && typeof body.data === 'object' ? JSON.stringify(body.data).slice(0, 2_048) : null;
    const write = env.DB.prepare(
      `INSERT INTO analytics_events (type, page, data, session_id, referrer) VALUES (?, ?, ?, ?, ?)`
    ).bind(type, page, data, sessionId || null, referrer || null).run();
    context.waitUntil(Promise.all([
      write,
      env.DB.prepare(`DELETE FROM analytics_events WHERE created_at < datetime('now', '-180 days')`).run(),
    ]));
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error?.status === 429) return errorResponse(error);
    console.error(JSON.stringify({ level: 'error', route: 'track', message: error?.message || 'unknown' }));
    return new Response(null, { status: 204 });
  }
}
