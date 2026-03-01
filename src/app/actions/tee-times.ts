'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export interface TeeTime {
  id: string
  courseId: string
  courseName: string
  date: string
  time: string
  available: boolean
  price?: number
  holes: 9 | 18
  players: number
}

export interface Booking {
  id: string
  userId: string
  teeTimeId: string
  courseId: string
  courseName: string
  date: string
  time: string
  players: number
  price: number
  status: 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

// Mock tee time data - in production, this would come from an API like GolfNow, TeeOff, etc.
const mockTeeTimes: TeeTime[] = [
  {
    id: 'tt-001',
    courseId: 'white-eagle',
    courseName: 'White Eagle Golf Club',
    date: '2026-03-02',
    time: '07:30',
    available: true,
    price: 65,
    holes: 18,
    players: 4
  },
  {
    id: 'tt-002',
    courseId: 'white-eagle',
    courseName: 'White Eagle Golf Club',
    date: '2026-03-02',
    time: '10:00',
    available: true,
    price: 75,
    holes: 18,
    players: 4
  },
  {
    id: 'tt-003',
    courseId: 'white-eagle',
    courseName: 'White Eagle Golf Club',
    date: '2026-03-02',
    time: '14:00',
    available: true,
    price: 55,
    holes: 18,
    players: 4
  },
  {
    id: 'tt-004',
    courseId: 'white-eagle',
    courseName: 'White Eagle Golf Club',
    date: '2026-03-01',
    time: '08:00',
    available: false,
    price: 70,
    holes: 18,
    players: 4
  }
]

export async function searchTeeTimes(courseId: string, date: string) {
  // In production, this would call an external tee time API
  const filtered = mockTeeTimes.filter(
    tt => tt.courseId === courseId && tt.date === date
  )
  
  return { teeTimes: filtered }
}

export async function getAvailableCourses() {
  const supabase = await createClient()
  
  const { data: courses, error } = await supabase
    .from('Course')
    .select('id, name, city, state')
    .order('name')
  
  if (error) {
    return { error: error.message, courses: [] }
  }
  
  return { courses: courses || [] }
}

export async function bookTeeTime(teeTimeId: string, players: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  // Find the tee time
  const teeTime = mockTeeTimes.find(tt => tt.id === teeTimeId)
  if (!teeTime) {
    return { error: 'Tee time not found' }
  }
  
  if (!teeTime.available) {
    return { error: 'Tee time no longer available' }
  }
  
  // Create booking in database
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      userId: user.id,
      teeTimeId: teeTime.id,
      courseId: teeTime.courseId,
      courseName: teeTime.courseName,
      date: teeTime.date,
      time: teeTime.time,
      players: Math.min(players, teeTime.players),
      price: teeTime.price || 0,
      status: 'confirmed'
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/tee-times')
  revalidatePath('/bookings')
  
  return { success: true, booking }
}

export async function getMyBookings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', bookings: [] }
  }
  
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('userId', user.id)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
  
  if (error) {
    return { error: error.message, bookings: [] }
  }
  
  return { bookings: bookings || [] }
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }
  
  // Verify ownership
  const { data: booking } = await supabase
    .from('bookings')
    .select('userId')
    .eq('id', bookingId)
    .single()
  
  if (!booking || booking.userId !== user.id) {
    return { error: 'Booking not found' }
  }
  
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/bookings')
  return { success: true }
}
