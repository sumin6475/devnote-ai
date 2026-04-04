import type { Note } from "@/data/mockNotes";
import { mockProjects } from "@/data/mockNotes";
import { format } from "date-fns";
import { Calendar, FolderOpen, Lightbulb, Tag, Sparkles } from "lucide-react";

interface NoteDetailProps {
  note: Note | null;
}

const difficultyLabels = ["", "Beginner", "Easy", "Medium", "Hard", "Expert"];

const tagColorVariants = [
  // Indigo
  { bg: "rgba(99, 102, 241, 0.12)", color: "#a5b4fc", border: "rgba(99, 102, 241, 0.25)" },
  // Teal
  { bg: "rgba(20, 184, 166, 0.12)", color: "#5eead4", border: "rgba(20, 184, 166, 0.25)" },
  // Amber
  { bg: "rgba(245, 158, 11, 0.12)", color: "#fcd34d", border: "rgba(245, 158, 11, 0.25)" },
];

function getTagColor(index: number) {
  return tagColorVariants[index % tagColorVariants.length];
}

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
    <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin bg-[hsl(var(--note-detail-bg,var(--background)))]">
      {/* Header */}
      <div className="px-6 py-4">
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
          <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#a5b4fc" }}>
            {note.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 px-6 py-5">
        {/* Problem */}
        <div className="border-none rounded-none rounded-r-[10px] p-[14px_18px]" style={{ background: "rgba(183, 28, 28, 0.08)", borderLeft: "3px solid #b71c1c" }}>
          <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "#ef4444" }}>
            Problem
          </h4>
          <p className="text-sm leading-relaxed text-foreground">{note.problem}</p>
        </div>

        {/* Solution */}
        <div className="border-none rounded-none rounded-r-[10px] p-[14px_18px]" style={{ background: "rgba(0, 98, 57, 0.08)", borderLeft: "3px solid #006239" }}>
          <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "#22c55e" }}>
            Solution
          </h4>
          <p className="text-sm leading-relaxed text-foreground">{note.solution}</p>
        </div>

        {/* Understanding */}
        <div className="border-none rounded-none rounded-r-[10px] p-[14px_18px]" style={{ background: "rgba(99, 102, 241, 0.06)", borderLeft: "3px solid #6366f1" }}>
          <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "#818cf8" }}>
            Understanding
          </h4>
          <p className="text-sm leading-relaxed text-foreground">{note.understanding}</p>
        </div>

        {/* Code Snippet */}
        {note.codeSnippet && (
          <div className="overflow-hidden rounded-[10px]" style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(148, 163, 184, 0.08)" }}>
            <div className="px-5 py-2.5 text-xs font-medium" style={{ color: "#64748b" }}>
              Code Snippet
            </div>
            <pre className="overflow-x-auto px-5 pb-4 font-mono" style={{ fontSize: "12.5px", lineHeight: "1.7", color: "#94a3b8" }}>
              <code>{note.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* AI Context Section */}
        <div className="space-y-4 rounded-[12px] p-[18px_22px]" style={{ background: "rgba(99, 102, 241, 0.04)", border: "1px solid rgba(99, 102, 241, 0.08)" }}>
          <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: "#6366f1" }}>
            <Sparkles className="h-3.5 w-3.5" />
            AI Context
          </h4>

          {/* Tags */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag, i) => {
                const c = getTagColor(i);
                return (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                  >
                    {tag}
                  </span>
                );
              })}
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
                <div key={concept.name} className="rounded-md p-3" style={{ background: "rgba(99, 102, 241, 0.06)" }}>
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
