-- Booking table for tee time bookings
CREATE TABLE "Booking" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "teeTimeId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    players INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_booking_user ON "Booking"("userId");
CREATE INDEX idx_booking_course ON "Booking"("courseId");
CREATE INDEX idx_booking_date ON "Booking"(date);

-- RLS
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" ON "Booking"
    FOR SELECT USING ("userId" = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own bookings" ON "Booking"
    FOR INSERT WITH CHECK ("userId" = auth.uid()::TEXT);

CREATE POLICY "Users can update their own bookings" ON "Booking"
    FOR UPDATE USING ("userId" = auth.uid()::TEXT);

CREATE POLICY "Users can delete their own bookings" ON "Booking"
    FOR DELETE USING ("userId" = auth.uid()::TEXT);
