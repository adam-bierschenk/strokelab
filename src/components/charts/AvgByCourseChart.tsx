/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CourseAvg {
  name: string
  avgScore: number
  rounds: number
  par: number
}

interface AvgByCourseChartProps {
  data: CourseAvg[]
}

export default function AvgByCourseChart({ data }: AvgByCourseChartProps) {
  const sortedData = [...data].sort((a, b) => a.avgScore - b.avgScore)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const vsPar = item.avgScore - item.par
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{item.name}</p>
          <p className="text-sm mt-1">
            Avg Score: <span className="font-bold">{item.avgScore.toFixed(1)}</span>
          </p>
          <p className="text-xs text-gray-500">
            {vsPar > 0 ? `+${vsPar.toFixed(1)}` : vsPar.toFixed(1)} vs par {item.par} - {item.rounds} rounds
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Average by Course</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="avgScore" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>Avg Score</span>
        </div>
      </div>
    </div>
  )
}
