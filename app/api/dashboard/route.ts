// GET /api/dashboard — topic_tags + skill_tags 집계 (빈도 기준)

import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type TagCount = { name: string; count: number };

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('notes')
      .select('topic_tags, skill_tags, note_type');

    if (error) throw error;

    const topicCounts = new Map<string, number>();
    const skillCounts = new Map<string, number>();
    const typeCounts: Record<string, number> = { debug: 0, learning: 0, quick: 0 };

    for (const row of (data ?? []) as {
      topic_tags: string[] | null;
      skill_tags: string[] | null;
      note_type: string | null;
    }[]) {
      for (const t of row.topic_tags ?? []) {
        topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
      }
      for (const s of row.skill_tags ?? []) {
        skillCounts.set(s, (skillCounts.get(s) ?? 0) + 1);
      }
      if (row.note_type && row.note_type in typeCounts) {
        typeCounts[row.note_type]++;
      }
    }

    const toSortedArray = (m: Map<string, number>): TagCount[] =>
      Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      success: true,
      data: {
        totalNotes: data?.length ?? 0,
        topicTags: toSortedArray(topicCounts),
        skillTags: toSortedArray(skillCounts),
        typeCounts,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
