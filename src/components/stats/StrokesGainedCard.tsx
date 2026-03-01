'use client'

import { StrokesGainedData } from '@/app/actions/strokes-gained'
import { getCategoryName, getStrokesGainedColor, formatStrokesGained } from '@/lib/strokes-gained'

interface StrokesGainedCardProps {
  title: string
  data: StrokesGainedData
  highlight?: boolean
}

export function StrokesGainedCard({ title, data, highlight = false }: StrokesGainedCardProps) {
  const categories: Array<keyof StrokesGainedData> = [
    'offTheTee',
    'approach',
    'aroundGreen',
    'putting'
  ]

  const getBarColor = (value: number): string => {
    if (value >= 0.5) return 'bg-green-500'
    if (value >= 0) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  const getBarWidth = (value: number): string => {
    // Map -1 to +1 range to percentage
    const clamped = Math.max(-1, Math.min(1, value))
    return `${Math.abs(clamped) * 100}%`
  }

  return (
    <div className={`bg-white rounded-xl shadow p-6 ${highlight ? 'ring-2 ring-green-500' : ''}`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
        highlight ? 'text-green-700' : 'text-gray-500'
      }`}>
        {title}
      </h3>

      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900">
          {formatStrokesGained(data.total)}
        </div>
        <p className="text-sm text-gray-500">Total Strokes Gained</p>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const value = data[category]
          return (
            <div key={category} className="flex items-center">
              <div className="w-24 flex-shrink-0">
                <p className="text-xs text-gray-600">{getCategoryName(category)}</p>
              </div>
              <div className="flex-1 mx-3">
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(value)} transition-all duration-500 ${
                      value < 0 ? 'ml-auto' : ''
                    }`}
                    style={{ width: getBarWidth(value) }}
                  />
                </div>
              </div>
              <div className="w-16 text-right">
                <p className={`text-sm font-medium ${getStrokesGainedColor(value)}`}>
                  {formatStrokesGained(value)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
