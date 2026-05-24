// AutoMatch — VehicleCard v2 (ProTrip editorial pattern)
// Improvements over v1:
//   • Image is edge-to-edge top (no inner padding "card-in-card") — cleaner
//   • Source moved off the image into a small inline meta line
//   • Heart is a subtle pill button, no heavy shadow
//   • Price gets its own emphasized row, delta as a colored chip beside it
//   • Spec row uses thin separators + icon prefix for legibility
//   • Bottom strip is a single quiet line: 30-day trend with sparkline + %
// API unchanged: <VehicleCard vehicle saved onSave onClick compact/>

const { Tag, Sparkline, fmt, fmtPrice } = window.AM_UI;

const VehicleCard = ({ vehicle: v, saved, onSave, onClick, compact = false }) => {
  const trendUp = v.deltaPct > 0;
  const source = window.AM_DATA.SOURCES[v.source];
  const isFresh = v.postedDays <= 1;

  return (
    <div onClick={onClick} className="press" style={{
      background: 'var(--sheet)',
      borderRadius: 20,
      overflow: 'hidden',
      cursor: 'pointer',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* ── Image, edge-to-edge ─────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <CarVisual vehicle={v} height={compact ? 168 : 192} radius={0}/>

        {/* Heart — subtle floating pill */}
        <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="press" style={{
          position: 'absolute', top: 12, insetInlineEnd: 12,
          width: 34, height: 34, borderRadius: 999, border: 0,
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          color: saved ? 'var(--accent)' : 'var(--ink-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={saved ? 'heart-fill' : 'heart'} size={16}/>
        </button>

        {/* "חדש היום" — top-start, royal-blue, business tone */}
        {isFresh && (
          <div style={{
            position: 'absolute', top: 12, insetInlineStart: 12,
            padding: '4px 10px', borderRadius: 6,
            background: 'var(--accent)', color: '#fff',
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            textTransform: 'uppercase',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: '#fff' }}/>
            {v.postedDays === 0 ? 'חדש היום' : 'אתמול'}
          </div>
        )}

        {/* Photo count — bottom-end, like real listing sites */}
        <div className="num" style={{
          position: 'absolute', bottom: 10, insetInlineEnd: 12,
          padding: '3px 8px', borderRadius: 4,
          background: 'rgba(20,18,14,0.65)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          color: '#fff', fontSize: 10.5, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Icon name="camera" size={11}/>
          {v.images || 12}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 14px' }}>
        {/* meta line: source + location */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: 'var(--ink-3)', fontWeight: 600,
          marginBottom: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: source.color }}/>
          <span>{source.name}</span>
          <span style={{ width: 2, height: 2, borderRadius: 999, background: 'var(--ink-4)' }}/>
          <span>{v.location}</span>
          <span style={{ flex: 1 }}/>
          <Tag kind={v.badgeKind} size="sm">{v.badge}</Tag>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 16.5, fontWeight: 700, color: 'var(--ink)',
          letterSpacing: '-0.015em', lineHeight: 1.25,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {v.make} {v.model} <span style={{ fontWeight: 500, color: 'var(--ink-2)' }}>{v.trim}</span>
        </div>

        {/* Spec strip — small, dense, with subtle separators */}
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 0,
          fontSize: 12, color: 'var(--ink-2)', fontWeight: 500,
        }}>
          <SpecBit icon="calendar"><span className="num">{v.year}</span></SpecBit>
          <Sep/>
          <SpecBit icon="gauge"><span className="num">{fmt(v.km)}</span> ק״מ</SpecBit>
          <Sep/>
          <SpecBit icon="user">יד <span className="num">{v.hand}</span></SpecBit>
        </div>

        {/* Price row — anchored */}
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          {/* left: 30-day trend mini */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkline values={v.history} up={trendUp} w={50} h={18}/>
            <span className="num" style={{
              fontSize: 11.5, fontWeight: 700,
              color: trendUp ? 'var(--bad)' : 'var(--good)',
            }}>{trendUp ? '↑' : '↓'} {Math.abs(v.deltaPct).toFixed(1)}%</span>
          </div>

          {/* right: price + delta chip */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0 }}>
            {v.priceDelta < 0 && (
              <span className="num" style={{
                padding: '2px 7px', borderRadius: 6,
                background: 'var(--good-bg)', color: 'var(--good)',
                fontSize: 11, fontWeight: 700,
              }}>↓ ₪{fmt(Math.abs(v.priceDelta))}</span>
            )}
            <span className="num" style={{
              fontSize: 22, fontWeight: 800, color: 'var(--ink)',
              letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              {fmtPrice(v.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── tiny helpers ─────────────────────────────────────────────────
const SpecBit = ({ icon, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <Icon name={icon} size={12} color="var(--ink-3)"/>
    {children}
  </span>
);
const Sep = () => (
  <span style={{
    width: 1, height: 10, background: 'var(--line-2)',
    margin: '0 8px', flexShrink: 0,
  }}/>
);

window.VehicleCard = VehicleCard;
