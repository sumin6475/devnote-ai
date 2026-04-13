'use client';

// 메시지 목록 — 스크롤, 선택 모드 체크박스 지원

import { useEffect, useRef } from 'react';
import ChatMessage, { type ChatMessageData } from './ChatMessage';

type ChatMessageListProps = {
  messages: ChatMessageData[];
  isLoading: boolean;
  selectionMode?: boolean;
  selectedIndices?: Set<number>;
  onToggleSelect?: (index: number) => void;
  onSaveAsNote?: (index: number) => void;
};

const ChatMessageList = ({
  messages,
  isLoading,
  selectionMode,
  selectedIndices,
  onToggleSelect,
  onSaveAsNote,
}: ChatMessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="relative flex-1 min-h-0 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' }}>
      {messages.map((msg, i) => (
        <ChatMessage
          key={i}
          message={msg}
          selectionMode={selectionMode}
          selected={selectedIndices?.has(i)}
          onToggleSelect={() => onToggleSelect?.(i)}
          onSaveAsNote={msg.role === 'assistant' && msg.content ? () => onSaveAsNote?.(i) : undefined}
        />
      ))}

      {/* 타이핑 인디케이터 */}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex justify-start mb-3">
          <div
            className="rounded-xl px-4 py-[10px] flex items-center gap-[4px]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="typing-dot" style={{ animationDelay: '0ms' }} />
            <span className="typing-dot" style={{ animationDelay: '150ms' }} />
            <span className="typing-dot" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessageList;
