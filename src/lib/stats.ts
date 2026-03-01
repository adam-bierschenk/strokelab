// Stats utilities
export interface RoundStats {
  roundId: string
  courseName: string
  date: string
  score: number
  fairwaysHit: number
  fairwaysTotal: number
  girHit: number
  girTotal: number
  totalPutts: number
}

export interface AggregatedStats {
  totalRounds: number
  avgScore: number
  bestScore: number
  fairwayPercentage: number
  girPercentage: number
  avgPuttsPerRound: number
  rounds: RoundStats[]
}

export function calculateAggregateStats(rounds: RoundStats[]): AggregatedStats {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      avgScore: 0,
      bestScore: 0,
      fairwayPercentage: 0,
      girPercentage: 0,
      avgPuttsPerRound: 0,
      rounds: [],
    }
  }

  const scores = rounds.map((r) => r.score)
  const bestScore = Math.min(...scores)
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

  const fairwaysHit = rounds.reduce((sum, r) => sum + r.fairwaysHit, 0)
  const fairwaysTotal = rounds.reduce((sum, r) => sum + r.fairwaysTotal, 0)
  const fairwayPercentage = fairwaysTotal > 0 ? (fairwaysHit / fairwaysTotal) * 100 : 0

  const girHit = rounds.reduce((sum, r) => sum + r.girHit, 0)
  const girTotal = rounds.reduce((sum, r) => sum + r.girTotal, 0)
  const girPercentage = girTotal > 0 ? (girHit / girTotal) * 100 : 0

  const totalPutts = rounds.reduce((sum, r) => sum + r.totalPutts, 0)
  const avgPuttsPerRound = totalPutts / rounds.length

  return {
    totalRounds: rounds.length,
    avgScore,
    bestScore,
    fairwayPercentage,
    girPercentage,
    avgPuttsPerRound,
    rounds,
  }
}
