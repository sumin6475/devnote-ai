'use client';

// 노트 상세 컴포넌트 — 타입에 따라 Debug 또는 Learning 블록 렌더링
// v2: 2레이어 태그 + 2섹션 AI Context + 가독성 개선

import { useState } from 'react';
import { SkillTag, TopicTag } from '@/components/ui/Tag';
import { CodeBlock, CodeBlockCode, CodeBlockGroup } from '@/components/ui/code-block';
import { Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (note?.codeSnippet) {
      navigator.clipboard.writeText(note.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        throw new Error(`Server error (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setShowDeleteConfirm(false);
      onDelete?.(note.id);
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  // AI 분석 완료 여부 — topicTags에 값이 있으면 분석 완료
  const hasAiData = note.topicTags && note.topicTags.length > 0;

  return (
    <main className="flex-1 h-screen overflow-y-auto relative" style={{ background: '#0b1120' }}>
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

        {/* 섹션 래퍼 — 24px 간격 */}
        <div className="flex flex-col gap-6">

        {/* 콘텐츠 블록 — 하나의 카드로 통합 */}
        {note.noteType === 'quick' ? (
          <>
            {/* Quick Note: rawContent 원본 */}
            {note.rawContent && (
              <div
                className="rounded-xl whitespace-pre-wrap text-[16px] leading-[1.7]"
                style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  padding: 24,
                  color: '#F1F5F9',
                }}
              >
                {note.rawContent}
              </div>
            )}

            {/* AI 구조화 결과 */}
            {(note.problem || note.whatIBuilt) && (
              <div
                className="rounded-xl"
                style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  padding: 24,
                }}
              >
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] mb-4" style={{ color: '#64748b' }}>
                  AI Structured
                </div>
                {note.problem && (
                  <>
                    <SectionLabel label="Problem" bg="rgba(239,68,68,0.15)" color="#FCA5A5" />
                    <div className="text-[16px] leading-[1.7]" style={{ color: '#F1F5F9' }}>{note.problem}</div>
                  </>
                )}
                {note.solution && (
                  <>
                    <Divider />
                    <SectionLabel label="Solution" bg="rgba(34,197,94,0.15)" color="#86EFAC" />
                    <div className="text-[16px] leading-[1.7]" style={{ color: '#F1F5F9' }}>{note.solution}</div>
                  </>
                )}
                {note.understanding && (
                  <>
                    <Divider />
                    <SectionLabel label="Understanding" bg="rgba(129,140,248,0.15)" color="#A5B4FC" />
                    <div className="text-[16px] leading-[1.7]" style={{ color: '#F1F5F9' }}>{note.understanding}</div>
                  </>
                )}
                {note.whatIBuilt && (
                  <>
                    <SectionLabel label="What I Built" bg="rgba(56,189,248,0.15)" color="#7DD3FC" />
                    <div className="text-[16px] leading-[1.7]" style={{ color: '#F1F5F9' }}>{note.whatIBuilt}</div>
                  </>
                )}
                {note.learnings && note.learnings.length > 0 && (
                  <>
                    <Divider />
                    <SectionLabel label="What I Learned" bg="rgba(167,139,250,0.15)" color="#C4B5FD" />
                    <ul className="m-0 pl-4 text-[16px] leading-[1.7] flex flex-col gap-[6px]" style={{ listStyleType: 'disc', color: '#F1F5F9' }}>
                      {note.learnings.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </>
                )}
              </div>
            )}
          </>
        ) : note.noteType === 'debug' ? (
          /* Debug Note — 하나의 카드에 P/S/U */
          <div
            className="rounded-xl"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              padding: 24,
            }}
          >
            <SectionLabel label="Problem" bg="rgba(239,68,68,0.15)" color="#FCA5A5" />
            <div className="text-[16px] leading-[1.7]" style={{ color: '#F1F5F9' }}>
              {note.problem}
            </div>

            <Divider />

            <SectionLabel label="Solution" bg="rgba(34,197,94,0.15)" color="#86EFAC" />
            <div className="text-[16px] leading-[1.7]" style={{ color: '#F1F5F9' }}>
              {note.solution}
            </div>

            <Divider />

            <SectionLabel label="Understanding" bg="rgba(129,140,248,0.15)" color="#A5B4FC" />
            <div className="text-[16px] leading-[1.7]" style={{ color: '#F1F5F9' }}>
              {note.understanding}
            </div>
          </div>
        ) : (
          /* Learning Note — 하나의 카드에 WIB/WIL + Source */
          <div
            className="rounded-xl"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              padding: 24,
            }}
          >
            <SectionLabel label="What I Built" bg="rgba(56,189,248,0.15)" color="#7DD3FC" />
            <div className="text-[16px] leading-[1.7]" style={{ color: '#F1F5F9' }}>
              {note.whatIBuilt}
            </div>

            {note.learnings && note.learnings.length > 0 && (
              <>
                <Divider />
                <SectionLabel label="What I Learned" bg="rgba(167,139,250,0.15)" color="#C4B5FD" />
                <ul className="m-0 pl-4 text-[16px] leading-[1.7] flex flex-col gap-[6px]" style={{ listStyleType: 'disc', color: '#F1F5F9' }}>
                  {note.learnings.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            {note.source && (
              <>
                <Divider />
                <div className="text-[12px] font-semibold uppercase tracking-[0.05em] mb-1" style={{ color: '#475569' }}>
                  Source
                </div>
                <div className="text-[14px]" style={{ color: '#9CA3AF' }}>
                  {note.source}
                </div>
              </>
            )}
          </div>
        )}

        {/* Code Snippet — Shiki syntax highlighting */}
        {note.codeSnippet && (
          <div>
            <CodeBlock>
              <CodeBlockGroup
                style={{
                  borderBottom: '1px solid rgba(148,163,184,0.1)',
                  padding: '12px 16px',
                  background: 'transparent',
                }}
              >
                <span style={{ fontSize: 12, color: '#64748B' }}>Code Snippet</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center justify-center rounded-md cursor-pointer border-none hover:opacity-70"
                  style={{
                    background: 'transparent',
                    padding: 6,
                    borderRadius: 6,
                  }}
                  title="Copy code"
                >
                  {copied ? (
                    <Check style={{ width: 16, height: 16, color: '#22C55E' }} />
                  ) : (
                    <Copy style={{ width: 16, height: 16, color: '#94A3B8' }} />
                  )}
                </button>
              </CodeBlockGroup>
              <CodeBlockCode
                code={note.codeSnippet}
                language="javascript"
                theme="github-dark"
              />
            </CodeBlock>
          </div>
        )}

        {/* === AI Context — 터미널 윈도우 스타일 === */}
        <div
          className="rounded-[10px] overflow-hidden"
          style={{
            background: '#0F172A',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}
        >
          {/* 타이틀 바 — 트래픽 라이트 dots */}
          <div
            className="flex items-center"
            style={{
              background: 'rgba(148, 163, 184, 0.06)',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <div className="flex gap-[6px] mr-3">
              <span className="rounded-full" style={{ width: 10, height: 10, background: '#EF4444' }} />
              <span className="rounded-full" style={{ width: 10, height: 10, background: '#F59E0B' }} />
              <span className="rounded-full" style={{ width: 10, height: 10, background: '#22C55E' }} />
            </div>
            <span
              className="flex-1 text-center text-[12px]"
              style={{ color: '#94A3B8', marginRight: 46 }}
            >
              AI Context
              {isAnalyzing && (
                <span style={{ color: '#6B7280' }}> — Analyzing...</span>
              )}
            </span>
          </div>

          {/* 바디 */}
          <div style={{ padding: 20 }}>
            {isAnalyzing ? (
              /* shimmer */
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
              <div className="flex flex-col gap-4">
                {/* Skill Tags */}
                {note.skillTags.length > 0 && (
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.05em] mb-[8px]" style={{ color: '#64748B' }}>
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
                  <div className="text-[11px] uppercase tracking-[0.05em] mb-[8px]" style={{ color: '#64748B' }}>
                    Topics
                  </div>
                  <div className="flex gap-[6px] flex-wrap">
                    {note.topicTags.map((tag) => (
                      <TopicTag key={tag} label={tag} />
                    ))}
                  </div>
                </div>
                {/* Category */}
                {note.category && (
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.05em] mb-[8px]" style={{ color: '#64748B' }}>
                      Category
                    </div>
                    <span className="text-[13px]" style={{ color: '#94A3B8' }}>
                      {note.category}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* empty state */
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
        </div>

        </div>{/* 섹션 래퍼 닫기 */}
      </div>
    </main>
  );
};

// --- 서브 컴포넌트 ---

// 섹션 라벨 태그 (pill이 아닌 살짝 라운드)
const SectionLabel = ({ label, bg, color }: { label: string; bg: string; color: string }) => (
  <span
    className="inline-block text-[11px] font-semibold uppercase tracking-[0.05em] mb-[10px]"
    style={{
      background: bg,
      color,
      padding: '3px 10px',
      borderRadius: 4,
    }}
  >
    {label}
  </span>
);

// 점선 구분선
const Divider = () => (
  <div
    className="my-5"
    style={{ borderTop: '1px dashed rgba(148, 163, 184, 0.12)' }}
  />
);

export default NoteDetail;
