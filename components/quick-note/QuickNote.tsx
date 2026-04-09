'use client';

// Quick Note — 단일 텍스트 입력 → 저장 시 "빠른 저장" / "AI 분석" 선택

import { useState, useRef, useEffect } from 'react';
import { Zap, Bot, Plus } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import ProjectDropdown from '@/components/ProjectDropdown';
import QuickNotePaste from './QuickNotePaste';
import type { Project, Note } from '@/lib/types';

type SaveMode = 'input' | 'choose' | 'aiPreview';

type QuickNoteProps = {
  projects: Project[];
  onQuickSave: (rawContent: string, projectId: string | null) => Promise<void>;
  onCreateProject: (name: string) => Promise<Project>;
  onNotesSaved?: (notes: Note[]) => void;
};

const QuickNote = ({ projects, onQuickSave, onCreateProject, onNotesSaved }: QuickNoteProps) => {
  const [text, setText] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<SaveMode>('input');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chooseRef = useRef<HTMLDivElement>(null);

  // textarea auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(Math.max(el.scrollHeight, 80), 200) + 'px';
  }, [text]);

  // "choose" 모드에서 바깥 클릭 또는 ESC → 입력으로 복귀
  useEffect(() => {
    if (saveMode !== 'choose') return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSaveMode('input');
    };
    const handleClick = (e: MouseEvent) => {
      if (chooseRef.current && !chooseRef.current.contains(e.target as Node)) {
        setSaveMode('input');
      }
    };

    window.addEventListener('keydown', handleKey);
    // 약간의 딜레이로 현재 클릭이 바깥 클릭으로 잡히는 것 방지
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [saveMode]);

  // 빠른 저장 — 태그만 달고 바로 저장
  const handleQuickSave = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await onQuickSave(text, projectId);
      setText('');
      setProjectId(null);
      setSaveMode('input');
    } catch {
      // 에러는 부모에서 처리
    } finally {
      setSaving(false);
    }
  };

  // AI 분석 모드로 전환
  const handleStartAiAnalysis = () => {
    setSaveMode('aiPreview');
  };

  // AI 분석 결과 저장 완료
  const handleAiNotesSaved = (notes: Note[]) => {
    onNotesSaved?.(notes);
    setText('');
    setProjectId(null);
    setSaveMode('input');
  };

  const isValid = text.trim().length > 0;

  // AI 분석 미리보기 모드
  if (saveMode === 'aiPreview') {
    return (
      <div className="w-full relative">
        <div
          className="absolute pointer-events-none rounded-[16px]"
          style={{ inset: -1, background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)' }}
        />
        <div
          className="relative rounded-[16px] overflow-hidden"
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)',
            padding: 20,
          }}
        >
          <QuickNotePaste
            rawText={text}
            defaultProjectId={projectId}
            projects={projects}
            onCreateProject={onCreateProject}
            onNotesSaved={handleAiNotesSaved}
            onCancel={() => setSaveMode('input')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* gradient border */}
      <div
        className="absolute pointer-events-none rounded-[16px]"
        style={{ inset: -1, background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)' }}
      />

      {/* 컨테이너 */}
      <div
        className="relative rounded-[16px] overflow-hidden"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
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
          {saveMode === 'input' ? (
            /* 기본 상태 — 프로젝트 + Save 버튼 */
            <>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.06)' }}
                >
                  <Plus style={{ width: 14, height: 14, color: '#8a8a8f' }} />
                </div>
                <ProjectDropdown
                  selectedProjectId={projectId}
                  onSelect={setProjectId}
                  projects={projects}
                  onCreateProject={onCreateProject}
                />
              </div>

              <GlassButton
                size="sm"
                contentClassName="flex items-center gap-2"
                onClick={() => isValid && setSaveMode('choose')}
                disabled={!isValid}
              >
                Save
              </GlassButton>
            </>
          ) : (
            /* choose 상태 — 빠른 저장 / AI 분석 */
            <div ref={chooseRef} className="flex items-center gap-3 w-full justify-end">
              <button
                onClick={handleQuickSave}
                disabled={saving}
                className="flex items-center gap-[6px] text-[13px] font-medium px-4 py-[8px] rounded-xl cursor-pointer border-none hover:opacity-90"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#FCD34D',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s',
                }}
              >
                <Zap style={{ width: 14, height: 14 }} />
                {saving ? 'Saving...' : 'Quick Save'}
              </button>

              <button
                onClick={handleStartAiAnalysis}
                className="flex items-center gap-[6px] text-[13px] font-medium px-4 py-[8px] rounded-xl cursor-pointer border-none hover:opacity-90"
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#A5B4FC',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s',
                }}
              >
                <Bot style={{ width: 14, height: 14 }} />
                AI 분석
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickNote;
