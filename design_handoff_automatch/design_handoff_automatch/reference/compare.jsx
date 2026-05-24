// Compare screen — side-by-side comparison of 2-3 vehicles

const { fmt, fmtPrice, Tag } = window.AM_UI;

const CompareScreen = ({ vehicles, onClose, onRemove }) => {
  // pick a "winner" for each row
  const winner = {
    price: vehicles.reduce((min, v, i, arr) => v.price < arr[min].price ? i : min, 0),
    km: vehicles.reduce((min, v, i, arr) => v.km < arr[min].km ? i : min, 0),
    year: vehicles.reduce((min, v, i, arr) => v.year > arr[min].year ? i : min, 0),
    hand: vehicles.reduce((min, v, i, arr) => v.hand < arr[min].hand ? i : min, 0),
  };

  const rows = [
    { key: 'price', label: 'מחיר',  get: v => fmtPrice(v.price), winnerKey: 'price', winnerNote: 'הכי זול' },
    { key: 'badge', label: 'הערכה', get: v => v.badge, winnerKey: null },
    { key: 'year',  label: 'שנה',   get: v => v.year, winnerKey: 'year', winnerNote: 'הכי חדש' },
    { key: 'km',    label: 'ק״מ',   get: v => fmt(v.km), winnerKey: 'km', winnerNote: 'הכי פחות' },
    { key: 'hand',  label: 'יד',    get: v => v.hand, winnerKey: 'hand', winnerNote: 'יד ראשונה' },
    { key: 'fuel',  label: 'מנוע',  get: v => v.fuel },
    { key: 'body',  label: 'מרכב',  get: v => v.body },
    { key: 'gearbox', label: 'הילוכים', get: v => v.gearbox },
    { key: 'power', label: 'הספק', get: v => v.spec.power },
    { key: 'accel', label: '0-100', get: v => v.spec.accel },
    { key: 'location', label: 'מיקום', get: v => v.location },
    { key: 'source', label: 'מקור', get: v => window.AM_DATA.SOURCES[v.source].name },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-warm)' }}>
      {/* header */}
      <div style={{
        background: 'var(--bg-warm)',
        borderBottom: '1px solid var(--line)',
        padding: '14px 16px 18px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={onClose} className="press" style={{
            width: 40, height: 40, borderRadius: 12, border: '1px solid var(--line)',
            background: 'var(--sheet)', color: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="chevron-right" size={18}/>
          </button>
          <div style={{ textAlign: 'center' }}>
            <h2 className="h-display" style={{ margin: 0, fontSize: 18 }}>השוואה</h2>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
              <span className="num">{vehicles.length}</span> רכבים
            </div>
          </div>
          <div style={{ width: 40 }}/>
        </div>

        {/* cards */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${vehicles.length}, 1fr)`, gap: 8 }}>
          {vehicles.map((v, i) => (
            <div key={v.id} style={{
              background: 'var(--sheet)', borderRadius: 14,
              padding: 8, position: 'relative',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <button onClick={() => onRemove(v.id)} style={{
                position: 'absolute', top: 4, insetInlineEnd: 4, zIndex: 2,
                width: 22, height: 22, borderRadius: 999, border: 'none',
                background: 'rgba(20,18,14,0.65)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="close" size={12}/>
              </button>
              <CarVisual vehicle={v} height={60} showSpec={false} radius={8}/>
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: 'var(--ink)',
                marginTop: 6, lineHeight: 1.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {v.make} {v.model}
              </div>
              <div className="num" style={{
                fontSize: 12, fontWeight: 800, color: 'var(--accent)', marginTop: 2,
              }}>{fmtPrice(v.price)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* table */}
      <div style={{
        flex: 1, overflow: 'auto',
        background: 'var(--bg-warm)',
        borderRadius: '22px 22px 0 0',
        marginTop: -16, paddingTop: 16,
      }}>
        <div style={{ padding: '6px 16px 24px' }}>
          <div style={{
            background: 'var(--sheet)', borderRadius: 20, padding: '4px 0',
            border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
          }}>
            {rows.map((row, idx) => {
              const winIdx = row.winnerKey ? winner[row.winnerKey] : -1;
              return (
                <div key={row.key} style={{
                  display: 'grid',
                  gridTemplateColumns: `90px repeat(${vehicles.length}, 1fr)`,
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: idx < rows.length - 1 ? '1px solid var(--line)' : 'none',
                  gap: 4,
                }}>
                  <div className="eyebrow">{row.label}</div>
                  {vehicles.map((v, i) => {
                    const isWin = i === winIdx;
                    const val = row.get(v);
                    return (
                      <div key={v.id} style={{
                        padding: '6px 8px', borderRadius: 10,
                        background: isWin ? 'var(--good-bg)' : 'transparent',
                        textAlign: 'center',
                      }}>
                        <div style={{
                          fontSize: 13, fontWeight: 700,
                          color: isWin ? 'var(--good)' : 'var(--ink)',
                          fontFamily: typeof val === 'string' && val.match(/[א-ת]/) ? 'var(--font-he)' : 'var(--font-num)',
                          direction: typeof val === 'string' && val.match(/[א-ת]/) ? 'rtl' : 'ltr',
                        }}>{val}</div>
                        {isWin && row.winnerNote && (
                          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--good)', marginTop: 2 }}>
                            ✓ {row.winnerNote}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

window.CompareScreen = CompareScreen;
