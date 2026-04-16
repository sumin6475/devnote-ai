'use client';

// Dashboard 페이지 — 태그 빈도 시각화 (topic tags cloud + skill tags bars)

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type TagCount = { name: string; count: number };

type DashboardData = {
  totalNotes: number;
  topicTags: TagCount[];
  skillTags: TagCount[];
  typeCounts: { debug: number; learning: number; quick: number };
};

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: '#475569' }}>
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: '#ef4444' }}>
        Failed to load dashboard
      </div>
    );
  }

  const maxTopic = data.topicTags[0]?.count ?? 1;
  const maxSkill = data.skillTags[0]?.count ?? 1;

  return (
    <main className="flex-1 h-screen overflow-y-auto" style={{ background: '#0b1120' }}>
      <div className="max-w-[1000px] mx-auto px-8 py-10">
        {/* 헤더 */}
        <div className="mb-10">
          <h1
            className="text-[26px] font-semibold tracking-[-0.02em] m-0 mb-1"
            style={{ color: '#F8FAFC' }}
          >
            Dashboard
          </h1>
          <p className="text-[13px]" style={{ color: '#64748b' }}>
            All tags across your notes
          </p>
        </div>

        {/* 요약 카드 3개 */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <SummaryCard label="Total Notes" value={data.totalNotes} />
          <SummaryCard label="Topic Tags" value={data.topicTags.length} />
          <SummaryCard label="Skill Tags" value={data.skillTags.length} />
        </div>

        {/* 타입 분포 */}
        <Section title="Note Types">
          <div className="flex gap-3">
            <TypePill label="Quick" count={data.typeCounts.quick} color="#a78bfa" />
            <TypePill label="Debug" count={data.typeCounts.debug} color="#a84370" />
            <TypePill label="Build" count={data.typeCounts.learning} color="#38bdf8" />
          </div>
        </Section>

        {/* Topic Tags Cloud */}
        <Section title={`Topic Tags (${data.topicTags.length})`} subtitle="Click to see tagged notes">
          {data.topicTags.length === 0 ? (
            <EmptyHint text="No topic tags yet. Create notes to generate them." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.topicTags.map((t) => {
                // 빈도에 따라 폰트 크기 스케일 (11px ~ 20px)
                const scale = t.count / maxTopic;
                const fontSize = 11 + Math.round(scale * 9);
                const opacity = 0.55 + scale * 0.45;
                return (
                  <button
                    key={t.name}
                    onClick={() => router.push(`/notes?topic_tag=${encodeURIComponent(t.name)}`)}
                    className="rounded-[20px] cursor-pointer border-none hover:opacity-100 active:scale-[0.97]"
                    style={{
                      background: 'rgba(99,102,241,0.08)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99,102,241,0.2)',
                      padding: '4px 12px',
                      fontSize,
                      opacity,
                      fontFamily: 'inherit',
                      transition: 'opacity 0.15s, transform 0.15s',
                    }}
                    title={`${t.count} ${t.count === 1 ? 'note' : 'notes'}`}
                  >
                    {t.name}
                    <span className="ml-2 text-[10px]" style={{ color: '#6366f1' }}>
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        {/* Skill Tags Bars */}
        <Section title={`Skill Tags (${data.skillTags.length})`} subtitle="Click to see tagged notes">
          {data.skillTags.length === 0 ? (
            <EmptyHint text="No skill tags yet." />
          ) : (
            <div className="flex flex-col gap-2">
              {data.skillTags.map((s) => {
                const pct = (s.count / maxSkill) * 100;
                return (
                  <button
                    key={s.name}
                    onClick={() => router.push(`/notes?skill_tag=${encodeURIComponent(s.name)}`)}
                    className="flex items-center gap-3 rounded-lg cursor-pointer border-none hover:opacity-90 active:scale-[0.99]"
                    style={{
                      background: 'rgba(30, 41, 59, 0.4)',
                      border: '1px solid rgba(148, 163, 184, 0.06)',
                      padding: '10px 14px',
                      fontFamily: 'inherit',
                      transition: 'opacity 0.15s, transform 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    <span className="text-[13px] shrink-0" style={{ color: '#F1F5F9', minWidth: 180 }}>
                      {s.name}
                    </span>
                    <div
                      className="flex-1 rounded-full overflow-hidden"
                      style={{ height: 6, background: 'rgba(148,163,184,0.08)' }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                        }}
                      />
                    </div>
                    <span className="text-[12px] shrink-0" style={{ color: '#94A3B8', minWidth: 48, textAlign: 'right' }}>
                      {s.count} {s.count === 1 ? 'note' : 'notes'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </main>
  );
};

// --- 서브 컴포넌트 ---

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <div
    className="rounded-xl"
    style={{
      background: 'rgba(30, 41, 59, 0.4)',
      border: '1px solid rgba(148, 163, 184, 0.06)',
      padding: 18,
    }}
  >
    <div className="text-[12px] mb-[6px]" style={{ color: '#94A3B8' }}>{label}</div>
    <div className="text-[26px] font-medium" style={{ color: '#F1F5F9' }}>{value}</div>
  </div>
);

const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold m-0" style={{ color: '#F1F5F9' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-[11px] mt-1 m-0" style={{ color: '#64748b' }}>
          {subtitle}
        </p>
      )}
    </div>
    {children}
  </section>
);

const TypePill = ({ label, count, color }: { label: string; count: number; color: string }) => (
  <div
    className="flex items-center gap-2 rounded-lg"
    style={{
      background: 'rgba(30, 41, 59, 0.4)',
      border: '1px solid rgba(148, 163, 184, 0.06)',
      padding: '10px 14px',
    }}
  >
    <span className="rounded-full shrink-0" style={{ width: 7, height: 7, background: color }} />
    <span className="text-[13px]" style={{ color: '#F1F5F9' }}>{label}</span>
    <span className="text-[12px]" style={{ color: '#94A3B8' }}>{count}</span>
  </div>
);

const EmptyHint = ({ text }: { text: string }) => (
  <div
    className="rounded-lg text-center"
    style={{
      background: 'rgba(30, 41, 59, 0.3)',
      border: '1px dashed rgba(148, 163, 184, 0.1)',
      padding: '24px',
      color: '#475569',
      fontSize: 13,
    }}
  >
    {text}
  </div>
);

export default DashboardPage;
