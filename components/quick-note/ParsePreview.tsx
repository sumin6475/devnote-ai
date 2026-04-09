'use client';

// Paste & Parse 미리보기 — 캐러셀 UI (좌우 네비게이션)

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import ParsedNoteCard, { type ParsedNote } from './ParsedNoteCard';
import type { Project } from '@/lib/types';

type ParsePreviewProps = {
  notes: ParsedNote[];
  projects: Project[];
  onCreateProject: (name: string) => Promise<Project>;
  onSaveAll: (notes: ParsedNote[]) => Promise<void>;
  onReparse: () => void;
  onCancel: () => void;
};

const ParsePreview = ({ notes: initialNotes, projects, onCreateProject, onSaveAll, onReparse, onCancel }: ParsePreviewProps) => {
  const [notes, setNotes] = useState<ParsedNote[]>(initialNotes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const goNext = useCallback(() => setCurrentIndex((i) => Math.min(i + 1, notes.length - 1)), [notes.length]);
  const goPrev = useCallback(() => setCurrentIndex((i) => Math.max(i - 1, 0)), []);

  // 키보드 좌우 방향키
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  const handleUpdate = (index: number, updated: ParsedNote) => {
    setNotes((prev) => prev.map((n, i) => (i === index ? updated : n)));
  };

  const handleDelete = (index: number) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
    if (currentIndex >= newNotes.length) {
      setCurrentIndex(Math.max(0, newNotes.length - 1));
    }
  };

  const handleSaveAll = async () => {
    if (notes.length === 0 || saving) return;
    setSaving(true);
    try {
      await onSaveAll(notes);
    } finally {
      setSaving(false);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="w-full py-8 text-center" style={{ color: '#475569' }}>
        <p className="mb-4">All notes have been removed</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={onReparse}
            className="text-[12px] font-medium px-4 py-[7px] rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: 'transparent', border: '1px solid rgba(148,163,184,0.12)', color: '#94A3B8', fontFamily: 'inherit' }}
          >
            Re-analyze
          </button>
          <button
            onClick={onCancel}
            className="text-[12px] font-medium px-4 py-[7px] rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: 'transparent', border: '1px solid rgba(148,163,184,0.08)', color: '#64748B', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 카드 인디케이터 — 상단 */}
      <div className="text-center text-[13px] mb-3" style={{ color: '#94A3B8' }}>
        <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{currentIndex + 1}</span>
        {' / '}
        {notes.length}
      </div>

      {/* 캐러셀 영역 */}
      <div className="relative">
        {/* 좌 화살표 */}
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full cursor-pointer border-none"
          style={{
            width: 36,
            height: 36,
            background: 'rgba(39, 39, 42, 0.6)',
            opacity: currentIndex === 0 ? 0.2 : 1,
            transition: 'opacity 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => { if (currentIndex > 0) e.currentTarget.style.background = 'rgba(63, 63, 70, 0.8)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(39, 39, 42, 0.6)'; }}
        >
          <ChevronLeft style={{ width: 20, height: 20, color: '#E2E8F0' }} />
        </button>

        {/* 우 화살표 */}
        <button
          onClick={goNext}
          disabled={currentIndex === notes.length - 1}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full cursor-pointer border-none"
          style={{
            width: 36,
            height: 36,
            background: 'rgba(39, 39, 42, 0.6)',
            opacity: currentIndex === notes.length - 1 ? 0.2 : 1,
            transition: 'opacity 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => { if (currentIndex < notes.length - 1) e.currentTarget.style.background = 'rgba(63, 63, 70, 0.8)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(39, 39, 42, 0.6)'; }}
        >
          <ChevronRight style={{ width: 20, height: 20, color: '#E2E8F0' }} />
        </button>

        {/* 카드 슬라이더 */}
        <div className="overflow-hidden rounded-xl px-1">
          <div
            className="flex"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: 'transform 0.3s ease',
            }}
          >
            {notes.map((note, i) => (
              <div key={i} className="w-full shrink-0">
                <ParsedNoteCard
                  note={note}
                  index={i}
                  projects={projects}
                  onCreateProject={onCreateProject}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 도트 인디케이터 */}
      <div className="flex items-center justify-center gap-[6px] mt-3">
        {notes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className="rounded-full cursor-pointer border-none p-0"
            style={{
              width: i === currentIndex ? 10 : 8,
              height: i === currentIndex ? 10 : 8,
              background: i === currentIndex ? '#6366F1' : 'rgba(82, 82, 91, 0.8)',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>

      {/* 하단 액션 바 */}
      <div className="flex items-center justify-between mt-5">
        <div className="flex gap-2">
          <button
            onClick={onReparse}
            className="text-[12px] font-medium px-4 py-[7px] rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: 'transparent', border: '1px solid rgba(148,163,184,0.12)', color: '#94A3B8', fontFamily: 'inherit' }}
          >
            Re-analyze
          </button>
          <button
            onClick={onCancel}
            className="text-[12px] font-medium px-4 py-[7px] rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: 'transparent', border: '1px solid rgba(148,163,184,0.08)', color: '#64748B', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
        </div>

        <GlassButton
          size="sm"
          contentClassName="flex items-center gap-2"
          onClick={handleSaveAll}
          disabled={saving}
        >
          {saving ? 'Saving...' : `Save All (${notes.length})`}
        </GlassButton>
      </div>
    </div>
  );
};

export default ParsePreview;
