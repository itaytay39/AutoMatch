// Onboarding — 3 slides, light Google Health style

const { fmt } = window.AM_UI;

const SLIDES = [
{
  eyebrow: 'כל המודעות',
  title: <>כל לוחות הרכב<br /><span style={{ color: 'var(--accent)' }}>במקום אחד</span></>,
  body: 'אלפי מודעות מתעדכנות כל היום, ומגיעות אליך מאוחדות. בלי לדפדף, בלי כפילויות, בלי לפספס מודעה.',
  visual: 'feed'
},
{
  eyebrow: 'התאמה אוטומטית',
  title: <>חיפוש <span style={{ color: 'var(--accent)' }}>חכם</span> שעובד<br />בשבילך 24/7</>,
  body: 'בנה את חיפוש החלום, ואנחנו נשלח התראה ברגע שמופיע רכב תואם — לפני שהמתחרים יראו אותו.',
  visual: 'alert'
},
{
  eyebrow: 'מחיר אמיתי',
  title: <>מחיר הוגן עם<br /><span style={{ color: 'var(--accent)' }}>היסטוריה אמיתית</span></>,
  body: 'אנחנו עוקבים אחרי כל שינוי מחיר בכל מודעה. תדע אם המחיר ירד, וכמה. תזהה את העסקה האמיתית.',
  visual: 'price'
}];


