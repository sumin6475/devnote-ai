'use client';

// 노트 목록 페이지 — NoteList + NoteDetail/NoteForm (2컬럼)
// Sidebar는 layout.tsx에서 렌더링. 프로젝트 필터: /notes?project=:id

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NoteList from '@/components/NoteList';
import NoteDetail from '@/components/NoteDetail';
import NoteForm from '@/components/NoteForm';
import QuickNoteForm from '@/components/QuickNoteForm';
import type { Note, Project } from '@/lib/types';

type RightPanelMode = 'detail' | 'create' | 'edit';
type CreateType = 'quick' | 'debug' | 'learning' | null;

const NotesPage = () => {
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get('project');
  const skillTagFilter = searchParams.get('skill_tag');
  const topicTagFilter = searchParams.get('topic_tag');

  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RightPanelMode>('detail');
  const [createType, setCreateType] = useState<CreateType>(null);
  const [analyzingNoteIds, setAnalyzingNoteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (projectFilter) params.set('project', projectFilter);
        if (skillTagFilter) params.set('skill_tag', skillTagFilter);
        if (topicTagFilter) params.set('topic_tag', topicTagFilter);
        const notesUrl = params.toString() ? `/api/notes?${params}` : '/api/notes';

        const [notesRes, projectsRes] = await Promise.all([
          fetch(notesUrl),
          fetch('/api/projects'),
        ]);

        const notesData = await notesRes.json();
        if (!notesData.success) throw new Error(notesData.error);
        setNotes(notesData.data);

        const projectsData = await projectsRes.json();
        if (projectsData.success) setProjects(projectsData.data);
      } catch (err) {
        console.error('Fetch failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectFilter, skillTagFilter, topicTagFilter]);

  const selectedNote = notes[selectedIndex] ?? null;
  const filterProject = projects.find((p) => p.id === projectFilter);

  const runAiAnalysis = async (noteId: string, noteData: {
    noteType: string;
    rawContent?: string;
    problem?: string;
    solution?: string;
    understanding?: string;
    whatIBuilt?: string;
    learnings?: string[];
    source?: string;
    codeSnippet?: string;
  }) => {
    setAnalyzingNoteIds((prev) => new Set(prev).add(noteId));
    try {
      const aiRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });
      const aiData = await aiRes.json();
      if (!aiData.success) throw new Error(aiData.error);

      const updateRes = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiData.data),
      });
      const updateData = await updateRes.json();
      if (!updateData.success) throw new Error(updateData.error);

      setNotes((prev) => prev.map((n) => (n.id === noteId ? updateData.data : n)));
    } catch (err) {
      console.error('AI 분석 실패:', err);
    } finally {
      setAnalyzingNoteIds((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    }
  };

  const handleCreateSaved = (newNote: Note) => {
    setNotes((prev) => [newNote, ...prev]);
    setSelectedIndex(0);
    setMode('detail');
    setCreateType(null);

    runAiAnalysis(newNote.id, {
      noteType: newNote.noteType,
      rawContent: newNote.rawContent,
      problem: newNote.problem,
      solution: newNote.solution,
      understanding: newNote.understanding,
      whatIBuilt: newNote.whatIBuilt,
      learnings: newNote.learnings,
      source: newNote.source,
      codeSnippet: newNote.codeSnippet,
    });
  };

  const handleEditSaved = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
    setMode('detail');
  };

  const handleDelete = (deletedId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== deletedId));
    if (selectedIndex >= notes.length - 1) {
      setSelectedIndex(Math.max(0, notes.length - 2));
    }
    setMode('detail');
  };

  const handleCreateProject = async (name: string): Promise<Project> => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setProjects((prev) => [data.data, ...prev]);
    return data.data;
  };

  const isFormMode = mode === 'create' || mode === 'edit';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: '#475569' }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  return (
    <>
      {notes.length > 0 && (
        <NoteList
          notes={notes}
          selectedIndex={isFormMode ? -1 : selectedIndex}
          onSelect={(i) => {
            setSelectedIndex(i);
            setMode('detail');
            setCreateType(null);
          }}
          filterProject={filterProject}
          filterSkillTag={skillTagFilter}
          filterTopicTag={topicTagFilter}
          onNewNote={() => { setMode('create'); setCreateType(null); }}
        />
      )}

      {mode === 'create' ? (
        createType === null ? (
          // 타입 선택 화면
          <TypeChooser
            onSelect={(type) => setCreateType(type)}
            onCancel={() => { setMode('detail'); setCreateType(null); }}
          />
        ) : createType === 'quick' ? (
          <QuickNoteForm
            onSave={handleCreateSaved}
            onCancel={() => { setMode('detail'); setCreateType(null); }}
            projects={projects}
            onCreateProject={handleCreateProject}
            defaultProjectId={projectFilter}
          />
        ) : (
          <NoteForm
            defaultNoteType={createType}
            onSave={handleCreateSaved}
            onCancel={() => { setMode('detail'); setCreateType(null); }}
            projects={projects}
            onCreateProject={handleCreateProject}
            defaultProjectId={projectFilter}
          />
        )
      ) : mode === 'edit' && selectedNote ? (
        <NoteForm
          key={selectedNote.id}
          editNote={selectedNote}
          onSave={handleEditSaved}
          onCancel={() => setMode('detail')}
          projects={projects}
          onCreateProject={handleCreateProject}
        />
      ) : notes.length > 0 ? (
        <NoteDetail
          note={selectedNote}
          onEdit={() => setMode('edit')}
          onDelete={handleDelete}
          isAnalyzing={!!selectedNote && analyzingNoteIds.has(selectedNote.id)}
          onRetryAnalysis={selectedNote ? () => runAiAnalysis(selectedNote.id, {
            noteType: selectedNote.noteType,
            rawContent: selectedNote.rawContent,
            problem: selectedNote.problem,
            solution: selectedNote.solution,
            understanding: selectedNote.understanding,
            whatIBuilt: selectedNote.whatIBuilt,
            learnings: selectedNote.learnings,
            source: selectedNote.source,
            codeSnippet: selectedNote.codeSnippet,
          }) : undefined}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: '#475569' }}>
          <p>
            {skillTagFilter
              ? `No notes tagged "${skillTagFilter}" yet.`
              : topicTagFilter
                ? `No notes tagged "${topicTagFilter}" yet.`
                : filterProject
                  ? 'No notes in this project yet.'
                  : 'No notes yet.'}
          </p>
          <button
            onClick={() => { setMode('create'); setCreateType(null); }}
            className="px-5 py-2 text-[13px] font-semibold rounded-lg cursor-pointer border-none hover:opacity-90 active:scale-[0.98]"
            style={{
              background: '#6366f1',
              color: '#fff',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
          >
            Write your first note
          </button>
        </div>
      )}
    </>
  );
};

