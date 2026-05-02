import React, { useState } from 'react';
import './_group.css';

const FlameIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5c-4.14 0-7.5-3.36-7.5-7.5 0-3.5 2.1-5.5 3.5-8 1-1.75 1.5-3.5 1.5-3.5s1 2.25 3.5 4.5c1.88 1.69 3.5 4 3.5 7 0 4.14-3.36 7.5-7.5 7.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5c-2.2 0-4-1.8-4-4 0-1.8 1.2-3 2-4.5 0.5-.95.8-1.9.8-1.9s.5 1.2 1.9 2.4c1 1 1.9 2.2 1.9 3.9 0 2.2-1.8 4-3.6 4z" />
  </svg>
);

const LeafIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21S4 12 12 4c0 0 7 0 9 8 0 0 0 7-8 9-5 1.43-10 0-10 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l8-8" />
  </svg>
);

const FeatherIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 4c-5-1-10 2-14 7-1 1.5-2 3-3 6l2 1c3-1 4.5-2 6-3 5-4 8-9 9-11z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 11l-3 3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l-3 3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 14l-3 3" />
  </svg>
);

const CheckIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12.5l5 5 11-11" />
  </svg>
);

const SettingsIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1.15 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.17A1.65 1.65 0 008.8 19.3a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1.15H3a2 2 0 01-2-2 2 2 0 012-2h.17A1.65 1.65 0 004.7 8.8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001.15-1.51V3a2 2 0 012-2 2 2 0 012 2v.17a1.65 1.65 0 001.15 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V11a1.65 1.65 0 001.51 1.15H21a2 2 0 012 2 2 2 0 01-2 2h-.17a1.65 1.65 0 00-1.43 1.15z" />
  </svg>
);

const TrendIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l4-4 4 4 6-6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h3v3" />
  </svg>
);

const ArrowLeftIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const QuillIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 3S16 3 13 8c-3 5-4 12-4 12s2-2 4-2 7 2 7 2V3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 18s-2 1-3 3-3 0-3 0 0-2 2-3c1.5-1.5 3-1 3-1z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11h2M15 15h2M17 7h2" />
  </svg>
);

const FoldedPageIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
  </svg>
);

