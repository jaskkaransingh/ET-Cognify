import { useLocation } from 'react-router-dom';

const PremiumBackground = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isArenaPage = location.pathname === '/arena';

  return (
    <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden bg-[#050505]">
      {/* Subtle Red Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(237,28,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(237,28,36,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black,transparent)] opacity-50" />

      {/* Only show these global squares if NOT on Home or Arena page */}
      {(!isHomePage && !isArenaPage) && (
        <div className="opacity-60">
          {/* Row 1: Top portion of screen - Animated global squares (Right to Left) */}
          <div 
            className="absolute left-[-10vw] flex rotate-[-12deg] origin-left opacity-100"
            style={{ top: '15vh' }}
          >
            <div className="flex gap-12 animate-slide-infinite w-max pr-12" style={{ animationDuration: '12s' }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.5] shadow-[0_0_100px_rgba(237,28,36,0.5)]" />
              ))}
            </div>
            <div className="flex gap-12 animate-slide-infinite w-max pr-12" style={{ animationDuration: '12s' }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.5] shadow-[0_0_100px_rgba(237,28,36,0.5)]" />
              ))}
            </div>
          </div>

          {/* Row 2: Bottom portion of screen - Animated global squares (Left to Right) */}
          <div 
            className="absolute right-[-10vw] flex rotate-[-12deg] origin-right opacity-100"
            style={{ top: '55vh' }}
          >
            <div className="flex gap-16 animate-slide-right-hero w-max" style={{ animationDuration: '14s' }}>
              {[...Array(3)].map((_, groupIdx) => (
                <div key={groupIdx} className="flex gap-16">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-48 h-48 shrink-0 bg-[#ED1C24] rounded-tl-[80px] rounded-bl-[80px] opacity-[0.4] shadow-[0_0_100px_rgba(237,28,36,0.4)]" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumBackground;
