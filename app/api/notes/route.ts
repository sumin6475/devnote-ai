// GET: 전체 노트 목록 조회 (프로젝트 필터 지원) / POST: 새 노트 생성

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { toNote, type NoteRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project');

    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    // 프로젝트 필터 적용
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw error;

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
      raw_content: body.rawContent ?? null,
      problem: body.problem ?? null,
      solution: body.solution ?? null,
      understanding: body.understanding ?? null,
      what_i_built: body.whatIBuilt ?? null,
      learnings: body.learnings ?? null,
      source: body.source ?? null,
      code_snippet: body.codeSnippet ?? null,
      skill_tags: body.skillTags ?? [],
      topic_tags: body.topicTags ?? [],
      category: body.category ?? '',
      related_concepts: body.relatedConcepts ?? [],
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
