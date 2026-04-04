import { cn } from "@/lib/utils";
import type { Note } from "@/data/mockNotes";
import { format } from "date-fns";

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  searchQuery?: string;
}

const difficultyColors: Record<number, string> = {
  1: "bg-[hsl(var(--difficulty-1))]",
  2: "bg-[hsl(var(--difficulty-2))]",
  3: "bg-[hsl(var(--difficulty-3))]",
  4: "bg-[hsl(var(--difficulty-4))]",
  5: "bg-[hsl(var(--difficulty-5))]",
};

const tagColorVariants = [
  { bg: "rgba(99, 102, 241, 0.12)", color: "#a5b4fc", border: "rgba(99, 102, 241, 0.25)" },
  { bg: "rgba(20, 184, 166, 0.12)", color: "#5eead4", border: "rgba(20, 184, 166, 0.25)" },
  { bg: "rgba(245, 158, 11, 0.12)", color: "#fcd34d", border: "rgba(245, 158, 11, 0.25)" },
];

const NoteList = ({ notes, selectedNoteId, onSelectNote, searchQuery }: NoteListProps) => {
  const filteredNotes = searchQuery
    ? notes.filter(
        (n) =>
          n.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.solution.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : notes;

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          All Notes{" "}
          <span className="font-normal text-muted-foreground">({filteredNotes.length})</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">노트가 없습니다</p>
            {searchQuery && (
              <p className="mt-1 text-xs text-muted-foreground">검색어를 변경해보세요</p>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={cn(
                "flex w-full flex-col gap-1.5 rounded-[10px] px-3 py-3 text-left transition-colors mb-1",
                selectedNoteId === note.id
                  ? "border"
                  : "border border-transparent hover:bg-note-list-hover"
              )}
              style={
                selectedNoteId === note.id
                  ? { background: "rgba(99, 102, 241, 0.07)", borderColor: "rgba(99, 102, 241, 0.2)" }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-sm font-medium text-foreground">{note.problem}</p>
                <div className={cn("mt-1 h-2 w-2 flex-shrink-0 rounded-full", difficultyColors[note.difficulty])} />
              </div>
              <p className="line-clamp-1 text-xs text-muted-foreground">{note.solution}</p>
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map((tag, i) => {
                    const c = tagColorVariants[i % tagColorVariants.length];
                    return (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                  {note.tags.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{note.tags.length - 3}</span>
                  )}
                </div>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {format(new Date(note.createdAt), "MM/dd")}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NoteList;
