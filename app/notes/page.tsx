'use client';

// 노트 목록 페이지 — NoteList + NoteDetail/NoteForm (2컬럼)
// Sidebar는 layout.tsx에서 렌더링. 프로젝트 필터: /notes?project=:id

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NoteList from '@/components/NoteList';
import NoteDetail from '@/components/NoteDetail';
import NoteForm from '@/components/NoteForm';
import type { Note, Project } from '@/lib/types';

type RightPanelMode = 'detail' | 'create' | 'edit';

const NotesPage = () => {
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get('project');

  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RightPanelMode>('detail');
  const [analyzingNoteIds, setAnalyzingNoteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notesUrl = projectFilter
          ? `/api/notes?project=${projectFilter}`
          : '/api/notes';

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
  }, [projectFilter]);

  const selectedNote = notes[selectedIndex] ?? null;
  const filterProject = projects.find((p) => p.id === projectFilter);

  const runAiAnalysis = async (noteId: string, noteData: {
    noteType: string;
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

    runAiAnalysis(newNote.id, {
      noteType: newNote.noteType,
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
          }}
          filterProject={filterProject}
          onNewNote={() => setMode('create')}
        />
      )}

      {mode === 'create' ? (
        <NoteForm
          onSave={handleCreateSaved}
          onCancel={() => setMode('detail')}
          projects={projects}
          onCreateProject={handleCreateProject}
          defaultProjectId={projectFilter}
        />
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
          <p>{filterProject ? 'No notes in this project yet.' : 'No notes yet.'}</p>
          <button
            onClick={() => setMode('create')}
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
