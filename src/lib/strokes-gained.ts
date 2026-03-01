/**
 * Strokes Gained calculation utilities
 * 
 * Strokes gained compares a player's performance against a baseline
 * (typically PGA Tour average or scratch golfer)
 * 
 * Categories:
 * - Off-the-tee (SG:OTT): Performance on tee shots on par 4s and 5s
 * - Approach (SG:APP): Performance on approach shots (150+ yards)
 * - Around-the-green (SG:ARG): Short game (0-30 yards from edge)
 * - Putting (SG:P): Performance on putts
 * 
 * Formula: Strokes Gained = Baseline strokes - Actual strokes
 */

export interface ShotData {
  distance: number // Distance to hole in yards
  lie: 'tee' | 'fairway' | 'rough' | 'sand' | 'green'
  strokes: number // Actual strokes taken from this position
}

export interface BaselineData {
  distance: number
  lie: string
  expectedStrokes: number
}

// PGA Tour baseline data: expected strokes to hole out from various distances and lies
// Data based on actual PGA Tour statistics
export const PGA_BASELINES: BaselineData[] = [
  // From tee (par 3s mostly)
  { distance: 75, lie: 'tee', expectedStrokes: 3.00 },
  { distance: 100, lie: 'tee', expectedStrokes: 3.07 },
  { distance: 125, lie: 'tee', expectedStrokes: 3.12 },
  { distance: 150, lie: 'tee', expectedStrokes: 3.18 },
  { distance: 175, lie: 'tee', expectedStrokes: 3.26 },
  { distance: 200, lie: 'tee', expectedStrokes: 3.37 },
  { distance: 225, lie: 'tee', expectedStrokes: 3.52 },
  { distance: 250, lie: 'tee', expectedStrokes: 3.71 },
  
  // From fairway
  { distance: 25, lie: 'fairway', expectedStrokes: 2.40 },
  { distance: 50, lie: 'fairway', expectedStrokes: 2.58 },
  { distance: 75, lie: 'fairway', expectedStrokes: 2.73 },
  { distance: 100, lie: 'fairway', expectedStrokes: 2.85 },
  { distance: 125, lie: 'fairway', expectedStrokes: 2.93 },
  { distance: 150, lie: 'fairway', expectedStrokes: 2.99 },
  { distance: 175, lie: 'fairway', expectedStrokes: 3.07 },
  { distance: 200, lie: 'fairway', expectedStrokes: 3.18 },
  { distance: 225, lie: 'fairway', expectedStrokes: 3.31 },
  { distance: 250, lie: 'fairway', expectedStrokes: 3.46 },
  
  // From rough
  { distance: 25, lie: 'rough', expectedStrokes: 2.55 },
  { distance: 50, lie: 'rough', expectedStrokes: 2.73 },
  { distance: 75, lie: 'rough', expectedStrokes: 2.88 },
  { distance: 100, lie: 'rough', expectedStrokes: 3.02 },
  { distance: 125, lie: 'rough', expectedStrokes: 3.15 },
  { distance: 150, lie: 'rough', expectedStrokes: 3.28 },
  { distance: 175, lie: 'rough', expectedStrokes: 3.42 },
  { distance: 200, lie: 'rough', expectedStrokes: 3.57 },
  { distance: 225, lie: 'rough', expectedStrokes: 3.72 },
  
  // From sand
  { distance: 10, lie: 'sand', expectedStrokes: 2.45 },
  { distance: 25, lie: 'sand', expectedStrokes: 2.60 },
  { distance: 50, lie: 'sand', expectedStrokes: 2.80 },
  { distance: 75, lie: 'sand', expectedStrokes: 3.00 },
  { distance: 100, lie: 'sand', expectedStrokes: 3.20 },
  
  // From green (putting)
  { distance: 1, lie: 'green', expectedStrokes: 1.00 },
  { distance: 2, lie: 'green', expectedStrokes: 1.01 },
  { distance: 3, lie: 'green', expectedStrokes: 1.04 },
  { distance: 4, lie: 'green', expectedStrokes: 1.13 },
  { distance: 5, lie: 'green', expectedStrokes: 1.23 },
  { distance: 6, lie: 'green', expectedStrokes: 1.34 },
  { distance: 7, lie: 'green', expectedStrokes: 1.42 },
  { distance: 8, lie: 'green', expectedStrokes: 1.50 },
  { distance: 9, lie: 'green', expectedStrokes: 1.56 },
  { distance: 10, lie: 'green', expectedStrokes: 1.61 },
  { distance: 12, lie: 'green', expectedStrokes: 1.70 },
  { distance: 15, lie: 'green', expectedStrokes: 1.82 },
  { distance: 20, lie: 'green', expectedStrokes: 1.99 },
  { distance: 25, lie: 'green', expectedStrokes: 2.13 },
  { distance: 30, lie: 'green', expectedStrokes: 2.25 },
  { distance: 35, lie: 'green', expectedStrokes: 2.35 },
  { distance: 40, lie: 'green', expectedStrokes: 2.44 },
  { distance: 45, lie: 'green', expectedStrokes: 2.51 },
  { distance: 50, lie: 'green', expectedStrokes: 2.58 },
  { distance: 60, lie: 'green', expectedStrokes: 2.69 },
  { distance: 70, lie: 'green', expectedStrokes: 2.78 },
  { distance: 80, lie: 'green', expectedStrokes: 2.85 },
  { distance: 90, lie: 'green', expectedStrokes: 2.91 },
  { distance: 100, lie: 'green', expectedStrokes: 2.97 },
]

