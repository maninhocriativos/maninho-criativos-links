// Verifica Authorization: Bearer <token>
// Token simples: sha256 de ADMIN_PASSWORD + salt armazenado como env var ADMIN_TOKEN
export function requireAuth(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.replace('Bearer ', '').trim();
  if (!token || token !== env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null; // ok
}
