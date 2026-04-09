# DevNote PRD — Phase 1 MVP 현황

> 작성일: 2026-04-08
> 기준: 현재 구현 완료된 상태 기준 문서

---

## 1. 프로젝트 개요

**DevNote**는 개발자의 학습 순간을 캡처하고, AI가 맥락을 붙여주는 학습 기록 도구.
두 가지 노트 타입(Debug Note, Learning Note)으로 개발 경험을 구조화해서 저장한다.

- **스택**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Supabase (PostgreSQL) + TypeScript
- **배포 타겟**: Vercel
- **현재 단계**: Phase 1 MVP — 노트 CRUD 완료, AI 자동 태그 미구현

---

## 2. 아키텍처

### 2.1 전체 구조

```
[Client: React 19]
       │
       │  fetch (REST)
       ▼
[Next.js Route Handlers: /api/*]
       │
       │  @supabase/supabase-js
       ▼
[Supabase PostgreSQL]
```

- 별도 백엔드 서버 없음 — Next.js Route Handlers가 API 역할
- AI API 호출은 서버(Route Handler)에서만 수행 (클라이언트 직접 호출 금지)
- 상태 관리: React useState만 사용 (Redux/Zustand 금지)

### 2.2 폴더 구조

```
devnote-ai/
├── app/
│   ├── api/notes/
│   │   ├── route.ts              # GET (목록) + POST (생성)
│   │   └── [id]/route.ts         # GET (상세) + PUT (수정) + DELETE (삭제)
│   ├── layout.tsx                # 루트 레이아웃 (Inter + JetBrains Mono 폰트)
│   ├── page.tsx                  # 메인 페이지 (3컬럼 레이아웃, 상태 관리 중앙)
│   └── globals.css               # Tailwind v4 + 다크 테마 변수 + 커스텀 스크롤바
├── components/
│   ├── Sidebar.tsx               # 좌측 사이드바 (210px)
│   ├── NoteList.tsx              # 중앙 노트 목록 (380px)
│   ├── NoteDetail.tsx            # 우측 상세 보기
│   ├── NoteForm.tsx              # 노트 생성/수정 폼
│   └── ui/
│       ├── DifficultyStars.tsx   # 난이도 별점 (1~5)
│       ├── Icons.tsx             # SVG 아이콘 라이브러리
│       └── Tag.tsx               # 태그 배지
├── lib/
│   ├── types.ts                  # 타입 정의 + snake_case ↔ camelCase 변환
│   ├── supabase.ts               # Supabase 클라이언트 (lazy singleton)
│   └── mockData.ts               # 개발용 목 데이터
├── CLAUDE.md                     # AI 에이전트 규칙 문서
└── takeaway.md                   # 디버깅 로그 (템플릿만 존재)
```

### 2.3 데이터 흐름

```
page.tsx (중앙 상태: notes[], selectedIndex, mode)
  ├── Sidebar       ← onNewNote, noteCount
  ├── NoteList      ← notes, selectedIndex, onSelect
  └── NoteDetail    ← note, onEdit, onDelete
      또는
      NoteForm      ← onSave, onCancel, editNote?
```

- 모든 상태는 `page.tsx`에서 관리, props로 하위 컴포넌트에 전달
- API 호출도 `page.tsx`에서 수행

---

## 3. DB 스키마

### 3.1 notes 테이블

