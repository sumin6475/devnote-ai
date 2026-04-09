'use client';

// 개별 채팅 메시지 — 유저(우측 indigo gradient) / AI(좌측 zinc)
// rounded-2xl, 꼬리 방향 sm

import ChatCodeBlock from './ChatCodeBlock';

export type ChatMessageData = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatMessageProps = {
  message: ChatMessageData;
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

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className="max-w-[85%] px-4 py-3 text-[14px] leading-[1.6]"
        style={{
          background: isUser
            ? 'linear-gradient(to right, #4F46E5, #6366F1)'
            : 'rgba(39, 39, 42, 0.4)',
          color: isUser ? '#fff' : '#F4F4F5',
          borderRadius: 16,
          borderTopRightRadius: isUser ? 4 : 16,
          borderTopLeftRadius: isUser ? 16 : 4,
        }}
      >
        {renderContent(message.content, isUser)}
      </div>
    </div>
  );
};

export default ChatMessage;
