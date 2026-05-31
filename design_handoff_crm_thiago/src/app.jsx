// app.jsx — roteamento entre abas + topbars + tweaks

const { useState: useStateApp, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "accent": "#0070f3",
  "radius": 8
}/*EDITMODE-END*/;

const ACCENTS = {
  "#0070f3": { hover: "#1a85ff", press: "#0061d6" },   // Vercel blue
  "#8e6cf0": { hover: "#a084f5", press: "#7a5ae0" },   // Linear violet
  "#30a46c": { hover: "#3cb579", press: "#28925d" },   // Railway green
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateApp("analytics");
  const [openLead, setOpenLead] = useStateApp(null);
  const [leads, setLeads] = useStateApp(LEADS);
  const [filter, setFilter] = useStateApp("all");
  const [query, setQuery] = useStateApp("");

  // aplica tweaks ao :root
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-density", t.density === "compact" ? "compact" : "comfortable");
    const a = ACCENTS[t.accent] || ACCENTS["#0070f3"];
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-hover", a.hover);
    root.style.setProperty("--accent-press", a.press);
    root.style.setProperty("--accent-soft", t.accent + "24");
    root.style.setProperty("--accent-ring", t.accent + "66");
    root.style.setProperty("--r-md", t.radius + "px");
    root.style.setProperty("--r-sm", Math.max(4, t.radius - 2) + "px");
    root.style.setProperty("--r-lg", (t.radius + 4) + "px");
  }, [t]);

  const newLeadCount = leads.filter((l) => l.status === "new").length;

  const filteredLeads = useMemo(() => {
    let r = leads;
    if (filter !== "all") r = r.filter((l) => l.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((l) => (l.name + l.company + l.role + l.source).toLowerCase().includes(q));
    }
    return r;
  }, [leads, filter, query]);

  const setLeadStatus = (id, status) => {
    setLeads((ls) => ls.map((l) => l.id === id ? { ...l, status } : l));
  };

  // título/subtítulo + ação da topbar por aba
  const topbars = {
    analytics: { title: "Analytics", subtitle: "Últimos 14 dias · atualizado há 5 min",
      actions: <><Button variant="default" icon="download">Exportar</Button></> },
    links: { title: "Links", subtitle: "Gerencie os links do seu perfil público",
      actions: <Button variant="primary" icon="plus">Novo link</Button> },
    portfolio: { title: "Portfólio", subtitle: `${PROJECTS.length} projetos na vitrine`,
      actions: <Button variant="primary" icon="plus">Novo projeto</Button> },
    leads: { title: "Leads", subtitle: `${leads.length} contatos · ${newLeadCount} novos`,
      actions: <Button variant="primary" icon="download">Exportar CSV</Button> },
    profile: { title: "Perfil", subtitle: "Seus dados públicos e configurações da conta", actions: null },
  };

  const currentLead = openLead ? leads.find((l) => l.id === openLead) : null;
  const tb = topbars[route];

  return (
    <div className="app-shell">
      <Sidebar current={route} leadCount={newLeadCount}
        onNavigate={(r) => { setRoute(r); setOpenLead(null); }} />

      <main className="app-main" style={{ minWidth: 0 }}>
        {/* topbar — esconde no detalhe de lead (ele tem o próprio header) */}
        {!(route === "leads" && currentLead) && (
          <Topbar title={tb.title} subtitle={tb.subtitle} actions={tb.actions} />
        )}

        <div className="app-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {route === "analytics" && <AnalyticsView />}
          {route === "links" && <LinksView />}
          {route === "portfolio" && <PortfolioView />}
          {route === "leads" && (currentLead
            ? <LeadDetail lead={currentLead} onBack={() => setOpenLead(null)} onStatus={setLeadStatus} />
            : <LeadsTable leads={filteredLeads} onOpen={setOpenLead}
                filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} />
          )}
          {route === "profile" && <ProfileView />}
        </div>
      </main>

      <BottomNav current={route} leadCount={newLeadCount}
        onNavigate={(r) => { setRoute(r); setOpenLead(null); }} />

      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakRadio label="Densidade" value={t.density}
          options={["comfortable", "compact"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakSlider label="Raio das bordas" value={t.radius} min={2} max={16} step={1} unit="px"
          onChange={(v) => setTweak("radius", v)} />
        <TweakSection label="Cor de acento" />
        <TweakColor label="Acento" value={t.accent}
          options={Object.keys(ACCENTS)}
          onChange={(v) => setTweak("accent", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