| Column | Type | 설명 |
|--------|------|------|
| id | uuid PK | gen_random_uuid() |
| note_type | text NOT NULL | `'debug'` 또는 `'learning'` |
| problem | text (nullable) | Debug 전용: 무엇이 문제였는지 |
| solution | text (nullable) | Debug 전용: 어떻게 해결했는지 |
| understanding | text (nullable) | Debug 전용: 왜 그런 건지 |
| what_i_built | text (nullable) | Learning 전용: 뭘 만들었는지 |
| learnings | text[] (nullable) | Learning 전용: 배운 것들 배열 |
| source | text (nullable) | Learning 전용: 출처 |
| code_snippet | text (nullable) | 공통 선택: 코드 블록 |
| tags | text[] | AI 생성 태그 |
| category | text | AI 생성 카테고리 (roadmap.sh 경로) |
| related_concepts | jsonb | AI 생성 `[{name, why}]` |
| difficulty | integer (1-5) | AI 생성 난이도 |
| project_id | uuid FK (nullable) | Phase 2용 |
| user_id | uuid FK (nullable) | Phase 2 Auth용 |
| embedding | vector (nullable) | Phase 1.5 Semantic Search용 |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

**타입별 필수 필드:**
- `debug`: problem, solution, understanding 필수
- `learning`: what_i_built, learnings 필수

### 3.2 projects 테이블

| Column | Type | 설명 |
|--------|------|------|
| id | uuid PK | |
| name | text NOT NULL | 프로젝트명 |
| description | text (nullable) | |
| user_id | uuid FK (nullable) | Phase 2용 |
| created_at | timestamptz | |

> 참고: SQL 마이그레이션 파일은 아직 없음. 스키마는 Supabase 대시보드에서 직접 생성한 것으로 보임.

---

## 4. API 명세

모든 응답은 통일 형식: `{ success: boolean, data?: T, error?: string }`

### 4.1 GET /api/notes

노트 전체 목록 조회.

| 항목 | 값 |
|------|-----|
| Method | GET |
| Response | `{ success: true, data: Note[] }` |
| 정렬 | created_at DESC |
| 에러 | 500 — Supabase 쿼리 실패 |

### 4.2 POST /api/notes

새 노트 생성.

| 항목 | 값 |
|------|-----|
| Method | POST |
| Body | `{ noteType, problem?, solution?, understanding?, whatIBuilt?, learnings?, source?, codeSnippet?, tags, category, relatedConcepts, difficulty }` |
| Response | `{ success: true, data: Note }` |
| 변환 | camelCase → snake_case 후 DB 저장 |
| 에러 | 500 — 저장 실패 |

### 4.3 GET /api/notes/[id]

단일 노트 상세 조회.

| 항목 | 값 |
|------|-----|
| Method | GET |
| Params | id (uuid) |
| Response | `{ success: true, data: Note }` |
| 에러 | 404 — 노트 없음 |

### 4.4 PUT /api/notes/[id]

노트 부분 수정 (전달된 필드만 업데이트).

| 항목 | 값 |
|------|-----|
| Method | PUT |
| Params | id (uuid) |
| Body | 변경할 필드만 포함 (partial update) |
| Response | `{ success: true, data: Note }` |
| 에러 | 500 — 수정 실패 |

### 4.5 DELETE /api/notes/[id]

노트 삭제.

| 항목 | 값 |
|------|-----|
| Method | DELETE |
| Params | id (uuid) |
| Response | `{ success: true }` |
| 에러 | 500 — 삭제 실패 |

---

## 5. 컴포넌트 상세

### 5.1 page.tsx (메인 페이지)

**역할**: 앱의 진입점이자 상태 관리 중심.

**상태:**
```typescript
notes: Note[]                       // 전체 노트 목록
selectedIndex: number               // 선택된 노트 인덱스
loading: boolean                    // 로딩 중 여부
error: string | null                // 에러 메시지
mode: 'detail' | 'create' | 'edit' // 우측 패널 모드
```

**동작:**
- 마운트 시 `GET /api/notes`로 노트 목록 로드
- 생성: POST → 목록 맨 앞에 추가
- 수정: PUT → 목록에서 해당 노트 교체
- 삭제: DELETE → 목록에서 제거
- 빈 상태: "No notes yet" + "Write your first note" 버튼

### 5.2 Sidebar

| Props | 타입 | 설명 |
|-------|------|------|
| onNewNote | `() => void` | New Note 버튼 클릭 |
| noteCount | `number` | Notes 메뉴 옆 카운트 |

