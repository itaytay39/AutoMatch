// AutoMatch — Filter sheet (ProTrip business pass)
// Chips: square radius, --ink when active (high contrast)
// Sections: eyebrow header + tighter spacing
// DualRange: single track with two thumbs overlaid (proper visual)
// Apply: 14px radius pill, not 999 — more business

const FILTER_DEFAULTS = {
  body: [], fuel: [], gearbox: 'any',
  yearMin: 2018, yearMax: 2024,
  priceMin: 30000, priceMax: 250000,
  kmMax: 200000,
  hand: 'any',
  region: [], sources: [],
};

function activeFilterCount(f) {
  let n = 0;
  if (f.body.length) n++;
  if (f.fuel.length) n++;
  if (f.gearbox !== 'any') n++;
  if (f.yearMin !== FILTER_DEFAULTS.yearMin || f.yearMax !== FILTER_DEFAULTS.yearMax) n++;
  if (f.priceMin !== FILTER_DEFAULTS.priceMin || f.priceMax !== FILTER_DEFAULTS.priceMax) n++;
  if (f.kmMax !== FILTER_DEFAULTS.kmMax) n++;
  if (f.hand !== 'any') n++;
  if (f.region.length) n++;
  if (f.sources.length) n++;
  return n;
}

function filterVehicles(vehicles, q, f) {
  return vehicles.filter(v => {
    if (q && q.trim()) {
      const blob = `${v.make} ${v.model} ${v.trim} ${v.location} ${v.fuel} ${v.body}`.toLowerCase();
      if (!blob.includes(q.trim().toLowerCase())) return false;
    }
    if (f.body.length && !f.body.includes(v.body)) return false;
    if (f.fuel.length && !f.fuel.includes(v.fuel)) return false;
    if (f.gearbox !== 'any' && v.gearbox !== f.gearbox) return false;
    if (v.year < f.yearMin || v.year > f.yearMax) return false;
    if (v.price < f.priceMin || v.price > f.priceMax) return false;
    if (v.km > f.kmMax) return false;
    if (f.hand !== 'any' && v.hand !== f.hand) return false;
    if (f.region.length && !f.region.includes(v.region)) return false;
    if (f.sources.length && !f.sources.includes(v.source)) return false;
    return true;
  });
}

