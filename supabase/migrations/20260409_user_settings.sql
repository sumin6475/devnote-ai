-- user_settings 테이블 — MVP 싱글 유저, Phase 2에서 user_id 추가
CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text,
  chat_tone text DEFAULT 'conversational',
  response_language text DEFAULT 'ko',
  default_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
