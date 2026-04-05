import { useState } from "react";

const NOTES = [
  {
    id: 1,
    title: "og:image를 넣었는데 카카오톡에서는 보이지만 트위터에서는 썸네일이 안 나옴",
    preview: "og:image 외에 twitter:image 메타 태그도 추가. property ...",
    tags: ["Open Graph", "메타태그", "SEO"],
    tagColors: ["indigo", "teal", "amber"],
    date: "04/03",
    difficulty: 2,
    project: "LinkPreview",
    category: "Frontend > Web Standards > Open Graph",
    problem: "og:image 메타 태그를 넣었는데, 카카오톡에서는 썸네일이 정상적으로 보이지만 트위터와 슬랙에서는 이미지가 표시되지 않음",
    solution: "property 대신 name 속성도 체크하도록 변경. twitter:image를 fallback으로 추가. 상대경로를 절대경로로 변환하는 resolveImageUrl() 함수 추가",
    understanding: "사이트마다 OG 태그 구현이 다르다. 일부는 property 속성을, 일부는 name 속성을 읽는다. 상대경로는 브라우저 밖(크롤러)에서는 resolve가 안 되기 때문에 반드시 절대경로를 사용해야 한다.",
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
      { name: "Social Crawlers", why: "각 플랫폼이 OG 태그를 다르게 파싱하는 이유를 이해해야 디버깅 가능" },
      { name: "URL Resolution", why: "상대경로가 서버사이드에서 작동하지 않는 원리 — Node.js의 new URL() 활용" },
      { name: "Meta Tag Validators", why: "Facebook Debugger, Twitter Card Validator로 사전 검증하는 습관" },
    ],
  },
  {
    id: 2,
    title: "useEffect 안에서 async 함수를 직접 쓰면 React가 경고를 띄움",
    preview: "useEffect 내부에 async 함수를 선언하고 즉시 호출하는 패...",
    tags: ["React", "useEffect", "async/await"],
    tagColors: ["indigo", "teal", "amber"],
    date: "04/02",
    difficulty: 3,
  },
  {
    id: 3,
    title: "Supabase RLS를 켰더니 모든 쿼리가 빈 배열을 반환함",
    preview: "RLS 정책을 추가해야 함. anon 키로 접근 시 SELECT 정책이...",
    tags: ["Supabase", "RLS", "PostgreSQL"],
    tagColors: ["teal", "amber", "indigo"],
    date: "04/01",
    difficulty: 3,
  },
  {
    id: 4,
    title: "Tailwind CSS에서 동적 클래스명이 적용 안 됨",
    preview: "Tailwind은 빌드 타임에 클래스를 스캔하므로 동적 문자열 조...",
    tags: ["Tailwind CSS", "JIT", "CSS"],
    tagColors: ["amber", "indigo", "teal"],
    date: "03/30",
    difficulty: 2,
  },
  {
    id: 5,
    title: "Docker 컨테이너에서 Node.js 앱이 localhost로 바인딩해서 외부에서 접근 불가",
    preview: "HOST를 0.0.0.0으로 설정. localhost(127.0.0.1)는 컨테이...",
    tags: ["Docker", "네트워킹", "Node.js"],
    tagColors: ["teal", "indigo", "amber"],
    date: "03/28",
    difficulty: 2,
  },
];

const tagColorMap = {
  indigo: { bg: "rgba(99,102,241,0.12)", text: "#a5b4fc", border: "rgba(99,102,241,0.25)" },
  teal: { bg: "rgba(20,184,166,0.12)", text: "#5eead4", border: "rgba(20,184,166,0.25)" },
  amber: { bg: "rgba(245,158,11,0.12)", text: "#fcd34d", border: "rgba(245,158,11,0.25)" },
};

const sidebarItems = [
  { label: "Notes", icon: "notes", active: true, count: 5 },
  { label: "Search", icon: "search" },
  { label: "Projects", icon: "projects" },
];
const comingSoon = [
  { label: "Skill Map", icon: "skillmap" },
  { label: "Dashboard", icon: "dashboard" },
  { label: "Code Review", icon: "codereview" },
];

