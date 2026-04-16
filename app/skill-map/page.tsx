'use client';

// Skill Map 페이지 — 19개 canonical skill 커버리지 시각화

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type SkillData = {
  name: string;
  tier: 'tier1' | 'tier2' | 'foundation';
  noteCount: number;
  projectIds: string[];
  covered: boolean;
};

type SkillMapData = {
  totalNotes: number;
  coveredSkills: number;
  totalSkills: number;
  skills: SkillData[];
};

// Tier별 색상
const TIER_COLORS: Record<string, string> = {
  tier1: '#7F77DD',
  tier2: '#1D9E75',
  foundation: '#85B7EB',
};

const TIER_LABELS: Record<string, string> = {
  tier1: 'Tier 1 — Core AI Engineering',
  tier2: 'Tier 2 — Differentiators',
  foundation: 'Foundation',
};

const SkillMapPage = () => {
  const [data, setData] = useState<SkillMapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/skill-map')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center" style={{ background: '#0b1120', color: '#475569' }}>
        Loading...
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex-1 flex items-center justify-center" style={{ background: '#0b1120', color: '#ef4444' }}>
        Failed to load skill map
      </main>
    );
  }

  const coveragePercent = Math.round((data.coveredSkills / data.totalSkills) * 100);
  const coveredSkills = data.skills.filter((s) => s.covered);
  const totalCoveredNotes = coveredSkills.reduce((sum, s) => sum + s.noteCount, 0);

  // Tier별 그룹
  const tiers = ['tier1', 'tier2', 'foundation'] as const;

  return (
    <main className="flex-1 h-screen overflow-y-auto" style={{ background: '#0b1120' }}>
      <div className="max-w-[780px] mx-auto px-8 py-8">
        {/* 헤더 */}
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] mb-6" style={{ color: '#F8FAFC' }}>
          Skill Map
        </h1>

        {/* 메트릭 카드 3개 */}
        <div className="flex gap-3 mb-6">
          <MetricCard label="Total notes" value={String(data.totalNotes)} />
          <MetricCard label="Skills covered" value={`${data.coveredSkills}/${data.totalSkills}`} />
          <MetricCard label="Coverage" value={`${coveragePercent}%`} />
        </div>

        {/* Coverage Bar */}
        <div className="mb-2">
          <div
            className="flex rounded-[6px] overflow-hidden"
            style={{ height: 28, background: 'rgba(148, 163, 184, 0.08)' }}
          >
            {coveredSkills.map((skill) => {
              const segmentPercent = totalCoveredNotes > 0
                ? (skill.noteCount / totalCoveredNotes) * coveragePercent
                : 0;
              if (segmentPercent < 1) return null;
              return (
                <div
                  key={skill.name}
                  className="flex items-center justify-center text-[10px] text-white font-medium"
                  style={{
                    width: `${segmentPercent}%`,
                    minWidth: 40,
                    background: TIER_COLORS[skill.tier],
                    whiteSpace: 'nowrap',
                  }}
                  title={`${skill.name}: ${skill.noteCount} notes`}
                >
                  {segmentPercent > 5 ? skill.name.split(' ')[0] : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-8 text-[11px]" style={{ color: '#94A3B8' }}>
          {coveredSkills.map((skill) => {
            const pct = totalCoveredNotes > 0
              ? Math.round((skill.noteCount / totalCoveredNotes) * 100)
              : 0;
            return (
              <span key={skill.name} className="flex items-center gap-[5px]">
                <span
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: TIER_COLORS[skill.tier] }}
                />
                {skill.name} {pct}%
              </span>
            );
          })}
          {coveragePercent < 100 && (
            <span className="flex items-center gap-[5px]">
              <span
                className="rounded-full"
                style={{ width: 6, height: 6, background: 'rgba(148,163,184,0.2)', border: '1px solid rgba(148,163,184,0.3)' }}
              />
              Uncovered {100 - coveragePercent}%
            </span>
          )}
        </div>

        {/* Tier별 스킬 카드 그리드 */}
        {tiers.map((tier) => {
          const tierSkills = data.skills.filter((s) => s.tier === tier);
          const tierCovered = tierSkills.filter((s) => s.covered).length;
          return (
            <div key={tier} className="mb-8">
              {/* 섹션 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] uppercase tracking-[0.05em] font-semibold" style={{ color: '#64748B' }}>
                  {TIER_LABELS[tier]}
                </span>
                <span className="text-[11px]" style={{ color: '#475569' }}>
                  {tierCovered}/{tierSkills.length} covered
                </span>
              </div>

              {/* 카드 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                {tierSkills.map((skill) => (
                  <SkillCard key={skill.name} skill={skill} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

// --- 서브 컴포넌트 ---

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div
    className="flex-1 rounded-lg"
    style={{
      background: 'rgba(30, 41, 59, 0.4)',
      border: '1px solid rgba(148, 163, 184, 0.06)',
      padding: 16,
    }}
  >
    <div className="text-[13px] mb-1" style={{ color: '#94A3B8' }}>{label}</div>
    <div className="text-[24px] font-medium" style={{ color: '#F1F5F9' }}>{value}</div>
  </div>
);

const SkillCard = ({ skill }: { skill: SkillData }) => {
  const router = useRouter();
  // 태그 클릭 시 해당 태그가 달린 노트 목록으로 이동
  const handleClick = () => {
    router.push(`/notes?skill_tag=${encodeURIComponent(skill.name)}`);
  };

  if (skill.covered) {
    return (
      <div
        onClick={handleClick}
        className="rounded-lg cursor-pointer hover:opacity-90 active:scale-[0.99]"
        style={{
          background: 'rgba(99, 102, 241, 0.06)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          padding: '14px 16px',
          transition: 'opacity 0.15s, transform 0.15s',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="rounded-full shrink-0"
            style={{ width: 7, height: 7, background: TIER_COLORS[skill.tier] }}
          />
          <span className="text-[14px]" style={{ color: '#F1F5F9' }}>{skill.name}</span>
        </div>
        <div className="text-[12px] pl-[15px]" style={{ color: '#94A3B8' }}>
          {skill.noteCount} {skill.noteCount === 1 ? 'note' : 'notes'}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="rounded-lg cursor-pointer hover:opacity-90 active:scale-[0.99]"
      style={{
        background: 'transparent',
        border: '1px solid rgba(148, 163, 184, 0.06)',
        padding: '14px 16px',
        transition: 'opacity 0.15s, transform 0.15s',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="rounded-full shrink-0"
          style={{
            width: 7,
            height: 7,
            background: 'transparent',
            border: '1.5px solid rgba(148, 163, 184, 0.2)',
          }}
        />
        <span className="text-[14px]" style={{ color: '#475569' }}>{skill.name}</span>
      </div>
      <div className="text-[12px] pl-[15px]" style={{ color: '#334155' }}>
        0 notes
      </div>
    </div>
  );
};

export default SkillMapPage;
