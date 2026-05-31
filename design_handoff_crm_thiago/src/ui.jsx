// ui.jsx — componentes base do design system
// Tamanhos fixos: botões 28/34/38px · inputs 34px · grid 8px

const { useState, useRef, useEffect } = React;

/* ---------------- Button ---------------- */
function Button({ children, variant = "default", size = "md", icon, iconRight, onClick, disabled, style, full, title }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const H = { sm: "var(--h-sm)", md: "var(--h-md)", lg: "var(--h-lg)" }[size];
  const pad = { sm: "0 10px", md: "0 14px", lg: "0 18px" }[size];
  const fs  = { sm: 13, md: 13.5, lg: 14 }[size];

  const variants = {
    primary: {
      bg: press ? "var(--accent-press)" : hover ? "var(--accent-hover)" : "var(--accent)",
      color: "var(--text-on-accent)", border: "1px solid transparent", fontWeight: 500,
    },
    default: {
      bg: hover ? "var(--surface-4)" : "var(--surface-3)",
      color: "var(--text)", border: "1px solid var(--border)", fontWeight: 500,
    },
    ghost: {
      bg: hover ? "var(--surface-3)" : "transparent",
      color: hover ? "var(--text)" : "var(--text-2)", border: "1px solid transparent", fontWeight: 500,
    },
    outline: {
      bg: hover ? "var(--surface-3)" : "transparent",
      color: "var(--text)", border: "1px solid var(--border-strong)", fontWeight: 500,
    },
    danger: {
      bg: hover ? "rgba(229,72,77,0.16)" : "transparent",
      color: "var(--red)", border: "1px solid var(--border)", fontWeight: 500,
    },
  };
  const v = variants[variant] || variants.default;
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        height: H, padding: icon && !children ? 0 : pad, width: icon && !children ? H : (full ? "100%" : "auto"),
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        background: v.bg, color: v.color, border: v.border, borderRadius: "var(--r-md)",
        fontSize: fs, fontWeight: v.fontWeight, fontFamily: "var(--font)",
        whiteSpace: "nowrap", transition: "background .14s, color .14s, border-color .14s",
        opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? "none" : "auto", ...style,
      }}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 15} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 15} />}
    </button>
  );
}

/* ---------------- Input ---------------- */
function Input({ value, onChange, placeholder, icon, type = "text", style, onKeyDown, full, autoFocus }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, height: "var(--h-md)",
      padding: icon ? "0 12px 0 10px" : "0 12px",
      background: "var(--surface-1)", borderRadius: "var(--r-md)",
      border: `1px solid ${focus ? "var(--accent)" : "var(--border)"}`,
      boxShadow: focus ? "0 0 0 3px var(--accent-soft)" : "none",
      transition: "border-color .14s, box-shadow .14s", width: full ? "100%" : "auto", ...style,
    }}>
      {icon && <Icon name={icon} size={15} style={{ color: "var(--text-3)" }} />}
      <input
        type={type} value={value} placeholder={placeholder} autoFocus={autoFocus}
        onChange={(e) => onChange && onChange(e.target.value)} onKeyDown={onKeyDown}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
          color: "var(--text)", fontSize: 13.5, fontFamily: "var(--font)",
        }}
      />
    </div>
  );
}

/* ---------------- Textarea ---------------- */
function Textarea({ value, onChange, placeholder, rows = 4, style }) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea
      value={value} placeholder={placeholder} rows={rows}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        width: "100%", padding: "9px 12px", background: "var(--surface-1)",
        borderRadius: "var(--r-md)", border: `1px solid ${focus ? "var(--accent)" : "var(--border)"}`,
        boxShadow: focus ? "0 0 0 3px var(--accent-soft)" : "none",
        color: "var(--text)", fontSize: 13.5, fontFamily: "var(--font)", lineHeight: 1.55,
        resize: "vertical", outline: "none", transition: "border-color .14s, box-shadow .14s", ...style,
      }}
    />
  );
}

