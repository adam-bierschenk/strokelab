import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getLessonNote } from '@/app/actions/lesson-notes'
import { LessonNoteDetail } from '@/components/lesson-notes/LessonNoteDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getLessonNote(id)
  
  if (result.success && result.note) {
    return {
      title: `${result.note.title} | Lesson Notes | StrokeLab`,
    }
  }
  
  return {
    title: 'Lesson Note | StrokeLab',
  }
}

export default async function LessonNotePage({ params }: PageProps) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }

  const result = await getLessonNote(id)

  if (!result.success || !result.note) {
    redirect('/lesson-notes')
  }

  const note = result.note
  const isOwner = note.userId === user.id

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/lesson-notes"
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{note.title}</h1>
                <p className="text-sm text-gray-500">{note.category} {note.coachName && `• Coach: ${note.coachName}`}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LessonNoteDetail 
          note={note} 
          isOwner={isOwner}
        />
      </main>
    </div>
  )
}
