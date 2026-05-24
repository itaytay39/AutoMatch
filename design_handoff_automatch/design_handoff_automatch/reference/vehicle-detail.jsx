// AutoMatch — restyled vehicle-detail (ProTrip language, business tone)
// Keeps window.VehicleDetail contract.

const { Tag, Sparkline, SourceTag, IconBadge, Btn, fmt, fmtPrice } = window.AM_UI;

// ── Price gauge (kept — colored arc) ──────────────────────────────
const PriceGauge = ({ price, list }) => {
  const pct = ((price - list) / list) * 100;
  const clamped = Math.max(-15, Math.min(15, pct));
  const angle = (clamped / 15) * 90;
  const color = pct < -3 ? 'var(--good)' : pct < 3 ? 'var(--warn)' : 'var(--bad)';
  const label = pct < -3 ? 'מחיר מעולה' : pct < 3 ? 'מחיר סביר' : 'מעל מחירון';
  const arcPath = (s, e) => {
    const r = 70, cx = 90, cy = 80;
    const sa = (s - 90) * Math.PI / 180, ea = (e - 90) * Math.PI / 180;
    return `M ${cx + r * Math.cos(sa)} ${cy + r * Math.sin(sa)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(ea)} ${cy + r * Math.sin(ea)}`;
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg width="170" height="98" viewBox="0 0 180 100">
        <path d={arcPath(0, 60)}   stroke="var(--good-bg)" strokeWidth="10" fill="none" strokeLinecap="round"/>
        <path d={arcPath(60, 120)} stroke="var(--warn-bg)" strokeWidth="10" fill="none" strokeLinecap="round"/>
        <path d={arcPath(120,180)} stroke="var(--bad-bg)"  strokeWidth="10" fill="none" strokeLinecap="round"/>
        <g transform={`translate(90,80) rotate(${angle})`}>
          <line x1="0" y1="0" x2="0" y2="-62" stroke={color} strokeWidth="3" strokeLinecap="round"/>
          <circle r="6" fill={color}/>
          <circle r="3" fill="var(--sheet)"/>
        </g>
      </svg>
      <div style={{ flex: 1 }}>
        <div className="eyebrow">השוואה למחירון</div>
        <div style={{ fontSize: 16, fontWeight: 700, color, marginTop: 4 }}>{label}</div>
        <div className="num" style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>
          {pct < 0 ? '−' : '+'}{Math.abs(pct).toFixed(1)}% · מחירון {fmtPrice(list)}
        </div>
      </div>
    </div>
  );
};

// ── Spec tile ─────────────────────────────────────────────────────
const SpecStat = ({ icon, label, value }) => (
  <div style={{
    flex: 1, padding: 12,
    background: 'var(--sheet-2)', borderRadius: 14,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <Icon name={icon} size={13} color="var(--ink-3)"/>
      <span className="eyebrow" style={{ fontSize: 10 }}>{label}</span>
    </div>
    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
  </div>
);

// ── Finance modal ─────────────────────────────────────────────────
const FinanceModal = ({ price, onClose }) => {
  const [down, setDown] = React.useState(Math.round(price * 0.3));
  const [months, setMonths] = React.useState(60);
  const principal = price - down;
  const rate = 0.065 / 12;
  const monthly = principal > 0 ? Math.round((principal * rate) / (1 - Math.pow(1 + rate, -months))) : 0;
  const downPct = (down / price) * 100;
  const monthsPct = ((months - 12) / (84 - 12)) * 100;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200 }}>
      <div onClick={onClose} className="am-fade-in" style={{
        position: 'absolute', inset: 0, background: 'rgba(20,18,14,0.45)', backdropFilter: 'blur(4px)',
      }}/>
      <div className="am-slide-up" style={{
        position: 'absolute', insetInline: 0, bottom: 0,
        background: 'var(--bg-warm)',
        borderRadius: '24px 24px 0 0',
        padding: '14px 20px 28px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--sheet-3)', margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 className="h-display" style={{ margin: 0, fontSize: 20 }}>מחשבון מימון</h3>
          <button onClick={onClose} style={{
            background: 'var(--sheet)', border: '1px solid var(--line)',
            width: 34, height: 34, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)',
          }}><Icon name="close" size={15}/></button>
        </div>

        <div style={{
          padding: 18, borderRadius: 20,
          background: 'linear-gradient(155deg, #1E2A8C 0%, var(--accent) 60%, #5E78F0 100%)',
          color: '#fff', marginBottom: 18,
          boxShadow: 'var(--shadow-brand)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            תשלום חודשי משוער
          </div>
          <div className="num" style={{
            fontSize: 38, fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em',
          }}>₪{fmt(monthly)}</div>
          <div className="num" style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.88, marginTop: 4 }}>
            סה״כ ₪{fmt(monthly * months + down)} · ריבית 6.5%
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>הון עצמי</span>
            <span className="num" style={{ fontSize: 13.5, fontWeight: 700 }}>₪{fmt(down)}</span>
          </div>
          <input type="range" className="am-range" min={0} max={price} step={5000} value={down}
            style={{ '--rng-pct': downPct + '%' }}
            onChange={e => setDown(+e.target.value)}/>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>תקופת החזר</span>
            <span className="num" style={{ fontSize: 13.5, fontWeight: 700 }}>{months} חודשים</span>
          </div>
          <input type="range" className="am-range" min={12} max={84} step={12} value={months}
            style={{ '--rng-pct': monthsPct + '%' }}
            onChange={e => setMonths(+e.target.value)}/>
        </div>
      </div>
    </div>
  );
};

