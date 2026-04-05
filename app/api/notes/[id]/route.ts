// GET: 노트 상세 / PUT: 수정 / DELETE: 삭제

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { toNote, type NoteRow } from '@/lib/types';

// 빌드 시 정적 평가 방지
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = getSupabase();
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const note = toNote(data as NoteRow);

    return NextResponse.json({ success: true, data: note });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const supabase = getSupabase();
    const { id } = await context.params;
    const body = await request.json();

    // 프론트엔드 camelCase → DB snake_case 변환 (전달된 필드만)
    const row: Record<string, unknown> = {};
    if (body.noteType !== undefined) row.note_type = body.noteType;
    if (body.problem !== undefined) row.problem = body.problem;
    if (body.solution !== undefined) row.solution = body.solution;
    if (body.understanding !== undefined) row.understanding = body.understanding;
    if (body.whatIBuilt !== undefined) row.what_i_built = body.whatIBuilt;
    if (body.learnings !== undefined) row.learnings = body.learnings;
    if (body.source !== undefined) row.source = body.source;
    if (body.codeSnippet !== undefined) row.code_snippet = body.codeSnippet;
    if (body.tags !== undefined) row.tags = body.tags;
    if (body.category !== undefined) row.category = body.category;
    if (body.relatedConcepts !== undefined) row.related_concepts = body.relatedConcepts;
    if (body.difficulty !== undefined) row.difficulty = body.difficulty;
    if (body.projectId !== undefined) row.project_id = body.projectId;

    const { data, error } = await supabase
      .from('notes')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const note = toNote(data as NoteRow);

    return NextResponse.json({ success: true, data: note });
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

    const { error } = await supabase
      .from('notes')
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
