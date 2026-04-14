'use client';

// 스니펫 페이지 — 3패널 레이아웃: SnippetList | SnippetNote | SnippetCode
// 사이드바는 Sidebar.tsx에서 pathname 기반으로 자동 슬라이드 아웃

import { useState, useEffect } from 'react';
import SnippetList from '@/components/snippets/SnippetList';
import SnippetNote from '@/components/snippets/SnippetNote';
import SnippetCode from '@/components/snippets/SnippetCode';
import LineNumberTextarea from '@/components/ui/LineNumberTextarea';
import type { Note } from '@/lib/types';

type Mode = 'view' | 'create' | 'edit';

const SnippetsPage = () => {
  const [snippets, setSnippets] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('view');

  // 생성/편집 공용 상태
  const [editContent, setEditContent] = useState('');
  const [editCode, setEditCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const res = await fetch('/api/notes?snippets=true');
        const data = await res.json();
        if (data.success) setSnippets(data.data);
      } catch (err) {
        console.error('Snippets fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSnippets();
  }, []);

  const selectedNote = snippets[selectedIndex] ?? null;

  const handleNewSnippet = () => {
    setMode('create');
    setEditContent('');
    setEditCode('');
  };

  const handleEdit = () => {
    if (!selectedNote) return;
    // 노트 본문을 편집 필드에 프리필
    const noteText = selectedNote.rawContent
      ?? selectedNote.problem
      ?? selectedNote.whatIBuilt
      ?? '';
    setEditContent(noteText);
    setEditCode(selectedNote.codeSnippet ?? '');
    setMode('edit');
  };

  const handleCancelForm = () => {
    setMode('view');
    setEditContent('');
    setEditCode('');
  };

  const handleSave = async () => {
    if (!editCode.trim() || saving) return;
    setSaving(true);

    const isEditing = mode === 'edit' && selectedNote;

    try {
      const url = isEditing ? `/api/notes/${selectedNote.id}` : '/api/notes';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? { rawContent: editContent.trim() || null, codeSnippet: editCode }
        : {
            noteType: 'quick',
            rawContent: editContent.trim() || null,
            codeSnippet: editCode,
            skillTags: [],
            topicTags: [],
            category: '',
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (isEditing) {
        // 기존 노트 업데이트
        setSnippets((prev) => prev.map((n) => (n.id === data.data.id ? data.data : n)));
      } else {
        // 리스트 최상단에 추가
        setSnippets((prev) => [data.data, ...prev]);
        setSelectedIndex(0);
      }
      setMode('view');
      setEditContent('');
      setEditCode('');

      // 비동기 AI 태깅 (신규 생성 시에만)
      if (!isEditing) try {
        const aiRes = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            noteType: 'quick',
            rawContent: editContent.trim() || editCode,
          }),
        });
        const aiData = await aiRes.json();
        if (aiData.success) {
          const updateRes = await fetch(`/api/notes/${data.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aiData.data),
          });
          const updateData = await updateRes.json();
          if (updateData.success) {
            setSnippets((prev) => prev.map((n) => (n.id === data.data.id ? updateData.data : n)));
          }
        }
      } catch {
        // AI 태깅 실패해도 노트 저장은 완료
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: '#475569' }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <SnippetList
        notes={snippets}
        selectedIndex={mode === 'view' ? selectedIndex : -1}
        onSelect={(i) => { setSelectedIndex(i); setMode('view'); }}
        onNewSnippet={handleNewSnippet}
      />

      {mode === 'create' || mode === 'edit' ? (
        <>
          {/* 노트 입력 패널 */}
          <div
            className="flex-1 flex flex-col h-screen"
            style={{
              background: '#0b1120',
              borderRight: '1px solid rgba(148,163,184,0.06)',
            }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <h2
                className="text-[16px] font-semibold m-0"
                style={{ color: '#f1f5f9' }}
              >
                {mode === 'edit' ? 'Edit snippet' : 'New snippet'}
              </h2>
              <button
                onClick={handleCancelForm}
                className="text-[12px] cursor-pointer border-none bg-transparent hover:opacity-80"
                style={{ color: '#4b5563', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
            </div>
            <div className="flex-1 px-6 pb-6 flex flex-col">
              <label
                className="text-[11px] uppercase tracking-[0.05em] mb-2"
                style={{ color: '#64748b' }}
              >
                Note (optional)
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Describe the code, what it does, or what you learned..."
                className="flex-1 resize-none outline-none rounded-lg"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.12)',
                  padding: '14px 16px',
                  fontSize: 14,
                  color: '#F1F5F9',
                  lineHeight: 1.6,
                  fontFamily: 'inherit',
                  minHeight: 120,
                }}
              />
              <button
                onClick={handleSave}
                disabled={!editCode.trim() || saving}
                className="mt-4 w-full py-[10px] text-[13px] font-semibold rounded-lg cursor-pointer border-none hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: !editCode.trim() ? '#334155' : '#6366f1',
                  color: !editCode.trim() ? '#64748b' : '#fff',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
              >
                {saving ? 'Saving...' : mode === 'edit' ? 'Update snippet' : 'Save snippet'}
              </button>
            </div>
          </div>

          {/* 코드 입력 패널 — 라인 번호 포함 */}
          <div className="flex-1 flex flex-col h-screen" style={{ background: '#0F172A' }}>
            <div className="flex items-center px-4 pt-6 pb-3">
              <label
                className="text-[11px] uppercase tracking-[0.05em]"
                style={{ color: '#64748b' }}
              >
                Code
              </label>
            </div>
            <div className="flex-1 px-4 pb-4">
              <LineNumberTextarea
                value={editCode}
                onChange={setEditCode}
                placeholder="Paste your code here..."
                className="h-full"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <SnippetNote note={selectedNote} onEdit={handleEdit} />
          <SnippetCode note={selectedNote} />
        </>
      )}
    </>
  );
};

export default SnippetsPage;
