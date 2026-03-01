-- Push subscription table for web push notifications
CREATE TABLE "PushSubscription" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_push_user ON "PushSubscription"("userId");
CREATE INDEX idx_push_endpoint ON "PushSubscription"(endpoint);

-- RLS
ALTER TABLE "PushSubscription" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage their own subscriptions" ON "PushSubscription"
    FOR ALL USING ("userId" = auth.uid()::TEXT);

-- Notification preferences table
CREATE TABLE "NotificationPreferences" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE UNIQUE,
    "roundReminders" BOOLEAN NOT NULL DEFAULT true,
    "weatherAlerts" BOOLEAN NOT NULL DEFAULT true,
    "goalUpdates" BOOLEAN NOT NULL DEFAULT true,
    "teeTimeAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notif_prefs_user ON "NotificationPreferences"("userId");

-- RLS
ALTER TABLE "NotificationPreferences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own preferences" ON "NotificationPreferences"
    FOR SELECT USING ("userId" = auth.uid()::TEXT);

CREATE POLICY "Users can only update their own preferences" ON "NotificationPreferences"
    FOR ALL USING ("userId" = auth.uid()::TEXT);
