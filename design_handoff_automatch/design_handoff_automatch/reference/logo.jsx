// AutoMatch — minimal premium wordmark. No symbol, just refined type.

const Logo = ({ size = 28, light = false, layout = 'stacked' }) => {
  const ink = light ? '#FFFFFF' : 'var(--ink)';
  const accent = light ? '#9FB4FF' : 'var(--accent)';
  const enSize = size;
  const heSize = size * 0.78;

  if (layout === 'icon') {
    // App icon — rounded square with stylized "A" mark
    return (
      <div style={{
        width: size, height: size,
        borderRadius: size * 0.24,
        background: light ? '#FFFFFF' : '#14171C',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <svg viewBox="0 0 40 40" width={size * 0.7} height={size * 0.7}>
          <g fill="none" strokeLinecap="square" strokeLinejoin="miter">
            {/* A — split into two halves: dark + accent peak */}
            <path d="M 8 32 L 18 8 L 20 13" stroke={light ? '#14171C' : '#FFFFFF'} strokeWidth="3.6"/>
            <path d="M 20 13 L 22 8 L 32 32" stroke={accent} strokeWidth="3.6"/>
            <line x1="13" y1="22" x2="27" y2="22" stroke={light ? '#14171C' : '#FFFFFF'} strokeWidth="3.6"/>
          </g>
        </svg>
      </div>
    );
  }

  // Stacked bilingual wordmark
  if (layout === 'stacked') {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1, gap: 4, alignItems: 'flex-start' }}>
        <span dir="ltr" style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: enSize, fontWeight: 800, letterSpacing: '-0.035em',
          color: ink, lineHeight: 1,
          display: 'inline-flex', alignItems: 'baseline',
        }}>
          Auto<span style={{ color: accent }}>Match</span>
        </span>
        <span style={{
          fontFamily: 'Heebo, system-ui, sans-serif',
          fontSize: heSize, fontWeight: 800, letterSpacing: '-0.02em',
          color: light ? 'rgba(255,255,255,0.55)' : 'rgba(20,23,28,0.42)',
          lineHeight: 1,
        }}>
          אוטומאץ׳
        </span>
      </div>
    );
  }

  // inline single-line
  return (
    <span dir="ltr" style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: enSize, fontWeight: 800, letterSpacing: '-0.035em',
      color: ink, lineHeight: 1,
      display: 'inline-flex', alignItems: 'baseline',
    }}>
      Auto<span style={{ color: accent }}>Match</span>
    </span>
  );
};

// Backwards compat
const LogoLockup = ({ size = 22, light = false }) => <Logo size={size} light={light} layout="stacked"/>;

window.Logo = Logo;
window.LogoLockup = LogoLockup;
