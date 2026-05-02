import React from 'react';
import './_group.css';

function IconFlame(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter" {...props}>
      <path d="M12 2C12 2 5 7 5 14C5 17.866 8.13401 21 12 21C15.866 21 19 17.866 19 14C19 7 12 2 12 2Z" />
      <path d="M12 21C12 21 15 18 15 15C15 12 12 9 12 9C12 9 9 12 9 15C9 18 12 21 12 21Z" />
    </svg>
  );
}

function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter" {...props}>
      <path d="M20 6L9 17L4 12" />
    </svg>
  );
}

function IconCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter" {...props}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function IconDroplet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter" {...props}>
      <path d="M12 22C16.4183 22 20 18.4183 20 14C20 8 12 2 12 2C12 2 4 8 4 14C4 18.4183 7.58172 22 12 22Z" />
    </svg>
  );
}

function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter" {...props}>
      <path d="M12 5V19M5 12H19" />
    </svg>
  );
}

export function Den() {
  return (
    <div className="den-theme flex flex-col items-center py-20 w-full min-h-screen">
      
      {/* --- Divider 1: Roost View --- */}
      <div className="w-full max-w-[1280px] mb-8 flex flex-col items-center">
        <div className="text-[var(--text-muted)] font-mono mb-4">01 // Roost View</div>
        <div className="w-full h-[800px] border border-[var(--hairline)] rounded-xl overflow-hidden flex bg-[var(--bg-mahogany)]">
          <Sidebar activeId={null} />
          <div className="flex-1 flex flex-col items-center justify-center">
            <IconFlame className="text-[var(--text-muted)] w-8 h-8 mb-4 opacity-50" />
            <div className="text-[var(--text-muted)] font-display text-lg mb-1">Your desk is clear</div>
            <div className="text-[var(--text-muted)] opacity-60 text-sm">Select a project from the Roost to begin.</div>
          </div>
        </div>
      </div>

      {/* --- Divider --- */}
      <div className="w-full max-w-[1280px] h-[1px] bg-[var(--hairline)] my-16 relative flex justify-center">
        <div className="absolute -top-3 bg-[var(--bg-mahogany)] px-4 text-[var(--text-muted)] font-mono">02 // Project View</div>
      </div>

      {/* --- Divider 2: Project View --- */}
      <div className="w-full max-w-[1280px] mb-20 flex flex-col items-center">
        <div className="w-full min-h-[900px] border border-[var(--hairline)] rounded-xl overflow-hidden flex bg-[var(--bg-mahogany)]">
          <Sidebar activeId="cinder" />
          <div className="flex-1 flex justify-center overflow-y-auto">
            <ProjectContent />
          </div>
        </div>
      </div>

    </div>
  );
}

