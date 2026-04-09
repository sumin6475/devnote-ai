'use client';

// 메시지 목록 — 스크롤 영역, 새 메시지 시 자동 스크롤

import { useEffect, useRef } from 'react';
import ChatMessage, { type ChatMessageData } from './ChatMessage';

type ChatMessageListProps = {
  messages: ChatMessageData[];
  isLoading: boolean;
};

const ChatMessageList = ({ messages, isLoading }: ChatMessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지 추가 시 하단으로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="relative flex-1 min-h-0 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' }}>
      {messages.map((msg, i) => (
        <ChatMessage key={i} message={msg} />
      ))}

      {/* 타이핑 인디케이터 */}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex justify-start mb-3">
          <div
            className="rounded-xl px-4 py-[10px] flex items-center gap-[4px]"
            style={{ background: '#1E293B' }}
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
