'use client'

interface TrendData {
  date: string
  total: number
  offTheTee: number
  approach: number
  aroundGreen: number
  putting: number
}

interface StrokesGainedTrendsProps {
  data: TrendData[]
}

export function StrokesGainedTrends({ data }: StrokesGainedTrendsProps) {
  if (data.length === 0) return null

  // Simple visualization using CSS
  const maxValue = Math.max(
    ...data.map(d => Math.max(
      Math.abs(d.total),
      Math.abs(d.offTheTee),
      Math.abs(d.approach),
      Math.abs(d.aroundGreen),
      Math.abs(d.putting)
    ))
  )

  const getHeight = (value: number): string => {
    const maxExpected = Math.max(3, maxValue) // At least 3
    const percentage = Math.abs(value) / maxExpected * 50
    return `${Math.min(percentage, 100)}%`
  }

  const getColor = (value: number): string => {
    if (value >= 0) return 'bg-green-500'
    return 'bg-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Total Trend */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Total Strokes Gained Trend</h4>
        <div className="flex items-end space-x-1 h-32">
          {data.map((round, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full ${getColor(round.total)} rounded-t transition-all duration-300`}
                style={{ height: getHeight(round.total) }}
                title={`${round.date}:\n${round.total > 0 ? '+' : ''}${round.total.toFixed(2)}`}
              />
              <div className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-left translate-y-1">
                {round.date.slice(5)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Category Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'offTheTee', label: 'Off the Tee' },
            { key: 'approach', label: 'Approach' },
            { key: 'aroundGreen', label: 'Around Green' },
            { key: 'putting', label: 'Putting' },
          ].map((cat) => {
            const values = data.map(d => (d as any)[cat.key] as number)
            const avg = values.reduce((a, b) => a + b, 0) / values.length
            
            return (
              <div key={cat.key} className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{cat.label}</p>
                <p className={`text-lg font-semibold ${avg >= 0 ? 'text-green-600' : 'text-red-500'}`}
003e
                  {avg > 0 ? '+' : ''}{avg.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">per round avg</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