const OnboardingVisual = ({ kind }) => {
  if (kind === 'feed') {
    // A stack of car cards rising up — represents many listings unified
    const cards = window.AM_DATA.VEHICLES.slice(0, 3);
    return (
      <div style={{
        position: 'relative', width: 280, height: 260, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {/* Phone container */}
        <div style={{
          width: 220, height: 240, borderRadius: 24,
          background: 'var(--sheet)',
          boxShadow: '0 20px 50px rgba(27,30,27,0.18)',
          border: '6px solid #14171C',
          overflow: 'hidden',
          padding: '14px 12px',
          display: 'flex', flexDirection: 'column', gap: 10
        }}>
          {/* mini search bar */}
          <div style={{
            height: 28, borderRadius: 999,
            background: 'var(--sheet-2)', border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6
          }}>
            <Icon name="search" size={12} color="var(--ink-3)" />
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--line)' }} />
          </div>
          {/* result cards stacked */}
          {cards.map((v, i) =>
          <div key={v.id} className="onboard-feed-card" style={{
            flex: 1, borderRadius: 12, padding: 8, gap: 8,
            background: 'var(--sheet-2)', border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center',
            animationDelay: i * 100 + 'ms'
          }}>
              <div style={{
              width: 38, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg, #E8E4D8 0%, #D8D2C2 100%)',
              position: 'relative', flexShrink: 0,
              overflow: 'hidden'
            }}>
                <svg viewBox="0 0 60 40" width="100%" height="100%">
                  <path d="M5 28 L10 28 C11 20 16 16 22 16 L36 16 C42 16 48 20 52 24 L56 26 C56 28 54 28 54 28" fill="#3A3F47" />
                  <circle cx="16" cy="29" r="3.5" fill="#1A1D1A" />
                  <circle cx="48" cy="29" r="3.5" fill="#1A1D1A" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--ink)' }}>{v.make} {v.model}</div>
                <div style={{ fontSize: 7, color: 'var(--ink-3)', marginTop: 2 }}>{v.year} · {fmt(v.km / 1000) + 'K'} ק״מ</div>
              </div>
              <div className="num" style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)' }}>
                ₪{Math.round(v.price / 1000)}K
              </div>
            </div>
          )}
        </div>

        {/* Floating "merge" badges */}
        <div style={{
          position: 'absolute', top: 18, insetInlineEnd: 0,
          padding: '6px 12px', borderRadius: 999,
          background: 'var(--accent)', color: '#fff',
          fontSize: 11, fontWeight: 800,
          boxShadow: '0 6px 14px rgba(52,80,232,0.3)',
          transform: 'rotate(8deg)'
        }}>2,341 מודעות</div>
        <div style={{
          position: 'absolute', bottom: 24, insetInlineStart: 0,
          padding: '6px 12px', borderRadius: 999,
          background: 'var(--ink)', color: '#fff',
          fontSize: 11, fontWeight: 800,
          boxShadow: '0 6px 14px rgba(27,30,27,0.25)',
          transform: 'rotate(-6deg)'
        }}>מעודכן כל דקה</div>

        <style>{`
          .onboard-feed-card {
            opacity: 0;
            transform: translateY(12px);
            animation: feed-card-in 480ms cubic-bezier(.2,.8,.2,1) forwards;
          }
          @keyframes feed-card-in {
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>);

  }
  if (kind === 'alert') {
    return (
      <div style={{
        position: 'relative', width: 260, height: 260, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {/* phone */}
        <div style={{
          width: 180, height: 240, borderRadius: 22,
          background: 'var(--sheet)',
          boxShadow: '0 20px 40px rgba(27,30,27,0.15)',
          border: '6px solid #14171C',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 16, insetInline: 12,
            background: 'rgba(255,255,255,0.95)', borderRadius: 14,
            padding: '12px 14px',
            boxShadow: '0 8px 16px rgba(27,30,27,0.1)',
            border: '1px solid var(--line)',
            display: 'flex', gap: 10, alignItems: 'center'
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif'
            }}>A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink)' }}>AutoMatch</div>
              <div style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 1 }}>קורולה חדשה תואמת!</div>
            </div>
            <div className="num" style={{ fontSize: 8, color: 'var(--ink-3)' }}>עכשיו</div>
          </div>
          <div style={{
            position: 'absolute', top: 84, insetInline: 12,
            display: 'flex', flexDirection: 'column', gap: 6
          }}>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--line)' }} />
            <div style={{ height: 8, borderRadius: 4, background: 'var(--line)', width: '70%' }} />
            <div style={{ marginTop: 12, height: 40, borderRadius: 12, background: 'var(--accent-soft)' }} />
            <div style={{ marginTop: 6, height: 30, borderRadius: 10, background: 'var(--line)' }} />
          </div>
        </div>
        {/* pulse rings */}
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          border: '2px solid rgba(52,80,232,0.2)',
          animation: 'am-fade-in 1s ease-out'
        }} />
        <div style={{
          position: 'absolute', width: 240, height: 240, borderRadius: '50%',
          border: '2px solid rgba(52,80,232,0.1)'
        }} />
      </div>);

  }
  if (kind === 'price') {
    const values = [100, 99, 98.5, 97, 96.5, 95.5, 94];
    return (
      <div style={{
        width: 280, height: 260, margin: '0 auto',
        background: 'var(--sheet)',
        borderRadius: 22, padding: 24,
        boxShadow: 'var(--shadow-md)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div className="eyebrow">קורולה הייבריד 2023</div>
        <div className="num h-display" style={{ fontSize: 30, marginTop: 4 }}>₪119,900</div>
        <div className="num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--good)', marginTop: 2 }}>
          ↓ ₪4,100 ב-30 ימים
        </div>
        <svg viewBox="0 0 240 120" style={{ marginTop: 12, flex: 1, direction: 'ltr' }}>
          <defs>
            <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3450E8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3450E8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {values.map((v, i) => {
            const x = i / 6 * 240;
            const y = 110 - (v - 93) / 7 * 95;
            return null; // we'll do path
          })}
          <path d={(() => {
            let d = '';
            values.forEach((v, i) => {
              const x = i / 6 * 240;
              const y = 110 - (v - 93) / 7 * 95;
              d += (i ? 'L' : 'M') + x + ',' + y;
            });
            return d + ' L240,120 L0,120 Z';
          })()} fill="url(#og)" />
          <path d={(() => {
            let d = '';
            values.forEach((v, i) => {
              const x = i / 6 * 240;
              const y = 110 - (v - 93) / 7 * 95;
              d += (i ? 'L' : 'M') + x + ',' + y;
            });
            return d;
          })()} stroke="#3450E8" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={240} cy={110 - (94 - 93) / 7 * 95} r="5" fill="#3450E8" />
          <circle cx={240} cy={110 - (94 - 93) / 7 * 95} r="2" fill="#fff" />
        </svg>
      </div>);

  }
  return null;
};

const Onboarding = ({ onComplete }) => {
  const [idx, setIdx] = React.useState(0);
  const isLast = idx === SLIDES.length - 1;
  const slide = SLIDES[idx];

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--bg-warm)',
      overflow: 'hidden'
    }}>
      {/* header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: "0px", opacity: "3.34"
      }}>
        <Logo size={20} layout="inline" />
        <button onClick={onComplete} className="press" style={{
          background: 'none', border: 'none',
          fontSize: 13, color: 'var(--ink-3)', fontWeight: 600,
          padding: '8px 12px'
        }}>דלג</button>
      </div>

      <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
        <div className="am-fade-in" key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <OnboardingVisual kind={slide.visual} />

          <div style={{ marginTop: 36 }}>
            <div className="eyebrow" style={{ color: 'var(--accent)' }}>{slide.eyebrow}</div>
            <h1 className="h-display" style={{
              fontSize: 32, marginTop: 12
            }}>{slide.title}</h1>
            <p style={{
              marginTop: 14, fontSize: 15, lineHeight: 1.55,
              color: 'var(--ink-2)', maxWidth: 320
            }}>{slide.body}</p>
          </div>
        </div>

        {/* progress dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8,
          margin: '20px 0'
        }}>
          {SLIDES.map((_, i) =>
          <div key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 28 : 8, height: 8, borderRadius: 4,
            background: i === idx ? 'var(--accent)' : 'rgba(27,30,27,0.15)',
            transition: 'width 240ms ease, background 240ms ease',
            cursor: 'pointer'
          }} />
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '8px 20px 28px', display: 'flex', gap: 10 }}>
        {idx > 0 &&
        <button onClick={() => setIdx(idx - 1)} className="press" style={{
          width: 52, height: 52, borderRadius: 14, border: '1px solid var(--line)',
          background: 'var(--sheet)', color: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon name="chevron-right" size={18} />
          </button>
        }
        <button onClick={() => isLast ? onComplete() : setIdx(idx + 1)}
        className="press" style={{
          flex: 1, height: 52, borderRadius: 14, border: 'none',
          background: 'var(--accent)', color: '#fff',
          fontSize: 14, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: 'var(--shadow-brand)',
        }}>
          {isLast ? 'בוא נתחיל' : 'הבא'}
          <Icon name="chevron-left" size={16} />
        </button>
      </div>
    </div>);

};

window.Onboarding = Onboarding;