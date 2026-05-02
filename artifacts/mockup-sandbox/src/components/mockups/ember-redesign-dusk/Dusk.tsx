import React, { useState, useEffect } from 'react';
import './_group.css';

// SVG Icons
const FlameIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17C12.7614 17 15 14.7614 15 12C15 9.23858 12.5 6 10 3C7.5 6 5 9.23858 5 12C5 14.7614 7.23858 17 10 17Z" />
    <path d="M10 17V10" />
  </svg>
);

const CircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="4" fill="currentColor" />
  </svg>
);

const BeginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" />
    <path d="M8 7L13 10L8 13V7Z" fill="currentColor" stroke="none" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" />
    <path d="M10 6V10L13 13" />
  </svg>
);

const FeatherIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 5C15 5 12.5 4 9 7C5.5 10 4 15 4 15C4 15 8 15 11 12C14.5 8.5 15 5 15 5Z" />
    <path d="M10 10L6 14" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10H16M16 10L11 5M16 10L11 15" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="3" />
    <path d="M10 3V4M10 16V17M15 10H16M4 10H3M13.5 6.5L14.5 5.5M5.5 14.5L6.5 13.5M6.5 6.5L5.5 5.5M14.5 14.5L13.5 13.5" />
  </svg>
);

export function Dusk() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const embers = Array.from({ length: 16 }).map((_, i) => {
    const size = Math.random() * 2 + 1; // 1 to 3px
    const left = 10 + Math.random() * 80;
    const bottom = 5 + Math.random() * 25;
    const duration = 3.5 + Math.random() * 2; // 3.5s to 5.5s
    const delay = Math.random() * 5;
    const driftX = (Math.random() - 0.5) * 40; // ±20px drift
    const color = Math.random() > 0.5 ? '#F0A04A' : '#D4421A';
    return { id: i, size, left, bottom, duration, delay, driftX, color };
  });

  // Occasional brighter, longer-rising "flare" embers — sparser and more dramatic
  const flareEmbers = Array.from({ length: 4 }).map((_, i) => {
    const size = 2 + Math.random() * 2; // 2 to 4px - bigger
    const left = 25 + Math.random() * 50;
    const bottom = 5 + Math.random() * 15;
    const duration = 6 + Math.random() * 2; // 6s to 8s - longer rise
    const delay = i * 3 + Math.random() * 4; // staggered so they don't all fire together
    const driftX = (Math.random() - 0.5) * 60;
    return { id: `flare-${i}`, size, left, bottom, duration, delay, driftX };
  });

  const leaves = Array.from({ length: 4 }).map((_, i) => {
    const left = 20 + Math.random() * 60; // 20% to 80% width
    const top = -5 + Math.random() * 15; // start near top
    const duration = 6 + Math.random() * 3; // 6s to 9s
    const delay = Math.random() * 8;
    const driftX = (Math.random() - 0.5) * 60;
    return { id: i, left, top, duration, delay, driftX };
  });

  const wisps = Array.from({ length: 3 }).map((_, i) => {
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
    <div className={`ember-dusk-wrapper bg-dusk relative w-full overflow-x-hidden ${mounted ? 'animate-enter' : 'opacity-0'}`}>
      <div className="firelight-overlay"></div>
      <div className="max-w-[640px] mx-auto px-6 pb-24 pt-12 flex flex-col items-center relative z-10">
        
        {/* Top band */}
        <header className="flex flex-col items-center text-center mb-16 w-full">
          <div className="font-mono-caps text-[11px] text-ember-muted opacity-80 mb-2 tracking-[0.12em]">
            Ember Keep <span className="mx-2">·</span> Tuesday <span className="mx-2">·</span> Dusk
          </div>
          <div className="font-mono-caps text-[10px] text-ember-muted tracking-wider flex items-center gap-1.5">
            <ClockIcon />
            <span>12 May</span> <span className="mx-1">·</span> <span>6:42 PM</span>
          </div>
        </header>

        {/* The day's call */}
        <section className="flex flex-col items-center text-center w-full mb-16 relative">
          <h1 className="font-fraunces italic text-[48px] text-text-parchment leading-tight mb-8">
            Tonight, Cinder calls.
          </h1>

          <div className="relative w-full max-w-[320px] flex justify-center mb-6">
            <div className="scene-cinder dragon-scene relative">
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
                {flareEmbers.map(e => (
                  <div 
                    key={e.id}
                    className="ember ember-flare"
                    style={{
                      width: e.size,
                      height: e.size,
                      left: `${e.left}%`,
                      bottom: `${e.bottom}%`,
                      animationDuration: `${e.duration}s`,
                      animationDelay: `-${e.delay}s`,
                      '--drift-x': `${e.driftX}px`
                    } as React.CSSProperties}
                  />
                ))}
              </div>
              <div className="cinder-sway">
                <div className="cinder-bobble">
                  <div className="cinder-headturn">
                    <div className="dragon-image-container relative z-10 flex justify-center w-full h-full">
                      <img 
                        src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" 
                        alt="Cinder, adolescent dragon"
                        className="dragon-image h-[280px] w-auto object-contain"
                      />
                      <div 
                        className="dragon-eyelid"
                        style={{
                          left: '52.5%',
                          top: '26%',
                          width: '20px',
                          height: '14px',
                          transformOrigin: 'top center'
                        }}
                      />
                      <div className="cinder-eye-gleam" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="font-mono-caps text-[11px] text-ember-muted tracking-wider flex items-center gap-2">
            <span>Last tended</span>
            <span className="text-ember-accent"><CircleIcon /></span>
            <span>2 hours ago</span>
            <span className="mx-2 opacity-50">|</span>
            <span>12h 45m total</span>
          </div>
        </section>

        {/* The act of care */}
        <section className="flex flex-col items-center text-center max-w-[560px] w-full mb-12">
          <div className="font-mono-caps text-[11px] text-ember-muted tracking-wider mb-4 border border-border-subtle bg-surface-mid px-3 py-1 rounded-sm">
            Tonight <span className="mx-2 text-ember-accent">·</span> 20 Minutes
          </div>
          
          <h2 className="font-serif-body font-semibold text-[22px] leading-[1.55] text-text-parchment mb-4">
            <span className="relative inline-block">
              <span className="relative z-10 px-1">Drill the cancellation flow</span>
              <span className="absolute inset-0 z-0 animate-highlight -left-1 -right-1" style={{ top: '60%', bottom: '5%' }}></span>
            </span>
            {' '}— your past self left a draft in Notion that needs the win-back sequence.
          </h2>

          <p className="font-serif-body italic text-[17px] text-ember-muted">
            "This is the move Cinder remembers from yesterday — finish it and the launch copy is unblocked."
          </p>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center w-full max-w-[360px] mb-20">
          <button 
            className="cta-button w-full py-[18px] px-6 rounded-[8px] flex items-center justify-between font-serif-body font-semibold text-[16px] mb-4 text-text-parchment"
          >
            <span className="flex items-center gap-2">
              <BeginIcon /> Begin tonight's training — 20 min
            </span>
            <span className="font-mono-caps text-[12px] opacity-85 text-amber-glow">20:00</span>
          </button>
          
          <button className="font-serif-body italic text-[14px] text-ember-muted hover:text-text-parchment hover:underline transition-colors decoration-border-subtle underline-offset-4">
            or save for tomorrow
          </button>
        </section>

        {/* Periphery divider */}
        <div className="w-full flex items-center justify-center mb-12 relative opacity-60">
          <div className="absolute left-0 right-0 h-[1px] bg-border-subtle"></div>
          <div className="bg-bg-base px-4 relative z-10 text-ember-muted">
            <FlameIcon />
          </div>
        </div>

        {/* Periphery */}
        <section className="w-full flex flex-col items-center mb-16">
          <h3 className="font-mono-caps text-[11px] text-ember-muted tracking-wider mb-8">
            Elsewhere in the keep
          </h3>

          <div className="flex flex-row justify-center gap-12 sm:gap-20 w-full">
            {/* Moss */}
            <div className="flex flex-col items-center w-[120px] text-center">
              <div className="h-[96px] w-[96px] flex items-center justify-center mb-3">
                <div className="scene-moss dragon-scene relative w-full h-full">
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
                  <div className="dragon-image-container relative z-10 w-full h-full flex justify-center items-center">
                    <img 
                      src="/__mockup/images/dragons/moss/hatchling-moss.webp" 
                      alt="Moss"
                      className="dragon-image max-h-full max-w-full object-contain"
                    />
                    <div 
                      className="dragon-eyelid"
                      style={{
                        left: '50%',
                        top: '29.5%',
                        width: '12px',
                        height: '8px',
                        transformOrigin: 'top center'
                      }}
                    />
                  </div>
                </div>
              </div>
              <h4 className="font-serif-body font-semibold text-[15px] text-text-parchment mb-1">Moss</h4>
              <p className="font-serif-body italic text-[14px] text-ember-muted mb-2">Greek lessons</p>
              <p className="font-mono-caps text-[9px] text-ember-muted tracking-wider leading-tight mb-3">
                rested 4 days<br/>ready when you are
              </p>
              <button className="font-serif-body italic text-[13px] text-ember-muted hover:text-text-parchment transition-colors border-b border-transparent hover:border-border-subtle pb-0.5">
                tend instead
              </button>
            </div>

            {/* Drift */}
            <div className="flex flex-col items-center w-[120px] text-center">
              <div className="h-[96px] w-[96px] flex items-center justify-center mb-3">
                <div className="scene-drift dragon-scene relative w-full h-full">
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
                  <div className="dragon-image-container relative z-10 w-full h-full flex justify-center items-center">
                    <img 
                      src="/__mockup/images/dragons/drift/adolscent-drift.webp" 
                      alt="Drift"
                      className="dragon-image max-h-full max-w-full object-contain"
                    />
                    <div className="absolute top-[10%] right-[15%] w-1.5 h-1.5 rounded-full bg-ember-accent indicator-dot" style={{ boxShadow: '0 0 6px var(--ember-accent)' }} />
                    <div 
                      className="dragon-eyelid"
                      style={{
                        left: '50%',
                        top: '25%',
                        width: '14px',
                        height: '10px',
                        transformOrigin: 'top center'
                      }}
                    />
                  </div>
                </div>
              </div>
              <h4 className="font-serif-body font-semibold text-[15px] text-text-parchment mb-1">Drift</h4>
              <p className="font-serif-body italic text-[14px] text-ember-muted mb-2">Novel chapter 7</p>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-ember-accent"><CircleIcon /></span>
                <span className="font-mono-caps text-[9px] text-text-parchment font-bold tracking-wider">11 days quiet</span>
              </div>
              <button className="font-serif-body italic text-[13px] text-ember-muted hover:text-text-parchment transition-colors border-b border-transparent hover:border-border-subtle pb-0.5">
                tend instead
              </button>
            </div>
          </div>
        </section>

        {/* Tomorrow preview */}
        <section className="w-full max-w-[480px] bg-surface-mid border border-border-subtle rounded-[4px] p-6 mb-12 flex flex-col items-center text-center">
          <div className="font-mono-caps text-[10px] text-ember-muted tracking-wider mb-3 flex items-center gap-2">
            Tomorrow <ArrowRightIcon />
          </div>
          <p className="font-fraunces italic text-[20px] text-text-parchment leading-snug">
            "Drift will likely call. The bridge scene has been waiting."
          </p>
        </section>

        {/* Brain dump */}
        <section className="w-full max-w-[480px] relative">
          <div className="absolute top-4 left-4 text-ember-muted opacity-50">
            <FeatherIcon />
          </div>
          <textarea 
            className="w-full bg-surface-mid border border-border-subtle rounded-none p-4 pl-12 h-[120px] font-serif-body italic text-[16px] text-text-parchment placeholder:text-ember-muted focus:outline-none focus:border-ember-accent transition-colors resize-none"
            placeholder="add to tonight's notes…"
          ></textarea>
          <div className="absolute bottom-4 right-4">
            <button className="font-serif-body italic text-[14px] text-ember-muted hover:text-text-parchment transition-colors">
              save
            </button>
          </div>
        </section>

        <div className="fixed bottom-6 right-6 text-ember-muted opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          <SettingsIcon />
        </div>
      </div>
    </div>
  );
}
