"use server"

import { createClient } from "@/lib/supabase-server"
import {
  calculateDifferential,
  calculateHandicapIndex,
  formatHandicap,
  getBestDifferentialsCount,
} from "@/lib/handicap"

interface RoundFromDB {
  id: string
  totalScore: number
  differential: number | null
  date: string
  course: Array<{
    name: string
    rating: number | null
    slope: number | null
    par: number
  }>
}

interface HandicapData {
  handicapIndex: number
  formattedHandicap: string
  bestDifferentials: number[]
  recentDifferentials: number[]
  totalRounds: number
  roundsNeeded: number
  trend: "improving" | "stable" | "worsening"
  lastCalculated: string
}

export async function getHandicapData(): Promise<HandicapData | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: rounds, error } = await supabase
      .from("Round")
      .select(`
        id,
        totalScore,
        differential,
        date,
        course:courseId (
          name,
          rating,
          slope,
          par
        )
      `)
      .eq("userId", user.id)
      .order("date", { ascending: false })
      .limit(20)

    if (error || !rounds || rounds.length === 0) {
      return null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedRounds = rounds as unknown as RoundFromDB[]

    const validRounds = typedRounds.filter((r) => {
      const course = r.course?.[0]
      return course?.rating && course?.slope
    })

    if (validRounds.length < 3) {
      return {
        handicapIndex: 0,
        formattedHandicap: "N/A",
        bestDifferentials: [],
        recentDifferentials: [],
        totalRounds: validRounds.length,
        roundsNeeded: 3 - validRounds.length,
        trend: "stable",
        lastCalculated: new Date().toISOString(),
      }
    }

    const differentials = validRounds.map((r) => r.differential || 0)
    const recentDifferentials = differentials.slice(0, 5)

    const handicapIndex = calculateHandicapIndex(differentials)
    const formattedHandicap = formatHandicap(handicapIndex)

    const count = getBestDifferentialsCount(differentials.length)
    const bestDifferentials = [...differentials].sort((a, b) => a - b).slice(0, count)

    return {
      handicapIndex,
      formattedHandicap,
      bestDifferentials,
      recentDifferentials,
      totalRounds: validRounds.length,
      roundsNeeded: 0,
      trend: "stable",
      lastCalculated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error calculating handicap:", error)
    return null
  }
}

export async function calculateAndSaveDifferential(
  roundId: string
): Promise<{ success: boolean; differential?: number; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: round, error } = await supabase
      .from("Round")
      .select(`
        totalScore,
        course:courseId (
          rating,
          slope
        )
      `)
      .eq("id", roundId)
      .single()

    if (error || !round) {
      return { success: false, error: "Round not found" }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedRound = round as unknown as {
      totalScore: number
      course: Array<{ rating: number | null; slope: number | null }>
    }

    const course = typedRound.course?.[0]
    if (!course?.rating || !course?.slope) {
      return { success: false, error: "Course missing rating or slope" }
    }

    const differential = calculateDifferential(
      typedRound.totalScore,
      course.rating,
      course.slope
    )

    const { error: updateError } = await supabase
      .from("Round")
      .update({ differential })
      .eq("id", roundId)

    if (updateError) {
      return { success: false, error: "Failed to save differential" }
    }

    return { success: true, differential }
  } catch (error) {
    console.error("Error calculating differential:", error)
    return { success: false, error: "Calculation failed" }
  }
}
