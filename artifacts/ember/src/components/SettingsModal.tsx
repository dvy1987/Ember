import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { CloseIcon } from './Icons';
import SkillsTrustSection from './SkillsTrustSection';
import SessionDurationPicker from './SessionDurationPicker';

interface Settings {
  ai_api_key: string;
  ai_base_url: string;
  ai_model: string;
}

const PROVIDER_PRESETS = [
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  { label: 'Ollama (local)', baseUrl: 'http://localhost:11434/v1', model: 'llama3' },
  { label: 'Custom', baseUrl: '', model: '' },
] as const;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When opened from a project page, that dragon is expanded in Skills & trust. */
  defaultDragonId?: string | null;
  /** When 'skills', the modal scrolls Skills & trust into view on open. */
  initialFocus?: 'ai' | 'skills';
  /** Called after pitch demo dragon is prepared so Home can refresh. */
  onPitchDemoReady?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  defaultDragonId = null,
  initialFocus = 'ai',
  onPitchDemoReady,
}: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({ ai_api_key: '', ai_base_url: '', ai_model: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('OpenAI');
  const [pitchDemoStatus, setPitchDemoStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        setSettings({
          ai_api_key: data['ai_api_key'] || '',
          ai_base_url: data['ai_base_url'] || '',
          ai_model: data['ai_model'] || '',
        });
        const matchedPreset = PROVIDER_PRESETS.find(p => p.baseUrl && p.baseUrl === data['ai_base_url']);
        setSelectedPreset(matchedPreset?.label ?? 'Custom');
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const handlePresetChange = (label: string) => {
    setSelectedPreset(label);
    const preset = PROVIDER_PRESETS.find(p => p.label === label);
    if (preset && preset.label !== 'Custom') {
      setSettings(prev => ({ ...prev, ai_base_url: preset.baseUrl, ai_model: preset.model }));
    }
  };

  const handlePreparePitchDemo = async () => {
    setPitchDemoStatus('loading');
    try {
      const res = await fetch('/api/demo/ensure-pitch', { method: 'POST' });
      if (res.ok) {
        setPitchDemoStatus('done');
        onPitchDemoReady?.();
        setTimeout(() => setPitchDemoStatus('idle'), 3000);
      } else {
        setPitchDemoStatus('error');
      }
    } catch {
      setPitchDemoStatus('error');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedMsg('Settings saved');
        setTimeout(() => setSavedMsg(''), 2500);
      }
    } catch {
      setSavedMsg('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 animate-fade-in overflow-y-auto"
      style={{ backgroundColor: 'rgba(10, 6, 4, 0.78)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="parchment-card w-full max-w-md p-8 relative my-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ember-text-muted hover:text-ember-text"
          aria-label="Close"
        >
          <CloseIcon size={16} />
        </button>

        <div className="mb-6">
          <h2 className="font-display text-[28px] text-ember-text">AI Settings</h2>
        </div>

        {isLoading ? (
          <p className="body-sm text-ember-text-muted py-4 text-center">Loading…</p>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="font-mono-caps text-ember-text-muted mb-2 block">Provider</label>
              <div className="flex flex-wrap gap-2">
                {PROVIDER_PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => handlePresetChange(p.label)}
                    className="px-3 py-1.5 font-mono-caps transition-colors"
                    style={{
                      border: `1px solid ${selectedPreset === p.label ? 'var(--ember-accent)' : 'var(--border-subtle)'}`,
                      background: selectedPreset === p.label ? 'var(--ember-accent)' : 'transparent',
                      color: selectedPreset === p.label ? 'var(--text-parchment)' : 'var(--text-muted)',
                      borderRadius: '4px',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono-caps text-ember-text-muted mb-2 block">API Key</label>
              <input
                type="password"
                value={settings.ai_api_key}
                onChange={e => setSettings(prev => ({ ...prev, ai_api_key: e.target.value }))}
                placeholder={settings.ai_api_key.startsWith('••') ? 'key saved — enter new to replace' : 'sk-…'}
                className="w-full input-parchment px-3 py-2.5 text-[14px]"
              />
              <p className="body-sm text-ember-text-muted mt-2">
                Stored locally in SQLite. Never sent to Ember servers.
              </p>
              <p className="body-sm text-ember-text-muted mt-2">
                No key? Use Ember from Cursor via MCP with your existing AI subscription.
                See <span className="text-ember-text">docs/mcp-setup.md</span> in the repo — brain dump and resume work there too.
              </p>
            </div>

            <div>
              <label className="font-mono-caps text-ember-text-muted mb-2 block">Base URL</label>
              <input
                type="text"
                value={settings.ai_base_url}
                onChange={e => setSettings(prev => ({ ...prev, ai_base_url: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                className="w-full input-parchment px-3 py-2.5 text-[14px]"
              />
            </div>

            <div>
              <label className="font-mono-caps text-ember-text-muted mb-2 block">Model</label>
              <input
                type="text"
                value={settings.ai_model}
                onChange={e => setSettings(prev => ({ ...prev, ai_model: e.target.value }))}
                placeholder="gpt-4o-mini"
                className="w-full input-parchment px-3 py-2.5 text-[14px]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {savedMsg ? (
                <span className="font-mono-caps" style={{ color: 'var(--amber-glow)' }}>{savedMsg}</span>
              ) : (
                <p className="body-sm text-ember-text-muted">
                  AI is optional — Ember works without it.
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="cta-ember px-5 py-2 font-mono-caps"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        <div
          id="skills-trust-section"
          className="mt-8 pt-6 scroll-mt-12"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
          ref={el => {
            if (el && initialFocus === 'skills' && isOpen) {
              setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
            }
          }}
        >
          <h3 className="font-display text-[22px] text-ember-text mb-1">Skills &amp; trust</h3>
          <SkillsTrustSection defaultDragonId={defaultDragonId} />
        </div>

        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <h3 className="font-display text-[20px] text-ember-text mb-1">Default session length</h3>
          <p className="body-sm text-ember-text-muted mb-4">
            How long each training session runs. You can change this on any Resume Card too.
          </p>
          <SessionDurationPicker compact />
        </div>

        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <h3 className="font-display text-[20px] text-ember-text mb-1">Use from Cursor</h3>
          <p className="body-sm text-ember-text-muted mb-3 leading-relaxed">
            Ember&apos;s sacred loop works inside Cursor, Codex, and other MCP clients.
            Bring your own AI subscription — no separate Ember API key required.
            See <span className="text-ember-text">docs/mcp-setup.md</span> in your Ember folder.
          </p>
        </div>

        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <h3 className="font-display text-[20px] text-ember-text mb-1">Pitch walkthrough</h3>
          <p className="body-sm text-ember-text-muted mb-4">
            Prepare or refresh &ldquo;The Pitch&rdquo; demo dragon with a believable resume and tasks.
            Works without an API key.
          </p>
          <button
            type="button"
            onClick={handlePreparePitchDemo}
            disabled={pitchDemoStatus === 'loading'}
            className="cta-quiet w-full py-2.5 font-mono-caps text-ember-text-muted hover:text-ember-text disabled:opacity-50"
          >
            {pitchDemoStatus === 'loading' ? 'Preparing…' : 'Prepare pitch demo dragon'}
          </button>
          {pitchDemoStatus === 'done' && (
            <p className="font-mono-caps mt-2" style={{ color: 'var(--amber-glow)' }}>
              Demo dragon ready — check Ember Keep
            </p>
          )}
          {pitchDemoStatus === 'error' && (
            <p className="font-mono-caps mt-2" style={{ color: 'var(--ember-accent)' }}>
              Could not prepare demo. Try again.
            </p>
          )}
        </div>

        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="font-mono-caps text-ember-text-muted mb-2">External messaging — coming soon</p>
          <p className="body-sm text-ember-text-muted">
            Letting your dragons reach you on WhatsApp — coming soon.
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="mt-8 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="font-mono-caps text-ember-text-muted mb-2 opacity-70">Developer</p>
            <div className="flex flex-col gap-1">
              <Link
                href="/menagerie"
                className="body-sm text-ember-text-muted hover:text-ember-text"
              >
                View the dragon menagerie →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
