import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Project } from '@/lib/types';

/**
 * Developer-only test page for the Living Dragons skill runtime.
 * NOT a real UI — F1-F6 will build the actual surfaces (Skills tab,
 * Paired chat, Inbox, Mode-fluid recs, Two-layer rules UI, Promotions).
 * Gated to import.meta.env.DEV in App.tsx.
 */

interface Skill {
  id: string;
  name: string;
  description: string;
  default_trust_band: string;
}

interface Maturity {
  dragon_id: string;
  skill_id: string;
  runs: number;
  approvals: number;
  edits: number;
  rejections: number;
  current_trust: string;
  paused: number;
  last_used_at: string | null;
}

interface SkillEntry {
  skill: Skill;
  maturity: Maturity;
}

interface SkillRun {
  id: string;
  dragon_id: string;
  skill_id: string;
  mode: string;
  complexity: string;
  user_prompt: string;
  output_text: string | null;
  status: string;
  cost_usd: number;
  model: string;
  input_tokens: number;
  output_tokens: number;
  ran_at: string;
}

interface Budget {
  dragon_id: string;
  monthly_cap_usd: number;
  current_spend_usd: number;
  reset_month: string;
}

const card: React.CSSProperties = {
  background: 'var(--parchment-warm, #f4ead8)',
  border: '1px solid var(--border-subtle, rgba(0,0,0,0.12))',
  padding: '20px',
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono-caps, monospace)',
  fontSize: '10px',
  letterSpacing: '0.08em',
  color: 'var(--text-muted, #6b5d4d)',
  textTransform: 'uppercase',
  marginBottom: '6px',
  display: 'block',
};

