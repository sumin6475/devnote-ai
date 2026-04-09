'use client';

// 채팅 내 코드 블록 — Shiki syntax highlighting 재사용

import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

type ChatCodeBlockProps = {
  code: string;
  language?: string;
};

const ChatCodeBlock = ({ code, language = 'javascript' }: ChatCodeBlockProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function highlight() {
      if (!code) return;
      const { codeToHtml } = await import('shiki');
      const result = await codeToHtml(code, { lang: language, theme: 'github-dark' });
      setHtml(result);
    }
    highlight();
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-lg overflow-hidden my-2"
      style={{ background: '#0F172A', border: '1px solid rgba(148,163,184,0.1)' }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-3 py-[6px]"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}
      >
        <span className="text-[11px]" style={{ color: '#64748B' }}>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center rounded cursor-pointer border-none hover:opacity-70"
          style={{ background: 'transparent', padding: 4 }}
        >
          {copied ? (
            <Check style={{ width: 14, height: 14, color: '#22C55E' }} />
          ) : (
            <Copy style={{ width: 14, height: 14, color: '#64748B' }} />
          )}
        </button>
      </div>
      {/* 코드 */}
      {html ? (
        <div
          className="text-[12px] overflow-x-auto [&>pre]:px-3 [&>pre]:py-3 [&>pre]:m-0 [&>pre]:!bg-[#0F172A]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="text-[12px] px-3 py-3 m-0 overflow-x-auto" style={{ color: '#94A3B8' }}>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export default ChatCodeBlock;
