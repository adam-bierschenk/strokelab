import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getFamilyRounds, getUserFamilyGroups } from '@/app/actions/family'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Family Rounds | StrokeLab',
}

interface PageProps {
  params: Promise<{ groupId: string }>
}

export default async function FamilyRoundsPage({ params }: PageProps) {
  const { groupId } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }

  // Verify user is member of this family
  const [roundsResult, groupsResult] = await Promise.all([
    getFamilyRounds(groupId),
    getUserFamilyGroups()
  ])

  const group = groupsResult.groups?.find(g => g.id === groupId)
  
  if (!group) {
    redirect('/family')
  }

  const rounds = roundsResult.success ? roundsResult.rounds : []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Link href="/family" className="hover:text-gray-700">← Family</Link>
                <span className="mx-2">/</span>
                <span>Rounds</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name} - Rounds</h1>
              <p className="text-sm text-gray-600">View rounds shared with family</p>
            </div>
            <Link
              href="/rounds/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              + Log Round
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!rounds || rounds.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No shared rounds yet</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Family members can share their rounds by setting visibility to "Family" when logging a round.
            </p>
            <Link
              href="/rounds/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Log Your First Round
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Family Rounds</h2>
              <span className="text-sm text-gray-500">{rounds.length} round{rounds.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="divide-y divide-gray-200">
              {rounds.map((round: any) => (
                <Link
                  key={round.id}
                  href={`/rounds/${round.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {round.user?.image ? (
                        <img
                          src={round.user.image}
                          alt={round.user.name || round.user.email}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                          {(round.user?.name || round.user?.email)?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {round.course?.name || 'Unknown Course'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(round.date)} • {' '}
                          <span className="text-gray-600">{round.user?.name || round.user?.email}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        round.totalScore < round.course?.par 
                          ? 'text-green-600' 
                          : round.totalScore === round.course?.par 
                            ? 'text-gray-900' 
                            : 'text-red-600'
                      }`}>
                        {round.totalScore}
                      </p>
                      <p className="text-xs text-gray-500">
                        {round.totalPutts} putts
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
