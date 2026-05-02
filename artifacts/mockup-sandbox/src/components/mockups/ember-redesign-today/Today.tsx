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

export function Today() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`ember-today-wrapper bg-dusk relative w-full overflow-x-hidden ${mounted ? 'animate-enter' : 'opacity-0'}`}>
      <div className="max-w-[640px] mx-auto px-6 pb-24 pt-12 flex flex-col items-center">
        
        {/* Top band */}
        <header className="flex flex-col items-center text-center mb-16 w-full">
          <div className="font-mono-caps text-[11px] text-ember-ink opacity-80 mb-2 tracking-[0.12em]">
            Ember Keep <span className="mx-2">·</span> Tuesday <span className="mx-2">·</span> Dusk
          </div>
          <div className="font-mono-caps text-[10px] text-ember-muted tracking-wider flex items-center gap-1.5">
            <ClockIcon />
            <span>12 May</span> <span className="mx-1">·</span> <span>6:42 PM</span>
          </div>
        </header>

        {/* The day's call */}
        <section className="flex flex-col items-center text-center w-full mb-16 relative">
          <h1 className="font-fraunces italic text-[48px] text-ember-ink leading-tight mb-8">
            Today, Cinder calls.
          </h1>

          <div className="relative w-full max-w-[320px] flex justify-center mb-6">
            <img 
              src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" 
              alt="Cinder, adolescent dragon"
              className="h-[280px] w-auto object-contain mix-blend-multiply"
            />
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
          <div className="font-mono-caps text-[11px] text-ember-muted tracking-wider mb-4 border border-ember-border px-3 py-1 rounded-sm">
            Today <span className="mx-2 text-ember-accent">·</span> 20 Minutes
          </div>
          
          <h2 className="font-serif-body font-semibold text-[22px] leading-[1.55] text-ember-ink mb-4">
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
            className="cta-button w-full py-[18px] px-6 rounded-[8px] flex items-center justify-between font-serif-body font-semibold text-[16px] mb-4"
            style={{ backgroundColor: '#C45A1F', color: '#F6E5C0' }}
          >
            <span className="flex items-center gap-2">
              <BeginIcon /> Begin today's training — 20 min
            </span>
            <span className="font-mono-caps text-[12px]" style={{ color: 'rgba(246,232,192,0.85)' }}>20:00</span>
          </button>
          
          <button className="font-serif-body italic text-[14px] text-ember-muted hover:text-ember-ink hover:underline transition-colors decoration-ember-border underline-offset-4">
            or save for tomorrow
          </button>
        </section>

        {/* Periphery divider */}
        <div className="w-full flex items-center justify-center mb-12 relative opacity-60">
          <div className="absolute left-0 right-0 h-[1px] bg-ember-border"></div>
          <div className="bg-[#F6E5C0] px-4 relative z-10 text-ember-muted">
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
                <img 
                  src="/__mockup/images/dragons/moss/hatchling-moss.webp" 
                  alt="Moss"
                  className="periphery-dragon periphery-moss max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>
              <h4 className="font-serif-body font-semibold text-[15px] text-ember-ink mb-1">Moss</h4>
              <p className="font-serif-body italic text-[14px] text-ember-muted mb-2">Greek lessons</p>
              <p className="font-mono-caps text-[9px] text-ember-muted tracking-wider leading-tight mb-3">
                rested 4 days<br/>ready when you are
              </p>
              <button className="font-serif-body italic text-[13px] text-ember-muted hover:text-ember-ink transition-colors border-b border-transparent hover:border-ember-border pb-0.5">
                tend instead
              </button>
            </div>

            {/* Drift */}
            <div className="flex flex-col items-center w-[120px] text-center">
              <div className="h-[96px] w-[96px] flex items-center justify-center mb-3">
                <img 
                  src="/__mockup/images/dragons/drift/adolscent-drift.webp" 
                  alt="Drift"
                  className="periphery-dragon periphery-drift max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>
              <h4 className="font-serif-body font-semibold text-[15px] text-ember-ink mb-1">Drift</h4>
              <p className="font-serif-body italic text-[14px] text-ember-muted mb-2">Novel chapter 7</p>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-ember-accent"><CircleIcon /></span>
                <span className="font-mono-caps text-[9px] text-ember-ink font-bold tracking-wider">11 days quiet</span>
              </div>
              <button className="font-serif-body italic text-[13px] text-ember-muted hover:text-ember-ink transition-colors border-b border-transparent hover:border-ember-border pb-0.5">
                tend instead
              </button>
            </div>
          </div>
        </section>

        {/* Tomorrow preview */}
        <section className="w-full max-w-[480px] bg-ember-card-bg border border-ember-border rounded-[4px] p-6 mb-12 flex flex-col items-center text-center">
          <div className="font-mono-caps text-[10px] text-ember-muted tracking-wider mb-3 flex items-center gap-2">
            Tomorrow <ArrowRightIcon />
          </div>
          <p className="font-fraunces italic text-[20px] text-ember-ink leading-snug">
            "Drift will likely call. The bridge scene has been waiting."
          </p>
        </section>

        {/* Brain dump */}
        <section className="w-full max-w-[480px] relative">
          <div className="absolute top-4 left-4 text-ember-muted opacity-50">
            <FeatherIcon />
          </div>
          <textarea 
            className="w-full bg-transparent border border-ember-border rounded-none p-4 pl-12 h-[120px] font-serif-body italic text-[16px] text-ember-ink placeholder:text-ember-muted focus:outline-none focus:border-ember-accent transition-colors resize-none"
            placeholder="add to today's notes…"
          ></textarea>
          <div className="absolute bottom-4 right-4">
            <button className="font-serif-body italic text-[14px] text-ember-muted hover:text-ember-ink transition-colors">
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
