import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useSaved } from '@/context/SavedContext';
import { useToast } from '@/context/ToastContext';

export default function SaveButton({ type, id, size = 16, className = '', variant = 'light', testid }) {
  const { isSaved, toggle } = useSaved();
  const { toast } = useToast();
  const saved = isSaved(type, id);
  const onClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggle(type, id);
    toast(saved ? 'Removed from saved.' : `Saved to your ${type}.`, { type: 'success' });
  };
  const base = variant === 'dark'
    ? 'border border-white/15 bg-white/5 text-white hover:border-white/40'
    : 'border border-line bg-transparent text-ink hover:border-ink';
  return (
    <button
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Unsave' : 'Save'}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${base} ${saved ? '!text-coral !border-coral/50' : ''} ${className}`}
      data-testid={testid || `save-${type}-${id}`}
    >
      {saved ? <BookmarkCheck size={size} /> : <Bookmark size={size} />}
    </button>
  );
}