// ── Chip ──────────────────────────────────────────────────────────
const ChipGroup = ({ options, value, onChange, multi = true }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {options.map(opt => {
      const v = typeof opt === 'string' ? opt : opt.value;
      const label = typeof opt === 'string' ? opt : opt.label;
      const active = multi ? value.includes(v) : value === v;
      return (
        <button key={v} onClick={() => {
          if (multi) onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
          else onChange(active ? 'any' : v);
        }} className="press" style={{
          padding: '8px 14px', borderRadius: 10,
          background: active ? 'var(--ink)' : 'var(--sheet)',
          color: active ? '#fff' : 'var(--ink)',
          border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line-2)'),
          fontSize: 13, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          {active && <Icon name="check" size={13}/>}
          {label}
        </button>
      );
    })}
  </div>
);

// ── DualRange — proper two-thumb on single track ─────────────────
const DualRange = ({ min, max, step, valMin, valMax, onChange, format }) => {
  const pctMin = ((valMin - min) / (max - min)) * 100;
  const pctMax = ((valMax - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="num" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{format(valMin)}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>—</span>
        <span className="num" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{format(valMax)}</span>
      </div>
      <div style={{ position: 'relative', height: 24, direction: 'ltr' }}>
        {/* base track */}
        <div style={{
          position: 'absolute', top: 9, insetInline: 0, height: 6, borderRadius: 999,
          background: 'var(--sheet-3)',
        }}/>
        {/* fill between thumbs */}
        <div style={{
          position: 'absolute', top: 9, height: 6, borderRadius: 999,
          background: 'var(--accent)',
          left: pctMin + '%', width: (pctMax - pctMin) + '%',
        }}/>
        {/* invisible inputs stacked */}
        <input type="range" min={min} max={max} step={step} value={valMin}
          onChange={e => onChange(Math.min(+e.target.value, valMax - step), valMax)}
          style={dualThumbStyle}/>
        <input type="range" min={min} max={max} step={step} value={valMax}
          onChange={e => onChange(valMin, Math.max(+e.target.value, valMin + step))}
          style={dualThumbStyle}/>
      </div>
    </div>
  );
};

const dualThumbStyle = {
  position: 'absolute', insetInline: 0, top: 0, height: 24,
  background: 'transparent', WebkitAppearance: 'none', appearance: 'none',
  pointerEvents: 'none', margin: 0, padding: 0,
};

// Use a global style block to make the invisible inputs' thumbs visible & interactive
(() => {
  if (document.getElementById('am-dual-range-css')) return;
  const s = document.createElement('style');
  s.id = 'am-dual-range-css';
  s.textContent = `
    input[type="range"][style*="pointer-events: none"]::-webkit-slider-runnable-track { background:transparent; height:6px; }
    input[type="range"][style*="pointer-events: none"]::-webkit-slider-thumb {
      -webkit-appearance:none; appearance:none;
      width:22px; height:22px; border-radius:999px;
      background: var(--sheet); border:2px solid var(--accent);
      box-shadow: 0 2px 6px rgba(52,80,232,0.25);
      pointer-events:auto; cursor:pointer; margin-top:-8px;
    }
    input[type="range"][style*="pointer-events: none"]::-moz-range-track { background:transparent; height:6px; }
    input[type="range"][style*="pointer-events: none"]::-moz-range-thumb {
      width:22px; height:22px; border-radius:999px;
      background: var(--sheet); border:2px solid var(--accent);
      box-shadow: 0 2px 6px rgba(52,80,232,0.25);
      pointer-events:auto; cursor:pointer;
    }
  `;
  document.head.appendChild(s);
})();

// ── Single range ─────────────────────────────────────────────────
const RangeRow = ({ value, min, max, step, onChange, format }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>עד</span>
        <span className="num" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{format(value)}</span>
      </div>
      <input type="range" className="am-range"
        min={min} max={max} step={step} value={value}
        style={{ '--rng-pct': pct + '%' }}
        onChange={e => onChange(+e.target.value)}/>
    </div>
  );
};

// ── Section ──────────────────────────────────────────────────────
const FilterSection = ({ title, children }) => (
  <div style={{ marginBottom: 22 }}>
    <div className="eyebrow" style={{ marginBottom: 10 }}>{title}</div>
    {children}
  </div>
);

// ── Sheet ────────────────────────────────────────────────────────
const FilterSheet = ({ filters, onChange, onClose, onApply, resultCount }) => {
  const f = filters;
  const set = (k, v) => onChange({ ...f, [k]: v });
  const reset = () => onChange({ ...FILTER_DEFAULTS });
  const count = activeFilterCount(f);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
      <div onClick={onClose} className="am-fade-in" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(20,18,14,0.45)', backdropFilter: 'blur(3px)',
      }}/>

      <div className="am-slide-up" style={{
        position: 'absolute', insetInline: 0, bottom: 0, top: 50,
        background: 'var(--bg-warm)',
        borderRadius: '22px 22px 0 0',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--sheet-3)' }}/>
        </div>

        {/* Header */}
        <div style={{
          padding: '8px 20px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--line)',
        }}>
          <div>
            <h2 className="h-display" style={{ margin: 0, fontSize: 20 }}>סינון</h2>
            {count > 0 && (
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2, fontWeight: 500 }}>
                <span className="num">{count}</span> מסננים פעילים
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={reset} className="press" style={{
              background: 'transparent', border: '1px solid var(--line-2)',
              padding: '6px 12px', borderRadius: 10,
              fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600,
            }}>איפוס</button>
            <button onClick={onClose} className="press" style={{
              background: 'var(--sheet)', border: '1px solid var(--line-2)',
              width: 34, height: 34, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)',
            }}><Icon name="close" size={15}/></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 20px' }} className="no-scrollbar">
          <FilterSection title="סוג רכב">
            <ChipGroup options={['סדאן', 'האצ׳בק', 'קרוסאובר', 'סטיישן']}
              value={f.body} onChange={v => set('body', v)}/>
          </FilterSection>
          <FilterSection title="סוג מנוע">
            <ChipGroup options={['בנזין', 'היברידי', 'חשמלי', 'דיזל']}
              value={f.fuel} onChange={v => set('fuel', v)}/>
          </FilterSection>
          <FilterSection title="טווח מחיר">
            <DualRange min={30000} max={300000} step={5000}
              valMin={f.priceMin} valMax={f.priceMax}
              onChange={(a, b) => onChange({ ...f, priceMin: a, priceMax: b })}
              format={v => `₪${(v/1000).toFixed(0)}K`}/>
          </FilterSection>
          <FilterSection title="שנת ייצור">
            <DualRange min={2010} max={2024} step={1}
              valMin={f.yearMin} valMax={f.yearMax}
              onChange={(a, b) => onChange({ ...f, yearMin: a, yearMax: b })}
              format={v => v}/>
          </FilterSection>
          <FilterSection title="קילומטראז'">
            <RangeRow value={f.kmMax} min={20000} max={300000} step={10000}
              onChange={v => set('kmMax', v)} format={v => `${(v/1000).toFixed(0)}K ק״מ`}/>
          </FilterSection>
          <FilterSection title="יד">
            <ChipGroup multi={false} value={f.hand} onChange={v => set('hand', v)}
              options={[
                { value: 'any', label: 'הכל' },
                { value: 1, label: 'יד 1' },
                { value: 2, label: 'יד 2' },
                { value: 3, label: 'יד 3+' },
              ]}/>
          </FilterSection>
          <FilterSection title="אזור">
            <ChipGroup options={['צפון', 'מרכז', 'ירושלים', 'דרום']}
              value={f.region} onChange={v => set('region', v)}/>
          </FilterSection>
          <FilterSection title="מקור המודעה">
            <ChipGroup
              options={Object.entries(window.AM_DATA.SOURCES).map(([k, v]) => ({ value: k, label: v.name }))}
              value={f.sources} onChange={v => set('sources', v)}/>
          </FilterSection>
        </div>

        {/* Apply */}
        <div style={{
          padding: '12px 20px 18px',
          background: 'rgba(246,242,236,0.94)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--line)',
        }}>
          <button onClick={onApply} className="press" style={{
            width: '100%', height: 52, borderRadius: 14, border: 0,
            background: 'var(--accent)', color: '#fff',
            fontSize: 14, fontWeight: 700, letterSpacing: 0.2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: 'var(--shadow-brand)',
          }}>
            הצג <span className="num">{resultCount}</span> תוצאות
            <Icon name="chevron-left" size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
};

window.AM_FILTERS = { FILTER_DEFAULTS, activeFilterCount, filterVehicles, FilterSheet };
