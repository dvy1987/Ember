'use client';

import { useState } from 'react';

interface BrainDumpInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  accentColor?: string;
  isLoading?: boolean;
}

export default function BrainDumpInput({
  onSubmit,
  placeholder = "What's on your mind? Dump your thoughts here...",
  accentColor = 'var(--color-ember-cinder)',
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
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
          }
        }}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-ember-panel border border-ember-border rounded-xl px-4 py-3 text-sm text-ember-text placeholder:text-ember-text-muted/50 resize-none focus:outline-none focus:border-ember-cinder transition-colors"
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-ember-text-muted">
          {text.length > 0 ? `${text.length} characters` : 'Press ⌘+Enter to submit'}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
          style={{ backgroundColor: accentColor, color: '#1a1a2e' }}
        >
          {isLoading ? 'Processing...' : 'Brain Dump'}
        </button>
      </div>
    </div>
  );
}
