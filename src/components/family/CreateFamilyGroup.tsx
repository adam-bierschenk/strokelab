'use client'

import { useState } from 'react'
import { createFamilyGroup } from '@/app/actions/family'
import { useRouter } from 'next/navigation'

export function CreateFamilyGroup() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')

    const result = await createFamilyGroup(name.trim())

    if (result.success) {
      setName('')
      setIsOpen(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to create family group')
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Create Family Group</h2>
      </div>
      <div className="p-6">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            + Create New Group
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Smith Family"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setName('')
                  setError('')
                }}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
