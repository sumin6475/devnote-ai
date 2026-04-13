'use client';

// AI 분석 모드 — rawText를 받아서 즉시 분석 → 캐러셀 미리보기 → 저장

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ParsePreview from './ParsePreview';
import type { ParsedNote } from './ParsedNoteCard';
import type { Project, Note } from '@/lib/types';

type QuickNotePasteProps = {
  rawText: string;
  defaultProjectId: string | null;
  projects: Project[];
  onCreateProject: (name: string) => Promise<Project>;
  onNotesSaved: (notes: Note[]) => void;
  onCancel: () => void;
};

type ViewState = 'parsing' | 'preview' | 'error';

const QuickNotePaste = ({ rawText, defaultProjectId, projects, onCreateProject, onNotesSaved, onCancel }: QuickNotePasteProps) => {
  const [viewState, setViewState] = useState<ViewState>('parsing');
  const [parsedNotes, setParsedNotes] = useState<ParsedNote[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 마운트 시 즉시 분석 시작
  useEffect(() => {
    const parse = async () => {
      try {
        const res = await fetch('/api/ai/parse-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const notes: ParsedNote[] = data.data.notes.map((n: ParsedNote) => ({
          ...n,
          projectId: defaultProjectId,
        }));

        setParsedNotes(notes);
        setViewState('preview');
      } catch (err) {
        console.error('Parse 실패:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setViewState('error');
      }
    };

    parse();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 전체 저장
  const handleSaveAll = async (notes: ParsedNote[]) => {
    const savedNotes: Note[] = [];

    for (const note of notes) {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteType: 'debug',
          problem: note.problem,
          solution: note.solution,
          understanding: note.understanding,
          codeSnippet: note.code_snippet || null,
          projectId: note.projectId,
          skillTags: note.skill_tags,
          topicTags: note.topic_tags,
          category: '',
        }),
      });
      const data = await res.json();
      if (data.success) savedNotes.push(data.data);
    }

    onNotesSaved(savedNotes);
  };

  // 다시 분석
  const handleReparse = () => {
    setViewState('parsing');
    setError(null);
    setParsedNotes([]);

    // 재분석
    (async () => {
      try {
        const res = await fetch('/api/ai/parse-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const notes: ParsedNote[] = data.data.notes.map((n: ParsedNote) => ({
          ...n,
          projectId: defaultProjectId,
        }));

        setParsedNotes(notes);
        setViewState('preview');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setViewState('error');
      }
    })();
  };

  // 분석 중
  if (viewState === 'parsing') {
    return (
      <div className="flex flex-col items-center py-8 gap-3">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#818CF8' }} />
        <span className="text-[14px]" style={{ color: '#94A3B8' }}>Analyzing...</span>
      </div>
    );
  }

  // 에러
  if (viewState === 'error') {
    return (
      <div className="flex flex-col items-center py-8 gap-3">
        <span className="text-[14px]" style={{ color: '#EF4444' }}>{error}</span>
        <div className="flex gap-2">
          <button
            onClick={handleReparse}
            className="text-[12px] font-medium px-4 py-[7px] rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8', fontFamily: 'inherit' }}
          >
            Retry
          </button>
          <button
            onClick={onCancel}
            className="text-[12px] font-medium px-4 py-[7px] rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: 'transparent', border: '1px solid rgba(148,163,184,0.08)', color: '#64748B', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // 미리보기
  return (
    <ParsePreview
      notes={parsedNotes}
      projects={projects}
      onCreateProject={onCreateProject}
      onSaveAll={handleSaveAll}
      onReparse={handleReparse}
      onCancel={onCancel}
    />
  );
};

export default QuickNotePaste;