// ── Price history chart ───────────────────────────────────────────
const PriceHistoryChart = ({ values }) => {
  const w = 320, h = 130;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - ((v - min) / range) * (h - 30) - 15,
  ]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  const area = line + ` L${w},${h} L0,${h} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ direction: 'ltr', display: 'block' }}>
      <defs>
        <linearGradient id="phc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1="0" y1={h * t + 5} x2={w} y2={h * t + 5} stroke="var(--line)" strokeDasharray="2 4"/>
      ))}
      <path d={area} fill="url(#phc)"/>
      <path d={line} stroke="var(--accent)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="6" fill="var(--accent)"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill="#fff"/>
    </svg>
  );
};

// ── SimilarCard ── horizontal mini-card used in detail carousel ──
const SimilarCard = ({ vehicle: s, saved, onSave, onClick }) => (
  <div onClick={onClick} className="press" style={{
    flexShrink: 0, width: 200, scrollSnapAlign: 'start',
    background: 'var(--sheet)', borderRadius: 14,
    border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden', cursor: 'pointer',
  }}>
    <div style={{ position: 'relative' }}>
      <CarVisual vehicle={s} height={110} radius={0}/>
      <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="press" style={{
        position: 'absolute', top: 8, insetInlineEnd: 8,
        width: 28, height: 28, borderRadius: 999, border: 0,
        background: 'rgba(255,255,255,0.95)',
        color: saved ? 'var(--accent)' : 'var(--ink-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={saved ? 'heart-fill' : 'heart'} size={13}/>
      </button>
    </div>
    <div style={{ padding: '10px 12px 12px' }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--ink)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        letterSpacing: '-0.01em',
      }}>{s.make} {s.model}</div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>
        <span className="num">{s.year}</span> · <span className="num">{fmt(s.km/1000)}K</span> ק״מ
      </div>
      <div className="num" style={{
        marginTop: 8, fontSize: 15, fontWeight: 800, color: 'var(--ink)',
        letterSpacing: '-0.015em',
      }}>{fmtPrice(s.price)}</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN: Vehicle Detail
// ═══════════════════════════════════════════════════════════════════
const VehicleDetail = ({ vehicle: v, saved, onSave, onBack, onOpenVehicle, savedIds = [], onToggleSave }) => {
  const [showFinance, setShowFinance] = React.useState(false);
  const [imageIdx, setImageIdx] = React.useState(0);
  // similar = same body/fuel, different id, up to 4
  const similar = window.AM_DATA.VEHICLES
    .filter(x => x.id !== v.id && (x.body === v.body || x.fuel === v.fuel))
    .slice(0, 4);
  // mock seller stats (deterministic from id hash)
  const sellerStars = 4 + ((v.id.charCodeAt(1) || 0) % 10) / 10;
  const sellerListings = 1 + ((v.id.charCodeAt(1) || 0) % 8);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: 'var(--bg-warm)' }}>
      {/* header overlay */}
      <div style={{
        position: 'absolute', top: 0, insetInline: 0, zIndex: 10,
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between', gap: 8,
      }}>
        <button onClick={onBack} className="press" style={{
          width: 40, height: 40, borderRadius: 999, border: 0,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          color: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Icon name="chevron-right" size={18}/>
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="press" style={{
            width: 40, height: 40, borderRadius: 999, border: 0,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            color: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Icon name="share" size={16}/>
          </button>
          <button onClick={onSave} className="press" style={{
            width: 40, height: 40, borderRadius: 999, border: 0,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            color: saved ? 'var(--accent)' : 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Icon name={saved ? 'heart-fill' : 'heart'} size={16}/>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 96 }} className="no-scrollbar">
        {/* hero — clean white background, no tinted section */}
        <div style={{ background: 'var(--sheet-2)', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <CarVisual vehicle={v} height={300} showSpec={false}/>
            <div style={{
              position: 'absolute', bottom: 16, insetInline: 0,
              display: 'flex', justifyContent: 'center', gap: 6,
            }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} onClick={() => setImageIdx(i)} style={{
                  width: i === imageIdx ? 22 : 6, height: 6, borderRadius: 999,
                  background: i === imageIdx ? 'var(--accent)' : 'rgba(255,255,255,0.7)',
                  transition: 'width 200ms ease',
                }}/>
              ))}
            </div>
            <div className="num" style={{
              position: 'absolute', bottom: 14, insetInlineStart: 18,
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              fontSize: 11, fontWeight: 700, color: 'var(--ink)',
            }}>{imageIdx + 1}/{v.images}</div>
            <div style={{ position: 'absolute', top: 68, insetInlineStart: 16 }}>
              <SourceTag source={v.source}/>
            </div>
          </div>
        </div>

        {/* content */}
        <div style={{ padding: '20px 16px 0' }}>
          {/* title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '0 4px' }}>
            <div style={{ flex: 1 }}>
              <h1 className="h-display" style={{ margin: 0, fontSize: 22 }}>{v.make} {v.model}</h1>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3, fontWeight: 500 }}>{v.trim}</div>
            </div>
            <Tag kind={v.badgeKind} size="md">{v.badge}</Tag>
          </div>

          {/* hero price card */}
          <div style={{
            marginTop: 16, padding: 18, borderRadius: 22,
            background: 'var(--sheet)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div className="eyebrow">מחיר</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
              <span className="num h-display" style={{ fontSize: 34 }}>{fmtPrice(v.price)}</span>
              {v.priceDelta < 0 && (
                <span className="num" style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: 'var(--good-bg)', color: 'var(--good)',
                  fontSize: 11.5, fontWeight: 700,
                }}>↓ ₪{fmt(Math.abs(v.priceDelta))}</span>
              )}
            </div>
            {v.priceDelta < 0 && (
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 6 }}>ירדה לפני 2 ימים</div>
            )}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <PriceGauge price={v.price} list={v.listPrice}/>
            </div>
          </div>

          {/* spec grid */}
          <div style={{ marginTop: 20 }}>
            <h3 className="h-title" style={{ margin: '0 4px 10px', fontSize: 15 }}>נתונים טכניים</h3>
            <div style={{
              padding: 12, borderRadius: 20, background: 'var(--sheet)',
              border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <SpecStat icon="calendar" label="שנה"  value={<span className="num">{v.year}</span>}/>
                <SpecStat icon="gauge"    label="ק״מ" value={<span className="num">{fmt(v.km)}</span>}/>
                <SpecStat icon="user"     label="יד"  value={<span className="num">{v.hand}</span>}/>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <SpecStat icon={v.fuel === 'חשמלי' ? 'lightning' : 'fuel'} label="מנוע" value={v.spec.engine}/>
                <SpecStat icon="trend-up" label="הספק"  value={v.spec.power}/>
                <SpecStat icon="sparkle"  label="0-100" value={v.spec.accel}/>
              </div>
            </div>
          </div>

          {/* price history */}
          <div style={{ marginTop: 20 }}>
            <h3 className="h-title" style={{ margin: '0 4px 10px', fontSize: 15 }}>היסטוריית מחיר</h3>
            <div style={{
              padding: 16, borderRadius: 20, background: 'var(--sheet)',
              border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
            }}>
              <div className="eyebrow">30 ימים אחרונים</div>
              <div className="num h-display" style={{ fontSize: 20, marginTop: 4 }}>
                ↓ ₪{fmt(v.history[0] - v.history[v.history.length - 1])}
              </div>
              <div style={{ marginTop: 12 }}>
                <PriceHistoryChart values={v.history}/>
              </div>
            </div>
          </div>

          {/* description */}
          <div style={{ marginTop: 20 }}>
            <h3 className="h-title" style={{ margin: '0 4px 10px', fontSize: 15 }}>תיאור המוכר</h3>
            <div style={{
              padding: 16, borderRadius: 20, background: 'var(--sheet)',
              border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
              fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', textWrap: 'pretty',
            }}>{v.desc}</div>
          </div>

          {/* seller / dealer card */}
          <div style={{ marginTop: 20 }}>
            <h3 className="h-title" style={{ margin: '0 4px 10px', fontSize: 15 }}>על המוכר</h3>
            <div style={{
              padding: 16, borderRadius: 20,
              background: 'var(--sheet)',
              border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: v.seller === 'פרטי' ? 'var(--accent-soft)' : 'var(--ink)',
                  color: v.seller === 'פרטי' ? 'var(--accent-ink)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800,
                }}>{v.seller === 'פרטי' ? 'א' : 'ס'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                    {v.seller === 'פרטי' ? 'מוכר פרטי' : 'סוכנות מורשית'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
                          fill={i <= Math.round(sellerStars) ? 'var(--warn)' : 'var(--line-2)'}>
                          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="num" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-2)' }}>
                      {sellerStars.toFixed(1)}
                    </span>
                    <span style={{ width: 2, height: 2, borderRadius: 999, background: 'var(--ink-4)' }}/>
                    <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                      <span className="num">{sellerListings}</span> מודעות פעילות
                    </span>
                  </div>
                </div>
                <Icon name="chevron-left" size={16} color="var(--ink-3)"/>
              </div>
              {/* divider */}
              <div style={{ height: 1, background: 'var(--line)', margin: '14px 0' }}/>
              {/* location row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="pin" size={15} color="var(--ink-3)"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{v.location}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{v.region}</div>
                </div>
                <button className="press" style={{
                  height: 30, padding: '0 10px', borderRadius: 8,
                  background: 'var(--sheet-2)', border: '1px solid var(--line-2)',
                  fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <Icon name="navigate" size={12}/>
                  ניווט
                </button>
              </div>
            </div>
          </div>

          {/* similar vehicles */}
          {similar.length > 0 && onOpenVehicle && (
            <div style={{ marginTop: 20, marginBottom: 24, marginInline: -16 }}>
              <h3 className="h-title" style={{ margin: '0 20px 12px', fontSize: 15 }}>רכבים דומים</h3>
              <div style={{
                display: 'flex', gap: 12, overflowX: 'auto',
                paddingInline: 16, paddingBottom: 4, scrollSnapType: 'inline mandatory',
              }} className="no-scrollbar">
                {similar.map(s => (
                  <SimilarCard key={s.id} vehicle={s}
                    saved={savedIds.includes(s.id)}
                    onSave={() => onToggleSave && onToggleSave(s.id)}
                    onClick={() => onOpenVehicle(s.id)}/>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* bottom action */}
      <div style={{
        position: 'absolute', insetInline: 0, bottom: 0,
        padding: '12px 16px 18px',
        background: 'rgba(246,242,236,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--line)',
        display: 'flex', gap: 10,
      }}>
        <button onClick={() => setShowFinance(true)} className="press" style={{
          flex: 1.2, height: 52, borderRadius: 14, border: '1px solid var(--line)',
          background: 'var(--sheet)', color: 'var(--ink)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0 12px',
        }}>
          <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600 }}>החל מ-</span>
          <span className="num" style={{ fontSize: 13.5, fontWeight: 700 }}>
            ₪{fmt(Math.round((v.price * 0.7 * 0.065/12) / (1 - Math.pow(1.005417, -60))))} / חודש
          </span>
        </button>
        <button className="press" style={{
          flex: 1, height: 52, borderRadius: 14, border: 0,
          background: 'var(--accent)', color: '#fff',
          fontSize: 14, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: 'var(--shadow-brand)',
        }}>
          <Icon name="phone" size={17}/>
          צור קשר
        </button>
      </div>

      {showFinance && <FinanceModal price={v.price} onClose={() => setShowFinance(false)}/>}
    </div>
  );
};

window.VehicleDetail = VehicleDetail;
