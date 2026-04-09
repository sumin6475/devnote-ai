'use client';

// 프로젝트 목록 페이지 — 카드 그리드 + 생성 모달 + 수정/삭제

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/types';
import { formatRelativeTime } from '@/lib/types';

const PROJECT_COLORS = [
  '#818CF8', '#5DCAA5', '#F0997B', '#ED93B1',
  '#85B7EB', '#97C459', '#FAC775',
];

const ProjectsPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalColor, setModalColor] = useState(PROJECT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  // 삭제 확인
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 카드 메뉴
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 생성 모달 열기
  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setModalName('');
    setModalDesc('');
    setModalColor(PROJECT_COLORS[projects.length % PROJECT_COLORS.length]);
    setShowModal(true);
  };

  // 수정 모달 열기
  const openEditModal = (p: Project) => {
    setModalMode('edit');
    setEditingId(p.id);
    setModalName(p.name);
    setModalDesc(p.description || '');
    setModalColor(p.color);
    setShowModal(true);
    setMenuOpenId(null);
  };

  // 저장 (생성 또는 수정)
  const handleSave = async () => {
    if (!modalName.trim() || saving) return;
    setSaving(true);
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modalName, description: modalDesc || null, color: modalColor }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setProjects((prev) => [data.data, ...prev]);
      } else if (editingId) {
        const res = await fetch(`/api/projects/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modalName, description: modalDesc || null, color: modalColor }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setProjects((prev) => prev.map((p) => (p.id === editingId ? { ...data.data, noteCount: p.noteCount } : p)));
      }
      setShowModal(false);
    } catch (err) {
      console.error('저장 실패:', err);
    } finally {
      setSaving(false);
    }
  };

  // 삭제
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const deleteProject = deleteConfirmId ? projects.find((p) => p.id === deleteConfirmId) : null;

  return (
    <main className="flex-1 overflow-y-auto" style={{ background: '#0b1120' }}>
      <div className="max-w-[720px] mx-auto px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-semibold tracking-[-0.02em]" style={{ color: '#F8FAFC' }}>
            Projects
          </h1>
          <button
            onClick={openCreateModal}
            className="text-[13px] font-medium px-4 py-[7px] rounded-lg cursor-pointer hover:opacity-80"
            style={{
              background: 'transparent',
              border: '1px solid rgba(129,140,248,0.3)',
              color: '#A5B4FC',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s',
            }}
          >
            + New project
          </button>
        </div>

        {/* 로딩 */}
        {loading ? (
          <div className="text-center py-16" style={{ color: '#475569' }}>Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#475569' }}>
            <p className="mb-4">No projects yet.</p>
            <button
              onClick={openCreateModal}
              className="text-[13px] font-semibold px-5 py-2 rounded-lg cursor-pointer border-none hover:opacity-90"
              style={{ background: '#6366f1', color: '#fff', fontFamily: 'inherit' }}
            >
              Create your first project
            </button>
          </div>
        ) : (
          /* 카드 그리드 */
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {projects.map((p) => (
              <div
                key={p.id}
                className="relative rounded-xl cursor-pointer hover:border-[rgba(148,163,184,0.2)]"
                style={{
                  background: '#1E293B',
                  border: '1px solid rgba(148,163,184,0.08)',
                  padding: 20,
                  transition: 'border-color 0.15s',
                }}
                onClick={() => router.push(`/notes?project=${p.id}`)}
              >
                {/* ··· 메뉴 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === p.id ? null : p.id);
                  }}
                  className="absolute top-3 right-3 text-[16px] px-[6px] py-0 rounded cursor-pointer border-none hover:opacity-80"
                  style={{ background: 'transparent', color: '#475569', fontFamily: 'inherit' }}
                >
                  ···
                </button>

                {/* 카드 메뉴 드롭다운 */}
                {menuOpenId === p.id && (
                  <div
                    className="absolute top-8 right-3 rounded-lg py-1 z-10"
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(148,163,184,0.12)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      minWidth: 120,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEditModal(p)}
                      className="w-full text-left px-3 py-2 text-[12px] cursor-pointer border-none hover:opacity-80"
                      style={{ background: 'transparent', color: '#94a3b8', fontFamily: 'inherit' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setDeleteConfirmId(p.id); setMenuOpenId(null); }}
                      className="w-full text-left px-3 py-2 text-[12px] cursor-pointer border-none hover:opacity-80"
                      style={{ background: 'transparent', color: '#ef4444', fontFamily: 'inherit' }}
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* 카드 내용 */}
                <div className="flex items-center gap-[8px] mb-2">
                  <span
                    className="rounded-full shrink-0"
                    style={{ width: 8, height: 8, background: p.color }}
                  />
                  <span className="text-[15px] font-semibold" style={{ color: '#F1F5F9' }}>
                    {p.name}
                  </span>
                </div>
                <div
                  className="text-[12px] leading-[1.5] mb-3"
                  style={{
                    color: '#94A3B8',
                    fontStyle: p.description ? 'normal' : 'italic',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {p.description || 'No description'}
                </div>
                <div className="text-[11px]" style={{ color: '#64748B' }} suppressHydrationWarning>
                  {p.noteCount} {p.noteCount === 1 ? 'note' : 'notes'}
                  {' · '}
                  Updated {formatRelativeTime(p.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 생성/수정 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(11,17,32,0.85)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="rounded-xl p-6 w-full max-w-[380px]"
            style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[15px] font-semibold mb-5" style={{ color: '#f1f5f9' }}>
              {modalMode === 'create' ? 'New project' : 'Edit project'}
            </h3>

            {/* Name */}
            <label className="text-[11px] font-semibold uppercase tracking-[0.05em] block mb-[6px]" style={{ color: '#64748b' }}>
              Name
            </label>
            <input
              value={modalName}
              onChange={(e) => setModalName(e.target.value)}
              placeholder="Project name"
              className="w-full text-[13px] outline-none mb-4"
              style={{
                background: 'rgba(99,102,241,0.04)',
                border: '1px solid rgba(148,163,184,0.12)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#e2e8f0',
                fontFamily: 'inherit',
              }}
            />

            {/* Description */}
            <label className="text-[11px] font-semibold uppercase tracking-[0.05em] block mb-[6px]" style={{ color: '#64748b' }}>
              Description <span className="font-normal normal-case" style={{ color: '#334155' }}>(optional)</span>
            </label>
            <input
              value={modalDesc}
              onChange={(e) => setModalDesc(e.target.value)}
              placeholder="What is this project about?"
              className="w-full text-[13px] outline-none mb-4"
              style={{
                background: 'rgba(148,163,184,0.04)',
                border: '1px solid rgba(148,163,184,0.1)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#e2e8f0',
                fontFamily: 'inherit',
              }}
            />

            {/* Color */}
            <label className="text-[11px] font-semibold uppercase tracking-[0.05em] block mb-[8px]" style={{ color: '#64748b' }}>
              Color
            </label>
            <div className="flex gap-[10px] mb-6">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setModalColor(c)}
                  className="rounded-full cursor-pointer border-none"
                  style={{
                    width: 24,
                    height: 24,
                    background: c,
                    outline: modalColor === c ? '2px solid #f1f5f9' : '2px solid transparent',
                    outlineOffset: 2,
                    transition: 'outline-color 0.1s',
                  }}
                />
              ))}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-[9px] text-[13px] font-medium rounded-lg cursor-pointer hover:opacity-80"
                style={{
                  background: 'rgba(148,163,184,0.08)',
                  border: '1px solid rgba(148,163,184,0.1)',
                  color: '#94a3b8',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!modalName.trim() || saving}
                className="flex-1 py-[9px] text-[13px] font-medium rounded-lg cursor-pointer border-none hover:opacity-90"
                style={{
                  background: modalName.trim() ? '#6366f1' : '#334155',
                  color: modalName.trim() ? '#fff' : '#64748b',
                  fontFamily: 'inherit',
                }}
              >
                {saving ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteProject && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(11,17,32,0.85)' }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="rounded-xl p-6 max-w-[340px] w-full"
            style={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[15px] font-semibold m-0 mb-2" style={{ color: '#f1f5f9' }}>
              Delete &quot;{deleteProject.name}&quot;?
            </h3>
            <p className="text-[13px] m-0 mb-5 leading-[1.5]" style={{ color: '#64748b' }}>
              {deleteProject.noteCount > 0
                ? `${deleteProject.noteCount} notes will be kept but unlinked from this project.`
                : 'This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-[9px] text-[13px] font-medium rounded-lg cursor-pointer hover:opacity-80"
                style={{
                  background: 'rgba(148,163,184,0.08)',
                  border: '1px solid rgba(148,163,184,0.1)',
                  color: '#94a3b8',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteProject.id)}
                className="flex-1 py-[9px] text-[13px] font-medium rounded-lg cursor-pointer border-none hover:opacity-80"
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                  fontFamily: 'inherit',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProjectsPage;
