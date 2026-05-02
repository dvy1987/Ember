import React, { useState } from 'react';
import './_group.css';

// --- Custom SVGs (Field-guide style) ---
const LeafIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c-3.3 0-6 2.7-6 6 0 4 6 14 6 14s6-10 6-14c0-3.3-2.7-6-6-6z"/>
    <path d="M12 22V12"/>
  </svg>
);

const FlameIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c0 0-4 4-4 9s4 9 4 9 4-4 4-9-4-9-4-9z"/>
    <path d="M12 22c0 0-2-3-2-6"/>
  </svg>
);

const CheckboxGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--fj-ink)" strokeWidth="1">
    <rect x="1" y="1" width="12" height="12" />
  </svg>
);

const CheckedGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--fj-ink)" strokeWidth="1">
    <rect x="1" y="1" width="12" height="12" />
    <path d="M3 7l3 3 5-6" />
  </svg>
);

const CogIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const GlassIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export function FieldJournal() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review the cancellation-flow draft your past self left in Notion", done: false },
    { id: 2, text: "Map the stripe checkout states for failed payments", done: false },
    { id: 3, text: "Draft email sequence for upcoming beta cohorts", done: false },
    { id: 4, text: "Finalize copy for the 404 page", done: true },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="field-journal-wrapper w-full h-full text-[#1B1F23]">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20 lg:px-12 flex flex-col lg:flex-row gap-16">
        
        {/* LEFT COLUMN: Table of Contents */}
        <aside className="w-full lg:w-[260px] flex-shrink-0">
          <header className="mb-10">
            <h1 className="fj-display text-lg mb-2">Specimens under observation</h1>
            <p className="text-[13px] text-[#1B1F23] opacity-80 italic">Three creatures currently in your care.</p>
            <div className="mt-4 flex gap-4 text-[#7A2E20]">
              <div className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity">
                <GlassIcon /> <span className="fj-mono text-[10px]">Analytics</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity">
                <CogIcon /> <span className="fj-mono text-[10px]">Settings</span>
              </div>
            </div>
          </header>

          <nav className="flex flex-col gap-6">
            <div className="fj-nav-item group cursor-pointer">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="fj-mono fj-nav-stamp text-[#7A2E20]">001</span>
                <span className="fj-mono text-[#7A2E20]">·</span>
                <span className="text-[15px] italic text-[#1B1F23]">Cinder</span>
                <span className="w-2 h-2 rounded-sm bg-[var(--fj-cinder)] ml-1"></span>
              </div>
              <p className="text-[12px] opacity-75 ml-[32px] leading-snug">Q2 product launch</p>
              <p className="text-[11px] text-[#B8470F] italic ml-[32px] mt-1">observed active · 2h ago</p>
            </div>

            <div className="fj-nav-item group cursor-pointer opacity-80">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="fj-mono fj-nav-stamp text-[#7A2E20]">002</span>
                <span className="fj-mono text-[#7A2E20]">·</span>
                <span className="text-[15px] italic text-[#1B1F23]">Moss</span>
                <span className="w-2 h-2 rounded-sm bg-[var(--fj-moss)] ml-1"></span>
              </div>
              <p className="text-[12px] opacity-75 ml-[32px] leading-snug">Greek lessons</p>
              <p className="text-[11px] text-[#7A2E20] italic ml-[32px] mt-1">observed sleepy · last entry 4d ago</p>
            </div>

            <div className="fj-nav-item group cursor-pointer opacity-70">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="fj-mono fj-nav-stamp text-[#7A2E20]">003</span>
                <span className="fj-mono text-[#7A2E20]">·</span>
                <span className="text-[15px] italic text-[#1B1F23]">Drift</span>
                <span className="w-2 h-2 rounded-sm bg-[var(--fj-drift)] ml-1"></span>
              </div>
              <p className="text-[12px] opacity-75 ml-[32px] leading-snug">Novel chapter 7</p>
              <p className="text-[11px] text-[#7A2E20] italic ml-[32px] mt-1">observed restless · 11d</p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#1B1F23] border-opacity-10">
              <button className="flex items-center gap-2 text-[#1B1F23] hover:text-[#7A2E20] transition-colors">
                <span className="fj-mono text-[10px]">+</span>
                <span className="fj-display text-[13px]">Catalogue a new specimen</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* RIGHT COLUMN: The Spread */}
        <main className="flex-1 max-w-[700px]">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="fj-mono text-[#7A2E20] border-b border-[var(--fj-cinder)] pb-[2px]">SPECIMEN № 001</span>
                <span className="fj-mono text-[#1B1F23] opacity-60">·</span>
                <span className="fj-mono text-[#1B1F23] opacity-60">FIRST OBSERVED 14 JAN</span>
              </div>
              <h2 className="fj-display text-4xl mb-4 text-[#1B1F23]">Cinder</h2>
              <div className="fj-mono text-[#1B1F23] opacity-60 mb-6">12H 45M TOTAL OBSERVATION</div>
            </div>

            {/* Dragon Plate */}
            <figure className="fj-plate w-[160px] flex-shrink-0 flex flex-col items-center">
              <img 
                src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" 
                alt="Adolescent Cinder" 
                className="w-[140px] h-[140px] object-contain mix-blend-multiply mb-2"
              />
              <figcaption className="text-center text-[10px] italic text-[#1B1F23] border-t border-[#1B1F23] border-opacity-20 pt-2 w-full">
                Cinder · Adolescent<br/>obs. since 14 Jan
              </figcaption>
            </figure>
          </div>

          {/* Log Entry / Resume Card */}
          <section className="mb-16">
            <div className="fj-mono text-[#7A2E20] mb-4">LOG ENTRY № 042 · 12 MAY</div>
            
            <div className="pl-6 border-l-2 border-[#1B1F23] border-opacity-10 py-1 mb-8">
              <h3 className="italic text-[16px] mb-2 font-medium">Field notes — last session</h3>
              <p className="text-[15px] leading-relaxed opacity-85 mb-4">
                The keeper notes that 47 minutes were spent finishing the pricing page copy. The structure flows better now, but the transition to the enterprise tier still feels abrupt.
              </p>
              
              <h3 className="italic text-[16px] mb-2 font-medium">Recommended next observation</h3>
              <p className="text-[15px] leading-relaxed">
                <span className="fj-highlight-draw px-1 font-medium">Review the cancellation-flow draft your past self left in Notion</span> and begin structuring the win-back sequence.
              </p>
            </div>

            <button className="fj-stamp-btn fj-display text-[15px] tracking-widest px-8 py-4 cursor-pointer">
              BEGIN OBSERVATION · 20 MIN
            </button>
          </section>

          <hr className="fj-divider" />

          {/* Active Tasks */}
          <section className="mb-16">
            <h3 className="fj-mono text-[#7A2E20] mb-6">ACTIVE TASKS</h3>
            
            <div className="flex flex-col gap-4">
              {tasks.map((task, index) => (
                <div key={task.id} className={`flex items-start gap-4 group ${task.done ? 'opacity-40' : ''}`}>
                  <span className="fj-mono text-[#1B1F23] opacity-50 mt-[3px]">
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  <button onClick={() => toggleTask(task.id)} className="mt-[4px] text-[#1B1F23] cursor-pointer hover:opacity-60 transition-opacity">
                    {task.done ? <CheckedGlyph /> : <CheckboxGlyph />}
                  </button>
                  <span className={`text-[15px] leading-snug flex-1 ${task.done ? 'line-through' : ''}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Brain Dump */}
          <section className="mb-12">
            <div className="fj-mono text-[#7A2E20] mb-4">ENTRY № 043 (ADD TO LOG)</div>
            <textarea 
              className="w-full bg-transparent border-none border-b border-[#1B1F23] border-opacity-20 resize-none focus:outline-none focus:border-opacity-60 text-[15px] leading-relaxed italic opacity-85 placeholder:opacity-40"
              rows={4}
              placeholder="Record observations, stray thoughts, or newly discovered tasks..."
            ></textarea>
            <div className="flex justify-end mt-4">
              <button className="fj-mono text-[#1B1F23] text-[11px] hover:text-[#7A2E20] border border-[#1B1F23] border-opacity-20 px-3 py-1 hover:border-[#7A2E20] transition-colors">
                COMMIT TO RECORD
              </button>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