function Icon({ name, size = 18, color = "currentColor" }) {
  const s = { width: size, height: size, display: "block" };
  switch (name) {
    case "notes": return <svg style={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke={color} strokeWidth="1.5"/><path d="M7 7h6M7 10.5h6M7 14h4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>;
    case "search": return <svg style={s} viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5" stroke={color} strokeWidth="1.5"/><path d="M13 13l4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
    case "projects": return <svg style={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="7" height="6" rx="1.5" stroke={color} strokeWidth="1.3"/><rect x="11" y="3" width="7" height="6" rx="1.5" stroke={color} strokeWidth="1.3"/><rect x="2" y="11" width="7" height="6" rx="1.5" stroke={color} strokeWidth="1.3"/><rect x="11" y="11" width="7" height="6" rx="1.5" stroke={color} strokeWidth="1.3"/></svg>;
    case "skillmap": return <svg style={s} viewBox="0 0 20 20" fill="none"><path d="M3 16V4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/><circle cx="3" cy="4" r="1.5" stroke={color} strokeWidth="1.2"/><path d="M3 10h4a2 2 0 012 2v4" stroke={color} strokeWidth="1.3"/><circle cx="9" cy="16" r="1.5" stroke={color} strokeWidth="1.2"/><path d="M3 7h8a2 2 0 012 2v3" stroke={color} strokeWidth="1.3"/><circle cx="13" cy="12" r="1.5" stroke={color} strokeWidth="1.2"/><path d="M13 12h4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/><circle cx="17" cy="12" r="1.5" stroke={color} strokeWidth="1.2"/></svg>;
    case "dashboard": return <svg style={s} viewBox="0 0 20 20" fill="none"><path d="M3 3v14h14" stroke={color} strokeWidth="1.3" strokeLinecap="round"/><path d="M6 13l3-4 3 2 5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "codereview": return <svg style={s} viewBox="0 0 20 20" fill="none"><path d="M7 6l-4 4 4 4M13 6l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "plus": return <svg style={s} viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
    case "star": return <svg style={{width: 14, height: 14, display: "inline-block", verticalAlign: "middle"}} viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6L8 9.6l-3.2 1.8.6-3.6L2.8 5.3l3.6-.5L8 1.5z" fill={color} stroke={color} strokeWidth="0.8"/></svg>;
    default: return null;
  }
}

function DifficultyStars({ level }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ opacity: i <= level ? 1 : 0.2 }}>
          <Icon name="star" color="#818cf8" />
        </span>
      ))}
    </span>
  );
}

function Tag({ label, colorKey }) {
  const c = tagColorMap[colorKey] || tagColorMap.indigo;
  return (
    <span style={{
      background: c.bg, color: c.text, fontSize: 11, fontWeight: 500,
      padding: "2px 10px", borderRadius: 20, border: `1px solid ${c.border}`,
      whiteSpace: "nowrap", letterSpacing: "0.01em",
    }}>
      {label}
    </span>
  );
}

