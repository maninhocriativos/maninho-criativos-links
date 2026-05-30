// Endpoint para gerar screenshots via Puppeteer
// GET /api/screenshot?url=https://example.com&width=1200

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    const width = url.searchParams.get('width') || '1200';

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'url parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Usar Thum.io como fallback (é mais confiável)
    // Formato: https://image.thum.io/get/[params]/https://example.com
    const thumUrl = `https://image.thum.io/get/width/${width}/https://${targetUrl.replace(/^https?:\/\//, '')}`;

    // Redirecionar para a imagem do Thum.io
    return Response.redirect(thumUrl, 302);
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
