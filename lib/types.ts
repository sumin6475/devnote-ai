// DevNote 타입 정의 — DB 스키마(CLAUDE.md) 기준

export type RelatedConcept = {
  name: string;
  why: string;
};

// --- Notes ---

// Supabase notes 테이블 row 타입
export type NoteRow = {
  id: string; // uuid
  note_type: 'debug' | 'learning' | 'quick';
  raw_content: string | null;
  problem: string | null;
  solution: string | null;
  understanding: string | null;
  what_i_built: string | null;
  learnings: string[] | null;
  source: string | null;
  code_snippet: string | null;
  skill_tags: string[];
  topic_tags: string[];
  category: string;
  related_concepts: RelatedConcept[];
  difficulty: number;
  project_id: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

// 프론트엔드에서 사용하는 가공된 노트 타입
export type Note = {
  id: string;
  noteType: 'debug' | 'learning' | 'quick';
  rawContent?: string;
  // Debug Note 필드
  problem?: string;
  solution?: string;
  understanding?: string;
  // Learning Note 필드
  whatIBuilt?: string;
  learnings?: string[];
  source?: string;
  // 공통 필드
  codeSnippet?: string;
  skillTags: string[];
  topicTags: string[];
  category: string;
  relatedConcepts: RelatedConcept[];
  difficulty: number;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
};

// --- Projects ---

// Supabase projects 테이블 row 타입
export type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  github_url: string | null;
  user_id: string | null;
  created_at: string;
  note_count?: number; // LEFT JOIN 집계 시 포함
};

// 프론트엔드에서 사용하는 프로젝트 타입
export type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  githubUrl: string | null;
  noteCount: number;
  createdAt: string;
};

// --- 태그 ---

// 태그 컬러 순환 배열 — indigo/teal/amber 반복 (topicTags용)
export type TagColor = 'indigo' | 'teal' | 'amber';
const TAG_COLORS: TagColor[] = ['indigo', 'teal', 'amber'];
export const getTagColors = (tags: string[]): TagColor[] =>
  tags.map((_, i) => TAG_COLORS[i % TAG_COLORS.length]);

// --- 헬퍼 함수 ---

// 노트 제목 파생 — debug: problem, learning: whatIBuilt, quick: rawContent 첫 줄
export const getNoteTitle = (note: Note): string => {
  if (note.noteType === 'debug') return note.problem ?? '';
  if (note.noteType === 'learning') return note.whatIBuilt ?? '';
  // quick: rawContent 첫 줄 (80자 제한)
  const first = (note.rawContent ?? '').split('\n')[0];
  return first.length > 80 ? first.slice(0, 80) + '...' : first;
};

// 미리보기 텍스트 파생 — 80자로 자르기
export const getNotePreview = (note: Note): string => {
  let text = '';
  if (note.noteType === 'debug') {
    text = note.solution ?? '';
  } else if (note.noteType === 'learning') {
    text = note.learnings?.[0] ?? '';
  } else {
    // quick: rawContent 두 번째 줄부터
    const lines = (note.rawContent ?? '').split('\n');
    text = lines.slice(1).join(' ').trim() || lines[0] || '';
  }
  return text.length > 80 ? text.slice(0, 80) + '...' : text;
};

// 날짜 포맷 — "MM/DD" 형식
export const formatDate = (isoString: string): string => {
  const d = new Date(isoString);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
};

// 상대 시간 포맷 — "2 hours ago", "3 days ago" 등
export const formatRelativeTime = (isoString: string): string => {
  const now = Date.now();
  const diff = now - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(isoString);
};

// DB row → 프론트엔드 타입 변환
export const toNote = (row: NoteRow): Note => ({
  id: row.id,
  noteType: row.note_type,
  rawContent: row.raw_content ?? undefined,
  problem: row.problem ?? undefined,
  solution: row.solution ?? undefined,
  understanding: row.understanding ?? undefined,
  whatIBuilt: row.what_i_built ?? undefined,
  learnings: row.learnings ?? undefined,
  source: row.source ?? undefined,
  codeSnippet: row.code_snippet ?? undefined,
  skillTags: row.skill_tags ?? [],
  topicTags: row.topic_tags ?? [],
  category: row.category ?? '',
  relatedConcepts: row.related_concepts ?? [],
  difficulty: row.difficulty ?? 1,
  projectId: row.project_id ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// DB project row → 프론트엔드 타입 변환
export const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  color: row.color ?? '#818CF8',
  githubUrl: row.github_url ?? null,
  noteCount: Number(row.note_count ?? 0),
  createdAt: row.created_at,
});
