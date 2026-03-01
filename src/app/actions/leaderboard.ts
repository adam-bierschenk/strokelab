"use server"

import { createClient } from "@/lib/supabase-server"

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

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    handicapIndex: 8.4,
    formattedHandicap: "8.4",
    roundsPlayed: 42,
    bestScore: 76,
    avgScore: 82,
    trend: "down",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    handicapIndex: 12.1,
    formattedHandicap: "12.1",
    roundsPlayed: 38,
    bestScore: 80,
    avgScore: 85,
    trend: "down",
  },
  {
    id: "3",
    name: "Mike Williams",
    email: "mike@example.com",
    handicapIndex: 14.7,
    formattedHandicap: "14.7",
    roundsPlayed: 35,
    bestScore: 82,
    avgScore: 87,
    trend: "up",
  },
  {
    id: "4",
    name: "You",
    email: "user@example.com",
    handicapIndex: 15.2,
    formattedHandicap: "15.2",
    roundsPlayed: 12,
    bestScore: 85,
    avgScore: 89,
    trend: "flat",
  },
]

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return mockLeaderboard.sort((a, b) => (a.handicapIndex || 999) - (b.handicapIndex || 999))
}

export async function getLeaderboardStats() {
  const sorted = await getLeaderboard()
  return {
    totalPlayers: sorted.length,
    avgHandicap: (sorted.reduce((sum, p) => sum + (p.handicapIndex || 0), 0) / sorted.length).toFixed(1),
    lowestHandicap: sorted[0]?.formattedHandicap || "N/A",
    mostActivePlayer: sorted.reduce((max, p) => p.roundsPlayed > max.roundsPlayed ? p : max, sorted[0]),
  }
}

export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? { id: user.id, email: user.email || "" } : null
}
