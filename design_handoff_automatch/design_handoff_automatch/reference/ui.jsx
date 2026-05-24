// AutoMatch — restyled shared UI (ProTrip language, business tone)
// Keeps the same window.AM_UI namespace exports as the original so other files Just Work.

const fmt = (n) => n.toLocaleString('en-US');
const fmtPrice = (n) => `₪${fmt(n)}`;

// ── Tag / pill chip ───────────────────────────────────────────────
const Tag = ({ children, kind = 'default', size = 'md' }) => {
  const sizes = {
    sm: { fs: 11,   pad: '3px 8px',  radius: 999 },
    md: { fs: 11.5, pad: '4px 10px', radius: 999 },
    lg: { fs: 13,   pad: '6px 12px', radius: 999 },
  };
  const palette = {
    default: { bg: 'var(--sheet-2)',    fg: 'var(--ink-2)',     bd: 'transparent' },
    good:    { bg: 'var(--good-bg)',    fg: 'var(--good)',      bd: 'transparent' },
    fair:    { bg: 'var(--warn-bg)',    fg: 'var(--warn)',      bd: 'transparent' },
    high:    { bg: 'var(--bad-bg)',     fg: 'var(--bad)',       bd: 'transparent' },
    accent:  { bg: 'var(--accent)',     fg: 'var(--on-accent)', bd: 'transparent' },
    soft:    { bg: 'var(--accent-soft)',fg: 'var(--accent-ink)',bd: 'transparent' },
    outline: { bg: 'transparent',       fg: 'var(--ink-2)',     bd: 'var(--line-2)' },
  };
  const s = sizes[size]; const c = palette[kind] || palette.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: s.pad, borderRadius: s.radius,
      background: c.bg, color: c.fg,
      border: '1px solid ' + c.bd,
      fontSize: s.fs, fontWeight: 600, letterSpacing: 0.1,
      lineHeight: 1.3, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
};

// ── Sparkline (trend) ─────────────────────────────────────────────
const Sparkline = ({ values, w = 64, h = 22, up = false }) => {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const stroke = up ? 'var(--bad)' : 'var(--good)';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={w} cy={h - ((values[values.length-1] - min) / range) * h} r="2.6" fill={stroke}/>
    </svg>
  );
};

// ── SourceTag ─────────────────────────────────────────────────────
const SourceTag = ({ source }) => {
  const s = window.AM_DATA.SOURCES[source];
  if (!s) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid var(--line)',
      fontSize: 11, fontWeight: 600, color: 'var(--ink-2)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }}/>
      {s.name}
    </span>
  );
};

// ── Card ──────────────────────────────────────────────────────────
const Card = ({ children, style, onClick, padded = true, radius = 20 }) => (
  <div onClick={onClick} className={onClick ? 'press' : ''} style={{
    background: 'var(--sheet)',
    borderRadius: radius,
    padding: padded ? 16 : 0,
    border: '1px solid var(--line)',
    boxShadow: 'var(--shadow-sm)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }}>{children}</div>
);

// ── SectionHeader ─────────────────────────────────────────────────
const SectionHeader = ({ title, action, onAction }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    marginBottom: 12, padding: '0 4px',
  }}>
    <h3 style={{
      margin: 0, fontSize: 15, fontWeight: 700,
      color: 'var(--ink)', letterSpacing: '-0.01em',
    }}>{title}</h3>
    {action && (
      <button onClick={onAction} className="press" style={{
        background: 'none', border: 'none', padding: 4,
        fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)',
      }}>{action}</button>
    )}
  </div>
);

// ── IconBadge ─ (new — square rounded backdrop for icons) ─────────
const IconBadge = ({ tone = 'accent', children, size = 40, radius = 12 }) => {
  const tones = {
    accent: { bg: 'var(--accent-soft)', fg: 'var(--accent-ink)' },
    good:   { bg: 'var(--good-bg)',     fg: 'var(--good)' },
    fair:   { bg: 'var(--warn-bg)',     fg: 'var(--warn)' },
    bad:    { bg: 'var(--bad-bg)',      fg: 'var(--bad)' },
    neutral:{ bg: 'var(--sheet-2)',     fg: 'var(--ink-2)' },
  };
  const c = tones[tone] || tones.accent;
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: c.bg, color: c.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{children}</div>
  );
};

