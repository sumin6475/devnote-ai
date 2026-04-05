// Supabase client 중앙화 — lazy 초기화로 빌드 타임 에러 방지

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

// 런타임에만 client를 생성 (빌드 타임에는 env 변수가 없을 수 있음)
export const getSupabase = (): SupabaseClient => {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Supabase 환경변수가 설정되지 않았습니다. .env.local을 확인하세요.');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
};
