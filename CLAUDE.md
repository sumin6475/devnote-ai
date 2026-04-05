# CLAUDE.md — DevNote Project Rules
# CodeReview AI 프로젝트의 Phase 1: DevNote
# 마지막 업데이트: 2026-04-04

---

## 이 파일은 뭐고, 왜 쓰는 건지

이건 내가 AI 코딩 에이전트(Claude Code, Cursor 등)와 함께 프로젝트할 때, AI가 내 스택과 규칙을 처음부터 이해하고 코드를 짜도록 만든 설정 파일이야.

**이 파일이 커버하는 것**:
- DevNote 프로젝트 개요와 핵심 컨셉
- 노트 타입 2가지 (Debug Note + Learning Note)
- 기술 스택과 금지 목록
- 프로젝트 폴더 구조
- 코드 스타일 (네이밍, React 패턴, API 통신 패턴)
- Anthropic Claude API 사용법
- Supabase 사용 규칙
- 디자인 가이드 (DevNote 전용 컬러, 블록 스타일)
- Git/환경변수 규칙
- 디버깅 로그 자동 기록 (takeaway.md)

---

## 빌더 컨텍스트 (AI가 알아야 할 배경)

- 나는 upper beginner 레벨의 AI 빌더. 배우면서 만들고 있음
- 코드 생성 시 핵심 로직에 한국어 주석으로 "왜 이렇게 하는지" 간단히 설명 추가
- 너무 추상화하지 말 것 — 명시적이고 읽기 쉬운 코드 우선
- 내가 모를 수 있는 개념이 나오면 코드와 함께 짧게 설명해줘
- function calling, embeddings, RAG 등은 배우는 중이니 사용할 때 개념 설명 포함

---

## 프로젝트 개요: DevNote

### 한 줄 정의
DevNote = 개발자의 학습 순간을 캡처하고, AI가 맥락을 붙여주고, 경험치로 쌓아주는 도구

### 핵심 차별점 (이 3가지를 항상 기억)
1. **"배움"이 저장 단위** — 코드도, 활동도, 스니펫도 아닌 학습 경험이 기록 단위
2. **AI가 주니어를 도와줌** — 뭘 기록해야 할지 모르는 사람에게 자동 카테고리/관련 개념을 붙여줌
3. **성장이 시각화됨** — 기록이 스킬트리에 매핑되어 "내가 어디까지 왔는지" 보여줌

### 개발 단계
- Phase 1 (MVP): 노트 CRUD (2가지 타입) + AI 자동 태그 + 검색 + 프로젝트 그룹핑
- Phase 1.5: Embeddings + pgvector Semantic Search
- Phase 2: Skill Tree Dashboard + AI Code Review + Interview Questions + Auth
- Phase 3: Community, 블로그 내보내기, 팀 리뷰 모드

### Parent Project
DevNote는 CodeReview AI 프로젝트의 Phase 1이다. 같은 monorepo에서 Phase 2로 Code Review 기능을 확장할 예정.

---

## 노트 타입 (2가지)

DevNote는 두 가지 종류의 학습을 캡처한다. New Note 생성 시 타입을 선택.

### 타입 1: Debug Note — "에러에서 배운 것"
에러/버그를 해결하면서 배운 경험을 기록.

**유저 입력:**
- **Problem**: 무엇이 문제였는지 (예: "og:image 넣었는데 일부 사이트에서 썸네일 안 나옴")
- **Solution**: 어떻게 해결했는지 (예: "property 대신 name도 체크 + twitter:image fallback")
- **Understanding**: 왜 그런 건지 (예: "사이트마다 OG 태그 구현이 다름")
- **Code Snippet** (선택): 관련 코드 블록

**AI 자동 생성:**
- Tags (3~5개), Category (roadmap.sh 기반), Related Concepts (1~3개), Difficulty (1~5)

### 타입 2: Learning Note — "구현하면서 배운 것"
기능을 만들거나 개념을 학습하면서 알게 된 조각 지식들을 기록. 에러가 아니라 "오늘 이거 만들면서 이런 걸 알게 됐어"라는 학습 조각들.

