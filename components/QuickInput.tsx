'use client';

// Quick Input — Bolt 스타일: gradient border, premium 인풋, SendHorizontal 아이콘

import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Plus } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
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
    el.style.height = Math.min(Math.max(el.scrollHeight, 80), 200) + 'px';
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

  // Enter = Save, Shift+Enter = 줄바꿈
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const isValid = text.trim().length > 0;

  return (
    <div className="w-full relative">
      {/* gradient border 효과 — 외부 래퍼 */}
      <div
        className="absolute pointer-events-none rounded-[16px]"
        style={{
          inset: -1,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)',
        }}
      />

      {/* 인풋 컨테이너 */}
      <div
        className="relative rounded-[16px]"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* 텍스트 영역 */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste what you learned, a bug you fixed, or anything..."
          className="w-full resize-none outline-none text-[15px] leading-[1.6]"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '20px 20px 12px',
            color: '#fff',
            fontFamily: 'inherit',
            minHeight: 80,
            maxHeight: 200,
            boxSizing: 'border-box',
          }}
        />

        {/* 하단 바 */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid rgba(148, 163, 184, 0.06)' }}
        >
          <div className="flex items-center gap-2">
            {/* + 버튼 (장식용, 추후 파일 첨부) */}
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 28,
                height: 28,
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              <Plus style={{ width: 14, height: 14, color: '#8a8a8f' }} />
            </div>

            {/* 프로젝트 드롭다운 */}
            <ProjectDropdown
              selectedProjectId={projectId}
              onSelect={setProjectId}
              projects={projects}
              onCreateProject={onCreateProject}
            />
          </div>

          {/* Save 버튼 — GlassButton */}
          <GlassButton
            size="sm"
            contentClassName="flex items-center gap-2"
            onClick={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? 'Saving...' : 'Save'}
            <SendHorizontal className="h-4 w-4" />
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

export default QuickInput;
