'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { searchTeeTimes, getAvailableCourses, bookTeeTime } from '@/app/actions/tee-times'

interface TeeTime {
  id: string
  courseId: string
  courseName: string
  date: string
  time: string
  available: boolean
  price?: number
  holes: number
  players: number
}

interface Course {
  id: string
  name: string
  city?: string
  state?: string
}

export default function TeeTimesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    const { courses, error } = await getAvailableCourses()
    if (error) {
      setError(error)
    } else {
      setCourses(courses)
      if (courses.length > 0) {
        setSelectedCourse(courses[0].id)
      }
    }
  }

  const handleSearch = async () => {
    if (!selectedCourse || !selectedDate) return
    
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    const { teeTimes: results, error } = await searchTeeTimes(selectedCourse, selectedDate)
    
    if (error) {
      setError(error)
    } else {
      setTeeTimes(results)
    }
    
    setLoading(false)
  }

  const handleBook = async (teeTimeId: string) => {
    setBookingInProgress(teeTimeId)
    setError(null)
    
    const { success, error, booking } = await bookTeeTime(teeTimeId, 1)
    
    if (error) {
      setError(error)
    } else if (success) {
      setSuccessMessage(`Tee time booked at ${booking.courseName}!`)
      // Refresh tee times
      handleSearch()
    }
    
    setBookingInProgress(null)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Book Tee Time</h1>
              </div>
            </div>
            <Link
              href="/bookings"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              My Bookings →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} {course.city && `(${course.city})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading || !selectedCourse}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Tee Times'}
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
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

        {/* Results */}
        {teeTimes.length > 0 ? (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Tee Times ({teeTimes.filter(t => t.available).length})
              </h2>
              <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
            </div>

            <div className="divide-y divide-gray-200">
              {teeTimes.map((teeTime) => (
                <div
                  key={teeTime.id}
                  className={`px-6 py-4 flex items-center justify-between ${
                    !teeTime.available ? 'bg-gray-50 opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center">
                      <span className="text-2xl">🏌️</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-medium text-gray-900">
                        {formatTime(teeTime.time)}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{teeTime.holes} holes</span>
                        <span>•</span>
                        <span>Up to {teeTime.players} players</span>
                        {teeTime.price && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-green-600">${teeTime.price}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {teeTime.available ? (
                      <button
                        onClick={() => handleBook(teeTime.id)}
                        disabled={bookingInProgress === teeTime.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {bookingInProgress === teeTime.id ? 'Booking...' : 'Book Now'}
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md font-medium">
                        Booked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <p className="text-gray-600">
              {loading ? 'Searching...' : 'Select a course and date to find tee times'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
