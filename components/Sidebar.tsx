'use client';

// 사이드바 — 단순 네비게이션. 모든 페이지에서 동일. layout.tsx에서 렌더링.
// active 상태는 usePathname()으로 현재 URL 기반 판별.

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home as HomeIcon } from 'lucide-react';
import Icon from '@/components/ui/Icons';

const MENU_ITEMS = [
  { label: 'Home', icon: 'notes' as const, href: '/' },
  { label: 'Notes', icon: 'notes' as const, href: '/notes', showCount: true },
  { label: 'Search', icon: 'search' as const, href: '#', disabled: true },
  { label: 'Projects', icon: 'projects' as const, href: '/projects' },
  { label: 'Skill Map', icon: 'skillmap' as const, href: '/skill-map' },
];

const COMING_SOON = [
  { label: 'Dashboard', icon: 'dashboard' as const },
  { label: 'Code Review', icon: 'codereview' as const },
];

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [noteCount, setNoteCount] = useState(0);

  // 노트 수 자체 fetch
  useEffect(() => {
    fetch('/api/notes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNoteCount(data.data.length);
      })
      .catch(() => {});
  }, [pathname]); // 페이지 전환 시 갱신

  // 현재 경로에 맞는 active 판별
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex flex-col py-5 shrink-0 h-screen overflow-y-auto"
      style={{
        width: 320,
        minWidth: 320,
        background: 'rgba(15, 23, 42, 0.85)',
        borderRight: '1px solid rgba(148,163,184,0.08)',
      }}
    >
      {/* 로고 — 클릭 시 홈으로 */}
      <div
        className="flex items-center gap-[9px] px-5 pb-8 cursor-pointer hover:opacity-80"
        onClick={() => router.push('/')}
        style={{ transition: 'opacity 0.15s' }}
      >
        <div
          className="flex items-center justify-center"
          style={{ width: 30, height: 30, background: '#6366f1', borderRadius: 8 }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="2" width="14" height="16" rx="2" stroke="#fff" strokeWidth="1.8" />
            <path d="M7 7h6M7 10.5h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-bold text-[17px] tracking-[-0.02em]" style={{ color: '#f1f5f9' }}>
          DevNote
        </span>
      </div>

      {/* 메뉴 */}
      <div className="px-4 pt-6 pb-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 pb-2" style={{ color: '#475569' }}>
          Menu
        </div>

        {MENU_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <div
              key={item.label}
              onClick={item.disabled ? undefined : () => router.push(item.href)}
              className="flex items-center gap-[10px] px-3 py-[9px] rounded-[7px] mb-[2px] hover:opacity-80 active:scale-[0.98]"
              style={{
                background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: active ? '#818cf8' : item.disabled ? '#334155' : '#64748b',
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                cursor: item.disabled ? 'default' : 'pointer',
                opacity: item.disabled ? 0.55 : 1,
                transition: 'opacity 0.15s, transform 0.15s',
              }}
            >
              {item.label === 'Home' ? (
                <HomeIcon style={{ width: 18, height: 18, color: active ? '#818cf8' : '#64748b' }} />
              ) : (
                <Icon name={item.icon} color={active ? '#818cf8' : item.disabled ? '#334155' : '#64748b'} />
              )}
              {item.label}
              {item.showCount && noteCount > 0 && (
                <span
                  className="ml-auto text-[10px] font-bold px-[7px] py-[1px] rounded-[10px]"
                  style={{ background: '#818cf8', color: '#0f172a' }}
                  suppressHydrationWarning
                >
                  {noteCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Coming Soon */}
      <div className="px-4 pt-6 pb-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 pb-2" style={{ color: '#334155' }}>
          Coming soon
        </div>
        {COMING_SOON.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-[10px] px-3 py-2 rounded-[7px] mb-[1px] text-[13px] opacity-[0.55] cursor-default"
            style={{ color: '#334155' }}
          >
            <Icon name={item.icon} color="#334155" />
            {item.label}
          </div>
        ))}
      </div>

      <div className="flex-1" />
      <div className="px-5 text-[11px]" style={{ color: '#334155' }}>
        DevNote v1.0 MVP
      </div>
    </aside>
  );
};

export default Sidebar;
