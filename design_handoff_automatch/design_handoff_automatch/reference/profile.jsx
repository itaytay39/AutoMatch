// Profile sheet — opens when tapping avatar

const PROFILE_STATS = [
  { label: 'נצפו', value: '47', icon: 'eye' },
  { label: 'שמורים', value: '12', icon: 'bookmark' },
  { label: 'התראות', value: '3', icon: 'bell' },
];

const PROFILE_ROWS = [
  { icon: 'user', title: 'פרטים אישיים', sub: 'שם, אימייל, טלפון' },
  { icon: 'bell', title: 'הגדרות התראות', sub: 'push, אימייל, שעות שקט' },
  { icon: 'sparkle', title: 'חיפושים שמורים', sub: '5 חיפושים מהירים' },
  { icon: 'shield', title: 'פרטיות ואבטחה', sub: 'נתונים ופרטיות' },
  { icon: 'message', title: 'עזרה ותמיכה', sub: 'צ׳אט, FAQ, דיווח על מודעה' },
];

const ProfileSheet = ({ onClose, savedCount }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200 }}>
      <div onClick={onClose} className="am-fade-in" style={{
        position: 'absolute', inset: 0, background: 'rgba(27,30,27,0.4)', backdropFilter: 'blur(4px)',
      }}/>
      <div className="am-slide-up" style={{
        position: 'absolute', insetInline: 0, bottom: 0, top: 60,
        background: 'var(--bg-warm)',
        borderRadius: '22px 22px 0 0',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line-2)' }}/>
        </div>

        {/* hero — tinted */}
        <div style={{
          background: 'var(--sheet)',
          border: '1px solid var(--line)',
          padding: '20px 22px 24px',
          borderRadius: 20,
          margin: '6px 16px 0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--accent)', color: 'var(--on-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800,
                boxShadow: '0 8px 20px rgba(52,80,232,0.3)',
              }}>א</div>
              <div>
                <h2 className="h-display" style={{ margin: 0, fontSize: 22 }}>איתי כהן</h2>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4 }}>
                  חבר מאז מאי 2026
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.7)', border: 'none',
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
            }}>
              <Icon name="close" size={16}/>
            </button>
          </div>

          {/* stats — 3-up */}
          <div style={{
            marginTop: 16, padding: 4, borderRadius: 14,
            background: 'var(--sheet-2)',
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
          }}>
            {PROFILE_STATS.map((s, i) => (
              <div key={s.label} style={{
                padding: '10px 4px', textAlign: 'center',
                borderInlineEnd: i < 2 ? '1px solid var(--line)' : 'none',
              }}>
                <div className="num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1 }}>
                  {s.label === 'שמורים' ? savedCount : s.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* rows */}
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 24px' }}>
          <div style={{ background: 'var(--sheet)', borderRadius: 20, padding: '4px 0', boxShadow: 'var(--shadow-sm)' }}>
            {PROFILE_ROWS.map((r, i) => (
              <button key={r.title} className="press" style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', background: 'none', border: 'none',
                borderBottom: i < PROFILE_ROWS.length - 1 ? '1px solid var(--line)' : 'none',
                textAlign: 'right',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'var(--sheet-2)', color: 'var(--ink-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={r.icon} size={18}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{r.sub}</div>
                </div>
                <Icon name="chevron-left" size={18} color="var(--ink-4)"/>
              </button>
            ))}
          </div>

          <button className="press" style={{
            marginTop: 14, width: '100%', height: 48, borderRadius: 14, border: '1px solid var(--line)',
            background: 'var(--sheet)', color: 'var(--bad)',
            fontSize: 13.5, fontWeight: 600,
          }}>התנתק</button>

          <div style={{
            marginTop: 18, textAlign: 'center',
            fontSize: 11, color: 'var(--ink-4)', fontWeight: 500,
          }}>
            AutoMatch · אוטומאץ׳ v1.0 · 2026
          </div>
        </div>
      </div>
    </div>
  );
};

window.ProfileSheet = ProfileSheet;
