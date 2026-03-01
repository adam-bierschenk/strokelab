'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getMyBookings, cancelBooking } from '@/app/actions/tee-times'

interface Booking {
  id: string
  courseName: string
  date: string
  time: string
  players: number
  price: number
  status: 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    const { bookings, error } = await getMyBookings()
    
    if (error) {
      setError(error)
    } else {
      setBookings(bookings)
    }
    
    setLoading(false)
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    setCancelling(bookingId)
    setError(null)
    
    const { success, error } = await cancelBooking(bookingId)
    
    if (error) {
      setError(error)
    } else if (success) {
      await loadBookings()
    }
    
    setCancelling(null)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dateOnly = new Date(dateStr)
    dateOnly.setHours(0, 0, 0, 0)
    
    let prefix = ''
    if (dateOnly.getTime() === today.getTime()) {
      prefix = 'Today • '
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      prefix = 'Tomorrow • '
    }
    
    return prefix + date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const activeBookings = bookings.filter(b => b.status === 'confirmed')
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              </div>
            </div>
            <Link
              href="/tee-times"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
            >
              Book Tee Time
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : activeBookings.length === 0 && pastBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl">🏌️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-gray-600 mb-6">Book a tee time to schedule your next round.</p>
            <Link
              href="/tee-times"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              Find Tee Times
            </Link>
          </div>
        ) : (
          <>
            {/* Upcoming Bookings */}
            {activeBookings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Upcoming ({activeBookings.length})
                </h2>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {activeBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="w-14 h-14 rounded-lg bg-green-100 flex flex-col items-center justify-center">
                            <span className="text-xs text-green-600 font-medium">
                              {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              {new Date(booking.date).getDate()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">{booking.courseName}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(booking.date)} • {formatTime(booking.time)} • {booking.players} players
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(booking.status)}
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelling === booking.id}
                            className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Past ({pastBookings.length})
                </h2>
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {pastBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="px-6 py-4 opacity-75 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold text-gray-500">
                              {new Date(booking.date).getDate()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-700">{booking.courseName}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(booking.date)} • {formatTime(booking.time)} • {booking.players} players
                            </p>
                          </div>
                        </div>

                        <div className="mt-2">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
