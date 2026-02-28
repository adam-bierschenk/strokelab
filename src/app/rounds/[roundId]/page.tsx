import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Share2, Trophy, TrendingUp } from "lucide-react"

interface PageProps {
  params: {
    roundId: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { roundId } = params

  // In production, fetch actual round data
  return {
    title: "Alex Johnson's Round • StrokeLab",
    description: "Just played 85 (+13) at White Eagle Golf Club",
    openGraph: {
      title: "Alex Johnson's Golf Score",
      description: "85 (+13) at White Eagle Golf Club",
      images: [`/rounds/${roundId}/opengraph-image`],
    },
  }
}

// Mock data for round
const mockRound = {
  id: "1",
  userName: "Alex Johnson",
  courseName: "White Eagle Golf Club",
  score: 85,
  par: 72,
  differential: 12.4,
  date: "2026-02-28",
  putts: 32,
  fairwaysHit: 8,
  greensInReg: 6,
}

export default function RoundDetailPage({ params }: PageProps) {
  // In production: fetch actual round data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const roundId = params.roundId
  const round = mockRound

  if (!round) {
    notFound()
  }

  const toPar = round.score - round.par
  const toParText = toPar > 0 ? `+${toPar}` : toPar.toString()
  const toParColor = toPar <= 0 ? "text-green-500" : "text-yellow-500"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Score Card */}
          <div className="bg-card border border-border rounded-xl p-8 mb-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">{round.userName}</h2>
              <p className="text-muted-foreground">{round.courseName}</p>
              <p className="text-sm text-muted-foreground">{round.date}</p>
            </div>

            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-7xl font-bold">{round.score}</div>
                <div className="text-muted-foreground">Score</div>
              </div>

              <div className="text-center">
                <div className={`text-5xl font-bold ${toParColor}`}>{toParText}</div>
                <div className="text-muted-foreground">To Par</div>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold">{round.differential.toFixed(1)}</div>
                <div className="text-muted-foreground">Differential</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{round.putts}</div>
                <div className="text-sm text-muted-foreground">Putts</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{round.fairwaysHit}/14</div>
                <div className="text-sm text-muted-foreground">Fairways</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{round.greensInReg}/18</div>
                <div className="text-sm text-muted-foreground">Greens</div>
              </div>
            </div>

            {/* Share Button */}
            <Button className="w-full" size="lg">
              <Share2 className="w-5 h-5 mr-2" />
              Share Score
            </Button>
          </div>

          {/* Achievement Card (if applicable) */}
          {round.score <= round.par + 10 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800 dark:text-green-300">
                    Great Round!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    You beat your handicap by {(round.score - round.par - round.differential).toFixed(1)} strokes
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trend */}
          <div className="bg-muted rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Recent Trend</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">+5%</span>
              <span className="text-green-500">improvement</span>
              <span className="text-muted-foreground">in last 5 rounds</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
