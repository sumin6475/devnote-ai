// DevNote MVP mock 데이터 — DB 연결 전 UI 테스트용
// 노트 타입 2가지: Debug Note (에러에서 배운 것) + Learning Note (구현하면서 배운 것)

export type TagColor = 'indigo' | 'teal' | 'amber';

export type RelatedConcept = {
  name: string;
  why: string;
};

// 공통 필드
type NoteBase = {
  id: number;
  title: string;
  preview: string;
  tags: string[];
  tagColors: TagColor[];
  date: string;
  difficulty: number;
  project: string;
  category: string;
  codeSnippet?: string;
  relatedConcepts: RelatedConcept[];
};

// Debug Note — Problem / Solution / Understanding
export type DebugNote = NoteBase & {
  noteType: 'debug';
  problem: string;
  solution: string;
  understanding: string;
};

// Learning Note — What I Built / What I Learned / Source
export type LearningNote = NoteBase & {
  noteType: 'learning';
  whatIBuilt: string;
  learnings: string[];
  source?: string;
};

export type Note = DebugNote | LearningNote;

export const NOTES: Note[] = [
  {
    id: 1,
    noteType: 'debug',
    title: "og:image를 넣었는데 카카오톡에서는 보이지만 트위터에서는 썸네일이 안 나옴",
    preview: "og:image 외에 twitter:image 메타 태그도 추가. property ...",
    tags: ["Open Graph", "메타태그", "SEO"],
    tagColors: ["indigo", "teal", "amber"],
    date: "04/03",
    difficulty: 2,
    project: "LinkPreview",
    category: "Frontend > Web Standards > Open Graph",
    problem:
      "og:image 메타 태그를 넣었는데, 카카오톡에서는 썸네일이 정상적으로 보이지만 트위터와 슬랙에서는 이미지가 표시되지 않음",
    solution:
      "property 대신 name 속성도 체크하도록 변경. twitter:image를 fallback으로 추가. 상대경로를 절대경로로 변환하는 resolveImageUrl() 함수 추가",
    understanding:
      "사이트마다 OG 태그 구현이 다르다. 일부는 property 속성을, 일부는 name 속성을 읽는다. 상대경로는 브라우저 밖(크롤러)에서는 resolve가 안 되기 때문에 반드시 절대경로를 사용해야 한다.",
    codeSnippet: `function getMetaImage(html, baseUrl) {
  const selectors = [
    'meta[property="og:image"]',
    'meta[name="og:image"]',
    'meta[name="twitter:image"]',
    'meta[property="twitter:image"]',
  ];
  for (const sel of selectors) {
    const el = html.querySelector(sel);
    if (el?.content) {
      return resolveUrl(el.content, baseUrl);
    }
  }
  return null;
}`,
    relatedConcepts: [
      {
        name: "Social Crawlers",
        why: "각 플랫폼이 OG 태그를 다르게 파싱하는 이유를 이해해야 디버깅 가능",
      },
      {
        name: "URL Resolution",
        why: "상대경로가 서버사이드에서 작동하지 않는 원리 — Node.js의 new URL() 활용",
      },
      {
        name: "Meta Tag Validators",
        why: "Facebook Debugger, Twitter Card Validator로 사전 검증하는 습관",
      },
    ],
  },
  {
    id: 2,
    noteType: 'debug',
    title: "useEffect 안에서 async 함수를 직접 쓰면 React가 경고를 띄움",
    preview: "useEffect 내부에 async 함수를 선언하고 즉시 호출하는 패...",
    tags: ["React", "useEffect", "async/await"],
    tagColors: ["indigo", "teal", "amber"],
    date: "04/02",
    difficulty: 3,
    project: "DevNote",
    category: "Frontend > React > Hooks",
    problem:
      "useEffect에 async 함수를 직접 전달하면 React가 경고를 띄움. 데이터 페칭 시 매번 경고가 발생해서 콘솔이 지저분해짐",
    solution:
      "useEffect 내부에 async 함수를 별도로 선언하고 바로 호출하는 패턴 사용. 또는 즉시 실행 함수(IIFE)로 감싸기",
    understanding:
      "useEffect의 콜백은 cleanup 함수(또는 undefined)를 반환해야 하는데, async 함수는 항상 Promise를 반환한다. React가 이 Promise를 cleanup 함수로 처리하려다 문제가 생기는 것.",
    codeSnippet: `useEffect(() => {
  // async 함수를 내부에 선언하고 호출
  const fetchData = async () => {
    const res = await fetch('/api/notes');
    const data = await res.json();
    setNotes(data);
  };
  fetchData();
}, []);`,
    relatedConcepts: [
      {
        name: "useEffect Cleanup",
        why: "비동기 작업 취소와 메모리 누수 방지를 위한 cleanup 패턴 이해 필수",
      },
      {
        name: "AbortController",
        why: "컴포넌트 언마운트 시 진행 중인 fetch를 취소하는 실전 패턴",
      },
      {
        name: "React Strict Mode",
        why: "개발 모드에서 useEffect가 두 번 실행되는 이유와 올바른 대응법",
      },
    ],
  },
  {
    id: 3,
    noteType: 'debug',
    title: "Supabase RLS를 켰더니 모든 쿼리가 빈 배열을 반환함",
    preview: "RLS 정책을 추가해야 함. anon 키로 접근 시 SELECT 정책이...",
    tags: ["Supabase", "RLS", "PostgreSQL"],
    tagColors: ["teal", "amber", "indigo"],
    date: "04/01",
    difficulty: 3,
    project: "DevNote",
    category: "Backend > Database > PostgreSQL > Security",
    problem:
      "Supabase 대시보드에서 RLS(Row Level Security)를 활성화했더니, 분명 데이터가 있는데도 모든 SELECT 쿼리가 빈 배열을 반환함",
    solution:
      "RLS 활성화 후 명시적으로 SELECT 정책을 추가. 개발 단계에서는 `USING (true)` 정책으로 공개 읽기를 허용하고, 이후 auth.uid() 기반 정책으로 전환",
    understanding:
      "RLS가 켜지면 기본적으로 모든 접근이 차단된다(deny by default). 정책을 하나도 추가하지 않으면 어떤 쿼리도 결과를 반환하지 않는다. 이건 보안상 올바른 디폴트.",
    codeSnippet: `-- RLS 정책 추가 (개발용 공개 읽기)
CREATE POLICY "Allow public read"
  ON notes FOR SELECT
  USING (true);

-- 프로덕션용: 인증된 유저만 자기 노트 읽기
CREATE POLICY "Users read own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);`,
    relatedConcepts: [
      {
        name: "Row Level Security",
        why: "Supabase의 핵심 보안 모델 — 정책 없이 RLS 켜면 모든 접근 차단됨",
      },
      {
        name: "Supabase Auth",
        why: "auth.uid() 기반 정책을 쓰려면 인증 시스템 연동이 선행되어야 함",
      },
      {
        name: "PostgreSQL Policies",
        why: "USING vs WITH CHECK 차이 — SELECT는 USING, INSERT/UPDATE는 WITH CHECK",
      },
    ],
  },
  {
    id: 4,
    noteType: 'debug',
    title: "Tailwind CSS에서 동적 클래스명이 적용 안 됨",
    preview: "Tailwind은 빌드 타임에 클래스를 스캔하므로 동적 문자열 조...",
    tags: ["Tailwind CSS", "JIT", "CSS"],
    tagColors: ["amber", "indigo", "teal"],
    date: "03/30",
    difficulty: 2,
    project: "Portfolio",
    category: "Frontend > CSS > Tailwind",
    problem:
      "Tailwind CSS에서 `bg-${color}-500` 같은 동적 클래스명을 사용했는데 스타일이 전혀 적용되지 않음. 브라우저 개발자 도구에서 보면 해당 CSS 클래스 자체가 존재하지 않음",
    solution:
      "동적으로 문자열을 조합하는 대신, 완전한 클래스명을 값으로 가진 맵핑 객체를 만들어서 사용. safelist에 등록하는 방법도 있지만 맵핑이 더 명시적",
    understanding:
      "Tailwind JIT 컴파일러는 빌드 타임에 소스 코드를 정적으로 스캔해서 사용된 클래스를 추출한다. 런타임에 문자열을 조합해서 만든 클래스명은 빌드 시점에 존재하지 않으므로 CSS가 생성되지 않는다.",
    codeSnippet: `// X 동적 조합 — Tailwind이 인식 못함
const cls = \`bg-\${color}-500\`;

// O 완전한 클래스명 맵핑
const colorMap = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
};
const cls = colorMap[color];`,
    relatedConcepts: [
      {
        name: "Tailwind JIT Engine",
        why: "정적 분석 기반이라 동적 클래스를 인식 못하는 근본 원리 이해",
      },
      {
        name: "Safelist",
        why: "동적 클래스가 꼭 필요할 때 safelist로 강제 포함시키는 방법",
      },
      {
        name: "CSS-in-JS vs Utility-First",
        why: "두 접근법의 트레이드오프 — 동적 스타일이 많으면 CSS-in-JS가 나을 수도",
      },
    ],
  },
  {
    id: 5,
    noteType: 'debug',
    title: "Docker 컨테이너에서 Node.js 앱이 localhost로 바인딩해서 외부에서 접근 불가",
    preview: "HOST를 0.0.0.0으로 설정. localhost(127.0.0.1)는 컨테이...",
    tags: ["Docker", "네트워킹", "Node.js"],
    tagColors: ["teal", "indigo", "amber"],
    date: "03/28",
    difficulty: 2,
    project: "API Server",
    category: "DevOps > Docker > Networking",
    problem:
      "Docker 컨테이너 안에서 Node.js 앱을 실행하고 -p 3000:3000 으로 포트를 매핑했는데, 호스트에서 localhost:3000에 접근하면 connection refused가 뜸",
    solution:
      "서버의 HOST 바인딩을 localhost(127.0.0.1) 대신 0.0.0.0 으로 변경. Docker 컨테이너 내부의 localhost는 컨테이너 자신만 가리키므로 외부 접근 불가",
    understanding:
      "localhost(127.0.0.1)는 loopback 인터페이스로 해당 머신 자체만 가리킨다. 컨테이너 안에서 이걸로 바인딩하면 컨테이너 외부(호스트)에서는 접근할 수 없다. 0.0.0.0은 모든 네트워크 인터페이스를 의미하므로 외부 접근이 가능해진다.",
    codeSnippet: `// X 컨테이너 내부에서만 접근 가능
app.listen(3000, 'localhost', () => {
  console.log('Server running');
});

// O 모든 인터페이스에서 접근 가능
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:3000');
});`,
    relatedConcepts: [
      {
        name: "Network Namespaces",
        why: "Docker 컨테이너가 독립된 네트워크 스택을 가지는 원리",
      },
      {
        name: "Port Mapping",
        why: "-p 플래그의 동작 원리 — 호스트 포트와 컨테이너 포트의 관계",
      },
      {
        name: "Bridge Network",
        why: "Docker 기본 네트워크 모드에서 컨테이너 간 통신이 어떻게 이루어지는지",
      },
    ],
  },
  {
    id: 6,
    noteType: 'learning',
    title: "터치 스와이프로 페이지 넘기는 기능 구현하면서 배운 것들",
    preview: "useRef로 터치 시작 좌표 저장, threshold로 스와이프/탭 구분...",
    tags: ["React", "Touch Events", "useRef"],
    tagColors: ["indigo", "teal", "amber"],
    date: "04/02",
    difficulty: 2,
    project: "MobileApp",
    category: "Frontend > React > Event Handling",
    whatIBuilt:
      "모바일에서 좌우 스와이프로 카드 페이지를 넘기는 기능. 터치 시작점과 끝점의 거리를 계산해서 일정 threshold 이상이면 페이지 전환",
    learnings: [
      "useRef는 렌더링을 트리거하지 않는 값 저장용. 터치 시작 좌표를 저장할 때 useState 대신 useRef를 쓰면 불필요한 리렌더링 방지",
      "e.touches[0].clientX로 터치 좌표를 가져옴. touchstart에서 저장하고 touchend에서 비교",
      "스와이프 vs 탭은 이동 거리 threshold(50px)로 구분. threshold 없으면 살짝 움직여도 페이지가 넘어감",
      "CSS transform: translateX()로 애니메이션 처리. transition 속성과 함께 써야 부드럽게 슬라이드",
    ],
    source: "React 공식 문서 + MDN Touch Events",
    codeSnippet: `const startX = useRef(0);
const THRESHOLD = 50;

const onTouchStart = (e) => {
  startX.current = e.touches[0].clientX;
};

const onTouchEnd = (e) => {
  const diff = e.changedTouches[0].clientX - startX.current;
  if (Math.abs(diff) > THRESHOLD) {
    diff > 0 ? prevPage() : nextPage();
  }
};`,
    relatedConcepts: [
      {
        name: "Passive Event Listeners",
        why: "터치 이벤트에서 성능 최적화를 위해 passive: true 설정이 중요한 이유",
      },
      {
        name: "requestAnimationFrame",
        why: "스와이프 애니메이션을 더 부드럽게 만들기 위한 프레임 동기화",
      },
      {
        name: "Gesture Libraries",
        why: "직접 구현 대신 react-use-gesture 같은 라이브러리로 복잡한 제스처 처리",
      },
    ],
  },
  {
    id: 7,
    noteType: 'learning',
    title: "Next.js App Router에서 서버/클라이언트 컴포넌트 구분 학습",
    preview: "기본이 서버 컴포넌트, useState 쓰려면 'use client' 필수...",
    tags: ["Next.js", "App Router", "RSC"],
    tagColors: ["teal", "indigo", "amber"],
    date: "03/29",
    difficulty: 3,
    project: "DevNote",
    category: "Frontend > Next.js > App Router",
    whatIBuilt:
      "DevNote 프로젝트의 기본 레이아웃. 서버 컴포넌트에서 데이터를 fetch하고 클라이언트 컴포넌트에서 상호작용을 처리하는 구조",
    learnings: [
      "App Router에서 모든 컴포넌트는 기본적으로 서버 컴포넌트. useState, useEffect 같은 훅을 쓰려면 파일 맨 위에 'use client' 선언 필수",
      "서버 컴포넌트에서는 async/await로 직접 데이터 페칭 가능. fetch()에 별도 API 라우트 없이 DB에 직접 접근할 수도 있음",
      "클라이언트 컴포넌트 안에서 서버 컴포넌트를 import하면 그 서버 컴포넌트도 클라이언트로 전환됨. 이걸 피하려면 children prop으로 전달",
      "'use client' 경계는 가능한 한 아래로 내리는 게 좋음. 전체 페이지를 클라이언트로 만들면 서버 컴포넌트의 이점(번들 크기 감소, 보안)을 잃음",
    ],
    source: "Next.js 공식 문서 — Server and Client Components",
    relatedConcepts: [
      {
        name: "React Server Components",
        why: "Next.js App Router의 기반 기술. 서버에서만 실행되어 번들 크기를 줄이는 원리",
      },
      {
        name: "Hydration",
        why: "클라이언트 컴포넌트가 서버 렌더링 결과를 받아 상호작용을 붙이는 과정",
      },
      {
        name: "Streaming SSR",
        why: "서버 컴포넌트와 함께 사용하면 점진적 로딩이 가능한 이유",
      },
    ],
  },
];

// 사이드바 메뉴 아이템
export const SIDEBAR_MENU = [
  { label: "Notes", icon: "notes" as const, active: true, count: 7 },
  { label: "Search", icon: "search" as const },
  { label: "Projects", icon: "projects" as const },
];

export const COMING_SOON = [
  { label: "Skill Map", icon: "skillmap" as const },
  { label: "Dashboard", icon: "dashboard" as const },
  { label: "Code Review", icon: "codereview" as const },
];

// 태그 컬러 맵
export const TAG_COLOR_MAP = {
  indigo: {
    bg: "rgba(99,102,241,0.12)",
    text: "#a5b4fc",
    border: "rgba(99,102,241,0.25)",
  },
  teal: {
    bg: "rgba(20,184,166,0.12)",
    text: "#5eead4",
    border: "rgba(20,184,166,0.25)",
  },
  amber: {
    bg: "rgba(245,158,11,0.12)",
    text: "#fcd34d",
    border: "rgba(245,158,11,0.25)",
  },
} as const;
