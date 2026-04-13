'use client';

// 개별 채팅 메시지 — 유저(indigo gradient) / AI(glass)
// AI: 복사 + 노트 저장 버튼, 선택 모드에서 체크박스

import { useState } from 'react';
import { Copy, Check, BookmarkPlus } from 'lucide-react';
import ChatCodeBlock from './ChatCodeBlock';

export type ChatMessageData = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatMessageProps = {
  message: ChatMessageData;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onSaveAsNote?: () => void;
};

// 마크다운 코드 블록 + 인라인 코드 + bold 파싱
const renderContent = (content: string, isUser: boolean) => {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
      if (match) {
        const lang = match[1] || 'javascript';
        const code = match[2].trim();
        return <ChatCodeBlock key={i} code={code} language={lang} />;
      }
    }
    return (
      <span key={i} className="whitespace-pre-wrap">
        {part.split(/(`[^`]+`)/g).map((seg, j) => {
          if (seg.startsWith('`') && seg.endsWith('`')) {
            return (
              <code
                key={j}
                className="text-[12px] px-[5px] py-[1px] rounded"
                style={{
                  background: 'rgba(99,102,241,0.15)',
                  color: '#A5B4FC',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {seg.slice(1, -1)}
              </code>
            );
          }
          return seg.split(/(\*\*[^*]+\*\*)/g).map((s, k) => {
            if (s.startsWith('**') && s.endsWith('**')) {
              return <strong key={k} style={{ color: '#F1F5F9' }}>{s.slice(2, -2)}</strong>;
            }
            return s;
          });
        })}
      </span>
    );
  });
};

const ChatMessage = ({ message, selectionMode, selected, onToggleSelect, onSaveAsNote }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 group`}>
      {/* 선택 모드 체크박스 */}
      {selectionMode && (
        <button
          onClick={onToggleSelect}
          className="flex items-center justify-center shrink-0 mr-2 mt-1 cursor-pointer border-none rounded"
          style={{
            width: 20,
            height: 20,
            background: selected ? '#6366F1' : 'rgba(63,63,70,0.4)',
            border: selected ? 'none' : '1.5px solid rgba(113,113,122,0.5)',
          }}
        >
          {selected && <Check style={{ width: 14, height: 14, color: '#fff' }} />}
        </button>
      )}

      <div
        className={`max-w-[85%] relative px-4 py-3 text-[14px] leading-[1.6] ${
          selectionMode && selected ? 'ring-2 ring-indigo-500/50' : ''
        }`}
        style={{
          background: isUser
            ? 'linear-gradient(to right, #4F46E5, #6366F1)'
            : 'rgba(255,255,255,0.03)',
          backdropFilter: isUser ? undefined : 'blur(12px)',
          border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isUser ? 'none' : '0 4px 6px rgba(0,0,0,0.1)',
          color: isUser ? '#fff' : '#F4F4F5',
          borderRadius: 16,
          borderTopRightRadius: isUser ? 4 : 16,
          borderTopLeftRadius: isUser ? 16 : 4,
          cursor: selectionMode ? 'pointer' : undefined,
        }}
        onClick={selectionMode ? onToggleSelect : undefined}
      >
        {renderContent(message.content, isUser)}

        {/* AI 메시지 액션 — 복사 + 노트 저장 */}
        {!isUser && !selectionMode && message.content && (
          <div
            className="flex items-center gap-1 mt-2 pt-2 opacity-0 group-hover:opacity-100"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'opacity 0.15s' }}
          >
            <button
              onClick={handleCopy}
              className="flex items-center justify-center rounded cursor-pointer border-none hover:opacity-70"
              style={{ width: 24, height: 24, background: 'transparent', padding: 0 }}
              title="Copy message"
            >
              {copied ? (
                <Check style={{ width: 14, height: 14, color: '#4ADE80' }} />
              ) : (
                <Copy style={{ width: 14, height: 14, color: '#71717A' }} />
              )}
            </button>
            {onSaveAsNote && (
              <button
                onClick={onSaveAsNote}
                className="flex items-center justify-center rounded cursor-pointer border-none hover:opacity-70"
                style={{ width: 24, height: 24, background: 'transparent', padding: 0 }}
                title="Save as note"
              >
                <BookmarkPlus style={{ width: 14, height: 14, color: '#71717A' }} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