function Sidebar({ activeId }: { activeId: string | null }) {
  const projects = [
    { id: 'cinder', name: 'Q2 product launch', type: 'cinder', stage: 'adolescent-cinder.webp', lastTended: '2h ago', color: 'var(--cinder)', state: 'active' },
    { id: 'moss', name: 'Greek lessons', type: 'moss', stage: 'hatchling-moss.webp', lastTended: '4d ago', color: 'var(--moss)', state: 'sleepy' },
    { id: 'drift', name: 'novel chapter 7', type: 'drift', stage: 'adolscent-drift.webp', lastTended: '11d ago', color: 'var(--drift)', state: 'restless' },
  ];

  return (
    <div className="w-[240px] border-r border-[var(--hairline)] bg-[var(--bg-surface)]/30 flex flex-col h-full shrink-0">
      <div className="p-6">
        <h1 className="font-display text-xl tracking-tight text-[var(--text-primary)]">Roost</h1>
      </div>
      
      <div className="flex-1 flex flex-col px-3 gap-1">
        {projects.map(p => {
          const isActive = p.id === activeId;
          const saturation = p.state === 'active' ? 'saturate-100' : p.state === 'sleepy' ? 'saturate-50 opacity-70' : 'saturate-0 opacity-50';
          return (
            <div key={p.id} className={`relative flex items-center p-2 rounded-md cursor-pointer transition-all 180ms ease-out ${isActive ? 'bg-[var(--accent-brass)]/10' : 'hover:bg-[var(--bg-surface)]'}`}>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r" style={{ backgroundColor: isActive ? p.color : 'transparent' }}></div>
              <div className={`w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--hairline)] overflow-hidden shrink-0 flex items-center justify-center mr-3 ml-1 ${saturation}`}>
                <img src={`/__mockup/images/dragons/${p.type}/${p.stage}`} alt={p.name} className="w-6 h-6 object-contain" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm truncate text-[var(--text-primary)]">{p.name}</span>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">{p.lastTended}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--hairline)]">
        <button className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-full p-2">
          <IconPlus className="w-4 h-4" />
          <span>New project</span>
        </button>
      </div>
    </div>
  );
}

function ProjectContent() {
  return (
    <div className="w-full max-w-[720px] px-8 py-16 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <div className="w-24 h-24 rounded-full border border-[var(--hairline)] bg-[var(--bg-surface)] flex items-center justify-center overflow-hidden shrink-0">
          <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" alt="Cinder" className="w-20 h-20 object-contain" />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="font-display text-3xl mb-1 text-[var(--text-primary)]">Q2 product launch</h2>
          <div className="font-mono text-xs text-[var(--text-muted)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--cinder)' }}></span>
            Last tended 2h ago
          </div>
        </div>
      </div>

      {/* Resume Card */}
      <div className="mb-12 border-l border-[var(--cinder)] pl-6 py-2 relative">
        <div className="absolute -left-[5px] top-4 w-[9px] h-[9px] rounded-full bg-[var(--bg-mahogany)] border border-[var(--cinder)]"></div>
        <p className="italic text-[var(--text-primary)] text-lg mb-6 leading-relaxed">
          "I've been holding the 47 minutes you spent finishing the pricing page copy."
        </p>
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2 font-display">Suggested next move</div>
          <div className="text-[var(--text-primary)] text-base pb-1 border-b border-[var(--accent-brass)]/30 inline-block">
            review the cancellation-flow draft your past self left in Notion
          </div>
        </div>
        
        <button className="button-cta w-full max-w-sm rounded flex items-center justify-between px-5 py-3">
          <span className="font-medium text-sm">Begin a 20-minute session</span>
          <span className="font-mono bg-[var(--bg-mahogany)]/10 px-2 py-1 rounded text-xs tracking-tight">20:00</span>
        </button>
      </div>

      {/* Active Tasks */}
      <div className="mb-12">
        <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4 font-display">Active Tasks</div>
        <div className="flex flex-col gap-2">
          {['Draft announcement email', 'Review cancellation-flow', 'Update hero asset for landing page'].map((task, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-[var(--hairline)] group cursor-pointer">
              <IconCircle className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-brass)] transition-colors shrink-0 mt-0.5" />
              <span className="text-sm text-[var(--text-primary)] leading-snug">{task}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Brain Dump */}
      <div className="mb-12">
        <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4 font-display">Brain Dump</div>
        <textarea 
          className="w-full h-32 bg-[var(--bg-surface)] border border-[var(--hairline)] rounded p-4 text-sm text-[var(--text-primary)] font-mono resize-none focus:outline-none focus:border-[var(--accent-brass)]/50 transition-colors"
          placeholder="what's been on your mind..."
        ></textarea>
      </div>

      {/* Session Log */}
      <div className="mb-12">
        <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-4 font-display">Recent Session Log</div>
        <div className="flex flex-col gap-4 text-sm text-[var(--text-muted)] border-l border-[var(--hairline)] pl-4 ml-2">
          <div><span className="font-mono text-[10px] mr-3 opacity-60">TODAY</span> Finished pricing copy. Reduced cognitive load on tier 2.</div>
          <div><span className="font-mono text-[10px] mr-3 opacity-60">YESTR</span> Mapped out launch timeline.</div>
        </div>
      </div>

    </div>
  );
}
