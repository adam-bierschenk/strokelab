-- Migration: Add family support tables
-- Created: 2026-03-01

-- Create family_groups table
CREATE TABLE IF NOT EXISTS family_groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    created_by_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    family_group_id TEXT NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'child')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_group_id, user_id)
);

-- Add visibility and enteredBy to rounds
ALTER TABLE "Round" 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'family', 'public')),
ADD COLUMN IF NOT EXISTS entered_by_id TEXT REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_group_id ON family_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_round_visibility ON "Round"(visibility);
CREATE INDEX IF NOT EXISTS idx_round_entered_by ON "Round"(entered_by_id);
CREATE INDEX IF NOT EXISTS idx_round_user_visibility ON "Round"(user_id, visibility);

-- Add RLS policies for family_groups
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS family_groups_select ON family_groups;
DROP POLICY IF EXISTS family_groups_insert ON family_groups;
DROP POLICY IF EXISTS family_groups_update ON family_groups;
DROP POLICY IF EXISTS family_groups_delete ON family_groups;

CREATE POLICY family_groups_select ON family_groups
    FOR SELECT USING (
        created_by_id = auth.uid()::TEXT OR
        EXISTS (
            SELECT 1 FROM family_members 
            WHERE family_group_id = family_groups.id 
            AND user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY family_groups_insert ON family_groups
    FOR INSERT WITH CHECK (created_by_id = auth.uid()::TEXT);

CREATE POLICY family_groups_update ON family_groups
    FOR UPDATE USING (
        created_by_id = auth.uid()::TEXT OR
        EXISTS (
            SELECT 1 FROM family_members 
            WHERE family_group_id = family_groups.id 
            AND user_id = auth.uid()::TEXT
            AND role = 'admin'
        )
    );

CREATE POLICY family_groups_delete ON family_groups
    FOR DELETE USING (created_by_id = auth.uid()::TEXT);

-- Add RLS policies for family_members
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS family_members_select ON family_members;
DROP POLICY IF EXISTS family_members_insert ON family_members;
DROP POLICY IF EXISTS family_members_delete ON family_members;

CREATE POLICY family_members_select ON family_members
    FOR SELECT USING (
        user_id = auth.uid()::TEXT OR
        EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.family_group_id = family_members.family_group_id
            AND fm.user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY family_members_insert ON family_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.family_group_id = family_members.family_group_id
            AND fm.user_id = auth.uid()::TEXT
            AND fm.role = 'admin'
        )
    );

CREATE POLICY family_members_delete ON family_members
    FOR DELETE USING (
        user_id = auth.uid()::TEXT OR
        EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.family_group_id = family_members.family_group_id
            AND fm.user_id = auth.uid()::TEXT
            AND fm.role = 'admin'
        )
    );

-- Update round policies for visibility
DROP POLICY IF EXISTS rounds_select ON "Round";

CREATE POLICY rounds_select ON "Round"
    FOR SELECT USING (
        user_id = auth.uid()::TEXT OR
        visibility = 'public' OR
        (visibility = 'family' AND EXISTS (
            SELECT 1 FROM family_members fm
            JOIN family_members my_memberships ON fm.family_group_id = my_memberships.family_group_id
            WHERE fm.user_id = "Round".user_id
            AND my_memberships.user_id = auth.uid()::TEXT
        ))
    );
