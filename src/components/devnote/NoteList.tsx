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
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          All Notes{" "}
          <span className="font-normal text-muted-foreground">({filteredNotes.length})</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
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
                "flex w-full flex-col gap-1.5 border-b border-border px-4 py-3 text-left transition-colors",
                selectedNoteId === note.id
                  ? "bg-note-list-active"
                  : "hover:bg-note-list-hover"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-sm font-medium text-foreground">{note.problem}</p>
                <div className={cn("mt-1 h-2 w-2 flex-shrink-0 rounded-full", difficultyColors[note.difficulty])} />
              </div>
              <p className="line-clamp-1 text-xs text-muted-foreground">{note.solution}</p>
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-tag-bg text-tag-text"
                    >
                      {tag}
                    </span>
                  ))}
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
