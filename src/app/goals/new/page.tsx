'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createGoal, GoalType } from '@/app/actions/goals'

const goalTypes: { value: GoalType; label: string; icon: string }[] = [
  { value: 'SCORE_AVG', label: 'Average Score', icon: '🎯' },
  { value: 'ROUNDS_COUNT', label: 'Rounds Played', icon: '🏌️' },
  { value: 'FAIRWAY_PCT', label: 'Fairway %', icon: '🛣️' },
  { value: 'GIR_PCT', label: 'Greens in Regulation %', icon: '🟢' },
  { value: 'PUTTS_AVG', label: 'Putts per Round', icon: '⛳' },
]

export default function NewGoalPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type: 'SCORE_AVG' as GoalType,
    title: '',
    description: '',
    targetValue: 90,
    deadline: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createGoal(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push('/goals')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getDefaultTitle = (type: GoalType) => {
    switch (type) {
      case 'SCORE_AVG': return 'Break 90'
      case 'ROUNDS_COUNT': return 'Play 50 Rounds'
      case 'FAIRWAY_PCT': return 'Hit 60% of Fairways'
      case 'GIR_PCT': return '50% Greens in Regulation'
      case 'PUTTS_AVG': return 'Average 30 Putts per Round'
    }
  }

  const getPlaceholderValue = (type: GoalType) => {
    switch (type) {
      case 'SCORE_AVG': return 90
      case 'ROUNDS_COUNT': return 50
      case 'FAIRWAY_PCT': return 60
      case 'GIR_PCT': return 50
      case 'PUTTS_AVG': return 30
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link
              href="/goals"
              className="mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Goal</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Goal Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Goal Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goalTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      type: type.value,
                      title: prev.title || getDefaultTitle(type.value),
                      targetValue: getPlaceholderValue(type.value)
                    }))
                  }}
                  className={`flex items-center p-4 border rounded-lg transition-colors ${
                    formData.type === type.value
                      ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <span className="text-2xl mr-3">{type.icon}</span>
                  <span className="font-medium text-gray-900">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-lg shadow p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder={getDefaultTitle(formData.type)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
            />
          </div>

          {/* Target Value */}
          <div className="bg-white rounded-lg shadow p-6">
            <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700 mb-2">
              Target Value *
            </label>
            <input
              type="number"
              id="targetValue"
              name="targetValue"
              required
              min="1"
              step={formData.type === 'ROUNDS_COUNT' ? 1 : 0.1}
              value={formData.targetValue}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.type === 'SCORE_AVG' && 'Target average score (e.g., 90)'}
              {formData.type === 'ROUNDS_COUNT' && 'Number of rounds to play'}
              {formData.type === 'FAIRWAY_PCT' && 'Percentage of fairways hit (0-100)'}
              {formData.type === 'GIR_PCT' && 'Percentage of greens in regulation (0-100)'}
              {formData.type === 'PUTTS_AVG' && 'Average putts per round'}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Why is this goal important to you?"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
            />
          </div>

          {/* Deadline */}
          <div className="bg-white rounded-lg shadow p-6">
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Deadline (Optional)
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/goals"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
