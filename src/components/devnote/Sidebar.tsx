import { BookOpen, Search, FolderOpen, Map, Code2, BarChart3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "notes" | "search" | "projects";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onNewNote: () => void;
}

const navItems = [
  { id: "notes" as View, label: "Notes", icon: BookOpen },
  { id: "search" as View, label: "Search", icon: Search },
  { id: "projects" as View, label: "Projects", icon: FolderOpen },
];

const comingSoon = [
  { label: "Skill Map", icon: Map },
  { label: "Dashboard", icon: BarChart3 },
  { label: "Code Review", icon: Code2 },
];

const Sidebar = ({ currentView, onViewChange, onNewNote }: SidebarProps) => {
  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <BookOpen className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-base font-bold text-foreground">DevNote</span>
      </div>

      {/* New Note Button */}
      <div className="px-3 pb-2">
        <button
          onClick={onNewNote}
          className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              currentView === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}

        <div className="!mt-6">
          <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Coming Soon
          </p>
          {comingSoon.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-xs text-muted-foreground">DevNote v1.0 MVP</p>
      </div>
    </aside>
  );
};

export default Sidebar;
