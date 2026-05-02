import { useState, useEffect } from 'react';

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

        // Detect preset from base URL
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-ember-panel rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">AI Settings</h2>
          <button
            onClick={onClose}
            className="text-ember-text-muted hover:text-ember-text text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <p className="text-ember-text-muted text-sm py-4 text-center">Loading…</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ember-text-muted uppercase tracking-wider mb-1.5">
                Provider
              </label>
              <div className="flex flex-wrap gap-2">
                {PROVIDER_PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => handlePresetChange(p.label)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedPreset === p.label
                        ? 'bg-ember-cinder text-ember-bg'
                        : 'bg-ember-bg text-ember-text-muted hover:text-ember-text'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ember-text-muted uppercase tracking-wider mb-1.5">
                API Key
              </label>
              <input
                type="password"
                value={settings.ai_api_key}
                onChange={e => setSettings(prev => ({ ...prev, ai_api_key: e.target.value }))}
                placeholder={settings.ai_api_key.startsWith('••') ? 'Key saved — enter new to replace' : 'sk-…'}
                className="w-full bg-ember-bg rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 ring-ember-cinder placeholder:text-ember-text-muted/50"
              />
              <p className="text-xs text-ember-text-muted mt-1">
                Stored locally in SQLite. Never sent to Ember servers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-ember-text-muted uppercase tracking-wider mb-1.5">
                Base URL
              </label>
              <input
                type="text"
                value={settings.ai_base_url}
                onChange={e => setSettings(prev => ({ ...prev, ai_base_url: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-ember-bg rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 ring-ember-cinder placeholder:text-ember-text-muted/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ember-text-muted uppercase tracking-wider mb-1.5">
                Model
              </label>
              <input
                type="text"
                value={settings.ai_model}
                onChange={e => setSettings(prev => ({ ...prev, ai_model: e.target.value }))}
                placeholder="gpt-4o-mini"
                className="w-full bg-ember-bg rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 ring-ember-cinder placeholder:text-ember-text-muted/50"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {savedMsg ? (
                <span className="text-sm text-emerald-400">{savedMsg}</span>
              ) : (
                <p className="text-xs text-ember-text-muted">
                  AI is optional — Ember works without it.
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-ember-cinder text-ember-bg font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
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
