"use server"

import { createClient } from "@/lib/supabase-server"
import { calculateAggregateStats, RoundStats, AggregatedStats } from "@/lib/stats"

export async function getDetailedStats(): Promise<{
  stats: AggregatedStats | null
  error?: string
}> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { stats: null, error: "Not authenticated" }
    }

    const { data: rounds, error } = await supabase
      .from("Round")
      .select(`
        id,
        totalScore,
        fairwaysHit,
        greensInReg,
        totalPutts,
        date,
        course:courseId (
          name
        )
      `)
      .eq("userId", user.id)
      .order("date", { ascending: false })

    if (error || !rounds || rounds.length === 0) {
      return { stats: null, error: "No rounds found" }
    }

    const roundStats: RoundStats[] = rounds.map((r) => ({
      roundId: r.id,
      courseName: r.course?.[0]?.name || "Unknown",
      date: r.date,
      score: r.totalScore,
      fairwaysHit: r.fairwaysHit || 0,
      fairwaysTotal: 14, // Assuming 14 par-4/5 holes with fairways
      girHit: r.greensInReg || 0,
      girTotal: 18,
      totalPutts: r.totalPutts,
    }))

    const stats = calculateAggregateStats(roundStats)
    return { stats }
  } catch (error) {
    console.error("Error fetching detailed stats:", error)
    return { stats: null, error: "Failed to fetch stats" }
  }
}
