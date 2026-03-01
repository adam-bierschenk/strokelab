/**
 * USGA Handicap Calculation Utilities
 * Implements official USGA formulas for differential and handicap index
 */

export interface RoundData {
  id: string
  score: number
  courseRating: number
  slopeRating: number
  date: Date
}

/**
 * Calculate USGA differential for a single round
 * Formula: (Score - Course Rating) × 113 / Slope Rating
 */
export function calculateDifferential(
  score: number,
  courseRating: number,
  slopeRating: number
): number {
  if (!courseRating || !slopeRating || slopeRating === 0) {
    throw new Error("Invalid course rating or slope rating")
  }

  const differential = ((score - courseRating) * 113) / slopeRating
  return Math.round(differential * 10) / 10
}

export function getBestDifferentialsCount(totalRounds: number): number {
  if (totalRounds < 3) return 0
  if (totalRounds <= 4) return 1
  if (totalRounds <= 6) return 1
  if (totalRounds <= 8) return 2
  if (totalRounds <= 10) return 3
  if (totalRounds <= 12) return 4
  if (totalRounds <= 14) return 5
  if (totalRounds <= 16) return 6
  if (totalRounds <= 18) return 7
  return 8
}

export function calculateHandicapIndex(differentials: number[]): number {
  if (differentials.length === 0) return 0

  const count = getBestDifferentialsCount(differentials.length)
  if (count === 0) return 0

  const bestDifferentials = [...differentials]
    .sort((a, b) => a - b)
    .slice(0, count)

  const average = bestDifferentials.reduce((sum, d) => sum + d, 0) / bestDifferentials.length
  return Math.round(average * 0.96 * 10) / 10
}

export function formatHandicap(handicapIndex: number): string {
  if (handicapIndex <= 0) return `+${Math.abs(handicapIndex).toFixed(1)}`
  return handicapIndex.toFixed(1)
}
