import React from 'react';
import './_group.css';

const Bolt = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const Heart = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21s-7-4.5-7-11a4 4 0 017-2.6A4 4 0 0119 10c0 6.5-7 11-7 11z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const Star = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l3 7 7 .8-5.3 4.7 1.6 7L12 17.8 5.7 21.5l1.6-7L2 9.8 9 9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export function Hatchling() {
  return (
    <div className="hatchling-theme overflow-y-auto">

      {/* ROOST = NEST */}
      <div className="px-8 py-12 max-w-[920px] mx-auto">
        {/* HEADER */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="pill sun"><Star className="w-4 h-4" /> Day 7 streak</span>
              <span className="pill mint"><Bolt className="w-4 h-4" /> Level 3</span>
            </div>
            <h1 className="display text-6xl">Hi keeper —<br />your nest is <span style={{ color: 'var(--pink-deep)' }}>buzzing</span></h1>
          </div>
          <button className="chunk-btn ghost text-sm py-3 px-5">settings</button>
        </div>

        {/* DRAGON ROW */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {/* Cinder */}
          <div className="blob-card text-center relative" style={{ background: 'linear-gradient(160deg, #FFE6F1 0%, #FFFFFF 70%)' }}>
            <span className="sparkle" style={{ top: 18, right: 22 }} />
            <div className="dragon-sticker mx-auto mb-3" style={{ width: 110, height: 110 }}>
              <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" alt="Cinder" />
            </div>
            <div className="display text-2xl mb-1">Cinder</div>
            <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>Q2 product launch</div>
            <div className="xp-bar mt-4"><i style={{ width: '71%' }} /></div>
            <div className="flex justify-between text-xs mt-2 font-bold">
              <span>Adolescent</span>
              <span style={{ color: 'var(--pink-deep)' }}>71/100 XP</span>
            </div>
            <button className="chunk-btn mt-5 w-full text-base py-3">Tend now</button>
          </div>

          {/* Moss */}
          <div className="blob-card text-center relative" style={{ background: 'linear-gradient(160deg, #DEFAF4 0%, #FFFFFF 70%)' }}>
            <span className="sparkle" style={{ top: 18, left: 22, background: 'var(--mint)' }} />
            <div className="dragon-sticker delay-1 mx-auto mb-3" style={{ width: 110, height: 110 }}>
              <img src="/__mockup/images/dragons/moss/hatchling-moss.webp" alt="Moss" />
            </div>
            <div className="display text-2xl mb-1">Moss</div>
            <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>Greek lessons</div>
            <div className="xp-bar mt-4"><i style={{ width: '32%' }} /></div>
            <div className="flex justify-between text-xs mt-2 font-bold">
              <span>Hatchling</span>
              <span style={{ color: 'var(--mint-deep)' }}>32/100 XP</span>
            </div>
            <button className="chunk-btn mint mt-5 w-full text-base py-3">Tend now</button>
          </div>

          {/* Drift — sad */}
          <div className="blob-card text-center relative" style={{ background: 'linear-gradient(160deg, #E8EDFF 0%, #FFFFFF 70%)' }}>
            <span className="sparkle" style={{ bottom: 90, right: 18, background: 'var(--pink)' }} />
            <div className="dragon-sticker delay-2 mx-auto mb-3" style={{ width: 110, height: 110, opacity: 0.78 }}>
              <img src="/__mockup/images/dragons/drift/adolscent-drift.webp" alt="Drift" />
            </div>
            <div className="display text-2xl mb-1">Drift</div>
            <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>Novel chapter 7</div>
            <div className="xp-bar mt-4"><i style={{ width: '4%', background: 'var(--pink-deep)', borderRightColor: 'var(--ink)' }} /></div>
            <div className="flex justify-between text-xs mt-2 font-bold">
              <span style={{ color: 'var(--pink-deep)' }}>Missing you!</span>
              <span>11 days</span>
            </div>
            <button className="chunk-btn sky mt-5 w-full text-base py-3">Visit</button>
          </div>
        </div>

        {/* BIG CTA */}
        <div className="blob-card flex items-center justify-between" style={{ background: 'linear-gradient(100deg, var(--sun), #FFD976)' }}>
          <div>
            <div className="display text-2xl mb-1">Hatch a new dragon!</div>
            <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>Every project gets a tiny new friend.</div>
          </div>
          <button className="chunk-btn">+ New dragon</button>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="px-8 my-4">
        <div className="flex items-center justify-center gap-3">
          <span className="confetti-dot" style={{ background: 'var(--pink)' }} />
          <span className="confetti-dot" style={{ background: 'var(--mint)' }} />
          <span className="confetti-dot" style={{ background: 'var(--sun)' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>Tonight's quest with Cinder</span>
          <span className="confetti-dot" style={{ background: 'var(--sky)' }} />
          <span className="confetti-dot" style={{ background: 'var(--pink)' }} />
          <span className="confetti-dot" style={{ background: 'var(--mint)' }} />
        </div>
      </div>

      {/* PROJECT VIEW = QUEST */}
      <div className="px-8 py-8 pb-32 max-w-[920px] mx-auto">

        {/* HERO */}
        <div className="blob-card mb-6 flex items-center gap-8" style={{ background: 'linear-gradient(120deg, #FFE6F1 0%, #FFFFFF 100%)' }}>
          <div className="dragon-sticker shrink-0 relative" style={{ width: 180, height: 180 }}>
            <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" alt="Cinder" />
            <span className="sparkle" style={{ top: -4, right: 8 }} />
            <span className="sparkle" style={{ bottom: 12, left: -6, background: 'var(--pink)' }} />
          </div>
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              <span className="pill pink"><Heart className="w-4 h-4" /> 7-day streak</span>
              <span className="pill"><Bolt className="w-4 h-4" /> Adolescent</span>
            </div>
            <h2 className="display text-5xl mb-3">Q2 product launch</h2>
            <p className="text-base" style={{ color: 'var(--ink-soft)' }}>
              Cinder remembers your last visit — you wrapped pricing copy and left a note about a Notion draft. Want to keep going?
            </p>
            <div className="flex gap-3 mt-5">
              <button className="chunk-btn">Start 20-min quest</button>
              <button className="chunk-btn ghost text-base py-3 px-5">Just 5 minutes</button>
            </div>
          </div>
        </div>

        {/* QUEST LIST */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-4">
            <div className="display text-3xl">Quests</div>
            <div className="text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>3 of 5 today</div>
          </div>

          <div className="space-y-3">
            <div className="task-row" style={{ background: '#FFE6F1' }}>
              <span className="check-circle" style={{ background: 'var(--pink)' }} />
              <span className="flex-1">Review the cancellation-flow draft your past self left in Notion</span>
              <span className="pill pink">Top quest</span>
            </div>
            <div className="task-row">
              <span className="check-circle" />
              <span className="flex-1">Draft the email announcement to existing subscribers</span>
              <span className="pill">+15 XP</span>
            </div>
            <div className="task-row">
              <span className="check-circle" />
              <span className="flex-1">Update the hero image asset in the CMS</span>
              <span className="pill">+10 XP</span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <input type="text" placeholder="Add a new quest..." className="flex-1" />
            <button className="chunk-btn sky text-base py-3">+ Add</button>
          </div>
        </div>

        {/* BRAIN DUMP */}
        <div className="blob-card" style={{ background: 'linear-gradient(160deg, #EBFEF8 0%, #FFFFFF 70%)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="display text-2xl">Brain dump zone</div>
            <span className="pill mint"><Bolt className="w-4 h-4" /> Auto-distill</span>
          </div>
          <textarea
            placeholder="Spill it all here — Cinder will sort it for you"
            className="w-full h-32 resize-none"
          />
          <div className="flex justify-end mt-3">
            <button className="chunk-btn mint">Distill thoughts</button>
          </div>
        </div>

        <div className="text-center mt-10 text-sm font-bold" style={{ color: 'var(--ink-soft)' }}>
          You've spent <span style={{ color: 'var(--pink-deep)' }}>4h 12m</span> with Cinder this month — keep it up!
        </div>
      </div>
    </div>
  );
}
