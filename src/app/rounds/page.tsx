/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface Round {
  id: string
  totalScore: number
  coursePar: number
  date: string
  course: {
    name: string
    par: number
  }
}

async function getRounds(): Promise<Round[]> {
  const { data: rounds, error } = await supabase
    .from('rounds')
    .select(`
      id,
      totalScore,
      date,
      courses (
        name,
        par
      )
    `)
    .order('date', { ascending: false })

  if (error || !rounds) {
    console.error('Error fetching rounds:', error)
    return []
  }

  return rounds.map((round: any) => ({
    id: round.id,
    totalScore: round.totalScore,
    coursePar: (round.courses as any)?.[0]?.par || 72,
    date: round.date,
    course: {
      name: (round.courses as any)?.[0]?.name || 'Unknown Course',
      par: (round.courses as any)?.[0]?.par || 72
    }
  }))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function scoreVsPar(score: number, par: number): { text: string; color: string; bg: string } {
  const diff = score - par
  if (diff < 0) return { text: `${diff}`, color: 'text-green-700', bg: 'bg-green-100' }
  if (diff === 0) return { text: 'E', color: 'text-gray-700', bg: 'bg-gray-100' }
  return { text: `+${diff}`, color: 'text-red-700', bg: 'bg-red-100' }
}

export default async function RoundsPage() {
  const rounds = await getRounds()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Round History</h1>
              <p className="text-sm text-gray-600">View and manage your past rounds</p>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {rounds.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">No rounds logged yet.</p>
            <Link
              href="/rounds/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
            >
              Log Your First Round
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rounds.map((round) => {
              const scoreInfo = scoreVsPar(round.totalScore, round.course.par)
              return (
                <Link
                  key={round.id}
                  href={`/rounds/${round.id}`}
                  className="block bg-white rounded-xl shadow hover:shadow-md transition-shadow"
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-semibold text-gray-900">{round.course.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(round.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{round.totalScore}</p>
                        <p className="text-sm text-gray-500">Par {round.course.par}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${scoreInfo.bg}`}>
                        <span className={`text-sm font-semibold ${scoreInfo.color}`}>{scoreInfo.text}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}