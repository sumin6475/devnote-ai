'use client';

// 스니펫 코드 패널 — 선택된 노트의 code_snippet을 전체 높이로 표시

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { CodeBlockCode } from '@/components/ui/code-block';
import type { Note } from '@/lib/types';

type SnippetCodeProps = {
  note: Note | null;
};

const SnippetCode = ({ note }: SnippetCodeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (note?.codeSnippet) {
      navigator.clipboard.writeText(note.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!note || !note.codeSnippet) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: '#0F172A' }}
      >
        <span className="text-[13px]" style={{ color: '#334155' }}>
          No code snippet
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen" style={{ background: '#0F172A' }}>
      {/* 헤더 바 */}
      <div
        className="flex items-center justify-between shrink-0 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}
      >
        <span className="text-[12px] font-medium" style={{ color: '#64748B' }}>
          Code Snippet
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center rounded-md cursor-pointer border-none hover:opacity-70"
          style={{ background: 'transparent', padding: 4 }}
          title="Copy code"
        >
          {copied ? (
            <Check style={{ width: 15, height: 15, color: '#22C55E' }} />
          ) : (
            <Copy style={{ width: 15, height: 15, color: '#94A3B8' }} />
          )}
        </button>
      </div>

      {/* 코드 영역 — 스크롤 가능 */}
      <div className="flex-1 overflow-auto">
        <CodeBlockCode
          code={note.codeSnippet}
          language="javascript"
          theme="github-dark"
        />
      </div>
    </div>
  );
};

export default SnippetCode;
