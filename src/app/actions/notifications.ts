'use server'

import { createClient } from '@/lib/supabase-server'

interface NotificationPreferences {
  roundReminders: boolean
  weatherAlerts: boolean
  goalUpdates: boolean
  teeTimeAlerts: boolean
}

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function savePushSubscription(subscription: PushSubscriptionData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('PushSubscription')
    .insert({
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      createdAt: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

export async function deletePushSubscription(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('PushSubscription')
    .delete()
    .eq('userId', user.id)
    .eq('endpoint', endpoint)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getNotificationPreferences(): Promise<{
  preferences: NotificationPreferences | null
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { preferences: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('NotificationPreferences')
    .select('*')
    .eq('userId', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // Not found is ok
    return { preferences: null, error: error.message }
  }

  if (!data) {
    // Return default preferences
    return {
      preferences: {
        roundReminders: true,
        weatherAlerts: true,
        goalUpdates: true,
        teeTimeAlerts: true
      }
    }
  }

  return { preferences: data }
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if preferences exist
  const { data: existing } = await supabase
    .from('NotificationPreferences')
    .select('id')
    .eq('userId', user.id)
    .single()

  if (existing) {
    // Update
    const { error } = await supabase
      .from('NotificationPreferences')
      .update({
        ...preferences,
        updatedAt: new Date().toISOString()
      })
      .eq('userId', user.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    // Insert
    const { error } = await supabase
      .from('NotificationPreferences')
      .insert({
        userId: user.id,
        ...preferences,
        updatedAt: new Date().toISOString()
      })

    if (error) {
      return { error: error.message }
    }
  }

  return { success: true }
}

// Send a test notification
export async function sendTestNotification() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // In production, this would trigger a push notification
  // For now, we just return success
  // The actual sending would be done by a background job or server

  return { success: true, message: 'Test notification would be sent here' }
}
