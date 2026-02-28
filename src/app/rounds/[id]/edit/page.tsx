import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import EditRoundForm from './EditRoundForm'
import { Round, Course, User } from '@prisma/client'

interface RoundWithCourse extends Round {
  course: Course
  user: User
}

async function getRound(id: string): Promise<RoundWithCourse | null> {
  const round = await prisma.round.findUnique({
    where: { id },
    include: {
      course: true,
      user: true
    }
  })
  return round
}

interface EditRoundPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRoundPage({ params }: EditRoundPageProps) {
  const { id } = await params
  const round = await getRound(id)

  if (!round) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link
              href={`/rounds/${round.id}`}
              className="mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Round</h1>
              <p className="text-sm text-gray-600">{round.course.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EditRoundForm round={round} />
      </main>
    </div>
  )
}
