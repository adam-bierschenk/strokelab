import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import EditRoundForm from './EditRoundForm'

export const metadata: Metadata = {
  title: 'Edit Round | StrokeLab',
}

async function getRound(roundId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: round } = await supabase
    .from('Round')
    .select(`
      id,
      totalScore,
      totalPutts,
      notes,
      roundDate,
      course:Course (
        id,
        name,
        par
      )
    `)
    .eq('id', roundId)
    .eq('userId', user.id)
    .single()

  if (!round) return null

  return {
    ...round,
    course: round.course[0] || round.course
  }
}

interface Props {
  params: Promise<{ roundId: string }>
}

export default async function EditRoundPage({ params }: Props) {
  const { roundId } = await params
  const round = await getRound(roundId)

  if (!round) {
    redirect('/rounds')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href={`/rounds/${roundId}`}
            className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Round
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Round</h1>
          <p className="mt-1 text-gray-600">
            {round.course.name} • {new Date(round.roundDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <EditRoundForm round={round} />
      </div>
    </div>
  )
}
