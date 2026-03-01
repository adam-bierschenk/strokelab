-- Add Photo table for round photos
-- Enable Storage extension first: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "Photo" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "roundId" TEXT NOT NULL REFERENCES "Round"(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_photo_round ON "Photo"("roundId");
CREATE INDEX idx_photo_user ON "Photo"("userId");

-- Set up RLS (Row Level Security)
ALTER TABLE "Photo" ENABLE ROW LEVEL SECURITY;

-- Users can view their own photos
CREATE POLICY "Users can view their own photos" ON "Photo"
    FOR SELECT USING ("userId" = auth.uid()::TEXT);

-- Users can insert their own photos
CREATE POLICY "Users can insert their own photos" ON "Photo"
    FOR INSERT WITH CHECK ("userId" = auth.uid()::TEXT);

-- Users can delete their own photos
CREATE POLICY "Users can delete their own photos" ON "Photo"
    FOR DELETE USING ("userId" = auth.uid()::TEXT);

-- Create storage bucket for photos (run in Supabase dashboard or SQL)
-- insert into storage.buckets (id, name, public) 
-- values ('round-photos', 'round-photos', true);
