export async function onRequestGet({ env, params }) {
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path;
  if (!path || path.includes('..')) return new Response('Not found', { status: 404 });
  const object = await env.STORAGE.get(path);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}
