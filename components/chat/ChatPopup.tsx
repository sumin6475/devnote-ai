'use client';

// 채팅 팝업 — Glass morphism + 선택 모드 + 노트 저장

import { useState, useCallback, useEffect } from 'react';
import { X, Info, BookmarkPlus, Loader2 } from 'lucide-react';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import type { ChatMessageData } from './ChatMessage';
import ParsePreview from '@/components/quick-note/ParsePreview';
import type { ParsedNote } from '@/components/quick-note/ParsedNoteCard';
import type { Note, Project } from '@/lib/types';

type ChatPopupProps = {
  onClose: () => void;
};

type ViewMode = 'chat' | 'selecting' | 'analyzing' | 'preview';

const ChatPopup = ({ onClose }: ChatPopupProps) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    { role: 'assistant', content: 'Hi! Ask me anything about development.' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // 닉네임 fetch → 인사 메시지 업데이트
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.nickname) {
          setMessages([{
            role: 'assistant',
            content: `Hi ${data.data.nickname}! Ask me anything about development.`,
          }]);
        }
      })
      .catch(() => {});
  }, []);

  // 선택 모드 + 노트 저장
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [parsedNotes, setParsedNotes] = useState<ParsedNote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // 프로젝트 fetch (선택 모드 진입 시)
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch { /* ignore */ }
  };

  const handleSend = useCallback(async (text: string) => {
    const userMsg: ChatMessageData = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              assistantContent += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch { /* parse error ignored */ }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content) {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' };
          return updated;
        }
        return [...prev, { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' }];
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // 선택 모드 진입
  const enterSelectionMode = () => {
    setViewMode('selecting');
    setSelectedIndices(new Set());
    fetchProjects();
  };

  // 선택 모드 취소
  const cancelSelection = () => {
    setViewMode('chat');
    setSelectedIndices(new Set());
  };

  // 선택 토글
  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // 개별 메시지 → 즉시 분석
  const saveOneAsNote = async (index: number) => {
    await fetchProjects();
    setSelectedIndices(new Set([index]));
    await createNotes(new Set([index]));
  };

  // 선택한 메시지들 → AI 분석
  const createNotes = async (indices?: Set<number>) => {
    const sel = indices ?? selectedIndices;
    if (sel.size === 0) return;

    setViewMode('analyzing');

    // 선택한 메시지를 텍스트로 결합
    const selectedMessages = Array.from(sel)
      .sort((a, b) => a - b)
      .map((i) => {
        const msg = messages[i];
        return msg.role === 'user' ? `[User]: ${msg.content}` : `[AI]: ${msg.content}`;
      })
      .join('\n\n');

    try {
      const res = await fetch('/api/ai/parse-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: selectedMessages, fromChat: true }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const notes: ParsedNote[] = (data.data.notes ?? []).map((n: ParsedNote) => ({
        ...n,
        projectId: null,
      }));

      setParsedNotes(notes);
      setViewMode('preview');
    } catch (err) {
      console.error('Parse failed:', err);
      setViewMode('selecting');
    }
  };

  // 노트 저장 완료
  const handleSaveAll = async (notes: ParsedNote[]) => {
    for (const note of notes) {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteType: 'debug',
          problem: note.problem,
          solution: note.solution,
          understanding: note.understanding,
          codeSnippet: note.code_snippet || null,
          projectId: note.projectId,
          skillTags: note.skill_tags,
          topicTags: note.topic_tags,
          category: '',
        }),
      });
    }
    setViewMode('chat');
    setSelectedIndices(new Set());
    setParsedNotes([]);
  };

  // 프로젝트 생성
  const handleCreateProject = async (name: string): Promise<Project> => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setProjects((prev) => [data.data, ...prev]);
    return data.data;
  };

  const isSelecting = viewMode === 'selecting';

  return (
    <div
      className="fixed z-50 flex flex-col overflow-hidden"
      style={{
        bottom: 104,
        right: 24,
        width: 440,
        height: 600,
        maxHeight: '80vh',
        borderRadius: 24,
        background: 'linear-gradient(to bottom right, rgba(39,39,42,0.8), rgba(24,24,27,0.9))',
        border: '1px solid rgba(113,113,122,0.5)',
        backdropFilter: 'blur(40px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        animation: 'chatPopupIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transformOrigin: 'bottom right',
      }}
    >
      {/* 컬러 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[24px]"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), transparent, rgba(147,51,234,0.05))' }}
      />

      {/* 헤더 — 일반 / 선택 모드 */}
      <div className="relative flex items-center justify-between px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
        {isSelecting ? (
          <>
            <span className="text-[13px] font-medium" style={{ color: '#D4D4D8' }}>
              Select messages ({selectedIndices.size})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelSelection}
                className="text-[12px] px-3 py-[5px] rounded-lg cursor-pointer border-none hover:opacity-80"
                style={{ background: 'rgba(63,63,70,0.4)', color: '#A1A1AA', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={() => createNotes()}
                disabled={selectedIndices.size === 0}
                className="text-[12px] px-3 py-[5px] rounded-lg cursor-pointer border-none hover:opacity-80"
                style={{
                  background: selectedIndices.size > 0 ? '#6366F1' : 'rgba(63,63,70,0.4)',
                  color: selectedIndices.size > 0 ? '#fff' : '#71717A',
                  fontFamily: 'inherit',
                }}
              >
                Create Note ({selectedIndices.size})
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="rounded-full animate-pulse" style={{ width: 8, height: 8, background: '#22C55E' }} />
              <span className="text-[12px]" style={{ color: '#A1A1AA' }}>DevNote AI</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Save as Note 토글 */}
              <button
                onClick={enterSelectionMode}
                className="flex items-center justify-center rounded-lg cursor-pointer border-none hover:opacity-70"
                style={{ width: 28, height: 28, background: 'rgba(63,63,70,0.4)', transition: 'opacity 0.15s' }}
                title="Save as Note"
              >
                <BookmarkPlus style={{ width: 15, height: 15, color: '#A1A1AA' }} />
              </button>
              <span
                className="text-[11px] px-2 py-[3px] rounded-2xl"
                style={{ background: 'rgba(39,39,42,0.6)', color: '#D4D4D8' }}
              >
                claude-sonnet
              </span>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-lg cursor-pointer border-none hover:opacity-70"
                style={{ width: 28, height: 28, background: 'rgba(63,63,70,0.4)', transition: 'opacity 0.15s' }}
              >
                <X style={{ width: 16, height: 16, color: '#A1A1AA' }} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* 메인 영역 — 모드별 분기 */}
      {viewMode === 'analyzing' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#818CF8' }} />
          <span className="text-[14px]" style={{ color: '#94A3B8' }}>Analyzing...</span>
        </div>
      ) : viewMode === 'preview' ? (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'none' }}>
          <ParsePreview
            notes={parsedNotes}
            projects={projects}
            onCreateProject={handleCreateProject}
            onSaveAll={handleSaveAll}
            onReparse={() => createNotes()}
            onCancel={() => { setViewMode('selecting'); setParsedNotes([]); }}
          />
        </div>
      ) : (
        <>
          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            selectionMode={isSelecting}
            selectedIndices={selectedIndices}
            onToggleSelect={toggleSelect}
            onSaveAsNote={saveOneAsNote}
          />

          {!isSelecting && (
            <>
              <ChatInput onSend={handleSend} disabled={isLoading} />
              <div
                className="relative flex items-center justify-between px-5 py-2 shrink-0"
                style={{ background: 'rgba(39,39,42,0.4)' }}
              >
                <div className="flex items-center gap-1 text-[11px]" style={{ color: '#71717A' }}>
                  <Info style={{ width: 12, height: 12 }} />
                  <span>
                    <kbd className="px-[4px] py-[1px] rounded text-[10px]" style={{ background: 'rgba(63,63,70,0.5)', color: '#A1A1AA' }}>Shift</kbd>
                    {' + '}
                    <kbd className="px-[4px] py-[1px] rounded text-[10px]" style={{ background: 'rgba(63,63,70,0.5)', color: '#A1A1AA' }}>Enter</kbd>
                    {' for newline'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px]" style={{ color: '#71717A' }}>
                  <span className="rounded-full" style={{ width: 6, height: 6, background: '#22C55E' }} />
                  Online
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ChatPopup;
