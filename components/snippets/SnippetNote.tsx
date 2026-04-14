'use client';

// 스니펫 노트 패널 — 선택된 노트의 본문만 표시 (코드 스니펫 제외)

import { type Note, getNoteTitle, formatDate } from '@/lib/types';

type SnippetNoteProps = {
  note: Note | null;
  onEdit?: () => void;
};

// 섹션 라벨 (NoteDetail과 동일 스타일)
const SectionLabel = ({ label, bg, color }: { label: string; bg: string; color: string }) => (
  <span
    className="inline-block text-[10px] font-semibold uppercase tracking-[0.05em] mb-[8px]"
    style={{ background: bg, color, padding: '3px 10px', borderRadius: 4 }}
  >
    {label}
  </span>
);

const Divider = () => (
  <div className="my-4" style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }} />
);

const SnippetNote = ({ note, onEdit }: SnippetNoteProps) => {
  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#0b1120' }}>
        <span className="text-[13px]" style={{ color: '#334155' }}>
          Select a snippet to view
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex-1 h-screen overflow-y-auto"
      style={{
        background: '#0b1120',
        borderRight: '1px solid rgba(148,163,184,0.06)',
      }}
    >
      <div className="px-6 py-6">
        {/* 헤더 */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.08em]"
              style={{
                color: note.noteType === 'debug' ? '#a84370' : note.noteType === 'quick' ? '#a78bfa' : '#38bdf8',
                opacity: 0.8,
              }}
            >
              {note.noteType === 'debug' ? 'Debug Note' : note.noteType === 'quick' ? 'Quick Note' : 'Build Note'}
            </span>
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-[11px] font-medium px-[10px] py-[4px] rounded-md cursor-pointer hover:opacity-80 active:scale-[0.97]"
                style={{
                  background: 'rgba(148,163,184,0.06)',
                  border: '1px solid rgba(148,163,184,0.1)',
                  color: '#64748b',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
              >
                Edit
              </button>
            )}
          </div>
          <h2
            className="text-[16px] font-semibold leading-[1.35] tracking-[-0.02em] m-0 mb-1"
            style={{ color: '#F8FAFC' }}
          >
            {getNoteTitle(note)}
          </h2>
          <span className="text-[11px]" style={{ color: '#475569' }}>
            {formatDate(note.createdAt)}
          </span>
        </div>

        {/* 본문 — noteType별 분기 */}
        {note.noteType === 'quick' && note.rawContent && (
          <div
            className="rounded-lg whitespace-pre-wrap text-[13px] leading-[1.7]"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              padding: 16,
              color: '#F1F5F9',
            }}
          >
            {note.rawContent}
          </div>
        )}

        {note.noteType === 'debug' && (
          <div
            className="rounded-lg"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              padding: 16,
            }}
          >
            {note.problem && (
              <>
                <SectionLabel label="Problem" bg="rgba(168,67,112,0.15)" color="#d9a0bb" />
                <div className="text-[13px] leading-[1.7]" style={{ color: '#F1F5F9' }}>{note.problem}</div>
              </>
            )}
            {note.solution && (
              <>
                <Divider />
                <SectionLabel label="Solution" bg="rgba(34,197,94,0.15)" color="#86EFAC" />
                <div className="text-[13px] leading-[1.7]" style={{ color: '#F1F5F9' }}>{note.solution}</div>
              </>
            )}
            {note.understanding && (
              <>
                <Divider />
                <SectionLabel label="Understanding" bg="rgba(129,140,248,0.15)" color="#A5B4FC" />
                <div className="text-[13px] leading-[1.7]" style={{ color: '#F1F5F9' }}>{note.understanding}</div>
              </>
            )}
          </div>
        )}

        {note.noteType === 'learning' && (
          <div
            className="rounded-lg"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              padding: 16,
            }}
          >
            {note.whatIBuilt && (
              <>
                <SectionLabel label="What I Built" bg="rgba(56,189,248,0.15)" color="#7DD3FC" />
                <div className="text-[13px] leading-[1.7]" style={{ color: '#F1F5F9' }}>{note.whatIBuilt}</div>
              </>
            )}
            {note.learnings && note.learnings.length > 0 && (
              <>
                <Divider />
                <SectionLabel label="What I Learned" bg="rgba(167,139,250,0.15)" color="#C4B5FD" />
                <ul className="m-0 pl-4 text-[13px] leading-[1.7] flex flex-col gap-[4px]" style={{ listStyleType: 'disc', color: '#F1F5F9' }}>
                  {note.learnings.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </>
            )}
          </div>
        )}

        {/* 태그 */}
        {(note.topicTags.length > 0 || note.skillTags.length > 0) && (
          <div className="flex flex-wrap gap-[5px] mt-4">
            {note.topicTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-[8px] py-[2px] rounded-[20px]"
                style={{
                  background: 'rgba(148, 163, 184, 0.1)',
                  color: '#94A3B8',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetNote;
