// 기존 topic_tags 수집 헬퍼 — AI 프롬프트에 주입해 태그 일관성 유지

import { getSupabase } from '@/lib/supabase';

export async function fetchExistingTopicTags(): Promise<string[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.from('notes').select('topic_tags');
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const row of data as { topic_tags: string[] | null }[]) {
      for (const tag of row.topic_tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    // 빈도 높은 순으로 정렬 (AI가 자주 쓰이는 태그 우선 참고)
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  } catch {
    return [];
  }
}
