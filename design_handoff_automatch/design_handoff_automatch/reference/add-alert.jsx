// Add Alert flow — bottom sheet, multi-step

const { Tag, fmt } = window.AM_UI;
const { FILTER_DEFAULTS } = window.AM_FILTERS;

const AlertForm = ({ onClose, onSave }) => {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');
  const [makes, setMakes] = React.useState([]);
  const [criteria, setCriteria] = React.useState({
    yearMin: 2020, priceMax: 150000, hand: 'any', fuel: [],
  });
  const [notif, setNotif] = React.useState({ push: true, email: false, instant: true });

  const MAKES = ['טויוטה', 'יונדאי', 'BMW', 'מאזדה', 'קיה', 'סקודה', 'פולקסווגן', 'טסלה'];

  const nextDisabled = step === 0 ? makes.length === 0 : false;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200 }}>
      <div onClick={onClose} className="am-fade-in" style={{
        position: 'absolute', inset: 0, background: 'rgba(27,30,27,0.4)', backdropFilter: 'blur(4px)',
      }}/>
      <div className="am-slide-up" style={{
        position: 'absolute', insetInline: 0, bottom: 0, top: 40,
        background: 'var(--sheet)',
        borderRadius: '22px 22px 0 0',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line-2)' }}/>
        </div>

        {/* header */}
        <div style={{ padding: '8px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent)' }}>
              שלב {step + 1} מתוך 3
            </div>
            <h2 className="h-display" style={{ margin: '4px 0 0', fontSize: 22 }}>
              {step === 0 && 'איזה רכב מעניין אותך?'}
              {step === 1 && 'מה הקריטריונים?'}
              {step === 2 && 'איך להודיע לך?'}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--sheet-2)', border: '1px solid var(--line)', width: 34, height: 34, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)',
          }}>
            <Icon name="close" size={16}/>
          </button>
        </div>

        {/* progress bar */}
        <div style={{ padding: '0 22px 16px' }}>
          <div style={{ height: 4, borderRadius: 999, background: 'rgba(27,30,27,0.08)', overflow: 'hidden' }}>
            <div style={{
              width: ((step + 1) / 3 * 100) + '%', height: '100%',
              background: 'var(--accent)', borderRadius: 999,
              transition: 'width 280ms ease',
            }}/>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px 20px' }}>
          {step === 0 && (
            <div className="am-fade-in">
              <div style={{ marginBottom: 18 }}>
                <label className="eyebrow" style={{ marginBottom: 10, display: 'block' }}>
                  שם ההתראה (אופציונלי)
                </label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="למשל: רכב משפחתי לעבודה"
                  style={{
                    width: '100%', height: 50, padding: '0 16px',
                    background: 'var(--sheet)', border: '1px solid var(--line-2)',
                    borderRadius: 12, fontSize: 14,
                    color: 'var(--ink)', textAlign: 'right', direction: 'rtl',
                  }}/>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="eyebrow" style={{ marginBottom: 10, display: 'block' }}>
                  בחר יצרן (אפשר כמה)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {MAKES.map(m => {
                    const active = makes.includes(m);
                    return (
                      <button key={m} onClick={() => setMakes(active ? makes.filter(x => x !== m) : [...makes, m])}
                        className="press" style={{
                          padding: '10px 16px', borderRadius: 999,
                          background: active ? 'var(--ink)' : 'var(--sheet)',
                          color: active ? '#fff' : 'var(--ink)',
                          border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line-2)'),
                          fontSize: 13, fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}>
                        {active && <Icon name="check" size={14}/>}
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="am-fade-in">
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="eyebrow">משנת ייצור</span>
                  <span className="num" style={{ fontSize: 14, fontWeight: 700 }}>{criteria.yearMin}</span>
                </div>
                <input type="range" className="am-range" min={2015} max={2024} step={1} value={criteria.yearMin}
                  style={{ '--rng-pct': ((criteria.yearMin - 2015) / 9 * 100) + '%' }}
                  onChange={e => setCriteria({ ...criteria, yearMin: +e.target.value })}/>
              </div>

              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="eyebrow">מחיר מקסימלי</span>
                  <span className="num" style={{ fontSize: 14, fontWeight: 700 }}>₪{fmt(criteria.priceMax)}</span>
                </div>
                <input type="range" className="am-range" min={50000} max={400000} step={5000} value={criteria.priceMax}
                  style={{ '--rng-pct': ((criteria.priceMax - 50000) / 350000 * 100) + '%' }}
                  onChange={e => setCriteria({ ...criteria, priceMax: +e.target.value })}/>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>יד</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { v: 'any', l: 'הכל' },
                    { v: 1, l: 'יד 1' },
                    { v: 2, l: 'יד 2' },
                    { v: 3, l: 'יד 3+' },
                  ].map(opt => {
                    const active = criteria.hand === opt.v;
                    return (
                      <button key={opt.v} onClick={() => setCriteria({ ...criteria, hand: opt.v })}
                        className="press" style={{
                          flex: 1, height: 44, borderRadius: 14,
                          background: active ? 'var(--ink)' : 'var(--sheet)',
                          color: active ? '#fff' : 'var(--ink)',
                          border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line-2)'),
                          fontSize: 13, fontWeight: 600,
                        }}>{opt.l}</button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>סוג מנוע</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['בנזין', 'היברידי', 'חשמלי', 'דיזל'].map(f => {
                    const active = criteria.fuel.includes(f);
                    return (
                      <button key={f} onClick={() => setCriteria({
                        ...criteria,
                        fuel: active ? criteria.fuel.filter(x => x !== f) : [...criteria.fuel, f]
                      })} className="press" style={{
                        padding: '10px 16px', borderRadius: 999,
                        background: active ? 'var(--ink)' : 'var(--sheet)',
                        color: active ? '#fff' : 'var(--ink)',
                        border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line-2)'),
                        fontSize: 13, fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}>{active && <Icon name="check" size={14}/>}{f}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="am-fade-in">
              <NotifRow icon="bell" title="התראת push" subtitle="הודעה מיידית לטלפון"
                value={notif.push} onChange={v => setNotif({ ...notif, push: v })}/>
              <NotifRow icon="message" title="אימייל" subtitle="סיכום יומי או מיידי"
                value={notif.email} onChange={v => setNotif({ ...notif, email: v })}/>

              <div style={{ height: 1, background: 'var(--line)', margin: '8px 0' }}/>

              <div className="eyebrow" style={{ marginTop: 16, marginBottom: 10 }}>
                תדירות
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { v: true,  l: 'מיידי', s: 'ברגע שמופיע רכב' },
                  { v: false, l: 'יומי',  s: 'סיכום אחת ליום' },
                ].map(opt => {
                  const active = notif.instant === opt.v;
                  return (
                    <button key={opt.l} onClick={() => setNotif({ ...notif, instant: opt.v })}
                      className="press" style={{
                        flex: 1, padding: 14, borderRadius: 16,
                        background: active ? 'var(--accent-soft)' : 'var(--sheet-2)',
                        border: '1px solid ' + (active ? 'var(--accent)' : 'var(--line-2)'),
                        textAlign: 'right',
                      }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{opt.l}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{opt.s}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{
          padding: '14px 22px 22px',
          background: 'var(--sheet)',
          borderTop: '1px solid var(--line)',
          display: 'flex', gap: 10,
        }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="press" style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'var(--sheet)', border: '1px solid var(--line-2)',
              color: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="chevron-right" size={20}/>
            </button>
          )}
          <button onClick={() => {
            if (step < 2) setStep(step + 1);
            else onSave({ name: name || `${makes[0]} התראה`, makes, criteria, notif });
          }} disabled={nextDisabled} className="press" style={{
            flex: 1, height: 52, borderRadius: 14, border: 'none',
            background: nextDisabled ? 'rgba(27,30,27,0.1)' : 'var(--accent)',
            color: nextDisabled ? 'var(--ink-3)' : 'var(--on-accent)',
            fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: nextDisabled ? 'none' : '0 6px 18px rgba(52,80,232,0.28)',
          }}>
            {step < 2 ? 'הבא' : 'צור התראה'}
            <Icon name={step < 2 ? 'chevron-left' : 'check'} size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const NotifRow = ({ icon, title, subtitle, value, onChange }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 4px',
    borderBottom: '1px solid var(--line)',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: 'var(--accent-soft)', color: 'var(--accent-ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={icon} size={18}/>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{subtitle}</div>
    </div>
    <button onClick={() => onChange(!value)} className="press" style={{
      width: 48, height: 28, borderRadius: 999, border: 'none',
      background: value ? 'var(--accent)' : 'rgba(27,30,27,0.15)',
      padding: 3, display: 'flex', alignItems: 'center',
      justifyContent: value ? 'flex-end' : 'flex-start',
      direction: 'ltr',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        transition: 'transform 200ms ease',
      }}/>
    </button>
  </div>
);

window.AlertForm = AlertForm;
