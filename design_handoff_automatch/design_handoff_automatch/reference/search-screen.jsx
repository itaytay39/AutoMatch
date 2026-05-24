// Search screen — light theme

const { Tag, SourceTag, Card, EmptyState, fmt, fmtPrice } = window.AM_UI;
const { SmartSearchBar, AutocompletePanel } = window.AM_SEARCH;
const { FILTER_DEFAULTS, activeFilterCount, filterVehicles, FilterSheet } = window.AM_FILTERS;

const QUICK_CHIPS = [
  { id: 'electric', label: 'חשמלי',   apply: f => ({ ...f, fuel: ['חשמלי'] }),     check: f => f.fuel.includes('חשמלי') },
  { id: 'hybrid',   label: 'היברידי', apply: f => ({ ...f, fuel: ['היברידי'] }),    check: f => f.fuel.includes('היברידי') },
  { id: 'under150', label: 'עד 150K ₪', apply: f => ({ ...f, priceMax: 150000 }),  check: f => f.priceMax === 150000 },
  { id: 'firsthand',label: 'יד 1',     apply: f => ({ ...f, hand: 1 }),             check: f => f.hand === 1 },
  { id: 'new',      label: '2022+',    apply: f => ({ ...f, yearMin: 2022 }),       check: f => f.yearMin === 2022 },
  { id: 'cross',    label: 'קרוסאובר', apply: f => ({ ...f, body: ['קרוסאובר'] }), check: f => f.body.includes('קרוסאובר') },
];

const SearchScreen = ({
  query, setQuery, filters, setFilters,
  showAutocomplete, setShowAutocomplete,
  showFilters, setShowFilters,
  sortId, onOpenSort,
  onOpenVehicle, savedIds, onToggleSave,
  resultsActive,
}) => {
  const { VEHICLES } = window.AM_DATA;
  const filtered = filterVehicles(VEHICLES, query, filters);
  const results = window.sortVehicles(filtered, sortId || 'rel');
  const fc = activeFilterCount(filters);
  const sortLabel = (window.SORT_OPTIONS.find(s => s.id === sortId) || window.SORT_OPTIONS[0]).label;

  const pickSuggestion = (text) => { setQuery(text); setShowAutocomplete(false); };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-warm)' }}>
      <div style={{ background: 'var(--bg-warm)', padding: '8px 16px 18px' }}>
        <h1 className="h-display" style={{ margin: '6px 4px 14px', fontSize: 28 }}>חיפוש</h1>
        <SmartSearchBar
          value={query}
          onChange={(v) => { setQuery(v); setShowAutocomplete(true); }}
          onFocus={() => setShowAutocomplete(true)}
          onSubmit={(v) => { setQuery(v); setShowAutocomplete(false); }}
          onFilterClick={() => { setShowAutocomplete(false); setShowFilters(true); }}
          autoFocus={resultsActive}
          filterCount={fc}
        />
        {!showAutocomplete && (
          <div style={{ marginTop: 12, overflowX: 'auto' }} className="no-scrollbar">
            <div style={{ display: 'flex', gap: 8, paddingBottom: 2 }}>
              {QUICK_CHIPS.map(chip => {
                const active = chip.check(filters);
                return (
                  <button key={chip.id} onClick={() => {
                    if (active) {
                      if (chip.id === 'electric' || chip.id === 'hybrid')
                        setFilters({ ...filters, fuel: filters.fuel.filter(x => x !== (chip.id === 'electric' ? 'חשמלי' : 'היברידי')) });
                      else if (chip.id === 'under150') setFilters({ ...filters, priceMax: FILTER_DEFAULTS.priceMax });
                      else if (chip.id === 'firsthand') setFilters({ ...filters, hand: 'any' });
                      else if (chip.id === 'new') setFilters({ ...filters, yearMin: FILTER_DEFAULTS.yearMin });
                      else if (chip.id === 'cross') setFilters({ ...filters, body: filters.body.filter(x => x !== 'קרוסאובר') });
                    } else setFilters(chip.apply(filters));
                  }} className="press" style={{
                    flexShrink: 0,
                    padding: '8px 14px', borderRadius: 999,
                    background: active ? 'var(--ink)' : 'var(--sheet)',
                    color: active ? 'var(--on-accent)' : 'var(--ink)',
                    border: '1px solid ' + (active ? 'transparent' : 'var(--line)'),
                    fontSize: 13, fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>{chip.label}</button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showAutocomplete ? (
        <div style={{
          flex: 1, overflow: 'auto',
          background: 'var(--bg-warm)',
          borderRadius: '22px 22px 0 0', marginTop: -16, paddingTop: 14,
        }}>
          <AutocompletePanel query={query} onPick={pickSuggestion}/>
        </div>
      ) : (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'var(--bg-warm)',
          borderRadius: '22px 22px 0 0', marginTop: -16,
        }}>
          <div style={{
            padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              <span className="num h-title" style={{ fontSize: 15, color: 'var(--ink)' }}>{results.length}</span> תוצאות
              {query && <span style={{ color: 'var(--ink-3)' }}> · "{query}"</span>}
            </span>
            <button onClick={onOpenSort} className="press" style={{
              background: 'none', border: 'none', padding: 0,
              fontSize: 13, color: 'var(--ink-2)', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              {sortLabel} <Icon name="chevron-down" size={14}/>
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 16px' }}>
            {results.length === 0 ? (
              <EmptyState
                icon="search"
                title="לא נמצאו רכבים תואמים"
                subtitle={query ? `אין תוצאות עבור "${query}". נסה לרכך את הפילטרים או לחפש משהו אחר.` : 'נסה לרכך את הפילטרים כדי לראות יותר תוצאות.'}
                action={() => setFilters({ ...FILTER_DEFAULTS })}
                actionLabel="איפוס פילטרים"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {results.map(v => (
                  <VehicleCard key={v.id} vehicle={v}
                    saved={savedIds.includes(v.id)}
                    onSave={() => onToggleSave(v.id)}
                    onClick={() => onOpenVehicle(v.id)}/>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showFilters && (
        <FilterSheet
          filters={filters} onChange={setFilters}
          onClose={() => setShowFilters(false)}
          onApply={() => setShowFilters(false)}
          resultCount={results.length}
        />
      )}
    </div>
  );
};

window.SearchScreen = SearchScreen;
