import React from 'react';
import './_group.css';

// SVG Icons
const FlameIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M12 22C12 22 17 18 17 12C17 6 12 2 12 2C12 2 7 6 7 12C7 18 12 22 12 22Z" />
    <path d="M12 17C12 17 14 15 14 12C14 10 12 9 12 9C12 9 10 10 10 12C10 15 12 17 12 17Z" />
  </svg>
);

const OverdueIndicator = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const ArrowIntoCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12L16 12M16 12L13 9M16 12L13 15" />
  </svg>
);

const SettingsCog = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    <path d="M19.4 15C19.8515 14.0935 20.0401 13.0649 19.9419 12.0427C19.8437 11.0206 19.4632 10.05 18.8475 9.255L20.5525 8.27L18.8175 5.27L17.1125 6.255C16.2952 5.54133 15.3149 5.03221 14.2536 4.76993C13.1923 4.50764 12.0811 4.50022 11.0125 4.745L10.5525 2.825L7.14749 3.655L7.60749 5.575C6.54471 6.00295 5.59021 6.67104 4.82143 7.52554C4.05264 8.38005 3.50424 9.39659 3.23001 10.485L1.31 10.025L0.480009 13.43L2.4 13.89C2.65175 14.9966 3.1979 16.0305 3.98402 16.903C4.77014 17.7756 5.77353 18.4611 6.91001 18.9L6.45001 20.82L9.85501 21.65L10.315 19.73C11.3789 19.986 12.4897 19.986 13.5536 19.73C14.6174 19.474 15.5968 18.9712 16.4 18.27L18.105 19.255L19.84 16.255L18.135 15.27C18.6669 14.6299 19.0963 13.8988 19.4 13.105V15Z" />
  </svg>
);

