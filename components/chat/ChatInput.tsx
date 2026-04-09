'use client';

// 채팅 입력 영역 — 구분선 아래 전체가 입력 영역, 내부 박스 없음

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled: boolean;
};

const MAX_CHARS = 2000;

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || disabled || input.length > MAX_CHARS) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !disabled && input.length <= MAX_CHARS;

  return (
    <div
      className="shrink-0 relative"
      style={{
        borderTop: '1px solid rgba(63,63,70,0.5)',
        background: 'rgba(39,39,42,0.4)',
      }}
    >
      {/* textarea + 전송 버튼 */}
      <div className="flex items-end gap-2 px-4 pt-3 pb-8">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Thinking...' : 'Ask anything...'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none outline-none text-[14px] leading-[1.5]"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#F4F4F5',
            fontFamily: 'inherit',
            maxHeight: 96,
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex items-center justify-center shrink-0 rounded-lg cursor-pointer border-none chat-send-btn"
          style={{
            width: 36,
            height: 36,
            background: canSend
              ? 'linear-gradient(to right, #4F46E5, #6366F1)'
              : 'rgba(63,63,70,0.4)',
            color: '#fff',
            boxShadow: canSend ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
            transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
          }}
        >
          <Send style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* 글자수 — 우하단 절대 배치 */}
      {input.length > 0 && (
        <span
          className="absolute text-[11px]"
          style={{ right: 60, bottom: 28, color: input.length > MAX_CHARS ? '#EF4444' : '#52525B' }}
        >
          {input.length}/{MAX_CHARS}
        </span>
      )}
    </div>
  );
};

export default ChatInput;