**유저 입력:**
- **What I Built**: 뭘 만들었는지 / 뭘 하려고 했는지 (예: "스와이프로 페이지 넘기는 기능")
- **What I Learned**: 배운 것들 (여러 줄, 리스트 형태)
  - 예: "useRef는 렌더링 안 되는 값 저장용"
  - 예: "e.touches[0].clientX로 터치 좌표 가져옴"
  - 예: "스와이프 vs 탭은 이동 거리 threshold로 구분"
- **Source** (선택): 어디서 배웠는지 (프로젝트명, 강의, 문서 URL 등)
- **Code Snippet** (선택): 관련 코드 블록

**AI 자동 생성:**
- Tags, Category, Related Concepts, Difficulty (Debug Note와 동일한 AI 분석)

### 두 타입의 공통점
- 둘 다 AI가 자동으로 태그/카테고리/관련 개념을 붙여줌
- 둘 다 같은 스킬트리에 매핑됨 (Phase 2)
- 둘 다 같은 검색/필터에서 조회 가능
- 노트 리스트에서 타입 구분 라벨로 표시

---

## Tech Stack (이것만 써)

### Frontend
- Next.js (App Router) — Pages Router 사용 금지
- Tailwind CSS
- TypeScript 권장 (점진적 도입, .tsx)

### Backend / API
- Next.js Route Handlers (app/api/) — Express 별도 서버 불필요
- Supabase Client (서버 컴포넌트 + Route Handler에서 사용)

### Database
- Supabase (PostgreSQL)
- Supabase JS Client (@supabase/supabase-js)

### AI
- Anthropic Claude API (공식 SDK: `@anthropic-ai/sdk`)
- 모델: claude-haiku (자동 태그, 비용 절약) / claude-sonnet (코드 리뷰, Phase 2)
- Phase 1.5: OpenAI text-embedding-3-small (Supabase pgvector 저장)

### 배포
- Vercel (Next.js 배포 최적화)

### 개발 도구
- Claude Code / Cursor (IDE)
- Git + GitHub

---

## 금지사항 (절대 쓰지 마)

- Pages Router 사용 금지 → App Router만
- Express, Fastify 등 별도 백엔드 서버 금지 → Next.js Route Handlers로 처리
- MongoDB, Mongoose 사용 금지 → Supabase PostgreSQL 사용
- Redux, Zustand 등 복잡한 상태관리 금지 → React useState/useContext만
- GraphQL 금지 → REST API + Supabase Client
- Docker 금지 (MVP 단계에서)
- 테스트 프레임워크 자동 추가 금지 (Jest, Vitest 등)
- AI API를 클라이언트에서 직접 호출 금지 → 반드시 Route Handler(서버)에서만
- `transition-all` 사용 금지 → transform과 opacity만 animate
- 이모티콘을 UI 라벨로 사용 금지 (🔴🟢🔵 등) → 텍스트 + 색상으로 구분

---

## 프로젝트 구조

