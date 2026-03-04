-- comments 테이블에 parent_id 컬럼 추가 (대댓글 지원)
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;

-- 대댓글 조회 성능 향상을 위한 인덱스
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_post_id_created_at_idx ON comments(post_id, created_at);

-- posts 검색 성능을 위한 인덱스 (title, content full-text)
CREATE INDEX IF NOT EXISTS posts_title_idx ON posts USING gin(to_tsvector('simple', title));
