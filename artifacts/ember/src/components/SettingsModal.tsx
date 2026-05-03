import { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';

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
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({ ai_api_key: '', ai_base_url: '', ai_model: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('OpenAI');

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(10, 6, 4, 0.78)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="parchment-card w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ember-text-muted hover:text-ember-text"
          aria-label="Close"
        >
          <CloseIcon size={16} />
        </button>

        <div className="mb-6">
          <p className="font-mono-caps text-[10px] text-ember-text-muted mb-2">The keeper's tools</p>
          <h2 className="font-display text-[28px] text-ember-text">AI Settings</h2>
        </div>

        {isLoading ? (
          <p className="font-serif-body italic text-ember-text-muted text-[14px] py-4 text-center">Loading…</p>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="font-mono-caps text-[10px] text-ember-text-muted mb-2 block">Provider</label>
              <div className="flex flex-wrap gap-2">
                {PROVIDER_PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => handlePresetChange(p.label)}
                    className="px-3 py-1.5 font-mono-caps text-[10px] transition-colors"
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
              <label className="font-mono-caps text-[10px] text-ember-text-muted mb-2 block">API Key</label>
              <input
                type="password"
                value={settings.ai_api_key}
                onChange={e => setSettings(prev => ({ ...prev, ai_api_key: e.target.value }))}
                placeholder={settings.ai_api_key.startsWith('••') ? 'key saved — enter new to replace' : 'sk-…'}
                className="w-full input-parchment px-3 py-2.5 text-[14px]"
              />
              <p className="font-serif-body italic text-[12px] text-ember-text-muted mt-2">
                Stored locally in SQLite. Never sent to Ember servers.
              </p>
            </div>

            <div>
              <label className="font-mono-caps text-[10px] text-ember-text-muted mb-2 block">Base URL</label>
              <input
                type="text"
                value={settings.ai_base_url}
                onChange={e => setSettings(prev => ({ ...prev, ai_base_url: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                className="w-full input-parchment px-3 py-2.5 text-[14px]"
              />
            </div>

            <div>
              <label className="font-mono-caps text-[10px] text-ember-text-muted mb-2 block">Model</label>
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
                <span className="font-mono-caps text-[10px]" style={{ color: 'var(--amber-glow)' }}>{savedMsg}</span>
              ) : (
                <p className="font-serif-body italic text-[12px] text-ember-text-muted">
                  AI is optional — Ember works without it.
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="cta-ember px-5 py-2 font-mono-caps text-[11px]"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
