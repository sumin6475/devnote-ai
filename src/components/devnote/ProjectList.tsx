import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, Note } from "@/data/mockNotes";

interface ProjectListProps {
  projects: Project[];
  notes: Note[];
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
}

const ProjectList = ({ projects, notes, selectedProjectId, onSelectProject }: ProjectListProps) => {
  const getCount = (projectId: string) => notes.filter((n) => n.projectId === projectId).length;

  return (
    <div className="border-b border-border">
      <div className="px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projects</h3>
      </div>
      <button
        onClick={() => onSelectProject(null)}
        className={cn(
          "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors",
          selectedProjectId === null ? "bg-note-list-active text-foreground" : "text-muted-foreground hover:bg-note-list-hover"
        )}
      >
        All Notes
        <span className="ml-auto text-xs">{notes.length}</span>
      </button>
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelectProject(p.id)}
          className={cn(
            "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors",
            selectedProjectId === p.id ? "bg-note-list-active text-foreground" : "text-muted-foreground hover:bg-note-list-hover"
          )}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          {p.name}
          <span className="ml-auto text-xs">{getCount(p.id)}</span>
        </button>
      ))}
    </div>
  );
};

export default ProjectList;
