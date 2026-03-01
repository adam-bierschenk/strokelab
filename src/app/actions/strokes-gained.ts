'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { 
  getExpectedStrokes, 
  categorizeShot, 
  roundStrokesGained,
  type ShotData
} from '@/lib/strokes-gained'

export interface StrokesGainedData {
  total: number
  offTheTee: number
  approach: number
  aroundGreen: number
  putting: number
}

/**
 * Calculate strokes gained for a round
 * This requires detailed hole data including:
 * - Distance to hole for each shot
 * - Lie type for each shot
 * - Number of putts
 */
export async function calculateStrokesGained(roundId: string): Promise<{ 
  success: boolean; 
  data?: StrokesGainedData; 
  error?: string 
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get round with scores and hole data
    const round = await prisma.round.findFirst({
      where: { 
        id: roundId,
        userId: user.id 
      },
      include: {
        course: {
          include: {
            holes: true
          }
        },
        scores: {
          include: {
            hole: true
          }
        }
      }
    })

    if (!round) {
      return { success: false, error: 'Round not found' }
    }

    // Calculate strokes gained for each category
    const sgData = await calculateRoundSG(round)

    // Upsert strokes gained record
    await prisma.strokesGained.upsert({
      where: { roundId },
      update: {
        total: sgData.total,
        offTheTee: sgData.offTheTee,
        approach: sgData.approach,
        aroundGreen: sgData.aroundGreen,
        putting: sgData.putting,
        calculatedAt: new Date()
      },
      create: {
        roundId,
        total: sgData.total,
        offTheTee: sgData.offTheTee,
        approach: sgData.approach,
        aroundGreen: sgData.aroundGreen,
        putting: sgData.putting
      }
    })

    revalidatePath(`/rounds/${roundId}`)
    revalidatePath('/dashboard')

    return { success: true, data: sgData }
  } catch (error) {
    console.error('Calculate strokes gained error:', error)
    return { success: false, error: 'Failed to calculate strokes gained' }
  }
}

/**
 * Calculate strokes gained for a round
 * This is a simplified calculation based on available data
 * Full strokes gained would require shot-by-shot tracking
 */
async function calculateRoundSG(round: any): Promise<StrokesGainedData> {
  const scores = round.scores || []
  const holes = round.course?.holes || []
  
  let totalSG = 0
  let offTheTeeSG = 0
  let approachSG = 0
  let aroundGreenSG = 0
  let puttingSG = 0

  for (const score of scores) {
    const hole = score.hole
    if (!hole) continue

    const par = hole.par
    const scoreNum = score.score
    const putts = score.putts || 0
    const greenInReg = score.greenInReg || false
    const fairwayHit = score.fairwayHit

    // Calculate strokes gained for putting
    if (putts > 0) {
      // Estimate first putt distance (simplified)
      // If GIR, assume average distance based on approach quality
      // If missed green, assume chip/pitch then putt
      const firstPuttDistance = greenInReg 
        ? estimatePuttDistance(par, scoreNum, putts)
        : estimatePuttDistanceAfterChip(scoreNum, putts)
      
      const expectedPuttsOnGreen = getExpectedStrokes(firstPuttDistance, 'green')
      const actualPutts = putts
      
      // SG = Expected - Actual
      const sgPutting = expectedPuttsOnGreen - actualPutts
      puttingSG += sgPutting
    }

    // Calculate approach SG (simplified estimation)
    if (par >= 3) {
      // Estimate approach distance
      const approachDistance = par === 3 ? hole.yardage : 
                               par === 4 ? 150 : 
                               par === 5 ? 200 : 150
      
      const expectedApproach = getExpectedStrokes(approachDistance, 'fairway')
      
      // If missed green, we lost strokes on approach
      // This is a simplification - full tracking would calculate each shot
      let sgApproach = 0
      let sgAroundGreen = 0
      
      if (!greenInReg && putts > 0) {
        // Missed green - lost approach strokes, gained around green
        const strokesToGreen = scoreNum - putts
        const expectedToGreen = getExpectedStrokes(approachDistance, 'fairway')
        sgApproach = expectedToGreen - strokesToGreen
        
        // If chipped on and 2-putted, that's average around green
        // If chipped on and 1-putted, gained strokes
        // If chipped on and 3-putted, lost strokes
        // Simplified: around green = putting performance relative to expected
      }
      
      approachSG += sgApproach
      aroundGreenSG += sgAroundGreen
    }

    // Off-the-tee SG
    if (par >= 4) {
      // Simplified: fairway hit = good, rough = bad
      const expectedTee = getExpectedStrokes(hole.yardage || 400, 'tee')
      const actual = 1
      
      // Expected strokes after tee shot
      const expectedAfterTee = fairwayHit 
        ? getExpectedStrokes(150, 'fairway')
        : getExpectedStrokes(150, 'rough')
      
      const sgTee = expectedTee - expectedAfterTee - actual
      offTheTeeSG += sgTee
    }
  }

  // Normalize per hole and round to reasonable values
  const numHoles = scores.length || 1
  
  totalSG = offTheTeeSG + approachSG + aroundGreenSG + puttingSG

  // Round to 2 decimal places
  return {
    total: roundStrokesGained(totalSG),
    offTheTee: roundStrokesGained(offTheTeeSG),
    approach: roundStrokesGained(approachSG),
    aroundGreen: roundStrokesGained(aroundGreenSG),
    putting: roundStrokesGained(puttingSG)
  }
}

