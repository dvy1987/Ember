import { useState } from 'react';
import { FeatherIcon } from './Icons';

interface BrainDumpInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  accentColor?: string;
  isLoading?: boolean;
}

export default function BrainDumpInput({
  onSubmit,
  placeholder = "What's on your mind? Dump your thoughts here…",
  isLoading = false,
}: BrainDumpInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute top-4 left-4 text-ember-text-muted opacity-50 pointer-events-none">
          <FeatherIcon size={16} />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          placeholder={placeholder}
          rows={4}
          className="w-full input-parchment p-4 pl-12 text-[15px] resize-none"
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="font-mono-caps text-[10px] text-ember-text-muted">
          {text.length > 0 ? `${text.length} characters` : 'Cmd/Ctrl + Enter to submit'}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="cta-ember px-5 py-2 font-mono-caps text-[11px]"
        >
          {isLoading ? 'Tending…' : 'Brain Dump'}
        </button>
      </div>
    </div>
  );
}
