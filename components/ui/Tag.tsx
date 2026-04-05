// 태그 컴포넌트 — rgba 배경 + 미세 border, solid border 금지

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

export default Tag;
