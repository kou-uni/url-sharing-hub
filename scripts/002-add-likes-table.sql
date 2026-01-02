-- Likes table to track user likes
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'news', 'topic', 'evidence'
  entity_id INTEGER NOT NULL,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_entity ON likes(entity_type, entity_id);
