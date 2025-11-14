-- Add max_participants column to events table
ALTER TABLE events ADD COLUMN max_participants INTEGER;

-- Drop event_reviews table and related policies
DROP TABLE IF EXISTS event_reviews CASCADE;