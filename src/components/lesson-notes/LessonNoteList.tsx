'use client'

import Link from 'next/link'
import { LessonNote } from '@/app/actions/lesson-notes'

interface LessonNoteListProps {
  notes: (LessonNote | LessonNote & { ownerName: string | null; ownerEmail: string })[]
  showSharing?: boolean
  isShared?: boolean
}

export function LessonNoteList({ notes, showSharing = false, isShared = false }: LessonNoteListProps) {
  const getCategoryColor = (category: string): string => {
    switch (category?.toLowerCase()) {
      case 'swing': return 'bg-green-100 text-green-700'
      case 'putting': return 'bg-blue-100 text-blue-700'
      case 'short game':
      case 'short_game': return 'bg-purple-100 text-purple-700'
      case 'course management':
      case 'course_management': return 'bg-yellow-100 text-yellow-700'
      case 'mental game':
      case 'mental_game': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Link
          key={note.id}
          href={`/lesson-notes/${note.id}`}
          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(note.category)}`}>
                  {note.category}
                </span>
                {isShared && ('ownerName' in note || 'ownerEmail' in note) && (
                  <span className="text-xs text-gray-500">
                    Shared by {('ownerName' in note && note.ownerName) || ('ownerEmail' in note && note.ownerEmail)}
                  </span>
                )}
                {showSharing && note.sharedWith.length > 0 && (
                  <span className="text-xs text-blue-600">
                    Shared with {note.sharedWith.length} user{note.sharedWith.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{note.title}</h3>              
              {note.coachName && (
                <p className="text-sm text-gray-500 mb-2">Coach: {note.coachName}</p>
              )}
              <p className="text-sm text-gray-600 line-clamp-2">
                {note.content.substring(0, 150)}
                {note.content.length > 150 && '...'}
              </p>
            </div>
            <div className="ml-4 text-right">
              <p className="text-xs text-gray-400">{formatDate(note.updatedAt)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
