/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface ScoreData {
  date: string
  score: number
  par: number
  course: string
}

interface ScoreTrendChartProps {
  data: ScoreData[]
}

export default function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Calculate average score
  const avgScore = sortedData.reduce((sum, d) => sum + d.score, 0) / sortedData.length

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const vsPar = data.score - data.par
      const vsParText = vsPar === 0 ? 'E' : vsPar > 0 ? `+${vsPar}` : `${vsPar}`
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{formatDate(label)}</p>
          <p className="text-xs text-gray-500">{data.course}</p>
          <p className="text-sm mt-1">
            Score: <span className="font-bold">{data.score}</span> 
            ({vsParText} vs par {data.par})
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            
            <ReferenceLine 
              y={avgScore} 
              stroke="#10b981" 
              strokeDasharray="3 3"
              label={{ value: `Avg: ${avgScore.toFixed(0)}`, position: 'right', fill: '#10b981', fontSize: 12 }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ fill: '#3b82f6', r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
