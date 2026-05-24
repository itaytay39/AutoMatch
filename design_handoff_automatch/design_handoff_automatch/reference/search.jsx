// Search — light theme

const { Tag, SourceTag, Card, SectionHeader, fmt, fmtPrice } = window.AM_UI;

const SmartSearchBar = ({ value, onChange, onFocus, onSubmit, onFilterClick, autoFocus, filterCount = 0 }) => {
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (autoFocus && inputRef.current) inputRef.current.focus(); }, [autoFocus]);
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{
        flex: 1, position: 'relative',
        background: 'var(--sheet)',
        borderRadius: 999, height: 52,
        display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <Icon name="search" size={20} color="var(--ink-3)"/>
        <input
          ref={inputRef} value={value} onChange={e => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={e => { if (e.key === 'Enter') onSubmit?.(value); }}
          placeholder="חפש לפי יצרן, דגם, עיר..."
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--ink)', fontSize: 15, fontFamily: 'var(--font-he)',
            textAlign: 'right', direction: 'rtl',
          }}
        />
        {value && (
          <button onClick={() => onChange('')} className="press" style={{
            background: 'rgba(27,30,27,0.06)', border: 'none', padding: 4,
            width: 24, height: 24, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="close" size={14} color="var(--ink-2)"/>
          </button>
        )}
      </div>
      <button onClick={onFilterClick} className="press" style={{
        position: 'relative',
        width: 52, height: 52, borderRadius: '50%',
        background: filterCount ? 'var(--accent)' : 'var(--sheet)',
        color: filterCount ? 'var(--on-accent)' : 'var(--ink)',
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: 'var(--shadow-sm)',
      }}>
        <Icon name="sliders" size={20}/>
        {filterCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, insetInlineEnd: -2,
            minWidth: 20, height: 20, padding: '0 5px',
            borderRadius: 999, background: 'var(--sheet)', color: 'var(--accent)',
            fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-num)',
            border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{filterCount}</span>
        )}
      </button>
    </div>
  );
};

const AutocompletePanel = ({ query, onPick }) => {
  const { SUGGEST, RECENT_SEARCHES } = window.AM_DATA;
  const filtered = query.trim()
    ? SUGGEST.filter(s => s.text.toLowerCase().includes(query.toLowerCase()) || s.text.includes(query))
    : [];

  const item = (icon, text, meta, onClick, key) => (
    <button key={key} onClick={onClick} className="press" style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '13px 8px', background: 'none', border: 'none',
      borderBottom: '1px solid var(--line)',
      textAlign: 'right',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: 'var(--accent-soft)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent)',
      }}>
        <Icon name={icon} size={16}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
        {meta && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{meta}</div>}
      </div>
      <Icon name="chevron-left" size={16} color="var(--ink-4)"/>
    </button>
  );

  return (
    <div className="am-fade-in" style={{ flex: 1, overflow: 'auto', padding: '4px 16px 16px' }}>
      {query.trim() === '' ? (
        <>
          <div className="eyebrow" style={{ margin: '12px 4px 4px' }}>חיפושים אחרונים</div>
          {RECENT_SEARCHES.map((r, i) => item('search', r, null, () => onPick(r), 'r'+i))}
          <div className="eyebrow" style={{ margin: '20px 4px 4px' }}>פופולרי השבוע</div>
          {SUGGEST.filter(s => s.type === 'query').map((s, i) =>
            item('flame', s.text, s.meta, () => onPick(s.text), 'q'+i))}
          <div className="eyebrow" style={{ margin: '20px 4px 8px' }}>עיון לפי יצרן</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGEST.filter(s => s.type === 'make').map((s) => (
              <button key={s.text} onClick={() => onPick(s.text)} className="press" style={{
                padding: '9px 16px', borderRadius: 999,
                background: 'var(--sheet)', border: '1px solid var(--line)',
                color: 'var(--ink)', fontSize: 13, fontWeight: 500,
              }}>{s.text}</button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="eyebrow" style={{ margin: '12px 4px 4px' }}>הצעות</div>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px 4px', color: 'var(--ink-3)', fontSize: 14, textAlign: 'center' }}>
              אין התאמות. נסה חיפוש חופשי או פילטרים.
            </div>
          ) : (
            filtered.map((s, i) => item(
              s.type === 'make' ? 'car' : s.type === 'model' ? 'sparkle' : 'search',
              s.text, s.meta, () => onPick(s.text), 's'+i
            ))
          )}
          <div style={{ marginTop: 12 }}>
            {item('search', `חיפוש חופשי: "${query}"`, 'חיפוש בכל הטקסט', () => onPick(query), 'free')}
          </div>
        </>
      )}
    </div>
  );
};

window.AM_SEARCH = { SmartSearchBar, AutocompletePanel };
