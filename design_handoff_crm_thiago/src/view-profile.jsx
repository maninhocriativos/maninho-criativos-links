// view-profile.jsx — perfil do dono + configurações

const { useState: useStatePr } = React;

function Field({ label, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-2)" }}>{label}</label>
      {children}
      {hint && <div className="t-xs t-faint">{hint}</div>}
    </div>
  );
}

function SettingRow({ title, desc, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
        <div className="t-sm t-muted" style={{ marginTop: 1 }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

function ProfileView() {
  const [name, setName] = useStatePr(OWNER.name);
  const [handle, setHandle] = useStatePr(OWNER.handle);
  const [role, setRole] = useStatePr(OWNER.role);
  const [bio, setBio] = useStatePr(OWNER.bio);
  const [email, setEmail] = useStatePr(OWNER.email);
  const [location, setLocation] = useStatePr(OWNER.location);
  const [publicProfile, setPublicProfile] = useStatePr(true);
  const [showLeadForm, setShowLeadForm] = useStatePr(true);
  const [emailNotif, setEmailNotif] = useStatePr(true);
  const [weeklyDigest, setWeeklyDigest] = useStatePr(false);

  return (
    <div style={{ padding: "var(--gutter)", maxWidth: 880, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "var(--stack)" }}>
      {/* Cabeçalho do perfil */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 18, borderBottom: "1px solid var(--border)", marginBottom: 20, flexWrap: "wrap" }}>
          <Avatar name={OWNER.name} size={72} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
            <div className="t-sm t-muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{handle} · {OWNER.site}</div>
          </div>
          <Button variant="default" icon="image">Trocar foto</Button>
        </div>

      <div className="grid-form-2">
        <Field label="Nome"><Input value={name} onChange={setName} full /></Field>
          <Field label="Usuário" hint={`linktr.ee-style: /${handle}`}><Input value={handle} onChange={setHandle} full /></Field>
          <Field label="Título / cargo"><Input value={role} onChange={setRole} full /></Field>
          <Field label="Localização"><Input icon="mapPin" value={location} onChange={setLocation} full /></Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Bio" hint={`${bio.length}/160 caracteres`}>
              <Textarea value={bio} onChange={setBio} rows={3} />
            </Field>
          </div>
          <Field label="E-mail de contato"><Input icon="mail" value={email} onChange={setEmail} full /></Field>
          <Field label="Site"><Input icon="globe" value={OWNER.site} onChange={() => {}} full /></Field>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="primary" icon="check">Salvar alterações</Button>
        </div>
      </Card>

      {/* Redes sociais */}
      <Card>
        <SectionTitle action={<Button size="sm" variant="default" icon="plus">Adicionar</Button>}>Redes sociais</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {SOCIALS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < SOCIALS.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
                <Icon name={s.icon} size={17} />
              </span>
              <div style={{ flex: 1, textTransform: "capitalize", fontSize: 13.5, fontWeight: 500 }}>{s.id}</div>
              <span className="t-sm t-muted">{s.url}</span>
              <button style={{ color: "var(--text-3)", display: "flex", padding: 6 }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}><Icon name="edit" size={15} /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* Configurações */}
      <Card>
        <SectionTitle>Visibilidade & privacidade</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", divide: "1px" }}>
          <SettingRow title="Perfil público" desc="Seu perfil fica visível em thiagomendes.design">
            <Toggle checked={publicProfile} onChange={setPublicProfile} />
          </SettingRow>
          <Divider />
          <SettingRow title="Formulário de contato" desc="Mostrar formulário de leads no perfil público">
            <Toggle checked={showLeadForm} onChange={setShowLeadForm} />
          </SettingRow>
        </div>
      </Card>

      <Card>
        <SectionTitle>Notificações</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <SettingRow title="Novos leads por e-mail" desc="Receba um e-mail quando alguém entrar em contato">
            <Toggle checked={emailNotif} onChange={setEmailNotif} />
          </SettingRow>
          <Divider />
          <SettingRow title="Resumo semanal" desc="Métricas de tráfego e cliques toda segunda-feira">
            <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
          </SettingRow>
        </div>
      </Card>

      {/* Zona de perigo */}
      <Card style={{ borderColor: "var(--red-soft)" }}>
        <SettingRow title="Excluir conta" desc="Remove permanentemente seu perfil, links e leads. Não pode ser desfeito.">
          <Button variant="danger" icon="trash">Excluir conta</Button>
        </SettingRow>
      </Card>
    </div>
  );
}

Object.assign(window, { ProfileView });