```
codereview-ai/
├── app/
│   ├── (devnote)/              # DevNote pages (Phase 1)
│   │   ├── notes/              # 노트 목록 / 생성 / 상세
│   │   ├── search/             # 검색
│   │   └── dashboard/          # 스킬트리 (Phase 2)
│   ├── (review)/               # CodeReview AI pages (Phase 2)
│   │   ├── upload/
│   │   ├── session/
│   │   └── history/
│   ├── api/                    # API Route Handlers
│   │   ├── notes/              # DevNote CRUD
│   │   ├── ai/                 # Claude API 호출
│   │   └── sessions/           # CodeReview 세션 (Phase 2)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing / redirect
├── components/                 # 공유 UI 컴포넌트
│   ├── Sidebar.tsx
│   ├── NoteList.tsx
│   ├── NoteDetail.tsx
│   ├── NoteForm.tsx            # Debug Note / Learning Note 폼 (타입 선택)
│   └── ui/                     # 기본 UI 요소 (Button, Input 등)
├── lib/                        # 공유 유틸
│   ├── supabase.ts             # Supabase client (중앙화)
│   ├── prompts/                # AI 프롬프트 분리 관리
│   │   ├── autoTag.ts          # 자동 태그 생성 프롬프트 (두 타입 모두)
│   │   └── codeReview.ts       # 코드 리뷰 프롬프트 (Phase 2)
│   └── utils/                  # 헬퍼 함수
├── supabase/                   # DB 마이그레이션, 스키마
├── public/
├── .env.local                  # 환경변수 (git에 올리지 않음)
├── .gitignore
├── CLAUDE.md                   # 이 파일
├── takeaway.md                 # 디버깅 로그
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 코드 스타일

### TypeScript / JavaScript
- 컴포넌트는 함수형 + Arrow Function
- async/await 사용 (콜백, .then() 체인 최소화)
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE
- 파일명: 컴포넌트는 PascalCase (NoteDetail.tsx), 유틸은 camelCase (formatDate.ts)
- 주석은 한국어로 간결하게

### React / Next.js 규칙
- 상태 관리: useState, useContext만 사용
- Side effect: useEffect 사용 (의존성 배열 항상 명시)
- 컴포넌트 한 파일에 하나 (export default)
- Props는 구조 분해 할당으로 받기: `const NoteCard = ({ title, tags, date }: NoteCardProps) => {}`
- 조건부 렌더링: 삼항 연산자 또는 && 사용
- 서버 컴포넌트 우선 사용, 클라이언트 컴포넌트는 'use client' 명시
- 데이터 페칭은 서버 컴포넌트에서 직접 또는 Route Handler를 통해

### API 통신 규칙

#### Route Handler 패턴 (app/api/)
```typescript
// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('notes')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
```

#### 클라이언트 fetch 패턴
```typescript
const fetchNotes = async () => {
  try {
    const res = await fetch('/api/notes');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  } catch (err) {
    console.error('fetch 실패:', err.message);
    // 사용자에게 에러 피드백
  }
};
```

- 서버 API 응답은 항상 통일된 형식: `{ success: true/false, data: ..., error: ... }`
- 에러 발생 시 적절한 HTTP status code 사용 (200, 400, 404, 500)

---

## Supabase 규칙

### Client 설정
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### DB 스키마 (Phase 1)

**notes 테이블:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK (gen_random_uuid()) | 고유 ID |
| note_type | text NOT NULL | 'debug' 또는 'learning' |
| problem | text (nullable) | Debug: 무엇이 문제였는지 |
| solution | text (nullable) | Debug: 어떻게 해결했는지 |
| understanding | text (nullable) | Debug: 왜 그런 건지 |
| what_i_built | text (nullable) | Learning: 뭘 만들었는지 / 하려고 했는지 |
| learnings | text[] (nullable) | Learning: 배운 것들 배열 |
| source | text (nullable) | Learning: 어디서 배웠는지 |
| code_snippet | text (nullable) | 관련 코드 블록 (공통, 선택) |
| tags | text[] | AI 생성 태그 배열 |
| category | text | AI 생성 카테고리 경로 |
| related_concepts | jsonb | AI 생성 관련 개념 [{name, why}] |
| difficulty | integer (1-5) | AI 생성 난이도 |
| project_id | uuid FK (nullable) | 프로젝트 연결 |
| user_id | uuid FK (nullable) | Phase 2 Auth용 (nullable로 미리 추가) |
| embedding | vector (nullable) | Phase 1.5 Semantic Search용 (nullable로 미리 추가) |
| created_at | timestamptz (now()) | 생성일 |
| updated_at | timestamptz (now()) | 수정일 |

**note_type별 필수/선택 필드:**
- `debug` 타입: problem, solution, understanding 필수. what_i_built, learnings, source는 null.
- `learning` 타입: what_i_built, learnings 필수. problem, solution, understanding은 null.
- code_snippet은 두 타입 모두 선택.

**projects 테이블:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | 고유 ID |
| name | text NOT NULL | 프로젝트명 |
| description | text (nullable) | 프로젝트 설명 |
| user_id | uuid FK (nullable) | Phase 2용 |
| created_at | timestamptz | 생성일 |

### 확장성 주의사항
- embedding, user_id 컬럼은 Phase 1에서 nullable로 미리 생성해둘 것
- Phase 2에서 review_sessions, answers, users 테이블 추가 예정
- RLS(Row Level Security)는 Phase 2 Auth 도입 시 활성화

---

## Anthropic Claude API 규칙

### 기본 원칙
- API key는 반드시 .env.local에 저장, 절대 하드코딩 금지
- 모든 Claude 호출은 app/api/ Route Handler 안에서만 (클라이언트 호출 금지)
- 에러 핸들링 필수: API 호출 실패 시 사용자에게 의미 있는 에러 메시지 반환

### SDK 설정
```typescript
// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### 자동 태그 생성 — 두 타입 통합
```typescript
// app/api/ai/analyze/route.ts
export async function POST(request: NextRequest) {
  const { noteType, problem, solution, understanding, whatIBuilt, learnings } = await request.json();

  let noteContent = '';

  if (noteType === 'debug') {
    noteContent = `## 디버그 노트
