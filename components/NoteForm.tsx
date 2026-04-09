'use client';

// 노트 폼 — 생성(POST) + 수정(PUT) 겸용
// editNote가 있으면 수정 모드: 기존 데이터 채운 상태로 시작
// CLAUDE.md: 이모티콘 금지, 배경 opacity 스타일, 좌측 accent border

import { useState } from 'react';
import type { Note, Project } from '@/lib/types';
import ProjectDropdown from '@/components/ProjectDropdown';

type NoteFormProps = {
  onSave: (note: Note) => void;
  onCancel: () => void;
  editNote?: Note;
  projects?: Project[];
  onCreateProject?: (name: string) => Promise<Project>;
  defaultProjectId?: string | null;
};

const NoteForm = ({ onSave, onCancel, editNote, projects = [], onCreateProject, defaultProjectId }: NoteFormProps) => {
  const isEditing = !!editNote;

  const [noteType, setNoteType] = useState<'debug' | 'learning'>(
    editNote?.noteType === 'quick' ? 'debug' : (editNote?.noteType ?? 'debug')
  );
  const [projectId, setProjectId] = useState<string | null>(editNote?.projectId ?? defaultProjectId ?? null);
  const [showCode, setShowCode] = useState(!!editNote?.codeSnippet);
  const [saving, setSaving] = useState(false);

  // Debug 필드 — 수정 모드면 기존 값으로 초기화
  const [problem, setProblem] = useState(editNote?.problem ?? '');
  const [solution, setSolution] = useState(editNote?.solution ?? '');
  const [understanding, setUnderstanding] = useState(editNote?.understanding ?? '');

  // Learning 필드
  const [whatIBuilt, setWhatIBuilt] = useState(editNote?.whatIBuilt ?? '');
  const [learnings, setLearnings] = useState<string[]>(
    editNote?.learnings?.length ? editNote.learnings : ['', '']
  );
  const [source, setSource] = useState(editNote?.source ?? '');

  // 공통
  const [codeSnippet, setCodeSnippet] = useState(editNote?.codeSnippet ?? '');

  // Learning 항목 추가/삭제/수정
  const addLearning = () => setLearnings([...learnings, '']);
  const removeLearning = (idx: number) => setLearnings(learnings.filter((_, i) => i !== idx));
  const updateLearning = (idx: number, val: string) => {
    const updated = [...learnings];
    updated[idx] = val;
    setLearnings(updated);
  };

  // 저장 유효성 체크
  const isValid = noteType === 'debug'
    ? problem.trim() && solution.trim() && understanding.trim()
    : whatIBuilt.trim() && learnings.some((l) => l.trim());

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);

    try {
      const body = {
        noteType,
        ...(noteType === 'debug'
          ? { problem, solution, understanding }
          : {
              whatIBuilt,
              learnings: learnings.filter((l) => l.trim()),
              source: source.trim() || null,
            }),
        codeSnippet: showCode && codeSnippet.trim() ? codeSnippet : null,
        projectId,
        // 수정 모드에서는 기존 AI 데이터 유지, 생성 모드에서는 빈 값 (AI가 자동 생성)
        skillTags: isEditing ? editNote.skillTags : [],
        topicTags: isEditing ? editNote.topicTags : [],
        category: isEditing ? editNote.category : '',
        relatedConcepts: isEditing ? editNote.relatedConcepts : [],
      };

      // 생성: POST /api/notes / 수정: PUT /api/notes/[id]
      const url = isEditing ? `/api/notes/${editNote.id}` : '/api/notes';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`서버 에러 (${res.status})`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      onSave(data.data);
    } catch (err) {
      console.error('저장 실패:', err);
      alert(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: '#0b1120' }}>
      <div className="max-w-[640px] mx-auto px-5 py-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-[20px] font-semibold m-0 tracking-[-0.01em]"
            style={{ color: '#f1f5f9' }}
          >
            {isEditing ? 'Edit note' : 'New note'}
          </h1>
          <button
            onClick={onCancel}
            className="text-[12px] cursor-pointer border-none bg-transparent hover:opacity-80"
            style={{ color: '#4b5563', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
        </div>

        {/* 타입 선택 탭 */}
        <div
          className="flex gap-0 rounded-[10px] p-1 mb-7"
          style={{
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.1)',
          }}
        >
          {(['debug', 'learning'] as const).map((type) => (
            <button
              key={type}
              onClick={() => !isEditing && setNoteType(type)}
              className="flex-1 py-[10px] text-center text-[13px] font-semibold rounded-[7px] border-none"
              style={{
                background: noteType === type ? '#6366f1' : 'transparent',
                color: noteType === type ? '#fff' : '#4b5563',
                fontFamily: 'inherit',
                cursor: isEditing ? 'default' : 'pointer',
                opacity: isEditing && noteType !== type ? 0.3 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {type === 'debug' ? 'Debug' : 'Learning'}
            </button>
          ))}
        </div>

        {/* === Debug 필드 === */}
        {noteType === 'debug' && (
          <>
            <FieldWrapper label="PROBLEM" color="#ef4444" borderColor="#b71c1c" bgColor="rgba(183,28,28,0.05)">
              <FormTextarea
                value={problem}
                onChange={setProblem}
                placeholder="무엇이 문제였는지 — 어떤 에러를 만났어?"
                borderColor="rgba(183,28,28,0.12)"
              />
            </FieldWrapper>
            <FieldWrapper label="SOLUTION" color="#22c55e" borderColor="#006239" bgColor="rgba(0,98,57,0.05)">
              <FormTextarea
                value={solution}
                onChange={setSolution}
                placeholder="어떻게 해결했는지 — 뭘 바꿨어?"
                borderColor="rgba(0,98,57,0.12)"
              />
            </FieldWrapper>
            <FieldWrapper label="UNDERSTANDING" color="#818cf8" borderColor="#6366f1" bgColor="rgba(99,102,241,0.04)">
              <FormTextarea
                value={understanding}
                onChange={setUnderstanding}
                placeholder="왜 그런 건지 — 근본 원인이 뭐야?"
                borderColor="rgba(99,102,241,0.1)"
              />
            </FieldWrapper>
          </>
        )}

        {/* === Learning 필드 === */}
        {noteType === 'learning' && (
          <>
            <FieldWrapper label="WHAT I BUILT" color="#38bdf8" borderColor="#0284c7" bgColor="rgba(56,189,248,0.04)">
              <FormTextarea
                value={whatIBuilt}
                onChange={setWhatIBuilt}
                placeholder="뭘 만들었는지 — 어떤 기능을 구현했어?"
                borderColor="rgba(56,189,248,0.1)"
              />
            </FieldWrapper>
            <FieldWrapper label="WHAT I LEARNED" color="#a78bfa" borderColor="#7c3aed" bgColor="rgba(167,139,250,0.04)">
              <div className="flex flex-col gap-2">
                {learnings.map((val, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      value={val}
                      onChange={(e) => updateLearning(idx, e.target.value)}
                      placeholder={idx === 0 ? '배운 것 하나...' : '또 배운 것...'}
                      className="flex-1 text-[13.5px] outline-none"
                      style={{
                        background: 'rgba(167,139,250,0.03)',
                        border: '1px solid rgba(167,139,250,0.1)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#e2e8f0',
                        fontFamily: 'inherit',
                      }}
                    />
                    {learnings.length > 1 && (
                      <button
                        onClick={() => removeLearning(idx)}
                        className="flex items-center justify-center shrink-0 cursor-pointer text-[14px]"
                        style={{
                          width: 30,
                          height: 34,
                          background: 'rgba(239,68,68,0.05)',
                          border: '1px solid rgba(239,68,68,0.1)',
                          borderRadius: 6,
                          color: '#ef4444',
                        }}
                      >
                        x
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addLearning}
                  className="self-start text-[12px] cursor-pointer inline-flex items-center gap-1"
                  style={{
                    color: '#a78bfa',
                    background: 'rgba(167,139,250,0.05)',
                    border: '1px solid rgba(167,139,250,0.12)',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontFamily: 'inherit',
                  }}
                >
                  + Add item
                </button>
              </div>
            </FieldWrapper>
            <FieldWrapper label="SOURCE" color="#4b5563" optional>
              <FormTextarea
                value={source}
                onChange={setSource}
                placeholder="어디서 배웠어? 프로젝트명, 문서 URL, 강의..."
                borderColor="rgba(148,163,184,0.1)"
                rows={1}
                minHeight={44}
              />
            </FieldWrapper>
          </>
        )}

        {/* 구분선 */}
        <div
          className="my-6"
          style={{ borderTop: '1px solid rgba(99,102,241,0.06)' }}
        />

        {/* Code Snippet 토글 */}
        <button
          onClick={() => setShowCode(!showCode)}
          className="text-[12px] cursor-pointer flex items-center gap-[6px] border-none bg-transparent p-0 hover:opacity-80"
          style={{
            color: showCode ? '#818cf8' : '#4b5563',
            fontFamily: 'inherit',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path
              d="M7 6l-4 4 4 4M13 6l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {showCode ? 'Hide code snippet' : 'Add code snippet'}
          <span className="text-[10px] font-normal" style={{ color: '#334155' }}>
            (optional)
          </span>
        </button>

        {showCode && (
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="관련 코드 붙여넣기..."
            className="w-full mt-[10px] resize-y outline-none"
            style={{
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(99,102,241,0.06)',
              borderRadius: 10,
              padding: '14px 16px',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '12.5px',
              color: '#94a3b8',
              lineHeight: 1.7,
              minHeight: 80,
              boxSizing: 'border-box',
            }}
          />
        )}

        {/* 프로젝트 선택 */}
        {onCreateProject && (
          <div className="mt-6 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: '#475569' }}>
              Project
            </span>
            <ProjectDropdown
              selectedProjectId={projectId}
              onSelect={setProjectId}
              projects={projects}
              onCreateProject={onCreateProject}
            />
          </div>
        )}

        {/* Save 버튼 */}
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="w-full mt-8 py-[13px] text-[14px] font-semibold rounded-[10px] cursor-pointer border-none hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:scale-[0.99]"
          style={{
            background: isValid ? '#6366f1' : '#334155',
            color: isValid ? '#fff' : '#64748b',
            fontFamily: 'inherit',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
        >
          {saving ? 'Saving...' : isEditing ? 'Update note' : 'Save note'}
        </button>

        <p
          className="text-center mt-[14px] text-[11px]"
          style={{ color: '#334155' }}
        >
          AI will automatically generate tags, category, and related concepts
        </p>
      </div>
    </main>
  );
};

// --- 재사용 서브 컴포넌트 ---

// 필드 래퍼 — 좌측 accent border 포함
type FieldWrapperProps = {
  label: string;
  color: string;
  borderColor?: string;
  bgColor?: string;
  optional?: boolean;
  children: React.ReactNode;
};

const FieldWrapper = ({
  label,
  color,
  borderColor,
  bgColor,
  optional,
  children,
}: FieldWrapperProps) => (
  <div className="mb-5">
    <label
      className="text-[11px] font-bold uppercase tracking-[0.07em] block mb-2"
      style={{ color }}
    >
      {label}
      {optional && (
        <span className="font-normal normal-case tracking-normal text-[10px]" style={{ color: '#334155' }}>
          {' '}(optional)
        </span>
      )}
    </label>
    <div
      style={{
        background: bgColor || 'transparent',
        borderLeft: borderColor ? `3px solid ${borderColor}` : 'none',
        borderRadius: borderColor ? '0 8px 8px 0' : 8,
        padding: borderColor ? '4px 0 4px 16px' : 0,
      }}
    >
      {children}
    </div>
  </div>
);

// 텍스트 입력 영역
type FormTextareaProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  borderColor?: string;
  rows?: number;
  minHeight?: number;
};

const FormTextarea = ({
  value,
  onChange,
  placeholder,
  borderColor,
  rows = 2,
  minHeight = 72,
}: FormTextareaProps) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full text-[13.5px] leading-[1.6] resize-y outline-none"
    style={{
      background: 'transparent',
      border: `1px solid ${borderColor || 'rgba(148,163,184,0.08)'}`,
      borderRadius: 8,
      padding: '12px 14px',
      color: '#e2e8f0',
      minHeight,
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    }}
  />
);

export default NoteForm;
