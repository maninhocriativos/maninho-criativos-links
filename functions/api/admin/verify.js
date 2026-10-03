import { getAuthSession, requireAuth } from './_auth.js';

// GET /api/admin/verify
export async function onRequestGet({ request, env }) {
  const deny = await requireAuth(request, env);
  if (deny) return deny;
  const session = await getAuthSession(request, env);
  return Response.json({ ok: true, role: session?.user_id ? session.role : 'owner', name: session?.name || 'Maninho' });
}