/**
 * Get expected strokes from baseline data
 * Uses linear interpolation for distances not explicitly defined
 */
export function getExpectedStrokes(distance: number, lie: string): number {
  // Filter by lie
  const lieBaselines = PGA_BASELINES.filter(b => b.lie === lie)
  
  if (lieBaselines.length === 0) {
    // Fallback values if lie not found
    switch (lie) {
      case 'tee': return 3.5 + (distance / 100) * 0.5
      case 'fairway': return 2.8 + (distance / 100) * 0.3
      case 'rough': return 3.0 + (distance / 100) * 0.4
      case 'sand': return 2.8 + (distance / 50) * 0.5
      case 'green': return 1.0 + Math.min(distance / 100, 2.0)
      default: return 3.0
    }
  }
  
  // Sort by distance
  lieBaselines.sort((a, b) => a.distance - b.distance)
  
  // Find exact match
  const exact = lieBaselines.find(b => b.distance === distance)
  if (exact) return exact.expectedStrokes
  
  // Find surrounding points for interpolation
  const lower = lieBaselines.filter(b => b.distance < distance).pop()
  const higher = lieBaselines.find(b => b.distance > distance)
  
  if (lower && higher) {
    // Linear interpolation
    const t = (distance - lower.distance) / (higher.distance - lower.distance)
    return lower.expectedStrokes + t * (higher.expectedStrokes - lower.expectedStrokes)
  }
  
  // Extrapolate if outside range
  if (lower) {
    // Extrapolate based on last two points
    const lastTwo = lieBaselines.slice(-2)
    if (lastTwo.length === 2) {
      const slope = (lastTwo[1].expectedStrokes - lastTwo[0].expectedStrokes) / 
                    (lastTwo[1].distance - lastTwo[0].distance)
      return lastTwo[1].expectedStrokes + slope * (distance - lastTwo[1].distance)
    }
    return lower.expectedStrokes
  }
  
  if (higher) {
    // Use first point for short distances
    const firstTwo = lieBaselines.slice(0, 2)
    if (firstTwo.length === 2) {
      const slope = (firstTwo[1].expectedStrokes - firstTwo[0].expectedStrokes) / 
                    (firstTwo[1].distance - firstTwo[0].distance)
      return firstTwo[0].expectedStrokes + slope * (distance - firstTwo[0].distance)
    }
    return higher.expectedStrokes
  }
  
  return 3.0 // Default fallback
}

/**
 * Calculate strokes gained for a single shot
 * SG = Expected strokes from start - Expected strokes from end - Actual strokes taken
 * 
 * @param startDistance - Distance to hole at start (yards)
 * @param startLie - Lie at start (tee, fairway, rough, sand, green)
 * @param endDistance - Distance to hole at end (yards)
 * @param endLie - Lie at end
 * @param strokesTaken - Actual strokes taken (usually 1)
 * @returns Strokes gained (positive = better than average, negative = worse)
 */
export function calculateStrokesGained(
  startDistance: number,
  startLie: string,
  endDistance: number,
  endLie: string,
  strokesTaken: number = 1
): number {
  const expectedStart = getExpectedStrokes(startDistance, startLie)
  const expectedEnd = getExpectedStrokes(endDistance, endLie)
  
  // Formula: SG = Expected_start - Expected_end - Strokes_taken
  return expectedStart - expectedEnd - strokesTaken
}

/**
 * Categorize a shot by type for strokes gained breakdown
 * @param distance - Distance to hole in yards
 * @param lie - Current lie
 * @param isTeeShot - Whether this is a tee shot
 * @returns Category: 'offTheTee', 'approach', 'aroundGreen', 'putting'
 */
export function categorizeShot(
  distance: number,
  lie: string,
  isTeeShot: boolean = false
): 'offTheTee' | 'approach' | 'aroundGreen' | 'putting' {
  if (lie === 'green') {
    return 'putting'
  }
  
  if (isTeeShot) {
    return 'offTheTee'
  }
  
  if (distance >= 150) {
    return 'approach'
  }
  
  if (distance >= 30) {
    return 'approach' // Short approaches
  }
  
  return 'aroundGreen' // Within 30 yards
}

/**
 * Determine if a player hit the fairway/green
 * @param distance - Distance to hole
 * @param lie - Current lie
 * @param par - Hole par
 * @returns True if in fairway/green, false if in rough/sand
 */
export function hitFairwayGir(distance: number, lie: string, par: number): boolean {
  // Simplified: Check if lie is fairway or green
  return lie === 'fairway' || lie === 'green'
}

/**
 * Round strokes gained to reasonable precision
 */
export function roundStrokesGained(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Get category full name
 */
export function getCategoryName(category: string): string {
  switch (category) {
    case 'offTheTee': return 'Off the Tee'
    case 'approach': return 'Approach'
    case 'aroundGreen': return 'Around Green'
    case 'putting': return 'Putting'
    default: return 'Other'
  }
}

/**
 * Get color for strokes gained value
 */
export function getStrokesGainedColor(value: number): string {
  if (value >= 1.5) return 'text-green-600'
  if (value >= 0.5) return 'text-green-500'
  if (value >= 0) return 'text-lime-500'
  if (value >= -0.5) return 'text-yellow-500'
  if (value >= -1.0) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * Format strokes gained with sign (e.g., +0.34 or -0.21)
 */
export function formatStrokesGained(value: number): string {
  const rounded = roundStrokesGained(value)
  if (rounded > 0) return `+${rounded}`
  return `${rounded}`
}
