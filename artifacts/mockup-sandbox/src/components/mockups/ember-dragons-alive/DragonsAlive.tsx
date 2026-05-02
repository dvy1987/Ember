import React from 'react';
import './_group.css';

const EmberDotIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 8 8" width="8" height="8" className={className} fill="none">
    <circle cx="4" cy="4" r="4" fill="currentColor" />
  </svg>
);

const LockedIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="12" height="12" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const GoldThread = () => (
  <svg className="absolute top-[40%] left-0 w-full h-[2px] z-0 pointer-events-none" preserveAspectRatio="none">
    <path d="M0,1 L4080,1" stroke="#D4A74A" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
  </svg>
);

export function DragonsAlive() {
  // Generate random particles
  const embers = Array.from({ length: 12 }).map((_, i) => {
    const size = Math.random() * 2 + 1; // 1 to 3px
    const left = 10 + Math.random() * 40; // 10% to 50% (lower-left focus)
    const bottom = 10 + Math.random() * 20;
    const duration = 3.5 + Math.random() * 2; // 3.5s to 5.5s
    const delay = Math.random() * 5;
    const driftX = (Math.random() - 0.5) * 40; // ±20px drift
    const color = Math.random() > 0.5 ? '#F0A04A' : '#D4421A';
    return { id: i, size, left, bottom, duration, delay, driftX, color };
  });

  const leaves = Array.from({ length: 8 }).map((_, i) => {
    const left = 20 + Math.random() * 60; // 20% to 80% width
    const top = -5 + Math.random() * 15; // start near top
    const duration = 6 + Math.random() * 3; // 6s to 9s
    const delay = Math.random() * 8;
    const driftX = (Math.random() - 0.5) * 60;
    return { id: i, left, top, duration, delay, driftX };
  });

  const wisps = Array.from({ length: 7 }).map((_, i) => {
    const top = 20 + Math.random() * 60; // Spread vertically
    const width = 20 + Math.random() * 16; // 20 to 36px
    const height = 6 + Math.random() * 4; // 6 to 10px
    const duration = 7 + Math.random() * 4; // 7s to 11s
    const delay = Math.random() * 10;
    const driftY = (Math.random() - 0.5) * 40;
    const maxOpacity = 0.4 + Math.random() * 0.4;
    return { id: i, top, width, height, duration, delay, driftY, maxOpacity };
  });

  return (
    <div className="dragons-alive-page w-full overflow-hidden" style={{ width: 4080 }}>
      {/* Top Header Band */}
      <header className="w-full h-[80px] flex flex-col items-center justify-center shrink-0 border-b border-[rgba(255,255,255,0.05)] bg-[var(--bg-page)] z-50">
        <h1 className="font-mono-small-caps text-[13px] text-[var(--text-muted)] mb-1">
          Dragons of Ember Keep — alive
        </h1>
        <p className="font-serif-italic text-[18px] text-[var(--text-muted)] opacity-80">
          Three dragons. Three rhythms. The art you have, brought to life.
        </p>
      </header>

      {/* Middle Band - Three Scenes */}
      <div className="w-full h-[880px] flex shrink-0">
        
        {/* Panel 1: CINDER */}
        <div className="w-1/3 h-full scene-cinder dragon-scene border-r border-[rgba(255,255,255,0.02)]">
          <div className="firelight-bg" />
          
          <div className="particle-layer">
            {embers.map(e => (
              <div 
                key={e.id}
                className="ember"
                style={{
                  width: e.size,
                  height: e.size,
                  left: `${e.left}%`,
                  bottom: `${e.bottom}%`,
                  color: e.color,
                  animationDuration: `${e.duration}s`,
                  animationDelay: `-${e.delay}s`,
                  '--drift-x': `${e.driftX}px`
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="dragon-image-container z-10 w-[360px] h-[360px] flex items-center justify-center mb-8 relative -ml-12">
            <img 
              src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" 
              alt="Cinder" 
              className="dragon-image w-full h-full object-contain" 
            />
            {/* Eyelid for Cinder (approx 53% left, 26% top, 24x16px) */}
            <div 
              className="dragon-eyelid"
              style={{
                left: '52.5%',
                top: '25.5%',
                width: '24px',
                height: '16px',
                transformOrigin: 'top center'
              }}
            />
          </div>

          <div className="flex flex-col items-center text-center z-10 mt-8">
            <span className="font-serif-italic text-[22px] text-[var(--text-parchment)] mb-2">Cinder</span>
            <span className="font-mono-small-caps text-[11px] text-[var(--text-muted)] mb-1">Recently tended · 2h ago</span>
            <span className="font-mono-small-caps text-[10px] text-[var(--text-parchment)] opacity-60">Q2 Product Launch</span>
          </div>
        </div>

        {/* Panel 2: MOSS */}
        <div className="w-1/3 h-full scene-moss dragon-scene border-r border-[rgba(255,255,255,0.02)]">
          <div className="dappled-bg" />
          
          <div className="particle-layer">
            {leaves.map(l => (
              <svg 
                key={l.id}
                className="leaf"
                viewBox="0 0 12 8"
                style={{
                  width: '12px',
                  height: '8px',
                  left: `${l.left}%`,
                  top: `${l.top}%`,
                  fill: '#7A9B5A',
                  animationDuration: `${l.duration}s`,
                  animationDelay: `-${l.delay}s`,
                  '--drift-x': `${l.driftX}px`
                } as React.CSSProperties}
              >
                <path d="M0,4 Q3,0 6,4 T12,4 Q9,8 6,4 T0,4" />
              </svg>
            ))}
          </div>

          <div className="dragon-image-container z-10 w-[340px] h-[340px] flex items-center justify-center mb-8 relative">
            <img 
              src="/__mockup/images/dragons/moss/hatchling-moss.webp" 
              alt="Moss" 
              className="dragon-image w-full h-full object-contain drop-shadow-xl" 
            />
            {/* Eyelid for Moss (approx 50% left, 30% top, 18x12px) */}
            <div 
              className="dragon-eyelid"
              style={{
                left: '50%',
                top: '29.5%',
                width: '18px',
                height: '12px',
                transformOrigin: 'top center'
              }}
            />
          </div>

          <div className="flex flex-col items-center text-center z-10 mt-8">
            <span className="font-serif-italic text-[22px] text-[var(--text-parchment)] mb-2">Moss</span>
            <span className="font-mono-small-caps text-[11px] text-[var(--text-muted)] mb-1">Rested · 4 days quiet</span>
            <span className="font-mono-small-caps text-[10px] text-[var(--text-parchment)] opacity-60">Greek Lessons</span>
          </div>
        </div>

        {/* Panel 3: DRIFT */}
        <div className="w-1/3 h-full scene-drift dragon-scene">
          <div className="storm-bg" />
          <div className="mist-bg" />
          <div className="rim-light" />
          
          <div className="particle-layer">
            {wisps.map(w => (
              <div 
                key={w.id}
                className="wisp"
                style={{
                  width: w.width,
                  height: w.height,
                  left: 0,
                  top: `${w.top}%`,
                  animationDuration: `${w.duration}s`,
                  animationDelay: `-${w.delay}s`,
                  '--drift-y': `${w.driftY}px`,
                  '--max-opacity': w.maxOpacity
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="dragon-image-container z-10 w-[360px] h-[360px] flex items-center justify-center mb-8 relative">
            <img 
              src="/__mockup/images/dragons/drift/adolscent-drift.webp" 
              alt="Drift" 
              className="dragon-image w-full h-full object-contain" 
            />
            {/* Indicator Dot */}
            <div className="absolute top-[10%] right-[15%] w-2 h-2 rounded-full bg-[var(--ember-accent)] indicator-dot" style={{ boxShadow: '0 0 8px var(--ember-accent)' }} />
            
            {/* Eyelid for Drift (approx 50% left, 25% top, 22x14px) */}
            <div 
              className="dragon-eyelid"
              style={{
                left: '50%',
                top: '25%',
                width: '22px',
                height: '14px',
                transformOrigin: 'top center'
              }}
            />
          </div>

          <div className="flex flex-col items-center text-center z-10 mt-8">
            <span className="font-serif-italic text-[22px] text-[var(--text-parchment)] mb-2">Drift</span>
            <span className="font-mono-small-caps text-[11px] text-[var(--ember-accent)] mb-1">Overdue · 11 days quiet</span>
            <span className="font-mono-small-caps text-[10px] text-[var(--text-parchment)] opacity-60">Novel Chapter 7</span>
          </div>
        </div>

      </div>

      {/* Lower Band - Evolution Arc */}
      <div className="w-full h-[440px] shrink-0 bg-[var(--cinder-bg)] border-t border-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center relative evolution-arc px-20">
        
        <div className="flex flex-col items-center text-center mb-12">
          <span className="font-mono-small-caps text-[12px] text-[var(--text-muted)] mb-2">Ember Lineage · Cinder</span>
          <span className="font-serif-italic text-[18px] text-[var(--text-muted)] opacity-80">The same dragon. Five stages. You can see it in the gold.</span>
        </div>

        <div className="relative w-full flex items-end justify-between z-10 gap-8 pb-10">
          <GoldThread />
          
          {/* Egg */}
          <div className="evolution-stage group relative flex flex-col items-center w-1/5 cursor-pointer">
            <div className="h-[260px] flex items-end justify-center mb-6">
              <img src="/__mockup/images/dragons/cinder/egg-cinder.webp" alt="Cinder Egg" className="h-[220px] object-contain drop-shadow-xl" />
            </div>
            <span className="font-serif-italic text-[16px] text-[var(--text-muted)] mb-1 group-hover:text-[var(--text-parchment)] transition-colors">Egg</span>
            <span className="font-mono-small-caps text-[10px] text-[var(--text-muted)] opacity-60">Before the first session</span>
          </div>

          {/* Hatchling */}
          <div className="evolution-stage group relative flex flex-col items-center w-1/5 cursor-pointer">
            <div className="h-[260px] flex items-end justify-center mb-6">
              <img src="/__mockup/images/dragons/cinder/hatchling-cinder.webp" alt="Cinder Hatchling" className="h-[240px] object-contain drop-shadow-xl" />
            </div>
            <span className="font-serif-italic text-[16px] text-[var(--text-muted)] mb-1 group-hover:text-[var(--text-parchment)] transition-colors">Hatchling</span>
            <span className="font-mono-small-caps text-[10px] text-[var(--text-muted)] opacity-60">0–10 sessions · 0–4h total</span>
          </div>

          {/* Adolescent (Current/Active) */}
          <div className="evolution-stage group relative flex flex-col items-center w-1/5 cursor-pointer z-20">
            <div className="h-[260px] flex items-end justify-center mb-6 relative">
              {/* Active breathing animation for the current stage */}
              <div className="dragon-image-container" style={{ animation: 'breath-cinder 4s ease-in-out infinite alternate', transformOrigin: 'bottom center' }}>
                <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" alt="Cinder Adolescent" className="h-[260px] object-contain drop-shadow-2xl" style={{ animation: 'filigree-glow-cinder 5s ease-in-out infinite alternate' }} />
                <div 
                  className="dragon-eyelid"
                  style={{
                    left: '52.5%',
                    top: '25.5%',
                    width: '18px',
                    height: '12px',
                    transformOrigin: 'top center',
                    backgroundColor: '#1a0f08',
                    animation: 'blink 6s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
            <span className="font-serif-italic text-[16px] text-[var(--text-parchment)] mb-1 shadow-glow font-medium">Adolescent</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <EmberDotIcon className="text-[var(--ember-accent)]" />
              <span className="font-mono-small-caps text-[10px] text-[var(--text-parchment)]">Current · 12h 45m total</span>
            </div>
          </div>

          {/* Adult */}
          <div className="evolution-stage locked group relative flex flex-col items-center w-1/5 cursor-pointer">
            <div className="h-[260px] flex items-end justify-center mb-6">
              <img src="/__mockup/images/dragons/cinder/adult-cinder.webp" alt="Cinder Adult" className="h-[260px] object-contain drop-shadow-xl" />
            </div>
            <div className="flex items-center gap-1.5 mb-1 group-hover:text-[var(--text-parchment)] transition-colors text-[var(--text-muted)]">
              <LockedIcon />
              <span className="font-serif-italic text-[16px]">Adult</span>
            </div>
            <span className="font-mono-small-caps text-[10px] text-[var(--text-muted)] opacity-60">30+ sessions · Locked</span>
            <div className="absolute -top-4 opacity-0 group-hover:opacity-100 transition-opacity font-mono-small-caps text-[10px] bg-[var(--bg-page)] px-2 py-1 rounded border border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]">
              Unlocks at 30 sessions
            </div>
          </div>

          {/* Ancient */}
          <div className="evolution-stage ancient group relative flex flex-col items-center w-1/5 cursor-pointer">
            <div className="h-[260px] flex items-end justify-center mb-6">
              <img src="/__mockup/images/dragons/cinder/ancient-cinder.webp" alt="Cinder Ancient" className="h-[260px] object-contain drop-shadow-xl" />
            </div>
            <div className="flex items-center gap-1.5 mb-1 group-hover:text-[var(--text-parchment)] transition-colors text-[var(--text-muted)]">
              <LockedIcon />
              <span className="font-serif-italic text-[16px]">Ancient</span>
            </div>
            <span className="font-mono-small-caps text-[10px] text-[var(--text-muted)] opacity-60">100+ sessions · Locked</span>
          </div>

        </div>

      </div>

    </div>
  );
}
