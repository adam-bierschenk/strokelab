-- Migration: Add strokes gained tracking
-- Created: 2026-03-01

-- Create strokes_gained table
CREATE TABLE IF NOT EXISTS strokes_gained (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    round_id TEXT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    total FLOAT NOT NULL DEFAULT 0,
    off_the_tee FLOAT NOT NULL DEFAULT 0,
    approach FLOAT NOT NULL DEFAULT 0,
    around_green FLOAT NOT NULL DEFAULT 0,
    putting FLOAT NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(round_id)
);

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_strokes_gained_round_id ON strokes_gained(round_id);

-- Add RLS policies
ALTER TABLE strokes_gained ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS strokes_gained_select ON strokes_gained;
DROP POLICY IF EXISTS strokes_gained_insert ON strokes_gained;
DROP POLICY IF EXISTS strokes_gained_update ON strokes_gained;
DROP POLICY IF EXISTS strokes_gained_delete ON strokes_gained;

-- Users can see strokes gained for rounds they own or have access to
CREATE POLICY strokes_gained_select ON strokes_gained
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rounds r
            WHERE r.id = strokes_gained.round_id
            AND (
                r.user_id = auth.uid()::TEXT OR
                r.visibility = 'public' OR
                (r.visibility = 'family' AND EXISTS (
                    SELECT 1 FROM family_members fm1
                    JOIN family_members fm2 ON fm1.family_group_id = fm2.family_group_id
                    WHERE fm1.user_id = r.user_id
                    AND fm2.user_id = auth.uid()::TEXT
                ))
            )
        )
    );

-- Users can only insert/update strokes gained for their own rounds
CREATE POLICY strokes_gained_insert ON strokes_gained
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM rounds r
            WHERE r.id = strokes_gained.round_id
            AND r.user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY strokes_gained_update ON strokes_gained
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM rounds r
            WHERE r.id = strokes_gained.round_id
            AND r.user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY strokes_gained_delete ON strokes_gained
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM rounds r
            WHERE r.id = strokes_gained.round_id
            AND r.user_id = auth.uid()::TEXT
        )
    );

-- Function to auto-calculate strokes gained on score insert/update
-- This is optional - can also calculate on-demand in application
CREATE OR REPLACE FUNCTION trigger_calculate_strokes_gained()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark strokes_gained for recalculation on relevant updates
    DELETE FROM strokes_gained WHERE round_id = NEW.round_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: We don't auto-create the trigger here to avoid conflicts
-- The application handles calculation on-demand or via scheduled job
