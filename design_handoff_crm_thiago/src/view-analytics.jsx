// view-analytics.jsx — métricas + gráficos em CSS

const { useState: useStateA } = React;

// Gráfico de linha/área (SVG) com 2 séries
function AreaChart({ a, b, height = 220 }) {
  const max = Math.max(...a, ...b) * 1.1;
  const w = 760;
  const pts = (arr) => arr.map((v, i) => [(i / (arr.length - 1)) * w, height - (v / max) * (height - 24)]);
  const toPath = (p) => p.map((pt, i) => (i ? "L" : "M") + pt[0].toFixed(1) + " " + pt[1].toFixed(1)).join(" ");
  const toArea = (p) => toPath(p) + ` L${w} ${height} L0 ${height} Z`;
  const pa = pts(a), pb = pts(b);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1="0" x2={w} y1={height - g * (height - 24)} y2={height - g * (height - 24)}
          stroke="var(--border-faint)" strokeWidth="1" />
      ))}
      <path d={toArea(pa)} fill="url(#fillA)" />
      <path d={toPath(pb)} fill="none" stroke="var(--text-3)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      <path d={toPath(pa)} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pa.map((pt, i) => i === pa.length - 1 && (
        <circle key={i} cx={pt[0]} cy={pt[1]} r="4" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2.5" />
      ))}
    </svg>
  );
}

// Donut (conic-gradient) para fontes de tráfego
function Donut({ items }) {
  let acc = 0;
  const hueColor = (h) => `hsl(${h} 60% 55%)`;
  const stops = items.map((it) => {
    const start = acc; acc += it.pct;
    return `${hueColor(it.hue)} ${start}% ${acc}%`;
  }).join(", ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 116, height: 116, flexShrink: 0 }}>
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: `conic-gradient(${stops})` }} />
        <div style={{ position: "absolute", inset: 14, borderRadius: "50%", background: "var(--surface-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span className="t-mono" style={{ fontSize: 20, fontWeight: 600 }}>12,6k</span>
          <span className="t-xs t-faint">visitas</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        {items.map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: hueColor(it.hue), flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--text-2)" }}>{it.label}</span>
            <span className="t-mono" style={{ fontWeight: 600 }}>{it.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsView() {
  const [range, setRange] = useStateA("14d");
  return (
    <div style={{ padding: "var(--gutter)", display: "flex", flexDirection: "column", gap: "var(--stack)" }}>
      {/* KPIs */}
      <div className="grid-kpi">
        {ANALYTICS.kpis.map((k) => (
          <KpiCard key={k.id} icon={k.icon} label={k.label} value={k.value} delta={k.delta} deltaUnit={k.deltaUnit} />
        ))}
      </div>

      {/* Tráfego */}
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <h2 className="t-h2">Tráfego do perfil</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--text-2)" }}>
                <span style={{ width: 14, height: 3, borderRadius: 2, background: "var(--accent)" }} /> Visitas
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--text-2)" }}>
                <span style={{ width: 14, height: 0, borderTop: "2px dashed var(--text-3)" }} /> Cliques
              </span>
            </div>
          </div>
          <Tabs value={range} onChange={setRange} tabs={[
            { value: "7d", label: "7d" }, { value: "14d", label: "14d" }, { value: "30d", label: "30d" },
          ]} />
        </div>
        <AreaChart a={ANALYTICS.traffic} b={ANALYTICS.trafficClicks} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          {["16 mai", "19 mai", "22 mai", "25 mai", "28 mai", "30 mai"].map((d) => (
            <span key={d} className="t-xs t-faint">{d}</span>
          ))}
        </div>
      </Card>

      <div className="grid-analytics-2">
        {/* Top links */}
        <Card>
          <SectionTitle>Links mais clicados</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ANALYTICS.topLinks.map((l, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: "var(--text)" }}>{l.title}</span>
                  <span className="t-mono t-muted">{l.clicks.toLocaleString("pt-BR")}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--surface-4)", overflow: "hidden" }}>
                  <div style={{ width: l.pct + "%", height: "100%", borderRadius: 3, background: i === 0 ? "var(--accent)" : "color-mix(in srgb, var(--accent) 55%, var(--surface-4))" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Fontes + dispositivos */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack)" }}>
          <Card>
            <SectionTitle>Fontes de tráfego</SectionTitle>
            <Donut items={ANALYTICS.sources} />
          </Card>
          <Card>
            <SectionTitle>Dispositivos</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ANALYTICS.devices.map((d) => (
                <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <span style={{ width: 64, color: "var(--text-2)" }}>{d.label}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--surface-4)", overflow: "hidden" }}>
                    <div style={{ width: d.pct + "%", height: "100%", borderRadius: 3, background: "var(--accent)" }} />
                  </div>
                  <span className="t-mono t-muted" style={{ width: 34, textAlign: "right" }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AnalyticsView });
