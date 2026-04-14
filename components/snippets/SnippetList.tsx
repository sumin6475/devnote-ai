'use client';

// 스니펫 리스트 패널 — 사이드바 자리를 대체, 290px 너비

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { type Note, getNoteTitle, formatDate } from '@/lib/types';

const NOTE_TYPE_COLOR: Record<string, string> = {
  debug: '#a84370',
  learning: '#38bdf8',
  quick: '#a78bfa',
};

const NOTE_TYPE_LABEL: Record<string, string> = {
  debug: 'DEBUG',
  learning: 'BUILD',
  quick: 'QUICK',
};

type SnippetListProps = {
  notes: Note[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onNewSnippet?: () => void;
};

const SnippetList = ({ notes, selectedIndex, onSelect, onNewSnippet }: SnippetListProps) => {
  const router = useRouter();

  return (
    <section
      className="flex flex-col h-screen shrink-0"
      style={{
        width: 290,
        minWidth: 290,
        background: 'rgba(15, 23, 42, 0.85)',
        borderRight: '1px solid rgba(148,163,184,0.08)',
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-4">
        <button
          onClick={() => router.push('/notes')}
          className="flex items-center justify-center rounded-md cursor-pointer border-none hover:opacity-80"
          style={{
            width: 28,
            height: 28,
            background: 'rgba(148,163,184,0.08)',
            transition: 'opacity 0.15s',
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16, color: '#64748b' }} />
        </button>
        <span className="text-[16px] font-semibold" style={{ color: '#f1f5f9' }}>
          Snippets
        </span>
        <span className="text-[13px]" style={{ color: '#475569' }}>
          ({notes.length})
        </span>
        {onNewSnippet && (
          <button
            onClick={onNewSnippet}
            className="ml-auto text-[12px] font-medium px-[10px] py-[5px] rounded-lg cursor-pointer border-none hover:opacity-80 active:scale-[0.97]"
            style={{
              background: 'rgba(99,102,241,0.1)',
              color: '#818cf8',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
          >
            + New
          </button>
        )}
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto px-[8px] py-[4px]">
        {notes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px]" style={{ color: '#334155' }}>
              No snippets yet
            </p>
          </div>
        ) : (
          notes.map((note, i) => {
            const isSelected = selectedIndex === i;
            return (
              <div
                key={note.id}
                onClick={() => onSelect(i)}
                className="rounded-[8px] mb-[2px] cursor-pointer hover:opacity-90 active:scale-[0.99] overflow-hidden"
                style={{
                  padding: '10px 12px',
                  background: isSelected ? 'rgba(99,102,241,0.07)' : 'transparent',
                  border: isSelected
                    ? '1px solid rgba(99,102,241,0.2)'
                    : '1px solid transparent',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
              >
                {/* 타입 라벨 */}
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.08em]"
                  style={{
                    color: NOTE_TYPE_COLOR[note.noteType] ?? '#64748b',
                    opacity: 0.7,
                  }}
                >
                  {NOTE_TYPE_LABEL[note.noteType] ?? 'NOTE'}
                </span>
                {/* 제목 */}
                <div
                  className="text-[12px] leading-[1.35] overflow-hidden text-ellipsis whitespace-nowrap mt-[2px]"
                  style={{
                    fontWeight: 550,
                    color: isSelected ? '#f1f5f9' : '#94a3b8',
                  }}
                >
                  {getNoteTitle(note)}
                </div>
                {/* 날짜 */}
                <div className="text-[10px] mt-[3px]" style={{ color: '#334155' }}>
                  {formatDate(note.createdAt)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default SnippetList;