export function Hearth() {
  return (
    <div className="hearth-container flex flex-col items-center">
      <div className="hearth-firelight" />

      {/* Top Header */}
      <header className="w-full flex justify-center py-6 relative z-10">
        <span className="uppercase text-[13px] tracking-[0.1em] text-[var(--text-muted)] font-['Inter_Tight'] font-medium">
          Ember Keep · Tuesday Evening
        </span>
      </header>

      {/* Room View - The Dragons */}
      <section className="relative w-full max-w-[1000px] h-[500px] flex items-end justify-center room-view-stagger mt-12 mb-24 z-10">
        
        {/* Moss (Sleeping/Back) */}
        <div className="absolute left-[15%] bottom-[120px] dragon-container flex flex-col items-center group z-10">
          <div className="relative w-[150px] h-[150px] flex items-center justify-center filter grayscale-[0.25] brightness-90">
            <img src="/__mockup/images/dragons/moss/hatchling-moss.webp" alt="Moss" className="w-[150px] object-contain drop-shadow-xl" />
          </div>
          <div className="mt-4 flex flex-col items-center text-center">
            <span className="font-serif italic text-[18px] text-[var(--text-parchment)]">Moss</span>
            <span className="text-[13px] text-[var(--text-parchment)] font-sans mt-1">Greek lessons</span>
            <span className="font-mono text-[11px] text-[var(--text-muted)] mt-1 uppercase">obs. 4d</span>
          </div>
        </div>

        {/* Cinder (Recent/Side) */}
        <div className="absolute right-[15%] bottom-[80px] dragon-container flex flex-col items-center group z-10">
          <div className="relative w-[230px] h-[230px] flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--amber-glow)_0%,transparent_60%)] opacity-20 dragon-rim-light transition-all duration-[200ms] blur-2xl" />
            <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" alt="Cinder" className="w-[230px] object-contain drop-shadow-2xl relative z-10" />
          </div>
          <div className="mt-4 flex flex-col items-center text-center">
            <span className="font-serif italic text-[18px] text-[var(--text-parchment)]">Cinder</span>
            <span className="text-[13px] text-[var(--text-parchment)] font-sans mt-1">Q2 product launch</span>
            <span className="font-mono text-[11px] text-[var(--text-muted)] mt-1 uppercase">obs. 2h</span>
          </div>
        </div>

        {/* Drift (Overdue/Foreground) */}
        <div className="absolute left-[40%] bottom-[0px] dragon-container flex flex-col items-center group z-20">
          <div className="relative w-[300px] h-[300px] flex items-center justify-center dragon-breathing">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#8A2A0E33_0%,transparent_70%)] opacity-80 blur-2xl" />
            <img src="/__mockup/images/dragons/drift/adolscent-drift.webp" alt="Drift" className="w-[300px] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10" />
          </div>
          <div className="mt-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <OverdueIndicator className="text-[var(--ember-accent)] w-3 h-3" />
              <span className="font-serif italic text-[20px] text-[var(--text-parchment)]">Drift</span>
            </div>
            <span className="text-[14px] text-[var(--text-parchment)] font-sans mt-1">Novel chapter 7</span>
            <span className="font-mono text-[12px] text-[var(--ember-accent)] mt-1 uppercase">obs. 11d</span>
          </div>
        </div>

      </section>

      {/* The Dragon's Voice & CTA (replaces Resume Card) */}
      <section className="relative z-10 w-full max-w-[700px] flex flex-col items-center px-6 mt-16 mb-24">
        <div className="flex items-center gap-8 w-full mb-10">
          <div className="w-[180px] shrink-0">
             <img src="/__mockup/images/dragons/drift/adolscent-drift.webp" alt="Drift" className="w-full object-contain filter drop-shadow-xl" />
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-serif italic text-[30px] leading-[1.4] text-[var(--text-parchment)] font-medium">
              "I've been waiting eleven days. The bridge scene is still half-finished — <span className="border-b border-[var(--ember-accent)] pb-1">Mira is mid-sentence at the train station.</span> Ready?"
            </p>
            <p className="text-[13px] text-[var(--text-muted)] font-sans">
              Last tended · 64 min · Apr 21
            </p>
          </div>
        </div>

        <button className="cta-button w-full max-w-[400px] bg-[var(--ember-accent)] text-[var(--text-parchment)] py-4 px-6 rounded-lg flex items-center justify-between font-sans font-medium text-[15px]">
          <div className="flex items-center gap-3">
             <FlameIcon className="text-[var(--text-parchment)] opacity-80" />
             Begin training — 20 min
          </div>
          <span className="font-mono text-[14px] text-[var(--amber-glow)] opacity-90">20:00</span>
        </button>

        <div className="mt-8 flex items-center gap-4 text-[13px] text-[var(--text-muted)]">
          <span>or tend a different dragon</span>
          <div className="flex items-center gap-2">
            <button className="w-[32px] h-[32px] rounded-full bg-[var(--surface-mid)] flex items-center justify-center hover:bg-[var(--surface-mid-hover)] transition-colors border border-[var(--border-subtle)]">
               <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" className="w-5 object-contain" alt="Cinder" />
            </button>
            <button className="w-[32px] h-[32px] rounded-full bg-[var(--surface-mid)] flex items-center justify-center hover:bg-[var(--surface-mid-hover)] transition-colors border border-[var(--border-subtle)]">
               <img src="/__mockup/images/dragons/moss/hatchling-moss.webp" className="w-5 object-contain filter grayscale-[0.25]" alt="Moss" />
            </button>
          </div>
        </div>
      </section>

      {/* Active Tasks & Brain Dump */}
      <section className="relative z-10 w-full max-w-[600px] px-6 pb-32">
        <h2 className="font-serif font-semibold text-[20px] text-[var(--text-parchment)] mb-6">Tonight's Focus</h2>
        
        <div className="flex flex-col gap-3 mb-12">
          {['Draft the conversation between Mira and Kael', 'Outline the train arrival sequence', 'Review chapter 6 notes on the artifact'].map((task, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-[var(--surface-mid)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--text-muted)] transition-colors group cursor-pointer">
              <div className="w-5 h-5 rounded border border-[var(--text-muted)] shrink-0 mt-0.5 flex items-center justify-center group-hover:border-[var(--text-parchment)] transition-colors"></div>
              <span className="text-[14px] text-[var(--text-parchment)] leading-relaxed">{task}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[14px] text-[var(--text-muted)] font-medium flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.5 7.5"/>
            </svg>
            Add to the night's notes
          </label>
          <textarea 
            className="w-full h-[120px] bg-[var(--surface-mid)] border border-[var(--border-subtle)] rounded-lg p-4 text-[14px] text-[var(--text-parchment)] font-sans placeholder:font-mono placeholder:text-[13px] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--text-muted)] transition-colors"
            placeholder="whats stirring tonight..."
          ></textarea>
        </div>
      </section>

      {/* Settings (Ambient) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="text-[var(--text-muted)] hover:text-[var(--text-parchment)] transition-colors p-2 bg-[var(--surface-mid)] rounded-full border border-[var(--border-subtle)]">
           <SettingsCog />
        </button>
      </div>
      
    </div>
  );
}
