// PUT: 프로젝트 수정 / DELETE: 프로젝트 삭제 (연결 노트의 project_id → null)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { toProject, type ProjectRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const supabase = getSupabase();
    const { id } = await context.params;
    const body = await request.json();

    const row: Record<string, unknown> = {};
    if (body.name !== undefined) row.name = body.name;
    if (body.description !== undefined) row.description = body.description;
    if (body.color !== undefined) row.color = body.color;
    if (body.githubUrl !== undefined) row.github_url = body.githubUrl;

    const { data, error } = await supabase
      .from('projects')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const project = toProject(data as ProjectRow);

    return NextResponse.json({ success: true, data: project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const supabase = getSupabase();
    const { id } = await context.params;

    // 연결된 노트의 project_id를 null로 (노트 삭제 아님)
    await supabase
      .from('notes')
      .update({ project_id: null })
      .eq('project_id', id);

    // 프로젝트 삭제
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
