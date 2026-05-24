// Toast — small notification at top, auto-dismiss

const ToastCtx = React.createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);
  const show = React.useCallback((opts) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, ...opts }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration || 2400);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div style={{
        position: 'absolute', top: 80, insetInline: 16,
        zIndex: 300,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} className="am-rise" style={{
            background: 'var(--ink)', color: '#fff',
            padding: '12px 16px',
            borderRadius: 16,
            boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 14, fontWeight: 600,
          }}>
            {t.icon && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: t.kind === 'good' ? 'var(--good)' : 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={t.icon} size={14}/>
              </div>
            )}
            <span style={{ flex: 1 }}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

const useToast = () => React.useContext(ToastCtx);

window.ToastProvider = ToastProvider;
window.useToast = useToast;
