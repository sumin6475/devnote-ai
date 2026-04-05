// GET: 전체 노트 목록 조회 / POST: 새 노트 생성

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { toNote, type NoteRow } from '@/lib/types';

// 빌드 시 정적 평가 방지 — DB 데이터는 항상 최신이어야 함
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // DB row → 프론트엔드 타입으로 변환
    const notes = (data as NoteRow[]).map(toNote);

    return NextResponse.json({ success: true, data: notes });
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

    // 프론트엔드 camelCase → DB snake_case 변환
    const row = {
      note_type: body.noteType,
      problem: body.problem ?? null,
      solution: body.solution ?? null,
      understanding: body.understanding ?? null,
      what_i_built: body.whatIBuilt ?? null,
      learnings: body.learnings ?? null,
      source: body.source ?? null,
      code_snippet: body.codeSnippet ?? null,
      tags: body.tags ?? [],
      category: body.category ?? '',
      related_concepts: body.relatedConcepts ?? [],
      difficulty: body.difficulty ?? 1,
      project_id: body.projectId ?? null,
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(row)
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
