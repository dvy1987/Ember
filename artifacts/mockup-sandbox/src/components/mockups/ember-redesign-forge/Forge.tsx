import React from 'react';
import './_group.css';

export function Forge() {
  return (
    <div className="forge-theme overflow-y-auto">
      {/* TOP BAR */}
      <div className="border-b" style={{ borderColor: 'var(--rule)' }}>
        <div className="flex items-center justify-between px-4 py-2 text-[11px] uppercase-tight" style={{ color: 'var(--ink-dim)' }}>
          <div className="flex items-center gap-6">
            <span><span style={{ color: 'var(--accent-cinder)' }}>EMBER</span>/forge</span>
            <span>build 2026.05.03</span>
            <span>uptime 4h12m<span className="blink">_</span></span>
          </div>
          <div className="flex items-center gap-6">
            <span>cpu 0.4%</span>
            <span>mem 218mb</span>
            <span><span className="status-dot ok" />sync</span>
          </div>
        </div>
      </div>

      {/* ROOST VIEW = ROSTER */}
      <div className="px-6 py-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="display text-3xl uppercase-tight" style={{ color: 'var(--ink)' }}>
              roster<span style={{ color: 'var(--accent-cinder)' }}>.tsv</span>
            </h1>
            <div className="mt-2 text-[11px] uppercase-tight" style={{ color: 'var(--ink-dim)' }}>
              3 dragons / 12 tasks open / last touched 2h17m ago
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary btn">[N] new</button>
            <button className="btn-secondary btn">[/] search</button>
            <button className="btn">[⏎] tend</button>
          </div>
        </div>

        <div className="panel mb-8">
          <div className="panel-head">
            <span>id · project · stage · streak · last · status</span>
            <span className="mono">3 / 3</span>
          </div>

          <div className="row">
            <span className="dragon-cell" data-stage="ado">
              <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" alt="" />
            </span>
            <div>
              <div className="display text-base" style={{ color: 'var(--ink)' }}>Q2 product launch</div>
              <div className="text-[10px] uppercase-tight mt-0.5" style={{ color: 'var(--ink-dim)' }}>~/ember/projects/cinder.proj</div>
            </div>
            <div>
              <span className="badge" style={{ color: 'var(--accent-cinder)' }}>cinder</span>
            </div>
            <div className="text-right mono text-xs" style={{ color: 'var(--ink)' }}>
              7d
              <div className="meter mt-1"><i style={{ width: '70%' }} /></div>
            </div>
            <div className="text-right text-[11px] uppercase-tight" style={{ color: 'var(--ink-dim)' }}>2h 17m</div>
            <div><span className="status-dot ok" /><span className="text-[10px] uppercase-tight" style={{ color: 'var(--ok)' }}>active</span></div>
          </div>

          <div className="row">
            <span className="dragon-cell" data-stage="hat">
              <img src="/__mockup/images/dragons/moss/hatchling-moss.webp" alt="" />
            </span>
            <div>
              <div className="display text-base" style={{ color: 'var(--ink)' }}>Greek lessons</div>
              <div className="text-[10px] uppercase-tight mt-0.5" style={{ color: 'var(--ink-dim)' }}>~/ember/projects/moss.proj</div>
            </div>
            <div>
              <span className="badge" style={{ color: 'var(--accent-moss)' }}>moss</span>
            </div>
            <div className="text-right mono text-xs" style={{ color: 'var(--ink)' }}>
              3d
              <div className="meter mt-1"><i style={{ width: '32%', background: 'var(--accent-moss)' }} /></div>
            </div>
            <div className="text-right text-[11px] uppercase-tight" style={{ color: 'var(--ink-dim)' }}>4d 03h</div>
            <div><span className="status-dot dim" /><span className="text-[10px] uppercase-tight" style={{ color: 'var(--ink-dim)' }}>idle</span></div>
          </div>

          <div className="row" style={{ background: 'rgba(255,45,111,0.05)' }}>
            <span className="dragon-cell" data-stage="ado">
              <img src="/__mockup/images/dragons/drift/adolscent-drift.webp" alt="" />
            </span>
            <div>
              <div className="display text-base" style={{ color: 'var(--ink)' }}>Novel chapter 7</div>
              <div className="text-[10px] uppercase-tight mt-0.5" style={{ color: 'var(--ink-dim)' }}>~/ember/projects/drift.proj</div>
            </div>
            <div>
              <span className="badge" style={{ color: 'var(--accent-drift)' }}>drift</span>
            </div>
            <div className="text-right mono text-xs" style={{ color: 'var(--ink)' }}>
              0d
              <div className="meter mt-1"><i style={{ width: '4%', background: 'var(--warn)' }} /></div>
            </div>
            <div className="text-right text-[11px] uppercase-tight" style={{ color: 'var(--warn)' }}>11d 06h</div>
            <div><span className="status-dot warn" /><span className="text-[10px] uppercase-tight" style={{ color: 'var(--warn)' }}>stale</span></div>
          </div>
        </div>

        {/* LOG STREAM */}
        <div className="panel mb-8">
          <div className="panel-head">
            <span>log · stream</span>
            <span style={{ color: 'var(--accent-cinder)' }}>tail -f</span>
          </div>
          <div className="px-3 py-3 text-[11px] leading-relaxed mono" style={{ color: 'var(--ink-dim)' }}>
            <div><span style={{ color: 'var(--ok)' }}>14:32:08</span>  cinder.session  end  duration=47m  tasks_done=3</div>
            <div><span style={{ color: 'var(--ok)' }}>14:32:08</span>  cinder.dragon   tend  state=adolescent  delta=+1.4xp</div>
            <div><span style={{ color: 'var(--ink-dim)' }}>13:45:00</span>  moss.task       add   "translate ch.4 vocab"</div>
            <div><span style={{ color: 'var(--warn)' }}>09:11:24</span>  drift.dragon    warn  no_session_in 264h</div>
            <div><span style={{ color: 'var(--ink-dim)' }}>08:00:01</span>  system          boot  forge_loaded</div>
            <div className="mt-1"><span style={{ color: 'var(--accent-cinder)' }}>{'>'}</span> <span className="blink">_</span></div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="px-6">
        <div className="flex items-center gap-4 text-[10px] uppercase-tight" style={{ color: 'var(--ink-faint)' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          <span>—— project view: cinder ——</span>
          <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        </div>
      </div>

      {/* PROJECT VIEW = TICKET */}
      <div className="px-6 py-6 pb-32">
        <div className="grid grid-cols-[180px_1fr] gap-6">
          {/* LEFT RAIL */}
          <div>
            <div className="dragon-cell" data-stage="adolescent" style={{ width: '180px', height: '180px' }}>
              <img src="/__mockup/images/dragons/cinder/adolescent-cinder.webp" alt="Cinder" />
            </div>
            <div className="mt-3 panel">
              <div className="panel-head">stats</div>
              <div className="px-3 py-3 text-[11px] mono space-y-1.5" style={{ color: 'var(--ink-dim)' }}>
                <div className="flex justify-between"><span>stage</span><span style={{ color: 'var(--accent-cinder)' }}>adolescent</span></div>
                <div className="flex justify-between"><span>xp</span><span style={{ color: 'var(--ink)' }}>71 / 100</span></div>
                <div className="flex justify-between"><span>streak</span><span style={{ color: 'var(--ink)' }}>7d</span></div>
                <div className="flex justify-between"><span>tend total</span><span style={{ color: 'var(--ink)' }}>4h 12m</span></div>
                <div className="flex justify-between"><span>created</span><span style={{ color: 'var(--ink)' }}>2026-04-14</span></div>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase-tight" style={{ color: 'var(--ink-dim)' }}>$ ember tend cinder</div>
                <h2 className="display text-3xl uppercase-tight mt-1" style={{ color: 'var(--ink)' }}>
                  Q2 product launch
                </h2>
              </div>
              <button className="btn">[⏎] start 20:00</button>
            </div>

            {/* RESUME = LAST RUN */}
            <div className="panel mb-6">
              <div className="panel-head">
                <span>last_run.log</span>
                <span style={{ color: 'var(--ink-dim)' }}>2h 17m ago · 47m</span>
              </div>
              <div className="px-4 py-3 text-[12px] leading-relaxed">
                <div style={{ color: 'var(--ink-dim)' }}># resumed at 13:45, ended at 14:32</div>
                <div className="mt-2"><span style={{ color: 'var(--ok)' }}>+</span> refined pricing page copy (h1, sub, plans)</div>
                <div><span style={{ color: 'var(--ok)' }}>+</span> rewrote 3 testimonial cards</div>
                <div><span style={{ color: 'var(--warn)' }}>!</span> note: review cancellation-flow draft in notion</div>
                <div className="mt-3 pt-3" style={{ borderTop: '1px dashed var(--rule)' }}>
                  <span style={{ color: 'var(--accent-cinder)' }}>{'>'} suggest:</span> resume at notion://cancellation-flow-draft
                </div>
              </div>
            </div>

            {/* TASKS = ISSUE LIST */}
            <div className="panel mb-6">
              <div className="panel-head">
                <span>tasks · open</span>
                <span style={{ color: 'var(--ink-dim)' }}>3 open / 5 total</span>
              </div>
              <div className="text-[12px]">
                <div className="px-4 py-2 grid grid-cols-[24px_60px_1fr_80px] gap-3 items-center" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <span><span className="status-dot warn" /></span>
                  <span className="mono text-[10px]" style={{ color: 'var(--ink-dim)' }}>#212</span>
                  <span style={{ color: 'var(--ink)' }}>Review cancellation-flow draft (Notion)</span>
                  <span className="text-right text-[10px] uppercase-tight" style={{ color: 'var(--warn)' }}>P1 today</span>
                </div>
                <div className="px-4 py-2 grid grid-cols-[24px_60px_1fr_80px] gap-3 items-center" style={{ borderBottom: '1px solid var(--rule)' }}>
                  <span><span className="status-dot dim" /></span>
                  <span className="mono text-[10px]" style={{ color: 'var(--ink-dim)' }}>#213</span>
                  <span style={{ color: 'var(--ink)' }}>Draft email announcement to subscribers</span>
                  <span className="text-right text-[10px] uppercase-tight" style={{ color: 'var(--ink-dim)' }}>P2</span>
                </div>
                <div className="px-4 py-2 grid grid-cols-[24px_60px_1fr_80px] gap-3 items-center">
                  <span><span className="status-dot dim" /></span>
                  <span className="mono text-[10px]" style={{ color: 'var(--ink-dim)' }}>#214</span>
                  <span style={{ color: 'var(--ink)' }}>Update hero image asset in CMS</span>
                  <span className="text-right text-[10px] uppercase-tight" style={{ color: 'var(--ink-dim)' }}>P3</span>
                </div>
              </div>
              <div className="px-4 py-2 flex gap-2 items-center" style={{ borderTop: '1px solid var(--rule)', background: 'var(--bg-2)' }}>
                <span className="text-[11px]" style={{ color: 'var(--accent-cinder)' }}>{'>'}</span>
                <input type="text" placeholder="add task — type & enter" className="flex-1" style={{ border: 'none', background: 'transparent', padding: 0 }} />
                <span className="text-[10px] uppercase-tight" style={{ color: 'var(--ink-dim)' }}>⏎</span>
              </div>
            </div>

            {/* BRAIN DUMP = SCRATCH BUFFER */}
            <div className="panel">
              <div className="panel-head">
                <span>scratch.buffer</span>
                <span style={{ color: 'var(--ink-dim)' }}>⌘+⏎ to distill</span>
              </div>
              <textarea
                placeholder="// dump thoughts. distill on submit."
                className="w-full h-28 resize-none"
                style={{ border: 'none' }}
              />
            </div>

            <div className="mt-6 text-[10px] uppercase-tight" style={{ color: 'var(--ink-faint)' }}>
              # total tend: 4h 12m  ·  next decay: in 5d 09h  ·  press <span style={{ color: 'var(--accent-cinder)' }}>?</span> for keys
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
