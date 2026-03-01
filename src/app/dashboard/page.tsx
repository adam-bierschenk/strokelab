/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SignOutButton from '@/components/SignOutButton'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ScoreTrendChart from '@/components/charts/ScoreTrendChart'
import AvgByCourseChart from '@/components/charts/AvgByCourseChart'
import PuttsTrendChart from '@/components/charts/PuttsTrendChart'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface UserStats {
  totalRounds: number
  bestScore: number | null
  bestScoreCourse: string | null
  avgScore: number | null
  avgPutts: number | null
  fairwayPercentage: number | null
  girPercentage: number | null
  recentRounds: Array<{
    id: string
    totalScore: number
    courseName: string
    coursePar: number
    date: string
  }>
  // Chart data
  scoreTrendData: Array<{
    date: string
    score: number
    par: number
    course: string
  }>
  courseAvgData: Array<{
    name: string
    avgScore: number
    rounds: number
    par: number
  }>
  puttsTrendData: Array<{
    date: string
    putts: number
    course: string
  }>
}

async function getDashboardStats(): Promise<UserStats> {
  // Fetch rounds with course data using Supabase
  const { data: rounds, error } = await supabase
    .from('Round')
    .select(`
      id,
      totalScore,
      totalPutts,
      date,
      courseId,
      Courses (
        name,
        par
      )
    `)
    .order('date', { ascending: false })

  if (error || !rounds || rounds.length === 0) {
    return {
      totalRounds: 0,
      bestScore: null,
      bestScoreCourse: null,
      avgScore: null,
      avgPutts: null,
      fairwayPercentage: null,
      girPercentage: null,
      recentRounds: [],
      scoreTrendData: [],
      courseAvgData: [],
      puttsTrendData: []
    }
  }

  const totalRounds = rounds.length
  const scores = rounds.map((r: any) => r.totalScore)
  const avgScore = scores.reduce((sum: number, s: number) => sum + s, 0) / totalRounds
  const bestScore = Math.min(...scores)
  const bestRound: any = rounds.find((r: any) => r.totalScore === bestScore)

  const puttsRounds = rounds.filter((r: any) => r.totalPutts !== null)
  const avgPutts = puttsRounds.length > 0
    ? puttsRounds.reduce((sum: number, r: any) => sum + (r.totalPutts || 0), 0) / puttsRounds.length
    : null

  const recentRounds = rounds.slice(0, 5).map((r: any) => ({
    id: r.id,
    totalScore: r.totalScore,
    courseName: (r.Courses as any)?.[0]?.name || 'Unknown Course',
    coursePar: (r.Courses as any)?.[0]?.par || 72,
    date: r.date
  }))

  // Chart data: score trend (last 20 rounds)
  const scoreTrendData = [...rounds]
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-20)
    .map((r: any) => ({
      date: r.date,
      score: r.totalScore,
      par: (r.Courses as any)?.[0]?.par || 72,
      course: (r.Courses as any)?.[0]?.name || 'Unknown'
    }))

  // Chart data: course averages
  const courseStats: Record<string, { total: number; count: number; par: number }> = {}
  rounds.forEach((r: any) => {
    const name = (r.Courses as any)?.[0]?.name || 'Unknown'
    const par = (r.Courses as any)?.[0]?.par || 72
    if (!courseStats[name]) {
      courseStats[name] = { total: 0, count: 0, par }
    }
    courseStats[name].total += r.totalScore
    courseStats[name].count += 1
  })
  const courseAvgData = Object.entries(courseStats).map(([name, stats]) => ({
    name,
    avgScore: Math.round((stats.total / stats.count) * 10) / 10,
    rounds: stats.count,
    par: stats.par
  })).sort((a, b) => b.rounds - a.rounds)

  // Chart data: putts trend
  const puttsTrendData = rounds
    .filter((r: any) => r.totalPutts !== null)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-20)
    .map((r: any) => ({
      date: r.date,
      putts: r.totalPutts,
      course: (r.Courses as any)?.[0]?.name || 'Unknown'
    }))

  return {
    totalRounds,
    bestScore,
    bestScoreCourse: (bestRound?.Courses as any)?.[0]?.name || null,
    avgScore,
    avgPutts,
    fairwayPercentage: null,
    girPercentage: null,
    recentRounds,
    scoreTrendData,
    courseAvgData,
    puttsTrendData
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

function scoreVsPar(score: number, par: number): { text: string; color: string } {
  const diff = score - par
  if (diff < 0) return { text: `${diff}`, color: 'text-green-600' }
  if (diff === 0) return { text: 'E', color: 'text-gray-900' }
  return { text: `+${diff}`, color: 'text-red-600' }
}

export default async function DashboardPage() {
  const supabaseServer = await createClient()
  const { data: { user } } = await supabaseServer.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }
  
  const stats = await getDashboardStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Track your golf performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <SignOutButton />
              <Link
                href="/rounds/new"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Log Round
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats.totalRounds === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to StrokeLab!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start tracking your golf journey by logging your first round.
            </p>
            <Link
              href="/rounds/new"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Log Your First Round
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard
                label="Rounds Played"
                value={stats.totalRounds}
                icon="🏌️"
              />
              <StatCard
                label="Best Score"
                value={stats.bestScore ?? '-'}
                subtext={stats.bestScoreCourse ? `@ ${stats.bestScoreCourse}` : undefined}
                icon="🏆"
                highlight={true}
              />
              <StatCard
                label="Avg Score"
                value={stats.avgScore?.toFixed(1) ?? '-'}
                icon="📊"
              />
              <StatCard
                label="Avg Putts"
                value={stats.avgPutts?.toFixed(1) ?? '-'}
                icon="⛳"
              />
              <StatCard
                label="Fairways %"
                value={stats.fairwayPercentage !== null ? `${stats.fairwayPercentage}%` : '-'}
                icon="🎯"
              />
              <StatCard
                label="GIR %"
                value={stats.girPercentage !== null ? `${stats.girPercentage}%` : '-'}
                icon="🟢"
              />
            </div>

            {/* Charts Grid */}
            {stats.totalRounds >= 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <ScoreTrendChart data={stats.scoreTrendData} />
                <AvgByCourseChart data={stats.courseAvgData} />
                {(stats.puttsTrendData?.length ?? 0) >= 2 && (
                  <PuttsTrendChart data={stats.puttsTrendData} />
                )}
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Rounds */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Rounds</h2>
                    <Link href="/rounds" className="text-sm text-green-600 hover:text-green-700 font-medium">
                      View All →
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {stats.recentRounds.map((round) => {
                      const scoreInfo = scoreVsPar(round.totalScore, round.coursePar)
                      return (
                        <Link
                          key={round.id}
                          href={`/rounds/${round.id}`}
                          className="block hover:bg-gray-50 transition-colors"
                        >
                          <div className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">{round.courseName}</p>
                                <p className="text-xs text-gray-500">{formatDate(round.date)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${scoreInfo.color}`}>
                                {scoreInfo.text}
                              </p>
                              <p className="text-xs text-gray-500">{round.totalScore}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Links & Info */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/tee-times"
                      className="block w-full text-center py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      Book Tee Time
                    </Link>
                    <Link
                      href="/rounds/new"
                      className="block w-full text-center py-2 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Log Round
                    </Link>
                    <Link
                      href="/goals"
                      className="block w-full text-center py-2 px-4 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 transition-colors"
                    >
                      View Goals
                    </Link>
                    <Link
                      href="/family"
                      className="block w-full text-center py-2 px-4 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Family Groups
                    </Link>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Performance Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Scoring Average</span>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.avgScore?.toFixed(1) ?? '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Best Round</span>
                      <span className="text-sm font-medium text-green-600">
                        {stats.bestScore ? `${stats.bestScore} (${stats.bestScoreCourse})` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rounds Played</span>
                      <span className="text-sm font-medium text-gray-900">{stats.totalRounds}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtext,
  icon,
  highlight = false
}: {
  label: string
  value: string | number
  subtext?: string
  icon: string
  highlight?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl shadow p-4 ${highlight ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div className={`text-2xl font-bold ${highlight ? 'text-green-600' : 'text-gray-900'}`}>
          {value}
        </div>
      </div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      {subtext && (
        <p className="text-xs text-gray-400 mt-1 truncate">{subtext}</p>
      )}
    </div>
  )
}
