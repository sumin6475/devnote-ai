// 사이드바 컴포넌트 — 210px 고정, 메뉴 + Coming Soon (disabled)

import Icon from '@/components/ui/Icons';
import { SIDEBAR_MENU, COMING_SOON } from '@/lib/mockData';

type SidebarProps = {
  onNewNote?: () => void;
  noteCount?: number;
};

const Sidebar = ({ onNewNote, noteCount }: SidebarProps) => {
  return (
    <aside
      className="flex flex-col py-5"
      style={{
        width: 210,
        minWidth: 210,
        background: '#0f172a',
        borderRight: '1px solid rgba(148,163,184,0.08)',
      }}
    >
      {/* 로고 */}
      <div className="flex items-center gap-[9px] px-[18px] pb-6">
        <div
          className="flex items-center justify-center"
          style={{
            width: 30,
            height: 30,
            background: '#6366f1',
            borderRadius: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="2" width="14" height="16" rx="2" stroke="#fff" strokeWidth="1.8" />
            <path d="M7 7h6M7 10.5h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span
          className="font-bold text-[17px] tracking-[-0.02em]"
          style={{ color: '#f1f5f9' }}
        >
          DevNote
        </span>
      </div>

      {/* New Note 버튼 */}
      <div className="px-3 pb-2">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-[6px] rounded-lg py-[9px] font-semibold text-[13px] tracking-[0.01em] cursor-pointer border-none hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:scale-[0.98]"
          style={{
            background: '#6366f1',
            color: '#fff',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
        >
          <Icon name="plus" size={16} color="#fff" />
          New Note
        </button>
      </div>

      {/* 메뉴 */}
      <div className="px-3 pt-4 pb-1">
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 pb-[6px]"
          style={{ color: '#475569' }}
        >
          Menu
        </div>
        {SIDEBAR_MENU.map((item) => {
          // Notes 메뉴의 카운트는 실제 노트 수로 표시
          const count = item.label === 'Notes' && noteCount !== undefined ? noteCount : item.count;
          return (
            <div
              key={item.label}
              className="flex items-center gap-[10px] px-3 py-2 rounded-[7px] mb-[1px] cursor-pointer hover:opacity-80 active:scale-[0.98]"
              style={{
                background: item.active ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: item.active ? '#818cf8' : '#64748b',
                fontWeight: item.active ? 600 : 400,
                fontSize: 13,
                transition: 'opacity 0.15s, transform 0.15s',
              }}
            >
              <Icon name={item.icon} color={item.active ? '#818cf8' : '#64748b'} />
              {item.label}
              {count != null && count > 0 && (
                <span
                  className="ml-auto text-[10px] font-bold px-[7px] py-[1px] rounded-[10px]"
                  style={{ background: '#818cf8', color: '#0f172a' }}
                >
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Coming Soon — disabled 상태 */}
      <div className="px-3 pt-3 pb-1">
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 pb-[6px]"
          style={{ color: '#334155' }}
        >
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

      {/* 하단 버전 정보 */}
      <div className="flex-1" />
      <div className="px-5 text-[11px]" style={{ color: '#334155' }}>
        DevNote v1.0 MVP
      </div>
    </aside>
  );
};

export default Sidebar;
