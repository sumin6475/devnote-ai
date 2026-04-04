export interface RelatedConcept {
  name: string;
  why: string;
}

export interface Note {
  id: string;
  problem: string;
  solution: string;
  understanding: string;
  codeSnippet?: string;
  tags: string[];
  category: string;
  relatedConcepts: RelatedConcept[];
  difficulty: number;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export const mockProjects: Project[] = [
  { id: "p1", name: "DevNote", description: "AI 기반 개발자 학습 저널", createdAt: "2026-03-20T09:00:00Z" },
  { id: "p2", name: "Portfolio Site", description: "개인 포트폴리오 웹사이트", createdAt: "2026-03-15T09:00:00Z" },
  { id: "p3", name: "E-commerce API", description: "쇼핑몰 백엔드 API", createdAt: "2026-03-10T09:00:00Z" },
];

export const mockNotes: Note[] = [
  {
    id: "n1",
    problem: "og:image를 넣었는데 카카오톡에서는 보이지만 트위터에서는 썸네일이 안 나옴",
    solution: "og:image 외에 twitter:image 메타 태그도 추가. property 대신 name 속성 사용해야 트위터가 인식함",
    understanding: "각 플랫폼(Facebook, Twitter, KakaoTalk)이 OG 태그를 파싱하는 방식이 다름. Twitter는 자체 twitter: 접두사 메타 태그를 우선 사용하고, 없으면 og: 태그로 fallback",
    codeSnippet: `<meta property="og:image" content="https://example.com/og.png" />\n<meta name="twitter:image" content="https://example.com/og.png" />\n<meta name="twitter:card" content="summary_large_image" />`,
    tags: ["Open Graph", "메타태그", "SEO", "Twitter Cards"],
    category: "Frontend > Web Standards > Open Graph",
    relatedConcepts: [
      { name: "Social Crawlers", why: "각 플랫폼이 OG 태그를 다르게 파싱하는 원리" },
      { name: "URL Resolution", why: "상대경로가 브라우저 밖에서 작동 안 하는 원리" },
    ],
    difficulty: 2,
    projectId: "p2",
    createdAt: "2026-04-03T14:30:00Z",
    updatedAt: "2026-04-03T14:30:00Z",
  },
  {
    id: "n2",
    problem: "useEffect 안에서 async 함수를 직접 쓰면 React가 경고를 띄움",
    solution: "useEffect 내부에 async 함수를 선언하고 즉시 호출하는 패턴 사용. cleanup에서 AbortController로 취소 처리",
    understanding: "useEffect의 콜백은 cleanup 함수(또는 undefined)를 반환해야 하는데, async 함수는 항상 Promise를 반환하기 때문에 타입이 맞지 않음",
    codeSnippet: `useEffect(() => {\n  const controller = new AbortController();\n  const fetchData = async () => {\n    try {\n      const res = await fetch('/api/data', { signal: controller.signal });\n      const data = await res.json();\n      setData(data);\n    } catch (e) {\n      if (!controller.signal.aborted) console.error(e);\n    }\n  };\n  fetchData();\n  return () => controller.abort();\n}, []);`,
    tags: ["React", "useEffect", "async/await", "AbortController"],
    category: "Frontend > React > Hooks",
    relatedConcepts: [
      { name: "Race Condition", why: "컴포넌트 언마운트 후 setState 호출 방지" },
      { name: "Cleanup Functions", why: "useEffect의 생명주기와 리소스 해제" },
    ],
    difficulty: 3,
    projectId: "p1",
    createdAt: "2026-04-02T10:15:00Z",
    updatedAt: "2026-04-02T10:15:00Z",
  },
  {
    id: "n3",
    problem: "Supabase RLS를 켰더니 모든 쿼리가 빈 배열을 반환함",
    solution: "RLS 정책을 추가해야 함. anon 키로 접근 시 SELECT 정책이 없으면 아무 데이터도 안 보임. service_role 키는 RLS를 우회함",
    understanding: "RLS(Row Level Security)는 PostgreSQL의 행 단위 보안 기능. 테이블에 enable하면 기본적으로 모든 접근이 차단되고, POLICY를 명시적으로 추가해야 접근 가능",
    tags: ["Supabase", "RLS", "PostgreSQL", "보안"],
    category: "Backend > Database > PostgreSQL",
    relatedConcepts: [
      { name: "JWT Claims", why: "auth.uid()가 토큰에서 유저 ID를 추출하는 방식" },
      { name: "service_role vs anon key", why: "각 키의 권한 차이와 보안 의미" },
    ],
    difficulty: 3,
    projectId: "p1",
    createdAt: "2026-04-01T16:45:00Z",
    updatedAt: "2026-04-01T16:45:00Z",
  },
  {
    id: "n4",
    problem: "Tailwind CSS에서 동적 클래스명이 적용 안 됨 (예: `bg-${color}-500`)",
    solution: "Tailwind은 빌드 타임에 클래스를 스캔하므로 동적 문자열 조합은 불가. safelist에 추가하거나 완전한 클래스명을 조건부로 사용",
    understanding: "Tailwind의 JIT 컴파일러는 소스 코드에서 정규식으로 클래스명을 추출함. 문자열 조합으로 만든 클래스는 빌드 시점에 존재하지 않아 CSS가 생성되지 않음",
    codeSnippet: `// ❌ Wrong\nconst cls = \`bg-\${color}-500\`;\n\n// ✅ Correct\nconst colorMap = {\n  red: 'bg-red-500',\n  blue: 'bg-blue-500',\n};\nconst cls = colorMap[color];`,
    tags: ["Tailwind CSS", "JIT", "CSS", "빌드"],
    category: "Frontend > CSS > Tailwind",
    relatedConcepts: [
      { name: "PurgeCSS", why: "Tailwind이 사용하지 않는 CSS를 제거하는 메커니즘" },
      { name: "CSS-in-JS vs Utility", why: "런타임 vs 빌드타임 스타일링의 트레이드오프" },
    ],
    difficulty: 2,
    projectId: "p2",
    createdAt: "2026-03-30T11:20:00Z",
    updatedAt: "2026-03-30T11:20:00Z",
  },
  {
    id: "n5",
    problem: "Docker 컨테이너에서 Node.js 앱이 localhost로 바인딩해서 외부에서 접근 불가",
    solution: "HOST를 0.0.0.0으로 설정. localhost(127.0.0.1)는 컨테이너 내부 루프백만 리스닝하므로 포트 매핑이 있어도 외부에서 접근 불가",
    understanding: "Docker 컨테이너는 자체 네트워크 네임스페이스를 가짐. 127.0.0.1은 컨테이너 내부에서만 유효하고, 호스트나 다른 컨테이너에서 접근하려면 0.0.0.0(모든 인터페이스)으로 바인딩해야 함",
    tags: ["Docker", "네트워킹", "Node.js", "배포"],
    category: "DevOps > Deployment > Docker",
    relatedConcepts: [
      { name: "Network Namespaces", why: "컨테이너 격리의 핵심 메커니즘" },
      { name: "Bridge Network", why: "Docker 기본 네트워크 모드와 컨테이너 간 통신" },
    ],
    difficulty: 2,
    projectId: "p3",
    createdAt: "2026-03-28T09:00:00Z",
    updatedAt: "2026-03-28T09:00:00Z",
  },
  {
    id: "n6",
    problem: "TypeScript에서 객체의 키로 변수를 사용할 때 타입 에러 발생",
    solution: "keyof typeof 또는 Record 타입을 사용하여 키 타입을 명시. as const로 리터럴 타입 유지",
    understanding: "TypeScript는 문자열 변수를 string 타입으로 추론하지만, 객체의 키 접근에는 구체적인 리터럴 타입이 필요함. 타입 가드나 제네릭으로 안전하게 처리 가능",
    codeSnippet: `const config = { api: '/api', auth: '/auth' } as const;\ntype ConfigKey = keyof typeof config;\n\nfunction getUrl(key: ConfigKey) {\n  return config[key]; // ✅ 타입 안전\n}`,
    tags: ["TypeScript", "타입 시스템", "keyof", "제네릭"],
    category: "Frontend > TypeScript > Type System",
    relatedConcepts: [
      { name: "Discriminated Unions", why: "복잡한 객체 타입을 안전하게 다루는 패턴" },
      { name: "Type Narrowing", why: "런타임 체크로 타입을 좁히는 기법" },
    ],
    difficulty: 3,
    projectId: "p1",
    createdAt: "2026-03-25T13:30:00Z",
    updatedAt: "2026-03-25T13:30:00Z",
  },
];
