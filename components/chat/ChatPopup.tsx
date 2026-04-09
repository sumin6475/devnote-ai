'use client';

// 채팅 팝업 — Glass morphism + 새 헤더/푸터

import { useState, useCallback } from 'react';
import { X, Info } from 'lucide-react';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import type { ChatMessageData } from './ChatMessage';

type ChatPopupProps = {
  onClose: () => void;
};

const ChatPopup = ({ onClose }: ChatPopupProps) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    { role: 'assistant', content: 'Hi! Ask me anything about development.' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

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
          } catch {
            // 파싱 실패 무시
          }
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
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.05), transparent, rgba(147,51,234,0.05))',
        }}
      />

      {/* 헤더 */}
      <div className="relative flex items-center justify-between px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full animate-pulse"
            style={{ width: 8, height: 8, background: '#22C55E' }}
          />
          <span className="text-[12px]" style={{ color: '#A1A1AA' }}>
            DevNote AI
          </span>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* 메시지 영역 */}
      <ChatMessageList messages={messages} isLoading={isLoading} />

      {/* 입력 + 푸터 */}
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
    </div>
  );
};

export default ChatPopup;
