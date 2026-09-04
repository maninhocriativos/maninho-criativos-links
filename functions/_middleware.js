export async function onRequest(context) {
  const response = await context.next();
  const headers = new Headers(response.headers);
  const pathname = new URL(context.request.url).pathname;
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  if (/^\/(admin(?:\.html|\.js|\.css)?|login(?:\.html)?)\/?$/.test(pathname)) {
    headers.set('Cache-Control', 'no-store, max-age=0');
  }
  if (new URL(context.request.url).protocol === 'https:') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
