import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Round, Course, Hole, Score } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface RoundWithDetails extends Round {
  course: Course & {
    holes: Hole[]
  }
  scores: (Score & {
    hole: Hole
  })[]
}

async function getRound(id: string): Promise<RoundWithDetails | null> {
  const round = await prisma.round.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          holes: {
            orderBy: {
              number: 'asc'
            }
          }
        }
      },
      scores: {
        include: {
          hole: true
        },
        orderBy: {
          hole: {
            number: 'asc'
          }
        }
      }
    }
  })
  return round
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default async function RoundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const round = await getRound(id)

  if (!round) {
    notFound()
  }

  // Calculate stats
  const scoreMap = new Map(round.scores.map(s => [s.holeId, s]))
  
  // Fill in scores
  const holesWithScores = round.course.holes.map(hole => {
    const score = scoreMap.get(hole.id)
    return {
      hole,
      score: score?.score ?? null,
      putts: score?.putts ?? null
      // TODO: Add fairway and greenInReg to Score model for advanced stats
    }
  })

  const frontHoles = holesWithScores.filter(h => h.hole.number <= 9)
  const backHoles = holesWithScores.filter(h => h.hole.number > 9)

  const frontPar = frontHoles.reduce((sum, h) => sum + h.hole.par, 0)
  const backPar = backHoles.reduce((sum, h) => sum + h.hole.par, 0)
  const frontScore = frontHoles.reduce((sum, h) => sum + (h.score ?? 0), 0)
  const backScore = backHoles.reduce((sum, h) => sum + (h.score ?? 0), 0)
  const totalScore = frontScore + backScore

  const scoreToPar = totalScore - round.course.par
  const scoreDisplay = scoreToPar === 0 
    ? 'E' 
    : scoreToPar > 0 
      ? `+${scoreToPar}` 
      : `${scoreToPar}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/rounds"
                className="mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{round.course.name}</h1>
                <p className="text-sm text-gray-600">{formatDate(round.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/rounds/${round.id}/edit`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  scoreToPar < 0 ? 'text-green-600' : scoreToPar === 0 ? 'text-gray-900' : 'text-red-600'
                }`}>
                  {totalScore}
                  <span className="text-lg ml-1">({scoreDisplay})</span>
                </div>
                <p className="text-sm text-gray-500">Par {round.course.par}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Course Info */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {round.course.location && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {round.course.location}
              </div>
            )}
          </div>
        </div>

        {/* Scorecard */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-700">Scorecard</h2>
          </div>
          
          {/* Front Nine */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hole</th>
                  {frontHoles.map(h => (
                    <th key={h.hole.id} className="px-2 py-2 text-center text-xs font-medium text-gray-500">{h.hole.number}</th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-gray-100">Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 text-xs text-gray-500">Par</td>
                  {frontHoles.map(h => (
                    <td key={`par-${h.hole.id}`} className="px-2 py-2 text-center text-xs text-gray-600">{h.hole.par}</td>
                  ))}
                  <td className="px-3 py-2 text-center text-xs font-medium text-gray-900 bg-gray-100">{frontPar}</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-2 text-xs font-medium text-gray-900">Score</td>
                  {frontHoles.map(h => (
                    <td key={`score-${h.hole.id}`} 
                        className={`px-2 py-2 text-center text-sm font-medium ${
                          h.score ? (h.score < h.hole.par ? 'text-green-600' : h.score > h.hole.par ? 'text-red-600' : 'text-gray-900') : 'text-gray-300'
                        }`}>
                      {h.score ?? '-'}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center text-sm font-bold text-gray-900 bg-gray-100">{frontScore || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Back Nine */}
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hole</th>
                  {backHoles.map(h => (
                    <th key={h.hole.id} className="px-2 py-2 text-center text-xs font-medium text-gray-500">{h.hole.number}</th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-gray-100">In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 text-xs text-gray-500">Par</td>
                  {backHoles.map(h => (
                    <td key={`par-${h.hole.id}`} className="px-2 py-2 text-center text-xs text-gray-600">{h.hole.par}</td>
                  ))}
                  <td className="px-3 py-2 text-center text-xs font-medium text-gray-900 bg-gray-100">{backPar}</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-2 text-xs font-medium text-gray-900">Score</td>
                  {backHoles.map(h => (
                    <td key={`score-${h.hole.id}`} 
                        className={`px-2 py-2 text-center text-sm font-medium ${
                          h.score ? (h.score < h.hole.par ? 'text-green-600' : h.score > h.hole.par ? 'text-red-600' : 'text-gray-900') : 'text-gray-300'
                        }`}>
                      {h.score ?? '-'}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center text-sm font-bold text-gray-900 bg-gray-100">{backScore || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between text-sm">
            <div>
              <span className="text-gray-600">Front Nine:</span>
              <span className={`ml-2 font-bold ${frontScore < frontPar ? 'text-green-600' : frontScore > frontPar ? 'text-red-600' : 'text-gray-900'}`}>
                {frontScore} ({frontScore < frontPar ? '-' : frontScore > frontPar ? '+' : ''}{Math.abs(frontScore - frontPar)})
              </span>
            </div>
            <div>
              <span className="text-gray-600">Back Nine:</span>
              <span className={`ml-2 font-bold ${backScore < backPar ? 'text-green-600' : backScore > backPar ? 'text-red-600' : 'text-gray-900'}`}>
                {backScore} ({backScore < backPar ? '-' : backScore > backPar ? '+' : ''}{Math.abs(backScore - backPar)})
              </span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {round.totalPutts !== null && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {round.totalPutts !== null && (
              <StatCard 
                label="Putts" 
                value={round.totalPutts} 
                subtext={`${(round.totalPutts / 18).toFixed(1)} avg/hole`}
              />
            )}
            {round.fairwaysHit !== null && (
              <StatCard 
                label="Fairways Hit" 
                value={`${round.fairwaysHit}/14`}
                subtext={`${Math.round((round.fairwaysHit / 14) * 100)}%`}
              />
            )}
            {round.greensInReg !== null && (
              <StatCard 
                label="Greens in Reg" 
                value={`${round.greensInReg}/18`}
                subtext={`${Math.round((round.greensInReg / 18) * 100)}%`}
              />
            )}
            <StatCard 
              label="Total Score" 
              value={totalScore}
              subtext={`${scoreToPar <= 0 ? '' : '+'}${scoreToPar} vs par`}
            />
          </div>
        )}

        {/* Notes */}
        {round.notes && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{round.notes}</p>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, subtext }: { label: string; value: string | number; subtext: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  )
}
