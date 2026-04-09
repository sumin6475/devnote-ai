'use client';

// 노트 폼 — 생성(POST) + 수정(PUT) 겸용
// 통일된 입력 필드 스타일: 단일 배경 + border, 좌측 accent border 없음

import { useState } from 'react';
import type { Note, Project } from '@/lib/types';
import ProjectDropdown from '@/components/ProjectDropdown';
import { GlassButton } from '@/components/ui/glass-button';

type NoteFormProps = {
  onSave: (note: Note) => void;
  onCancel: () => void;
  editNote?: Note;
  projects?: Project[];
  onCreateProject?: (name: string) => Promise<Project>;
  defaultProjectId?: string | null;
};

// 공통 입력 필드 스타일
const FIELD_STYLE: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: 10,
  padding: '14px 16px',
  fontSize: 15,
  color: '#F1F5F9',
  lineHeight: 1.6,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
};

const NoteForm = ({ onSave, onCancel, editNote, projects = [], onCreateProject, defaultProjectId }: NoteFormProps) => {
  const isEditing = !!editNote;

  const [noteType, setNoteType] = useState<'debug' | 'learning'>(
    editNote?.noteType === 'quick' ? 'debug' : (editNote?.noteType ?? 'debug')
  );
  const [projectId, setProjectId] = useState<string | null>(editNote?.projectId ?? defaultProjectId ?? null);
  const [showCode, setShowCode] = useState(!!editNote?.codeSnippet);
  const [saving, setSaving] = useState(false);

  // Debug 필드
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

  const addLearning = () => setLearnings([...learnings, '']);
  const removeLearning = (idx: number) => setLearnings(learnings.filter((_, i) => i !== idx));
  const updateLearning = (idx: number, val: string) => {
    const updated = [...learnings];
    updated[idx] = val;
    setLearnings(updated);
  };

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
        skillTags: isEditing ? editNote.skillTags : [],
        topicTags: isEditing ? editNote.topicTags : [],
        category: isEditing ? editNote.category : '',
      };

      const url = isEditing ? `/api/notes/${editNote.id}` : '/api/notes';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Server error (${res.status})`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      onSave(data.data);
    } catch (err) {
      console.error('Save failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto" style={{ background: '#0b1120' }}>
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
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
          }}
        >
          {(['debug', 'learning'] as const).map((type) => (
            <button
              key={type}
              onClick={() => !isEditing && setNoteType(type)}
              className="flex-1 py-[10px] text-center text-[13px] font-semibold rounded-[7px] border-none"
              style={{
                background: noteType === type ? '#6366f1' : 'transparent',
                color: noteType === type ? '#fff' : '#64748b',
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
            <FormGroup label="Problem">
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="What was the problem? What error did you encounter?"
                rows={2}
                className="resize-y outline-none"
                style={{ ...FIELD_STYLE, minHeight: 80 }}
              />
            </FormGroup>
            <FormGroup label="Solution">
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="How did you fix it? What did you change?"
                rows={2}
                className="resize-y outline-none"
                style={{ ...FIELD_STYLE, minHeight: 80 }}
              />
            </FormGroup>
            <FormGroup label="Understanding">
              <textarea
                value={understanding}
                onChange={(e) => setUnderstanding(e.target.value)}
                placeholder="Why did it happen? What's the root cause?"
                rows={2}
                className="resize-y outline-none"
                style={{ ...FIELD_STYLE, minHeight: 80 }}
              />
            </FormGroup>
          </>
        )}

        {/* === Learning 필드 === */}
        {noteType === 'learning' && (
          <>
            <FormGroup label="What I Built">
              <textarea
                value={whatIBuilt}
                onChange={(e) => setWhatIBuilt(e.target.value)}
                placeholder="What did you build or try to implement?"
                rows={2}
                className="resize-y outline-none"
                style={{ ...FIELD_STYLE, minHeight: 80 }}
              />
            </FormGroup>
            <FormGroup label="What I Learned">
              <div className="flex flex-col gap-2">
                {learnings.map((val, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      value={val}
                      onChange={(e) => updateLearning(idx, e.target.value)}
                      placeholder={idx === 0 ? 'Something I learned...' : 'Another thing...'}
                      className="flex-1 outline-none"
                      style={{ ...FIELD_STYLE, padding: '10px 14px', fontSize: 14 }}
                    />
                    {learnings.length > 1 && (
                      <button
                        onClick={() => removeLearning(idx)}
                        className="flex items-center justify-center shrink-0 cursor-pointer text-[14px] rounded-lg border-none hover:opacity-80"
                        style={{
                          width: 36,
                          height: 40,
                          background: 'rgba(239,68,68,0.08)',
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
                  className="self-start text-[12px] cursor-pointer inline-flex items-center gap-1 border-none rounded-lg hover:opacity-80"
                  style={{
                    color: '#818cf8',
                    background: 'rgba(99,102,241,0.08)',
                    padding: '7px 14px',
                    fontFamily: 'inherit',
                  }}
                >
                  + Add item
                </button>
              </div>
            </FormGroup>
            <FormGroup label="Source" optional>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Where did you learn this? Project, docs, tutorial..."
                className="outline-none"
                style={{ ...FIELD_STYLE, padding: '10px 14px', fontSize: 14 }}
              />
            </FormGroup>
          </>
        )}

        {/* 구분선 */}
        <div
          className="my-6"
          style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}
        />

        {/* Code Snippet 토글 */}
        <button
          onClick={() => setShowCode(!showCode)}
          className="text-[12px] cursor-pointer flex items-center gap-[6px] border-none bg-transparent p-0 hover:opacity-80"
          style={{
            color: showCode ? '#818cf8' : '#64748b',
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
          <span className="text-[10px] font-normal" style={{ color: '#475569' }}>
            (optional)
          </span>
        </button>

        {showCode && (
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="Paste related code here..."
            className="w-full mt-3 resize-y outline-none"
            style={{
              ...FIELD_STYLE,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '12.5px',
              color: '#94a3b8',
              lineHeight: 1.7,
              minHeight: 80,
            }}
          />
        )}

        {/* 프로젝트 선택 */}
        {onCreateProject && (
          <div className="mt-6 flex items-center gap-2">
            <span className="text-[12px] uppercase tracking-[0.05em]" style={{ color: '#94A3B8' }}>
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

        {/* Save 버튼 — GlassButton */}
        <div className="mt-8">
          <GlassButton
            className="w-full"
            contentClassName="flex items-center justify-center w-full"
            onClick={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? 'Saving...' : isEditing ? 'Update note' : 'Save note'}
          </GlassButton>
        </div>

        <p
          className="text-center mt-[14px] text-[11px]"
          style={{ color: '#475569' }}
        >
          AI will automatically generate tags and category
        </p>
      </div>
    </main>
  );
};

// --- 서브 컴포넌트 ---

const FormGroup = ({ label, optional, children }: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) => (
  <div className="mb-5">
    <label
      className="text-[12px] uppercase tracking-[0.05em] block mb-2"
      style={{ color: '#94A3B8' }}
    >
      {label}
      {optional && (
        <span className="normal-case tracking-normal text-[11px]" style={{ color: '#475569' }}>
          {' '}(optional)
        </span>
      )}
    </label>
    {children}
  </div>
);

export default NoteForm;
