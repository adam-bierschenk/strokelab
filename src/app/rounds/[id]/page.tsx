/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Round, Course, Hole } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface RoundWithDetails extends Round {
  course: Course & {
    holes: Hole[]
  }
  scores: Array<{
    id: string
    holeId: string
    score: number
    putts?: number | null
  }>
}

async function getRound(id: string): Promise<RoundWithDetails | null> {
  const { data: round, error } = await supabase
    .from('Round')
    .select(`
      *,
      Courses (
        *,
        holes:Hole (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !round) return null

  const { data: scores } = await supabase
    .from('Score')
    .select('id, holeId, score, putts')
    .eq('roundId', id)

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return {
    ...round,
    course: (round.Courses as any)?.[0] || round.Courses,
    scores: scores || []
  }
}

function formatDate(dateInput: string | Date): string {
  const dateStr = typeof dateInput === 'string' ? dateInput : dateInput.toISOString()
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export default async function RoundDetailPage({ params }: { params: { id: string } }) {
  const round = await getRound(params.id)

  if (!round) {
    notFound()
  }

  // Calculate stats
  // const frontNine = ...
  // const backNine = ...

  // Fill in scores
  const scoreMap = new Map(round.scores.map(s => [s.holeId, s]))
  const holesWithScores = round.course.holes.map(hole => {
    const score = scoreMap.get(hole.id)
    return {
      hole,
      score: score?.score ?? null,
      putts: score?.putts ?? null
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/rounds" className="text-sm text-gray-600 hover:text-gray-900">
                ← Back to Rounds
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{round.course.name}</h1>
              <p className="text-sm text-gray-600">{formatDate(round.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{round.totalScore}</p>
              <p className="text-sm text-gray-500">Par {round.course.par}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scorecard */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Scorecard</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {holesWithScores.map(({ hole, score, putts }) => (
              <div key={hole.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="w-8 text-center font-semibold text-gray-900">{hole.number}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Hole {hole.number}</p>
                    <p className="text-xs text-gray-500">Par {hole.par}, {hole.yardage} yards</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${score && score <= hole.par ? 'text-green-600' : 'text-gray-900'}`}>
                      {score ?? '-'}
                    </p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{putts ?? '-'}</p>
                    <p className="text-xs text-gray-500">Putts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}