- 문제: ${problem}
- 해결: ${solution}
- 이해: ${understanding}`;
  } else {
    noteContent = `## 학습 노트
- 만든 것: ${whatIBuilt}
- 배운 것:
${learnings.map(l => `  - ${l}`).join('\n')}`;
  }

  const message = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `아래 개발 노트를 분석해서 JSON으로만 응답해줘.

${noteContent}

## 응답 형식 (JSON만, 다른 텍스트 없이)
{
  "tags": ["기술 키워드 3~5개"],
  "category": "roadmap.sh 기준 카테고리 경로 (예: Frontend > React > Hooks)",
  "relatedConcepts": [
    { "name": "개념명", "why": "왜 이걸 알아야 하는지 실무 연결 설명" }
  ],
  "difficulty": 1-5
}`
    }]
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsed = JSON.parse(text);
  return NextResponse.json({ success: true, data: parsed });
}
```

### AI 프롬프트 관리
- 프롬프트는 lib/prompts/ 폴더에 분리
- Debug Note와 Learning Note는 같은 API 엔드포인트에서 noteType으로 분기
- Phase 2에서 코드 리뷰 프롬프트, 답변 평가 프롬프트 추가 예정

---

## 디자인 가이드

### 전체 톤
- SnippetsLab, massCode, VS Code 같은 개발자 도구 느낌
- DevNote만의 학습 구조가 명확히 드러나는 UI
- 이모티콘 사용 금지 — 라벨은 텍스트 + 색상만으로 구분

### 컬러 팔레트 (Indigo 기반, Light/Dark 모드)

| Token | Light | Dark |
|-------|-------|------|
| Primary | #6366F1 | #818CF8 |
| Background | #F8FAFC | #0F172A |
| Card / Sidebar | #FFFFFF / #F3F4F6 | #1E293B |
| Note Detail BG | — | #0B1120 (살짝 더 어두움 → 깊이감) |
| Foreground | #1E293B | #E2E8F0 |
| Muted Text | #6B7280 | #9CA3AF |
| Border | #D1D5DB | #4B5563 |
| Accent | #E0E7FF | #374151 |
| Destructive | #EF4444 | #EF4444 |

Typography: Inter (UI), JetBrains Mono (코드)

### Debug Note 블록 스타일

핵심 원칙: 전체 border 금지. 배경 opacity + 좌측 accent border만 사용.

**Problem 블록:**
```css
/* 라벨: color: #ef4444, uppercase, letter-spacing: 0.06em */
background: rgba(183, 28, 28, 0.08);
border: none;
border-left: 3px solid #b71c1c;
border-radius: 0 10px 10px 0;
padding: 14px 18px;
```

**Solution 블록:**
```css
/* 라벨: color: #22c55e, uppercase, letter-spacing: 0.06em */
background: rgba(0, 98, 57, 0.08);
border: none;
border-left: 3px solid #006239;
border-radius: 0 10px 10px 0;
padding: 14px 18px;
```

