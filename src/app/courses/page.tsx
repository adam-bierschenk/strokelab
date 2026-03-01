import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase-server'
import CourseSearch from './CourseSearch'

export const metadata: Metadata = {
  title: 'Courses | StrokeLab',
}

async function getCourses() {
  const supabase = await createClient()
  
  const { data: courses, error } = await supabase
    .from('Course')
    .select(`
      id,
      name,
      par,
      holes:Hole (
        id,
        holeNumber,
        par,
        length
      )
    `)
    .order('name')

  if (error || !courses) {
    console.error('Error fetching courses:', error)
    return []
  }

  return courses.map(course => ({
    ...course,
    holes: course.holes?.length || 0
  }))
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-gray-600">Browse and search golf courses</p>
        </div>

        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <CourseSearch initialCourses={courses} />
        </Suspense>
      </div>
    </div>
  )
}
