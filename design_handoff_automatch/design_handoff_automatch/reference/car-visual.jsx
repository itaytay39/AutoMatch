// Car visual — light theme, soft warm card with subtle illustration

const CAR_PALETTES = [
  { bg1: '#F0EDE3', bg2: '#E5E1D2', body: '#2E3A36', accent: '#C0B89C' }, // forest on cream
  { bg1: '#EFE9DE', bg2: '#E2DAC8', body: '#9A4135', accent: '#E8C77A' }, // rust on sand
  { bg1: '#E7EEEA', bg2: '#D8E2DC', body: '#3B6D72', accent: '#D9CFB6' }, // teal on mint
  { bg1: '#ECEAE2', bg2: '#DFDCCF', body: '#1B1E1B', accent: '#C0BCAB' }, // black on bone
  { bg1: '#F2EAE0', bg2: '#E5D9C6', body: '#5A6F4E', accent: '#E0D2B5' }, // moss on warm
  { bg1: '#EDE6DA', bg2: '#DED4C2', body: '#B89A6E', accent: '#F0E8D2' }, // tan on cream
  { bg1: '#E8EAEE', bg2: '#D8DCE4', body: '#3F4F66', accent: '#CED2DC' }, // slate
  { bg1: '#EDE6E4', bg2: '#DCD1CE', body: '#6B2A38', accent: '#E2CFCB' }, // burgundy
];

function pickPalette(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return CAR_PALETTES[Math.abs(h) % CAR_PALETTES.length];
}

function carPath(body) {
  switch (body) {
    case 'קרוסאובר':
      return 'M40,140 L70,140 C72,118 90,108 110,108 L210,108 C228,108 248,116 268,128 L330,138 C346,140 358,144 360,150 L360,168 C360,172 357,174 353,174 L335,174 C333,162 322,153 308,153 C294,153 283,162 281,174 L120,174 C118,162 107,153 93,153 C79,153 68,162 66,174 L48,174 C44,174 40,170 40,166 Z';
    case 'האצ׳בק':
      return 'M40,150 L60,150 C62,128 80,118 100,118 L200,118 C218,118 236,124 252,134 L320,144 C340,148 360,152 360,158 L360,170 C360,174 357,176 353,176 L330,176 C328,164 317,155 303,155 C289,155 278,164 276,176 L115,176 C113,164 102,155 88,155 C74,155 63,164 61,176 L48,176 C44,176 40,172 40,168 Z';
    case 'סטיישן':
      return 'M40,150 L60,150 C62,130 78,122 96,122 L240,122 C258,122 274,128 286,138 L340,146 C354,148 360,152 360,158 L360,172 C360,176 357,178 353,178 L335,178 C333,166 322,157 308,157 C294,157 283,166 281,178 L120,178 C118,166 107,157 93,157 C79,157 68,166 66,178 L48,178 C44,178 40,174 40,170 Z';
    default:
      return 'M40,154 L62,154 C64,134 82,124 104,124 L204,124 C224,124 244,132 262,144 L324,152 C344,154 360,156 360,162 L360,172 C360,176 357,178 353,178 L335,178 C333,166 322,157 308,157 C294,157 283,166 281,178 L120,178 C118,166 107,157 93,157 C79,157 68,166 66,178 L48,178 C44,178 40,174 40,170 Z';
  }
}

const CarVisual = ({ vehicle, height = 200, showSpec = true, radius = 'inherit' }) => {
  const p = pickPalette(vehicle.id);
  const path = carPath(vehicle.body);
  const isElectric = vehicle.fuel === 'חשמלי';

  return (
    <div style={{
      position: 'relative', width: '100%', height,
      borderRadius: radius,
      overflow: 'hidden',
      background: `radial-gradient(120% 100% at 30% 30%, ${p.bg1} 0%, ${p.bg2} 100%)`,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={`gloss-${vehicle.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)"/>
            <stop offset="60%" stopColor="rgba(255,255,255,0.02)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)"/>
          </linearGradient>
          <radialGradient id={`light-${vehicle.id}`} cx="0.3" cy="0.2" r="0.7">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>

        {/* soft top light */}
        <rect width="400" height="220" fill={`url(#light-${vehicle.id})`}/>

        {/* horizon */}
        <line x1="0" y1="180" x2="400" y2="180" stroke="rgba(27,30,27,0.06)" strokeWidth="1"/>

        {/* car shadow */}
        <ellipse cx="200" cy="186" rx="160" ry="6" fill="rgba(27,30,27,0.18)"/>

        {/* body */}
        <path d={path} fill={p.body}/>
        <path d={path} fill={`url(#gloss-${vehicle.id})`}/>

        {/* windows */}
        <path d={
          vehicle.body === 'קרוסאובר'
            ? 'M105,114 L200,114 C214,114 228,120 240,128 L260,136 L255,140 L100,140 Z'
            : 'M108,128 L195,128 C212,128 226,134 238,142 L255,148 L250,150 L100,150 Z'
        } fill="rgba(232,236,238,0.85)"/>
        <path d={
          vehicle.body === 'קרוסאובר'
            ? 'M108,118 L200,118 C212,118 224,123 234,130 L246,136'
            : 'M110,132 L196,132 C212,132 224,137 234,144 L244,148'
        } stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none"/>

        {/* door line */}
        <line x1="170" y1="135" x2="170" y2="165" stroke="rgba(0,0,0,0.18)" strokeWidth="1"/>

        {/* wheels */}
        {[93, 308].map(cx => (
          <g key={cx}>
            <circle cx={cx} cy="170" r="18" fill="#1A1D1A"/>
            <circle cx={cx} cy="170" r="12" fill={p.accent} stroke="rgba(0,0,0,0.15)" strokeWidth="0.6"/>
            <circle cx={cx} cy="170" r="3.5" fill="#1A1D1A"/>
            {[0, 60, 120, 180, 240, 300].map(a => (
              <line key={a} x1={cx} y1="170"
                x2={cx + 10 * Math.cos(a * Math.PI / 180)}
                y2={170 + 10 * Math.sin(a * Math.PI / 180)}
                stroke="rgba(0,0,0,0.25)" strokeWidth="1.2"/>
            ))}
          </g>
        ))}

        {/* headlight (right side) */}
        <ellipse cx="350" cy="158" rx="9" ry="3" fill="#FFF6D8" opacity="0.95"/>
        <ellipse cx="352" cy="158" rx="3.5" ry="1.2" fill="#FFFFFF"/>
        {/* taillight */}
        <rect x="42" y="152" width="14" height="3" rx="1.5" fill="#C7382A" opacity="0.85"/>

        {/* EV badge */}
        {isElectric && (
          <g transform="translate(196,146)">
            <circle r="9" fill="rgba(255,255,255,0.95)" stroke={p.accent} strokeWidth="1"/>
            <path d="M-2,-4 L-4,1 L-1,1 L-2,4 L3,-1 L0,-1 L2,-4 Z" fill={p.body}/>
          </g>
        )}
      </svg>

      {showSpec && (
        <div style={{
          position: 'absolute', insetInline: 12, bottom: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 8, pointerEvents: 'none',
        }}>
          <span style={{
            padding: '5px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
            fontSize: 11, fontWeight: 600, color: 'var(--ink-2)',
            letterSpacing: 0.2,
          }}>{vehicle.body}</span>
          <span style={{
            padding: '5px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
            fontSize: 11, fontWeight: 600, color: 'var(--ink-2)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/>
            </svg>
            <span className="num">{vehicle.images}</span>
          </span>
        </div>
      )}
    </div>
  );
};

window.CarVisual = CarVisual;
