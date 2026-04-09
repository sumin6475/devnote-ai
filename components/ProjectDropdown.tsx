'use client';

// 프로젝트 선택 드롭다운 — Quick Input + NoteForm에서 재사용

import { useState, useRef, useEffect } from 'react';
import type { Project } from '@/lib/types';

type ProjectDropdownProps = {
  selectedProjectId: string | null;
  onSelect: (projectId: string | null) => void;
  projects: Project[];
  onCreateProject: (name: string) => Promise<Project>;
};

const ProjectDropdown = ({
  selectedProjectId,
  onSelect,
  projects,
  onCreateProject,
}: ProjectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // 새 프로젝트 생성 모드 시 input 포커스
  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const project = await onCreateProject(newName.trim());
    onSelect(project.id);
    setNewName('');
    setCreating(false);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* 트리거 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-[6px] text-[12px] font-medium px-[10px] py-[6px] rounded-lg cursor-pointer hover:opacity-80"
        style={{
          background: selectedProject ? 'rgba(148,163,184,0.08)' : 'transparent',
          border: '1px solid rgba(148,163,184,0.12)',
          color: selectedProject ? '#94a3b8' : '#4b5563',
          fontFamily: 'inherit',
        }}
      >
        {selectedProject && (
          <span
            className="rounded-full shrink-0"
            style={{ width: 6, height: 6, background: selectedProject.color }}
          />
        )}
        {selectedProject ? selectedProject.name : 'No project'}
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5 }}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* 드롭다운 */}
      {open && (
        <div
          className="absolute bottom-full mb-1 left-0 rounded-lg py-1 z-20 min-w-[200px]"
          style={{
            background: '#1e293b',
            border: '1px solid rgba(148,163,184,0.12)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* No project 옵션 */}
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[12px] cursor-pointer border-none hover:opacity-80"
            style={{
              background: !selectedProjectId ? 'rgba(99,102,241,0.08)' : 'transparent',
              color: '#64748b',
              fontFamily: 'inherit',
            }}
          >
            No project
          </button>

          {/* 구분선 */}
          {projects.length > 0 && (
            <div className="my-1" style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }} />
          )}

          {/* 프로젝트 목록 */}
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p.id); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2 cursor-pointer border-none hover:opacity-80"
              style={{
                background: selectedProjectId === p.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                color: '#cbd5e1',
                fontFamily: 'inherit',
              }}
            >
              <span
                className="rounded-full shrink-0"
                style={{ width: 6, height: 6, background: p.color }}
              />
              {p.name}
            </button>
          ))}

          {/* 구분선 + New project */}
          <div className="mt-1" style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }} />
          {creating ? (
            <div className="px-3 py-2">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                }}
                placeholder="Project name..."
                className="w-full text-[12px] outline-none"
                style={{
                  background: 'rgba(99,102,241,0.05)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  color: '#e2e8f0',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full text-left px-3 py-2 text-[12px] cursor-pointer border-none hover:opacity-80"
              style={{ background: 'transparent', color: '#818cf8', fontFamily: 'inherit' }}
            >
              + New project
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDropdown;
