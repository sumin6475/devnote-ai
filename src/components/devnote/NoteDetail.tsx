import type { Note } from "@/data/mockNotes";
import { mockProjects } from "@/data/mockNotes";
import { format } from "date-fns";
import { Calendar, FolderOpen, Lightbulb, Tag } from "lucide-react";

interface NoteDetailProps {
  note: Note | null;
}

const difficultyLabels = ["", "Beginner", "Easy", "Medium", "Hard", "Expert"];

const NoteDetail = ({ note }: NoteDetailProps) => {
  if (!note) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Lightbulb className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">노트를 선택하세요</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          왼쪽 목록에서 노트를 선택하거나<br />새 노트를 작성해보세요
        </p>
      </div>
    );
  }

  const project = mockProjects.find((p) => p.id === note.projectId);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {project && (
            <span className="flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              {project.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(note.createdAt), "yyyy.MM.dd HH:mm")}
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
            {note.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 px-6 py-5">
        {/* Problem */}
        <div className="rounded-lg border-l-4 border-l-problem-border bg-problem-bg p-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-problem">
            🔴 Problem
          </h4>
          <p className="text-sm leading-relaxed text-foreground">{note.problem}</p>
        </div>

        {/* Solution */}
        <div className="rounded-lg border-l-4 border-l-solution-border bg-solution-bg p-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-solution">
            🟢 Solution
          </h4>
          <p className="text-sm leading-relaxed text-foreground">{note.solution}</p>
        </div>

        {/* Understanding */}
        <div className="rounded-lg border-l-4 border-l-understanding-border bg-understanding-bg p-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-understanding">
            🔵 Understanding
          </h4>
          <p className="text-sm leading-relaxed text-foreground">{note.understanding}</p>
        </div>

        {/* Code Snippet */}
        {note.codeSnippet && (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
              Code Snippet
            </div>
            <pre className="overflow-x-auto bg-[hsl(var(--code-bg))] p-4 text-xs leading-relaxed font-mono text-foreground">
              <code>{note.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* AI Context Section */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            ✨ AI Context
          </h4>

          {/* Tags */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-tag-bg px-2 py-1 text-xs font-medium text-tag-text"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Related Concepts */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lightbulb className="h-3 w-3" />
              Related Concepts
            </div>
            <div className="space-y-2">
              {note.relatedConcepts.map((concept) => (
                <div key={concept.name} className="rounded-md bg-muted p-3">
                  <p className="text-xs font-semibold text-foreground">{concept.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{concept.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Difficulty:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((d) => (
                <div
                  key={d}
                  className={`h-2 w-5 rounded-full ${
                    d <= note.difficulty ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-foreground">
              {difficultyLabels[note.difficulty]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
