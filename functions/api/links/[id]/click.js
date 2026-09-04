import { errorResponse, rateLimit } from '../../_utils.js';

export async function onRequestPost(context) {
  const { env, params, request } = context;
  try {
    await rateLimit(env, request, 'link-click', 100, 60 * 60);
    const id = Number(params.id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: 'ID inválido' }, { status: 400 });
    const write = env.DB.prepare(
      `UPDATE links SET click_count = click_count + 1 WHERE id = ? AND is_active = 1`
    ).bind(id).run();
    context.waitUntil(write);
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