// ── Status bar (iOS-style, kept LTR) ──────────────────────────────
const StatusBar = ({ ink = 'var(--ink)' }) => (
  <div style={{
    height: 44, padding: '14px 22px 0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    direction: 'ltr',
    fontSize: 14, fontWeight: 600, color: ink,
    fontFamily: 'var(--font-num)',
    flexShrink: 0, position: 'relative', zIndex: 5,
  }}>
    <span>9:41</span>
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
        <rect x="0" y="7" width="2.6" height="4" rx="0.4"/>
        <rect x="4" y="5" width="2.6" height="6" rx="0.4"/>
        <rect x="8" y="2.5" width="2.6" height="8.5" rx="0.4"/>
        <rect x="12" y="0" width="2.6" height="11" rx="0.4"/>
      </svg>
      <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M1 4a10 10 0 0 1 13 0"/><path d="M3 6.5a7 7 0 0 1 9 0"/><path d="M5 9a3.5 3.5 0 0 1 5 0"/>
      </svg>
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
        <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.4"/>
        <rect x="2" y="2" width="18" height="8" rx="1.4" fill="currentColor"/>
        <rect x="22" y="3.5" width="1.5" height="5" rx="0.6" fill="currentColor" fillOpacity="0.45"/>
      </svg>
    </div>
  </div>
);

