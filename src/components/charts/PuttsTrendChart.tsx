/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PuttsData {
  date: string
  putts: number
  course: string
}

interface PuttsTrendChartProps {
  data: PuttsData[]
}

export default function PuttsTrendChart({ data }: PuttsTrendChartProps) {
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Calculate average putts
  const avgPutts = sortedData.reduce((sum, d) => sum + d.putts, 0) / sortedData.length || 36

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const vsAvg = data.putts - avgPutts
      const vsAvgText = vsAvg > 0 ? `+${vsAvg.toFixed(1)}` : vsAvg.toFixed(1)
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{formatDate(label)}</p>
          <p className="text-xs text-gray-500">{data.course}</p>
          <p className="text-sm mt-1">
            Putts: <span className="font-bold">{data.putts}</span>
            <span className={`ml-2 text-xs ${vsAvg > 0 ? 'text-red-500' : 'text-green-500'}`}>
              ({vsAvgText} vs avg)
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Putts Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sortedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="colorPutts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              domain={[0, 'dataMax + 10']}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="putts" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              fill="url(#colorPutts)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
