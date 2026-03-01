import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getUserLessonNotes, getSharedLessonNotes } from '@/app/actions/lesson-notes'
import { LessonNoteList } from '@/components/lesson-notes/LessonNoteList'
import { CreateLessonNote } from '@/components/lesson-notes/CreateLessonNote'

export const metadata: Metadata = {
  title: 'Lesson Notes | StrokeLab',
}

export const dynamic = 'force-dynamic'

export default async function LessonNotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }

  const [myNotesResult, sharedNotesResult] = await Promise.all([
    getUserLessonNotes(),
    getSharedLessonNotes()
  ])

  const myNotes = myNotesResult.success ? myNotesResult.notes : []
  const sharedNotes = sharedNotesResult.success ? sharedNotesResult.notes : []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lesson Notes</h1>
              <p className="text-sm text-gray-600">Track lessons and share with your coach</p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* My Notes */}
            <div className="bg-white rounded-xl shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Notes</h2>
              </div>
              <div className="p-6">
                {myNotes && myNotes.length > 0 ? (
                  <LessonNoteList notes={myNotes} showSharing={true} />
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No lesson notes yet</h3>
                    <p className="text-gray-600">Create your first lesson note to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shared With Me */}
            {sharedNotes && sharedNotes.length > 0 && (
              <div className="bg-white rounded-xl shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Shared With Me</h2>
                </div>
                <div className="p-6">
                  <LessonNoteList notes={sharedNotes} isShared={true} />
                </div>
              </div>
            )}
          </div>

          <div>
            <CreateLessonNote />

            <div className="mt-6 bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Categories
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  Swing
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  Putting
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                  Short Game
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                  Course Management
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  Mental Game
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
