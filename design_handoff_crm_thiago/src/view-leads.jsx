// view-leads.jsx — lista de leads (tabela) + detalhe do contato

const { useState: useStateLe } = React;

function Stars({ n }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map((i) => (
        <Icon key={i} name="star" size={13}
          style={{ color: i <= n ? "var(--amber)" : "var(--surface-4)", fill: i <= n ? "var(--amber)" : "transparent" }} />
      ))}
    </span>
  );
}

/* ---------------- Lista (tabela) ---------------- */
function LeadsTable({ leads, onOpen, filter, setFilter, query, setQuery }) {
  return (
    <div style={{ padding: "var(--gutter)", display: "flex", flexDirection: "column", gap: "var(--stack)" }}>
      {/* Filtros */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Tabs value={filter} onChange={setFilter} tabs={[
          { value: "all", label: "Todos" },
          { value: "new", label: "Novos" },
          { value: "qualified", label: "Qualificados" },
          { value: "negotiation", label: "Negociação" },
          { value: "won", label: "Ganhos" },
        ]} />
        <div style={{ flex: 1 }} />
        <Input icon="search" placeholder="Buscar lead…" value={query} onChange={setQuery} style={{ width: 240 }} />
        <Button variant="default" icon="filter">Filtros</Button>
      </div>

      {/* Tabela */}
      <Card pad={false} style={{ overflow: "hidden" }}>
        <div className="leads-head" style={{
          padding: "0 18px", height: 42, alignItems: "center",
          borderBottom: "1px solid var(--border)", background: "var(--surface-1)",
        }}>
          {["Lead", "Origem", "Status", "Valor", "Recebido", ""].map((h, i) => (
            <span key={i} className="t-label" style={{ textAlign: i === 3 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        {leads.map((lead, idx) => {
          const st = LEAD_STATUS[lead.status];
          return (
            <div key={lead.id} onClick={() => onOpen(lead.id)} className="lead-row"
              style={{
                padding: "0 18px", minHeight: "var(--row-h)", cursor: "pointer",
                borderBottom: idx < leads.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background .1s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-3)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              {/* Lead */}
              <div className="lc-lead" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <Avatar name={lead.name} size={34} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.name}</div>
                  <div className="t-xs t-faint" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.role} · {lead.company}</div>
                </div>
              </div>
              {/* Origem */}
              <span className="t-sm t-muted lc-source" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.source}</span>
              {/* Status */}
              <span className="lc-status"><Badge tone={st.tone} dot>{st.label}</Badge></span>
              {/* Valor */}
              <span className="t-sm t-mono lc-value" style={{ textAlign: "right", fontWeight: 600, color: lead.value ? "var(--text)" : "var(--text-3)" }}>{fmtMoney(lead.value)}</span>
              {/* Recebido */}
              <span className="t-xs t-faint lc-date" style={{ paddingLeft: 16 }}>{lead.lastActivity}</span>
              {/* Ação */}
              <span className="lc-chev" style={{ display: "flex", justifyContent: "flex-end", color: "var(--text-3)" }}><Icon name="chevronRight" size={16} /></span>
            </div>
          );
        })}
        {leads.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-3)" }}>
            <Icon name="leads" size={28} style={{ margin: "0 auto 10px" }} />
            <div className="t-sm">Nenhum lead encontrado</div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Detalhe ---------------- */
function InfoRow({ icon, label, value, copyable }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0" }}>
      <Icon name={icon} size={16} style={{ color: "var(--text-3)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="t-xs t-faint">{label}</div>
        <div style={{ fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      </div>
      {copyable && <button title="Copiar" style={{ color: "var(--text-3)", display: "flex", padding: 4 }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}><Icon name="copy" size={14} /></button>}
    </div>
  );
}

function LeadDetail({ lead, onBack, onStatus }) {
  const st = LEAD_STATUS[lead.status];
  const [note, setNote] = useStateLe("");
  return (
    <div style={{ padding: "var(--gutter)" }}>
      {/* Voltar + ações */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 8, marginBottom: "var(--stack)" }}>
        <Button variant="ghost" icon="chevronLeft" onClick={onBack}>Leads</Button>
        <div style={{ flex: 1 }} />
        <Button variant="default" icon="mail">Responder</Button>
        <Button variant="primary" icon="calendar">Agendar call</Button>
        <Menu trigger={<Button variant="default" icon="moreV" />} items={[
          { icon: "checkCircle", label: "Marcar como ganho", onClick: () => onStatus(lead.id, "won") },
          { icon: "x", label: "Marcar como perdido", onClick: () => onStatus(lead.id, "lost") },
          { divider: true },
          { icon: "trash", label: "Excluir lead", danger: true },
        ]} />
      </div>

      <div className="grid-lead-detail">
        {/* Coluna esquerda — perfil */}
        <div className="sticky-side" style={{ display: "flex", flexDirection: "column", gap: "var(--stack)", position: "sticky", top: 88 }}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 4, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <Avatar name={lead.name} size={64} />
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 8 }}>{lead.name}</div>
              <div className="t-sm t-muted">{lead.role}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <Badge tone={st.tone} dot>{st.label}</Badge>
                <Stars n={lead.rating} />
              </div>
            </div>
            <div style={{ paddingTop: 6 }}>
              <InfoRow icon="building" label="Empresa" value={lead.company} />
              <InfoRow icon="mail" label="E-mail" value={lead.email} copyable />
              <InfoRow icon="phone" label="Telefone" value={lead.phone} copyable />
              <InfoRow icon="mapPin" label="Local" value={lead.location} />
              <InfoRow icon="link" label="Origem" value={lead.source} />
              <InfoRow icon="calendar" label="Recebido em" value={new Date(lead.createdAt).toLocaleDateString("pt-BR")} />
            </div>
          </Card>
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="t-xs t-faint">Valor potencial</div>
              <div className="t-mono" style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>{fmtMoney(lead.value)}</div>
            </div>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
              <Icon name="dollar" size={18} />
            </span>
          </Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {lead.tags.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
          </div>
        </div>

        {/* Coluna direita — mensagem + timeline + nota */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack)" }}>
          {/* Mensagem original */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Icon name="mail" size={16} style={{ color: "var(--accent)" }} />
              <h2 className="t-h2">Mensagem recebida</h2>
              <div style={{ flex: 1 }} />
              <span className="t-xs t-faint">via {lead.source}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)", textWrap: "pretty" }}>
              "{lead.message}"
            </p>
          </Card>

          {/* Responder rápido */}
          <Card>
            <SectionTitle>Adicionar nota / resposta</SectionTitle>
            <Textarea value={note} onChange={setNote} placeholder="Escreva uma nota interna ou rascunho de resposta…" rows={3} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <Button variant="ghost" size="md">Salvar nota</Button>
              <Button variant="primary" size="md" icon="send">Enviar resposta</Button>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <SectionTitle>Histórico</SectionTitle>
            <div style={{ position: "relative", paddingLeft: 6 }}>
              {lead.timeline.slice().reverse().map((ev, i, arr) => (
                <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < arr.length - 1 ? 18 : 0, position: "relative" }}>
                  {i < arr.length - 1 && <span style={{ position: "absolute", left: 14, top: 30, bottom: -4, width: 1.5, background: "var(--border)" }} />}
                  <span style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                    background: ev.type === "won" ? "var(--green-soft)" : ev.type === "lost" ? "var(--red-soft)" : "var(--surface-3)",
                    color: ev.type === "won" ? "var(--green)" : ev.type === "lost" ? "var(--red)" : "var(--text-2)",
                    border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name={TIMELINE_ICON[ev.type] || "note"} size={15} />
                  </span>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{ev.title}</span>
                      <span className="t-xs t-faint" style={{ whiteSpace: "nowrap" }}>{ev.date}</span>
                    </div>
                    <div className="t-sm t-muted" style={{ marginTop: 1 }}>{ev.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LeadsTable, LeadDetail });
