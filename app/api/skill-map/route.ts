// GET: skill_tags 집계 — 19개 canonical skill 기준 커버리지

import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Canonical skill list — 서버 하드코딩
const CANONICAL_SKILLS = [
  { name: 'LLM API integration', tier: 'tier1' as const },
  { name: 'Prompt engineering', tier: 'tier1' as const },
  { name: 'Structured outputs', tier: 'tier1' as const },
  { name: 'Function calling', tier: 'tier1' as const },
  { name: 'RAG pipeline', tier: 'tier1' as const },
  { name: 'Embeddings', tier: 'tier1' as const },
  { name: 'Vector database', tier: 'tier1' as const },
  { name: 'Python', tier: 'tier1' as const },
  { name: 'SQL', tier: 'tier1' as const },
  { name: 'Agent / multi-agent', tier: 'tier2' as const },
  { name: 'MCP', tier: 'tier2' as const },
  { name: 'Fine-tuning', tier: 'tier2' as const },
  { name: 'Evaluation', tier: 'tier2' as const },
  { name: 'MLOps', tier: 'tier2' as const },
  { name: 'WebSocket / real-time', tier: 'foundation' as const },
  { name: 'Docker', tier: 'foundation' as const },
  { name: 'Cloud deployment', tier: 'foundation' as const },
  { name: 'Git', tier: 'foundation' as const },
];

export async function GET() {
  try {
    const supabase = getSupabase();

    // 전체 노트 수
    const { count: totalNotes } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true });

    // skill_tags가 비어있지 않은 노트들의 skill_tags + project_id 가져오기
    const { data: rows, error } = await supabase
      .from('notes')
      .select('skill_tags, project_id')
      .neq('skill_tags', '{}');

    if (error) throw error;

    // 스킬별 집계
    const skillMap = new Map<string, { noteCount: number; projectIds: Set<string> }>();

    for (const row of rows ?? []) {
      const tags: string[] = row.skill_tags ?? [];
      for (const tag of tags) {
        if (!skillMap.has(tag)) {
          skillMap.set(tag, { noteCount: 0, projectIds: new Set() });
        }
        const entry = skillMap.get(tag)!;
        entry.noteCount++;
        if (row.project_id) entry.projectIds.add(row.project_id);
      }
    }

    // 19개 canonical skill 전부 포함 (없는 것은 0)
    const skills = CANONICAL_SKILLS.map((s) => {
      const entry = skillMap.get(s.name);
      return {
        name: s.name,
        tier: s.tier,
        noteCount: entry?.noteCount ?? 0,
        projectIds: entry ? Array.from(entry.projectIds) : [],
        covered: (entry?.noteCount ?? 0) > 0,
      };
    });

    const coveredSkills = skills.filter((s) => s.covered).length;

    return NextResponse.json({
      success: true,
      data: {
        totalNotes: totalNotes ?? 0,
        coveredSkills,
        totalSkills: CANONICAL_SKILLS.length,
        skills,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
