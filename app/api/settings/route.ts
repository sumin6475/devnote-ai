// GET: 유저 설정 조회 / PUT: 유저 설정 저장
// MVP 싱글 유저 — row 1개만 유지

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export type UserSettings = {
  id: string;
  nickname: string | null;
  chatTone: 'conversational' | 'textbook' | 'code-first';
  responseLanguage: 'ko' | 'en';
  defaultProjectId: string | null;
};

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code === 'PGRST116') {
      // row 없으면 기본값 생성
      const { data: newRow, error: insertErr } = await supabase
        .from('user_settings')
        .insert({})
        .select()
        .single();

      if (insertErr) throw insertErr;

      return NextResponse.json({
        success: true,
        data: toSettings(newRow),
      });
    }

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: toSettings(data),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    // 기존 row 가져오기
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .limit(1)
      .single();

    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.nickname !== undefined) row.nickname = body.nickname;
    if (body.chatTone !== undefined) row.chat_tone = body.chatTone;
    if (body.responseLanguage !== undefined) row.response_language = body.responseLanguage;
    if (body.defaultProjectId !== undefined) row.default_project_id = body.defaultProjectId;

    let data;
    if (existing) {
      const result = await supabase
        .from('user_settings')
        .update(row)
        .eq('id', existing.id)
        .select()
        .single();
      if (result.error) throw result.error;
      data = result.data;
    } else {
      const result = await supabase
        .from('user_settings')
        .insert(row)
        .select()
        .single();
      if (result.error) throw result.error;
      data = result.data;
    }

    return NextResponse.json({
      success: true,
      data: toSettings(data),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DB row → 프론트엔드 타입
function toSettings(row: Record<string, unknown>): UserSettings {
  return {
    id: row.id as string,
    nickname: (row.nickname as string) || null,
    chatTone: (row.chat_tone as string as UserSettings['chatTone']) || 'conversational',
    responseLanguage: (row.response_language as string as UserSettings['responseLanguage']) || 'ko',
    defaultProjectId: (row.default_project_id as string) || null,
  };
}
