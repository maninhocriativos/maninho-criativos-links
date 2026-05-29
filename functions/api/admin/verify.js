import { requireAuth } from './_auth.js';

// GET /api/admin/verify
export async function onRequestGet({ request, env }) {
  const deny = requireAuth(request, env);
  if (deny) return deny;
  return Response.json({ ok: true });
}
