import { getLeaderboard, getLeaderboardStats, getCurrentUser } from "@/app/actions/leaderboard"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { redirect } from "next/navigation"

export default async function LeaderboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/signin")
  }

  const leaderboard = await getLeaderboard()
  const stats = await getLeaderboardStats()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">⛳ StrokeLab</h1>
            <nav>
              <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to Dashboard
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
          <p className="text-muted-foreground">
            Ranked by handicap index (lower is better)
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <div className="text-sm text-muted-foreground">Players</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.avgHandicap}</div>
            <div className="text-sm text-muted-foreground">Avg Handicap</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.lowestHandicap}</div>
            <div className="text-sm text-muted-foreground">Best Handicap</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.mostActivePlayer?.roundsPlayed}</div>
            <div className="text-sm text-muted-foreground">Most Rounds</div>
          </div>
        </div>

        <LeaderboardTable entries={leaderboard} currentUserId={user.id} />
      </main>
    </div>
  )
}
