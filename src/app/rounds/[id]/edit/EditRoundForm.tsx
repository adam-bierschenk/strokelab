'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateRound } from '@/app/actions/rounds'
import { prisma } from '@/lib/prisma'
import { Round, Course } from '@prisma/client'

interface RoundWithCourse extends Round {
  course: Course
}

interface EditRoundFormProps {
  round: RoundWithCourse
}

export default function EditRoundForm({ round }: EditRoundFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    totalScore: round.totalScore,
    totalPutts: round.totalPutts ?? '',
    fairwaysHit: round.fairwaysHit ?? '',
    greensInReg: round.greensInReg ?? '',
    notes: round.notes ?? ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateRound({
        id: round.id,
        userId: round.userId,
        totalScore: Number(formData.totalScore),
        totalPutts: formData.totalPutts ? Number(formData.totalPutts) : undefined,
        fairwaysHit: formData.fairwaysHit ? Number(formData.fairwaysHit) : undefined,
        greensInReg: formData.greensInReg ? Number(formData.greensInReg) : undefined,
        notes: formData.notes || undefined
      })

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push(`/rounds/${round.id}`)
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
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
              min="18"
              max="200"
              value={formData.totalScore}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
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
              max="200"
              value={formData.totalPutts}
              onChange={handleChange}
              placeholder="e.g., 36"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
            />
            <p className="mt-1 text-xs text-gray-500">Total putts for 18 holes</p>
          </div>

          <div>
            <label htmlFor="fairwaysHit" className="block text-sm font-medium text-gray-700 mb-2">
              Fairways Hit
            </label>
            <input
              type="number"
              id="fairwaysHit"
              name="fairwaysHit"
              min="0"
              max="14"
              value={formData.fairwaysHit}
              onChange={handleChange}
              placeholder="e.g., 8"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
            />
            <p className="mt-1 text-xs text-gray-500">Out of 14 possible (excluding par 3s)</p>
          </div>

          <div>
            <label htmlFor="greensInReg" className="block text-sm font-medium text-gray-700 mb-2">
              Greens in Regulation
            </label>
            <input
              type="number"
              id="greensInReg"
              name="greensInReg"
              min="0"
              max="18"
              value={formData.greensInReg}
              onChange={handleChange}
              placeholder="e.g., 12"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
            />
            <p className="mt-1 text-xs text-gray-500">Out of 18 greens</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>

        <div>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any notes about this round..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
          />
          <p className="mt-1 text-xs text-gray-500">Optional notes about weather, course conditions, etc.</p>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <Link
          href={`/rounds/${round.id}`}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
