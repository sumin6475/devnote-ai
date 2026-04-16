'use client';

// 노트 목록 컴포넌트 — 380px 고정, 프로젝트 필터 + 타입 필터 지원

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopicTag } from '@/components/ui/Tag';
import {
  type Note,
  type Project,
  getNoteTitle,
  getNotePreview,
  formatDate,
} from '@/lib/types';

type NoteListProps = {
  notes: Note[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  filterProject?: Project;
  filterSkillTag?: string | null;
  filterTopicTag?: string | null;
  onNewNote?: () => void;
};

const NOTE_TYPE_LABEL: Record<string, string> = {
  debug: 'DEBUG',
  learning: 'BUILD',
  quick: 'QUICK',
};

const NOTE_TYPE_COLOR: Record<string, string> = {
  debug: '#a84370',
  learning: '#38bdf8',
  quick: '#a78bfa',
};

type TypeFilter = 'all' | 'quick' | 'debug' | 'learning';

const NoteList = ({ notes, selectedIndex, onSelect, filterProject, filterSkillTag, filterTopicTag, onNewNote }: NoteListProps) => {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  // 타입별 카운트
  const counts = {
    all: notes.length,
    quick: notes.filter((n) => n.noteType === 'quick').length,
    debug: notes.filter((n) => n.noteType === 'debug').length,
    learning: notes.filter((n) => n.noteType === 'learning').length,
  };

  // 필터 적용된 노트
  const filteredNotes = typeFilter === 'all'
    ? notes
    : notes.filter((n) => n.noteType === typeFilter);

  const TABS: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'quick', label: 'Quick' },
    { key: 'debug', label: 'Debug' },
    { key: 'learning', label: 'Build' },
  ];

  return (
    <section
      className="flex flex-col h-screen shrink-0"
      style={{
        width: 380,
        minWidth: 380,
        borderRight: '1px solid rgba(148,163,184,0.08)',
        background: '#0f172a',
      }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center gap-2 px-5 pt-[18px] pb-[14px] shrink-0"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
      >
        {filterSkillTag || filterTopicTag ? (
          <>
            <span
              className="rounded-full shrink-0"
              style={{ width: 7, height: 7, background: '#818cf8' }}
            />
            <span className="text-[14px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#f1f5f9' }}>
              {filterSkillTag ?? filterTopicTag}
            </span>
            <span className="text-[13px] shrink-0" style={{ color: '#475569' }}>
              ({notes.length})
            </span>
            <button
              onClick={() => router.push('/notes')}
              className="ml-auto text-[11px] font-medium px-2 py-[3px] rounded cursor-pointer border-none hover:opacity-80 shrink-0"
              style={{
                background: 'rgba(148,163,184,0.08)',
                color: '#64748b',
                fontFamily: 'inherit',
              }}
            >
              Clear
            </button>
          </>
        ) : filterProject ? (
          <>
            <span
              className="rounded-full shrink-0"
              style={{ width: 7, height: 7, background: filterProject.color }}
            />
            <span className="text-[16px] font-semibold" style={{ color: '#f1f5f9' }}>
              {filterProject.name}
            </span>
            <span className="text-[13px]" style={{ color: '#475569' }}>
              ({notes.length})
            </span>
            <button
              onClick={() => router.push('/notes')}
              className="ml-auto text-[11px] font-medium px-2 py-[3px] rounded cursor-pointer border-none hover:opacity-80"
              style={{
                background: 'rgba(148,163,184,0.08)',
                color: '#64748b',
                fontFamily: 'inherit',
              }}
            >
              Clear
            </button>
          </>
        ) : (
          <>
            <span className="text-[16px] font-semibold" style={{ color: '#f1f5f9' }}>
              All Notes
            </span>
            <span className="text-[13px]" style={{ color: '#475569' }}>
              ({notes.length})
            </span>
          </>
        )}
        {onNewNote && (
          <button
            onClick={onNewNote}
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

      {/* 타입 필터 탭 */}
      <div
        className="flex gap-0 px-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
      >
        {TABS.map((tab) => {
          // 카운트 0인 탭은 숨김
          if (counts[tab.key] === 0 && tab.key !== 'all') return null;
          const active = typeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className="text-[11px] font-medium px-3 py-[10px] cursor-pointer border-none"
              style={{
                background: 'transparent',
                color: active ? '#818cf8' : '#475569',
                borderBottom: active ? '2px solid #818cf8' : '2px solid transparent',
                fontFamily: 'inherit',
                transition: 'color 0.1s',
              }}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          );
        })}
      </div>

      {/* 노트 리스트 — 독립 스크롤 */}
      <div className="flex-1 overflow-y-auto pl-[10px] pr-[4px] py-[6px]">
        {filteredNotes.map((note) => {
          // 원래 notes 배열에서의 인덱스로 selectedIndex 비교
          const originalIndex = notes.indexOf(note);
          const isSelected = selectedIndex === originalIndex;
          return (
            <div
              key={note.id}
              onClick={() => onSelect(originalIndex)}
              className="rounded-[10px] mb-[3px] cursor-pointer hover:opacity-90 active:scale-[0.99] overflow-hidden"
              style={{
                padding: '14px 16px 12px',
                background: isSelected ? 'rgba(99,102,241,0.07)' : 'transparent',
                border: isSelected
                  ? '1px solid rgba(99,102,241,0.2)'
                  : '1px solid transparent',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
            >
              {/* 타입 라벨 + 제목 */}
              <div className="flex items-start justify-between mb-[5px]">
                <div className="flex-1 mr-2 min-w-0">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.08em] mr-[6px]"
                    style={{
                      color: NOTE_TYPE_COLOR[note.noteType] ?? '#64748b',
                      opacity: 0.7,
                    }}
                  >
                    {NOTE_TYPE_LABEL[note.noteType] ?? 'NOTE'}
                  </span>
                  <span
                    className="text-[13px] leading-[1.35] overflow-hidden text-ellipsis whitespace-nowrap block"
                    style={{
                      fontWeight: 550,
                      color: isSelected ? '#f1f5f9' : '#94a3b8',
                    }}
                  >
                    {getNoteTitle(note)}
                  </span>
                </div>
                <span
                  className="shrink-0 mt-1 rounded-full opacity-70"
                  style={{
                    width: 8,
                    height: 8,
                    background: NOTE_TYPE_COLOR[note.noteType] ?? '#64748b',
                  }}
                />
              </div>

              {/* 미리보기 텍스트 */}
              <p
                className="text-[12px] leading-[1.4] m-0 mb-2"
                style={{ color: '#475569' }}
              >
                {getNotePreview(note)}
              </p>

              {/* 태그 + 날짜 */}
              <div className="flex items-center gap-[5px] flex-wrap">
                {note.topicTags.slice(0, 3).map((tag) => (
                  <TopicTag key={tag} label={tag} />
                ))}
                {note.topicTags.length > 3 && (
                  <span className="text-[11px] font-medium" style={{ color: '#64748b' }}>
                    +{note.topicTags.length - 3}
                  </span>
                )}
                <span className="ml-auto text-[11px]" style={{ color: '#334155' }}>
                  {formatDate(note.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default NoteList;
