// view-links.jsx — gerenciar links (linktree), com toggle, reorder e stats

const { useState: useStateL } = React;

function LinkRow({ link, onToggle, onDragStart, onDragOver, onDrop, dragging }) {
  const [hover, setHover] = useStateL(false);
  return (
    <div
      draggable
      onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
        background: dragging ? "var(--surface-3)" : "var(--surface-2)",
        border: `1px solid ${dragging ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--r-lg)", opacity: link.active ? 1 : 0.62,
        transition: "border-color .12s, opacity .14s",
      }}
    >
      <button style={{ color: hover ? "var(--text-2)" : "var(--text-3)", cursor: "grab", display: "flex" }} title="Arrastar para reordenar">
        <Icon name="grip" size={18} />
      </button>
      <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)", flexShrink: 0 }}>
        <Icon name={link.icon} size={17} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{link.title}</div>
        <div className="t-xs t-faint" style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2, minWidth: 0 }}>
          <Icon name="link" size={11} style={{ flexShrink: 0 }} /> <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{link.url}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", marginRight: 4 }}>
        <div className="t-mono" style={{ fontSize: 14, fontWeight: 600 }}>{link.clicks.toLocaleString("pt-BR")}</div>
        <div className="t-xs t-faint">cliques</div>
      </div>
      <div style={{ width: 1, height: 26, background: "var(--border)" }} />
      <Toggle checked={link.active} onChange={() => onToggle(link.id)} />
      <Menu trigger={
        <button style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-3)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <Icon name="moreV" size={17} />
        </button>
      } items={[
        { icon: "edit", label: "Editar" },
        { icon: "copy", label: "Copiar URL" },
        { icon: "external", label: "Abrir link" },
        { divider: true },
        { icon: "trash", label: "Excluir", danger: true },
      ]} />
    </div>
  );
}

function LinksView() {
  const [links, setLinks] = useStateL(LINKS);
  const [dragId, setDragId] = useStateL(null);

  const toggle = (id) => setLinks((ls) => ls.map((l) => l.id === id ? { ...l, active: !l.active } : l));

  const onDrop = (id) => {
    if (!dragId || dragId === id) return setDragId(null);
    setLinks((ls) => {
      const from = ls.findIndex((l) => l.id === dragId);
      const to = ls.findIndex((l) => l.id === id);
      const copy = [...ls];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
    setDragId(null);
  };

  const activeCount = links.filter((l) => l.active).length;
  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);

  return (
    <div className="grid-links" style={{ padding: "var(--gutter)" }}>
      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <div className="t-sm t-muted">{activeCount} de {links.length} ativos · arraste para reordenar</div>
        </div>
        {links.map((l) => (
          <LinkRow key={l.id} link={l}
            onToggle={toggle}
            dragging={dragId === l.id}
            onDragStart={() => setDragId(l.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(l.id)}
          />
        ))}
        <button style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48,
          border: "1px dashed var(--border-strong)", borderRadius: "var(--r-lg)", color: "var(--text-2)",
          fontSize: 13.5, fontWeight: 500, marginTop: 2,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-2)"; }}>
          <Icon name="plus" size={16} /> Adicionar link
        </button>
      </div>

      {/* Preview do mobile */}
      <div className="sticky-side" style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="t-label" style={{ paddingLeft: 4 }}>Preview ao vivo</div>
        <div style={{
          background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 26,
          padding: 12, boxShadow: "var(--shadow-md)",
        }}>
          <div style={{
            background: "radial-gradient(120% 80% at 50% 0%, #16161a, var(--bg))", borderRadius: 18,
            padding: "26px 16px 22px", minHeight: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <Avatar name={OWNER.name} size={60} />
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 10 }}>@{OWNER.handle}</div>
            <div className="t-xs t-muted" style={{ textAlign: "center", maxWidth: 200, marginBottom: 4 }}>{OWNER.role}</div>
            <div style={{ display: "flex", gap: 14, margin: "8px 0 16px" }}>
              {SOCIALS.map((s) => (
                <span key={s.id} style={{ color: "var(--text-2)" }}><Icon name={s.icon} size={18} /></span>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, width: "100%" }}>
              {links.filter((l) => l.active).map((l) => (
                <div key={l.id} style={{
                  display: "flex", alignItems: "center", gap: 10, height: 42, padding: "0 14px",
                  background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                  fontSize: 13, fontWeight: 500,
                }}>
                  <Icon name={l.icon} size={15} style={{ color: "var(--text-2)", flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Card pad={false} style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="t-sm t-muted">Total de cliques</span>
          <span className="t-mono" style={{ fontWeight: 600 }}>{totalClicks.toLocaleString("pt-BR")}</span>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { LinksView });