// --- 타입 선택 화면 ---

const TYPE_OPTIONS = [
  {
    type: 'quick' as const,
    label: 'Quick',
    description: 'Jot down a quick thought',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.08)',
    border: 'rgba(167, 139, 250, 0.15)',
  },
  {
    type: 'debug' as const,
    label: 'Debug',
    description: 'Record a bug you fixed',
    color: '#a84370',
    bg: 'rgba(168, 67, 112, 0.08)',
    border: 'rgba(168, 67, 112, 0.15)',
  },
  {
    type: 'learning' as const,
    label: 'Build',
    description: 'Capture what you learned building something',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.08)',
    border: 'rgba(56, 189, 248, 0.15)',
  },
];

const TypeChooser = ({ onSelect, onCancel }: {
  onSelect: (type: 'quick' | 'debug' | 'learning') => void;
  onCancel: () => void;
}) => (
  <main className="flex-1 h-screen overflow-y-auto" style={{ background: '#0b1120' }}>
    <div className="max-w-[640px] mx-auto px-5 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-[20px] font-semibold m-0 tracking-[-0.01em]"
          style={{ color: '#f1f5f9' }}
        >
          New note
        </h1>
        <button
          onClick={onCancel}
          className="text-[12px] cursor-pointer border-none bg-transparent hover:opacity-80"
          style={{ color: '#4b5563', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
      </div>

      <p className="text-[13px] mb-6" style={{ color: '#64748b' }}>
        Choose a note type
      </p>

      <div className="flex flex-col gap-3">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className="w-full text-left rounded-xl cursor-pointer hover:opacity-90 active:scale-[0.99]"
            style={{
              background: opt.bg,
              border: `1px solid ${opt.border}`,
              padding: '18px 20px',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
          >
            <div className="text-[14px] font-semibold mb-1" style={{ color: opt.color }}>
              {opt.label}
            </div>
            <div className="text-[12px]" style={{ color: '#94a3b8' }}>
              {opt.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  </main>
);

const NotesPageWrapper = () => (
  <Suspense fallback={
    <div className="flex-1 flex items-center justify-center" style={{ color: '#475569' }}>
      Loading...
    </div>
  }>
    <NotesPage />
  </Suspense>
);

export default NotesPageWrapper;
