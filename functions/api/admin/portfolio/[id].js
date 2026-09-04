import { requireAuth } from '../_auth.js';
import { errorResponse, httpUrl, integer, json, readJson, text } from '../../_utils.js';

function mediaUrl(value) { const v = text(value, { max: 2_048 }); return v.startsWith('/') ? v : httpUrl(v); }
const validators = {
  title: v => text(v, { required: true, max: 150 }), category: v => text(v, { required: true, max: 100 }),
  description: v => text(v, { max: 2_000 }), image_url: mediaUrl, image_mobile_url: mediaUrl,
  project_url: v => httpUrl(v), order_index: v => integer(v, { max: 100_000 }),
  is_active: v => integer(v, { min: 0, max: 1 }),
};

export async function onRequestPatch({ request, env, params }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const id = integer(params.id, { min: 1 });
    const body = await readJson(request);
    const fields = Object.keys(body).filter(key => validators[key]);
    if (!fields.length) return json({ error: 'Nenhum campo válido' }, 400);
    await env.DB.prepare(`UPDATE portfolio SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`)
      .bind(...fields.map(f => validators[f](body[f])), id).run();
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}

export async function onRequestDelete({ request, env, params }) {
  const deny = await requireAuth(request, env); if (deny) return deny;
  try {
    const id = integer(params.id, { min: 1 });
    await env.DB.prepare(`DELETE FROM portfolio WHERE id = ?`).bind(id).run();
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
