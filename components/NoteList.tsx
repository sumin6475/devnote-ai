// 노트 목록 컴포넌트 — 380px 고정, 노트 미리보기 + 태그

import Tag from '@/components/ui/Tag';
import {
  type Note,
  getNoteTitle,
  getNotePreview,
  getTagColors,
  formatDate,
} from '@/lib/types';

type NoteListProps = {
  notes: Note[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

const NoteList = ({ notes, selectedIndex, onSelect }: NoteListProps) => {
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
      {/* 헤더 */}
      <div
        className="flex items-baseline gap-2 px-5 pt-[18px] pb-[14px]"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
      >
        <span className="text-[16px] font-semibold" style={{ color: '#f1f5f9' }}>
          All Notes
        </span>
        <span className="text-[13px]" style={{ color: '#475569' }}>
          ({notes.length})
        </span>
      </div>

      {/* 노트 리스트 */}
      <div className="flex-1 overflow-y-auto px-[10px] py-[6px]">
        {notes.map((note, i) => {
          const isSelected = selectedIndex === i;
          const tagColors = getTagColors(note.tags);
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
                  {/* 노트 타입 라벨 — 텍스트만, 이모티콘 금지 */}
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.08em] mr-[6px]"
                    style={{
                      color: note.noteType === 'debug' ? '#ef4444' : '#38bdf8',
                      opacity: 0.7,
                    }}
                  >
                    {note.noteType === 'debug' ? 'DEBUG' : 'LEARNING'}
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
                {/* 타입별 컬러 인디케이터 */}
                <span
                  className="shrink-0 mt-1 rounded-full opacity-70"
                  style={{
                    width: 8,
                    height: 8,
                    background: note.noteType === 'debug' ? '#818cf8' : '#38bdf8',
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
                {note.tags.map((tag, j) => (
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
