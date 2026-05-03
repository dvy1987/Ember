import { useState } from 'react';
import { DragonType } from '@/lib/types';
import { FlameIcon, LeafIcon, WindIcon, SnowflakeIcon, CloseIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type DragonShape = 'project' | 'ritual' | 'mixed';

const dragonTypes: {
  type: DragonType;
  label: string;
  Icon: typeof FlameIcon;
  shape: DragonShape;
  blurb: string;
  question: string;
}[] = [
  {
    type: 'cinder',
    label: 'Cinder',
    Icon: FlameIcon,
    shape: 'project',
    blurb: 'Forge-born — fire, embers, restless flame. For a single endeavor you mean to finish.',
    question: 'What endeavor will Cinder guard?',
  },
  {
    type: 'moss',
    label: 'Moss',
    Icon: LeafIcon,
    shape: 'ritual',
    blurb: 'Earth-born — slow, rooted. For a piece of life you want to keep tending, not finish.',
    question: 'What part of your life will Moss tend?',
  },
  {
    type: 'drift',
    label: 'Drift',
    Icon: WindIcon,
    shape: 'mixed',
    blurb: 'Sky-born — quick, ethereal, wandering. For exploration that takes both shape and rhythm.',
    question: 'What will Drift carry for you?',
  },
  {
    type: 'frost',
    label: 'Frost',
    Icon: SnowflakeIcon,
    shape: 'ritual',
    blurb: 'Winter-born — patient, exact, kept by the cold. For things that ask precision over heat.',
    question: 'What does Frost watch over?',
  },
];

const exampleChips: { label: string; shape: DragonShape; suggestedKind: DragonType }[] = [
  { label: 'Write the novel', shape: 'project', suggestedKind: 'cinder' },
  { label: 'Train for the half-marathon', shape: 'project', suggestedKind: 'cinder' },
  { label: 'Re-do the kitchen', shape: 'project', suggestedKind: 'cinder' },
  { label: 'Learn Spanish', shape: 'mixed', suggestedKind: 'drift' },
  { label: 'Family time', shape: 'ritual', suggestedKind: 'moss' },
  { label: 'My craft', shape: 'mixed', suggestedKind: 'drift' },
  { label: 'Money & savings', shape: 'ritual', suggestedKind: 'frost' },
  { label: 'Friendships', shape: 'ritual', suggestedKind: 'moss' },
];

type Step = 'kind' | 'tend' | 'name';

export default function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const [step, setStep] = useState<Step>('kind');
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<DragonType>('cinder');
  const [tendingHint, setTendingHint] = useState('');
  const [brainDump, setBrainDump] = useState('');
  const [brainDumpOpen, setBrainDumpOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const reset = () => {
    setStep('kind');
    setName('');
    setSelectedType('cinder');
    setTendingHint('');
    setBrainDump('');
    setBrainDumpOpen(false);
    setIsCreating(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const selected = dragonTypes.find(d => d.type === selectedType)!;

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
          summary: [tendingHint.trim(), brainDump.trim()].filter(Boolean).join('\n\n'),
        }),
      });

      if (res.ok) {
        onCreated();
        handleClose();
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
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="parchment-card w-full max-w-lg p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-ember-text-muted hover:text-ember-text"
          aria-label="Close"
        >
          <CloseIcon size={16} />
        </button>

        <div className="text-center mb-6">
          <p className="font-mono-caps text-[10px] text-ember-text-muted mb-2">
            Step {step === 'kind' ? 1 : step === 'tend' ? 2 : 3} of 3
          </p>
          <h2 className="font-display text-[28px] text-ember-text leading-tight">
            {step === 'kind' && 'Which kind comes to your hearth?'}
            {step === 'tend' && selected.question}
            {step === 'name' && 'Name the dragon.'}
          </h2>
          {step === 'tend' && (
            <p className="font-serif-body italic text-[14px] text-ember-text-muted mt-2 max-w-md mx-auto">
              Some dragons guard a single endeavor. Others guard a piece of your life you want to keep tending.
            </p>
          )}
        </div>

        {step === 'kind' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {dragonTypes.map((dt) => {
                const isActive = selectedType === dt.type;
                return (
                  <button
                    key={dt.type}
                    onClick={() => setSelectedType(dt.type)}
                    className="p-4 text-left transition-colors"
                    style={{
                      border: `1px solid ${isActive ? `var(--color-ember-${dt.type})` : 'var(--border-subtle)'}`,
                      background: isActive ? 'var(--surface-mid-hover)' : 'var(--surface-mid)',
                      borderRadius: '4px',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5" style={{ color: `var(--color-ember-${dt.type})` }}>
                      <dt.Icon size={18} />
                      <span className="font-display text-[18px] text-ember-text">{dt.label}</span>
                    </div>
                    <p className="font-serif-body italic text-[12.5px] text-ember-text-muted leading-snug">
                      {dt.blurb}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="cta-quiet flex-1 py-3 font-mono-caps text-[11px] text-ember-text-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('tend')}
                className="cta-ember flex-1 py-3 font-mono-caps text-[11px] inline-flex items-center justify-center gap-2"
              >
                Next <ArrowRightIcon size={13} />
              </button>
            </div>
          </>
        )}

        {step === 'tend' && (
          <>
            <div className="mb-4">
              <textarea
                value={tendingHint}
                onChange={(e) => setTendingHint(e.target.value)}
                placeholder="A few words about what this dragon will tend…"
                rows={3}
                className="w-full input-parchment px-3 py-2.5 text-[14px] resize-none"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <p className="font-mono-caps text-[10px] text-ember-text-muted mb-2">Or borrow an example</p>
              <div className="flex flex-wrap gap-2">
                {exampleChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setTendingHint(chip.label);
                      setName(chip.label);
                    }}
                    className="px-3 py-1.5 font-serif-body text-[13px] text-ember-text-muted hover:text-ember-text transition-colors"
                    style={{
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface-mid)',
                      borderRadius: '999px',
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('kind')}
                className="cta-quiet px-4 py-3 font-mono-caps text-[11px] text-ember-text-muted inline-flex items-center gap-2"
              >
                <ArrowLeftIcon size={13} /> Back
              </button>
              <button
                onClick={() => setStep('name')}
                className="cta-ember flex-1 py-3 font-mono-caps text-[11px] inline-flex items-center justify-center gap-2"
              >
                Next <ArrowRightIcon size={13} />
              </button>
            </div>
          </>
        )}

        {step === 'name' && (
          <>
            <div className="mb-6">
              <label className="font-mono-caps text-[10px] text-ember-text-muted mb-2 block">
                Project name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="give your dragon a name"
                className="w-full input-parchment px-3 py-3 text-[15px]"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleCreate(); }}
              />
              <p className="font-serif-body italic text-[13px] text-ember-text-muted mt-3 leading-snug">
                You chose <span className="text-ember-text">{selected.label}</span>.
                {' '}Their egg comes to your hearth, waiting to be tended.
              </p>

              <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setBrainDumpOpen(o => !o)}
                  className="font-mono-caps text-[10px] text-ember-text-muted hover:text-ember-text inline-flex items-center gap-1.5"
                  aria-expanded={brainDumpOpen}
                >
                  {brainDumpOpen ? '−' : '+'} A few notes? (optional)
                </button>
                {brainDumpOpen && (
                  <div className="mt-3">
                    <textarea
                      value={brainDump}
                      onChange={(e) => setBrainDump(e.target.value)}
                      placeholder="Anything on your mind about this dragon — context, hopes, first steps. Nothing required."
                      rows={4}
                      className="w-full input-parchment px-3 py-2.5 text-[13.5px] resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('tend')}
                className="cta-quiet px-4 py-3 font-mono-caps text-[11px] text-ember-text-muted inline-flex items-center gap-2"
              >
                <ArrowLeftIcon size={13} /> Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || isCreating}
                className="cta-ember flex-1 py-3 font-mono-caps text-[11px]"
              >
                {isCreating ? 'Hatching…' : 'Bring this dragon to the keep'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
