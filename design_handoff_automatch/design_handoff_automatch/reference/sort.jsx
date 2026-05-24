// Sort menu — action sheet

const SORT_OPTIONS = [
  { id: 'rel', label: 'רלוונטיות', sub: 'ההתאמה הטובה ביותר', icon: 'sparkle' },
  { id: 'price-asc', label: 'מחיר: נמוך לגבוה', icon: 'arrow-up' },
  { id: 'price-desc', label: 'מחיר: גבוה לנמוך', icon: 'arrow-down' },
  { id: 'newest', label: 'הכי חדשים', sub: 'תאריך פרסום', icon: 'calendar' },
  { id: 'year', label: 'שנת ייצור: חדש לישן', icon: 'calendar' },
  { id: 'km', label: 'קילומטראז׳: נמוך לגבוה', icon: 'gauge' },
  { id: 'drop', label: 'ירדו במחיר השבוע', icon: 'trend-down' },
];

const SortSheet = ({ active, onPick, onClose }) => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 150 }}>
    <div onClick={onClose} className="am-fade-in" style={{
      position: 'absolute', inset: 0, background: 'rgba(27,30,27,0.32)', backdropFilter: 'blur(2px)',
    }}/>
    <div className="am-slide-up" style={{
      position: 'absolute', insetInline: 0, bottom: 0,
      background: 'var(--sheet)',
      borderRadius: '22px 22px 0 0',
      padding: '12px 0 20px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line-2)' }}/>
      </div>
      <h3 className="h-display" style={{ margin: '8px 22px 14px', fontSize: 20 }}>מיון לפי</h3>

      {SORT_OPTIONS.map((opt) => {
        const isActive = active === opt.id;
        return (
          <button key={opt.id} onClick={() => onPick(opt.id)} className="press" style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 22px', background: 'none',
            border: 'none', textAlign: 'right',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: isActive ? 'var(--accent)' : 'var(--sheet-2)',
              color: isActive ? '#fff' : 'var(--ink-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={opt.icon} size={15}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: 'var(--ink)' }}>{opt.label}</div>
              {opt.sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{opt.sub}</div>}
            </div>
            {isActive && (
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="check" size={13}/>
              </div>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

function sortVehicles(list, sortId) {
  const c = [...list];
  switch (sortId) {
    case 'price-asc': return c.sort((a, b) => a.price - b.price);
    case 'price-desc': return c.sort((a, b) => b.price - a.price);
    case 'newest': return c.sort((a, b) => a.postedDays - b.postedDays);
    case 'year': return c.sort((a, b) => b.year - a.year);
    case 'km': return c.sort((a, b) => a.km - b.km);
    case 'drop': return c.sort((a, b) => a.priceDelta - b.priceDelta);
    default: return c;
  }
}

window.SortSheet = SortSheet;
window.SORT_OPTIONS = SORT_OPTIONS;
window.sortVehicles = sortVehicles;
