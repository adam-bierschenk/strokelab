import prisma from './prisma'

// Course operations
export async function getCourses() {
  return prisma.course.findMany({
    include: {
      holes: {
        orderBy: { number: 'asc' }
      },
      _count: {
        select: { rounds: true }
      }
    }
  })
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      holes: {
        orderBy: { number: 'asc' }
      }
    }
  })
}

export async function createCourse(data: {
  name: string
  city?: string
  state?: string
  country?: string
  par: number
  totalYards?: number
  slope?: number
  rating?: number
  holes?: Array<{
    number: number
    par: number
    yardage?: number
    handicap?: number
  }>
}) {
  return prisma.course.create({
    data: {
      ...data,
      holes: data.holes ? {
        create: data.holes
      } : undefined
    },
    include: {
      holes: true
    }
  })
}

// Round operations
export async function getRounds(userId: string) {
  return prisma.round.findMany({
    where: { userId },
    include: {
      course: true,
      scores: {
        include: {
          hole: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })
}

export async function getRoundById(id: string, userId: string) {
  return prisma.round.findFirst({
    where: { id, userId },
    include: {
      course: true,
      scores: {
        include: {
          hole: true
        },
        orderBy: {
          hole: { number: 'asc' }
        }
      }
    }
  })
}

export async function createRound(data: {
  userId: string
  courseId: string
  date?: Date
  totalScore: number
  totalPutts?: number
  fairwaysHit?: number
  greensInReg?: number
  notes?: string
  scores?: Array<{
    holeId: string
    score: number
    putts?: number
    fairway?: boolean
    greenInReg?: boolean
  }>
}) {
  return prisma.round.create({
    data: {
      ...data,
      scores: data.scores ? {
        create: data.scores
      } : undefined
    },
    include: {
      course: true,
      scores: {
        include: {
          hole: true
        }
      }
    }
  })
}

export async function deleteRound(id: string, userId: string) {
  return prisma.round.deleteMany({
    where: { id, userId }
  })
}

// Stats calculations
export async function getUserStats(userId: string) {
  const rounds = await prisma.round.findMany({
    where: { userId },
    include: {
      scores: true
    }
  })

  if (rounds.length === 0) {
    return null
  }

  const totalRounds = rounds.length
  const avgScore = rounds.reduce((sum, r) => sum + r.totalScore, 0) / totalRounds
  const avgPutts = rounds.reduce((sum, r) => sum + (r.totalPutts || 0), 0) / totalRounds
  const bestScore = Math.min(...rounds.map(r => r.totalScore))
  
  const fairwaysHit = rounds.reduce((sum, r) => sum + (r.fairwaysHit || 0), 0)
  const fairwaysPossible = totalRounds * 14 // Assuming 14 fairways per round (excluding par 3s)
  const fairwayPercentage = fairwaysPossible > 0 ? (fairwaysHit / fairwaysPossible) * 100 : 0

  const greensInReg = rounds.reduce((sum, r) => sum + (r.greensInReg || 0), 0)
  const girPercentage = (greensInReg / (totalRounds * 18)) * 100

  return {
    totalRounds,
    avgScore: Math.round(avgScore * 10) / 10,
    avgPutts: Math.round(avgPutts * 10) / 10,
    bestScore,
    fairwayPercentage: Math.round(fairwayPercentage * 10) / 10,
    girPercentage: Math.round(girPercentage * 10) / 10
  }
}
