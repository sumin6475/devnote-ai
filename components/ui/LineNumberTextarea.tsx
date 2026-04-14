'use client';

// 라인 번호가 있는 코드 입력 textarea — 스크롤 동기화

import { useRef, useState, useEffect, useCallback } from 'react';

type LineNumberTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const LineNumberTextarea = ({ value, onChange, placeholder, className }: LineNumberTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // 라인 수 계산
  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(Math.max(lines, 1));
  }, [value]);

  // 스크롤 동기화
  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Tab 키 지원 (2 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newVal);
      // 커서 위치 복원
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className={`flex h-full rounded-lg overflow-hidden ${className ?? ''}`}
      style={{
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      {/* 라인 번호 */}
      <div
        ref={lineNumbersRef}
        className="shrink-0 overflow-hidden select-none text-right"
        style={{
          padding: '16px 0',
          width: 44,
          fontSize: 13,
          lineHeight: 1.7,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: '#334155',
          borderRight: '1px solid rgba(148, 163, 184, 0.06)',
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} style={{ paddingRight: 12 }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 resize-none outline-none"
        style={{
          background: 'transparent',
          border: 'none',
          padding: '16px',
          fontSize: 13,
          color: '#94a3b8',
          lineHeight: 1.7,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

export default LineNumberTextarea;
