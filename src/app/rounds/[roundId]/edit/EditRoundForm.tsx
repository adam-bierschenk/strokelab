'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateRound } from '@/app/actions/rounds'

interface Course {
  id: string
  name: string
  par: number
}

interface Round {
  id: string
  totalScore: number
  totalPutts: number | null
  notes: string | null
  course: Course
}

interface EditRoundFormProps {
  round: Round
}

export default function EditRoundForm({ round }: EditRoundFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    totalScore: round.totalScore,
    totalPutts: round.totalPutts?.toString() || '',
    notes: round.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await updateRound({
      id: round.id,
      totalScore: Number(formData.totalScore),
      totalPutts: formData.totalPutts ? Number(formData.totalPutts) : undefined,
      notes: formData.notes || undefined
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push(`/rounds/${round.id}`)
      router.refresh()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Round Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="totalScore" className="block text-sm font-medium text-gray-700 mb-2">
              Total Score *
            </label>
            <input
              type="number"
              id="totalScore"
              name="totalScore"
              required
              min={round.course.par - 10}
              max={round.course.par + 30}
              value={formData.totalScore}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">Par {round.course.par}</p>
          </div>

          <div>
            <label htmlFor="totalPutts" className="block text-sm font-medium text-gray-700 mb-2">
              Total Putts
            </label>
            <input
              type="number"
              id="totalPutts"
              name="totalPutts"
              min="0"
              max="100"
              value={formData.totalPutts}
              onChange={handleChange}
              placeholder="e.g., 36"
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any notes..."
          className="block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="flex items-center justify-end space-x-4">
        <Link
          href={`/rounds/${round.id}`}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
