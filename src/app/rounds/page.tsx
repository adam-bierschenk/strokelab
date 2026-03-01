import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Round, Course } from '@prisma/client'

interface RoundWithCourse extends Round {
  course: Course
}

async function getRounds(): Promise<RoundWithCourse[]> {
  const { data: rounds, error } = await supabase
    .from('Round')
    .select(`
      *,
      Courses (
        name,
        par,
        location
      )
    `)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching rounds:', error)
    return []
  }

  return rounds?.map((r: any) => ({
    ...r,
    course: r.Courses?.[0] || { name: 'Unknown', par: 72, location: '' }
  })) || []
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatScore(score: number, par: number): { text: string; className: string } {
  const diff = score - par
  if (diff < 0) {
    return { text: `${score} (${diff})`, className: 'text-green-600 font-medium' }
  } else if (diff === 0) {
    return { text: `${score} (E)`, className: 'text-gray-600 font-medium' }
  } else {
    return { text: `${score} (+${diff})`, className: 'text-red-600 font-medium' }
  }
}

export default async function RoundsPage() {
  const rounds = await getRounds()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Round History</h1>
            <Link
              href="/rounds/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Round
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {rounds.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No rounds yet</h2>
            <p className="text-gray-600 mb-6">Start tracking your golf scores by adding your first round.</p>
            <Link
              href="/rounds/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Add First Round
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="Total Rounds"
                value={rounds.length}
                icon="🏌️"
              />
              <StatCard
                label="Best Score"
                value={Math.min(...rounds.map(r => r.totalScore))}
                icon="🏆"
              />
              <StatCard
                label="Avg Score"
                value={Math.round(rounds.reduce((sum, r) => sum + r.totalScore, 0) / rounds.length * 10) / 10}
                icon="📊"
              />
              <StatCard
                label="Total"
                value={Math.round(rounds.reduce((sum, r) => sum + r.totalScore, 0) / rounds.length * 10) / 10}
                icon="📊"
              />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-medium text-gray-700">Recent Rounds</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {rounds.map((round) => {
                  const scoreInfo = formatScore(round.totalScore, round.course.par)
                  return (
                    <Link
                      key={round.id}
                      href={`/rounds/${round.id}`}
                      className="block hover:bg-gray-50 transition-colors"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg">
                                  ⛳
                                </div>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">
                                  {round.course.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {round.course.location || ''} • {formatDate(round.date)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-right mr-4">
                              <p className={`text-sm ${scoreInfo.className}`}>
                                {scoreInfo.text}
                              </p>
                              <p className="text-xs text-gray-500">
                                Par {round.course.par}
                              </p>
                            </div>
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
