import { useState } from 'react';
import { DragonType } from '@/lib/types';
import { FlameIcon, LeafIcon, WindIcon, CloseIcon } from './Icons';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const dragonTypes: { type: DragonType; label: string; Icon: typeof FlameIcon; desc: string }[] = [
  { type: 'cinder', label: 'Cinder', Icon: FlameIcon, desc: 'intense bursts' },
  { type: 'moss',   label: 'Moss',   Icon: LeafIcon,  desc: 'slow & steady' },
  { type: 'drift',  label: 'Drift',  Icon: WindIcon,  desc: 'airy & curious' },
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
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(10, 6, 4, 0.78)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="parchment-card w-full max-w-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ember-text-muted hover:text-ember-text"
          aria-label="Close"
        >
          <CloseIcon size={16} />
        </button>

        <div className="text-center mb-6">
          <p className="font-mono-caps text-[10px] text-ember-text-muted mb-2">A new keeper's egg</p>
          <h2 className="font-display text-[32px] text-ember-text leading-tight">Hatch a new dragon</h2>
        </div>

        <div className="mb-5">
          <label className="font-mono-caps text-[10px] text-ember-text-muted mb-2 block">Project name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="what are you working on?"
            className="w-full input-parchment px-3 py-3 text-[15px]"
            autoFocus
          />
        </div>

        <div className="mb-5">
          <label className="font-mono-caps text-[10px] text-ember-text-muted mb-2 block">Choose your dragon</label>
          <div className="grid grid-cols-3 gap-2">
            {dragonTypes.map((dt) => (
              <button
                key={dt.type}
                onClick={() => setSelectedType(dt.type)}
                className="p-4 text-center transition-colors"
                style={{
                  border: `1px solid ${selectedType === dt.type ? 'var(--ember-accent)' : 'var(--border-subtle)'}`,
                  background: selectedType === dt.type ? 'var(--surface-mid-hover)' : 'var(--surface-mid)',
                  borderRadius: '4px',
                  color: selectedType === dt.type ? 'var(--ember-accent)' : 'var(--text-muted)',
                }}
              >
                <div className="flex justify-center mb-2"><dt.Icon size={20} /></div>
                <div className="font-display text-[18px] text-ember-text">{dt.label}</div>
                <div className="font-mono-caps text-[9px] text-ember-text-muted mt-1">{dt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="font-mono-caps text-[10px] text-ember-text-muted mb-2 block">
            Brain dump <span className="opacity-60">(optional)</span>
          </label>
          <textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="dump your initial thoughts about this project…"
            rows={3}
            className="w-full input-parchment px-3 py-2.5 text-[14px] resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="cta-quiet flex-1 py-3 font-mono-caps text-[11px] text-ember-text-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="cta-ember flex-1 py-3 font-mono-caps text-[11px]"
          >
            {isCreating ? 'Hatching…' : 'Hatch dragon'}
          </button>
        </div>
      </div>
    </div>
  );
}
