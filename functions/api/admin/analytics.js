const TOKEN = 'maninho-admin-2024';

export async function onRequestGet({ request, env }) {
  const auth = request.headers.get('Authorization') || '';
  if (auth !== `Bearer ${TOKEN}`) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const [views, clicks, modal, byPage, byDay, topLinks] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) as n FROM analytics_events WHERE type='view'`).first(),
    env.DB.prepare(`SELECT COUNT(*) as n FROM analytics_events WHERE type='click'`).first(),
    env.DB.prepare(`SELECT COUNT(*) as n FROM analytics_events WHERE type='modal_open'`).first(),
    env.DB.prepare(`SELECT page, COUNT(*) as n FROM analytics_events WHERE type='view' GROUP BY page ORDER BY n DESC`).all(),
    env.DB.prepare(`SELECT DATE(created_at) as day, COUNT(*) as n FROM analytics_events WHERE type='view' AND created_at >= DATE('now','-30 days') GROUP BY day ORDER BY day DESC`).all(),
    env.DB.prepare(`SELECT data, COUNT(*) as n FROM analytics_events WHERE type='click' AND data IS NOT NULL GROUP BY data ORDER BY n DESC LIMIT 20`).all(),
  ]);

  const todayQ = await env.DB.prepare(
    `SELECT COUNT(*) as n FROM analytics_events WHERE type='view' AND DATE(created_at)=DATE('now')`
  ).first();

  const sessionsQ = await env.DB.prepare(
    `SELECT COUNT(DISTINCT session_id) as n FROM analytics_events WHERE type='view' AND session_id IS NOT NULL`
  ).first();

  return Response.json({
    total_views: views?.n || 0,
    today_views: todayQ?.n || 0,
    total_clicks: clicks?.n || 0,
    modal_opens: modal?.n || 0,
    unique_sessions: sessionsQ?.n || 0,
    by_page: byPage.results || [],
    by_day: byDay.results || [],
    top_links: (topLinks.results || []).map(r => {
      try { return { ...JSON.parse(r.data), clicks: r.n }; } catch { return { label: r.data, clicks: r.n }; }
    }),
  });
}
