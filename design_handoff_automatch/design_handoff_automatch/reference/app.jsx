// AutoMatch — restyled app shell (ProTrip language)
// Replaces app.jsx. Removes the per-tab tinted backdrops — uniform warm bg + thin border instead of Material-style device frame.

const { useState, useEffect } = React;
const { StatusBar, TabBar, GestureBar } = window.AM_UI;
const { HomeScreen, SavedScreen, AlertsScreen } = window.AM_SCREENS;

function AppShell() {
  const [tab, setTab] = useState('home');
  const [openVehicleId, setOpenVehicleId] = useState(null);
  const [savedIds, setSavedIds] = useState(['v2', 'v5']);
  const [recentIds, setRecentIds] = useState([]);

  // wrap so every "open" gets pushed to recents
  const setOpenVehicle = (id) => {
    if (id) setRecentIds(prev => [id, ...prev.filter(x => x !== id)].slice(0, 8));
    setOpenVehicleId(id);
  };
  const openVehicle = openVehicleId;

  // search state
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ ...window.AM_FILTERS.FILTER_DEFAULTS });
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortId, setSortId] = useState('rel');
  const [showSort, setShowSort] = useState(false);

  // modals/sheets
  const [showProfile, setShowProfile] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [compareIds, setCompareIds] = useState([]);

  // splash / onboarding
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // tab transition animation
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { setAnimKey(k => k + 1); }, [tab]);

  const toast = window.useToast();

  const toggleSave = (id) => {
    setSavedIds(s => {
      const already = s.includes(id);
      toast({
        message: already ? 'הוסר מהשמורים' : 'נשמר ברשימה שלך',
        icon: already ? 'bookmark' : 'heart-fill',
        kind: 'good',
      });
      return already ? s.filter(x => x !== id) : [...s, id];
    });
  };
  const goSearch = () => { setTab('search'); setShowAutocomplete(true); };

  const vehicle = openVehicle ? window.AM_DATA.VEHICLES.find(v => v.id === openVehicle) : null;
  const compareVehicles = compareIds.map(id => window.AM_DATA.VEHICLES.find(v => v.id === id)).filter(Boolean);

  return (
    <div style={{
      width: 412, height: 892,
      background: 'var(--bg-warm)',
      borderRadius: 52,
      border: '8px solid #1a1a1c',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      transition: 'background 320ms ease',
    }}>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
      }}/>

      <StatusBar/>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {showOnboarding ? (
          <window.Onboarding onComplete={() => setShowOnboarding(false)}/>
        ) : compareVehicles.length >= 2 ? (
          <window.CompareScreen
            vehicles={compareVehicles}
            onClose={() => setCompareIds([])}
            onRemove={(id) => setCompareIds(s => s.filter(x => x !== id))}
          />
        ) : vehicle ? (
          <window.VehicleDetail
            vehicle={vehicle}
            saved={savedIds.includes(vehicle.id)}
            onSave={() => toggleSave(vehicle.id)}
            onBack={() => setOpenVehicle(null)}
            onOpenVehicle={setOpenVehicle}
            savedIds={savedIds}
            onToggleSave={toggleSave}
          />
        ) : (
          <div key={animKey} className="am-tab-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {tab === 'home'   && <HomeScreen
              onOpenVehicle={setOpenVehicle}
              savedIds={savedIds} onToggleSave={toggleSave}
              recentIds={recentIds}
              onGoSearch={goSearch}
              onGoAlerts={() => setTab('alerts')}
              onOpenProfile={() => setShowProfile(true)}
            />}
            {tab === 'search' && <window.SearchScreen
              query={query} setQuery={setQuery}
              filters={filters} setFilters={setFilters}
              showAutocomplete={showAutocomplete} setShowAutocomplete={setShowAutocomplete}
              showFilters={showFilters} setShowFilters={setShowFilters}
              sortId={sortId} onOpenSort={() => setShowSort(true)}
              onOpenVehicle={setOpenVehicle}
              savedIds={savedIds} onToggleSave={toggleSave}
              resultsActive={tab === 'search'}
            />}
            {tab === 'saved'  && <SavedScreen
              savedIds={savedIds}
              onOpenVehicle={setOpenVehicle}
              onToggleSave={toggleSave}
              onCompare={setCompareIds}
            />}
            {tab === 'alerts' && <AlertsScreen onAdd={() => setShowAlertForm(true)}/>}
          </div>
        )}
      </div>

      {!vehicle && !compareVehicles.length && !showOnboarding && (
        <TabBar active={tab} onChange={setTab} alertCount={window.AM_DATA.ALERTS.length}/>
      )}
      <GestureBar/>

      {/* Overlays */}
      {showProfile && <window.ProfileSheet savedCount={savedIds.length} onClose={() => setShowProfile(false)}/>}
      {showAlertForm && <window.AlertForm
        onClose={() => setShowAlertForm(false)}
        onSave={() => { setShowAlertForm(false); toast({ message: 'התראה נוצרה — נודיע ברגע שיש התאמה', icon: 'check', kind: 'good' }); }}
      />}
      {showSort && <window.SortSheet
        active={sortId}
        onPick={(id) => { setSortId(id); setShowSort(false); }}
        onClose={() => setShowSort(false)}
      />}

      {showSplash && <window.Splash onDone={() => setShowSplash(false)}/>}
    </div>
  );
}

function App() {
  return (
    <window.ToastProvider>
      <AppShell/>
    </window.ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
