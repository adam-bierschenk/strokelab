"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AggregatedStats } from "@/lib/stats"

interface StatsDashboardProps {
  stats: AggregatedStats
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRounds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgScore.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.bestScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fairways Hit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">{stats.fairwayPercentage.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              {stats.rounds.reduce((sum, r) => sum + r.fairwaysHit, 0)} / {stats.rounds.reduce((sum, r) => sum + r.fairwaysTotal, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Greens in Regulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">{stats.girPercentage.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              {stats.rounds.reduce((sum, r) => sum + r.girHit, 0)} / {stats.rounds.length * 18}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Putts per Round</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">{stats.avgPuttsPerRound.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">
              Total: {stats.rounds.reduce((sum, r) => sum + r.totalPutts, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
