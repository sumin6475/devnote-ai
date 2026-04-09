'use client';

// 플로팅 액션 버튼 — Glow + Gradient + Ping 펄스

import { useState, useRef, useEffect } from 'react';
import { Bot, X } from 'lucide-react';
import ChatPopup from './ChatPopup';

const ChatFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // 외부 클릭으로 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isOpen) return;
      const target = e.target as Node;
      if (fabRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <>
      {/* 채팅 팝업 */}
      {isOpen && (
        <div ref={popupRef}>
          <ChatPopup onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Ping 펄스 — 버튼 뒤 */}
      {!isOpen && (
        <span
          className="fixed z-40 rounded-full animate-ping"
          style={{
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            background: 'rgba(99, 102, 241, 0.3)',
            opacity: 0.2,
          }}
        />
      )}

      {/* 플로팅 버튼 */}
      <button
        ref={fabRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 flex items-center justify-center rounded-full cursor-pointer border-none chat-fab"
        style={{
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(168,85,247,0.8) 100%)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          color: '#fff',
          boxShadow: '0 0 20px rgba(139,92,246,0.7), 0 0 40px rgba(124,58,237,0.5), 0 0 60px rgba(109,40,217,0.3)',
          transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
      >
        {/* 3D 글래스 오버레이 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
            opacity: 0.3,
          }}
        />
        {isOpen ? (
          <X style={{ width: 28, height: 28 }} />
        ) : (
          <Bot style={{ width: 28, height: 28 }} />
        )}
      </button>
    </>
  );
};

export default ChatFAB;