export default function DevNote() {
  const [selected, setSelected] = useState(0);
  const note = NOTES[selected];

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#0f172a", color: "#e2e8f0",
      display: "flex", height: "100vh", width: "100%", overflow: "hidden",
      fontSize: 14,
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 210, minWidth: 210, background: "#0f172a",
        borderRight: "1px solid rgba(148,163,184,0.08)",
        display: "flex", flexDirection: "column", padding: "20px 0",
      }}>
        <div style={{ padding: "0 18px 24px", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 30, height: 30, background: "#6366f1", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="#fff" strokeWidth="1.8"/><path d="M7 7h6M7 10.5h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#f1f5f9", letterSpacing: "-0.02em" }}>DevNote</span>
        </div>

        <div style={{ padding: "0 12px 8px" }}>
          <button style={{
            width: "100%", background: "#6366f1", color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 0", fontWeight: 600, fontSize: 13,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            letterSpacing: "0.01em",
          }}>
            <Icon name="plus" size={16} color="#fff" /> New Note
          </button>
        </div>

        <div style={{ padding: "16px 12px 4px" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px 6px" }}>Menu</div>
          {sidebarItems.map((item) => (
            <div key={item.label} style={{
              padding: "8px 12px", borderRadius: 7, marginBottom: 1, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              background: item.active ? "rgba(99,102,241,0.1)" : "transparent",
              color: item.active ? "#818cf8" : "#64748b",
              fontWeight: item.active ? 600 : 400, fontSize: 13,
              transition: "all 0.15s",
            }}>
              <Icon name={item.icon} color={item.active ? "#818cf8" : "#64748b"} />
              {item.label}
              {item.count && (
                <span style={{
                  marginLeft: "auto", background: "#818cf8", color: "#0f172a",
                  fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10,
                }}>{item.count}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 12px 4px" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px 6px" }}>Coming soon</div>
          {comingSoon.map((item) => (
            <div key={item.label} style={{
              padding: "8px 12px", borderRadius: 7, marginBottom: 1,
              display: "flex", alignItems: "center", gap: 10,
              color: "#334155", fontSize: 13, opacity: 0.55,
            }}>
              <Icon name={item.icon} color="#334155" />
              {item.label}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ padding: "0 20px", fontSize: 11, color: "#334155" }}>DevNote v1.0 MVP</div>
      </aside>

      {/* Note List */}
      <section style={{
        width: 380, minWidth: 380,
        borderRight: "1px solid rgba(148,163,184,0.08)",
        display: "flex", flexDirection: "column", background: "#0f172a",
      }}>
        <div style={{
          padding: "18px 20px 14px", borderBottom: "1px solid rgba(148,163,184,0.06)",
          display: "flex", alignItems: "baseline", gap: 8,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>All Notes</span>
          <span style={{ fontSize: 13, color: "#475569" }}>({NOTES.length})</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 10px" }}>
          {NOTES.map((n, i) => (
            <div key={n.id} onClick={() => setSelected(i)} style={{
              padding: "14px 14px 12px", borderRadius: 10, marginBottom: 3, cursor: "pointer",
              background: selected === i ? "rgba(99,102,241,0.07)" : "transparent",
              border: selected === i ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{
                  fontSize: 13, fontWeight: 550, lineHeight: 1.35,
                  color: selected === i ? "#f1f5f9" : "#94a3b8",
                  flex: 1, marginRight: 8,
                }}>{n.title}</span>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%", background: "#818cf8",
                  flexShrink: 0, marginTop: 4, opacity: 0.7,
                }} />
              </div>
              <p style={{ fontSize: 12, color: "#475569", margin: "0 0 8px", lineHeight: 1.4 }}>{n.preview}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                {n.tags.map((t, j) => <Tag key={t} label={t} colorKey={n.tagColors[j]} />)}
                {n.relatedConcepts && (
                  <span style={{ fontSize: 10, color: "#475569", marginLeft: 2 }}>+{n.relatedConcepts.length}</span>
                )}
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#334155" }}>{n.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Note Detail */}
      <main style={{ flex: 1, overflowY: "auto", background: "#0b1120" }}>
        {note.problem ? (
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 36px" }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: "#f1f5f9", margin: "0 0 8px", lineHeight: 1.35, letterSpacing: "-0.01em" }}>
                {note.title}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#475569", flexWrap: "wrap" }}>
                <span>{note.project} project</span>
                <span style={{ color: "#334155" }}>|</span>
                <span>{note.date}</span>
                <span style={{ color: "#334155" }}>|</span>
                <span style={{
                  background: "rgba(99,102,241,0.1)", color: "#a5b4fc",
                  padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                  border: "1px solid rgba(99,102,241,0.2)",
                }}>{note.category}</span>
              </div>
            </div>

            {/* Problem */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                Problem
              </div>
              <div style={{
                background: "rgba(183, 28, 28, 0.08)",
                border: "1px solid rgba(183, 28, 28, 0.15)",
                borderLeft: "3px solid #b71c1c",
                borderRadius: "0 10px 10px 0",
                padding: "14px 18px", fontSize: 13.5, color: "#e2e8f0", lineHeight: 1.65,
              }}>
                {note.problem}
              </div>
            </div>

            {/* Solution */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                Solution
              </div>
              <div style={{
                background: "rgba(0, 98, 57, 0.08)",
                border: "1px solid rgba(0, 98, 57, 0.15)",
                borderLeft: "3px solid #006239",
                borderRadius: "0 10px 10px 0",
                padding: "14px 18px", fontSize: 13.5, color: "#e2e8f0", lineHeight: 1.65,
              }}>
                {note.solution}
              </div>
            </div>

            {/* Understanding */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                Understanding
              </div>
              <div style={{
                background: "rgba(99, 102, 241, 0.06)",
                border: "1px solid rgba(99, 102, 241, 0.12)",
                borderLeft: "3px solid #6366f1",
                borderRadius: "0 10px 10px 0",
                padding: "14px 18px", fontSize: 13.5, color: "#e2e8f0", lineHeight: 1.65,
              }}>
                {note.understanding}
              </div>
            </div>

            {/* Code Snippet */}
            {note.codeSnippet && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                  Code Snippet
                </div>
                <pre style={{
                  background: "rgba(15,23,42,0.8)",
                  border: "1px solid rgba(148,163,184,0.08)",
                  borderRadius: 10, padding: "16px 20px", margin: 0,
                  fontSize: 12.5, lineHeight: 1.7, color: "#94a3b8",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  overflowX: "auto", whiteSpace: "pre",
                }}>
                  {note.codeSnippet}
                </pre>
              </div>
            )}

            {/* AI Context */}
            <div style={{
              background: "rgba(99,102,241,0.04)",
              border: "1px solid rgba(99,102,241,0.08)",
              borderRadius: 12, padding: "18px 22px",
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.06em",
                textTransform: "uppercase", marginBottom: 14,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3 4.3 12.3l.7-4.1-3-2.9 4.2-.7L8 1z" fill="rgba(99,102,241,0.3)" stroke="#818cf8" strokeWidth="1"/></svg>
                AI Context
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {note.tags.map((t, j) => <Tag key={t} label={t} colorKey={note.tagColors[j]} />)}
              </div>

              {/* Related Concepts */}
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>Related concepts to explore</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {note.relatedConcepts.map((rc) => (
                  <div key={rc.name} style={{ fontSize: 13, lineHeight: 1.45 }}>
                    <span style={{ color: "#818cf8", fontWeight: 600 }}>{rc.name}</span>
                    <span style={{ color: "#475569" }}> — {rc.why}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 18, paddingTop: 14,
                borderTop: "1px solid rgba(99,102,241,0.08)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: 12, color: "#475569",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Difficulty <DifficultyStars level={note.difficulty} />
                </div>
                <div>
                  Category: <span style={{ color: "#818cf8" }}>{note.category}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#334155", fontSize: 14 }}>
            Select a note to view details
          </div>
        )}
      </main>
    </div>
  );
}
