'use client';

// 최근 노트 카드 — Bolt 스타일, 홈 화면 하단

import { useRouter } from 'next/navigation';
import { type Note, getNoteTitle, formatRelativeTime } from '@/lib/types';
import type { Project } from '@/lib/types';

type RecentNotesProps = {
  notes: Note[];
  projects: Project[];
};

const RecentNotes = ({ notes, projects }: RecentNotesProps) => {
  const router = useRouter();
  const recent = notes.slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div className="w-full mt-10">
      <div className="text-[12px] mb-3" style={{ color: '#64748B' }}>
        Recent notes
      </div>
      <div className="flex gap-[10px]">
        {recent.map((note) => {
          const project = projects.find((p) => p.id === note.projectId);
          const title = getNoteTitle(note);
          return (
            <div
              key={note.id}
              onClick={() => router.push('/notes')}
              className="flex-1 rounded-[10px] cursor-pointer"
              style={{
                padding: '12px 14px',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(148,163,184,0.06)',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.06)')}
            >
              {/* 프로젝트 dot + 약어 */}
              {project && (
                <div className="flex items-center gap-[5px] mb-[5px]">
                  <span
                    className="rounded-full shrink-0"
                    style={{ width: 5, height: 5, background: project.color }}
                  />
                  <span className="text-[10px]" style={{ color: '#64748b' }}>
                    {project.name.length > 14 ? project.name.slice(0, 14) + '...' : project.name}
                  </span>
                </div>
              )}
              {/* 제목 — 1줄, 말줄임 */}
              <div
                className="text-[12px] font-medium leading-[1.3] mb-1 overflow-hidden"
                style={{
                  color: '#E2E8F0',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {title}
              </div>
              {/* 상대 시간 */}
              <div className="text-[11px]" style={{ color: '#475569' }} suppressHydrationWarning>
                {formatRelativeTime(note.createdAt)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentNotes;
