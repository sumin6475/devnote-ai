// GET: 프로젝트 목록 + 노트 수 집계 / POST: 프로젝트 생성

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { toProject, type ProjectRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

// 프로젝트 생성 시 순환 할당되는 기본 색상
const DEFAULT_COLORS = [
  '#818CF8', '#5DCAA5', '#F0997B', '#ED93B1',
  '#85B7EB', '#97C459', '#FAC775',
];

export async function GET() {
  try {
    const supabase = getSupabase();

    // 프로젝트 목록 + 각 프로젝트별 노트 수 집계
    const { data, error } = await supabase
      .from('projects')
      .select('*, notes(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Supabase의 count 집계 결과를 note_count로 변환
    const projects = (data ?? []).map((row: Record<string, unknown>) => {
      const noteCount = Array.isArray(row.notes) && row.notes.length > 0
        ? (row.notes[0] as { count: number }).count
        : 0;
      return toProject({ ...row, note_count: noteCount } as ProjectRow);
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    // 기존 프로젝트 수로 색상 순환 결정
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    const color = body.color || DEFAULT_COLORS[(count ?? 0) % DEFAULT_COLORS.length];

    const row = {
      name: body.name,
      description: body.description ?? null,
      color,
      github_url: body.githubUrl ?? null,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(row)
      .select()
      .single();

    if (error) throw error;

    const project = toProject({ ...data, note_count: 0 } as ProjectRow);

    return NextResponse.json({ success: true, data: project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