**메뉴 항목:**
- Notes (활성, 카운트 배지) / Search (비활성) / Projects (비활성)
- Coming Soon: Skill Map, Dashboard, Code Review (disabled)
- 하단: "DevNote v1.0 MVP"

### 5.3 NoteList

| Props | 타입 | 설명 |
|-------|------|------|
| notes | `Note[]` | 노트 배열 |
| selectedIndex | `number` | 선택 인덱스 (-1이면 선택 없음) |
| onSelect | `(index: number) => void` | 노트 클릭 |

**각 노트 아이템 표시:**
- 타입 라벨: "DEBUG" (빨강) / "LEARNING" (스카이블루)
- 제목: problem (debug) 또는 whatIBuilt (learning)
- 미리보기: solution 또는 learnings[0]의 첫 80자
- 태그 배지 (indigo/teal/amber 순환)
- 관련 개념 수 표시
- 날짜 (MM/DD)

### 5.4 NoteDetail

| Props | 타입 | 설명 |
|-------|------|------|
| note | `Note \| null` | 표시할 노트 |
| onEdit | `() => void` | 수정 버튼 클릭 |
| onDelete | `(id: string) => void` | 삭제 확인 후 |

**구성:**
1. 헤더: 타입 라벨 + Edit/Delete 버튼 + 제목 + 날짜 + 카테고리
2. 타입별 블록 (좌측 accent border + 투명 배경):
   - Debug: Problem (빨강) → Solution (초록) → Understanding (인디고)
   - Learning: What I Built (스카이블루) → What I Learned (바이올렛 리스트) → Source
3. Code Snippet (모노스페이스, 어두운 배경)
4. AI Context: 태그 + 관련 개념 (name + why) + 난이도 별점 + 카테고리
5. 삭제 확인 모달 (오버레이)

### 5.5 NoteForm

| Props | 타입 | 설명 |
|-------|------|------|
| onSave | `(note: Note) => void` | 저장 완료 콜백 |
| onCancel | `() => void` | 취소 |
| editNote | `Note?` | 수정 모드일 때 기존 노트 |

**동작:**
- 상단 타입 탭: Debug / Learning (수정 모드에서는 변경 불가)
- Debug 필드: Problem, Solution, Understanding (textarea)
- Learning 필드: What I Built (textarea), What I Learned (동적 리스트 입력), Source (textarea)
- Code Snippet: 토글로 표시/숨김
- 유효성 검사: 필수 필드 입력 시만 저장 버튼 활성화
- 저장 시 AI 필드(tags, category 등)는 빈 값으로 전송 (AI 자동 생성 미구현)
- 하단 안내: "AI will automatically generate tags, category, and related concepts"

### 5.6 UI 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| Tag | 태그 배지. 3가지 색상(indigo/teal/amber). 11px, 라운드 pill |
| DifficultyStars | 1~5 별점 표시. 활성/비활성 opacity 구분 |
| Icons | SVG 아이콘 9종 (notes, search, projects, skillmap, dashboard, codereview, plus, star, ai) |

---

## 6. 타입 시스템

### 6.1 Note (프론트엔드, camelCase)

