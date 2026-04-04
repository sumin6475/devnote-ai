import { useState, useMemo } from "react";
import Sidebar from "@/components/devnote/Sidebar";
import NoteList from "@/components/devnote/NoteList";
import NoteDetail from "@/components/devnote/NoteDetail";
import NoteForm from "@/components/devnote/NoteForm";
import SearchPanel from "@/components/devnote/SearchPanel";
import ProjectList from "@/components/devnote/ProjectList";
import { mockNotes, mockProjects } from "@/data/mockNotes";
import type { Note } from "@/data/mockNotes";

type View = "notes" | "search" | "projects";

const Index = () => {
  const [view, setView] = useState<View>("notes");
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(mockNotes[0]?.id ?? null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (view === "projects" && selectedProjectId) {
      result = result.filter((n) => n.projectId === selectedProjectId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes, view, selectedProjectId]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  const handleNewNote = () => {
    setIsCreating(true);
    setSelectedNoteId(null);
  };

  const handleSaveNote = (input: {
    problem: string;
    solution: string;
    understanding: string;
    codeSnippet?: string;
    projectId?: string;
  }) => {
    // Mock AI analysis
    const mockTags = ["React", "학습", "개발"];
    const newNote: Note = {
      id: `n${Date.now()}`,
      ...input,
      tags: mockTags,
      category: "Frontend > General",
      relatedConcepts: [{ name: "관련 개념", why: "AI가 분석한 관련 개념입니다" }],
      difficulty: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setIsCreating(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background dark">
      <Sidebar currentView={view} onViewChange={setView} onNewNote={handleNewNote} />

      {/* Middle Column */}
      <div className="flex h-full w-[340px] flex-col border-r border-border bg-note-list-bg">
        {view === "search" && (
          <SearchPanel query={searchQuery} onQueryChange={setSearchQuery} />
        )}
        {view === "projects" && (
          <ProjectList
            projects={mockProjects}
            notes={notes}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
        )}
        <div className="flex-1 overflow-hidden">
          <NoteList
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={(id) => {
              setSelectedNoteId(id);
              setIsCreating(false);
            }}
            searchQuery={view === "search" ? searchQuery : undefined}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-1 flex-col bg-background">
        {isCreating ? (
          <NoteForm onSave={handleSaveNote} onCancel={() => setIsCreating(false)} />
        ) : (
          <NoteDetail note={selectedNote} />
        )}
      </div>
    </div>
  );
};

export default Index;
