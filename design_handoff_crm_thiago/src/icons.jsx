// icons.jsx — biblioteca de ícones SVG (stroke 1.6, viewBox 24, currentColor)
// Estilo consistente tipo Feather/Lucide. Sem emojis.

const ICON_PATHS = {
  analytics: <><path d="M3 3v18h18"/><path d="M7 15l3.5-4 3 2.5L21 6"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1.1-1.1"/></>,
  portfolio: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 4v5"/></>,
  leads: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  more: <><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></>,
  moreV: <><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></>,
  external: <><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  click: <><path d="M9 3.5 4 9l5.5 1.5L11 16l3.5-5L20 9.5 9 3.5Z" fill="none"/><path d="m13 13 5 7"/></>,
  cursor: <><path d="m4 4 7 17 2.5-7L20.5 11 4 4Z"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  phone: <><path d="M16.5 21A15.5 15.5 0 0 1 3 7.5 2 2 0 0 1 5 5.5h2.3a1.5 1.5 0 0 1 1.5 1.3l.5 2.5a1.5 1.5 0 0 1-.5 1.4L7.5 13a13 13 0 0 0 4 4l1.8-1.8a1.5 1.5 0 0 1 1.4-.5l2.5.5a1.5 1.5 0 0 1 1.3 1.5V20a1 1 0 0 1-1 1Z"/></>,
  calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></>,
  check: <><path d="m4 12 5 5L20 6"/></>,
  checkCircle: <><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5L16 9"/></>,
  chevronDown: <><path d="m6 9 6 6 6-6"/></>,
  chevronRight: <><path d="m9 6 6 6-6 6"/></>,
  chevronLeft: <><path d="m15 6-6 6 6 6"/></>,
  arrowUp: <><path d="M12 19V5M6 11l6-6 6 6"/></>,
  arrowDown: <><path d="M12 5v14M6 13l6 6 6-6"/></>,
  arrowUpRight: <><path d="M7 17 17 7M9 7h8v8"/></>,
  trendUp: <><path d="M22 7 13.5 15.5l-4-4L2 19"/><path d="M16 7h6v6"/></>,
  grip: <><circle cx="9" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="15" cy="18" r="1.3"/></>,
  trash: <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></>,
  filter: <><path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/></>,
  x: <><path d="M6 6 18 18M18 6 6 18"/></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 18 5-5 4 3.5 3-2.5 5 4.5"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.5 21a2 2 0 0 1-3 0"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H23a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></>,
  star: <><path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17l-5.4 2.8 1.2-6L3.3 9.4l6.1-.8L12 3Z"/></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 21v-4h6v4M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01"/></>,
  mapPin: <><path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  tag: <><path d="M3 11V4a1 1 0 0 1 1-1h7l9 9-8 8-9-9Z"/><circle cx="7.5" cy="7.5" r="1.3"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  note: <><path d="M4 4h16v12l-4 4H4V4Z"/><path d="M14 20v-4h4"/></>,
  send: <><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></>,
  dollar: <><path d="M12 2v20M17 6.5c0-2-2-3.5-5-3.5s-5 1.3-5 3.4S9 9.5 12 10s5 1 5 3.5-2 3.5-5 3.5-5-1.5-5-3.5"/></>,
  users2: <><circle cx="8" cy="9" r="4"/><path d="M2 21v-1a6 6 0 0 1 12 0v1"/><path d="M17 11a4 4 0 1 0-3-7"/><path d="M22 21v-1a6 6 0 0 0-4-5.7"/></>,
  // social
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></>,
  github: <><path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 5v-3.5a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.5 2.3 5.5 2.6 5.5 2.6a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9c0 4.6 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21"/></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 17v-7"/></>,
  dribbble: <><circle cx="12" cy="12" r="9"/><path d="M5 6.5c4 4 9 6 14.5 5.5M19 5.5C15 9 9 18 8 21M3.5 11c6 .5 11-1.5 13.5-5.5"/></>,
  twitter: <><path d="M21 5.5a8 8 0 0 1-2.3.6 4 4 0 0 0 1.8-2.2 8 8 0 0 1-2.5 1A4 4 0 0 0 11 8.5a11 11 0 0 1-8-4s-2 4.5 1.5 7a4 4 0 0 1-1.8-.5c0 2 1.4 3.7 3.4 4.1a4 4 0 0 1-1.8.1 4 4 0 0 0 3.7 2.8A8 8 0 0 1 3 19.5a11 11 0 0 0 6 1.8c7.2 0 11.2-6.1 11-11.6A8 8 0 0 0 21 5.5Z"/></>,
};

function Icon({ name, size = 18, strokeWidth = 1.6, style, className }) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}
      className={className} aria-hidden="true"
    >
      {path}
    </svg>
  );
}

Object.assign(window, { Icon, ICON_PATHS });
