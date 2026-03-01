import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DeleteRoundButton from './DeleteRoundButton'

interface ScoreData {
  fairway?: boolean
  greenInReg?: boolean
  putts?: number
}

export const metadata: Metadata = {
  title: 'Round Details | StrokeLab',
}

async function getRound(roundId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: round } = await supabase
    .from('Round')
    .select(`
      *,
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

  const { data: scores } = await supabase
    .from('Score')
    .select(`
      *,
      hole:Hole (
        holeNumber,
        par
      )
    `)
    .eq('roundId', roundId)

  return {
    ...round,
    scores: scores || [],
    isOwner: round.userId === user.id
  }
}

interface RoundPageProps {
  params: Promise<{ roundId: string }>
}

export default async function RoundDetailPage({ params }: RoundPageProps) {
  const { roundId } = await params
  const round = await getRound(roundId)

  if (!round) {
    notFound()
  }

  const fairwaysHit = round.scores.filter((s: ScoreData) => s.fairway).length
  const greensInReg = round.scores.filter((s: ScoreData) => s.greenInReg).length
  const totalPutts = round.scores.reduce((sum: number, s: ScoreData) => sum + (s.putts || 0), 0)
  const toPar = round.totalScore - round.course.par

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/rounds"
              className="text-green-600 hover:text-green-800 flex items-center"
            >
              ← Back to Rounds
            </Link>
            {round.isOwner && (
              <div className="flex gap-2">
                <Link
                  href={`/rounds/${roundId}/edit`}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Edit
                </Link>
                <DeleteRoundButton roundId={roundId} />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-8 text-center border-b border-gray-200">
            <p className="text-gray-600">{round.course.name}</p>
            <div className="mt-6 flex justify-center items-baseline gap-4">
              <span className="text-6xl font-bold text-gray-900">{round.totalScore}</span>
              <span className={`text-2xl ${toPar <= 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                {toPar > 0 ? `+${toPar}` : toPar}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold">{round.totalPutts || totalPutts}</p>
              <p className="text-sm text-gray-500">Putts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{fairwaysHit}/14</p>
              <p className="text-sm text-gray-500">Fairways</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{greensInReg}/18</p>
              <p className="text-sm text-gray-500">GIR</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{(round.totalScore - round.course.par).toFixed(1)}</p>
              <p className="text-sm text-gray-500">Differential</p>
            </div>
          </div>
        </div>

        {round.notes && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-2">Notes</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{round.notes}</p>
          </div>
        )}
      </main>
    </div>
  )
}
