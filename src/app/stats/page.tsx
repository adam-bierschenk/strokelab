import { getDetailedStats } from "@/app/actions/stats"
import { StatsDashboard } from "@/components/stats/stats-dashboard"
import { redirect } from "next/navigation"

export default async function StatsPage() {
  const { stats, error } = await getDetailedStats()

  if (error || !stats) {
    redirect("/dashboard")
  }

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
          <h2 className="text-2xl font-bold mb-2">Detailed Statistics</h2>
          <p className="text-muted-foreground">
            Fairways, GIR, and putting metrics across all rounds
          </p>
        </div>

        <StatsDashboard stats={stats} />
      </main>
    </div>
  )
}
