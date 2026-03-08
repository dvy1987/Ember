'use client';

import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PROVIDERS = [
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  { label: 'Custom', baseUrl: '', model: '' },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [model, setModel] = useState('gpt-4o-mini');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('OpenAI');

  // Load current settings (but never show the actual key)
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : [])
      .then((rows: { key: string; value: string }[]) => {
        const get = (k: string) => rows.find(r => r.key === k)?.value ?? '';
        const url = get('ai_base_url') || 'https://api.openai.com/v1';
        const mod = get('ai_model') || 'gpt-4o-mini';
        setBaseUrl(url);
        setModel(mod);
        // Detect provider from URL
        const preset = PRESET_PROVIDERS.find(p => p.baseUrl === url);
        setSelectedProvider(preset?.label ?? 'Custom');
      })
      .catch(() => {});
  }, [isOpen]);

  const handleProviderChange = (label: string) => {
    setSelectedProvider(label);
    const preset = PRESET_PROVIDERS.find(p => p.label === label);
    if (preset && label !== 'Custom') {
      setBaseUrl(preset.baseUrl);
      setModel(preset.model);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const updates = [
        { key: 'ai_base_url', value: baseUrl },
        { key: 'ai_model', value: model },
      ];
      // Only update API key if the user typed something new
      if (apiKey.trim() && !apiKey.includes('•')) {
        updates.push({ key: 'ai_api_key', value: apiKey.trim() });
      }
      await Promise.all(
        updates.map(u =>
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u),
          })
        )
      );
      setSaved(true);
      setApiKey(''); // clear after save for security
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-ember-panel border border-ember-border rounded-2xl w-full max-w-md p-6 shadow-2xl fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-ember-text-muted hover:text-ember-text transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* AI Configuration */}
        <div className="space-y-4">
          <p className="text-xs text-ember-text-muted uppercase tracking-wider">AI Configuration</p>
          <p className="text-xs text-ember-text-muted">
            Ember works fully offline without AI. Add an API key to enable task extraction, reflection processing, and context restoration.
          </p>

          {/* Provider selector */}
          <div>
            <label className="block text-sm mb-1.5">Provider</label>
            <div className="flex gap-2">
              {PRESET_PROVIDERS.map(p => (
                <button
                  key={p.label}
                  onClick={() => handleProviderChange(p.label)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedProvider === p.label ? 'var(--color-ember-cinder)' : 'var(--color-ember-bg)',
                    color: selectedProvider === p.label ? '#1a1a2e' : 'var(--color-ember-text-muted)',
                    border: '1px solid var(--color-ember-border)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Leave blank to keep existing key"
              className="w-full bg-ember-bg border border-ember-border rounded-lg px-3 py-2 text-sm text-ember-text placeholder:text-ember-text-muted/50 focus:outline-none focus:border-ember-cinder transition-colors"
            />
          </div>

          {/* Base URL — shown for custom */}
          {selectedProvider === 'Custom' && (
            <div>
              <label className="block text-sm mb-1.5">Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-ember-bg border border-ember-border rounded-lg px-3 py-2 text-sm text-ember-text placeholder:text-ember-text-muted/50 focus:outline-none focus:border-ember-cinder transition-colors"
              />
            </div>
          )}

          {/* Model */}
          <div>
            <label className="block text-sm mb-1.5">Model</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full bg-ember-bg border border-ember-border rounded-lg px-3 py-2 text-sm text-ember-text placeholder:text-ember-text-muted/50 focus:outline-none focus:border-ember-cinder transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-ember-text-muted border border-ember-border hover:border-ember-panel-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-ember-cinder)', color: '#1a1a2e' }}
          >
            {saved ? '✓ Saved' : isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