**Understanding 블록:**
```css
/* 라벨: color: #818cf8, uppercase, letter-spacing: 0.06em */
background: rgba(99, 102, 241, 0.06);
border: none;
border-left: 3px solid #6366f1;
border-radius: 0 10px 10px 0;
padding: 14px 18px;
```

### Learning Note 블록 스타일

**What I Built 블록:**
```css
/* 라벨: color: #38bdf8 (sky blue), uppercase, letter-spacing: 0.06em */
background: rgba(56, 189, 248, 0.06);
border: none;
border-left: 3px solid #0284c7;
border-radius: 0 10px 10px 0;
padding: 14px 18px;
```

**What I Learned 블록:**
```css
/* 라벨: color: #a78bfa (violet), uppercase, letter-spacing: 0.06em */
background: rgba(167, 139, 250, 0.06);
border: none;
border-left: 3px solid #7c3aed;
border-radius: 0 10px 10px 0;
padding: 14px 18px;
/* 내부 항목은 bullet list 형태로 표시 */
```

### 노트 리스트에서 타입 구분
- Debug Note: 리스트 카드에 "DEBUG" 라벨 (작고, muted, 텍스트만)
- Learning Note: 리스트 카드에 "LEARNING" 라벨 (작고, muted, 텍스트만)
- 또는 좌측에 얇은 컬러 바로 구분 (debug = red계열, learning = sky blue계열)

### 태그 스타일
solid border 금지. 배경 opacity + 미세한 border만 사용.
```css
font-size: 11px; font-weight: 500; padding: 2px 10px; border-radius: 20px;

/* Indigo */ background: rgba(99,102,241,0.12); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.25);
/* Teal */   background: rgba(20,184,166,0.12); color: #5eead4; border: 1px solid rgba(20,184,166,0.25);
/* Amber */  background: rgba(245,158,11,0.12); color: #fcd34d; border: 1px solid rgba(245,158,11,0.25);
```

### 구분선 처리
- 섹션 구분은 선(border)이 아니라 여백과 배경 톤 차이로 처리
- 사이드바/리스트 구분선: `border: 1px solid rgba(148,163,184,0.08)` (거의 안 보이는 수준)
- 카드나 블록에 눈에 띄는 border 주지 않기

### 레이아웃 (3컬럼)
- Left: Sidebar (210px) — Notes, Search, Projects + Coming Soon (Skill Map, Dashboard, Code Review)
- Center: Note List (380px) — 노트 목록 + 미리보기 + AI 태그 + 타입 표시
- Right: Note Detail (flex) — 타입에 따라 Debug 또는 Learning 블록 + AI 컨텍스트

### Anti-Generic 디자인 규칙
- 기본 Tailwind 팔레트 그대로 쓰지 말 것 → 위에 정의된 커스텀 컬러 사용
- 플랫한 shadow-md 대신 레이어드, 컬러 틴티드 섀도우 사용
- 큰 제목: tracking 타이트하게 (-0.02em), 본문: line-height 넉넉하게 (1.65)
- 클릭 가능한 모든 요소에 hover, focus-visible, active 상태 필수
- 서피스 레이어링 시스템 사용 (sidebar → list → detail 각각 배경 톤 다르게)
- 간격: 의도적이고 일관된 spacing 토큰 사용

### 코드 스니펫 블록 (두 타입 공통)
```css
background: rgba(15, 23, 42, 0.8);
border: 1px solid rgba(148, 163, 184, 0.08);
border-radius: 10px;
padding: 16px 20px;
font-family: 'JetBrains Mono', 'Fira Code', monospace;
font-size: 12.5px;
line-height: 1.7;
color: #94a3b8;
```

### AI Context 섹션 (두 타입 공통)
```css
background: rgba(99, 102, 241, 0.04);
border: 1px solid rgba(99, 102, 241, 0.08);
border-radius: 12px;
padding: 18px 22px;
```

