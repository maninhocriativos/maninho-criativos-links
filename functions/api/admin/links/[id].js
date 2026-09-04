import { requireAuth } from '../_auth.js';
import { color, errorResponse, httpUrl, integer, json, readJson, text } from '../../_utils.js';

const validators = {
  title: v => text(v, { required: true, max: 120 }), url: v => httpUrl(v, { required: true }),
  icon: v => text(v, { max: 16 }), color_from: v => color(v), color_to: v => color(v),
  order_index: v => integer(v, { max: 100_000 }), is_active: v => integer(v, { min: 0, max: 1 }),
};

export async function onRequestPatch({ request, env, params }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const id = integer(params.id, { min: 1 });
    const body = await readJson(request);
    const fields = Object.keys(body).filter(key => validators[key]);
    if (!fields.length) return json({ error: 'Nenhum campo válido' }, 400);
    await env.DB.prepare(`UPDATE links SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`)
      .bind(...fields.map(f => validators[f](body[f])), id).run();
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}

export async function onRequestDelete({ request, env, params }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const id = integer(params.id, { min: 1 });
    await env.DB.prepare(`DELETE FROM links WHERE id = ?`).bind(id).run();
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
