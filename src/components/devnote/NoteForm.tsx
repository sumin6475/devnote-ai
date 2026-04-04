import { useState } from "react";
import { X } from "lucide-react";
import type { Note } from "@/data/mockNotes";
import { mockProjects } from "@/data/mockNotes";

interface NoteFormProps {
  onSave: (note: Omit<Note, "id" | "tags" | "category" | "relatedConcepts" | "difficulty" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const NoteForm = ({ onSave, onCancel }: NoteFormProps) => {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [understanding, setUnderstanding] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [projectId, setProjectId] = useState("");
  const [showCode, setShowCode] = useState(false);

  const canSubmit = problem.trim() && solution.trim() && understanding.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSave({
      problem: problem.trim(),
      solution: solution.trim(),
      understanding: understanding.trim(),
      codeSnippet: codeSnippet.trim() || undefined,
      projectId: projectId || undefined,
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">New Note</h2>
        <button onClick={onCancel} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 px-6 py-5">
        {/* Project Select */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Project (optional)</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select project...</option>
            {mockProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Problem */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-problem">
            🔴 Problem
          </label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="무엇이 문제였는지 설명해주세요..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-problem/30 focus:border-problem-border resize-none"
          />
        </div>

        {/* Solution */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-solution">
            🟢 Solution
          </label>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="어떻게 해결했는지 작성해주세요..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-solution/30 focus:border-solution-border resize-none"
          />
        </div>

        {/* Understanding */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-understanding">
            🔵 Understanding
          </label>
          <textarea
            value={understanding}
            onChange={(e) => setUnderstanding(e.target.value)}
            placeholder="왜 그런 건지 이해한 내용을 작성해주세요..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-understanding-border resize-none"
          />
        </div>

        {/* Code Snippet Toggle */}
        {!showCode ? (
          <button
            onClick={() => setShowCode(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Add Code Snippet
          </button>
        ) : (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Code Snippet (optional)
            </label>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="관련 코드를 붙여넣으세요..."
              rows={5}
              className="w-full rounded-lg border border-input bg-[hsl(var(--code-bg))] px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
        <button
          onClick={onCancel}
          className="rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save & Analyze ✨
        </button>
      </div>
    </div>
  );
};

export default NoteForm;
