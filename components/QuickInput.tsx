'use client';

// Quick Input 박스 — 홈 화면 중앙, 자유 텍스트 입력 + 프로젝트 선택

import { useState, useRef, useEffect } from 'react';
import ProjectDropdown from '@/components/ProjectDropdown';
import type { Project } from '@/lib/types';

type QuickInputProps = {
  projects: Project[];
  onSave: (rawContent: string, projectId: string | null) => Promise<void>;
  onCreateProject: (name: string) => Promise<Project>;
};

const QuickInput = ({ projects, onSave, onCreateProject }: QuickInputProps) => {
  const [text, setText] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // textarea 자동 높이 조절
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(Math.max(el.scrollHeight, 100), 300) + 'px';
  }, [text]);

  const handleSave = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(text, projectId);
      setText('');
      setProjectId(null);
    } catch {
      // 에러는 부모에서 처리
    } finally {
      setSaving(false);
    }
  };

  // Cmd/Ctrl+Enter로 저장
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  const isValid = text.trim().length > 0;

  return (
    <div
      className="w-full max-w-[560px] rounded-xl overflow-hidden"
      style={{
        background: '#1E293B',
        border: '1px solid rgba(148, 163, 184, 0.15)',
      }}
    >
      {/* 텍스트 영역 */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste what you learned, a bug you fixed, or anything..."
        className="w-full resize-none outline-none text-[16px] leading-[1.6]"
        style={{
          background: 'transparent',
          border: 'none',
          padding: '20px 20px 12px',
          color: '#F1F5F9',
          fontFamily: 'inherit',
          minHeight: 100,
          maxHeight: 300,
          boxSizing: 'border-box',
        }}
      />

      {/* 하단 바 — 프로젝트 드롭다운 + Save */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}
      >
        <ProjectDropdown
          selectedProjectId={projectId}
          onSelect={setProjectId}
          projects={projects}
          onCreateProject={onCreateProject}
        />

        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="text-[13px] font-semibold px-5 py-[7px] rounded-lg cursor-pointer border-none hover:opacity-90 active:scale-[0.98]"
          style={{
            background: isValid ? '#6366f1' : '#334155',
            color: isValid ? '#fff' : '#64748b',
            opacity: isValid ? 1 : 0.5,
            fontFamily: 'inherit',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default QuickInput;
