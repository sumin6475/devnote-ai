'use client';

// 노트 상세 컴포넌트 — 타입에 따라 Debug 또는 Learning 블록 렌더링
// v2: 2레이어 태그 + 2섹션 AI Context + 가독성 개선

import { useState } from 'react';
import { SkillTag, TopicTag } from '@/components/ui/Tag';
import Icon from '@/components/ui/Icons';
import {
  type Note,
  getNoteTitle,
  formatDate,
} from '@/lib/types';

type NoteDetailProps = {
  note: Note | null;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
  isAnalyzing?: boolean;
  onRetryAnalysis?: () => void;
};

const NoteDetail = ({ note, onEdit, onDelete, isAnalyzing, onRetryAnalysis }: NoteDetailProps) => {
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

  // AI 분석 완료 여부 — topicTags에 값이 있으면 분석 완료
  const hasAiData = note.topicTags && note.topicTags.length > 0;

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
                color: note.noteType === 'debug' ? '#ef4444' : note.noteType === 'quick' ? '#a78bfa' : '#38bdf8',
                opacity: 0.8,
              }}
            >
              {note.noteType === 'debug' ? 'Debug Note' : note.noteType === 'quick' ? 'Quick Note' : 'Learning Note'}
            </span>
            {/* 수정 / 삭제 버튼 */}
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
          {/* 제목 — 가장 밝게 */}
          <h1
            className="text-[20px] font-semibold leading-[1.35] tracking-[-0.02em] m-0 mb-2"
            style={{ color: '#F8FAFC' }}
          >
            {getNoteTitle(note)}
          </h1>
          <div
            className="flex items-center gap-4 text-[12px] flex-wrap"
            style={{ color: '#475569' }}
          >
            <span>{formatDate(note.createdAt)}</span>
            {note.category && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* 타입별 콘텐츠 블록 — 본문 16px, #F1F5F9, line-height 1.6 */}
        {note.noteType === 'quick' ? (
          <>
            {/* Quick Note: rawContent 원본 */}
            {note.rawContent && (
              <div className="mb-4">
                <div
                  className="text-[16px] leading-[1.6] whitespace-pre-wrap"
                  style={{
                    background: 'rgba(167, 139, 250, 0.05)',
                    border: 'none',
                    borderLeft: '3px solid #7c3aed',
                    borderRadius: '0 10px 10px 0',
                    padding: '16px 20px',
                    color: '#F1F5F9',
                  }}
                >
                  {note.rawContent}
                </div>
              </div>
            )}

            {/* AI 구조화 결과 — 추출된 필드가 있으면 표시 */}
            {(note.problem || note.whatIBuilt) && (
              <div className="mb-6">
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.06em] mb-3"
                  style={{ color: '#64748b' }}
                >
                  AI Structured
                </div>
                {note.problem && (
                  <div className="mb-3">
                    <div className="text-[11px] font-semibold uppercase mb-1" style={{ color: '#ef4444', opacity: 0.7 }}>Problem</div>
                    <div className="text-[14px] leading-[1.5]" style={{ color: '#cbd5e1' }}>{note.problem}</div>
                  </div>
                )}
                {note.solution && (
                  <div className="mb-3">
                    <div className="text-[11px] font-semibold uppercase mb-1" style={{ color: '#22c55e', opacity: 0.7 }}>Solution</div>
                    <div className="text-[14px] leading-[1.5]" style={{ color: '#cbd5e1' }}>{note.solution}</div>
                  </div>
                )}
                {note.understanding && (
                  <div className="mb-3">
                    <div className="text-[11px] font-semibold uppercase mb-1" style={{ color: '#818cf8', opacity: 0.7 }}>Understanding</div>
                    <div className="text-[14px] leading-[1.5]" style={{ color: '#cbd5e1' }}>{note.understanding}</div>
                  </div>
                )}
                {note.whatIBuilt && (
                  <div className="mb-3">
                    <div className="text-[11px] font-semibold uppercase mb-1" style={{ color: '#38bdf8', opacity: 0.7 }}>What I Built</div>
                    <div className="text-[14px] leading-[1.5]" style={{ color: '#cbd5e1' }}>{note.whatIBuilt}</div>
                  </div>
                )}
                {note.learnings && note.learnings.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[11px] font-semibold uppercase mb-1" style={{ color: '#a78bfa', opacity: 0.7 }}>What I Learned</div>
                    <ul className="m-0 pl-4 text-[14px] leading-[1.5] flex flex-col gap-1" style={{ listStyleType: 'disc', color: '#cbd5e1' }}>
                      {note.learnings.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        ) : note.noteType === 'debug' ? (
          <>
            {/* Problem */}
            <div className="mb-4">
              <div
                className="text-[12px] font-bold uppercase tracking-[0.06em] mb-2"
                style={{ color: '#ef4444' }}
              >
                Problem
              </div>
              <div
                className="text-[16px] leading-[1.6]"
                style={{
                  background: 'rgba(183, 28, 28, 0.08)',
                  border: 'none',
                  borderLeft: '3px solid #b71c1c',
                  borderRadius: '0 10px 10px 0',
                  padding: '16px 20px',
                  color: '#F1F5F9',
                }}
              >
                {note.problem}
              </div>
            </div>

            {/* Solution */}
            <div className="mb-4">
              <div
                className="text-[12px] font-bold uppercase tracking-[0.06em] mb-2"
                style={{ color: '#22c55e' }}
              >
                Solution
              </div>
              <div
                className="text-[16px] leading-[1.6]"
                style={{
                  background: 'rgba(0, 98, 57, 0.08)',
                  border: 'none',
                  borderLeft: '3px solid #006239',
                  borderRadius: '0 10px 10px 0',
                  padding: '16px 20px',
                  color: '#F1F5F9',
                }}
              >
                {note.solution}
              </div>
            </div>

            {/* Understanding */}
            <div className="mb-6">
              <div
                className="text-[12px] font-bold uppercase tracking-[0.06em] mb-2"
                style={{ color: '#818cf8' }}
              >
                Understanding
              </div>
              <div
                className="text-[16px] leading-[1.6]"
                style={{
                  background: 'rgba(99, 102, 241, 0.06)',
                  border: 'none',
                  borderLeft: '3px solid #6366f1',
                  borderRadius: '0 10px 10px 0',
                  padding: '16px 20px',
                  color: '#F1F5F9',
                }}
              >
                {note.understanding}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* What I Built */}
            <div className="mb-4">
              <div
                className="text-[12px] font-bold uppercase tracking-[0.06em] mb-2"
                style={{ color: '#38bdf8' }}
              >
                What I Built
              </div>
              <div
                className="text-[16px] leading-[1.6]"
                style={{
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: 'none',
                  borderLeft: '3px solid #0284c7',
                  borderRadius: '0 10px 10px 0',
                  padding: '16px 20px',
                  color: '#F1F5F9',
                }}
              >
                {note.whatIBuilt}
              </div>
            </div>

            {/* What I Learned */}
            {note.learnings && note.learnings.length > 0 && (
              <div className="mb-4">
                <div
                  className="text-[12px] font-bold uppercase tracking-[0.06em] mb-2"
                  style={{ color: '#a78bfa' }}
                >
                  What I Learned
                </div>
                <div
                  className="text-[16px] leading-[1.6]"
                  style={{
                    background: 'rgba(167, 139, 250, 0.06)',
                    border: 'none',
                    borderLeft: '3px solid #7c3aed',
                    borderRadius: '0 10px 10px 0',
                    padding: '16px 20px',
                    color: '#F1F5F9',
                  }}
                >
                  <ul className="m-0 pl-4 flex flex-col gap-[6px]" style={{ listStyleType: 'disc' }}>
                    {note.learnings.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Source */}
            {note.source && (
              <div className="mb-6">
                <div
                  className="text-[12px] font-bold uppercase tracking-[0.06em] mb-2"
                  style={{ color: '#475569' }}
                >
                  Source
                </div>
                <div className="text-[14px]" style={{ color: '#9CA3AF' }}>
                  {note.source}
                </div>
              </div>
            )}
          </>
        )}

        {/* Code Snippet */}
        {note.codeSnippet && (
          <div className="mb-6">
            <div
              className="text-[12px] font-bold uppercase tracking-[0.06em] mb-2"
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

        {/* === AI Context: 섹션 1 — SKILL TAGS + TOPICS === */}
        <div
          className="rounded-xl mb-3"
          style={{
            background: 'rgba(99,102,241,0.04)',
            border: '1px solid rgba(99,102,241,0.08)',
            padding: '18px 22px',
          }}
        >
          <div
            className="flex items-center gap-[6px] text-[11px] font-bold uppercase tracking-[0.06em] mb-[14px]"
            style={{ color: '#6366f1' }}
          >
            <Icon name="ai" />
            AI Context
            {isAnalyzing && (
              <span className="font-medium normal-case tracking-normal" style={{ color: '#6B7280' }}>
                — Analyzing...
              </span>
            )}
          </div>

          {isAnalyzing ? (
            /* 분석 중: shimmer */
            <div className="flex flex-col gap-3">
              <div className="flex gap-[8px]">
                {[90, 72, 80].map((w, i) => (
                  <div
                    key={i}
                    className="rounded-[20px] shimmer"
                    style={{ width: w, height: 28, background: 'rgba(129,140,248,0.1)' }}
                  />
                ))}
              </div>
              <div className="flex gap-[6px] mt-1">
                {[64, 56, 72, 52].map((w, i) => (
                  <div
                    key={i}
                    className="rounded-[20px] shimmer"
                    style={{ width: w, height: 22, background: 'rgba(148,163,184,0.08)' }}
                  />
                ))}
              </div>
            </div>
          ) : hasAiData ? (
            /* 분석 완료: 2레이어 태그 */
            <div className="flex flex-col gap-4">
              {/* Skill Tags — 해당 없으면 섹션 숨김 */}
              {note.skillTags.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.05em] mb-[8px]" style={{ color: '#64748b' }}>
                    Skill Tags
                  </div>
                  <div className="flex gap-[8px] flex-wrap">
                    {note.skillTags.map((tag) => (
                      <SkillTag key={tag} label={tag} />
                    ))}
                  </div>
                </div>
              )}
              {/* Topic Tags */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.05em] mb-[8px]" style={{ color: '#64748b' }}>
                  Topics
                </div>
                <div className="flex gap-[6px] flex-wrap">
                  {note.topicTags.map((tag) => (
                    <TopicTag key={tag} label={tag} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* AI 데이터 없음 */
            <div className="flex flex-col items-center py-4 gap-3">
              <span className="text-[13px]" style={{ color: '#6B7280' }}>
                AI analysis not available
              </span>
              {onRetryAnalysis && (
                <button
                  onClick={onRetryAnalysis}
                  className="text-[12px] font-medium px-4 py-[6px] rounded-lg cursor-pointer hover:opacity-80"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    color: '#818cf8',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.15s',
                  }}
                >
                  Retry analysis
                </button>
              )}
            </div>
          )}
        </div>

        {/* === AI Context: 섹션 2 — EXPLORE NEXT === */}
        {!isAnalyzing && hasAiData && note.relatedConcepts && note.relatedConcepts.length > 0 && (
          <div
            className="rounded-xl"
            style={{
              background: 'rgba(99,102,241,0.04)',
              border: '1px solid rgba(99,102,241,0.08)',
              padding: '18px 22px',
            }}
          >
            <div
              className="text-[11px] font-bold uppercase tracking-[0.06em] mb-4"
              style={{ color: '#6366f1' }}
            >
              Explore Next
            </div>
            <div className="flex flex-col gap-4">
              {note.relatedConcepts.map((rc) => (
                <div key={rc.name}>
                  <div className="text-[15px] font-medium mb-[2px]" style={{ color: '#F1F5F9' }}>
                    {rc.name}
                  </div>
                  <div className="text-[13px] leading-[1.5]" style={{ color: '#9CA3AF' }}>
                    {rc.why}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 분석 중일 때 Explore Next shimmer */}
        {isAnalyzing && (
          <div
            className="rounded-xl"
            style={{
              background: 'rgba(99,102,241,0.04)',
              border: '1px solid rgba(99,102,241,0.08)',
              padding: '18px 22px',
            }}
          >
            <div
              className="text-[11px] font-bold uppercase tracking-[0.06em] mb-4"
              style={{ color: '#6366f1' }}
            >
              Explore Next
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded shimmer" style={{ width: '70%', height: 16, background: 'rgba(99,102,241,0.08)' }} />
              <div className="rounded shimmer" style={{ width: '90%', height: 12, background: 'rgba(99,102,241,0.05)' }} />
              <div className="rounded shimmer mt-2" style={{ width: '55%', height: 16, background: 'rgba(99,102,241,0.08)' }} />
              <div className="rounded shimmer" style={{ width: '80%', height: 12, background: 'rgba(99,102,241,0.05)' }} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default NoteDetail;
