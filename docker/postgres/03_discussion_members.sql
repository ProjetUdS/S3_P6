-- Make equipe_id nullable for private (1-on-1) discussions
ALTER TABLE app.discussion ALTER COLUMN equipe_id DROP NOT NULL;
