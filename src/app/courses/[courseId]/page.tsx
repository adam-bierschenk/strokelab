import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import WeatherWidget from '@/components/WeatherWidget'

interface HoleData {
  id: string
  holeNumber: number
  par: number
  length?: number
}

export const metadata: Metadata = {
  title: 'Course Details | StrokeLab',
}

async function getCourse(courseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: course, error: courseError } = await supabase
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
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: stats, error: _statsError } = await supabase
    .from('Round')
    .select('id, totalScore')
    .eq('courseId', courseId)
    .eq('userId', user.id)
    .order('roundDate', { ascending: false })
    .limit(1)

  const bestScore = stats?.[0]?.totalScore || null

  return {
    ...course,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    holes: course.holes?.sort((a: any, b: any) => a.holeNumber - b.holeNumber) || [],
    bestScore
  }
}

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function CourseDetailsPage({ params }: Props) {
  const { courseId } = await params
  const course = await getCourse(courseId)

  if (!course) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalLength = course.holes.reduce((sum: number, h: any) => sum + (h.length || 0), 0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _avgHoleLength = course.holes.length > 0
    ? Math.round(totalLength / course.holes.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/courses"
            className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <div className="mt-4 flex flex-wrap gap-6">
                <div>
                  <p className="text-sm text-gray-500">Total Holes</p>
                  <p className="text-2xl font-bold text-gray-900">{course.holes.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Par</p>
                  <p className="text-2xl font-bold text-gray-900">{course.par}</p>
                </div>
                {totalLength > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Total Length</p>
                    <p className="text-2xl font-bold text-gray-900">{totalLength.toLocaleString()} yds</p>
                  </div>
                )}
                {course.bestScore && (
                  <div>
                    <p className="text-sm text-gray-500">Your Best</p>
                    <p className="text-2xl font-bold text-green-600">{course.bestScore}</p>
                  </div>
                )}
              </div>
            </div>
            <Link
              href={`/rounds/new?courseId=${courseId}`}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
            >
              Start Round
            </Link>
          </div>
        </div>

        {/* Weather Widget */}
        {course.lat && course.lon && (
          <WeatherWidget 
            lat={course.lat} 
            lon={course.lon} 
            courseName={course.name}
            showForecast={true}
          />
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Hole Details</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {course.holes.length === 0 ? (
              <p className="px-6 py-4 text-gray-600">No hole details available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {course.holes.map((hole: any) => (
                  <div key={hole.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Hole {hole.holeNumber}</span>
                      <span className="text-sm text-gray-500">Par {hole.par}</span>
                    </div>
                    {hole.length && (
                      <p className="text-sm text-gray-500">{hole.length} yards</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
