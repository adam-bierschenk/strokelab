"use client"

import { Trophy, Medal, ChevronUp, ChevronDown, Minus } from "lucide-react"

interface LeaderboardEntry {
  id: string
  name: string | null
  email: string
  handicapIndex: number | null
  formattedHandicap: string
  roundsPlayed: number
  bestScore: number | null
  avgScore: number | null
  trend: "up" | "down" | "flat"
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId: string
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "down") return <ChevronDown className="w-4 h-4 text-green-500" />
    if (trend === "up") return <ChevronUp className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Player</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Handicap</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Rounds</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Best</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Avg</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const rank = index + 1
              const isCurrentUser = entry.id === currentUserId
              return (
                <tr
                  key={entry.id}
                  className={`border-t border-border ${
                    isCurrentUser ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center w-8">{getRankIcon(rank)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.name || entry.email}</span>
                      {isCurrentUser && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {entry.formattedHandicap}
                  </td>
                  <td className="px-4 py-3 text-right">{entry.roundsPlayed}</td>
                  <td className="px-4 py-3 text-right">{entry.bestScore || "—"}</td>
                  <td className="px-4 py-3 text-right">{entry.avgScore || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">{getTrendIcon(entry.trend)}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
