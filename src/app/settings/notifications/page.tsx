'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  isPushNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription,
  requestNotificationPermission,
  showLocalNotification
} from '@/lib/push-notifications'
import { 
  getNotificationPreferences,
  updateNotificationPreferences,
  savePushSubscription,
  sendTestNotification
} from '@/app/actions/notifications'

interface Preferences {
  roundReminders: boolean
  weatherAlerts: boolean
  goalUpdates: boolean
  teeTimeAlerts: boolean
}

export default function NotificationsSettingsPage() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<Preferences>({
    roundReminders: true,
    weatherAlerts: true,
    goalUpdates: true,
    teeTimeAlerts: true
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    checkSupport()
    loadPreferences()
  }, [])

  const checkSupport = async () => {
    const supported = isPushNotificationSupported()
    setIsSupported(supported)
    
    if (supported) {
      const subscription = await getPushSubscription()
      setIsSubscribed(!!subscription)
    }
    
    setLoading(false)
  }

  const loadPreferences = async () => {
    const { preferences: data, error } = await getNotificationPreferences()
    if (data) {
      setPreferences(data)
    }
    if (error) {
      setError(error)
    }
  }

  const handleSubscribe = async () => {
    setError(null)
    setSuccessMessage(null)

    try {
      // Request permission
      const permission = await requestNotificationPermission()
      
      if (permission !== 'granted') {
        setError('Notification permission denied')
        return
      }

      // Subscribe to push
      const subscription = await subscribeToPushNotifications()
      
      if (subscription) {
        // Save to server
        const result = await savePushSubscription(subscription)
        
        if (result.error) {
          setError(result.error)
        } else {
          setIsSubscribed(true)
          setSuccessMessage('Push notifications enabled!')
          
          // Show test notification
          showLocalNotification('StrokeLab Notifications', {
            body: 'You will now receive notifications from StrokeLab!'
          })
        }
      }
    } catch (err) {
      setError('Failed to subscribe to notifications')
    }
  }

  const handleUnsubscribe = async () => {
    setError(null)
    setSuccessMessage(null)

    const success = await unsubscribeFromPushNotifications()
    
    if (success) {
      setIsSubscribed(false)
      setSuccessMessage('Push notifications disabled')
    } else {
      setError('Failed to unsubscribe')
    }
  }

  const handleToggle = (key: keyof Preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    const result = await updateNotificationPreferences(preferences)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccessMessage('Preferences saved!')
    }
    
    setSaving(false)
  }

  const handleTestNotification = async () => {
    const result = await sendTestNotification()
    
    if (result.error) {
      setError(result.error)
    } else {
      showLocalNotification('Test Notification', {
        body: 'This is a test notification from StrokeLab!'
      })
      setSuccessMessage('Test notification sent!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Push Notifications Toggle */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Push Notifications
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Get notified about rounds, goals, and tee times
          </p>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : !isSupported ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Push notifications are not supported in this browser.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {isSubscribed ? 'Notifications enabled' : 'Notifications disabled'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isSubscribed 
                      ? 'You will receive push notifications'
                      : 'Enable to receive notifications'
                    }
                  </p>
                </div>
                
                <button
                  onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isSubscribed
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubscribed ? 'Disable' : 'Enable'}
                </button>
              </div>

              {isSubscribed && (
                <button
                  onClick={handleTestNotification}
                  className="w-full py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Send Test Notification
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Notification Types
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose which notifications you want to receive
          </p>

          <div className="space-y-4">
            {[
              { key: 'roundReminders', label: 'Round Reminders', description: 'Reminders before scheduled rounds' },
              { key: 'weatherAlerts', label: 'Weather Alerts', description: 'Severe weather warnings for your courses' },
              { key: 'goalUpdates', label: 'Goal Updates', description: 'When you reach milestones or deadlines' },
              { key: 'teeTimeAlerts', label: 'Tee Time Alerts', description: 'Upcoming tee times and confirmations' }
            ].map((item) => (
              <div key={item.key} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={preferences[item.key as keyof Preferences]}
                    onChange={() => handleToggle(item.key as keyof Preferences)}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor={item.key} className="font-medium text-gray-900">
                    {item.label}
                  </label>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            About Notifications
          </h3>
          <p className="text-sm text-blue-700">
            Push notifications are sent even when the app is closed. 
            You can manage permissions in your browser settings at any time.
          </p>
        </div>
      </main>
    </div>
  )
}