/* ---------------- Badge ---------------- */
const BADGE_TONES = {
  neutral: { bg: "var(--surface-4)", color: "var(--text-2)", dot: "var(--text-3)" },
  blue:    { bg: "var(--accent-soft)", color: "#5aa9ff", dot: "var(--accent)" },
  green:   { bg: "var(--green-soft)", color: "#4cc38a", dot: "var(--green)" },
  amber:   { bg: "var(--amber-soft)", color: "#e9b949", dot: "var(--amber)" },
  red:     { bg: "var(--red-soft)", color: "#f06a6f", dot: "var(--red)" },
  violet:  { bg: "var(--violet-soft)", color: "#a78bf6", dot: "var(--violet)" },
};
function Badge({ children, tone = "neutral", dot = false, style }) {
  const t = BADGE_TONES[tone] || BADGE_TONES.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: dot ? "0 9px 0 8px" : "0 9px",
      background: t.bg, color: t.color, borderRadius: "var(--r-full)",
      fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.dot }} />}
      {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */
const AVATAR_HUES = [210, 150, 280, 30, 340, 190, 110, 250];
function Avatar({ name = "", size = 34, src, style }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  const hue = AVATAR_HUES[(name.charCodeAt(0) || 0) % AVATAR_HUES.length];
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", ...style }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(160deg, hsl(${hue} 45% 26%), hsl(${hue} 50% 18%))`,
      color: `hsl(${hue} 70% 78%)`, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, letterSpacing: "-0.02em",
      border: "1px solid var(--border)", ...style,
    }}>
      {initials || "?"}
    </div>
  );
}

/* ---------------- Toggle ---------------- */
function Toggle({ checked, onChange, size = "md" }) {
  const w = size === "sm" ? 32 : 38, h = size === "sm" ? 18 : 22, knob = h - 6;
  return (
    <button
      onClick={() => onChange && onChange(!checked)}
      style={{
        width: w, height: h, borderRadius: "var(--r-full)", padding: 0, flexShrink: 0,
        background: checked ? "var(--accent)" : "var(--surface-4)",
        border: `1px solid ${checked ? "var(--accent)" : "var(--border-strong)"}`,
        position: "relative", transition: "background .16s, border-color .16s",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: checked ? w - knob - 4 : 2,
        width: knob, height: knob, borderRadius: "50%", background: "#fff",
        transition: "left .16s cubic-bezier(.4,0,.2,1)", boxShadow: "0 1px 2px rgba(0,0,0,.4)",
      }} />
    </button>
  );
}

/* ---------------- Card ---------------- */
function Card({ children, style, pad = true, hover = false, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)}
      style={{
        background: "var(--surface-2)", border: `1px solid ${h ? "var(--border-strong)" : "var(--border)"}`,
        borderRadius: "var(--r-lg)", padding: pad ? "var(--card-pad)" : 0,
        transition: "border-color .14s, transform .14s", cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------- Tabs (pill segmentado) ---------------- */
function Tabs({ tabs, value, onChange, style }) {
  return (
    <div className="tabs-pill" style={{ display: "inline-flex", gap: 2, padding: 3, background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", maxWidth: "100%", overflowX: "auto", ...style }}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button key={t.value} onClick={() => onChange(t.value)}
            style={{
              height: 28, padding: "0 12px", borderRadius: 6, fontSize: 13, fontWeight: 500,
              flexShrink: 0, whiteSpace: "nowrap",
              background: active ? "var(--surface-4)" : "transparent",
              color: active ? "var(--text)" : "var(--text-2)",
              transition: "background .12s, color .12s",
            }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Section heading ---------------- */
function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--s-3)" }}>
      <h2 className="t-h2">{children}</h2>
      {action}
    </div>
  );
}

/* ---------------- Dropdown menu ---------------- */
function Menu({ trigger, items, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", [align]: 0, zIndex: 50, minWidth: 168,
          background: "var(--surface-3)", border: "1px solid var(--border-strong)",
          borderRadius: "var(--r-md)", boxShadow: "var(--shadow-lg)", padding: 4,
        }}>
          {items.map((it, i) => it.divider ? (
            <div key={i} style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
          ) : (
            <button key={i} onClick={() => { setOpen(false); it.onClick && it.onClick(); }}
              style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%", height: 32, padding: "0 9px",
                borderRadius: 6, fontSize: 13, color: it.danger ? "var(--red)" : "var(--text)",
                textAlign: "left",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-4)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              {it.icon && <Icon name={it.icon} size={15} style={{ color: it.danger ? "var(--red)" : "var(--text-2)" }} />}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Empty / divider helpers ---------------- */
function Divider({ style }) { return <div style={{ height: 1, background: "var(--border)", ...style }} />; }

Object.assign(window, { Button, Input, Textarea, Badge, Avatar, Toggle, Card, Tabs, SectionTitle, Menu, Divider, BADGE_TONES });
