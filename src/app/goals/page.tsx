import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getGoals } from '@/app/actions/goals'
import { Goal } from '@/types'

const goalTypeLabels: Record<string, string> = {
  SCORE_AVG: 'Average Score',
  ROUNDS_COUNT: 'Rounds Played',
  FAIRWAY_PCT: 'Fairway %',
  GIR_PCT: 'Greens in Regulation %',
  PUTTS_AVG: 'Putts per Round'
}

const goalTypeIcons: Record<string, string> = {
  SCORE_AVG: '🎯',
  ROUNDS_COUNT: '🏌️',
  FAIRWAY_PCT: '🛣️',
  GIR_PCT: '🟢',
  PUTTS_AVG: '⛳'
}

function formatValue(type: string, value: number): string {
  switch (type) {
    case 'SCORE_AVG':
    case 'PUTTS_AVG':
      return value.toFixed(1)
    case 'ROUNDS_COUNT':
      return value.toFixed(0)
    case 'FAIRWAY_PCT':
    case 'GIR_PCT':
      return `${value.toFixed(1)}%`
    default:
      return value.toString()
  }
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-green-500'
  if (percentage >= 75) return 'bg-green-400'
  if (percentage >= 50) return 'bg-yellow-400'
  if (percentage >= 25) return 'bg-orange-400'
  return 'bg-red-400'
}

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }

  const { goals, error } = await getGoals()

  const activeGoals = goals.filter((g: Goal) => g.status === 'active')
  const completedGoals = goals.filter((g: Goal) => g.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
              <p className="text-sm text-gray-600">Track your golf targets</p>
            </div>
            <Link
              href="/goals/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              + New Goal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl">🎯</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Set goals to track your progress and improve your game.
            </p>
            <Link
              href="/goals/new"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Your First Goal
            </Link>
          </div>
        ) : (
          <>
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Goals ({activeGoals.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGoals.map((goal: Goal) => {
                    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100)
                    
                    return (
                      <div key={goal.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{goalTypeIcons[goal.type]}</span>
                            <div>
                              <h3 className="font-medium text-gray-900">{goal.title}</h3>
                              <p className="text-sm text-gray-500">{goalTypeLabels[goal.type]}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Target</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatValue(goal.type, goal.targetValue)}
                            </p>
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatValue(goal.type, goal.currentValue)} / {formatValue(goal.type, goal.targetValue)}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(progress)} transition-all duration-300`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">{progress.toFixed(0)}% complete</p>

                        {goal.deadline && (
                          <p className="mt-3 text-xs text-gray-400">
                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        )}

                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/goals/${goal.id}/edit`}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Goals ({completedGoals.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedGoals.map((goal: Goal) => (
                    <div key={goal.id} className="bg-gray-100 rounded-xl p-6 opacity-75">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{goalTypeIcons[goal.type]}</span>
                          <div>
                            <h3 className="font-medium text-gray-700">{goal.title}</h3>
                            <p className="text-sm text-gray-500">{goalTypeLabels[goal.type]}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-2xl">✅</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Achieved: {formatValue(goal.type, goal.currentValue)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