export function Sanctuary() {
  const [brainDumpText, setBrainDumpText] = useState("");

  return (
    <div className="sanctuary-theme overflow-y-auto">
      {/* ROOST VIEW */}
      <div className="max-w-[720px] mx-auto px-8 py-20 min-h-[900px]">
        <header className="flex items-end justify-between mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[var(--accent-cinder)]">
              <FlameIcon className="w-5 h-5" />
              <h1 className="display-font text-5xl font-semibold leading-none tracking-tight" style={{ color: 'var(--ink-color)' }}>
                Roost
              </h1>
            </div>
            <p className="small-caps text-xs opacity-70 ml-7">Tended · Neglected · Waiting</p>
          </div>
          <div className="flex gap-4 opacity-70">
            <button className="hover:opacity-100"><TrendIcon className="w-5 h-5" /></button>
            <button className="hover:opacity-100"><SettingsIcon className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="space-y-12">
          {/* Cinder */}
          <div className="flex items-center gap-6 group cursor-pointer">
            <div className="w-24 h-24 shrink-0 dragon-plate">
              <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" alt="Cinder" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 border-b border-[var(--ink-color)] border-opacity-10 pb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="display-font text-3xl font-medium">Q2 product launch</h3>
                <span className="small-caps text-xs opacity-60">2h ago</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="small-caps text-xs" style={{ color: 'var(--accent-cinder)' }}>Adolescent Cinder</span>
                <span className="text-[10px] opacity-30">•</span>
                <span className="italic text-sm opacity-70">rests</span>
              </div>
            </div>
          </div>

          {/* Moss */}
          <div className="flex items-center gap-6 group cursor-pointer">
            <div className="w-24 h-24 shrink-0 dragon-plate">
              <img src="/__mockup/images/dragons/moss/hatchling-moss.webp" alt="Moss" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 border-b border-[var(--ink-color)] border-opacity-10 pb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="display-font text-3xl font-medium">Greek lessons</h3>
                <span className="small-caps text-xs opacity-60">4d ago</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="small-caps text-xs" style={{ color: 'var(--accent-moss)' }}>Hatchling Moss</span>
                <span className="text-[10px] opacity-30">•</span>
                <span className="italic text-sm opacity-70">stirs</span>
              </div>
            </div>
          </div>

          {/* Drift */}
          <div className="flex items-center gap-6 group cursor-pointer">
            <div className="w-24 h-24 shrink-0 dragon-plate">
              <img src="/__mockup/images/dragons/drift/adolscent-drift.webp" alt="Drift" className="w-full h-full object-contain opacity-80" />
            </div>
            <div className="flex-1 border-b border-[var(--ink-color)] border-opacity-10 pb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="display-font text-3xl font-medium">Novel chapter 7</h3>
                <span className="small-caps text-xs opacity-60">11d ago</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="small-caps text-xs" style={{ color: 'var(--accent-drift)' }}>Adolescent Drift</span>
                <span className="text-[10px] opacity-30">•</span>
                <span className="italic text-sm opacity-70" style={{ color: 'var(--accent-cinder)' }}>calls</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <button className="inline-flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <LeafIcon className="w-4 h-4" />
            <span className="italic text-sm">Begin a new keeping</span>
          </button>
        </div>
      </div>

      {/* PAGE DIVIDER */}
      <div className="w-full relative py-12 flex justify-center items-center opacity-30">
        <div className="w-1/3 h-[1px] bg-[var(--ink-color)]"></div>
        <div className="mx-6 transform rotate-45 w-2 h-2 border border-[var(--ink-color)]"></div>
        <div className="w-1/3 h-[1px] bg-[var(--ink-color)]"></div>
      </div>

      {/* PROJECT VIEW: CINDER */}
      <div className="max-w-[640px] mx-auto px-8 py-16 pb-32">
        <nav className="mb-16 flex justify-between items-center opacity-60">
          <button className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity">
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="small-caps text-xs">Return</span>
          </button>
          <button className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity">
            <span className="small-caps text-xs">Ledger</span>
            <TrendIcon className="w-4 h-4" />
          </button>
        </nav>

        {/* Chapter Header */}
        <div className="text-center mb-16">
          <div className="inline-block w-32 h-32 mb-6 dragon-plate">
            <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" alt="Cinder" className="w-full h-full object-contain" />
          </div>
          <h2 className="display-font text-5xl font-medium tracking-tight mb-4">Q2 product launch</h2>
          <div className="flex justify-center items-center gap-4 opacity-60 small-caps text-xs">
            <span>Chapter II</span>
            <span className="w-1 h-1 rounded-full bg-[var(--ink-color)]"></span>
            <span>May 12</span>
          </div>
          <div className="w-8 h-[1px] bg-[var(--ink-color)] opacity-20 mx-auto mt-6"></div>
        </div>

        {/* Resume Card (Editorial Style) */}
        <div className="mb-20">
          <p className="italic opacity-80 mb-6 text-lg">Where the keeper left off…</p>
          <div className="text-lg leading-relaxed mb-10">
            <span className="drop-cap">T</span>he last tending spanned 47 minutes, focused entirely on refining the pricing page copy. The keeper left a note to review the cancellation-flow draft in Notion before proceeding.
          </div>
          <div className="border-l-2 border-[var(--accent-cinder)] pl-6 mb-12 py-1">
            <p className="small-caps text-xs opacity-60 mb-2" style={{ color: 'var(--accent-cinder)' }}>Suggested next move</p>
            <p className="text-xl display-font italic leading-snug">Review the cancellation-flow draft your past self left in Notion.</p>
          </div>
          <button 
            className="w-full py-5 text-center text-[var(--bg-color)] font-medium tracking-wide text-lg"
            style={{ backgroundColor: 'var(--accent-cinder)' }}
          >
            Begin a tending — 20 minutes
          </button>
        </div>

        {/* Active Tasks */}
        <div className="mb-20">
          <div className="flex items-center justify-between border-b border-[var(--ink-color)] border-opacity-20 pb-2 mb-6">
            <h3 className="small-caps text-xs opacity-60 tracking-widest">Active Undertakings</h3>
            <span className="small-caps text-xs opacity-40">3 / 5</span>
          </div>
          
          <ul className="space-y-4 mb-6">
            <li className="flex items-start gap-4 group">
              <button className="mt-1 shrink-0 w-5 h-5 border border-[var(--ink-color)] border-opacity-30 hover:border-opacity-100 transition-colors flex items-center justify-center">
                <CheckIcon className="w-4 h-4 opacity-0 group-hover:opacity-30" />
              </button>
              <span className="text-lg leading-snug pt-[1px]">Review the cancellation-flow draft your past self left in Notion</span>
              <button className="ml-auto opacity-0 group-hover:opacity-40 hover:!opacity-100 mt-1">
                <FoldedPageIcon className="w-4 h-4" />
              </button>
            </li>
            <li className="flex items-start gap-4 group">
              <button className="mt-1 shrink-0 w-5 h-5 border border-[var(--ink-color)] border-opacity-30 hover:border-opacity-100 transition-colors flex items-center justify-center">
                <CheckIcon className="w-4 h-4 opacity-0 group-hover:opacity-30" />
              </button>
              <span className="text-lg leading-snug pt-[1px]">Draft the email announcement to existing subscribers</span>
              <button className="ml-auto opacity-0 group-hover:opacity-40 hover:!opacity-100 mt-1">
                <FoldedPageIcon className="w-4 h-4" />
              </button>
            </li>
            <li className="flex items-start gap-4 group">
              <button className="mt-1 shrink-0 w-5 h-5 border border-[var(--ink-color)] border-opacity-30 hover:border-opacity-100 transition-colors flex items-center justify-center">
                <CheckIcon className="w-4 h-4 opacity-0 group-hover:opacity-30" />
              </button>
              <span className="text-lg leading-snug pt-[1px]">Update the hero image asset in the CMS</span>
              <button className="ml-auto opacity-0 group-hover:opacity-40 hover:!opacity-100 mt-1">
                <FoldedPageIcon className="w-4 h-4" />
              </button>
            </li>
          </ul>

          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Inscribe a new task..." 
              className="flex-1 bg-transparent border-b border-[var(--ink-color)] border-opacity-20 py-2 text-lg focus:outline-none focus:border-opacity-60 placeholder:italic placeholder:opacity-40 transition-colors"
            />
            <button className="small-caps text-xs opacity-60 hover:opacity-100 transition-opacity self-end pb-2">Add</button>
          </div>
        </div>

        {/* Brain Dump */}
        <div className="mb-20 bg-white bg-opacity-20 p-8 border border-[var(--ink-color)] border-opacity-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-4">
            <QuillIcon className="w-5 h-5 opacity-60" />
            <h3 className="small-caps text-xs opacity-60 tracking-widest">The Keeper's Thoughts</h3>
          </div>
          <textarea 
            value={brainDumpText}
            onChange={(e) => setBrainDumpText(e.target.value)}
            placeholder="Record your thoughts on this keeping. The ledger will distill them..."
            className="w-full bg-transparent border-none text-lg italic leading-relaxed resize-none h-32 focus:outline-none placeholder:opacity-30"
          ></textarea>
          <div className="flex justify-between items-center mt-4 border-t border-[var(--ink-color)] border-opacity-10 pt-4">
            <span className="system-font text-[10px] uppercase tracking-wider opacity-40">Press ⌘+Enter to distill</span>
            <button 
              className="small-caps text-xs px-4 py-2 border border-[var(--ink-color)] border-opacity-20 hover:border-opacity-100 transition-all opacity-80 hover:opacity-100"
            >
              Distill Thoughts
            </button>
          </div>
        </div>

        {/* Session Tail */}
        <div className="text-center opacity-40 italic text-sm">
          <p>The keeping has been tended for 4 hours and 12 minutes in total.</p>
        </div>

      </div>
    </div>
  );
}
