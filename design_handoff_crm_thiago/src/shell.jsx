// shell.jsx — layout do admin: sidebar (5 abas) + topbar

const NAV = [
  { id: "analytics", label: "Analytics", icon: "analytics" },
  { id: "links",     label: "Links",     icon: "link" },
  { id: "portfolio", label: "Portfólio", icon: "portfolio" },
  { id: "leads",     label: "Leads",     icon: "leads" },
  { id: "profile",   label: "Perfil",    icon: "profile" },
];

function NavItem({ item, active, badge, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 11, width: "100%", height: 38, padding: "0 10px",
        borderRadius: "var(--r-md)", fontSize: 13.5, fontWeight: 500,
        color: active ? "var(--text)" : hover ? "var(--text)" : "var(--text-2)",
        background: active ? "var(--surface-3)" : hover ? "var(--surface-2)" : "transparent",
        transition: "background .12s, color .12s", position: "relative",
      }}
    >
      {active && <span style={{ position: "absolute", left: -10, top: 9, bottom: 9, width: 3, borderRadius: 3, background: "var(--accent)" }} />}
      <Icon name={item.icon} size={18} style={{ color: active ? "var(--accent)" : "inherit" }} />
      <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
      {badge != null && (
        <span style={{
          minWidth: 20, height: 20, padding: "0 6px", borderRadius: "var(--r-full)",
          background: active ? "var(--accent)" : "var(--surface-4)", color: active ? "#fff" : "var(--text-2)",
          fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>{badge}</span>
      )}
    </button>
  );
}

function Sidebar({ current, onNavigate, leadCount }) {
  return (
    <aside className="app-sidebar" style={{
      width: "var(--sidebar-w)", flexShrink: 0, height: "100%", background: "var(--surface-1)",
      borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column",
      padding: "16px 14px",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px 16px" }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "-0.03em" }}>t</span>
        </div>
        <div style={{ lineHeight: 1.2, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{OWNER.name}</div>
          <div className="t-xs t-faint" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{OWNER.site}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div className="t-label" style={{ padding: "8px 10px 6px" }}>Painel</div>
        {NAV.map((it) => (
          <NavItem key={it.id} item={it} active={current === it.id}
            badge={it.id === "leads" ? leadCount : null}
            onClick={() => onNavigate(it.id)} />
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Ver site público */}
      <a href="#" onClick={(e) => e.preventDefault()}
        style={{
          display: "flex", alignItems: "center", gap: 10, height: 38, padding: "0 10px",
          borderRadius: "var(--r-md)", color: "var(--text-2)", fontSize: 13.5, fontWeight: 500,
          border: "1px solid var(--border)", background: "var(--surface-2)",
        }}>
        <Icon name="globe" size={17} />
        <span style={{ flex: 1 }}>Ver site público</span>
        <Icon name="external" size={14} style={{ color: "var(--text-3)" }} />
      </a>

      {/* Conta */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <Menu align="left" trigger={
          <button style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "6px",
            borderRadius: "var(--r-md)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <Avatar name={OWNER.name} size={30} />
            <div style={{ flex: 1, textAlign: "left", lineHeight: 1.25, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{OWNER.name}</div>
              <div className="t-xs t-faint">Plano Pro</div>
            </div>
            <Icon name="chevronDown" size={15} style={{ color: "var(--text-3)" }} />
          </button>
        } items={[
          { icon: "profile", label: "Editar perfil" },
          { icon: "settings", label: "Configurações" },
          { divider: true },
          { icon: "logout", label: "Sair", danger: true },
        ]} />
      </div>
    </aside>
  );
}

function Topbar({ title, subtitle, actions, children }) {
  return (
    <header className="app-topbar" style={{
      display: "flex", alignItems: "center", gap: 16, padding: "0 var(--gutter)",
      height: 64, borderBottom: "1px solid var(--border)", flexShrink: 0,
      background: "color-mix(in srgb, var(--bg) 82%, transparent)", backdropFilter: "blur(8px)",
      position: "sticky", top: 0, zIndex: 20,
    }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="t-h1">{title}</h1>
        {subtitle && <div className="t-sm t-muted" style={{ marginTop: 1 }}>{subtitle}</div>}
      </div>
      <div style={{ flex: 1 }} />
      {children}
      {actions}
    </header>
  );
}

// KPI card reutilizável
function KpiCard({ icon, label, value, delta, deltaUnit = "%" }) {
  const up = delta >= 0;
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="t-sm t-muted">{label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
        <span className="t-display t-mono" style={{ fontSize: 26 }}>{value}</span>
        {delta != null && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12.5, fontWeight: 600,
            color: up ? "var(--green)" : "var(--red)", paddingBottom: 4,
          }}>
            <Icon name={up ? "arrowUp" : "arrowDown"} size={13} strokeWidth={2.2} />
            {up ? "+" : ""}{delta}{deltaUnit}
          </span>
        )}
      </div>
    </Card>
  );
}

// Bottom nav (mobile) — espelha os 5 itens da sidebar
function BottomNav({ current, onNavigate, leadCount }) {
  return (
    <nav className="app-bottomnav">
      {NAV.map((it) => {
        const active = current === it.id;
        return (
          <button key={it.id} className="bnav-item" onClick={() => onNavigate(it.id)}
            style={{ color: active ? "var(--accent)" : "var(--text-3)" }}>
            <span style={{ position: "relative", display: "flex" }}>
              <Icon name={it.icon} size={21} strokeWidth={active ? 1.9 : 1.6} />
              {it.id === "leads" && leadCount > 0 && (
                <span className="bnav-badge">{leadCount}</span>
              )}
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: "-0.01em" }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

Object.assign(window, { Sidebar, Topbar, KpiCard, BottomNav, NAV });
