import { useState } from 'react';
import { DragonType } from '@/lib/types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const dragonTypes: { type: DragonType; label: string; emoji: string; desc: string }[] = [
  { type: 'cinder', label: 'Cinder', emoji: '🔥', desc: 'Intense bursts of focus' },
  { type: 'moss', label: 'Moss', emoji: '🌿', desc: 'Slow and steady growth' },
  { type: 'drift', label: 'Drift', emoji: '💨', desc: 'Airy and curious energy' },
];

export default function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<DragonType>('cinder');
  const [brainDump, setBrainDump] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          dragon_type: selectedType,
          summary: brainDump.trim(),
        }),
      });

      if (res.ok) {
        setName('');
        setBrainDump('');
        setSelectedType('cinder');
        onCreated();
        onClose();
      }
    } catch {
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-ember-panel rounded-2xl p-6 w-full max-w-lg border border-ember-border">
        <h2 className="text-xl font-semibold mb-5">Hatch a New Dragon 🥚</h2>

        <div className="mb-4">
          <label className="text-sm text-ember-text-muted mb-1.5 block">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What are you working on?"
            className="w-full bg-ember-bg border border-ember-border rounded-lg px-3 py-2.5 text-sm text-ember-text placeholder:text-ember-text-muted/50 focus:outline-none focus:border-ember-cinder"
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-ember-text-muted mb-1.5 block">Choose Your Dragon</label>
          <div className="grid grid-cols-3 gap-2">
            {dragonTypes.map((dt) => (
              <button
                key={dt.type}
                onClick={() => setSelectedType(dt.type)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedType === dt.type
                    ? 'border-ember-cinder bg-ember-panel-light'
                    : 'border-ember-border bg-ember-bg hover:bg-ember-bg-light'
                }`}
              >
                <div className="text-2xl mb-1">{dt.emoji}</div>
                <div className="text-sm font-medium">{dt.label}</div>
                <div className="text-xs text-ember-text-muted">{dt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-sm text-ember-text-muted mb-1.5 block">
            Brain Dump <span className="opacity-50">(optional)</span>
          </label>
          <textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="Dump your initial thoughts about this project..."
            rows={3}
            className="w-full bg-ember-bg border border-ember-border rounded-lg px-3 py-2.5 text-sm text-ember-text placeholder:text-ember-text-muted/50 resize-none focus:outline-none focus:border-ember-cinder"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-ember-bg text-sm text-ember-text-muted hover:text-ember-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 bg-ember-cinder text-ember-bg hover:scale-[1.02]"
          >
            {isCreating ? 'Hatching...' : 'Hatch Dragon'}
          </button>
        </div>
      </div>
    </div>
  );
}
