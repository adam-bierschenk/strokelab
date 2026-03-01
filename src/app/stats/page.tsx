import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getUserStrokesGainedStats } from '@/app/actions/strokes-gained'
import { StrokesGainedCard } from '@/components/stats/StrokesGainedCard'
import { StrokesGainedTrends } from '@/components/stats/StrokesGainedTrends'

export const metadata: Metadata = {
  title: 'Advanced Statistics | StrokeLab',
}

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }

  const result = await getUserStrokesGainedStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Statistics</h1>
              <p className="text-sm text-gray-600">Strokes gained analysis and trends</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result.success ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No data yet</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {result.error || 'Log some rounds with detailed stats to see strokes gained analysis.'}
            </p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StrokesGainedCard 
                title="Last 5 Rounds" 
                data={result.data?.last5!} 
              />
              <StrokesGainedCard 
                title="Last 10 Rounds" 
                data={result.data?.last10!} 
              />
              <StrokesGainedCard 
                title="Overall" 
                data={result.data?.overall!} 
                highlight
              />
            </div>

            {/* Trends Chart */}
            {result.data?.trends && result.data.trends.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Strokes Gained Trends</h2>
                <StrokesGainedTrends data={result.data.trends} />
              </div>
            )}

            {/* Explanation */}
            <div className="mt-8 bg-blue-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                About Strokes Gained
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="font-medium mr-2">Off the Tee:</span>
                  Performance on tee shots (par 4s & 5s)
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">Approach:</span>
                  Shots to the green from 150+ yards
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">Around Green:</span>
                  Short game within 30 yards of green
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">Putting:</span>
                  Performance on the green
                </li>
              </ul>
              <p className="mt-4 text-sm text-blue-700">
                <strong>Positive</strong> numbers = better than PGA Tour baseline
                <strong>Negative</strong> numbers = worse than baseline
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
