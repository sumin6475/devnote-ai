// DevNote 아이콘 컴포넌트 — SVG 기반, 이모티콘 사용 금지 규칙 준수

type IconProps = {
  name: 'notes' | 'search' | 'projects' | 'skillmap' | 'dashboard' | 'codereview' | 'plus' | 'star' | 'ai' | 'snippets';
  size?: number;
  color?: string;
};

const Icon = ({ name, size = 18, color = 'currentColor' }: IconProps) => {
  const s = { width: size, height: size, display: 'block' as const };

  switch (name) {
    case 'notes':
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="14" height="16" rx="2" stroke={color} strokeWidth="1.5" />
          <path d="M7 7h6M7 10.5h6M7 14h4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'search':
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="5" stroke={color} strokeWidth="1.5" />
          <path d="M13 13l4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'projects':
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="3" width="7" height="6" rx="1.5" stroke={color} strokeWidth="1.3" />
          <rect x="11" y="3" width="7" height="6" rx="1.5" stroke={color} strokeWidth="1.3" />
          <rect x="2" y="11" width="7" height="6" rx="1.5" stroke={color} strokeWidth="1.3" />
          <rect x="11" y="11" width="7" height="6" rx="1.5" stroke={color} strokeWidth="1.3" />
        </svg>
      );
    case 'skillmap':
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none">
          <path d="M3 16V4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="3" cy="4" r="1.5" stroke={color} strokeWidth="1.2" />
          <path d="M3 10h4a2 2 0 012 2v4" stroke={color} strokeWidth="1.3" />
          <circle cx="9" cy="16" r="1.5" stroke={color} strokeWidth="1.2" />
          <path d="M3 7h8a2 2 0 012 2v3" stroke={color} strokeWidth="1.3" />
          <circle cx="13" cy="12" r="1.5" stroke={color} strokeWidth="1.2" />
          <path d="M13 12h4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="17" cy="12" r="1.5" stroke={color} strokeWidth="1.2" />
        </svg>
      );
    case 'dashboard':
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none">
          <path d="M3 3v14h14" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M6 13l3-4 3 2 5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'codereview':
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none">
          <path d="M7 6l-4 4 4 4M13 6l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'snippets':
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="14" height="16" rx="2" stroke={color} strokeWidth="1.5" />
          <path d="M7 7l-1.5 1.5L7 10M13 7l1.5 1.5L13 10" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 14h6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'plus':
      return (
        <svg style={s} viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'star':
      return (
        <svg
          style={{ width: 14, height: 14, display: 'inline-block', verticalAlign: 'middle' }}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M8 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6L8 9.6l-3.2 1.8.6-3.6L2.8 5.3l3.6-.5L8 1.5z"
            fill={color}
            stroke={color}
            strokeWidth="0.8"
          />
        </svg>
      );
    case 'ai':
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3 4.3 12.3l.7-4.1-3-2.9 4.2-.7L8 1z"
            fill="rgba(99,102,241,0.3)"
            stroke="#818cf8"
            strokeWidth="1"
          />
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
