// Push notification utilities for web

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications not supported')
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: await getApplicationServerKey()
    })

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh'))!,
        auth: arrayBufferToBase64(subscription.getKey('auth'))!
      }
    }
  } catch (error) {
    console.error('Failed to subscribe:', error)
    return null
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to unsubscribe:', error)
    return false
  }
}

// Get current subscription
export async function getPushSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh'))!,
          auth: arrayBufferToBase64(subscription.getKey('auth'))!
        }
      }
    }
    return null
  } catch {
    return null
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported')
  }
  
  return await Notification.requestPermission()
}

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer | null): string | null {
  if (!buffer) return null
  
  const bytes = new Uint8Array(buffer)
  const binary = bytes.reduce((str, byte) => str + String.fromCharCode(byte), '')
  return btoa(binary)
}

// Get VAPID public key from server
async function getApplicationServerKey(): Promise<Uint8Array> {
  // In production, fetch from server
  // const response = await fetch('/api/push/public-key')
  // const { publicKey } = await response.json()
  
  // Mock key for development - this would be the VAPID public key
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
    'BEl62iKj_8ZfL8wF3rKzU7x1I2m4nK8o9pQ1r2S3t4U5v6W7x8Y9z0a1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6'
  
  // Convert base64 to Uint8Array
  const padding = '='.repeat((4 - publicKey.length % 4) % 4)
  const base64 = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  
  return output
}

// Show local notification
export function showLocalNotification(title: string, options: NotificationOptions = {}): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      ...options
    })
  }
}