/**
 * Estimate putt distance based on approach and score
 */
function estimatePuttDistance(par: number, score: number, putts: number): number {
  // Simplified estimation
  if (score === 1) return 0 // Hole-in-one
  if (score <= par - 2) return 10 // Eagle or better - chip-in probably
  if (score === par - 1) return 8  // Birdie
  if (score === par) return 12     // Par
  if (score === par + 1) return 15 // Bogey
  return 18                        // Double bogey+
}

/**
 * Estimate putt distance after missing green
 */
function estimatePuttDistanceAfterChip(score: number, putts: number): number {
  // After chip/pitch, typically closer
  if (putts === 1) return 6  // Likely close tap-in or chip-in
  if (putts === 2) return 12 // Two-putt
  if (putts === 3) return 15 // Three-putt
  return 20
}

/**
 * Get strokes gained for a specific round
 */
export async function getStrokesGainedForRound(roundId: string): Promise<{
  success: boolean
  data?: StrokesGainedData
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify user owns or can view this round
    const round = await prisma.round.findFirst({
      where: { 
        id: roundId,
        OR: [
          { userId: user.id },
          { visibility: 'public' },
          { visibility: 'family' } // Simplified - check family membership in real app
        ]
      }
    })

    if (!round) {
      return { success: false, error: 'Round not found' }
    }

    const sg = await prisma.strokesGained.findUnique({
      where: { roundId }
    })

    if (!sg) {
      // Calculate on-demand if not cached
      return await calculateStrokesGained(roundId)
    }

    return {
      success: true,
      data: {
        total: sg.total,
        offTheTee: sg.offTheTee,
        approach: sg.approach,
        aroundGreen: sg.aroundGreen,
        putting: sg.putting
      }
    }
  } catch (error) {
    console.error('Get strokes gained error:', error)
    return { success: false, error: 'Failed to get strokes gained' }
  }
}

/**
 * Get aggregated strokes gained statistics for a user
 */
export async function getUserStrokesGainedStats(): Promise<{
  success: boolean
  data?: {
    overall: StrokesGainedData
    last5: StrokesGainedData
    last10: StrokesGainedData
    trends: Array<{ date: string; total: number; offTheTee: number; approach: number; aroundGreen: number; putting: number }>
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get last 20 rounds with strokes gained data
    const roundsWithSG = await prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 20,
      include: {
        strokesGained: true
      }
    })

    if (roundsWithSG.length === 0) {
      return { success: false, error: 'No rounds found' }
    }

    // Aggregate by categories
    const aggregate = (rounds: any[], limit?: number): StrokesGainedData => {
      const limited = limit ? rounds.slice(0, limit) : rounds
      const valid = limited.filter(r => r.strokesGained)
      
      if (valid.length === 0) {
        return { total: 0, offTheTee: 0, approach: 0, aroundGreen: 0, putting: 0 }
      }
      
      return {
        total: roundStrokesGained(valid.reduce((sum, r) => sum + r.strokesGained.total, 0) / valid.length),
        offTheTee: roundStrokesGained(valid.reduce((sum, r) => sum + r.strokesGained.offTheTee, 0) / valid.length),
        approach: roundStrokesGained(valid.reduce((sum, r) => sum + r.strokesGained.approach, 0) / valid.length),
        aroundGreen: roundStrokesGained(valid.reduce((sum, r) => sum + r.strokesGained.aroundGreen, 0) / valid.length),
        putting: roundStrokesGained(valid.reduce((sum, r) => sum + r.strokesGained.putting, 0) / valid.length)
      }
    }

    // Build trends
    const trends = roundsWithSG
      .filter(r => r.strokesGained)
      .reverse() // Oldest first
      .map(r => ({
        date: r.date.toISOString().split('T')[0],
        total: r.strokesGained!.total,
        offTheTee: r.strokesGained!.offTheTee,
        approach: r.strokesGained!.approach,
        aroundGreen: r.strokesGained!.aroundGreen,
        putting: r.strokesGained!.putting
      }))

    return {
      success: true,
      data: {
        overall: aggregate(roundsWithSG),
        last5: aggregate(roundsWithSG, 5),
        last10: aggregate(roundsWithSG, 10),
        trends
      }
    }
  } catch (error) {
    console.error('Get user SG stats error:', error)
    return { success: false, error: 'Failed to get statistics' }
  }
}


