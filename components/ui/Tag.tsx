// 태그 컴포넌트 — 2가지 스타일: SkillTag (보라색, 크게) + TopicTag (회색, 작게)
// rgba 배경 + 미세 border, solid border 금지

import type { TagColor } from '@/lib/types';

const TAG_COLOR_MAP = {
  indigo: {
    bg: 'rgba(99,102,241,0.12)',
    text: '#a5b4fc',
    border: 'rgba(99,102,241,0.25)',
  },
  teal: {
    bg: 'rgba(20,184,166,0.12)',
    text: '#5eead4',
    border: 'rgba(20,184,166,0.25)',
  },
  amber: {
    bg: 'rgba(245,158,11,0.12)',
    text: '#fcd34d',
    border: 'rgba(245,158,11,0.25)',
  },
} as const;

// 기존 Tag — NoteList에서 topicTags 표시용
type TagProps = {
  label: string;
  colorKey: TagColor;
};

const Tag = ({ label, colorKey }: TagProps) => {
  const c = TAG_COLOR_MAP[colorKey] || TAG_COLOR_MAP.indigo;

  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
      className="text-[11px] font-medium px-[10px] py-[2px] rounded-[20px] whitespace-nowrap tracking-[0.01em]"
    >
      {label}
    </span>
  );
};

// Skill Tag — AI Context에서 canonical skill tag 표시용
export const SkillTag = ({ label }: { label: string }) => (
  <span
    style={{
      background: 'rgba(129, 140, 248, 0.15)',
      color: '#A5B4FC',
      border: '1px solid rgba(129, 140, 248, 0.25)',
    }}
    className="text-[13px] font-medium px-[14px] py-[5px] rounded-[20px] whitespace-nowrap"
  >
    {label}
  </span>
);

// Topic Tag — AI Context에서 free-form topic tag 표시용
export const TopicTag = ({ label }: { label: string }) => (
  <span
    style={{
      background: 'rgba(148, 163, 184, 0.1)',
      color: '#94A3B8',
      border: '1px solid rgba(148, 163, 184, 0.15)',
    }}
    className="text-[12px] font-medium px-[10px] py-[3px] rounded-[20px] whitespace-nowrap"
  >
    {label}
  </span>
);

export default Tag;
