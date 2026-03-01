'use client'

import { useState } from 'react'
import { createLessonNote } from '@/app/actions/lesson-notes'
import { useRouter } from 'next/navigation'

const categories = [
  'Swing',
  'Putting',
  'Short Game',
  'Course Management',
  'Mental Game',
  'Fitness',
  'Equipment',
  'Other'
]

export function CreateLessonNote() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Swing')
  const [coachName, setCoachName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    setLoading(true)
    setError('')

    const result = await createLessonNote({
      title: title.trim(),
      content: content.trim(),
      category,
      coachName: coachName.trim() || undefined
    })

    if (result.success) {
      setTitle('')
      setContent('')
      setCoachName('')
      setIsOpen(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to create lesson note')
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">New Lesson Note</h2>
      </div>
      <div className="p-6">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            + Create Lesson Note
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Driver Setup Changes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="coachName" className="block text-sm font-medium text-gray-700 mb-1">
                Coach Name (optional)
              </label>
              <input
                type="text"
                id="coachName"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Notes *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you work on? Key takeaways, drills, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={6}
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
                {loading ? 'Saving...' : 'Save Note'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setTitle('')
                  setContent('')
                  setCoachName('')
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