// ── Bottom tab bar (ProTrip-style flat with backdrop blur) ────────
const TabBar = ({ active, onChange, alertCount = 0 }) => {
  const tabs = [
    { id: 'home',   label: 'ראשי',   icon: 'home' },
    { id: 'search', label: 'חיפוש',  icon: 'search' },
    { id: 'saved',  label: 'שמורים', icon: 'bookmark' },
    { id: 'alerts', label: 'התראות', icon: 'bell', count: alertCount },
  ];
  return (
    <div style={{
      flexShrink: 0,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '1px solid var(--line)',
      paddingTop: 8, paddingBottom: 6, paddingInline: 12,
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} className="press" style={{
            background: 'transparent', border: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '6px 14px', borderRadius: 14,
            color: isActive ? 'var(--accent)' : 'var(--ink-3)',
          }}>
            <div style={{ position: 'relative', display: 'flex' }}>
              <Icon name={t.icon} size={22} strokeWidth={isActive ? 2 : 1.8}/>
              {t.count > 0 && (
                <span style={{
                  position: 'absolute', top: -3, left: -6,
                  minWidth: 16, height: 16, padding: '0 4px',
                  borderRadius: 999, background: 'var(--accent)', color: '#fff',
                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-num)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid white',
                }}>{t.count}</span>
              )}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ── Home indicator ────────────────────────────────────────────────
const GestureBar = () => (
  <div style={{
    flexShrink: 0,
    height: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    paddingBottom: 8, background: 'transparent',
  }}>
    <div style={{
      width: 139, height: 5, borderRadius: 100,
      background: 'rgba(0,0,0,0.25)',
    }}/>
  </div>
);

// ── FAB ───────────────────────────────────────────────────────────
const FAB = ({ icon = 'plus', onClick, label }) => (
  <button onClick={onClick} className="press" style={{
    position: 'absolute', insetInlineEnd: 18, bottom: 100, zIndex: 10,
    height: 52, padding: label ? '0 20px 0 16px' : 0, width: label ? 'auto' : 52,
    borderRadius: 999, border: 0,
    background: 'var(--accent)', color: 'var(--on-accent)',
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: '0 8px 24px rgba(52,80,232,0.32), 0 2px 6px rgba(52,80,232,0.18)',
    fontSize: 14, fontWeight: 700,
  }}>
    <Icon name={icon} size={20}/>
    {label && <span>{label}</span>}
  </button>
);

// ── Btn ─ (new — primary action button, ProTrip variants) ─────────
const Btn = ({ children, variant = 'primary', onClick, full, leftIcon, style }) => {
  const base = {
    height: 48, borderRadius: 14, padding: '0 20px',
    fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
    border: 0, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: full ? '100%' : undefined,
  };
  const styles = {
    primary: { background: 'var(--ink)',    color: '#fff' },
    accent:  { background: 'var(--accent)', color: '#fff' },
    soft:    { background: 'var(--sheet-2)', color: 'var(--ink)' },
    outline: { background: 'var(--sheet)',   color: 'var(--ink)', border: '1px solid var(--line)' },
    ghost:   { background: 'transparent',    color: 'var(--ink)' },
  };
  return (
    <button onClick={onClick} className="press" style={{ ...base, ...styles[variant], ...style }}>
      {leftIcon}{children}
    </button>
  );
};

// ── EmptyState ─ generic, used in saved/search/alerts empty cases ─
const EmptyState = ({ icon, title, subtitle, action, actionLabel, actionVariant = 'primary' }) => (
  <div style={{
    padding: '36px 24px 40px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  }}>
    {/* glyph container with dashed hairline */}
    <div style={{
      width: 64, height: 64, borderRadius: 18,
      background: 'var(--sheet)', border: '1px dashed var(--line-2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--ink-3)', marginBottom: 16,
      position: 'relative',
    }}>
      <Icon name={icon} size={24}/>
      {/* decorative dots */}
      <span style={{
        position: 'absolute', top: -4, insetInlineEnd: -4,
        width: 8, height: 8, borderRadius: 999, background: 'var(--accent-soft)',
      }}/>
      <span style={{
        position: 'absolute', bottom: -3, insetInlineStart: -3,
        width: 6, height: 6, borderRadius: 999, background: 'var(--sheet-3)',
      }}/>
    </div>
    <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
      {title}
    </div>
    {subtitle && (
      <div style={{
        fontSize: 13, color: 'var(--ink-3)',
        maxWidth: 260, lineHeight: 1.5, marginTop: 6,
        textWrap: 'pretty',
      }}>{subtitle}</div>
    )}
    {action && (
      <button onClick={action} className="press" style={{
        marginTop: 18, height: 42, padding: '0 18px', borderRadius: 12, border: 0,
        background: actionVariant === 'primary' ? 'var(--ink)' : 'var(--accent)',
        color: '#fff', fontSize: 13, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        {actionLabel}
        <Icon name="chevron-left" size={14}/>
      </button>
    )}
  </div>
);

// ── SkeletonCard ─ for use during loading; injects shimmer keyframe ─
(() => {
  if (document.getElementById('am-skeleton-css')) return;
  const s = document.createElement('style');
  s.id = 'am-skeleton-css';
  s.textContent = `
    @keyframes am-shimmer {
      0%   { background-position: -200px 0; }
      100% { background-position: 200px 0; }
    }
    .am-skeleton {
      background: linear-gradient(90deg,
        var(--sheet-2) 0%, var(--sheet-3) 40%,
        var(--sheet-2) 80%);
      background-size: 400px 100%;
      animation: am-shimmer 1.4s linear infinite;
      border-radius: 6px;
    }
  `;
  document.head.appendChild(s);
})();

const SkeletonRow = ({ width = '100%', height = 12, style }) => (
  <div className="am-skeleton" style={{ width, height, borderRadius: 6, ...style }}/>
);

const SkeletonCard = () => (
  <div style={{
    background: 'var(--sheet)', borderRadius: 20,
    border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
  }}>
    <div className="am-skeleton" style={{ height: 180, borderRadius: 0 }}/>
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SkeletonRow width="40%" height={10}/>
      <SkeletonRow width="70%" height={16}/>
      <SkeletonRow width="55%" height={11}/>
      <div style={{ height: 1, background: 'var(--line)', marginTop: 4 }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonRow width={60} height={14}/>
        <SkeletonRow width={90} height={18}/>
      </div>
    </div>
  </div>
);

window.AM_UI = {
  Tag, Sparkline, SourceTag, Card, SectionHeader, IconBadge,
  StatusBar, TabBar, GestureBar, FAB, Btn,
  EmptyState, SkeletonCard, SkeletonRow,
  fmt, fmtPrice,
};
