-- Migration: Add lesson notes table
-- Created: 2026-03-01

-- Create lesson_notes table
CREATE TABLE IF NOT EXISTS lesson_notes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other',
    coach_name TEXT,
    shared_with TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user ON lesson_notes(user_id);

-- Create index for shared lookups
CREATE INDEX IF NOT EXISTS idx_lesson_notes_shared ON lesson_notes USING GIN(shared_with);

-- Add RLS policies
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lesson_notes_select ON lesson_notes;
DROP POLICY IF EXISTS lesson_notes_insert ON lesson_notes;
DROP POLICY IF EXISTS lesson_notes_update ON lesson_notes;
DROP POLICY IF EXISTS lesson_notes_delete ON lesson_notes;

-- Users can see their own notes and notes shared with them
CREATE POLICY lesson_notes_select ON lesson_notes
    FOR SELECT USING (
        user_id = auth.uid()::TEXT OR
        auth.uid()::TEXT = ANY(shared_with)
    );

-- Users can only insert their own notes
CREATE POLICY lesson_notes_insert ON lesson_notes
    FOR INSERT WITH CHECK (user_id = auth.uid()::TEXT);

-- Users can only update their own notes
CREATE POLICY lesson_notes_update ON lesson_notes
    FOR UPDATE USING (user_id = auth.uid()::TEXT);

-- Users can only delete their own notes
CREATE POLICY lesson_notes_delete ON lesson_notes
    FOR DELETE USING (user_id = auth.uid()::TEXT);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lesson_note_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamp
DROP TRIGGER IF EXISTS update_lesson_note_timestamp ON lesson_notes;
CREATE TRIGGER update_lesson_note_timestamp
    BEFORE UPDATE ON lesson_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_lesson_note_timestamp();