export default function DevSkillsPage() {
  const [dragons, setDragons] = useState<Project[]>([]);
  const [dragonId, setDragonId] = useState<string>('');
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [skillId, setSkillId] = useState<string>('');
  const [budget, setBudget] = useState<Budget | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<SkillRun | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [recent, setRecent] = useState<SkillRun[]>([]);

  // Load dragons
  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d: Project[]) => {
        setDragons(d);
        if (d.length && !dragonId) setDragonId(d[0].id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load skills + budget + recent runs when dragon changes
  useEffect(() => {
    if (!dragonId) return;
    fetch(`/api/dragons/${dragonId}/skills`)
      .then((r) => r.json())
      .then((d: SkillEntry[]) => {
        setSkills(d);
        if (d.length && !skillId) setSkillId(d[0].skill.id);
      })
      .catch(() => {});
    fetch(`/api/dragons/${dragonId}/budget`)
      .then((r) => r.json())
      .then((d: Budget) => setBudget(d))
      .catch(() => {});
    fetch(`/api/dragons/${dragonId}/skill-runs?limit=5`)
      .then((r) => r.json())
      .then((d: SkillRun[]) => setRecent(d))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragonId]);

  const refreshAfterChange = () => {
    if (!dragonId) return;
    fetch(`/api/dragons/${dragonId}/budget`).then((r) => r.json()).then(setBudget).catch(() => {});
    fetch(`/api/dragons/${dragonId}/skills`).then((r) => r.json()).then(setSkills).catch(() => {});
    fetch(`/api/dragons/${dragonId}/skill-runs?limit=5`).then((r) => r.json()).then(setRecent).catch(() => {});
  };

  const onInvoke = async () => {
    if (!dragonId || !skillId || !prompt.trim()) return;
    setRunning(true);
    setError('');
    setRun(null);
    setEditText('');
    try {
      const res = await fetch(`/api/dragons/${dragonId}/skills/${skillId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: prompt, mode: 'paired' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setRun(data.run);
        setEditText(data.run?.output_text ?? '');
      }
      refreshAfterChange();
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  const onVerdict = async (verdict: 'approve' | 'edit' | 'reject') => {
    if (!run) return;
    const body: Record<string, string> = { verdict };
    if (verdict === 'edit') body.user_edit = editText;
    try {
      const res = await fetch(`/api/skill-runs/${run.id}/verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setRun(data.run);
      }
      refreshAfterChange();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-serif-body, Georgia, serif)' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/" style={{ fontSize: 12, color: 'var(--text-muted, #6b5d4d)' }}>← back to the keep</Link>
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: 32, marginTop: 8, marginBottom: 4 }}>
          Skill Runtime — Developer
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #6b5d4d)', fontStyle: 'italic', margin: 0 }}>
          Scaffolding for the Living Dragons foundation. Real surfaces ship in F1-F6.
        </p>
      </div>

      <div style={card}>
        <label style={labelStyle}>Dragon</label>
        <select
          value={dragonId}
          onChange={(e) => { setDragonId(e.target.value); setRun(null); setError(''); }}
          style={{ width: '100%', padding: '8px 10px', fontSize: 14 }}
        >
          {dragons.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.dragon_type} {d.dragon_stage}
            </option>
          ))}
        </select>

        <label style={{ ...labelStyle, marginTop: 16 }}>Skill</label>
        <select
          value={skillId}
          onChange={(e) => setSkillId(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', fontSize: 14 }}
        >
          {skills.map((s) => (
            <option key={s.skill.id} value={s.skill.id}>
              {s.skill.name} — trust: {s.maturity.current_trust} ({s.maturity.runs} runs · {s.maturity.approvals}✓ {s.maturity.edits}~ {s.maturity.rejections}✗)
            </option>
          ))}
        </select>

        {budget && (
          <p style={{ fontSize: 12, color: 'var(--text-muted, #6b5d4d)', marginTop: 12, marginBottom: 0 }}>
            Budget {budget.reset_month}: ${budget.current_spend_usd.toFixed(4)} of ${budget.monthly_cap_usd.toFixed(2)} spent
          </p>
        )}
      </div>

      <div style={card}>
        <label style={labelStyle}>Prompt the dragon</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="Ask your dragon for help with the project…"
          style={{ width: '100%', padding: 10, fontSize: 14, fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
          <button
            onClick={onInvoke}
            disabled={running || !dragonId || !skillId || !prompt.trim()}
            style={{
              padding: '8px 18px',
              fontSize: 12,
              fontFamily: 'var(--font-mono-caps, monospace)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'var(--ember-accent, #6b3a1a)',
              color: 'var(--text-parchment, #f4ead8)',
              border: 'none',
              cursor: running ? 'wait' : 'pointer',
              opacity: running || !prompt.trim() ? 0.5 : 1,
            }}
          >
            {running ? 'Running…' : 'Invoke skill'}
          </button>
          {error && <span style={{ color: '#a14a3a', fontSize: 12 }}>error: {error}</span>}
        </div>
      </div>

      {run && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={labelStyle}>Run · {run.status} · {run.complexity} · ${run.cost_usd.toFixed(5)}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted, #6b5d4d)' }}>
              {run.model} · in {run.input_tokens}t / out {run.output_tokens}t
            </span>
          </div>
          {run.status === 'pending' || run.status === 'edited' || run.status === 'approved' || run.status === 'rejected' ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={10}
              readOnly={run.status !== 'pending'}
              style={{ width: '100%', padding: 10, fontSize: 14, fontFamily: 'inherit', background: run.status === 'pending' ? 'white' : 'transparent' }}
            />
          ) : (
            <p style={{ color: '#a14a3a' }}>(no output)</p>
          )}
          {run.status === 'pending' && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={() => onVerdict('approve')} style={verdictBtn('#3a6b3a')}>Approve</button>
              <button onClick={() => onVerdict('edit')} style={verdictBtn('#6b6b3a')}>Save edit</button>
              <button onClick={() => onVerdict('reject')} style={verdictBtn('#6b3a3a')}>Reject</button>
            </div>
          )}
        </div>
      )}

      {recent.length > 0 && (
        <div style={card}>
          <p style={labelStyle}>Recent runs</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recent.map((r) => (
              <li key={r.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <strong>{r.status}</strong> · {r.complexity} · ${r.cost_usd.toFixed(5)} · {new Date(r.ran_at).toLocaleString()} —{' '}
                <span style={{ color: 'var(--text-muted, #6b5d4d)' }}>
                  {r.user_prompt.slice(0, 80)}{r.user_prompt.length > 80 ? '…' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function verdictBtn(color: string): React.CSSProperties {
  return {
    padding: '8px 14px',
    fontSize: 11,
    fontFamily: 'var(--font-mono-caps, monospace)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    background: 'transparent',
    color,
    border: `1px solid ${color}`,
    cursor: 'pointer',
  };
}
