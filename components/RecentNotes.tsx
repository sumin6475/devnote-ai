'use client';

// 최근 노트 카드 — 홈 화면 하단, 최근 3개 표시

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
    <div className="w-full max-w-[560px] mt-10">
      <div
        className="text-[13px] font-semibold mb-3"
        style={{ color: '#64748b' }}
      >
        Recent notes
      </div>
      <div className="flex gap-3">
        {recent.map((note) => {
          const project = projects.find((p) => p.id === note.projectId);
          const title = getNoteTitle(note);
          return (
            <div
              key={note.id}
              onClick={() => router.push('/notes')}
              className="rounded-lg cursor-pointer hover:opacity-80 active:scale-[0.98]"
              style={{
                width: 180,
                padding: '12px 16px',
                background: '#1E293B',
                border: '1px solid rgba(148,163,184,0.08)',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
            >
              {/* 프로젝트 dot + 약어 */}
              {project && (
                <div className="flex items-center gap-[5px] mb-[6px]">
                  <span
                    className="rounded-full shrink-0"
                    style={{ width: 6, height: 6, background: project.color }}
                  />
                  <span className="text-[10px] font-medium" style={{ color: '#64748b' }}>
                    {project.name.length > 12 ? project.name.slice(0, 12) + '...' : project.name}
                  </span>
                </div>
              )}
              {/* 제목 — 1줄, 말줄임 */}
              <div
                className="text-[13px] font-medium leading-[1.3] mb-1 overflow-hidden"
                style={{
                  color: '#cbd5e1',
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
