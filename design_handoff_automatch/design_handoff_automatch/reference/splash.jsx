// Splash screen — clean wordmark slide-in

const Splash = ({ onDone, duration = 1800 }) => {
  React.useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(80% 60% at 50% 40%, #FFFFFF 0%, var(--bg-warm) 70%, #DCD8CB 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      overflow: 'hidden',
    }}>
      {/* Wordmark — one solid line, clipped from bottom */}
      <div style={{
        overflow: 'hidden',
        paddingBottom: 6,
      }}>
        <div dir="ltr" className="splash-word" style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 800,
          fontSize: 42, letterSpacing: '-0.035em',
          lineHeight: 1, color: 'var(--ink)',
          display: 'inline-block',
          whiteSpace: 'nowrap',
        }}>
          Auto<span style={{ color: 'var(--accent)' }}>Match</span>
        </div>
      </div>

      {/* Underline */}
      <div className="splash-line" style={{
        width: 0, height: 2, marginTop: 16,
        background: 'var(--accent)',
        borderRadius: 1,
      }}/>

      {/* Hebrew */}
      <div className="splash-he" style={{
        fontFamily: 'Heebo, sans-serif', fontWeight: 800,
        fontSize: 26, letterSpacing: '-0.02em',
        color: 'rgba(20,23,28,0.55)',
        marginTop: 16, opacity: 0,
      }}>אוטומאץ׳</div>

      <style>{`
        .splash-word {
          opacity: 0;
          transform: translateY(36px);
          animation: splash-word-in 720ms cubic-bezier(.2,.8,.2,1) 100ms forwards;
        }
        @keyframes splash-word-in {
          0%   { opacity: 0; transform: translateY(36px); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translateY(0); }
        }
        .splash-line {
          animation: splash-line-in 600ms cubic-bezier(.2,.8,.2,1) 700ms forwards;
        }
        @keyframes splash-line-in {
          0%   { width: 0; }
          100% { width: 72px; }
        }
        .splash-he {
          animation: splash-fade-in 500ms cubic-bezier(.2,.8,.2,1) 1000ms forwards;
        }
        @keyframes splash-fade-in {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

window.Splash = Splash;
