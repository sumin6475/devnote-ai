'use client';

// 개별 파싱된 노트 카드 — 보기/수정/삭제

import { useState } from 'react';
import { X, Pencil, Check } from 'lucide-react';
import { SkillTag, TopicTag } from '@/components/ui/Tag';
import ProjectDropdown from '@/components/ProjectDropdown';
import type { Project } from '@/lib/types';

export type ParsedNote = {
  title: string;
  problem: string;
  solution: string;
  understanding: string;
  skill_tags: string[];
  topic_tags: string[];
  projectId: string | null;
};

type ParsedNoteCardProps = {
  note: ParsedNote;
  index: number;
  projects: Project[];
  onCreateProject: (name: string) => Promise<Project>;
  onUpdate: (index: number, note: ParsedNote) => void;
  onDelete: (index: number) => void;
};

const ParsedNoteCard = ({ note, index, projects, onCreateProject, onUpdate, onDelete }: ParsedNoteCardProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ParsedNote>(note);

  const handleSaveEdit = () => {
    onUpdate(index, draft);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setDraft(note);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className="rounded-xl p-5 backdrop-blur-md"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 15px rgba(0,0,0,0.2)' }}
      >
        {/* Title */}
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full text-[15px] font-semibold outline-none mb-3"
          style={{
            background: 'rgba(15,23,42,0.5)',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#F1F5F9',
            fontFamily: 'inherit',
          }}
        />
        {/* P/S/U fields */}
        {(['problem', 'solution', 'understanding'] as const).map((field) => (
          <div key={field} className="mb-3">
            <label className="text-[11px] uppercase tracking-[0.05em] block mb-1" style={{ color: '#94A3B8' }}>
              {field}
            </label>
            <textarea
              value={draft[field]}
              onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
              rows={2}
              className="w-full text-[13px] resize-y outline-none"
              style={{
                background: 'rgba(15,23,42,0.5)',
                border: '1px solid rgba(148,163,184,0.1)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#E2E8F0',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
            />
          </div>
        ))}
        {/* Project */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] uppercase tracking-[0.05em]" style={{ color: '#94A3B8' }}>Project</span>
          <ProjectDropdown
            selectedProjectId={draft.projectId}
            onSelect={(id) => setDraft({ ...draft, projectId: id })}
            projects={projects}
            onCreateProject={onCreateProject}
          />
        </div>
        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancelEdit}
            className="text-[12px] px-3 py-[5px] rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.1)', color: '#94a3b8', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="text-[12px] px-3 py-[5px] rounded-lg cursor-pointer border-none hover:opacity-80"
            style={{ background: '#6366f1', color: '#fff', fontFamily: 'inherit' }}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5 relative group backdrop-blur-md"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 15px rgba(0,0,0,0.2)' }}
    >
      {/* Actions — 호버 시 표시 */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100" style={{ transition: 'opacity 0.15s' }}>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center justify-center rounded-md cursor-pointer border-none hover:opacity-70"
          style={{ width: 28, height: 28, background: 'rgba(148,163,184,0.08)' }}
        >
          <Pencil style={{ width: 14, height: 14, color: '#94A3B8' }} />
        </button>
        <button
          onClick={() => onDelete(index)}
          className="flex items-center justify-center rounded-md cursor-pointer border-none hover:opacity-70"
          style={{ width: 28, height: 28, background: 'rgba(239,68,68,0.08)' }}
        >
          <X style={{ width: 14, height: 14, color: '#EF4444' }} />
        </button>
      </div>

      {/* Title */}
      <div className="text-[15px] font-semibold mb-3 pr-16" style={{ color: '#F1F5F9' }}>
        {note.title}
      </div>

      {/* P/S/U */}
      {[
        { label: 'Problem', value: note.problem, color: '#FCA5A5', bg: 'rgba(239,68,68,0.15)' },
        { label: 'Solution', value: note.solution, color: '#86EFAC', bg: 'rgba(34,197,94,0.15)' },
        { label: 'Understanding', value: note.understanding, color: '#A5B4FC', bg: 'rgba(129,140,248,0.15)' },
      ].map((field) => (
        <div key={field.label} className="mb-2">
          <span
            className="inline-block text-[10px] font-semibold uppercase tracking-[0.04em] mb-1"
            style={{ background: field.bg, color: field.color, padding: '2px 8px', borderRadius: 3 }}
          >
            {field.label}
          </span>
          <div className="text-[13px] leading-[1.5]" style={{ color: '#CBD5E1' }}>
            {field.value}
          </div>
        </div>
      ))}

      {/* Tags */}
      <div className="flex gap-[5px] flex-wrap mt-3">
        {note.skill_tags.map((tag) => (
          <SkillTag key={tag} label={tag} />
        ))}
        {note.topic_tags.map((tag) => (
          <TopicTag key={tag} label={tag} />
        ))}
      </div>

      {/* Project */}
      {note.projectId && (
        <div className="mt-2 text-[11px]" style={{ color: '#475569' }}>
          <Check style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          {projects.find((p) => p.id === note.projectId)?.name || 'Project'}
        </div>
      )}
    </div>
  );
};

export default ParsedNoteCard;
