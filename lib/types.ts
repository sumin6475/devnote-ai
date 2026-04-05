// DevNote 타입 정의 — DB 스키마(CLAUDE.md) 기준

export type RelatedConcept = {
  name: string;
  why: string;
};

// Supabase notes 테이블 row 타입
export type NoteRow = {
  id: string; // uuid
  note_type: 'debug' | 'learning';
  problem: string | null;
  solution: string | null;
  understanding: string | null;
  what_i_built: string | null;
  learnings: string[] | null;
  source: string | null;
  code_snippet: string | null;
  tags: string[];
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
  noteType: 'debug' | 'learning';
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
  tags: string[];
  category: string;
  relatedConcepts: RelatedConcept[];
  difficulty: number;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
};

// 태그 컬러 순환 배열 — indigo/teal/amber 반복
export type TagColor = 'indigo' | 'teal' | 'amber';
const TAG_COLORS: TagColor[] = ['indigo', 'teal', 'amber'];
export const getTagColors = (tags: string[]): TagColor[] =>
  tags.map((_, i) => TAG_COLORS[i % TAG_COLORS.length]);

// 노트 제목 파생 — debug: problem, learning: whatIBuilt
export const getNoteTitle = (note: Note): string => {
  if (note.noteType === 'debug') return note.problem ?? '';
  return note.whatIBuilt ?? '';
};

// 미리보기 텍스트 파생 — 80자로 자르기
export const getNotePreview = (note: Note): string => {
  let text = '';
  if (note.noteType === 'debug') {
    text = note.solution ?? '';
  } else {
    text = note.learnings?.[0] ?? '';
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

// DB row → 프론트엔드 타입 변환
export const toNote = (row: NoteRow): Note => ({
  id: row.id,
  noteType: row.note_type,
  problem: row.problem ?? undefined,
  solution: row.solution ?? undefined,
  understanding: row.understanding ?? undefined,
  whatIBuilt: row.what_i_built ?? undefined,
  learnings: row.learnings ?? undefined,
  source: row.source ?? undefined,
  codeSnippet: row.code_snippet ?? undefined,
  tags: row.tags ?? [],
  category: row.category ?? '',
  relatedConcepts: row.related_concepts ?? [],
  difficulty: row.difficulty ?? 1,
  projectId: row.project_id ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
