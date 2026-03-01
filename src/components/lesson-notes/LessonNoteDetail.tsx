'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LessonNote, shareLessonNote, unshareLessonNote, deleteLessonNote } from '@/app/actions/lesson-notes'

interface LessonNoteDetailProps {
  note: LessonNote & { userId?: string }
  isOwner: boolean
}

export function LessonNoteDetail({ note, isOwner }: LessonNoteDetailProps) {
  const [shareEmail, setShareEmail] = useState('')
  const [shareError, setShareError] = useState('')
  const [shareSuccess, setShareSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareEmail.trim()) return

    setShareError('')
    setShareSuccess('')

    const result = await shareLessonNote(note.id, shareEmail.trim())

    if (result.success) {
      setShareSuccess('Shared successfully!')
      setShareEmail('')
      setTimeout(() => setShareSuccess(''), 3000)
      router.refresh()
    } else {
      setShareError(result.error || 'Failed to share')
    }
  }

  const handleUnshare = async (userId: string) => {
    const result = await unshareLessonNote(note.id, userId)
    if (result.success) {
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lesson note?')) return

    setIsDeleting(true)
    const result = await deleteLessonNote(note.id)
    
    if (result.success) {
      router.push('/lesson-notes')
    } else {
      alert(result.error || 'Failed to delete')
      setIsDeleting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const renderContent = () => {
    // Split content by newlines and render
    return note.content.split('\n').map((paragraph, i) => (
      <p key={i} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    ))
  }

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {note.category}
              </span>
              {note.coachName && (
                <span className="text-sm text-gray-500">
                  Coach: {note.coachName}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">
              Last updated: {formatDate(note.updatedAt)}
            </p>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose max-w-none">
          {renderContent()}
        </div>
      </div>

      {/* Sharing Section (Owner only) */}
      {isOwner && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Share with Coach</h3>
          
          <form onSubmit={handleShare} className="flex gap-2 mb-4">
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="coach@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Share
            </button>
          </form>

          {shareError && (
            <p className="text-sm text-red-600 mb-2">{shareError}</p>
          )}
          {shareSuccess && (
            <p className="text-sm text-green-600 mb-2">{shareSuccess}</p>
          )}

          {note.sharedWith.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Shared with:</p>
              <div className="flex flex-wrap gap-2">
                {note.sharedWith.map((userId) => (
                  <div key={userId} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                    <span>User {userId.slice(0, 8)}...</span>
                    <button
                      onClick={() => handleUnshare(userId)}
                      className="text-blue-400 hover:text-blue-800"
                      title="Remove sharing"
                    >
                      <span className="sr-only">Unshare</span>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
