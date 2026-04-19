'use client';

// Quick 노트 생성 폼 — 노트 페이지 우측 패널용 (단순 텍스트 입력)

import { useState, useRef, useEffect } from 'react';
import type { Note, Project } from '@/lib/types';
import ProjectDropdown from '@/components/ProjectDropdown';
import { GlassButton } from '@/components/ui/glass-button';
import CodeEditor from '@/components/ui/code-editor/CodeEditor';

type QuickNoteFormProps = {
  onSave: (note: Note) => void;
  onCancel: () => void;
  projects?: Project[];
  onCreateProject?: (name: string) => Promise<Project>;
  defaultProjectId?: string | null;
};

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

const QuickNoteForm = ({ onSave, onCancel, projects = [], onCreateProject, defaultProjectId }: QuickNoteFormProps) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId ?? null);
  const [showCode, setShowCode] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // 마운트 시 textarea에 포커스
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const isValid = text.trim().length > 0;

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteType: 'quick',
          rawContent: title.trim() ? `${title.trim()}\n${text}` : text,
          codeSnippet: showCode && codeSnippet.trim() ? codeSnippet : null,
          projectId,
          skillTags: [],
          topicTags: [],
          category: '',
        }),
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
            New quick note
          </h1>
          <button
            onClick={onCancel}
            className="text-[12px] cursor-pointer border-none bg-transparent hover:opacity-80"
            style={{ color: '#4b5563', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
        </div>

        {/* 제목 입력 */}
        <div className="mb-4">
          <label
            className="text-[12px] uppercase tracking-[0.05em] block mb-2"
            style={{ color: '#94A3B8' }}
          >
            Title
            <span className="normal-case tracking-normal text-[11px]" style={{ color: '#475569' }}>
              {' '}(optional)
            </span>
          </label>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a short title..."
            className="outline-none"
            style={{ ...FIELD_STYLE, padding: '10px 16px', fontSize: 14 }}
          />
        </div>

        {/* 텍스트 입력 */}
        <div className="mb-5">
          <label
            className="text-[12px] uppercase tracking-[0.05em] block mb-2"
            style={{ color: '#94A3B8' }}
          >
            Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste what you learned, a bug you fixed, or anything..."
            rows={5}
            className="resize-y outline-none"
            style={{ ...FIELD_STYLE, minHeight: 120 }}
          />
        </div>

        {/* 구분선 */}
        <div className="my-6" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)' }} />

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
          <div className="mt-3">
            <CodeEditor
              value={codeSnippet}
              onChange={setCodeSnippet}
              placeholder="Paste related code here..."
              minHeight="120px"
            />
          </div>
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

        {/* Save 버튼 */}
        <div className="mt-8">
          <GlassButton
            className="w-full"
            contentClassName="flex items-center justify-center w-full"
            onClick={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? 'Saving...' : 'Save note'}
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

export default QuickNoteForm;