```typescript
interface Note {
  id: string;
  noteType: 'debug' | 'learning';
  problem?: string | null;
  solution?: string | null;
  understanding?: string | null;
  whatIBuilt?: string | null;
  learnings?: string[] | null;
  source?: string | null;
  codeSnippet?: string | null;
  tags: string[];
  category: string;
  relatedConcepts: RelatedConcept[];
  difficulty: number;
  projectId?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 6.2 NoteRow (DB, snake_case)

API 레이어에서 `toNote(row)` 함수로 변환.

### 6.3 헬퍼 함수

| 함수 | 역할 |
|------|------|
| `toNote(row: NoteRow): Note` | DB → 프론트엔드 타입 변환 |
| `getNoteTitle(note)` | 노트 제목 추출 (problem 또는 whatIBuilt) |
| `getNotePreview(note)` | 미리보기 텍스트 80자 |
| `formatDate(iso)` | "MM/DD" 포맷 |
| `getTagColors(tags)` | 태그 색상 순환 배열 반환 |

---

## 7. 디자인 시스템

### 7.1 레이아웃

3컬럼 고정폭:
- Sidebar: 210px / NoteList: 380px / NoteDetail: flex (나머지)

### 7.2 테마

다크 모드 기본:
- Background: `#0F172A`
- Card/Sidebar: `#1E293B`
- Foreground: `#E2E8F0`
- Primary: `#818CF8` (인디고)
- Muted: `#9CA3AF`
- Border: `rgba(148, 163, 184, 0.08)` (거의 안 보이는 수준)

### 7.3 블록 스타일 규칙

- 전체 border 금지 — 좌측 3px accent border + 투명 배경만 사용
- Problem: 빨강 / Solution: 초록 / Understanding: 인디고
- What I Built: 스카이블루 / What I Learned: 바이올렛
- border-radius: `0 10px 10px 0` (우측만 라운드)

### 7.4 폰트

- UI: Inter
- 코드: JetBrains Mono

---

## 8. 구현 현황

### 완료 (Working)

| 기능 | 상세 |
|------|------|
| 노트 CRUD | 생성, 조회, 수정, 삭제 전부 동작 |
| 2가지 노트 타입 | Debug Note, Learning Note 분기 처리 |
| 폼 유효성 검사 | 필수 필드 미입력 시 저장 비활성화 |
| 3컬럼 UI | Sidebar + List + Detail 레이아웃 |
| 타입별 블록 렌더링 | 색상 코딩된 섹션 블록 |
| 태그/카테고리/난이도 표시 | AI Context 섹션에서 표시 |
| 삭제 확인 모달 | 오버레이 모달로 확인 후 삭제 |
| Supabase 연동 | 실제 PostgreSQL DB에 CRUD |
| 다크 테마 | 전체 앱 다크 모드 |
| 로딩/에러 상태 | 로딩 텍스트 + 에러 메시지 표시 |
| snake_case ↔ camelCase 변환 | API 레이어에서 자동 변환 |

### 미구현 (Not Started)

| 기능 | Phase | 비고 |
|------|-------|------|
| AI 자동 태그/카테고리 생성 | 1 | `/api/ai/analyze` 미구현. Anthropic SDK 미설치 |
| 검색 | 1 | 메뉴만 존재, 기능 없음 |
| 프로젝트 그룹핑 | 1 | 메뉴만 존재, 기능 없음 |
| Semantic Search (pgvector) | 1.5 | embedding 컬럼 nullable로 준비됨 |
| Skill Tree Dashboard | 2 | Coming Soon 라벨 |
| Code Review | 2 | Coming Soon 라벨 |
| Auth (로그인) | 2 | user_id 컬럼 nullable로 준비됨 |
| 페이지네이션 | - | 전체 노트를 한 번에 로드 |
| 정렬/필터 | - | created_at DESC 고정 |
| SQL 마이그레이션 파일 | - | Supabase 대시보드에서 직접 생성한 것으로 보임 |

---

## 9. 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=       # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key
NEXT_PUBLIC_APP_URL=            # 앱 URL (기본 http://localhost:3000)
ANTHROPIC_API_KEY=              # Claude API 키 (미사용, Phase 1 AI 구현 시 필요)
```

---

## 10. Phase 1 남은 작업

CLAUDE.md에 정의된 Phase 1 스코프 대비 미완료 항목:

1. **AI 자동 태그 생성** — `@anthropic-ai/sdk` 설치 + `/api/ai/analyze` 엔드포인트 구현
2. **검색** — 노트 제목/내용 텍스트 검색
3. **프로젝트 그룹핑** — 프로젝트 CRUD + 노트에 프로젝트 연결
