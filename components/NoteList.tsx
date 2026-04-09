// 노트 목록 컴포넌트 — 380px 고정, 프로젝트 필터 지원

import { useRouter } from 'next/navigation';
import Tag from '@/components/ui/Tag';
import {
  type Note,
  type Project,
  getNoteTitle,
  getNotePreview,
  getTagColors,
  formatDate,
} from '@/lib/types';

type NoteListProps = {
  notes: Note[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  filterProject?: Project;
  onNewNote?: () => void;
};

const NOTE_TYPE_LABEL: Record<string, string> = {
  debug: 'DEBUG',
  learning: 'LEARNING',
  quick: 'QUICK',
};

const NOTE_TYPE_COLOR: Record<string, string> = {
  debug: '#ef4444',
  learning: '#38bdf8',
  quick: '#a78bfa',
};

const NoteList = ({ notes, selectedIndex, onSelect, filterProject, onNewNote }: NoteListProps) => {
  const router = useRouter();

  return (
    <section
      className="flex flex-col"
      style={{
        width: 380,
        minWidth: 380,
        borderRight: '1px solid rgba(148,163,184,0.08)',
        background: '#0f172a',
      }}
    >
      {/* 헤더 — 프로젝트 필터 시 프로젝트 이름 표시 */}
      <div
        className="flex items-center gap-2 px-5 pt-[18px] pb-[14px]"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
      >
        {filterProject ? (
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

      {/* 노트 리스트 */}
      <div className="flex-1 overflow-y-auto px-[10px] py-[6px]">
        {notes.map((note, i) => {
          const isSelected = selectedIndex === i;
          const tagColors = getTagColors(note.topicTags);
          return (
            <div
              key={note.id}
              onClick={() => onSelect(i)}
              className="rounded-[10px] mb-[3px] cursor-pointer hover:opacity-90 active:scale-[0.99]"
              style={{
                padding: '14px 14px 12px',
                background: isSelected ? 'rgba(99,102,241,0.07)' : 'transparent',
                border: isSelected
                  ? '1px solid rgba(99,102,241,0.2)'
                  : '1px solid transparent',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
            >
              {/* 타입 라벨 + 제목 */}
              <div className="flex items-start justify-between mb-[5px]">
                <div className="flex-1 mr-2">
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
                    className="text-[13px] leading-[1.35]"
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
                {note.topicTags.map((tag, j) => (
                  <Tag key={tag} label={tag} colorKey={tagColors[j]} />
                ))}
                {note.relatedConcepts && note.relatedConcepts.length > 0 && (
                  <span className="text-[10px] ml-[2px]" style={{ color: '#475569' }}>
                    +{note.relatedConcepts.length}
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
