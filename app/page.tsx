'use client';

// DevNote MVP 메인 페이지 — 3컬럼 레이아웃 (Sidebar + NoteList + NoteDetail/NoteForm)
// 생성 / 수정 / 삭제 지원

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import NoteList from '@/components/NoteList';
import NoteDetail from '@/components/NoteDetail';
import NoteForm from '@/components/NoteForm';
import type { Note } from '@/lib/types';

// 오른쪽 영역 상태: 상세 보기 / 새 노트 생성 / 수정
type RightPanelMode = 'detail' | 'create' | 'edit';

const DevNotePage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RightPanelMode>('detail');

  // 노트 목록 fetch
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error(`서버 에러 (${res.status}). 터미널 로그를 확인하세요.`);
        }
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setNotes(data.data);
      } catch (err) {
        console.error('fetch 실패:', err);
        setError(err instanceof Error ? err.message : '노트를 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const selectedNote = notes[selectedIndex] ?? null;

  // 새 노트 저장 → 목록 맨 앞에 추가
  const handleCreateSaved = (newNote: Note) => {
    setNotes((prev) => [newNote, ...prev]);
    setSelectedIndex(0);
    setMode('detail');
  };

  // 수정 저장 → 해당 노트를 업데이트된 데이터로 교체
  const handleEditSaved = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
    setMode('detail');
  };

  // 삭제 완료 → 목록에서 제거
  const handleDelete = (deletedId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== deletedId));
    // 선택 인덱스 보정
    if (selectedIndex >= notes.length - 1) {
      setSelectedIndex(Math.max(0, notes.length - 2));
    }
    setMode('detail');
  };

  // 오른쪽 영역에 폼이 보이는지
  const isFormMode = mode === 'create' || mode === 'edit';

  return (
    <div
      className="flex h-screen w-full overflow-hidden text-[14px]"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: '#0f172a',
        color: '#e2e8f0',
      }}
    >
      <Sidebar
        onNewNote={() => setMode('create')}
        noteCount={notes.length}
      />

      {/* 로딩/에러 상태 */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center" style={{ color: '#475569' }}>
          Loading...
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center" style={{ color: '#ef4444' }}>
          {error}
        </div>
      ) : (
        <>
          {/* 노트가 있으면 항상 리스트 표시 */}
          {notes.length > 0 && (
            <NoteList
              notes={notes}
              selectedIndex={isFormMode ? -1 : selectedIndex}
              onSelect={(i) => {
                setSelectedIndex(i);
                setMode('detail');
              }}
            />
          )}

          {/* 오른쪽 영역 */}
          {mode === 'create' ? (
            <NoteForm
              onSave={handleCreateSaved}
              onCancel={() => setMode('detail')}
            />
          ) : mode === 'edit' && selectedNote ? (
            <NoteForm
              key={selectedNote.id}
              editNote={selectedNote}
              onSave={handleEditSaved}
              onCancel={() => setMode('detail')}
            />
          ) : notes.length > 0 ? (
            <NoteDetail
              note={selectedNote}
              onEdit={() => setMode('edit')}
              onDelete={handleDelete}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: '#475569' }}>
              <p>아직 노트가 없습니다.</p>
              <button
                onClick={() => setMode('create')}
                className="px-5 py-2 text-[13px] font-semibold rounded-lg cursor-pointer border-none hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: '#6366f1',
                  color: '#fff',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
              >
                Write your first note
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DevNotePage;
