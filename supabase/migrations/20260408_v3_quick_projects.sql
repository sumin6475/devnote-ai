-- v3: Quick Note + 프로젝트 기능

-- note_type에 'quick' 추가
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_note_type_check;
ALTER TABLE notes ADD CONSTRAINT notes_note_type_check
  CHECK (note_type IN ('debug', 'learning', 'quick'));

-- quick note 원본 텍스트 저장용
ALTER TABLE notes ADD COLUMN raw_content text;

-- projects 테이블 확장
ALTER TABLE projects ADD COLUMN github_url text;
ALTER TABLE projects ADD COLUMN color text DEFAULT '#818CF8';
