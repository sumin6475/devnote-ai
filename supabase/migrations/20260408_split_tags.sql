-- tags 컬럼을 2레이어로 분리: skill_tags (canonical) + topic_tags (free-form)
-- 기존 tags 데이터는 topic_tags로 이동

ALTER TABLE notes RENAME COLUMN tags TO topic_tags;

ALTER TABLE notes ADD COLUMN skill_tags text[] DEFAULT '{}';