### New Note 폼
- 상단에 타입 선택: "Debug" / "Learning" 토글 또는 탭
- 선택한 타입에 따라 입력 필드가 바뀜
  - Debug: Problem, Solution, Understanding 텍스트 영역 3개
  - Learning: What I Built 텍스트 영역 1개 + What I Learned 리스트 입력 (동적으로 항목 추가/삭제) + Source 텍스트 영역 1개
- Code Snippet은 두 타입 모두 선택적 입력
- "저장" 누르면 AI 분석 → 태그/카테고리 자동 생성 → DB 저장

---

## 환경변수 템플릿

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- .env.local 파일은 절대 git에 올리지 않음
- .env.example 파일을 만들어서 필요한 변수 목록만 기록

---

## Git 규칙

### .gitignore 필수 항목
```
node_modules/
.env.local
.env
.next/
dist/
.DS_Store
*.log
```

### 커밋 메시지
- 영어로 작성, 간결하게
- 형식: `[영역] 설명` (예: `[api] add Claude auto-tag endpoint`, `[ui] note detail layout`)
- 동사 원형으로 시작 (add, fix, update, remove, refactor)

### 한국어 → 영어 전환 규칙
- 개발 중: 코드 주석은 한국어 OK
- 배포/공개 전: 한국어 주석을 영어로 교체 요청할 것
- 커밋 메시지는 처음부터 영어

---

## Takeaway 자동 기록 규칙

이 프로젝트에는 `takeaway.md` 파일이 루트에 있다.
에러/버그를 해결했을 때, AI가 이 파일에 디버깅 로그를 기록한다.

### 트리거 조건

**수동 트리거**: 사용자가 "기록해", "takeaway", "로그 남겨" 라고 말하면 즉시 기록.

**자동 트리거**: 아래 상황에서 AI가 먼저 제안한다 → "이거 takeaway에 추가할까요?"
- 사용자가 모르던 에러를 디버깅해서 해결했을 때 (원인이 비자명한 경우)
- 로컬에서는 작동하지만 배포 환경에서 실패하는 문제를 고쳤을 때
- 외부 서비스(API, CDN, DB)의 예상 밖 동작이 원인이었을 때
- 같은 패턴의 실수가 반복될 가능성이 있을 때

**기록하지 않는 것**:
- 단순 오타, import 경로 오류 같은 자명한 실수
- 사용자가 직접 원인을 알고 있고 그냥 수정 요청만 한 경우
- 스타일/디자인 변경 (기능 버그가 아닌 것)

### 기록 포맷

takeaway.md의 `## 로그` 섹션 맨 아래에 추가:

```markdown
### [YYYY-MM-DD] 한 줄 제목
- **증상**: 사용자가 본 문제
- **원인**: 근본 원인 (왜 그랬는지)
- **해결**: 코드 변경 요약 (어떤 파일에서 뭘 바꿨는지)
- **교훈**: 다음에 같은 실수 안 하려면 (한 줄)
- **태그**: `#태그`
```

태그: `#fetch-defense` `#api-error` `#deploy` `#db` `#cors` `#env` `#state` `#async` `#ui` `#auth` `#supabase` `#claude-api` `#next-js` `#other`

### DevNote와의 연결
takeaway.md의 기록은 나중에 DevNote 앱 자체에 노트로 옮길 수 있음. DevNote가 완성되면 이 파일 대신 앱에서 직접 기록하는 것이 목표.

---

## Vercel 배포 주의사항

- Vercel 무료 플랜: serverless function 실행시간 10초 제한
- Claude API 응답이 길어질 경우 streaming 처리 필요할 수 있음
- 환경변수는 Vercel 대시보드에서 별도 설정 (ANTHROPIC_API_KEY, SUPABASE 키 등)
- `next.config.js`에서 필요시 serverless function timeout 설정

---

## 이 파일의 유효 기간

이 규칙은 DevNote Phase 1~2 개발 기간 동안 유효함.
Phase 2에서 Auth, Skill Tree 등이 추가되면 해당 섹션을 업데이트할 것.
