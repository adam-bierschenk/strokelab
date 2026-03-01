import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Course, Hole } from '@prisma/client'

interface CourseWithHoles extends Course {
  holes: Hole[]
}

async function getCourse(id: string): Promise<CourseWithHoles | null> {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      holes: {
        orderBy: { number: 'asc' }
      }
    }
  })
  return course
}

interface CourseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    notFound()
  }

  const frontNine = course.holes.filter(h => h.number <= 9)
  const backNine = course.holes.filter(h => h.number > 9)
  const frontPar = frontNine.reduce((sum, h) => sum + h.par, 0)
  const backPar = backNine.reduce((sum, h) => sum + h.par, 0)
  const frontYards = frontNine.reduce((sum, h) => sum + (h.yardage || 0), 0)
  const backYards = backNine.reduce((sum, h) => sum + (h.yardage || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link
              href="/courses"
              className="mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-sm text-gray-600">{course.location}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Course Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Par</p>
            <p className="text-2xl font-bold text-gray-900">{course.par}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
            <p className="text-2xl font-bold text-gray-900">{course.location || '-'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Holes</p>
            <p className="text-2xl font-bold text-gray-900">{course.holes.length}</p>
          </div>
        </div>

        {/* Scorecard */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-700">Course Scorecard</h2>
          </div>
          
          {/* Front Nine */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">Hole</th>
                  {frontNine.map(h => (
                    <th key={h.id} className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-12">{h.number}</th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-gray-100">Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 text-xs text-gray-500">Par</td>
                  {frontNine.map(h => (
                    <td key={`par-${h.id}`} className="px-2 py-2 text-center text-sm text-gray-900">{h.par}</td>
                  ))}
                  <td className="px-3 py-2 text-center text-sm font-bold text-gray-900 bg-gray-100">{frontPar}</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-2 text-xs text-gray-500">Yards</td>
                  {frontNine.map(h => (
                    <td key={`yards-${h.id}`} className="px-2 py-2 text-center text-sm text-gray-900">{h.yardage || '-'}</td>
                  ))}
                  <td className="px-3 py-2 text-center text-sm font-bold text-gray-900 bg-gray-100">{frontYards || '-'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-2 text-xs text-gray-500">HCP</td>
                  {frontNine.map(h => (
                    <td key={`hcp-${h.id}`} className="px-2 py-2 text-center text-sm text-gray-600">{h.handicap || '-'}</td>
                  ))}
                  <td className="px-3 py-2 bg-gray-100"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Back Nine */}
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">Hole</th>
                  {backNine.map(h => (
                    <th key={h.id} className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-12">{h.number}</th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-gray-100">In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 text-xs text-gray-500">Par</td>
                  {backNine.map(h => (
                    <td key={`par-${h.id}`} className="px-2 py-2 text-center text-sm text-gray-900">{h.par}</td>
                  ))}
                  <td className="px-3 py-2 text-center text-sm font-bold text-gray-900 bg-gray-100">{backPar}</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-2 text-xs text-gray-500">Yards</td>
                  {backNine.map(h => (
                    <td key={`yards-${h.id}`} className="px-2 py-2 text-center text-sm text-gray-900">{h.yardage || '-'}</td>
                  ))}
                  <td className="px-3 py-2 text-center text-sm font-bold text-gray-900 bg-gray-100">{backYards || '-'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-2 text-xs text-gray-500">HCP</td>
                  {backNine.map(h => (
                    <td key={`hcp-${h.id}`} className="px-2 py-2 text-center text-sm text-gray-600">{h.handicap || '-'}</td>
                  ))}
                  <td className="px-3 py-2 bg-gray-100"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between text-sm">
            <div>
              <span className="text-gray-600">Front Nine:</span>
              <span className="ml-2 font-bold text-gray-900">Par {frontPar}, {frontYards.toLocaleString()} yards</span>
            </div>
            <div>
              <span className="text-gray-600">Back Nine:</span>
              <span className="ml-2 font-bold text-gray-900">Par {backPar}, {backYards.toLocaleString()} yards</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
