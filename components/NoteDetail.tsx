'use client';

// 노트 상세 컴포넌트 — 타입에 따라 Debug 또는 Learning 블록 렌더링
// CLAUDE.md 규칙: 전체 border 금지, 배경 opacity + 좌측 3px accent border만

import { useState } from 'react';
import Tag from '@/components/ui/Tag';
import Icon from '@/components/ui/Icons';
import DifficultyStars from '@/components/ui/DifficultyStars';
import {
  type Note,
  getNoteTitle,
  getTagColors,
  formatDate,
} from '@/lib/types';

type NoteDetailProps = {
  note: Note | null;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
};

const NoteDetail = ({ note, onEdit, onDelete }: NoteDetailProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 노트가 없을 때 빈 상태 표시
  if (!note) {
    return (
      <main className="flex-1 flex items-center justify-center" style={{ background: '#0b1120' }}>
        <span className="text-[14px]" style={{ color: '#334155' }}>
          Select a note to view details
        </span>
      </main>
    );
  }

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`서버 에러 (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setShowDeleteConfirm(false);
      onDelete?.(note.id);
    } catch (err) {
      console.error('삭제 실패:', err);
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    } finally {
      setDeleting(false);
    }
  };

  const tagColors = getTagColors(note.tags);

  return (
    <main className="flex-1 overflow-y-auto relative" style={{ background: '#0b1120' }}>
      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: 'rgba(11,17,32,0.85)' }}
        >
          <div
            className="rounded-xl p-6 max-w-[340px] w-full"
            style={{
              background: '#1e293b',
              border: '1px solid rgba(148,163,184,0.1)',
            }}
          >
            <h3
              className="text-[15px] font-semibold m-0 mb-2"
              style={{ color: '#f1f5f9' }}
            >
              Delete this note?
            </h3>
            <p className="text-[13px] m-0 mb-5 leading-[1.5]" style={{ color: '#64748b' }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-[9px] text-[13px] font-medium rounded-lg cursor-pointer hover:opacity-80"
                style={{
                  background: 'rgba(148,163,184,0.08)',
                  border: '1px solid rgba(148,163,184,0.1)',
                  color: '#94a3b8',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-[9px] text-[13px] font-medium rounded-lg cursor-pointer border-none hover:opacity-80"
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[780px] mx-auto px-9 py-7">
        {/* 헤더 */}
        <div className="mb-6">
          {/* 타입 라벨 + 액션 버튼 */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.08em]"
              style={{
                color: note.noteType === 'debug' ? '#ef4444' : '#38bdf8',
                opacity: 0.8,
              }}
            >
              {note.noteType === 'debug' ? 'Debug Note' : 'Learning Note'}
            </span>
            {/* 수정 / 삭제 버튼 — 작고 muted */}
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="text-[11px] font-medium px-[10px] py-[5px] rounded-md cursor-pointer hover:opacity-80 active:scale-[0.97]"
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
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-[11px] font-medium px-[10px] py-[5px] rounded-md cursor-pointer hover:opacity-80 active:scale-[0.97]"
                style={{
                  background: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <h1
            className="text-[20px] font-semibold leading-[1.35] tracking-[-0.01em] m-0 mb-2"
            style={{ color: '#f1f5f9' }}
          >
            {getNoteTitle(note)}
          </h1>
          <div
            className="flex items-center gap-4 text-[12px] flex-wrap"
            style={{ color: '#475569' }}
          >
            <span>{formatDate(note.createdAt)}</span>
            <span style={{ color: '#334155' }}>|</span>
            <span
              className="text-[11px] font-medium px-3 py-[3px] rounded-[20px]"
              style={{
                background: 'rgba(99,102,241,0.1)',
                color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              {note.category}
            </span>
          </div>
        </div>

        {/* 타입별 콘텐츠 블록 */}
        {note.noteType === 'debug' ? (
          /* === Debug Note 블록 === */
          <>
            {/* Problem 블록 — 좌측 red accent border만 */}
            <div className="mb-4">
              <div
                className="text-[11px] font-bold uppercase tracking-[0.06em] mb-2"
                style={{ color: '#ef4444' }}
              >
                Problem
              </div>
              <div
                className="text-[13.5px] leading-[1.65]"
                style={{
                  background: 'rgba(183, 28, 28, 0.08)',
                  border: 'none',
                  borderLeft: '3px solid #b71c1c',
                  borderRadius: '0 10px 10px 0',
                  padding: '14px 18px',
                  color: '#e2e8f0',
                }}
              >
                {note.problem}
              </div>
            </div>

            {/* Solution 블록 — 좌측 green accent border만 */}
            <div className="mb-4">
              <div
                className="text-[11px] font-bold uppercase tracking-[0.06em] mb-2"
                style={{ color: '#22c55e' }}
              >
                Solution
              </div>
              <div
                className="text-[13.5px] leading-[1.65]"
                style={{
                  background: 'rgba(0, 98, 57, 0.08)',
                  border: 'none',
                  borderLeft: '3px solid #006239',
                  borderRadius: '0 10px 10px 0',
                  padding: '14px 18px',
                  color: '#e2e8f0',
                }}
              >
                {note.solution}
              </div>
            </div>

            {/* Understanding 블록 — 좌측 indigo accent border만 */}
            <div className="mb-6">
              <div
                className="text-[11px] font-bold uppercase tracking-[0.06em] mb-2"
                style={{ color: '#818cf8' }}
              >
                Understanding
              </div>
              <div
                className="text-[13.5px] leading-[1.65]"
                style={{
                  background: 'rgba(99, 102, 241, 0.06)',
                  border: 'none',
                  borderLeft: '3px solid #6366f1',
                  borderRadius: '0 10px 10px 0',
                  padding: '14px 18px',
                  color: '#e2e8f0',
                }}
              >
                {note.understanding}
              </div>
            </div>
          </>
        ) : (
          /* === Learning Note 블록 === */
          <>
            {/* What I Built 블록 — 좌측 sky blue accent border */}
            <div className="mb-4">
              <div
                className="text-[11px] font-bold uppercase tracking-[0.06em] mb-2"
                style={{ color: '#38bdf8' }}
              >
                What I Built
              </div>
              <div
                className="text-[13.5px] leading-[1.65]"
                style={{
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: 'none',
                  borderLeft: '3px solid #0284c7',
                  borderRadius: '0 10px 10px 0',
                  padding: '14px 18px',
                  color: '#e2e8f0',
                }}
              >
                {note.whatIBuilt}
              </div>
            </div>

            {/* What I Learned 블록 — 좌측 violet accent border, bullet list */}
            {note.learnings && note.learnings.length > 0 && (
              <div className="mb-4">
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.06em] mb-2"
                  style={{ color: '#a78bfa' }}
                >
                  What I Learned
                </div>
                <div
                  className="text-[13.5px] leading-[1.65]"
                  style={{
                    background: 'rgba(167, 139, 250, 0.06)',
                    border: 'none',
                    borderLeft: '3px solid #7c3aed',
                    borderRadius: '0 10px 10px 0',
                    padding: '14px 18px',
                    color: '#e2e8f0',
                  }}
                >
                  <ul className="m-0 pl-4 flex flex-col gap-[6px]" style={{ listStyleType: 'disc' }}>
                    {note.learnings.map((item, i) => (
                      <li key={i} style={{ color: '#e2e8f0' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Source (선택) */}
            {note.source && (
              <div className="mb-6">
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.06em] mb-2"
                  style={{ color: '#475569' }}
                >
                  Source
                </div>
                <div className="text-[13px]" style={{ color: '#94a3b8' }}>
                  {note.source}
                </div>
              </div>
            )}
          </>
        )}

        {/* Code Snippet — 두 타입 공통 */}
        {note.codeSnippet && (
          <div className="mb-6">
            <div
              className="text-[11px] font-bold uppercase tracking-[0.06em] mb-2"
              style={{ color: '#475569' }}
            >
              Code Snippet
            </div>
            <pre
              className="m-0 overflow-x-auto whitespace-pre"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(148,163,184,0.08)',
                borderRadius: 10,
                padding: '16px 20px',
                fontSize: '12.5px',
                lineHeight: 1.7,
                color: '#94a3b8',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            >
              {note.codeSnippet}
            </pre>
          </div>
        )}

        {/* AI Context 섹션 — 두 타입 공통 */}
        <div
          className="rounded-xl"
          style={{
            background: 'rgba(99,102,241,0.04)',
            border: '1px solid rgba(99,102,241,0.08)',
            padding: '18px 22px',
          }}
        >
          {/* AI Context 헤더 */}
          <div
            className="flex items-center gap-[6px] text-[11px] font-bold uppercase tracking-[0.06em] mb-[14px]"
            style={{ color: '#6366f1' }}
          >
            <Icon name="ai" />
            AI Context
          </div>

          {/* 태그 목록 */}
          <div className="flex gap-[6px] flex-wrap mb-4">
            {note.tags.map((tag, j) => (
              <Tag key={tag} label={tag} colorKey={tagColors[j]} />
            ))}
          </div>

          {/* Related Concepts */}
          {note.relatedConcepts && note.relatedConcepts.length > 0 && (
            <>
              <div className="text-[12px] font-semibold mb-[10px]" style={{ color: '#64748b' }}>
                Related concepts to explore
              </div>
              <div className="flex flex-col gap-2">
                {note.relatedConcepts.map((rc) => (
                  <div key={rc.name} className="text-[13px] leading-[1.45]">
                    <span className="font-semibold" style={{ color: '#818cf8' }}>
                      {rc.name}
                    </span>
                    <span style={{ color: '#475569' }}> — {rc.why}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer — Difficulty + Category */}
          <div
            className="flex items-center justify-between text-[12px] mt-[18px] pt-[14px]"
            style={{
              borderTop: '1px solid rgba(99,102,241,0.08)',
              color: '#475569',
            }}
          >
            <div className="flex items-center gap-[6px]">
              Difficulty <DifficultyStars level={note.difficulty} />
            </div>
            <div>
              Category: <span style={{ color: '#818cf8' }}>{note.category}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NoteDetail;
