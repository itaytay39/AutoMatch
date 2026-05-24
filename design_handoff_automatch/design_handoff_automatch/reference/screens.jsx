// AutoMatch — restyled screens (Home, Saved, Alerts)
// Same window.AM_SCREENS contract as the original.

const { Tag, Sparkline, SourceTag, Card, SectionHeader, IconBadge, FAB, EmptyState, fmt, fmtPrice } = window.AM_UI;

// ── Insight area chart (kept — same shape, new color) ─────────────
const InsightAreaChart = ({ values, color = 'var(--accent)' }) => {
  const w = 280, h = 80;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - ((v - min) / range) * (h - 12) - 6,
  ]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  const area = line + ` L${w},${h} L0,${h} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ direction: 'ltr', display: 'block' }}>
      <defs>
        <linearGradient id="ic-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ic-grad)"/>
      <path d={line} stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="4" fill={color}/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2" fill="#fff"/>
    </svg>
  );
};

// ── Stat tile ─────────────────────────────────────────────────────
const StatTile = ({ label, value, sub, tone = 'neutral', subColor = 'var(--ink-3)' }) => (
  <Card padded={false} style={{ padding: 14 }}>
    <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>{label}</div>
    <div className="num" style={{
      fontSize: 24, fontWeight: 800, color: 'var(--ink)',
      marginTop: 4, lineHeight: 1.05,
    }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: subColor, fontWeight: 600, marginTop: 4 }}>{sub}</div>}
  </Card>
);

// ── RecentThumb — horizontal mini card for "recently viewed" ─────
const RecentThumb = ({ vehicle: v, onClick }) => (
  <div onClick={onClick} className="press" style={{
    flexShrink: 0, width: 156, scrollSnapAlign: 'start',
    background: 'var(--sheet)', borderRadius: 14,
    border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden', cursor: 'pointer',
  }}>
    <CarVisual vehicle={v} height={84} radius={0}/>
    <div style={{ padding: '8px 10px 10px' }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: 'var(--ink)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        letterSpacing: '-0.01em',
      }}>{v.make} {v.model}</div>
      <div className="num" style={{
        marginTop: 4, fontSize: 13, fontWeight: 800, color: 'var(--ink)',
      }}>{fmtPrice(v.price)}</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// 1. HOME
// ═══════════════════════════════════════════════════════════════════
const HomeScreen = ({ onOpenVehicle, savedIds, onToggleSave, onGoSearch, onGoAlerts, onOpenProfile, recentIds = [] }) => {
  const { VEHICLES } = window.AM_DATA;
  const fresh = VEHICLES.filter(v => v.postedDays <= 1);
  const drops = VEHICLES.filter(v => v.priceDelta < 0).slice(0, 4);
  // seed recents on first load so the section isn't empty in demo
  const recents = (recentIds.length
    ? recentIds.map(id => VEHICLES.find(v => v.id === id)).filter(Boolean)
    : VEHICLES.slice(0, 4));

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-warm)' }} className="no-scrollbar">
      {/* Top bar */}
      <div style={{
        padding: '14px 20px 8px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onOpenProfile} className="press" style={{
          width: 44, height: 44, borderRadius: 999, border: 0,
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800,
          boxShadow: 'var(--shadow-brand)',
          flexShrink: 0,
        }}>א</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>שלום איתי</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            2 רכבי יד ראשונה ירדו היום
          </div>
        </div>
        <button className="press" style={{
          width: 40, height: 40, borderRadius: 999, border: '1px solid var(--line)',
          background: 'var(--sheet)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name="search" size={18}/></button>
      </div>

      {/* HERO insight — royal-blue gradient (ProTrip pattern) */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{
          borderRadius: 24, padding: '18px 20px 20px',
          background: 'linear-gradient(155deg, #1E2A8C 0%, var(--accent) 45%, #5E78F0 100%)',
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: 'var(--shadow-brand)',
        }}>
          {/* decorative path */}
          <svg width="140" height="100" viewBox="0 0 140 100" style={{
            position: 'absolute', left: -10, top: -10, opacity: 0.22,
          }}>
            <path d="M0 90 Q 60 30 130 16" stroke="#fff" strokeWidth="1.5" strokeDasharray="3 5" fill="none"/>
            <circle cx="130" cy="16" r="3" fill="#fff"/>
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              ירידות מחיר השבוע
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
              <span className="num" style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
                3.1%
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.92 }}>ירידה ממוצעת</span>
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.88, marginTop: 6, lineHeight: 1.45 }}>
              קורולה הייבריד יד 1 ירדה ב-₪4,100 בשבוע האחרון
            </div>
            <button onClick={onGoAlerts} className="press" style={{
              marginTop: 14, height: 36, padding: '0 14px 0 16px', borderRadius: 999, border: 0,
              background: 'rgba(255,255,255,0.18)', color: '#fff',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              fontSize: 13, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              צפו בירידות <Icon name="chevron-left" size={15}/>
            </button>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ padding: '18px 20px 0' }}>
        <SectionHeader title="היום במערכת"/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <StatTile label="חדש היום" value="3" sub="● תואם חיפוש" subColor="var(--good)"/>
          <StatTile label="ירידות" value="238" sub="↑ 12 חדשות" subColor="var(--good)"/>
          <StatTile label="שמורים" value={savedIds.length || 17} sub="3 חדשים"/>
        </div>
      </div>

      {/* Recently viewed */}
      {recents.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ paddingInline: 24 }}>
            <SectionHeader title="צפית לאחרונה"/>
          </div>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto',
            paddingInline: 20, paddingBottom: 4,
            scrollSnapType: 'inline mandatory',
          }} className="no-scrollbar">
            {recents.map(v => (
              <RecentThumb key={v.id} vehicle={v} onClick={() => onOpenVehicle(v.id)}/>
            ))}
          </div>
        </div>
      )}

      {/* Fresh */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ paddingInline: 4 }}>
          <SectionHeader title="חדשים תואמים" action="הצג הכל" onAction={onGoSearch}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fresh.slice(0, 2).map(v => (
            <VehicleCard key={v.id} vehicle={v}
              saved={savedIds.includes(v.id)}
              onSave={() => onToggleSave(v.id)}
              onClick={() => onOpenVehicle(v.id)}
              compact/>
          ))}
        </div>
      </div>

      {/* Drops */}
      <div style={{ padding: '20px 16px 24px' }}>
        <div style={{ paddingInline: 4 }}>
          <SectionHeader title="ירידות מחיר חמות" action="הכל" onAction={onGoSearch}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {drops.slice(0, 2).map(v => (
            <VehicleCard key={v.id} vehicle={v}
              saved={savedIds.includes(v.id)}
              onSave={() => onToggleSave(v.id)}
              onClick={() => onOpenVehicle(v.id)}
              compact/>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// 2. SAVED
// ═══════════════════════════════════════════════════════════════════
const SavedScreen = ({ savedIds, onOpenVehicle, onToggleSave, onCompare }) => {
  const { VEHICLES } = window.AM_DATA;
  const list = VEHICLES.filter(v => savedIds.includes(v.id));
  const [compareIds, setCompareIds] = React.useState([]);
  const [compareMode, setCompareMode] = React.useState(false);
  const toggleCompare = (id) =>
    setCompareIds(s => s.includes(id) ? s.filter(x => x !== id) : (s.length < 3 ? [...s, id] : s));

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-warm)', position: 'relative' }} className="no-scrollbar">
      {/* Header */}
      <div style={{ padding: '14px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>השמורים שלך</div>
            <h1 className="h-display" style={{ margin: '4px 0 0', fontSize: 24, color: 'var(--ink)' }}>
              רכבים שאתה עוקב אחריהם
            </h1>
          </div>
          {list.length >= 2 && (
            <button onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }} className="press" style={{
              padding: '7px 12px', borderRadius: 999,
              background: compareMode ? 'var(--ink)' : 'var(--sheet)',
              color: compareMode ? '#fff' : 'var(--ink)',
              border: compareMode ? 0 : '1px solid var(--line)',
              fontSize: 12, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
            }}>
              <Icon name={compareMode ? 'close' : 'sliders'} size={13}/>
              {compareMode ? 'בטל' : 'השווה'}
            </button>
          )}
        </div>

        {/* count strip */}
        <Card padded={false} style={{
          marginTop: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span className="num" style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
            {list.length}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>רכבים שמורים</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
              {compareMode ? 'בחר 2-3 רכבים להשוואה' : 'עדכון לפני 18 דק׳'}
            </div>
          </div>
          {!compareMode && <Tag kind="good" size="sm">3 ירידות</Tag>}
        </Card>
      </div>

      {/* List */}
      <div style={{ padding: '8px 16px 30px', paddingBottom: compareMode && compareIds.length >= 2 ? 100 : 30 }}>
        {list.length === 0 ? (
          <EmptyState
            icon="bookmark"
            title="עוד אין רכבים שמורים"
            subtitle="שמור רכבים כדי לעקוב אחרי שינויי מחיר ולהשוות בקלות"
            action={() => {}}
            actionLabel="לחיפוש רכבים"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map(v => {
              const selected = compareIds.includes(v.id);
              return (
                <div key={v.id} style={{ position: 'relative' }}
                  onClick={compareMode ? () => toggleCompare(v.id) : undefined}>
                  <div style={{ pointerEvents: compareMode ? 'none' : 'auto' }}>
                    <VehicleCard vehicle={v} saved
                      onSave={() => onToggleSave(v.id)}
                      onClick={() => onOpenVehicle(v.id)}
                      compact/>
                  </div>
                  {compareMode && (
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: 20,
                      border: '2.5px solid ' + (selected ? 'var(--accent)' : 'transparent'),
                      background: selected ? 'rgba(52,80,232,0.05)' : 'transparent',
                      pointerEvents: 'none',
                      transition: 'all 180ms ease',
                    }}/>
                  )}
                  {compareMode && (
                    <div style={{
                      position: 'absolute', top: 14, insetInlineStart: 14,
                      width: 28, height: 28, borderRadius: 999,
                      background: selected ? 'var(--accent)' : 'rgba(255,255,255,0.95)',
                      color: selected ? '#fff' : 'var(--ink-3)',
                      border: '2px solid ' + (selected ? 'var(--accent)' : 'var(--line)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-num)',
                      pointerEvents: 'none',
                      transition: 'all 180ms ease',
                    }}>
                      {selected ? compareIds.indexOf(v.id) + 1 : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compare CTA */}
      {compareMode && compareIds.length >= 2 && (
        <div className="am-rise" style={{
          position: 'absolute', insetInline: 16, bottom: 16, zIndex: 5,
        }}>
          <button onClick={() => { onCompare(compareIds); setCompareMode(false); setCompareIds([]); }}
            className="press" style={{
              width: '100%', height: 52, borderRadius: 999, border: 0,
              background: 'var(--accent)', color: '#fff',
              fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 12px 28px rgba(52,80,232,0.4)',
            }}>
            <Icon name="sliders" size={17}/>
            השווה <span className="num">{compareIds.length}</span> רכבים
          </button>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// 3. ALERTS
// ═══════════════════════════════════════════════════════════════════
const AlertsScreen = ({ onAdd }) => {
  const { ALERTS } = window.AM_DATA;
  const totalMatches = ALERTS.reduce((s, a) => s + a.matches, 0);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-warm)', position: 'relative' }} className="no-scrollbar">
      {/* Header */}
      <div style={{ padding: '14px 20px 16px' }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>התראות פעילות</div>
        <h1 className="h-display" style={{ margin: '4px 0 0', fontSize: 24, color: 'var(--ink)' }}>
          תקבל הודעה ברגע שיש התאמה
        </h1>

        <Card padded={false} style={{
          marginTop: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <IconBadge tone="accent" size={40} radius={12}><Icon name="bell" size={18}/></IconBadge>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>
              <span className="num">{totalMatches}</span> התאמות חדשות השבוע
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
              קורולה הייבריד הוסיפה התאמה לפני 18 דק׳
            </div>
          </div>
        </Card>
      </div>

      {/* List */}
      <div style={{ padding: '6px 16px 100px' }}>
        <div style={{ paddingInline: 4 }}>
          <SectionHeader title="ההתראות שלי"/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ALERTS.map(a => (
            <Card key={a.id} padded={false} style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <IconBadge tone="accent" size={36} radius={10}><Icon name="bell" size={15}/></IconBadge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{a.title}</div>
                </div>
                <Tag kind="good" size="sm"><span className="num">{a.matches}</span> חדשים</Tag>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {a.filters.map(f => <Tag key={f} size="sm">{f}</Tag>)}
              </div>
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: '1px solid var(--line)',
                fontSize: 11.5, color: 'var(--ink-3)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Icon name="clock" size={13} color="var(--ink-3)"/>
                התאמה אחרונה: <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{a.lastMatch}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <FAB icon="plus" label="התראה חדשה" onClick={onAdd}/>
    </div>
  );
};

window.AM_SCREENS = { HomeScreen, SavedScreen, AlertsScreen };
