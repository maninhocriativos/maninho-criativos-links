// view-portfolio.jsx — grid de projetos/cases

const { useState: useStateP } = React;

function ProjectCard({ p }) {
  const [hover, setHover] = useStateP(false);
  return (
    <Card pad={false} hover
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Thumb placeholder */}
      <div style={{
        height: 156, position: "relative",
        background: `linear-gradient(150deg, hsl(${p.hue} 40% 22%), hsl(${p.hue} 45% 13%))`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: `hsl(${p.hue} 55% 62%)`, opacity: 0.55 }}>
          <Icon name="image" size={30} strokeWidth={1.4} />
        </div>
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          {p.featured && <Badge tone="blue" dot>Destaque</Badge>}
        </div>
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <Badge tone={p.status === "published" ? "green" : "neutral"} dot>
            {p.status === "published" ? "Publicado" : "Rascunho"}
          </Badge>
        </div>
        {hover && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Button size="sm" variant="default" icon="edit">Editar</Button>
            <Button size="sm" variant="default" icon="external" />
          </div>
        )}
      </div>
      {/* Meta */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 600 }}>{p.title}</h3>
          <span className="t-xs t-faint">{p.year}</span>
        </div>
        <div className="t-xs t-faint">{p.category}</div>
        <p className="t-sm t-muted" style={{ marginTop: 2, lineHeight: 1.5, textWrap: "pretty" }}>{p.desc}</p>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <Icon name="eye" size={14} style={{ color: "var(--text-3)" }} />
          <span className="t-xs t-muted t-mono">{p.views ? p.views.toLocaleString("pt-BR") : "—"} views</span>
        </div>
      </div>
    </Card>
  );
}

function PortfolioView() {
  const [filter, setFilter] = useStateP("all");
  const filtered = PROJECTS.filter((p) =>
    filter === "all" ? true : filter === "published" ? p.status === "published" : p.status === "draft"
  );
  return (
    <div style={{ padding: "var(--gutter)", display: "flex", flexDirection: "column", gap: "var(--stack)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Tabs value={filter} onChange={setFilter} tabs={[
          { value: "all", label: `Todos · ${PROJECTS.length}` },
          { value: "published", label: "Publicados" },
          { value: "draft", label: "Rascunhos" },
        ]} />
        <span className="t-sm t-faint">Arraste os cards para reordenar a vitrine</span>
      </div>
      <div className="grid-portfolio">
        {filtered.map((p) => <ProjectCard key={p.id} p={p} />)}
        {/* Add card */}
        <button style={{
          minHeight: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
          border: "1px dashed var(--border-strong)", borderRadius: "var(--r-lg)", color: "var(--text-2)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-2)"; }}>
          <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="plus" size={20} />
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>Novo projeto</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { PortfolioView });
