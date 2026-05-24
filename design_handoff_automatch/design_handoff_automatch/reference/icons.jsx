// AutoMatch — restyled icons (ProTrip set + AutoMatch-specific additions)
// 24×24 viewBox, 1.8 stroke, rounded caps/joins.
// Keeps the existing `Icon` API: <Icon name="..." size={20} color="..." strokeWidth={1.8}/>

const Icon = ({ name, size = 22, color = 'currentColor', strokeWidth = 1.8 }) => {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    // ── Nav ────────────────────────────────────────────────────────
    case 'home':
      return <svg {...props}><path d="M3 11l9-7.5L21 11"/><path d="M5 9.5V20a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V9.5"/></svg>;
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M20.5 20.5L16 16"/></svg>;
    case 'bookmark':
      return <svg {...props}><path d="M6 3h12v18l-6-4-6 4z"/></svg>;
    case 'bookmark-fill':
      return <svg {...props} fill="currentColor" stroke="none"><path d="M6 3h12v18l-6-4-6 4z"/></svg>;
    case 'bell':
      return <svg {...props}><path d="M5.5 16.5l1-2V11a5.5 5.5 0 0111 0v3.5l1 2H5.5z"/><path d="M10 19.5a2 2 0 004 0"/></svg>;

    // ── Action ─────────────────────────────────────────────────────
    case 'heart':
      return <svg {...props}><path d="M12 21s-7-4.5-9.5-9A5 5 0 0112 6a5 5 0 019.5 6C19 16.5 12 21 12 21z"/></svg>;
    case 'heart-fill':
      return <svg {...props} fill="currentColor" stroke="none"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0112 6a5 5 0 019.5 6C19 16.5 12 21 12 21z"/></svg>;
    case 'share':
      return <svg {...props}><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-3.8M8.2 13l7.6 3.8"/></svg>;
    case 'phone':
      return <svg {...props}><path d="M5.5 3h3.5l1.5 4-2 1.5a11 11 0 006 6L16 12.5l4 1.5v3.5a2 2 0 01-2 2A16 16 0 013.5 5a2 2 0 012-2z"/></svg>;
    case 'message':
      return <svg {...props}><path d="M21 11.5c0 4.1-4 7.5-9 7.5-1.3 0-2.6-.3-3.7-.7L4 20l1.3-3.6C4.5 15.2 4 13.4 4 11.5 4 7.4 8 4 13 4s8 3.4 8 7.5z"/></svg>;
    case 'sliders':
      return <svg {...props}><path d="M4 5h16M7 12h10M10 19h4"/></svg>;
    case 'filter-x':
      return <svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4z"/><path d="M17 17l4 4M21 17l-4 4"/></svg>;

    // ── Chevron / arrow ────────────────────────────────────────────
    case 'chevron-left':
      return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chevron-right':
      return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-down':
      return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'chevron-up':
      return <svg {...props}><path d="M6 15l6-6 6 6"/></svg>;
    case 'arrow-left':
      return <svg {...props}><path d="M19 12H5m6-6l-6 6 6 6"/></svg>;
    case 'arrow-up':
      return <svg {...props}><path d="M12 19V5m-6 6l6-6 6 6"/></svg>;
    case 'arrow-down':
      return <svg {...props}><path d="M12 5v14m6-6l-6 6-6-6"/></svg>;
    case 'close':
      return <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'plus':
      return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':
      return <svg {...props}><path d="M5 12h14"/></svg>;
    case 'check':
      return <svg {...props}><path d="M4 12.5l5 5L20 6.5"/></svg>;

    // ── Vehicle / spec ─────────────────────────────────────────────
    case 'car':
      return <svg {...props}><path d="M3 16v-3l2-5h14l2 5v3"/><path d="M3 16h18v3"/><circle cx="7.5" cy="16" r="2"/><circle cx="16.5" cy="16" r="2"/><path d="M6 8.5l1-2.5h10l1 2.5"/></svg>;
    case 'gauge':
      return <svg {...props}><path d="M3 13a9 9 0 1118 0"/><path d="M12 13l5-4"/><circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none"/></svg>;
    case 'fuel':
      return <svg {...props}><rect x="4" y="3" width="10" height="18" rx="1.5"/><path d="M4 10h10M14 9l3 2v7a2 2 0 002 2 2 2 0 002-2V8l-3-3"/></svg>;
    case 'lightning':
      return <svg {...props} fill="currentColor" stroke="none"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>;
    case 'leaf':
      return <svg {...props}><path d="M5 21c0-9 6-15 16-16-1 10-7 16-16 16z"/><path d="M5 21c0-7 5-12 12-13"/></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;

    // ── Geo ────────────────────────────────────────────────────────
    case 'pin':
      return <svg {...props}><path d="M12 21.5c0-.5 7-7 7-12a7 7 0 10-14 0c0 5 7 11.5 7 12z"/><circle cx="12" cy="9.5" r="2.5"/></svg>;
    case 'navigate':
      return <svg {...props}><path d="M21.5 2.5L13 21l-2-9-9-2 19.5-7.5z"/><path d="M21.5 2.5L11 13"/></svg>;

    // ── Trend ──────────────────────────────────────────────────────
    case 'trend-up':
      return <svg {...props}><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>;
    case 'trend-down':
      return <svg {...props}><path d="M3 7l6 6 4-4 8 9"/><path d="M14 18h7v-7"/></svg>;
    case 'sparkle':
      return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></svg>;
    case 'flame':
      return <svg {...props}><path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 1-3s1 2 3 2c0-3-1-5 1-8z"/></svg>;

    // ── System ─────────────────────────────────────────────────────
    case 'eye':
      return <svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'shield':
      return <svg {...props}><path d="M12 2.5l8 3.5v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10v-6z"/><path d="M9 12l2 2 4-4"/></svg>;
    case 'camera':
      return <svg {...props}><path d="M3 7.5h3.5L8 5h8l1.5 2.5H21v12H3z"/><circle cx="12" cy="13" r="3.5"/></svg>;
    case 'user':
      return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    case 'menu':
      return <svg {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case 'lock':
      return <svg {...props}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>;
    case 'dot':
      return <svg {...props} fill="currentColor" stroke="none"><circle cx="12" cy="12" r="3"/></svg>;
    case 'clock':
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2.5"/></svg>;

    default:
      return <svg {...props}><circle cx="12" cy="12" r="9"/></svg>;
  }
};

window.Icon = Icon;
